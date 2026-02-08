import React, { ReactNode, forwardRef } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  bg?: 'dark' | 'light' | 'image';
}

const Section = forwardRef<HTMLElement, SectionProps>(({ children, className = '', id, bg = 'dark' }, ref) => {
  let bgClass = 'bg-jways-navy text-white';
  
  if (bg === 'light') {
    bgClass = 'bg-white text-slate-900';
  } else if (bg === 'image') {
    bgClass = 'bg-transparent text-white relative';
  }

  return (
    <section ref={ref} id={id} className={`py-20 md:py-32 px-6 md:px-12 lg:px-24 overflow-hidden ${bgClass} ${className}`}>
      {children}
    </section>
  );
});

Section.displayName = 'Section';

export default Section;