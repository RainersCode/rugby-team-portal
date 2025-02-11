'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card-bg-dark border-t border-gray-800/20">
      <div className="relative">
        <div className="container-width py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-rugby-yellow">Quick Links</h3>
              <nav className="space-y-2">
                <Link 
                  href="/about" 
                  className="block text-gray-300 hover:text-rugby-yellow transition-colors duration-200"
                >
                  About Us
                </Link>
                <Link 
                  href="/team" 
                  className="block text-gray-300 hover:text-rugby-yellow transition-colors duration-200"
                >
                  Team
                </Link>
                <Link 
                  href="/matches" 
                  className="block text-gray-300 hover:text-rugby-yellow transition-colors duration-200"
                >
                  Matches
                </Link>
                <Link 
                  href="/contact" 
                  className="block text-gray-300 hover:text-rugby-yellow transition-colors duration-200"
                >
                  Contact
                </Link>
              </nav>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-rugby-yellow">Contact</h3>
              <div className="space-y-2">
                <p className="text-gray-300">
                  Email: info@regbijalapa.lv
                </p>
                <p className="text-gray-300">
                  Phone: +371 123 456 789
                </p>
              </div>
            </div>

            {/* Social & Legal */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-rugby-yellow">Follow Us</h3>
              <div className="flex space-x-4 mb-6">
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-rugby-yellow transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <Facebook size={24} />
                </a>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-rugby-yellow transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <Instagram size={24} />
                </a>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-rugby-yellow transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <Twitter size={24} />
                </a>
              </div>
              <div className="text-sm">
                <Link 
                  href="/privacy-policy" 
                  className="text-gray-400 hover:text-rugby-yellow transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800/20 text-center">
            <p className="text-sm text-gray-500">© {currentYear} Rugby Club. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
} 
