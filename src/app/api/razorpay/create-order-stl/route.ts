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
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid Authorization header' }, { status: 401 });
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
      console.error('Create Order Auth Error:', authError);
      return NextResponse.json({ error: `Unauthorized: ${authError?.message || 'No user found'}` }, { status: 401 });
    }

    const { modelId } = await req.json();
    if (!modelId) {
      return NextResponse.json({ error: 'Model ID is required' }, { status: 400 });
    }

    // Fetch the 3D model to get the price
    const { data: model, error: modelError } = await supabase
      .from('stl_models')
      .select('price')
      .eq('id', modelId)
      .single();

    if (modelError || !model) {
      return NextResponse.json({ error: '3D Model not found' }, { status: 404 });
    }

    if (model.price <= 0) {
      return NextResponse.json({ error: 'Model is free, no payment needed' }, { status: 400 });
    }

    const amountInPaise = Math.round(model.price * 100); 

    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_stl_${Math.random().toString(36).substring(7)}`,
      notes: {
        userId: user.id,
        modelId: modelId,
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });

  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
