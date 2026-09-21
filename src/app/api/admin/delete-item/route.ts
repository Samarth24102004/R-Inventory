import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // Auth client to verify caller identity
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid user session' }, { status: 401 });
    }

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (!adminEmail || user.email !== adminEmail) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id, type } = await req.json();

    if (!id || !type) {
      return NextResponse.json({ error: 'Missing required parameters: id and type' }, { status: 400 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY not set' }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    if (type === 'model') {
      // 1. Delete associated purchases first to satisfy foreign key constraint
      const { error: purchaseDeleteError } = await supabaseAdmin
        .from('purchases')
        .delete()
        .eq('model_id', id);

      if (purchaseDeleteError) {
        console.error('Error removing associated model purchases:', purchaseDeleteError);
        return NextResponse.json({ error: `Failed to remove purchases: ${purchaseDeleteError.message}` }, { status: 500 });
      }

      // 2. Delete the model from stl_models
      const { error: modelDeleteError } = await supabaseAdmin
        .from('stl_models')
        .delete()
        .eq('id', id);

      if (modelDeleteError) {
        console.error('Error deleting 3D model:', modelDeleteError);
        return NextResponse.json({ error: `Failed to delete 3D model: ${modelDeleteError.message}` }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (type === 'project') {
      // 1. Delete associated purchases first to satisfy foreign key constraint
      const { error: purchaseDeleteError } = await supabaseAdmin
        .from('purchases')
        .delete()
        .eq('project_id', id);

      if (purchaseDeleteError) {
        console.error('Error removing associated project purchases:', purchaseDeleteError);
        return NextResponse.json({ error: `Failed to remove purchases: ${purchaseDeleteError.message}` }, { status: 500 });
      }

      // 2. Delete the project from projects
      const { error: projectDeleteError } = await supabaseAdmin
        .from('projects')
        .delete()
        .eq('id', id);

      if (projectDeleteError) {
        console.error('Error deleting project:', projectDeleteError);
        return NextResponse.json({ error: `Failed to delete project: ${projectDeleteError.message}` }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (type === 'manual') {
      const { error: manualDeleteError } = await supabaseAdmin
        .from('manuals')
        .delete()
        .eq('id', id);

      if (manualDeleteError) {
        console.error('Error deleting manual:', manualDeleteError);
        return NextResponse.json({ error: `Failed to delete manual: ${manualDeleteError.message}` }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
  } catch (err: any) {
    console.error('Unexpected error in admin delete route:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
