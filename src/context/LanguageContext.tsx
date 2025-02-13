"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'lv';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Record<string, string> & { language: Language };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
  en: {
    language: 'en' as Language,
    // Navigation
    home: 'Home',
    team: 'Team',
    activities: 'Activities',
    matches: 'Matches',
    training: 'Training',
    tournaments: 'Tournaments',
    media: 'Media',
    gallery: 'Gallery',
    news: 'News',
    live: 'Live',
    videos: 'Videos',
    info: 'Info',
    about: 'About',
    contact: 'Contact',
    
    // Auth
    signIn: 'Sign In',
    signOut: 'Sign Out',
    profile: 'Profile',
    settings: 'Settings',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    close: 'Close',
    viewAll: 'View all',

    // Home Page
    latestNews: 'Latest News',
    viewAllNews: 'View all news',
    readMore: 'Read More',
    joinOurFamily: 'Join Our Rugby Family',
    joinSubheading: 'Be part of something special. Train with the best, play with passion, and create lasting memories.',
    joinUs: 'Join us!',
    getStarted: 'Get Started',
    viewSchedule: 'View Schedule',
    rugbyUpdates: 'Rugby Updates',
    rugbyUpdatesSubheading: 'Stay updated with the latest rugby news and updates from around the world. Select any account to view their latest tweets.',
    followInstagram: 'Follow Us on Instagram',
    featuredPrograms: 'Featured Programs',
    upcomingMatches: 'Upcoming Matches',
    completedMatches: 'Completed Matches',

    // Match Status
    liveNow: 'LIVE NOW',
    completed: 'Completed',
    scheduled: 'Scheduled',
    showLess: 'Show Less',
    showDetails: 'Show Details',
    matchSummary: 'Match Summary',

    // Sponsors Section
    ourSponsors: 'Our Sponsors',
    sponsorsSubheading: 'Proud partners who support our rugby community',

    // Social Media
    followUs: 'Follow Us',
    yourTeamHandle: '@your_rugby_team',

    // Training Programs
    viewProgram: 'View Program',
    programDetails: 'Program Details',
    trainer: 'Trainer',
    weeks: 'weeks',
    difficulty: 'Difficulty',
    category: 'Category',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',

    // About Page
    aboutSubheading: 'Learn about our history, mission, and the team that makes it all possible',
    ourMission: 'Our Mission',
    ourVision: 'Our Vision',
    ourTeam: 'Our Team',
  },
  lv: {
    language: 'lv' as Language,
    // Navigation
    home: 'Sākums',
    team: 'Komanda',
    activities: 'Aktivitātes',
    matches: 'Spēles',
    training: 'Treniņi',
    tournaments: 'Turnīri',
    media: 'Mediji',
    gallery: 'Galerija',
    news: 'Ziņas',
    live: 'Tiešraide',
    videos: 'Video',
    info: 'Info',
    about: 'Par mums',
    contact: 'Kontakti',
    
    // Auth
    signIn: 'Ieiet',
    signOut: 'Iziet',
    profile: 'Profils',
    settings: 'Iestatījumi',
    
    // Common
    loading: 'Ielādē...',
    error: 'Kļūda',
    success: 'Veiksmīgi',
    save: 'Saglabāt',
    cancel: 'Atcelt',
    delete: 'Dzēst',
    edit: 'Rediģēt',
    view: 'Skatīt',
    close: 'Aizvērt',
    viewAll: 'Skatīt visus',

    // Home Page
    latestNews: 'Jaunākās Ziņas',
    viewAllNews: 'Skatīt visas ziņas',
    readMore: 'Lasīt vairāk',
    joinOurFamily: 'Pievienojies Mūsu Regbija Ģimenei',
    joinSubheading: 'Esi daļa no kaut kā īpaša. Trenējies ar labākajiem, spēlē ar aizrautību un veido neaizmirstamas atmiņas.',
    joinUs: 'Pievienojies!',
    getStarted: 'Sākt',
    viewSchedule: 'Skatīt Grafiku',
    rugbyUpdates: 'Regbija Aktualitātes',
    rugbyUpdatesSubheading: 'Seko līdzi jaunākajām regbija ziņām un aktualitātēm no visas pasaules. Izvēlies jebkuru kontu, lai redzētu jaunākos tvītus.',
    followInstagram: 'Seko mums Instagram',
    featuredPrograms: 'Izceltās Programmas',
    upcomingMatches: 'Gaidāmās Spēles',
    completedMatches: 'Pabeigtās Spēles',

    // Match Status
    liveNow: 'TIEŠRAIDE',
    completed: 'Pabeigta',
    scheduled: 'Plānota',
    showLess: 'Rādīt Mazāk',
    showDetails: 'Rādīt Detaļas',
    matchSummary: 'Spēles Kopsavilkums',

    // Sponsors Section
    ourSponsors: 'Mūsu Sponsori',
    sponsorsSubheading: 'Lepni partneri, kas atbalsta mūsu regbija kopienu',

    // Social Media
    followUs: 'Seko Mums',
    yourTeamHandle: '@your_rugby_team',

    // Training Programs
    viewProgram: 'Skatīt Programmu',
    programDetails: 'Programmas Detaļas',
    trainer: 'Treneris',
    weeks: 'nedēļas',
    difficulty: 'Grūtības Pakāpe',
    category: 'Kategorija',
    beginner: 'Iesācējs',
    intermediate: 'Vidējs',
    advanced: 'Augsts',

    // About Page
    aboutSubheading: 'Uzzini par mūsu vēsturi, misiju un komandu, kas to visu padara iespējamu',
    ourMission: 'Mūsu Misija',
    ourVision: 'Mūsu Vīzija',
    ourTeam: 'Mūsu Komanda',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Load saved language preference from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'lv')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    console.log('Setting language to:', lang);
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Debug logging for provider re-renders
  useEffect(() => {
    console.log('LanguageProvider: language changed to', language);
  }, [language]);

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage: handleSetLanguage, 
        translations: {
          ...translations[language],
          language
        }
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 