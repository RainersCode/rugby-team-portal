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

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative py-20 bg-primary-blue overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute transform rotate-45 left-1/4 top-1/4">
            <div className="w-96 h-96 rounded-full bg-white"></div>
          </div>
        </div>
        <div className="relative container-width text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Live Rugby
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Watch our matches live or catch up on previous broadcasts
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-width py-12">
        <LivePageClient 
          activeStream={liveStream} 
          pastStreams={pastStreams || []} 
        />
      </div>
    </div>
  );
} 