'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="w-9 h-9 rounded-lg bg-card-bg-light dark:bg-card-bg-dark flex items-center justify-center">
        <span className="sr-only">Toggle theme</span>
        <Sun className="h-5 w-5 text-gray-medium rotate-0 scale-100 transition-all" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 rounded-lg bg-card-bg-light dark:bg-card-bg-dark flex items-center justify-center hover:bg-gray-light dark:hover:bg-gray-dark transition-colors"
    >
      <span className="sr-only">Toggle theme</span>
      <Sun className="h-5 w-5 text-content-light rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 text-content-light rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  );
} 