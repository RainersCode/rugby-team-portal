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
  logApiCall('POST', new URL(request.url).searchParams.get('table') || 'unknown');
  
  try {
    const url = new URL(request.url);
    const table = url.searchParams.get('table');
    const isUpdate = url.searchParams.get('update') === 'true';
    
    if (!table) {
      return NextResponse.json({ error: 'Missing table parameter' }, { status: 400 });
    }
    
    // Get the data from the request body
    const requestData = await request.json();
    
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
    
    // Special handling for players table to ensure proper JSON structure
    let dataToUpsert = requestData;
    if (table === 'players' && typeof requestData === 'object') {
      // Make sure stats and social are proper JSON objects
      if (requestData.stats && typeof requestData.stats !== 'object') {
        try {
          dataToUpsert.stats = JSON.parse(requestData.stats);
        } catch (e) {
          console.error('Failed to parse stats JSON:', e);
          return NextResponse.json({ error: 'Invalid stats data format' }, { status: 400 });
        }
      }
      
      if (requestData.social && typeof requestData.social !== 'object') {
        try {
          dataToUpsert.social = JSON.parse(requestData.social);
        } catch (e) {
          console.error('Failed to parse social JSON:', e);
          return NextResponse.json({ error: 'Invalid social data format' }, { status: 400 });
        }
      }
      
      if (requestData.achievements && !Array.isArray(requestData.achievements)) {
        try {
          dataToUpsert.achievements = JSON.parse(requestData.achievements);
        } catch (e) {
          console.error('Failed to parse achievements JSON:', e);
          return NextResponse.json({ error: 'Invalid achievements data format' }, { status: 400 });
        }
      }
    }
    
    // Perform the operation based on whether it's an update or create
    let result;
    if (isUpdate) {
      // For updates, need an ID in the data
      if (!dataToUpsert.id) {
        return NextResponse.json({ error: 'Missing ID for update operation' }, { status: 400 });
      }
      
      const { data, error } = await supabase
        .from(table)
        .update(dataToUpsert)
        .eq('id', dataToUpsert.id)
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
    
    return NextResponse.json(result || [], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Admin Data API: Unexpected error in POST:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
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