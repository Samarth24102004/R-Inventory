import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, projectId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !projectId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET as string;

    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid Payment Signature' }, { status: 400 });
    }

    // Insert purchase record into Supabase
    // We assume the purchases table has: user_id, project_id, razorpay_order_id, razorpay_payment_id
    const { error: dbError } = await supabase.from('purchases').insert([
      {
        user_id: user.id,
        project_id: projectId,
        razorpay_order_id,
        razorpay_payment_id,
      }
    ]);

    if (dbError) {
      // If there is a unique constraint error, maybe they already bought it
      if (dbError.code === '23505') {
        return NextResponse.json({ success: true, message: 'Already purchased' });
      }
      console.error('Database Error:', dbError);
      return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
