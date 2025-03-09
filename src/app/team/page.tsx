import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import TeamPageClient from '@/components/features/Team/TeamPageClient'

export const revalidate = 3600 // Revalidate every hour
export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: players, error } = await supabase
    .from("players")
    .select("*")
    .order("number");

  if (error) {
    console.error("Error fetching players:", error);
    return <div>Error loading players</div>;
  }

  // Map the data to match our Player type
  const mappedPlayers = players?.map(player => ({
    id: player.id.toString(),
    name: player.name,
    position: player.position,
    number: player.number,
    image: player.image,
    stats: player.stats || {
      matches: 0,
      tries: 0,
      tackles: 0,
      assists: 0
    }
  })) || [];

  return <TeamPageClient players={mappedPlayers} />;
}
