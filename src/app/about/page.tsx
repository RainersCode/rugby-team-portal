import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import AboutPageClient from './AboutPageClient'

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  // Check if user is admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { data: profile } = session
    ? await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
    : { data: null }

  const isAdmin = profile?.role === 'admin'

  // Fetch about page data
  const { data: aboutData } = await supabase
    .from('about_page')
    .select('*')
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative min-h-[600px] bg-rugby-teal overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Rugby pattern background */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/rugby-pattern.png')] opacity-5" 
               style={{ backgroundSize: '30px' }} />
          
          {/* Soft overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent" />
          
          {/* Decorative circles */}
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-rugby-yellow/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-rugby-yellow/10 blur-3xl" />
        </div>

        {/* Content Container */}
        <div className="container-width relative">
          <div className="flex flex-col items-start pt-32 pb-48 px-4">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full pl-2 pr-4 py-1 mb-8">
              <span className="bg-white text-rugby-teal text-sm font-semibold px-3 py-1 rounded-full">
                Est. 1995
              </span>
              <span className="text-white/90 text-sm">
                A Legacy of Excellence
              </span>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                More Than Just
                <span className="block mt-3">
                  A Rugby Club
                </span>
              </h1>
              <p className="mt-8 text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                Founded on passion, built on community, and driven by excellence. 
                Join us in our journey to create champions both on and off the field.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom fade effect */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-bg-light dark:from-bg-dark to-transparent" />
      </div>

      {/* Quick Stats */}
      <div className="container-width px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 p-6 md:p-8 relative -mt-24 border border-rugby-teal/20">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-rugby-teal mb-2">28</div>
            <div className="text-sm text-muted-foreground">Years of Legacy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-rugby-teal mb-2">150+</div>
            <div className="text-sm text-muted-foreground">Active Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-rugby-teal mb-2">20+</div>
            <div className="text-sm text-muted-foreground">Expert Coaches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-rugby-teal mb-2">10+</div>
            <div className="text-sm text-muted-foreground">Championships</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-width px-4 py-8">
        <AboutPageClient aboutData={aboutData || {}} isAdmin={isAdmin} />
      </div>
    </div>
  )
} 