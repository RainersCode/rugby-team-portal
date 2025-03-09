export default async function EventsPage() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    // ... existing code ...
  } catch (error) {
    console.error('Error fetching events:', error);
    return <div>Error fetching events</div>;
  }
} 