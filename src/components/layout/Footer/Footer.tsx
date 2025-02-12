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
    <footer className="bg-card-bg-dark border-t border-gray-800/20">
      <div className="relative">
        <div className="container-width py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[rgb(0,170,150)]">{footerTranslations[language].quickLinks}</h3>
              <nav className="space-y-2">
                <Link 
                  href="/about" 
                  className="block text-gray-300 hover:text-[rgb(0,170,150)] transition-colors duration-200"
                >
                  {footerTranslations[language].aboutUs}
                </Link>
                <Link 
                  href="/team" 
                  className="block text-gray-300 hover:text-[rgb(0,170,150)] transition-colors duration-200"
                >
                  {footerTranslations[language].team}
                </Link>
                <Link 
                  href="/matches" 
                  className="block text-gray-300 hover:text-[rgb(0,170,150)] transition-colors duration-200"
                >
                  {footerTranslations[language].matches}
                </Link>
                <Link 
                  href="/contact" 
                  className="block text-gray-300 hover:text-[rgb(0,170,150)] transition-colors duration-200"
                >
                  {footerTranslations[language].contact}
                </Link>
              </nav>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[rgb(0,170,150)]">{footerTranslations[language].contactInfo.title}</h3>
              <div className="space-y-2">
                <p className="text-gray-300">
                  {footerTranslations[language].contactInfo.email}
                </p>
                <p className="text-gray-300">
                  {footerTranslations[language].contactInfo.phone}
                </p>
              </div>
            </div>

            {/* Social & Legal */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[rgb(0,170,150)]">{footerTranslations[language].followUs}</h3>
              <div className="flex space-x-4 mb-6">
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-[rgb(0,170,150)] transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <Facebook size={24} />
                </a>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-[rgb(0,170,150)] transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <Instagram size={24} />
                </a>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-[rgb(0,170,150)] transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <Twitter size={24} />
                </a>
              </div>
              <div className="text-sm">
                <Link 
                  href="/privacy-policy" 
                  className="text-gray-400 hover:text-[rgb(0,170,150)] transition-colors duration-200"
                >
                  {footerTranslations[language].privacyPolicy}
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800/20">
            <p className="text-sm text-gray-500">© {currentYear} Rugby Club. {footerTranslations[language].allRightsReserved}</p>
          </div>
        </div>
      </div>
    </footer>
  );
} 
