'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Edit, Calendar, Star, Target, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from "@/context/LanguageContext"
import Image from "next/image"

interface TeamHighlight {
  title: string
  description: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  image: string
}

interface AboutPageData {
  id: string
  history: string
  mission: string
  values: string
  team_highlights: TeamHighlight[]
  hero_image: string | null
  created_at: string
  updated_at: string
}

interface AboutPageClientProps {
  aboutData: AboutPageData
  teamMembers?: TeamMember[]
  isAdmin: boolean
}

export default function AboutPageClient({ aboutData, teamMembers = [], isAdmin }: AboutPageClientProps) {
  const { translations } = useLanguage()

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Admin Controls */}
      {isAdmin && (
        <div className="container-width py-4">
          <Link href="/admin/about/edit">
            <Button variant="primary" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit About Page Content
            </Button>
          </Link>
        </div>
      )}

      {/* Mission and Values Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-l from-rugby-teal/5 to-transparent rounded-3xl" />
        <div className="relative grid md:grid-cols-2 gap-12 p-8 md:p-12 items-start">
          <motion.div 
            className="space-y-8"
            {...fadeInUp}
          >
            <div className="inline-flex items-center gap-2 bg-rugby-teal/10 text-rugby-teal rounded-full px-4 py-1">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">Our Purpose</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">{translations.ourMission}</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed text-lg">
                  {aboutData.mission}
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
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">What We Stand For</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">{translations.ourValues}</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed text-lg">
                  {aboutData.values}
                </p>
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
              {aboutData.team_highlights?.map((highlight: TeamHighlight, index: number) => (
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

      {/* Team Section */}
      {teamMembers.length > 0 && (
        <section className="container-width">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">{translations.ourTeam}</h2>
            {isAdmin && (
              <Link href="/admin/team">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Team
                </Button>
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-rugby-teal">{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
} 