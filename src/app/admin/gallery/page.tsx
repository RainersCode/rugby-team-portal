import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminGalleryClient from './AdminGalleryClient';

export const dynamic = 'force-dynamic';

export default async function AdminGalleryPage() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    // Check if user is authenticated and is admin
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      redirect('/auth/signin');
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      redirect('/');
    }

    // Fetch galleries with their photos count
    const { data: galleries } = await supabase
      .from('galleries')
      .select(`
        *,
        photos:gallery_photos(count)
      `)
      .order('created_at', { ascending: false });

    return (
      <div className="container-width py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gallery Management</h1>
        </div>
        <AdminGalleryClient initialGalleries={galleries || []} />
      </div>
    );
  } catch (error) {
    console.error('Error in AdminGalleryPage:', error);
    return (
      <div className="container-width py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gallery Management</h1>
        </div>
        <p>An error occurred while loading the gallery. Please try again later.</p>
      </div>
    );
  }
} 