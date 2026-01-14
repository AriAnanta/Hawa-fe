import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

export default function SplashScreen({ onComplete, isFading = false }) {
  const containerRef = useRef(null);
  const [logoScale, setLogoScale] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [splashOpacity, setSplashOpacity] = useState(1);

  // Reset animasi saat komponen mount
  useEffect(() => {
    // Force reflow untuk reset animasi CSS
    if (containerRef.current) {
      const container = containerRef.current;
      // Reset semua child elements
      const animatedElements = container.querySelectorAll('[class*="animate-"]');
      animatedElements.forEach((el) => {
        const element = el;
        element.style.animation = 'none';
        // Trigger reflow
        void element.offsetHeight;
        element.style.animation = '';
      });
    }
  }, []);

  useEffect(() => {
    // Logo scale animation
    const scaleTimer = setTimeout(() => {
      setLogoScale(1);
    }, 100);

    // Opacity fade in
    const opacityTimer = setTimeout(() => {
      setOpacity(1);
    }, 200);

    // Hide splash screen after 2.5 seconds
    const hideTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2500);

    return () => {
      clearTimeout(scaleTimer);
      clearTimeout(opacityTimer);
      clearTimeout(hideTimer);
    };
  }, [onComplete]);

  useEffect(() => {
    if (isFading) {
      setSplashOpacity(0);
    }
  }, [isFading]);

  return (
    <div 
      className="w-full h-full flex items-center justify-center transition-opacity duration-700 ease-in-out"
      style={{ 
        opacity: splashOpacity
      }}
    >
      {/* Animated Background Elements */}
      <div ref={containerRef} className="absolute inset-0 overflow-hidden" style={{ willChange: 'transform' }}>
        {/* Wind Particles */}
        {[...Array(30)].map((_, i) => {
          const size = 1 + (i % 3) * 0.5;
          return (
            <div
              key={`particle-${i}`}
              className="absolute rounded-full bg-white animate-wind-particle-enhanced"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${(i * 3.3) % 100}%`,
                top: `${(i * 3.5) % 100}%`,
                opacity: 0.2 + (i % 3) * 0.15,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${8 + (i % 5) * 1.5}s`,
                boxShadow: `0 0 ${size * 2}px rgba(255, 255, 255, 0.5)`
              }}
            ></div>
          );
        })}

        {/* Wind Swirls */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`swirl-${i}`}
            className="absolute animate-wind-swirl"
            style={{
              left: `${(i * 16) % 100}%`,
              top: `${(i * 15) % 100}%`,
              width: '150px',
              height: '150px',
              border: `2px solid rgba(255, 255, 255, ${0.08 + (i % 2) * 0.03})`,
              borderRadius: '50%',
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${10 + (i % 3) * 2}s`,
              transform: `rotate(${i * 60}deg)`
            }}
          ></div>
        ))}
      </div>

      {/* Logo and Content */}
      <div 
        className="relative z-10 flex flex-col items-center justify-center"
        style={{
          opacity: opacity,
          transform: `scale(${logoScale})`,
          transition: 'opacity 0.6s ease-out, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {/* Logo */}
        <div className="mb-4 sm:mb-6 relative">
          <img 
            src="/logo_hawa_fix.png" 
            alt="HAWA Logo" 
            className="h-12 sm:h-16 md:h-20 w-auto object-contain drop-shadow-2xl"
          />
          {/* Glow effect */}
          <div className="absolute inset-0 bg-white/20 blur-xl sm:blur-2xl rounded-full -z-10 animate-pulse"></div>
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3 sm:mb-4 drop-shadow-lg">
          HAWA
        </h1>

        {/* Tagline */}
        <p className="text-white/90 text-sm sm:text-base md:text-lg font-medium mb-6 sm:mb-8 drop-shadow-md px-4 text-center">
          Melindungi Keluarga dari Polusi Udara
        </p>

        {/* Loading Indicator */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <div 
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: '0s', animationDuration: '1s' }}
          ></div>
          <div 
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: '0.2s', animationDuration: '1s' }}
          ></div>
          <div 
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: '0.4s', animationDuration: '1s' }}
          ></div>
        </div>
      </div>
    </div>
  );
}

SplashScreen.propTypes = {
  onComplete: PropTypes.func,
  isFading: PropTypes.bool
};

