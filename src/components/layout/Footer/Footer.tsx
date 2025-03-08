'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { useLanguage } from "@/context/LanguageContext";

const footerTranslations = {
  en: {
    quickLinks: "Quick Links",
    aboutUs: "About Us",
    team: "Team",
    matches: "Matches",
    contact: "Contact",
    contactInfo: {
      title: "Contact",
      email: "Email: info@regbijalapa.lv",
      phone: "Phone: +371 123 456 789"
    },
    followUs: "Follow Us",
    privacyPolicy: "Privacy Policy",
    allRightsReserved: "All rights reserved."
  },
  lv: {
    quickLinks: "Ātrās Saites",
    aboutUs: "Par Mums",
    team: "Komanda",
    matches: "Spēles",
    contact: "Kontakti",
    contactInfo: {
      title: "Kontakti",
      email: "E-pasts: info@regbijalapa.lv",
      phone: "Tālrunis: +371 123 456 789"
    },
    followUs: "Seko Mums",
    privacyPolicy: "Privātuma Politika",
    allRightsReserved: "Visas tiesības aizsargātas."
  }
};

export default function Footer() {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-rugby-teal text-white">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20"></div>
      
      <div className="container-width py-16 px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Quick Links */}
          <div className="bg-rugby-teal/30 p-6 rounded-none shadow-md">
            <h3 className="text-xl font-semibold mb-6 text-white border-b border-white/20 pb-2">
              {footerTranslations[language].quickLinks}
            </h3>
            <nav className="space-y-3">
              <Link 
                href="/about" 
                className="block text-gray-100 hover:text-white/80 transition-all duration-300"
              >
                {footerTranslations[language].aboutUs}
              </Link>
              <Link 
                href="/team" 
                className="block text-gray-100 hover:text-white/80 transition-all duration-300"
              >
                {footerTranslations[language].team}
              </Link>
              <Link 
                href="/matches" 
                className="block text-gray-100 hover:text-white/80 transition-all duration-300"
              >
                {footerTranslations[language].matches}
              </Link>
              <Link 
                href="/contact" 
                className="block text-gray-100 hover:text-white/80 transition-all duration-300"
              >
                {footerTranslations[language].contact}
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="bg-rugby-teal/30 p-6 rounded-none shadow-md">
            <h3 className="text-xl font-semibold mb-6 text-white border-b border-white/20 pb-2">
              {footerTranslations[language].contactInfo.title}
            </h3>
            <div className="space-y-4">
              <p className="text-gray-100 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white/80" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {footerTranslations[language].contactInfo.email}
              </p>
              <p className="text-gray-100 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white/80" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {footerTranslations[language].contactInfo.phone}
              </p>
            </div>
          </div>

          {/* Social & Legal */}
          <div className="bg-rugby-teal/30 p-6 rounded-none shadow-md">
            <h3 className="text-xl font-semibold mb-6 text-white border-b border-white/20 pb-2">
              {footerTranslations[language].followUs}
            </h3>
            <div className="flex space-x-4 mb-8">
              <a 
                href="#" 
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-none transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="#" 
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-none transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="#" 
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-none transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
            </div>
            <div className="text-sm">
              <Link 
                href="/privacy-policy" 
                className="inline-block bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-none transition-all duration-300"
              >
                {footerTranslations[language].privacyPolicy}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-white/20 text-center">
          <p className="text-sm text-gray-300">© {currentYear} Rugby Club. {footerTranslations[language].allRightsReserved}</p>
        </div>
      </div>
    </footer>
  );
} 
