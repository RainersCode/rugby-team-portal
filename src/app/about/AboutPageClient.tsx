'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Edit, Calendar, Users, Trophy, Heart, Target, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AboutPageClientProps {
  aboutData: {
    mission: string
    history: string
    values: string
    team_highlights?: {
      title: string
      description: string
    }[]
  }
  isAdmin: boolean
}

export default function AboutPageClient({ aboutData, isAdmin }: AboutPageClientProps) {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  return (
    <>
      <div className="space-y-32">
        {/* Mission Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-rugby-teal/5 to-transparent rounded-3xl" />
          <div className="relative grid md:grid-cols-2 gap-12 p-8 md:p-12">
            <motion.div 
              className="space-y-8"
              {...fadeInUp}
            >
              <div className="inline-flex items-center gap-2 bg-rugby-teal/10 text-rugby-teal rounded-full px-4 py-1">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium">Our Purpose</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {aboutData.mission}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-rugby-teal/20">
                  <Trophy className="w-6 h-6 text-rugby-teal mb-4" />
                  <h3 className="font-semibold mb-2">Excellence</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Striving for the highest standards in everything we do</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-rugby-teal/20">
                  <Heart className="w-6 h-6 text-rugby-red mb-4" />
                  <h3 className="font-semibold mb-2">Passion</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Deep love and dedication for the sport</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="space-y-8"
              {...fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 bg-rugby-teal/10 text-rugby-teal rounded-full px-4 py-1">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Our Principles</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Values</h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {aboutData.values}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-rugby-teal/20">
                  <Target className="w-6 h-6 text-rugby-yellow mb-4" />
                  <h3 className="font-semibold mb-2">Growth</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Continuous improvement and development</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-rugby-teal/20">
                  <Users className="w-6 h-6 text-rugby-teal mb-4" />
                  <h3 className="font-semibold mb-2">Unity</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Building strong bonds on and off the field</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* History Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-l from-rugby-teal/5 to-transparent rounded-3xl" />
          <div className="relative grid md:grid-cols-2 gap-12 p-8 md:p-12 items-start">
            <motion.div 
              className="space-y-8"
              {...fadeInUp}
            >
              <div className="inline-flex items-center gap-2 bg-rugby-teal/10 text-rugby-teal rounded-full px-4 py-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Our Journey</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6">Our History</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {aboutData.history}
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="space-y-8"
              {...fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 bg-rugby-teal/10 text-rugby-teal rounded-full px-4 py-1">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Key Achievements</span>
              </div>
              <h2 className="text-3xl font-bold mb-6">Team Highlights</h2>
              <div className="space-y-4">
                {aboutData.team_highlights?.map((highlight, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-rugby-teal/20"
                  >
                    <h3 className="font-semibold text-lg mb-2">{highlight.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{highlight.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Join Section - Full Width */}
      <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-rugby-teal/60">
        <section className="relative py-24 overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url("/fnx banner png.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.9
            }}
          />

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5 z-0 bg-black/20">
            <div className="absolute transform -rotate-45 -left-1/4 -top-1/4">
              <div className="w-96 h-96 rounded-full bg-rugby-yellow"></div>
            </div>
            <div className="absolute transform -rotate-45 -right-1/4 -bottom-1/4">
              <div className="w-96 h-96 rounded-full bg-rugby-yellow"></div>
            </div>
          </div>

          <div className="relative container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-12 z-10">
            {/* Text Content */}
            <div className="flex-1 text-white text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 drop-shadow-lg">
                Join Our Rugby Family
              </h2>
              <p className="text-xl lg:text-2xl mb-8 opacity-90 drop-shadow-lg">
                Be part of something special. Train with the best, play with
                passion, and create lasting memories.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button 
                  href="/contact"
                  variant="primary"
                  size="lg"
                  className="bg-white text-rugby-teal hover:bg-white/90"
                >
                  Get Started
                </Button>
                <Button 
                  href="/activities"
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-rugby-teal"
                >
                  View Schedule
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Admin Edit Button */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6">
          <Link
            href="/admin/about/edit"
            className="flex items-center gap-2 bg-rugby-teal text-white px-4 py-2 rounded-lg shadow-lg hover:bg-rugby-teal/90 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Page
          </Link>
        </div>
      )}
    </>
  )
} 