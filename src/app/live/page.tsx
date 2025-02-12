import { Metadata } from "next";
import LivePageClient from "./LivePageClient";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Live Stream | Rugby Club",
  description: "Watch our rugby matches live and catch up on previous broadcasts",
};

export const dynamic = 'force-dynamic';

export default async function LivePage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Fetch active live stream data from database
  const { data: liveStream } = await supabase
    .from('live_streams')
    .select('*')
    .eq('status', 'active')
    .single();

  // Fetch recent past broadcasts
  const { data: pastStreams } = await supabase
    .from('live_streams')
    .select('*')
    .eq('status', 'completed')
    .order('stream_date', { ascending: false })
    .limit(6);

  return <LivePageClient activeStream={liveStream} pastStreams={pastStreams || []} />;
} 