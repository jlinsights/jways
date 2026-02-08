import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, ChevronRight } from 'lucide-react';
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
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
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <a 
          href="#" 
          onClick={(e) => handleNavClick(e, '#')}
          className="flex items-center gap-2 group" 
          aria-label="Jways Home"
        >
          <div className="w-8 h-8 bg-jways-blue rounded-tr-xl rounded-bl-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">J</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Jways
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="px-4 py-2 text-sm font-medium text-slate-300 rounded-full transition-all duration-300 hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            className="text-slate-300 hover:text-white transition-colors"
            aria-label="Select Language"
          >
            <Globe size={20} />
          </button>
          <a
            href="#track"
            onClick={(e) => handleNavClick(e, '#track')}
            className="px-5 py-2.5 bg-white text-jways-navy rounded-full text-sm font-semibold hover:bg-jways-blue hover:text-white transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            화물 추적
            <ChevronRight size={16} />
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-jways-navy border-b border-white/10 overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-lg font-medium text-slate-300 hover:text-white"
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.label}
                </a>
              ))}
              <div className="h-px bg-white/10 w-full my-2" />
              <a
                href="#track"
                className="flex items-center justify-center w-full py-3 bg-jways-blue text-white rounded-lg font-semibold"
                onClick={(e) => handleNavClick(e, '#track')}
              >
                화물 추적하기
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;