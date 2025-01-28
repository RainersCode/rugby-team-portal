'use client';

import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const footerLinks = {
    club: [
      { label: 'About Us', href: '/club/about' },
      { label: 'History', href: '/club/history' },
      { label: 'Contact', href: '/club/contact' },
      { label: 'Partners', href: '/club/partners' },
    ],
    team: [
      { label: 'Players', href: '/team/players' },
      { label: 'Staff', href: '/team/staff' },
      { label: 'Academy', href: '/team/academy' },
      { label: 'Youth', href: '/team/youth' },
    ],
    fans: [
      { label: 'Membership', href: '/fans/membership' },
      { label: 'Tickets', href: '/fans/tickets' },
      { label: 'Shop', href: '/shop' },
      { label: 'Newsletter', href: '/fans/newsletter' },
    ],
  };

  return (
    <footer className="w-full bg-card-bg-light dark:bg-card-bg-dark border-t border-gray-200 dark:border-gray-800 py-12">
      <div className="container-width">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Social Links */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-bold text-content-light dark:text-content-dark">
              Rugby Team
            </Link>
            <div className="flex space-x-4">
              <Link href="#" className="text-content-medium dark:text-content-medium hover:text-primary-blue dark:hover:text-accent-blue transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-content-medium dark:text-content-medium hover:text-primary-blue dark:hover:text-accent-blue transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-content-medium dark:text-content-medium hover:text-primary-blue dark:hover:text-accent-blue transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-content-medium dark:text-content-medium hover:text-primary-blue dark:hover:text-accent-blue transition-colors">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h3 className="text-lg font-semibold text-content-light dark:text-content-dark capitalize">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-content-medium dark:text-content-medium hover:text-primary-blue dark:hover:text-accent-blue transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-content-medium dark:text-content-medium">
            © {new Date().getFullYear()} Rugby Team. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
