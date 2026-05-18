import React from 'react';
import { useParallax } from '../../hooks/useReveal';

/**
 * Parallax Image Component
 */
export const ParallaxImage = ({
  src,
  alt,
  speed = 0.5,
  className = ''
}) => {
  const { ref, style } = useParallax(speed);

  return (
    <div
      ref={ref}
      className={`overflow-hidden ${className}`}
      style={style}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

/**
 * Parallax Section Component - For background images
 */
export const ParallaxSection = ({
  src,
  children,
  className = '',
  speed = 0.3,
  height = 'h-screen'
}) => {
  const { ref, offset } = useParallax(speed);

  return (
    <div
      ref={ref}
      className={`relative ${height} overflow-hidden ${className}`}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        transform: `translateY(${offset}px)`
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ParallaxImage;
