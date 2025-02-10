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
    <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900 ">
      {/* Hero Section */}
      <div className="relative py-20 bg-rugby-teal overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* Main large rugby ball */}
          <div className="absolute transform -rotate-45 left-1/4 top-1/4">
            <div className="w-[90px] h-[40px] md:w-[120px] md:h-[50px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Smaller rugby ball top right */}
          <div className="absolute transform rotate-12 right-1/4 top-8">
            <div className="w-[70px] h-[30px] md:w-[90px] md:h-[35px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Small rugby ball bottom left */}
          <div className="absolute transform -rotate-20 left-16 bottom-8">
            <div className="w-[50px] h-[22px] md:w-[60px] md:h-[25px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Extra small ball top left */}
          <div className="absolute transform rotate-45 hidden md:block left-16 top-12">
            <div className="w-[40px] h-[18px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Medium ball bottom right */}
          <div className="absolute transform -rotate-12 hidden md:block right-20 bottom-16">
            <div className="w-[100px] h-[40px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Small ball center right */}
          <div className="absolute transform rotate-30 hidden lg:block right-1/3 top-1/3">
            <div className="w-[70px] h-[28px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Tiny ball top center */}
          <div className="absolute transform -rotate-15 hidden lg:block left-1/2 top-8">
            <div className="w-[45px] h-[20px] rounded-[50%] bg-rugby-yellow"></div>
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