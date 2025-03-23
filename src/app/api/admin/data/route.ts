import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Add extra logging for API calls
const logApiCall = (method: string, table: string, id?: string) => {
  console.log(`[${new Date().toISOString()}] ${method} request for ${table}${id ? ` (ID: ${id})` : ''}`);
};

export async function GET(request: Request) {
  logApiCall('GET', new URL(request.url).searchParams.get('table') || 'unknown');
  
  try {
    const url = new URL(request.url);
    const table = url.searchParams.get('table');
    const id = url.searchParams.get('id');
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;
    const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined;
    const select = url.searchParams.get('select') || '*';
    const orderBy = url.searchParams.get('orderBy');
    const orderDirection = url.searchParams.get('orderDirection') || 'desc';
    
    if (!table) {
      return NextResponse.json({ error: 'Missing table parameter' }, { status: 400 });
    }
    
    console.log(`Admin Data API: Fetching data for table ${table}`);
    
    // Get cookies for the Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verify session and admin status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session || !session.user) {
      console.error('Admin Data API: Not authenticated');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Check admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (profileError || profile?.role !== 'admin') {
      console.error('Admin Data API: Not authorized');
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // Start building the query
    let query = supabase.from(table).select(select);
    
    // If specific ID is requested
    if (id) {
      query = query.eq('id', id);
      
      // Fetch a single item
      const { data, error } = await query.single();
      
      if (error) {
        console.error(`Admin Data API: Error fetching ${table} with id ${id}:`, error);
        return NextResponse.json({ error: `Error fetching data: ${error.message}` }, { status: 500 });
      }
      
      return NextResponse.json(data || null, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
    }
    
    // Add ordering if specified
    if (orderBy) {
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });
    }
    
    // Add pagination if specified
    if (limit !== undefined) {
      query = query.limit(limit);
    }
    
    if (offset !== undefined) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }
    
    // Fetch the data
    const { data, error, count } = await query;
    
    if (error) {
      console.error(`Admin Data API: Error fetching ${table}:`, error);
      return NextResponse.json({ error: `Error fetching data: ${error.message}` }, { status: 500 });
    }
    
    console.log(`Admin Data API: Successfully fetched ${data?.length || 0} items from ${table}`);
    
    return NextResponse.json(data || [], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Admin Data API: Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const table = url.searchParams.get('table');
    const isUpdate = url.searchParams.get('update') === 'true';
    
    logApiCall('POST', table || 'unknown');
    
    if (!table) {
      return NextResponse.json({ error: 'Missing table parameter' }, { status: 400 });
    }
    
    // Get the data from the request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    if (!requestData) {
      return NextResponse.json({ error: 'Missing request data' }, { status: 400 });
    }
    
    console.log(`Admin Data API: ${isUpdate ? 'Updating' : 'Creating'} data in table ${table}`);
    console.log('Request data:', JSON.stringify(requestData, null, 2));
    
    // Get cookies for the Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verify session and admin status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session || !session.user) {
      console.error('Admin Data API: Not authenticated');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Check admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (profileError || profile?.role !== 'admin') {
      console.error('Admin Data API: Not authorized');
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // Don't modify the requestData - assume it's already in the correct format
    // This avoids issues with parsing JSON strings that are already objects
    const dataToUpsert = { ...requestData };
    
    // Perform the operation based on whether it's an update or create
    let result;
    if (isUpdate) {
      // For updates, need an ID in the data
      if (!dataToUpsert.id) {
        return NextResponse.json({ error: 'Missing ID for update operation' }, { status: 400 });
      }
      
      console.log(`Updating ${table} with ID: ${dataToUpsert.id}`);
      
      // Clone the data and make a copy without the ID to avoid Supabase errors
      const { id, ...updateData } = dataToUpsert;
      
      const { data, error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error(`Admin Data API: Error updating ${table}:`, error);
        return NextResponse.json({ error: `Error updating data: ${error.message}` }, { status: 500 });
      }
      
      result = data;
    } else {
      // For create operations
      const { data, error } = await supabase
        .from(table)
        .insert(dataToUpsert)
        .select();
      
      if (error) {
        console.error(`Admin Data API: Error creating ${table}:`, error);
        return NextResponse.json({ error: `Error creating data: ${error.message}` }, { status: 500 });
      }
      
      result = data;
    }
    
    console.log(`Successfully ${isUpdate ? 'updated' : 'created'} data in ${table}:`, result);
    
    return NextResponse.json(result || [], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Admin Data API: Unexpected error in POST:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const table = url.searchParams.get('table');
    const id = url.searchParams.get('id');
    
    logApiCall('DELETE', table || 'unknown', id || undefined);
    
    if (!table) {
      return NextResponse.json({ error: 'Missing table parameter' }, { status: 400 });
    }
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }
    
    console.log(`Admin Data API: Deleting data from table ${table} with id ${id}`);
    
    // Get cookies for the Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verify session and admin status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session || !session.user) {
      console.error('Admin Data API: Not authenticated');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Check admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (profileError || profile?.role !== 'admin') {
      console.error('Admin Data API: Not authorized');
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // For players table, we should handle image deletion in the component, not here
    // This just deletes the database record
    
    // Delete the record
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Admin Data API: Error deleting from ${table}:`, error);
      return NextResponse.json({ error: `Error deleting data: ${error.message}` }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, id }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Admin Data API: Unexpected error in DELETE:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 