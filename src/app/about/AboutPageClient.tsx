'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Edit, MapPin, Calendar, Users, Trophy, Heart, Target, Star } from 'lucide-react'

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
    <div className="space-y-32">
      {/* Mission Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-blue/5 to-transparent rounded-3xl" />
        <div className="relative grid md:grid-cols-2 gap-12 p-8 md:p-12">
          <motion.div 
            className="space-y-8"
            {...fadeInUp}
          >
            <div className="inline-flex items-center gap-2 bg-primary-blue/10 text-primary-blue rounded-full px-4 py-1">
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
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <Trophy className="w-6 h-6 text-primary-blue mb-4" />
                <h3 className="font-semibold mb-2">Excellence</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Striving for the highest standards in everything we do</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <Heart className="w-6 h-6 text-primary-blue mb-4" />
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
            <div className="inline-flex items-center gap-2 bg-primary-blue/10 text-primary-blue rounded-full px-4 py-1">
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
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <Target className="w-6 h-6 text-primary-blue mb-4" />
                <h3 className="font-semibold mb-2">Growth</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Continuous improvement and development</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <Users className="w-6 h-6 text-primary-blue mb-4" />
                <h3 className="font-semibold mb-2">Unity</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Building strong bonds on and off the field</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* History Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-l from-primary-blue/5 to-transparent rounded-3xl" />
        <div className="relative grid md:grid-cols-2 gap-12 p-8 md:p-12 items-start">
          <motion.div 
            className="space-y-8"
            {...fadeInUp}
          >
            <div className="inline-flex items-center gap-2 bg-primary-blue/10 text-primary-blue rounded-full px-4 py-1">
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
            <div className="inline-flex items-center gap-2 bg-primary-blue/10 text-primary-blue rounded-full px-4 py-1">
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
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg mb-2">{highlight.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{highlight.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Join Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-blue to-blue-600 rounded-3xl opacity-90" />
        <div className="relative text-center space-y-8 p-8 md:p-12">
          <motion.div 
            className="max-w-2xl mx-auto space-y-6"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join Our Rugby Family
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Whether you're an experienced player or new to rugby, we welcome everyone who shares our passion for the game.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/contact"
                className="bg-white text-primary-blue px-8 py-3 rounded-lg hover:bg-white/90 transition-colors font-medium"
              >
                Get Started
              </Link>
              <Link 
                href="/training"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View Schedule
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Admin Edit Button */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6">
          <Link
            href="/admin/about/edit"
            className="flex items-center gap-2 bg-primary-blue text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary-blue/90 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Page
          </Link>
        </div>
      )}
    </div>
  )
} 