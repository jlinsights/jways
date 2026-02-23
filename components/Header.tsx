import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Globe, ChevronRight, Sun, Moon } from 'lucide-react';
import { NavItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const navItems: NavItem[] = [
  { label: '서비스', href: '#services' },
  { label: '회사소개', href: '#about' },
  { label: '솔루션', href: '#solutions' },
  { label: '고객지원', href: '#contact' },
];

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMobileLangMenuOpen, setIsMobileLangMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Initialize theme
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Only prevent default and handle scrolling for hash links or root
    if (href.startsWith('#') || href === '/') {
      e.preventDefault();
      setIsMobileMenuOpen(false);

      if (href === '#' || href === '/') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        return;
      }

      // Handle hash links
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        window.scrollTo({
          top: offsetPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
        
        // Move focus to the element for accessibility
        element.focus({ preventScroll: true });
      }
    } else {
      // For external links or other pages, just close the menu
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gradient-to-r from-jways-navy/95 to-slate-800/90 backdrop-blur-md border-b border-white/10 py-4 shadow-lg' 
          : 'bg-transparent py-6'
      }`}
    >
      {/* Skip Link for Keyboard Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[60] px-4 py-2 bg-jways-blue text-white rounded-lg font-bold shadow-lg"
      >
        Skip to content
      </a>

      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <a 
          href="#" 
          onClick={(e) => handleNavClick(e, '#')}
          className="flex items-center gap-2 group rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-jways-blue focus-visible:ring-offset-2 focus-visible:ring-offset-jways-navy" 
          aria-label="Jways Home"
        >
          <div className="w-8 h-8 bg-jways-blue rounded-tr-xl rounded-bl-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg" aria-hidden="true">J</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Jways
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:block" aria-label="Main Navigation">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="px-4 py-2 text-sm font-medium text-slate-300 rounded-full transition-all duration-300 hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-jways-blue"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, '#contact')}
            className="px-4 py-2 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/10 transition-all"
          >
            Contact Us
          </a>
          <Link
            to="/dashboard"
            className="px-4 py-2 text-sm font-medium text-white border border-jways-blue bg-jways-blue/20 rounded-full hover:bg-jways-blue transition-all"
          >
            화주 포털
          </Link>
          <a
            href="#track"
            onClick={(e) => handleNavClick(e, '#track')}
            className="px-5 py-2.5 bg-white text-jways-navy rounded-full text-sm font-semibold hover:bg-jways-blue hover:text-white transition-all flex items-center gap-2 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-jways-blue focus-visible:ring-offset-2 focus-visible:ring-offset-jways-navy"
          >
            화물 추적
            <ChevronRight size={16} aria-hidden="true" />
          </a>
          <div className="relative">
            <button 
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-jways-blue"
              aria-label="Select Language"
              aria-expanded={isLangMenuOpen}
            >
              <Globe size={20} aria-hidden="true" />
              <span className="text-sm font-medium">{language === 'ko' ? 'KR' : 'EN'}</span>
            </button>
            <AnimatePresence>
              {isLangMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[60]"
                >
                  <button
                    onClick={() => { setLanguage('ko'); setIsLangMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${language === 'ko' ? 'text-jways-blue font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    한국어
                  </button>
                  <button
                    onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${language === 'en' ? 'text-jways-blue font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    English
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={toggleTheme}
            className="text-slate-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-jways-blue"
            aria-label={theme === 'light' ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === 'light' ? <Moon size={20} aria-hidden="true" /> : <Sun size={20} aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 md:hidden">
            <div className="relative">
              <button 
                onClick={() => setIsMobileLangMenuOpen(!isMobileLangMenuOpen)}
                className="flex items-center gap-1 text-white p-2 rounded-lg hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-jways-blue"
                aria-label="Select Language"
                aria-expanded={isMobileLangMenuOpen}
              >
                <Globe size={20} aria-hidden="true" />
                <span className="text-sm font-medium">{language === 'ko' ? 'KR' : 'EN'}</span>
              </button>
              <AnimatePresence>
                {isMobileLangMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[60]"
                  >
                    <button
                      onClick={() => { setLanguage('ko'); setIsMobileLangMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${language === 'ko' ? 'text-jways-blue font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      한국어
                    </button>
                    <button
                      onClick={() => { setLanguage('en'); setIsMobileLangMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${language === 'en' ? 'text-jways-blue font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      English
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
            className="text-white p-2 rounded-lg hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-jways-blue"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            >
            {isMobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
            <button 
                onClick={toggleTheme}
                className="text-white p-2 rounded-lg hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-jways-blue"
                aria-label={theme === 'light' ? "Switch to dark mode" : "Switch to light mode"}
            >
                {theme === 'light' ? <Moon size={20} aria-hidden="true" /> : <Sun size={20} aria-hidden="true" />}
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-jways-navy border-b border-white/10 overflow-hidden"
          >
            <nav className="px-6 py-8 flex flex-col gap-6" aria-label="Mobile Navigation">
              <ul className="flex flex-col gap-6">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-lg font-medium text-slate-300 hover:text-white block focus:outline-none focus-visible:text-jways-blue"
                      onClick={(e) => handleNavClick(e, item.href)}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="h-px bg-white/10 w-full my-2" aria-hidden="true" />
              <Link
                to="/dashboard"
                className="flex items-center justify-center w-full py-3 bg-white/10 text-white rounded-lg font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-jways-navy mb-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                화주 전용 포털
              </Link>
              <a
                href="#track"
                className="flex items-center justify-center w-full py-3 bg-jways-blue text-white rounded-lg font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-jways-navy"
                onClick={(e) => handleNavClick(e, '#track')}
              >
                화물 추적하기
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;