/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Wind, MapPin, Bell, TrendingUp, Factory, MessageSquare, Brain, Users, Heart, ArrowRight, Play, Star, Quote, Gauge, Activity, Waves, AirVent, Radio, ScanLine, Leaf, Droplets, Shield, Cloud, UserCircle, LogOut, LayoutDashboard } from 'lucide-react';
import { authService } from '../services/auth';

export default function HawaLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState('id');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isMobileLangDropdownOpen, setIsMobileLangDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileProfileDropdownOpen, setIsMobileProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const containerRef = useRef(null);

  const translations = {
    id: {
      nav: ['Beranda', 'Fitur', 'Cara Kerja', 'Tentang', 'Kontak'],
      hero: {
        brand: 'HAWA',
        badge: 'HAWA',
        badgeText: 'Monitor Udara Indoor',
        title: 'Simplifying',
        titleHighlight: 'Air Quality monitoring in Smart Way',
        subtitle: 'Bangun monitor kualitas udara indoor sendiri dan dapatkan insight real-time.',
        cta: 'Mulai Gratis',
        videoTitle: 'Lihat Demo',
        stats: [
          { value: '10K+', label: 'Keluarga' },
          { value: '50+', label: 'Sensor' },
          { value: '95%', label: 'Akurasi' },
          { value: '24/7', label: 'Monitoring' }
        ]
      },
      features: {
        badge: 'FITUR UNGGULAN',
        title: 'Alat Powerful untuk Udara Sehat',
        items: [
          {
            title: 'Peta Real-time',
            desc: 'Visualisasi hotspot polusi di area Anda',
            icon: 'map'
          },
          {
            title: 'WhatsApp Alerts',
            desc: 'Peringatan otomatis saat udara berbahaya',
            icon: 'bell'
          },
          {
            title: 'Analisis Tren',
            desc: 'Pahami pola polusi untuk keputusan lebih baik',
            icon: 'chart'
          },
          {
            title: 'Track Industri',
            desc: 'Monitor sumber polusi di komunitas',
            icon: 'factory'
          },
          {
            title: 'Laporan Warga',
            desc: 'Laporkan polusi bersama komunitas',
            icon: 'users'
          },
          {
            title: 'AI Tips',
            desc: 'Rekomendasi khusus untuk keluarga',
            icon: 'brain'
          }
        ]
      },
      howItWorks: {
        badge: '4 LANGKAH MUDAH',
        badgeSubtitle: 'untuk Lindungi Keluarga dari Polusi Udara dengan HAWA',
        title: 'Temukan cara pintar untuk monitor kualitas udara.',
        subtitle: 'Pasang sensor IoT, dapatkan analisis AI real-time, dan terima alert langsung—semua dalam beberapa langkah mudah.',
        steps: [
          {
            number: '1',
            title: 'Pasang Sensor',
            desc: 'Sensor IoT mengukur PM2.5, PM10, CO2 real-time secara akurat'
          },
          {
            number: '2',
            title: 'AI Analisis',
            desc: 'Machine learning menganalisis data dan prediksi risiko kesehatan untuk keluarga Anda'
          },
          {
            number: '3',
            title: 'Verifikasi Data',
            desc: 'Semua data terverifikasi dan terjamin akurat, sehingga Anda bisa percaya dengan informasi yang diterima'
          },
          {
            number: '4',
            title: 'Terima Alert',
            desc: 'Notifikasi & rekomendasi langsung ke WhatsApp Anda—tanpa repot, tanpa ribet'
          }
        ]
      },
      impact: {
        badge: 'ULASAN PENGguna',
        title: 'Apa Kata Pengguna Kami',
        subtitle: 'Temukan bagaimana HAWA mengubah cara keluarga melindungi diri dari polusi udara',
        stories: [
          {
            quote: 'Anak saya yang asma jarang kambuh karena kami tahu kapan udara aman untuk keluar rumah. Alerts WhatsApp sangat membantu!',
            author: 'Ibu Sari',
            title: 'Ibu Rumah Tangga',
            location: 'Bandung',
            rating: 5,
            avatar: '👩'
          },
          {
            quote: 'Kakek bisa jalan pagi dengan aman karena dapat alert kualitas udara real-time. Sekarang keluarga lebih tenang.',
            author: 'Ahmad',
            title: 'Karyawan Swasta',
            location: 'Cimahi',
            rating: 5,
            avatar: '👨'
          },
          {
            quote: 'Komunitas kami berhasil advokasi dengan data dari HAWA. Peta real-time sangat membantu untuk kampanye lingkungan.',
            author: 'Pak Budi',
            title: 'Aktivis Lingkungan',
            location: 'Bekasi',
            rating: 5,
            avatar: '👨‍💼'
          },
          {
            quote: 'AI Tips dari HAWA sangat membantu keluarga kami. Rekomendasi yang diberikan tepat sasaran dan mudah diikuti.',
            author: 'Ibu Dewi',
            title: 'Pegawai Negeri',
            location: 'Jakarta',
            rating: 5,
            avatar: '👩‍💼'
          },
          {
            quote: 'Sensor IoT yang akurat membuat saya percaya dengan data HAWA. Monitoring 24/7 benar-benar memberikan ketenangan pikiran.',
            author: 'Dr. Rizki',
            title: 'Dokter Spesialis',
            location: 'Bandung',
            rating: 5,
            avatar: '👨‍⚕️'
          },
          {
            quote: 'Sebagai pengguna yang peduli kesehatan keluarga, HAWA memberikan insight yang tidak bisa saya dapatkan di tempat lain.',
            author: 'Sari',
            title: 'Content Creator',
            location: 'Surabaya',
            rating: 5,
            avatar: '👩‍🎨'
          }
        ],
        footerText: 'Bergabunglah dengan ribuan pengguna yang menemukan solusi perlindungan udara dengan HAWA'
      },
      cta: {
        title: 'Siap Lindungi Keluarga Anda?',
        subtitle: 'Bergabung dengan ribuan keluarga yang merasakan udara lebih sehat',
        button: 'Daftar Sekarang - Gratis'
      }
    },
    en: {
      nav: ['Home', 'Features', 'How It Works', 'About', 'Contact'],
      hero: {
        brand: 'HAWA',
        badge: 'HAWA',
        badgeText: 'Indoor Air Quality Monitor',
        title: 'Simplifying',
        titleHighlight: 'Air Quality Monitoring the Smart Way',
        subtitle: 'Build your own indoor air quality monitor with instant insights.',
        cta: 'Get Started Free',
        videoTitle: 'Watch Demo',
        stats: [
          { value: '10K+', label: 'Families' },
          { value: '50+', label: 'Sensors' },
          { value: '95%', label: 'Accuracy' },
          { value: '24/7', label: 'Monitoring' }
        ]
      },
      features: {
        badge: 'KEY FEATURES',
        title: 'Powerful Tools for Healthy Air',
        items: [
          {
            title: 'Real-time Map',
            desc: 'Visualize pollution hotspots in your area',
            icon: 'map'
          },
          {
            title: 'WhatsApp Alerts',
            desc: 'Automatic warnings when air is dangerous',
            icon: 'bell'
          },
          {
            title: 'Trend Analysis',
            desc: 'Understand pollution patterns for better decisions',
            icon: 'chart'
          },
          {
            title: 'Industry Tracking',
            desc: 'Monitor pollution sources in community',
            icon: 'factory'
          },
          {
            title: 'Community Reports',
            desc: 'Report pollution together with community',
            icon: 'users'
          },
          {
            title: 'AI Tips',
            desc: 'Custom recommendations for your family',
            icon: 'brain'
          }
        ]
      },
      howItWorks: {
        badge: '4 EASY STEPS',
        badgeSubtitle: 'to Protect Your Family from Air Pollution with HAWA',
        title: 'Discover a smarter way to monitor air quality.',
        subtitle: 'Install IoT sensors, get AI-powered real-time analysis, and receive instant alerts—all in just a few easy steps.',
        steps: [
          {
            number: '1',
            title: 'Install Sensors',
            desc: 'IoT sensors measure PM2.5, PM10, CO2 in real-time with accuracy'
          },
          {
            number: '2',
            title: 'AI Analysis',
            desc: 'Machine learning analyzes data and predicts health risks for your family'
          },
          {
            number: '3',
            title: 'Verify Data',
            desc: 'All data is verified and guaranteed accurate, so you can trust the information you receive'
          },
          {
            number: '4',
            title: 'Get Alerts',
            desc: 'Notifications & recommendations direct to WhatsApp—no hassle, no fuss'
          }
        ]
      },
      impact: {
        badge: 'USER REVIEWS',
        title: 'What Our Users Say',
        subtitle: 'Discover how HAWA is transforming how families protect themselves from air pollution',
        stories: [
          {
            quote: 'My child with asthma rarely has attacks because we know when air is safe. WhatsApp alerts are very helpful!',
            author: 'Mrs. Sari',
            title: 'Homemaker',
            location: 'Bandung',
            rating: 5,
            avatar: '👩'
          },
          {
            quote: 'Grandpa can walk safely in the morning because he gets real-time air quality alerts. Our family feels more secure now.',
            author: 'Ahmad',
            title: 'Private Employee',
            location: 'Cimahi',
            rating: 5,
            avatar: '👨'
          },
          {
            quote: 'Our community successfully advocated with data from HAWA. The real-time map is very helpful for environmental campaigns.',
            author: 'Mr. Budi',
            title: 'Environmental Activist',
            location: 'Bekasi',
            rating: 5,
            avatar: '👨‍💼'
          },
          {
            quote: 'AI Tips from HAWA are very helpful for our family. The recommendations are targeted and easy to follow.',
            author: 'Mrs. Dewi',
            title: 'Civil Servant',
            location: 'Jakarta',
            rating: 5,
            avatar: '👩‍💼'
          },
          {
            quote: 'The accurate IoT sensors make me trust HAWA data. 24/7 monitoring really gives peace of mind.',
            author: 'Dr. Rizki',
            title: 'Specialist Doctor',
            location: 'Bandung',
            rating: 5,
            avatar: '👨‍⚕️'
          },
          {
            quote: 'As a user who cares about family health, HAWA provides insights I cannot get elsewhere.',
            author: 'Sari',
            title: 'Content Creator',
            location: 'Surabaya',
            rating: 5,
            avatar: '👩‍🎨'
          }
        ],
        footerText: 'Join thousands of satisfied users who found their dream protection solution with HAWA'
      },
      cta: {
        title: 'Ready to Protect Your Family?',
        subtitle: 'Join thousands of families experiencing healthier air',
        button: 'Sign Up Now - Free'
      }
    },
    su: {
      nav: ['Tepas', 'Fitur', 'Kumaha Jalanna', 'Ngeunaan', 'Kontak'],
      hero: {
        brand: 'HAWA',
        badge: 'HAWA',
        badgeText: 'Monitor Kualitas Hawa',
        title: 'Ngamudahkeun',
        titleHighlight: 'Monitor kualitas hawa kalayan cara pinter',
        subtitle: 'Rancang monitor hawa sorangan jeung meunang insight real-time.',
        cta: 'Mimitian Gratis',
        videoTitle: 'Tingali Demo',
        stats: [
          { value: '10K+', label: 'Kulawarga' },
          { value: '50+', label: 'Sensor' },
          { value: '95%', label: 'Akurasi' },
          { value: '24/7', label: 'Monitoring' }
        ]
      },
      features: {
        badge: 'FITUR UTAMA',
        title: 'Parabot Kuat pikeun Hawa Séhat',
        items: [
          {
            title: 'Peta Real-time',
            desc: 'Visualisasi hotspot polusi di daérah anjeun',
            icon: 'map'
          },
          {
            title: 'Alert WhatsApp',
            desc: 'Peringatan otomatis nalika hawa bahaya',
            icon: 'bell'
          },
          {
            title: 'Analisis Tren',
            desc: 'Ngartos pola polusi pikeun kaputusan langkung saé',
            icon: 'chart'
          },
          {
            title: 'Track Industri',
            desc: 'Monitor sumber polusi di komunitas',
            icon: 'factory'
          },
          {
            title: 'Laporan Warga',
            desc: 'Laporkeun polusi babarengan komunitas',
            icon: 'users'
          },
          {
            title: 'AI Tips',
            desc: 'Rekomendasi khusus pikeun kulawarga',
            icon: 'brain'
          }
        ]
      },
      howItWorks: {
        badge: '4 LÉNGKAH GAMPIL',
        badgeSubtitle: 'pikeun Jaga Kulawarga tina Polusi Hawa kalawan HAWA',
        title: 'Temukan cara anu leuwih pinter pikeun monitor kualitas hawa.',
        subtitle: 'Pasang sensor IoT, kénging analisis AI real-time, sareng nampi alert langsung—sadayana ngan sababaraha léngkah gampil.',
        steps: [
          {
            number: '1',
            title: 'Pasang Sensor',
            desc: 'Sensor IoT ngukur PM2.5, PM10, CO2 real-time kalawan akurat'
          },
          {
            number: '2',
            title: 'AI Nganalisis',
            desc: 'Machine learning nganalisis data sareng prediksi résiko kaséhatan pikeun kulawarga anjeun'
          },
          {
            number: '3',
            title: 'Verifikasi Data',
            desc: 'Sadayana data diverifikasi sareng dijamin akurat, janten anjeun tiasa percanten kana inpormasi anu ditampi'
          },
          {
            number: '4',
            title: 'Nampi Alert',
            desc: 'Notifikasi & rekomendasi langsung ka WhatsApp—henteu repot, henteu ribet'
          }
        ]
      },
      impact: {
        badge: 'ULASAN PAMAKÉ',
        title: 'Naon Anu Disebut Pamaké Kami',
        subtitle: 'Temukan kumaha HAWA ngarobih cara kulawarga ngajaga diri tina polusi hawa',
        stories: [
          {
            quote: 'Budak abdi nu asma jarang kambuh sabab kami terang iraha hawa aman pikeun kaluar imah. Alerts WhatsApp mantuan pisan!',
            author: 'Ibu Sari',
            title: 'Ibu Imah Tangga',
            location: 'Bandung',
            rating: 5,
            avatar: '👩'
          },
          {
            quote: 'Akina tiasa leumpang isuk kalawan aman sabab meunang alert kualitas hawa real-time. Ayeuna kulawarga langkung tenang.',
            author: 'Ahmad',
            title: 'Karyawan Swasta',
            location: 'Cimahi',
            rating: 5,
            avatar: '👨'
          },
          {
            quote: 'Komunitas kami suksés advokasi ku data ti HAWA. Peta real-time mantuan pisan pikeun kampanye lingkungan.',
            author: 'Pak Budi',
            title: 'Aktivis Lingkungan',
            location: 'Bekasi',
            rating: 5,
            avatar: '👨‍💼'
          },
          {
            quote: 'AI Tips ti HAWA mantuan pisan pikeun kulawarga kami. Rekomendasi anu dipasihkeun tepat sasaran sareng gampang diturutan.',
            author: 'Ibu Dewi',
            title: 'Pegawai Negeri',
            location: 'Jakarta',
            rating: 5,
            avatar: '👩‍💼'
          },
          {
            quote: 'Sensor IoT anu akurat ngajantenkeun kuring percanten ku data HAWA. Monitoring 24/7 leres-leres masihan katengtrem pikiran.',
            author: 'Dr. Rizki',
            title: 'Dokter Spesialis',
            location: 'Bandung',
            rating: 5,
            avatar: '👨‍⚕️'
          },
          {
            quote: 'Salaku pamaké anu paduli kaséhatan kulawarga, HAWA masihan insight anu henteu tiasa kuring kénging di tempat sanés.',
            author: 'Sari',
            title: 'Content Creator',
            location: 'Surabaya',
            rating: 5,
            avatar: '👩‍🎨'
          }
        ],
        footerText: 'Gabung sareng rébuan pamaké anu mendakan solusi perlindungan hawa kalawan HAWA'
      },
      cta: {
        title: 'Siap Ngajaga Kulawarga Anjeun?',
        subtitle: 'Gabung sareng rébuan kulawarga nu ngaraosan hawa langkung séhat',
        button: 'Daptar Ayeuna - Gratis'
      }
    }
  };

  const t = translations[language];

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

  // Scroll animation hook
  const useScrollAnimation = () => {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Reset animation setiap kali masuk viewport
            if (entry.isIntersecting) {
              setIsVisible(true);
              // Reset animation untuk trigger ulang
              if (entry.target) {
                entry.target.style.animation = 'none';
                void entry.target.offsetHeight;
                entry.target.style.animation = '';
              }
            } else {
              setIsVisible(false);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        }
      );

      const currentElement = elementRef.current;
      if (currentElement) {
        observer.observe(currentElement);
      }

      return () => {
        if (currentElement) {
          observer.unobserve(currentElement);
        }
      };
    }, []);

    return { elementRef, isVisible };
  };

  // Scroll Animation Component
  const ScrollAnimate = ({ children, delay = 0, className = '' }) => {
    const { elementRef, isVisible } = useScrollAnimation();
    
    return (
      <div
        ref={elementRef}
        className={`transition-all duration-700 ease-out ${className} ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
        style={{ 
          transitionDelay: isVisible ? `${delay}ms` : '0ms'
        }}
      >
        {children}
      </div>
    );
  };

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        setCurrentUser(authService.getCurrentUser());
      } else {
        setCurrentUser(null);
      }
    };

    checkAuth();
    
    // Listen for hash changes to update auth status
    const handleHashChange = () => {
      checkAuth();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle logout
  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsProfileDropdownOpen(false);
    setIsMobileProfileDropdownOpen(false);
    window.location.hash = '#landing';
  };

  // Handle scroll untuk navbar animation
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Threshold: mulai animasi setelah scroll 50px
      setIsScrolled(scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial scroll position
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-600 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 left-0 right-0">
        <div className={`w-full flex justify-center transition-all duration-500 ease-out ${
          isScrolled ? 'px-6 lg:px-12 py-3' : 'px-4 lg:px-8 py-2'
        }`}>
          <div className={`w-full bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl shadow-sm transition-all duration-500 ease-out ${
            isScrolled 
              ? 'max-w-5xl px-4 lg:px-6 py-2.5' 
              : 'max-w-4xl px-3 lg:px-5 py-2'
          }`}>
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-2 transition-all duration-300 hover:scale-105">
                <img 
                  src="/logo_hawa_fix.png" 
                  alt="HAWA Logo" 
                  className="h-8 w-auto object-contain"
                />
              </div>

              {/* Desktop Navigation */}
              <div className={`hidden lg:flex items-center transition-all duration-500 ease-out ${
                isScrolled ? 'space-x-8 mx-8' : 'space-x-3 mx-4'
              }`}>
                {t.nav.map((item, idx) => (
                  <a 
                    key={idx} 
                    href="#" 
                    className="text-sm text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group"
                  >
                    {item}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                ))}
              </div>

              <div className={`hidden lg:flex items-center transition-all duration-500 ease-out ${
                isScrolled ? 'space-x-3' : 'space-x-2'
              }`}>
                <div className="relative">
                  <button
                    onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                    className="px-4 py-1.5 pr-8 rounded-full bg-white/50 backdrop-blur-xl text-sm text-gray-700 border border-white/40 font-medium hover:border-blue-300 hover:bg-white/60 transition-all duration-300 cursor-pointer shadow-sm flex items-center gap-2 transform hover:scale-105"
                  >
                    <span>{language.toUpperCase()}</span>
                    <svg 
                      className={`w-4 h-4 text-gray-600 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isLangDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsLangDropdownOpen(false)}
                      ></div>
                      <div className="absolute top-full left-0 mt-2 w-32 bg-white/95 backdrop-blur-xl rounded-xl border border-white/40 shadow-lg z-50 overflow-hidden animate-fade-in">
                        <button
                          onClick={() => { setLanguage('id'); setIsLangDropdownOpen(false); }}
                          className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-all ${
                            language === 'id' 
                              ? 'bg-blue-600 text-white' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          ID
                        </button>
                        <button
                          onClick={() => { setLanguage('en'); setIsLangDropdownOpen(false); }}
                          className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-all ${
                            language === 'en' 
                              ? 'bg-blue-600 text-white' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          EN
                        </button>
                        <button
                          onClick={() => { setLanguage('su'); setIsLangDropdownOpen(false); }}
                          className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-all ${
                            language === 'su' 
                              ? 'bg-blue-600 text-white' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          SU
                        </button>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Profile Dropdown or Login Button */}
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <UserCircle size={18} />
                      <span className="hidden sm:inline">{currentUser?.name?.split(' ')[0] || 'User'}</span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isProfileDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsProfileDropdownOpen(false)}
                        ></div>
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl border border-white/40 shadow-lg z-50 overflow-hidden animate-fade-in">
                          <div className="px-4 py-3 border-b border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Signed in as</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{currentUser?.email || ''}</p>
                          </div>
                          <a
                            href="#dashboard"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center space-x-2 w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                          >
                            <LayoutDashboard size={16} />
                            <span>Dashboard</span>
                          </a>
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                          >
                            <LogOut size={16} />
                            <span>Logout</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <a 
                    href="#login"
                    className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 inline-block"
                  >
                    Login
                  </a>
                )}
              </div>

              {/* Mobile menu button */}
              <button 
                className="lg:hidden text-gray-900"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden w-full flex justify-center px-6">
            <div className="max-w-5xl w-full bg-white/40 backdrop-blur-xl border border-white/30 rounded-b-2xl shadow-sm">
              <div className="px-6 py-6 space-y-4">
                {t.nav.map((item, idx) => (
                  <a key={idx} href="#" className="block text-gray-900 hover:text-blue-600 font-medium">
                    {item}
                  </a>
                ))}
              <div className="relative">
                <button
                  onClick={() => setIsMobileLangDropdownOpen(!isMobileLangDropdownOpen)}
                  className="w-full px-4 py-2 pr-8 rounded-full bg-white/20 backdrop-blur-md text-sm text-gray-700 border border-white/30 font-medium hover:border-blue-300 transition-all cursor-pointer shadow-sm flex items-center justify-between"
                >
                  <span>{language.toUpperCase()}</span>
                  <svg 
                    className={`w-4 h-4 text-gray-600 transition-transform ${isMobileLangDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Mobile Dropdown Menu */}
                {isMobileLangDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsMobileLangDropdownOpen(false)}
                    ></div>
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-xl border border-white/40 shadow-lg z-50 overflow-hidden animate-fade-in">
                      <button
                        onClick={() => { setLanguage('id'); setIsMobileLangDropdownOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-all ${
                          language === 'id' 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        ID
                      </button>
                      <button
                        onClick={() => { setLanguage('en'); setIsMobileLangDropdownOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-all ${
                          language === 'en' 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => { setLanguage('su'); setIsMobileLangDropdownOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-all ${
                          language === 'su' 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        SU
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              {/* Profile Dropdown or Login Button (Mobile) */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsMobileProfileDropdownOpen(!isMobileProfileDropdownOpen)}
                    className="w-full flex items-center justify-between bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <UserCircle size={18} />
                      <span>{currentUser?.name?.split(' ')[0] || 'User'}</span>
                    </div>
                    <svg 
                      className={`w-4 h-4 transition-transform ${isMobileProfileDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isMobileProfileDropdownOpen && (
                    <div className="mt-2 bg-white/95 backdrop-blur-xl rounded-xl border border-white/40 shadow-lg overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{currentUser?.email || ''}</p>
                      </div>
                      <a
                        href="#dashboard"
                        onClick={() => {
                          setIsMobileProfileDropdownOpen(false);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                      >
                        <LayoutDashboard size={16} />
                        <span>Dashboard</span>
                      </a>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <a 
                  href="#login"
                  className="w-full bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 inline-block text-center"
                >
                  Login
                </a>
              )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-600 pt-28 pb-20 overflow-hidden">
        {/* Animated Background Elements - Same as login page */}
        <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" style={{ willChange: 'transform' }}>
          {/* Wind Effect - Moving Streaks */}
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={`streak-${i}`}
                className={`absolute left-0 w-full ${i % 2 === 0 ? 'animate-wind-streak-left' : 'animate-wind-streak-right'}`}
                style={{
                  top: `${(i * 8) % 100}%`,
                  height: `${1 + (i % 3)}px`,
                  background: `linear-gradient(${i % 2 === 0 ? 'to right' : 'to left'}, transparent, rgba(255, 255, 255, ${0.15 + (i % 3) * 0.1}), transparent)`,
                  animationDelay: `${i * 0.8}s`,
                  animationDuration: `${6 + (i % 4) * 2}s`,
                  opacity: 0.6 + (i % 3) * 0.15
                }}
              ></div>
            ))}

            {/* Wind Swirls */}
            {[...Array(8)].map((_, i) => (
              <div
                key={`swirl-${i}`}
                className="absolute animate-wind-swirl"
                style={{
                  left: `${(i * 12) % 100}%`,
                  top: `${(i * 10) % 100}%`,
                  width: '200px',
                  height: '200px',
                  border: `2px solid rgba(255, 255, 255, ${0.1 + (i % 3) * 0.05})`,
                  borderRadius: '50%',
                  borderTopColor: 'transparent',
                  borderRightColor: 'transparent',
                  animationDelay: `${i * 1.2}s`,
                  animationDuration: `${8 + (i % 4) * 2}s`,
                  transform: `rotate(${i * 45}deg)`
                }}
              ></div>
            ))}

            {/* Wind Particles */}
            {[...Array(50)].map((_, i) => {
              const size = 1 + (i % 4) * 0.5;
              return (
                <div
                  key={`particle-${i}`}
                  className="absolute rounded-full bg-white animate-wind-particle-enhanced"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `${(i * 2) % 100}%`,
                    top: `${(i * 3.5) % 100}%`,
                    opacity: 0.3 + (i % 3) * 0.2,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: `${10 + (i % 8) * 1.5}s`,
                    boxShadow: `0 0 ${size * 2}px rgba(255, 255, 255, 0.5)`
                  }}
                ></div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center text-center gap-10">
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold tracking-[0.35em] text-white/80 uppercase">
                {t.hero.brand || 'HAWA'}
              </span>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 bg-white/20 backdrop-blur-md shadow-sm">
                <span className="text-sm font-semibold text-white">{t.hero.badge}</span>
                <ArrowRight className="text-white/80" size={14} />
                <span className="text-sm text-white/90">{t.hero.badgeText}</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white leading-snug">
              <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-md inline-block mb-3 border border-white/30">
                {t.hero.title}
              </span>
              <span className="block">
                {t.hero.titleHighlight}
              </span>
            </h1>

            <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
              {t.hero.subtitle}
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href="#register"
                className="bg-gray-900 text-white px-8 py-3 rounded-full font-semibold text-sm shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5"
              >
                {t.hero.cta}
              </a>
              <button className="px-8 py-3 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-sm font-semibold text-white hover:bg-white/20 hover:border-white/50 transition-all">
                {t.hero.videoTitle}
              </button>
            </div>

            <div className="w-full max-w-xl mx-auto">
              <img 
                src="/IoT.png" 
                alt="HAWA IoT sensor" 
                className="w-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="pt-16 sm:pt-20 lg:pt-24 pb-24 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimate>
            <div className="text-center mb-16">
              <div className="inline-block bg-blue-100 px-6 py-2 rounded-full mb-4">
                <span className="text-sm font-bold text-blue-600">{t.features.badge}</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
                {t.features.title}
              </h2>
            </div>
          </ScrollAnimate>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.features.items.map((feature, idx) => {
              const iconMap = {
                map: MapPin,
                bell: Bell,
                chart: TrendingUp,
                factory: Factory,
                users: Users,
                brain: Brain
              };
              const Icon = iconMap[feature.icon];
              
              return (
                <ScrollAnimate key={idx} delay={idx * 100}>
                  <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                  {/* 3D Icon with blue theme */}
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-5 relative"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.1)',
                      transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)'
                    }}
                  >
                    <Icon className="text-white" size={32} strokeWidth={2} style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }} />
                    {/* 3D highlight effect */}
                    <div 
                      className="absolute top-0 left-0 w-full h-1/2 rounded-t-xl opacity-30"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.4), transparent)'
                      }}
                    ></div>
                  </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{feature.desc}</p>
                  </div>
                </ScrollAnimate>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimate>
            <div className="text-center mb-16">
              <div className="inline-block border-2 border-blue-200 px-6 py-2 rounded-full mb-4">
                <span className="text-sm font-bold text-blue-600">{t.howItWorks.badge}</span>
              </div>
              <p className="text-sm text-gray-600 mb-6">{t.howItWorks.badgeSubtitle}</p>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
                {t.howItWorks.title}
              </h2>
              <p className="text-base text-gray-600 max-w-3xl mx-auto">
                {t.howItWorks.subtitle}
              </p>
            </div>
          </ScrollAnimate>

          <div className="grid md:grid-cols-2 gap-6">
            {t.howItWorks.steps.map((step, idx) => {
              const StepWrapper = ({ children }) => (
                <ScrollAnimate delay={idx * 150}>
                  {children}
                </ScrollAnimate>
              );
              // Different visual assets for each step - more detailed UI mockups
              const visualAssets = [
                // Step 1: Sensor installation interface mockup
                <div key="sensor" className="w-full h-full flex flex-col items-center justify-center p-6 space-y-4">
                  <div className="w-full bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">Step 1 of 4</span>
                      <span className="text-xs font-semibold text-blue-600">25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '25%'}}></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                      <Radio className="text-blue-600" size={40} strokeWidth={1.5} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>,

                // Step 2: AI Analysis dashboard mockup
                <div key="ai" className="w-full h-full flex flex-col items-center justify-center p-6 space-y-4">
                  <div className="w-full bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">Match Score</span>
                    </div>
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <div className="w-24 h-24 rounded-full border-8 border-blue-200 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">85%</div>
                          <div className="text-xs text-gray-500">Match</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-blue-200 rounded w-full"></div>
                      <div className="h-2 bg-blue-300 rounded w-4/5"></div>
                      <div className="h-2 bg-blue-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>,

                // Step 3: Verification badge mockup
                <div key="verify" className="w-full h-full flex flex-col items-center justify-center p-6 space-y-4">
                  <div className="w-full bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Shield className="text-green-600" size={24} strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <div className="h-2 bg-gray-200 rounded flex-1"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <div className="h-2 bg-gray-200 rounded flex-1"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <div className="h-2 bg-gray-200 rounded flex-1"></div>
                      </div>
                    </div>
                  </div>
                </div>,

                // Step 4: WhatsApp alert mockup
                <div key="alert" className="w-full h-full flex flex-col items-center justify-center p-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center shadow-xl">
                      <MessageSquare className="text-white" size={64} strokeWidth={1.5} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Bell className="text-blue-600" size={28} />
                    </div>
                  </div>
                  <div className="mt-6 w-24 h-1 bg-white/50 rounded-full"></div>
                  <div className="mt-2 w-16 h-1 bg-white/30 rounded-full"></div>
                </div>
              ];

              return (
                <StepWrapper key={idx}>
                  <div 
                    className={`group relative rounded-2xl h-full min-h-[400px] shadow-lg overflow-hidden transition-all duration-300 ${
                      idx === 3 
                        ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 text-white hover:shadow-2xl md:row-span-2' 
                        : 'bg-gray-50 border border-gray-200 hover:border-blue-200 hover:shadow-xl'
                    }`}
                  >
                  {/* Main Content - Always visible on top */}
                  <div className="p-8 relative z-20 h-full flex flex-col">
                    {/* Number Circle */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 ${
                      idx === 3 
                        ? 'bg-white/20 backdrop-blur-md border border-white/30' 
                        : 'bg-blue-100'
                    }`}>
                      <span className={`text-2xl font-black ${idx === 3 ? 'text-white' : 'text-blue-600'}`}>
                        {step.number}
                      </span>
                    </div>
                    
                    <h3 className={`text-xl font-bold mb-3 transition-all duration-300 ${idx === 3 ? 'text-white' : 'text-gray-900'}`}>
                      {step.title}
                    </h3>
                    <p className={`leading-relaxed text-sm flex-grow ${idx === 3 ? 'text-white/95' : 'text-gray-600'}`}>
                      {step.desc}
                    </p>
                  </div>

                  {/* Slide-in Visual Asset from Bottom - Starts at 25% visible, width is 4/6 of card, aligned right, rounded */}
                  <div className={`absolute bottom-0 right-0 w-2/3 h-2/3 transform translate-y-[75%] group-hover:translate-y-[33.33%] transition-transform duration-500 ease-in-out p-6 rounded-tl-2xl rounded-tr-2xl ${
                    idx === 3 
                      ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600' 
                      : 'bg-white'
                  }`}>
                      {visualAssets[idx]}
                    </div>
                  </div>
                </StepWrapper>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact Section - Testimonials */}
      <section className="py-24 px-6 lg:px-12 relative overflow-hidden" style={{ backgroundColor: '#f8fafc', backgroundImage: `radial-gradient(circle, #e2e8f0 1px, transparent 1px)`, backgroundSize: '40px 40px' }}>
        <div className="max-w-7xl mx-auto">
          <ScrollAnimate>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
                {t.impact.title}
              </h2>
              <p className="text-base text-gray-600 max-w-3xl mx-auto">
                {t.impact.subtitle}
              </p>
            </div>
          </ScrollAnimate>

          {/* Row 1 - Slide to Left */}
          <div className="mb-8 overflow-hidden relative">
            {/* Gradient fade masks */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#f8fafc] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#f8fafc] to-transparent z-10 pointer-events-none"></div>
            <div className="flex gap-4 sm:gap-6 animate-slide-left py-4 px-4 sm:px-8">
              {/* Duplicate cards for infinite loop */}
              {[...Array(2)].map((_, loopIdx) => (
                <React.Fragment key={loopIdx}>
                  {t.impact.stories.map((story, idx) => (
                    <div key={`row1-${loopIdx}-${idx}`} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg relative border border-gray-100 hover:shadow-xl transition-shadow flex-shrink-0 w-[280px] sm:w-[320px] md:w-[380px]">
                      {/* Large Quotation Marks Decoration */}
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-10">
                        <Quote className="text-gray-400" size={60} strokeWidth={1} style={{ width: '60px', height: '60px' }} />
                      </div>

                      {/* Rating Stars */}
                      <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                        {[...Array(story.rating)].map((_, i) => (
                          <Star key={i} className="text-yellow-400 fill-yellow-400" size={16} style={{ width: '16px', height: '16px' }} />
                        ))}
                      </div>

                      {/* Quote */}
                      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 relative z-10">
                        "{story.quote}"
                      </p>

                      {/* Author Info */}
                      <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                          {story.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">{story.author}</p>
                          <p className="text-[10px] sm:text-xs text-gray-600 truncate">{story.title}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500 truncate">{story.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Row 2 - Slide to Right */}
          <div className="mb-12 overflow-hidden relative">
            {/* Gradient fade masks */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#f8fafc] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#f8fafc] to-transparent z-10 pointer-events-none"></div>
            <div className="flex gap-4 sm:gap-6 animate-slide-right py-4 px-4 sm:px-8">
              {/* Duplicate cards for infinite loop */}
              {[...Array(2)].map((_, loopIdx) => (
                <React.Fragment key={loopIdx}>
                  {t.impact.stories.slice().reverse().map((story, idx) => (
                    <div key={`row2-${loopIdx}-${idx}`} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg relative border border-gray-100 hover:shadow-xl transition-shadow flex-shrink-0 w-[280px] sm:w-[320px] md:w-[380px]">
                      {/* Large Quotation Marks Decoration */}
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-10">
                        <Quote className="text-gray-400" size={60} strokeWidth={1} style={{ width: '60px', height: '60px' }} />
                      </div>

                      {/* Rating Stars */}
                      <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                        {[...Array(story.rating)].map((_, i) => (
                          <Star key={i} className="text-yellow-400 fill-yellow-400" size={16} style={{ width: '16px', height: '16px' }} />
                        ))}
                      </div>

                      {/* Quote */}
                      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 relative z-10">
                        "{story.quote}"
                      </p>

                      {/* Author Info */}
                      <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                          {story.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">{story.author}</p>
                          <p className="text-[10px] sm:text-xs text-gray-600 truncate">{story.title}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500 truncate">{story.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Footer Text */}
          <div className="text-center">
            <p className="text-gray-600 text-base">
              {t.impact.footerText}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500">
        <ScrollAnimate>
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-2xl lg:text-3xl font-black mb-4">
              {t.cta.title}
            </h2>
            <p className="text-sm mb-8 opacity-95">
              {t.cta.subtitle}
            </p>
            <a 
              href="#register"
              className="bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-base hover:shadow-2xl transform hover:scale-105 transition-all inline-block"
            >
              {t.cta.button}
            </a>
          </div>
        </ScrollAnimate>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 lg:px-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center items-center space-x-2 mb-3">
            <span className="text-xl font-black">HAWA</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2025 HAWA. Making air pollution visible for West Java.
          </p>
        </div>
      </footer>

    </div>
  );
}