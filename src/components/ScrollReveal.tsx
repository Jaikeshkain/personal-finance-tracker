'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.05,
      rootMargin: '0px 0px -40px 0px'
    });

    const current = domRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, []);

  const getDirectionClass = () => {
    switch (direction) {
      case 'down': return 'translate-y-[-20px]';
      case 'left': return 'translate-x-[20px]';
      case 'right': return 'translate-x-[-20px]';
      case 'up':
      default:
        return 'translate-y-[20px]';
    }
  };

  return (
    <div
      ref={domRef}
      className={`transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
        isVisible 
          ? 'opacity-100 translate-y-0 translate-x-0 scale-100' 
          : `opacity-0 ${getDirectionClass()} scale-[0.98]`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
