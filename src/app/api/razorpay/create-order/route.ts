import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

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

    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Fetch the project to get the price
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('price')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Ensure the price is greater than 0, otherwise it might be free
    if (project.price <= 0) {
      return NextResponse.json({ error: 'Project is free, no payment needed' }, { status: 400 });
    }

    const amountInPaise = Math.round(project.price * 100); // Razorpay expects amount in paise

    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_order_${Math.random().toString(36).substring(7)}`,
      notes: {
        userId: user.id,
        projectId: projectId,
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });

  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
