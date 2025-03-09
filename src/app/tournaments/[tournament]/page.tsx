export default async function TournamentPage({
  params,
}: {
  params: { tournament: string };
}) {
  try {
    const cookieStore = await cookies();
    // ... existing code ...
  } catch (error) {
    console.error('Error fetching cookies:', error);
  }
} 