import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, Upload, Menu, X, Building2, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/auth/LoginModal';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import PublicationsTable from '../components/data/PublicationsTable';
import Footer from '../components/common/Footer';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const Home = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerRef = useRef(null);
  const heroBgRef = useRef(null);
  const videoRef = useRef(null);
  const headerRef = useRef(null);
  const overlayRef = useRef(null);
  const blurOverlayRef = useRef(null);
  const heroSectionRef = useRef(null);
  const tableSectionRef = useRef(null);
  const flipWrapperRef = useRef(null);
  const heroCardRef = useRef(null);
  const tableCardRef = useRef(null);
  const flipSceneRef = useRef(null);

  const { logout, isAuthenticated, isAnyAdmin } = useAuth();
  const navigate = useNavigate();

  const handleGoExplore = () => {
    const st = ScrollTrigger.getById('flip-trigger');
    if (st && !isMobile) {
      gsap.to(window, {
        scrollTo: st.end,
        duration: 1,
        ease: 'power2.inOut'
      });
    } else {
      const target = document.getElementById('patents-table');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  useGSAP(() => {

    /* ══════════════════════════════════════════════════
       PART 1 — CINEMATIC ENTRANCE ANIMATION
    ══════════════════════════════════════════════════ */
    const entryTl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    gsap.set(headerRef.current, { yPercent: -110, opacity: 0 });
    gsap.set(blurOverlayRef.current, { opacity: 1 });
    gsap.set('.hero-line', { y: 60, opacity: 0 });
    gsap.set('.hero-badge', { y: 30, opacity: 0, scale: 0.9 });
    gsap.set('.hero-cta', { x: -50, opacity: 0 });
    if (document.querySelector('.hero-cta-secondary')) {
      gsap.set('.hero-cta-secondary', { x: 50, opacity: 0 });
    }
    gsap.set('.floating-card', { y: 40, opacity: 0 });

    // Ken Burns zoom
    entryTl.to(heroBgRef.current, { scale: 1.06, duration: 8, ease: 'none' }, 0);

    // Sharpen reveal (blur fades away)
    entryTl.to(blurOverlayRef.current, { opacity: 0, duration: 1.4, ease: 'power2.inOut' }, 0.3);

    // Header slides down with bounce
    entryTl.to(headerRef.current, { yPercent: 0, opacity: 1, duration: 1, ease: 'back.out(1.4)' }, 0.8);

    // Badge pops in
    entryTl.to('.hero-badge', { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }, 1.4);

    // Headline lines stagger up
    entryTl.to('.hero-line', { y: 0, opacity: 1, duration: 0.9, stagger: 0.18, ease: 'expo.out' }, 1.8);

    // CTAs slide from opposite sides
    entryTl.to('.hero-cta', { x: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.3)' }, 2.8);
    if (document.querySelector('.hero-cta-secondary')) {
      entryTl.to('.hero-cta-secondary', { x: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.3)' }, 2.95);
    }

    // Stat cards stagger up
    entryTl.to('.floating-card', { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'expo.out' }, 3.1);

    // Looping glow pulse on primary CTA
    gsap.to('.cta-glow', {
      opacity: 0.6, scale: 1.08, duration: 1.8,
      repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 3.5,
    });

    // Subtle float on stat cards
    gsap.to('.floating-card', {
      y: -6, duration: 3, repeat: -1, yoyo: true,
      ease: 'sine.inOut', stagger: 0.5, delay: 4,
    });

    /* ══════════════════════════════════════════════════
       PART 2 — SCROLL-TRIGGERED 3D FLIP TRANSITION
       
       Layout:
         flipWrapper  → pinned by ScrollTrigger
         flipScene    → has perspective; contains two cards
         heroCard     → FACE  (rotateX: 0 initially)
         tableCard    → BACK  (rotateX: -180 initially, hidden)
       
       On scroll:
         1. heroCard rotates -90° (exits) with slight scale-down
         2. Scene drifts upward slightly (swipe-up feel)
         3. tableCard rotates from 180° → 0° (enters)
         4. Table content reveals with stagger
    ══════════════════════════════════════════════════ */

    if (isMobile) {
      // Clear 3D flip card styles so they stack naturally in HTML flow on mobile devices
      gsap.set(heroCardRef.current, { clearProps: 'all' });
      gsap.set(tableCardRef.current, { clearProps: 'all' });
      gsap.set('.table-reveal', { clearProps: 'all' });
      return;
    }

    // Initial 3D card states — VERTICAL flip uses rotateX
    // heroCard  starts flat (rotateX: 0)
    // tableCard starts flipped upward behind (rotateX: -180)
    gsap.set(heroCardRef.current, { rotateX: 0, transformOrigin: 'center center', visibility: 'visible', opacity: 1 });
    gsap.set(tableCardRef.current, { rotateX: -180, transformOrigin: 'center center', visibility: 'hidden', opacity: 0 });
    // Perspective on the scene for depth
    gsap.set(flipSceneRef.current, { perspective: 1200 });

    const flipTl = gsap.timeline({
      scrollTrigger: {
        id: 'flip-trigger',
        trigger: flipWrapperRef.current,
        start: 'top top',
        end: '+=40%',         // ← tiny scroll = full flip in one small wheel tick
        scrub: 0.2,           // ← almost zero lag; sticks right to scroll
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (self.progress > 0.5) {
            gsap.set(heroCardRef.current, { pointerEvents: 'none', visibility: 'hidden', opacity: 0 });
            gsap.set(tableCardRef.current, { pointerEvents: 'auto', visibility: 'visible', opacity: 1 });
          } else {
            gsap.set(heroCardRef.current, { pointerEvents: 'auto', visibility: 'visible', opacity: 1 });
            gsap.set(tableCardRef.current, { pointerEvents: 'none', visibility: 'hidden', opacity: 0 });
          }
        }
      },
    });

    // Synchronous 3D flip card rotation in perfect unison
    flipTl.to(heroCardRef.current, {
      rotateX: 180,
      duration: 0.8,
      ease: 'none',
    }, 0);

    flipTl.to(tableCardRef.current, {
      rotateX: 0,
      duration: 0.8,
      ease: 'none',
    }, 0);

    // Table content snaps in right as card lands
    flipTl.from('.table-reveal', {
      y: 10,
      opacity: 0,
      stagger: 0.015,
      duration: 0.15,
      ease: 'power2.out',
    }, 0.70);

  }, { scope: containerRef, dependencies: [isMobile] });

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-[#f4f4f0]">

      {/* ─────────────────── HEADER ─────────────────── */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
          ? 'bg-white border-b border-[#b20e0e]/10 shadow-sm shadow-[#b20e0e]/5'
          : 'bg-transparent border-transparent'
          }`}
      >
        <div className="w-full py-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 md:w-11 md:h-11 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center p-1 transition-transform group-hover:scale-105 duration-300 group-hover:shadow-md group-hover:shadow-[#b20e0e]/10">
                <img src="/NRI-logo.png" alt="NRI Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className={`font-black text-sm md:text-base leading-tight tracking-tight transition-colors duration-300 ${scrolled ? 'text-[#1a1a1a]' : 'text-white drop-shadow-sm'
                  }`}>
                  Dr. RVR NRI INSTITUTE
                </span>
                <span className="text-[#ff6b6b] text-[10px] font-bold uppercase tracking-[0.2em]">
                  Patents &amp; Publications
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {isAnyAdmin() && (
                    <Link
                      to="/admin-dashboard"
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${scrolled
                        ? 'text-slate-600 hover:text-[#b20e0e] hover:bg-[#b20e0e]/5'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      <Building2 size={15} />
                      <span>Admin</span>
                    </Link>
                  )}
                  <Link
                    to="/upload"
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#b20e0e] hover:bg-[#8a0a0a] text-white text-sm font-bold rounded-lg transition-all duration-300 shadow-md shadow-[#b20e0e]/30 hover:shadow-lg hover:shadow-[#b20e0e]/40 hover:-translate-y-0.5"
                  >
                    <Upload size={14} />
                    <span>Submit Patent</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`p-2.5 rounded-lg transition-all duration-200 ml-1 ${scrolled
                      ? 'text-slate-400 hover:text-[#b20e0e] hover:bg-[#b20e0e]/5'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    title="Logout"
                    aria-label="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#b20e0e] hover:bg-[#8a0a0a] text-white text-sm font-bold rounded-lg transition-all duration-300 shadow-md shadow-[#b20e0e]/30 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <LogIn size={15} />
                  <span>Login</span>
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                className={`p-2 rounded-lg transition-colors ${scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/10'
                  }`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 w-full bg-white border-b border-[#b20e0e]/10 shadow-xl md:hidden overflow-hidden"
            >
              <div className="p-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    {isAnyAdmin() && (
                      <Link
                        to="/admin-dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold"
                      >
                        <Building2 size={18} /> Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/upload"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 bg-[#b20e0e] text-white rounded-xl font-bold"
                    >
                      <Upload size={18} /> Submit Patent
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full p-3 text-[#b20e0e] hover:bg-[#b20e0e]/5 rounded-xl font-semibold"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setIsLoginOpen(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-3 w-full p-3 bg-[#b20e0e] text-white rounded-xl font-bold"
                  >
                    <LogIn size={18} /> Login
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─────────────────── MAIN ─────────────────── */}
      <main className="flex-grow">

        {/*
          ╔══════════════════════════════════════════╗
          ║  FLIP WRAPPER — pinned by ScrollTrigger  ║
          ║  Vertical flip (like a page turn):       ║
          ║    heroCard  (face)  → rotateX: 0        ║
          ║    tableCard (back)  → rotateX: -180     ║
          ╚══════════════════════════════════════════╝
        */}
        <div
          ref={flipWrapperRef}
          className={isMobile ? "relative w-full" : "relative w-full overflow-hidden"}
          style={{ height: isMobile ? 'auto' : '100vh' }}
        >
          {/* ── Mid-flip background — NRI logo fills the entire viewport as bg ── */}
          <div
            className={isMobile ? "hidden" : "absolute inset-0 z-0 overflow-hidden"}
            style={{ background: '#f4f4f0' }}
          >
            {/* NRI Logo as a giant centered background watermark */}
            <img
              src="/NRI-logo.png"
              alt=""
              aria-hidden="true"
              className="absolute select-none pointer-events-none"
              style={{
                width: '70vw',
                maxWidth: '700px',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.12,
                filter: 'grayscale(30%) blur(0px)',
                objectFit: 'contain',
              }}
            />
            {/* Subtle radial vignette so edges stay clean */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(244,244,240,0.85) 100%)',
              }}
            />
          </div>

          {/* 3D perspective scene */}
          <div
            ref={flipSceneRef}
            className={isMobile ? "relative w-full h-auto flex flex-col bg-[#f4f4f0]" : "relative w-full h-full"}
            style={isMobile ? {} : { transformStyle: 'preserve-3d', willChange: 'transform' }}
          >

            {/* ════════ FACE — HERO VIDEO ════════ */}
            <div
              ref={heroCardRef}
              className={isMobile ? "relative w-full h-screen" : "absolute inset-0 w-full h-full"}
              style={isMobile ? {} : {
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
                willChange: 'transform',
              }}
            >
              <section
                ref={heroSectionRef}
                className="relative w-full h-full flex items-center pt-24 sm:pt-0 overflow-hidden"
              >
                {/* ── Video BG ── */}
                <div
                  ref={heroBgRef}
                  className="absolute inset-0 z-0 will-change-transform origin-center"
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ filter: 'brightness(0.75) saturate(1.1)' }}
                  >
                    <source src="/college_video.mp4" type="video/mp4" />
                    <source
                      src="https://assets.mixkit.co/videos/preview/mixkit-university-campus-near-a-lake-aerial-shot-42609-large.mp4"
                      type="video/mp4"
                    />
                  </video>

                  {/* Blur overlay (fades on entrance) */}
                  <div
                    ref={blurOverlayRef}
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{
                      backdropFilter: 'blur(18px)',
                      WebkitBackdropFilter: 'blur(18px)',
                      background: 'rgba(10,10,20,0.55)',
                    }}
                  />

                  {/* Gradient overlay */}
                  <div
                    ref={overlayRef}
                    className="absolute inset-0 z-20 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 50%, rgba(20,20,20,0.75) 100%)',
                    }}
                  />

                  {/* Vignette */}
                  <div
                    className="absolute inset-0 z-20 pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
                    }}
                  />
                </div>

                {/* ── Hero Content ── */}
                <div className="container mx-auto px-4 relative z-30 pt-16 sm:pt-24 pb-12 sm:pb-16">
                  <div className="max-w-5xl mx-auto text-center">

                    {/* Badge */}
                    <div
                      className="hero-badge inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 sm:mb-10"
                      style={{
                        background: 'rgba(178,14,14,0.18)',
                        border: '1px solid rgba(178,14,14,0.4)',
                        backdropFilter: 'blur(12px)',
                      }}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#ff4d4d] animate-pulse" />
                      <span className="text-[#ffaaaa] text-xs font-black uppercase tracking-widest">
                        Official Research Portal
                      </span>
                    </div>

                    {/* Headline (each line is independently animated) */}
                    <div className="mb-6 sm:mb-10 overflow-hidden">
                      <h1 className="font-black tracking-tighter leading-none">
                        <div
                          className="hero-line text-4xl sm:text-7xl lg:text-[88px] text-white mb-1 drop-shadow-2xl font-black"
                          style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
                        >
                          Explore Our
                        </div>
                        <div
                          className="hero-line text-4xl sm:text-7xl lg:text-[88px] mb-2 font-black"
                          style={{
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ff4444 40%, #ffb347 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            filter: 'drop-shadow(0 4px 24px rgba(178,14,14,0.5))',
                          }}
                        >
                          Innovations
                        </div>
                        <div
                          className="hero-line text-xl sm:text-4xl lg:text-5xl text-white/80 font-bold mt-1 sm:mt-0"
                          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)', letterSpacing: '-0.02em' }}
                        >
                          &amp; Find Your Research Legacy
                        </div>
                      </h1>
                    </div>

                    {/* Sub-description */}
                    <p
                      className="hero-line text-xs sm:text-base md:text-lg text-white/65 mb-8 sm:mb-14 max-w-2xl mx-auto leading-relaxed font-medium"
                      style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
                    >
                      Explore the extensive catalog of patents, publications, and research
                      breakthroughs achieved by the faculty at Dr. RVR NRI Institute of Technology.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 sm:mb-20">
                      <div className="relative hero-cta">
                        <div
                          className="cta-glow absolute inset-0 rounded-2xl blur-xl pointer-events-none"
                          style={{ background: '#b20e0e', opacity: 0.4 }}
                        />
                        <button
                          onClick={handleGoExplore}
                          className="relative w-full sm:w-auto px-10 py-5 text-white rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
                          style={{
                            background: 'linear-gradient(135deg, #b20e0e 0%, #d41515 100%)',
                            boxShadow:
                              '0 8px 32px rgba(178,14,14,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
                            letterSpacing: '0.05em',
                          }}
                        >
                          <Search size={20} />
                          GO EXPLORE!
                        </button>
                      </div>

                      {!isAuthenticated && (
                        <div className="relative hero-cta-secondary">
                          <button
                            onClick={() => setIsLoginOpen(true)}
                            className="w-full sm:w-auto px-10 py-5 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:bg-white/20"
                            style={{
                              background: 'rgba(255,255,255,0.1)',
                              border: '1.5px solid rgba(255,255,255,0.25)',
                              backdropFilter: 'blur(16px)',
                              boxShadow:
                                '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                            }}
                          >
                            <LogIn size={20} />
                            Faculty Login
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Floating Stat Cards */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      {[
                        { value: '200+', label: 'Patents Filed' },
                        { value: '500+', label: 'Publications' },
                        { value: '80+', label: 'Faculty Researchers' },
                        { value: '15+', label: 'Years of Research' },
                      ].map((stat, i) => (
                        <div
                          key={i}
                          className="floating-card px-6 py-4 rounded-2xl text-center"
                          style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                          }}
                        >
                          <div
                            className="text-2xl font-black text-white"
                            style={{ textShadow: '0 0 20px rgba(255,100,100,0.5)' }}
                          >
                            {stat.value}
                          </div>
                          <div className="text-white/55 text-xs font-semibold uppercase tracking-wider mt-0.5">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scroll cue */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
                  <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
                    Scroll to flip
                  </span>
                  {/* Animated flip icon */}
                  <svg
                    className="animate-bounce"
                    width="24" height="24" viewBox="0 0 24 24"
                    fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"
                  >
                    <path d="M7 10l5 5 5-5" />
                    <path d="M7 15l5 5 5-5" />
                  </svg>
                </div>

                {/* Edge shadow to sell the card feel */}
                <div
                  className="absolute inset-0 z-40 pointer-events-none rounded-none"
                  style={{
                    boxShadow: 'inset 0 -60px 80px -20px rgba(0,0,0,0.5)',
                  }}
                />
              </section>
            </div>
            {/* ════════ END FACE ════════ */}


            {/* ════════ BACK — PUBLICATIONS TABLE ════════ */}
            <div
              ref={tableCardRef}
              className={isMobile ? "relative w-full h-auto mt-6" : "absolute top-0 left-0 w-full min-h-full"}
              style={isMobile ? { background: '#f4f4f0' } : {
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
                willChange: 'transform',
                background: '#f4f4f0',
              }}
            >
              {/* Accent line at top — part of the "flip landed" reveal */}
              <div
                className="table-reveal h-1.5 w-full sticky top-0 z-10"
                style={{
                  background: 'linear-gradient(90deg, #b20e0e 0%, #ff4d4d 50%, #ffb347 100%)',
                }}
              />

              <section
                ref={tableSectionRef}
                id="patents-table"
                className="min-h-full py-12 lg:py-20 bg-[#f4f4f0]"
              >
                <div className="container mx-auto px-4 max-w-[1600px]">
                  <div className="table-reveal mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      {/* Mini badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, #b20e0e, #d41515)',
                            boxShadow: '0 4px 12px rgba(178,14,14,0.3)',
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                            <path d="M9 12l2 2 4-4" />
                            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.12 0 4.07.74 5.6 1.97" />
                            <path d="M21 3v4h-4" />
                          </svg>
                        </div>
                        <span className="text-[10px] font-black text-[#b20e0e] uppercase tracking-widest">
                          Research Database
                        </span>
                      </div>

                      <h2 className="text-3xl font-black text-[#1a1a1a] tracking-tight flex items-center gap-3">
                        PATENT DATABASE
                        <span className="text-xs font-bold px-2 py-1 bg-[#b20e0e]/10 text-[#b20e0e] rounded-lg">
                          Live
                        </span>
                      </h2>
                      <p className="text-slate-500 mt-2 font-medium">
                        Search, filter, and export the official institution patents.
                      </p>
                    </div>
                  </div>

                  <div className="table-reveal min-h-[800px] pb-28">
                    <PublicationsTable showActions={false} />
                  </div>
                </div>
              </section>
            </div>
            {/* ════════ END BACK ════════ */}
          </div>{/* /flipScene */}
        </div>{/* /flipWrapper */}
      </main>

      {/* Dynamic bottom spacer to push black footer down and blend with card background */}
      <div className="h-28 bg-[#f4f4f0] w-full" />

      <Footer />

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default Home;