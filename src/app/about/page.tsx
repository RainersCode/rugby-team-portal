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
      <div className="relative bg-primary-blue">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/rugby-pattern.png')] opacity-5" />
        
        {/* Content */}
        <div className="relative container-width mx-auto px-4 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              About Our Club
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-2xl">
              Founded on passion, built on community, and driven by excellence. 
              We are more than just a rugby club – we are a family.
            </p>
          </div>
        </div>
        
        {/* Wave shape */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
          <svg 
            viewBox="0 0 1440 320" 
            className="absolute bottom-0 w-full h-auto"
            preserveAspectRatio="none"
            style={{ transform: 'scale(1.1)' }}
          >
            <path 
              fill="currentColor" 
              className="text-bg-light dark:text-bg-dark"
              d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container-width px-4">
        <div className="bg-card rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-4 gap-8 p-8 transform -translate-y-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-blue mb-2">1995</div>
            <div className="text-sm text-muted-foreground">Founded</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-blue mb-2">150+</div>
            <div className="text-sm text-muted-foreground">Active Members</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-blue mb-2">20+</div>
            <div className="text-sm text-muted-foreground">Coaches & Staff</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-blue mb-2">10+</div>
            <div className="text-sm text-muted-foreground">Championships</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-width px-4 py-12">
        <AboutPageClient aboutData={aboutData || {}} isAdmin={isAdmin} />
      </div>
    </div>
  )
} 