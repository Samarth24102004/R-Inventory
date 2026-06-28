import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, modelId } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    // Fetch model to get the price
    const { data: modelData, error: modelError } = await supabase
      .from('stl_models')
      .select('price')
      .eq('id', modelId)
      .single();

    if (modelError || !modelData) {
      return NextResponse.json({ success: false, error: 'Model not found' }, { status: 404 });
    }

    // Insert purchase record to grant lifetime access
    const { error: insertError } = await supabase
      .from('purchases')
      .insert([
        {
          user_id: user.id,
          model_id: modelId,
          amount: modelData.price,
          status: 'completed'
        }
      ]);

    if (insertError) {
      console.error('Failed to insert purchase record:', insertError);
      return NextResponse.json({ success: false, error: `Database error: ${insertError.message || insertError.details || JSON.stringify(insertError)}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Payment Verification Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
