import { useEffect, useRef, useState } from 'react';

/**
 * Hook for staggered reveal animation using Intersection Observer
 * Triggers reveal animation when element comes into viewport
 */
export const useReveal = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.1,
      ...options
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return { ref, isVisible };
};

/**
 * Hook for parallax scroll effect
 * Creates subtle vertical parallax movement based on scroll position
 */
export const useParallax = (speed = 0.5) => {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const element = ref.current;
        const elementTop = element.getBoundingClientRect().top;
        const elementHeight = element.clientHeight;

        // Only calculate parallax when element is in viewport
        if (elementTop < window.innerHeight && elementTop + elementHeight > 0) {
          const scrollPercentage = (window.innerHeight - elementTop) / (window.innerHeight + elementHeight);
          setOffset(scrollPercentage * 100 * speed);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { ref, offset, style: { transform: `translateY(${offset}px)` } };
};

/**
 * Hook for 3D tilt effect on mouse move
 * Creates damped 3D perspective rotation based on mouse position
 */
export const useTilt = () => {
  const ref = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const dampingFactor = 0.1; // Smoothing factor for damped effect

  const handleMouseMove = (e) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (e.clientY - centerY) / 10;
    const y = -(e.clientX - centerX) / 10;

    // Apply damping for smooth transition
    setRotation(prev => ({
      x: prev.x + (x - prev.x) * dampingFactor,
      y: prev.y + (y - prev.y) * dampingFactor
    }));
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return {
    ref,
    style: {
      transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
      transition: 'transform 0.1s ease-out'
    }
  };
};

/**
 * Hook for image zoom effect on hover
 */
export const useZoomOnHover = () => {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  return {
    ref,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    style: {
      transform: isHovered ? 'scale(1.12)' : 'scale(1)',
      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
    }
  };
};
