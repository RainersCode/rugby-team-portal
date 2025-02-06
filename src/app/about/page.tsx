import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import AboutPageClient from './AboutPageClient'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AboutPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  let isAdmin = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    isAdmin = profile?.role === 'admin'
  }

  try {
    const { data: aboutData, error } = await supabase
      .from('about_page')
      .select('*')
      .single()

    if (error) {
      console.error('Error fetching about page data:', error)
      return notFound()
    }

    if (!aboutData) {
      // If no data exists, create initial data
      const { data: newAboutData, error: insertError } = await supabase
        .from('about_page')
        .insert([
          {
            history: 'Our rugby team was founded with the passion for the sport and community spirit. Starting from humble beginnings, we have grown into a tight-knit family of players and supporters.',
            mission: 'To promote rugby excellence, foster community engagement, and develop players both on and off the field.',
            values: 'Teamwork, Respect, Integrity, Passion, and Excellence',
            team_highlights: [
              {
                title: 'Community Engagement',
                description: 'Regular involvement in local sports initiatives'
              },
              {
                title: 'Player Development',
                description: 'Comprehensive training programs for all skill levels'
              },
              {
                title: 'Team Spirit',
                description: 'Strong focus on camaraderie and mutual support'
              }
            ]
          }
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting initial about page data:', insertError)
        return notFound()
      }

      return <AboutPageClient aboutData={newAboutData} isAdmin={isAdmin} />
    }

    return <AboutPageClient aboutData={aboutData} isAdmin={isAdmin} />
  } catch (error) {
    console.error('Unexpected error:', error)
    return notFound()
  }
} 