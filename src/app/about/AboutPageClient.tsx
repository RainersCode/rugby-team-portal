'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Edit, Calendar, Star, Target, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from "@/context/LanguageContext"
import Image from "next/image"

const aboutTranslations = {
  en: {
    editContent: "Edit About Page Content",
    ourPurpose: "Our Purpose",
    ourMission: "Our Mission",
    whatWeStandFor: "What We Stand For",
    ourValues: "Our Values",
    ourJourney: "Our Journey",
    ourHistory: "Our History",
    keyAchievements: "Key Achievements",
    teamHighlights: "Team Highlights",
    ourTeam: "Our Team",
    editTeam: "Edit Team"
  },
  lv: {
    editContent: "Rediģēt Par Mums Saturu",
    ourPurpose: "Mūsu Mērķis",
    ourMission: "Mūsu Misija",
    whatWeStandFor: "Mūsu Principi",
    ourValues: "Mūsu Vērtības",
    ourJourney: "Mūsu Ceļš",
    ourHistory: "Mūsu Vēsture",
    keyAchievements: "Galvenie Sasniegumi",
    teamHighlights: "Komandas Sasniegumi",
    ourTeam: "Mūsu Komanda",
    editTeam: "Rediģēt Komandu"
  }
};

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
  const { language } = useLanguage()

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
              {aboutTranslations[language].editContent}
            </Button>
          </Link>
        </div>
      )}

      {/* Mission and Values Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-l from-rugby-teal/5 to-transparent rounded-none" />
        <div className="relative grid md:grid-cols-2 gap-12 p-8 md:p-12 items-start">
          <motion.div 
            className="space-y-8"
            {...fadeInUp}
          >
            <div className="inline-flex items-center gap-2 bg-rugby-teal/10 text-rugby-teal rounded-none px-4 py-1">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">{aboutTranslations[language].ourPurpose}</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">{aboutTranslations[language].ourMission}</h2>
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
            <div className="inline-flex items-center gap-2 bg-rugby-teal/10 text-rugby-teal rounded-none px-4 py-1">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">{aboutTranslations[language].whatWeStandFor}</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">{aboutTranslations[language].ourValues}</h2>
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
        <div className="absolute inset-0 bg-gradient-to-l from-rugby-teal/5 to-transparent rounded-none" />
        <div className="relative grid md:grid-cols-2 gap-12 p-8 md:p-12 items-start">
          <motion.div 
            className="space-y-8"
            {...fadeInUp}
          >
            <div className="inline-flex items-center gap-2 bg-rugby-teal/10 text-rugby-teal rounded-none px-4 py-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{aboutTranslations[language].ourJourney}</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">{aboutTranslations[language].ourHistory}</h2>
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
            <div className="inline-flex items-center gap-2 bg-rugby-teal/10 text-rugby-teal rounded-none px-4 py-1">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">{aboutTranslations[language].keyAchievements}</span>
            </div>
            <h2 className="text-3xl font-bold mb-6">{aboutTranslations[language].teamHighlights}</h2>
            <div className="space-y-4">
              {aboutData.team_highlights?.map((highlight: TeamHighlight, index: number) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white dark:bg-gray-800 rounded-none p-6 shadow-sm hover:shadow-md transition-shadow border border-rugby-teal/20 hover:border-rugby-teal/50"
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
            <h2 className="text-3xl font-bold">{aboutTranslations[language].ourTeam}</h2>
            {isAdmin && (
              <Link href="/admin/team">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  {aboutTranslations[language].editTeam}
                </Button>
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="text-center bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-rugby-teal/50 rounded-none">
                <div className="relative w-32 h-32 mx-auto mb-4 overflow-hidden rounded-none border-2 border-rugby-teal/20">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
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