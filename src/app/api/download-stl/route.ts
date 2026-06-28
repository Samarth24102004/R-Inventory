import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // Client for authenticating the user
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { modelId } = await req.json();

    if (!modelId) {
      return NextResponse.json({ error: 'Model ID is required' }, { status: 400 });
    }

    // Check if the user has actually purchased this model
    const { data: purchase, error: purchaseError } = await supabaseAuth
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('model_id', modelId)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: 'You have not purchased this item' }, { status: 403 });
    }

    // Get the model details to find the file path
    const { data: model, error: modelError } = await supabaseAuth
      .from('stl_models')
      .select('stl_file_path')
      .eq('id', modelId)
      .single();

    if (modelError || !model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // Now use the Service Role Key to generate a secure signed URL from the private bucket
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // REQUIRES SERVICE ROLE KEY in .env.local
    );

    // Create a signed URL that expires in 60 seconds
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('stl_files')
      .createSignedUrl(model.stl_file_path, 60);

    if (signedUrlError || !signedUrlData) {
      console.error('Error generating signed URL:', signedUrlError);
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: signedUrlData.signedUrl });

  } catch (error: any) {
    console.error('Download STL Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
