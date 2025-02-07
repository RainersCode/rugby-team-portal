import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import GalleryPhotosClient from './GalleryPhotosClient';

interface Props {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function GalleryPhotosPage({ params }: Props) {
  const cookieStore = cookies();
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

  // Fetch gallery details
  const { data: gallery } = await supabase
    .from('galleries')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!gallery) {
    redirect('/admin/gallery');
  }

  // Fetch gallery photos
  const { data: photos } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('gallery_id', params.id)
    .order('created_at', { ascending: false });

  return (
    <div className="container-width py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{gallery.title}</h1>
          <p className="text-muted-foreground">{gallery.description}</p>
        </div>
      </div>
      <GalleryPhotosClient galleryId={params.id} initialPhotos={photos || []} />
    </div>
  );
} 