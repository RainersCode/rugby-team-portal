'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Edit, MapPin, Calendar, Users, Trophy, Heart, Target } from 'lucide-react'

interface AboutPageClientProps {
  aboutData: {
    mission?: string
    vision?: string
    history?: string
    values?: string
    team_image?: string
    training_image?: string
    community_image?: string
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
    <div className="space-y-24">
      {/* Mission & Vision Section */}
      <section className="grid md:grid-cols-2 gap-12">
        <motion.div 
          className="space-y-6"
          {...fadeInUp}
        >
          <h2 className="text-3xl font-bold">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            {aboutData.mission || 'To promote rugby excellence, foster community engagement, and develop players both on and off the field.'}
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Trophy className="w-5 h-5 text-primary-blue mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Excellence</h3>
                <p className="text-sm text-gray-600">Striving for the highest standards in everything we do</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary-blue mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Passion</h3>
                <p className="text-sm text-gray-600">Deep love and dedication for the sport</p>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div 
          className="space-y-6"
          {...fadeInUp}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold">Our Vision</h2>
          <p className="text-gray-600 leading-relaxed">
            {aboutData.vision || 'To be a leading force in rugby, known for developing exceptional players and fostering a strong community spirit.'}
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-primary-blue mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Growth</h3>
                <p className="text-sm text-gray-600">Continuous improvement and development</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary-blue mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Unity</h3>
                <p className="text-sm text-gray-600">Building strong bonds on and off the field</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Team Image Section */}
      <motion.div 
        className="relative h-[500px] rounded-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          src={aboutData.team_image || '/placeholder-team.jpg'}
          alt="Our Team"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Our Team</h2>
          <p className="text-white/90 max-w-2xl">
            A diverse group of passionate individuals united by their love for rugby and commitment to excellence.
          </p>
        </div>
      </motion.div>

      {/* History Section */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div 
          className="space-y-6"
          {...fadeInUp}
        >
          <h2 className="text-3xl font-bold">Our History</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed">
              {aboutData.history || 'Our club has a rich history of fostering rugby talent and building community connections. From humble beginnings, we have grown into a respected institution in the rugby world.'}
            </p>
          </div>
        </motion.div>
        <motion.div 
          className="grid grid-cols-2 gap-4"
          {...fadeInUp}
          transition={{ delay: 0.2 }}
        >
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src={aboutData.training_image || '/placeholder-training.jpg'}
              alt="Training session"
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src={aboutData.community_image || '/placeholder-community.jpg'}
              alt="Community event"
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="relative bg-gray-50 -mx-4 px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Our Values</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed">
              {aboutData.values || 'We believe in respect, integrity, teamwork, and continuous improvement. These core values guide everything we do, from training sessions to community engagement.'}
            </p>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="text-center space-y-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Join Our Rugby Family</h2>
          <p className="text-gray-600 mb-8">
            Whether you're an experienced player or new to rugby, we welcome everyone who shares our passion for the game.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/contact"
              className="bg-primary-blue text-white px-6 py-3 rounded-lg hover:bg-primary-blue/90 transition-colors"
            >
              Get Started
            </Link>
            <Link 
              href="/training"
              className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View Schedule
            </Link>
          </div>
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