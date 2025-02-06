'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Users, Target, Award, ChevronRight, Shield } from 'lucide-react'

interface TeamHighlight {
  title: string
  description: string
}

interface AboutPageProps {
  aboutData: {
    history: string
    mission: string
    values: string
    team_highlights: TeamHighlight[]
  }
  isAdmin: boolean
}

export default function AboutPageClient({ aboutData, isAdmin }: AboutPageProps) {
  const supabase = createClientComponentClient()
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null)

  useEffect(() => {
    async function getHeroImageUrl() {
      const { data } = supabase.storage
        .from('public')
        .getPublicUrl('images/rugby-hero.jpg')
      
      if (data?.publicUrl) {
        setHeroImageUrl(data.publicUrl)
      }
    }

    getHeroImageUrl()
  }, [supabase])

  if (!aboutData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Shield className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-xl text-foreground animate-pulse">Loading team information...</p>
      </div>
    )
  }

  const values = aboutData.values.split(', ').filter(Boolean)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 dark:from-background dark:to-primary/5">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
        {/* Multiple overlays for better text visibility */}
        <div className="absolute inset-0 bg-black/75" /> {/* Darker base overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/75 to-background" /> {/* Stronger gradient */}
        {heroImageUrl && (
          <Image
            src={heroImageUrl}
            alt="Rugby team in action"
            fill
            className="object-cover scale-105 motion-safe:animate-subtle-zoom brightness-50" // Darker image
            priority
          />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <motion.div 
            className="text-center space-y-8 max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Shield className="h-16 w-16 text-white mx-auto mb-4 drop-shadow-lg filter drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]" />
            <div className="space-y-6"> {/* Increased spacing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-block"
              >
                <span className="px-6 py-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-lg font-medium border border-white/20 shadow-lg">
                  Est. Since 2020
                </span>
              </motion.div>
              <h1 className="text-6xl md:text-8xl font-bold text-white leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                Our Story
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-white leading-relaxed max-w-3xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] font-medium">
              {aboutData.history}
            </p>
          </motion.div>
        </div>
        {isAdmin && (
          <div className="absolute top-4 right-4 z-10">
            <Link href="/admin/about/edit">
              <Button variant="secondary" size="sm" className="gap-2 backdrop-blur-sm bg-black/40 hover:bg-black/60 text-white border border-white/20">
                <Pencil className="h-4 w-4" />
                Edit Page
              </Button>
            </Link>
          </div>
        )}
        {/* Stronger gradient at the bottom for smoother transition */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/95 to-transparent" />
      </section>

      {/* Content Container - Adjusted spacing */}
      <div className="w-full -mt-8 relative z-10 space-y-32">
        {/* Mission Section */}
        <motion.section className="relative w-full bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <div className="container mx-auto px-4 pt-16">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-2xl p-4 bg-primary/10 dark:bg-primary/20 mb-6 rotate-3 hover:rotate-6 transition-transform duration-300 shadow-lg">
                <Target className="h-12 w-12 text-primary dark:text-primary" />
              </div>
              <h2 className="text-5xl font-bold mb-16 text-foreground dark:text-foreground">Our Mission</h2>
              <div className="relative w-full max-w-4xl">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 dark:from-primary/10 dark:to-primary/5 rounded-3xl blur-3xl" />
                <Card className="relative bg-background/90 dark:bg-background/90 backdrop-blur-xl border-primary/10 rounded-3xl overflow-hidden shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                  <div className="relative p-8 md:p-12">
                    <p className="text-2xl italic text-center leading-relaxed text-foreground dark:text-foreground">
                      "{aboutData.mission}"
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Values Section */}
        {values.length > 0 && (
          <motion.section className="relative w-full bg-gradient-to-r from-background via-muted/50 to-background">
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                  <div className="rounded-2xl p-4 bg-primary/10 dark:bg-primary/20 inline-block -rotate-3 hover:-rotate-6 transition-transform duration-300">
                    <Award className="h-12 w-12 text-primary dark:text-primary" />
                  </div>
                  <h2 className="text-5xl font-bold mt-6 text-foreground dark:text-foreground">Our Values</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {values.map((value, index) => (
                    <motion.div
                      key={value}
                      className="group"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className="relative h-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent dark:from-primary/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                        <div className="relative bg-background/80 dark:bg-background/80 backdrop-blur-xl rounded-3xl p-8 h-full border border-primary/10 overflow-hidden group-hover:border-primary/20 transition-colors duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                          <div className="relative">
                            <h3 className="text-3xl font-bold text-foreground dark:text-foreground mb-4">{value}</h3>
                            <div className="absolute bottom-0 right-0 opacity-0 transform translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                              <ChevronRight className="h-6 w-6 text-primary dark:text-primary" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Team Highlights */}
        {aboutData.team_highlights && aboutData.team_highlights.length > 0 && (
          <motion.section className="relative w-full bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                  <div className="rounded-2xl p-4 bg-primary/10 dark:bg-primary/20 inline-block rotate-3 hover:rotate-6 transition-transform duration-300">
                    <Users className="h-12 w-12 text-primary dark:text-primary" />
                  </div>
                  <h2 className="text-5xl font-bold mt-6 text-foreground dark:text-foreground">Team Highlights</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {aboutData.team_highlights.map((highlight, index) => (
                    <motion.div
                      key={highlight.title}
                      className="group"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className="relative h-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent dark:from-primary/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                        <div className="relative bg-background/80 dark:bg-background/80 backdrop-blur-xl rounded-3xl p-8 h-full border border-primary/10 group-hover:border-primary/20 transition-colors duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                          <div className="relative">
                            <h3 className="text-2xl font-bold text-foreground dark:text-foreground mb-4">{highlight.title}</h3>
                            <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">{highlight.description}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Join Our Team Section */}
        <section className="relative w-full bg-primary-blue py-24 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute transform -rotate-45 -left-1/4 -top-1/4">
              <div className="w-96 h-96 rounded-full bg-white"></div>
            </div>
            <div className="absolute transform -rotate-45 -right-1/4 -bottom-1/4">
              <div className="w-96 h-96 rounded-full bg-white"></div>
            </div>
          </div>

          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Header with accent */}
              <div className="text-center mb-16">
                <div className="inline-block">
                  <span className="inline-block px-4 py-1 bg-white/10 rounded-full text-white text-sm font-medium tracking-wider mb-4">
                    JOIN OUR COMMUNITY
                  </span>
                  <h2 className="text-5xl md:text-6xl font-bold text-white">
                    Join Our Team
                  </h2>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left side - Text Content */}
                <div className="space-y-8">
                  <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                    Be part of something special. Train with the best, play with passion, and create lasting memories.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/contact"
                      className="group inline-flex items-center justify-center px-8 py-4 bg-white text-primary-blue rounded-xl font-semibold transition-all duration-300 hover:bg-white/95 hover:scale-105"
                    >
                      Contact Us
                      <ChevronRight className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/team"
                      className="group inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white rounded-xl font-semibold transition-all duration-300 hover:bg-white/20 hover:scale-105 backdrop-blur-sm"
                    >
                      Meet the Team
                      <ChevronRight className="h-5 w-5 ml-2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>

                {/* Right side - Stats Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { number: "15+", label: "Years of Excellence" },
                    { number: "200+", label: "Active Members" },
                    { number: "50+", label: "Annual Matches" },
                    { number: "30+", label: "Trophies Won" }
                  ].map((stat, index) => (
                    <div
                      key={stat.label}
                      className="group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl transition-transform duration-300 group-hover:scale-105" />
                      <div className="relative p-6 text-center">
                        <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                        <div className="text-sm text-white/80">{stat.label}</div>
                      </div>
                      {/* Decorative dot */}
                      <div className="absolute -top-1 -right-1 w-8 h-8 bg-white/20 rounded-full blur-lg transition-all duration-300 group-hover:scale-150" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 