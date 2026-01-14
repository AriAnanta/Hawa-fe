import { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { authService } from '../services/auth';

export default function Login() {
  const containerRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState('id');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const translations = {
    id: {
      back: 'Kembali',
      title: 'Selamat Datang Kembali',
      subtitle: 'Masuk ke akun Anda untuk melanjutkan',
      email: 'Email',
      emailPlaceholder: 'nama@email.com',
      password: 'Kata Sandi',
      passwordPlaceholder: 'Masukkan kata sandi',
      rememberMe: 'Ingat saya',
      forgotPassword: 'Lupa kata sandi?',
      submit: 'Masuk',
      loading: 'Memproses...',
      error: 'Email atau password salah',
      divider: 'atau',
      noAccount: 'Belum punya akun?',
      registerLink: 'Daftar Sekarang',
      terms: 'Dengan masuk, Anda menyetujui',
      termsLink: 'Syarat & Ketentuan',
      and: 'dan',
      privacyLink: 'Kebijakan Privasi'
    },
    en: {
      back: 'Back',
      title: 'Welcome Back',
      subtitle: 'Sign in to your account to continue',
      email: 'Email',
      emailPlaceholder: 'name@email.com',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      submit: 'Sign In',
      loading: 'Processing...',
      error: 'Email or password is incorrect',
      divider: 'or',
      noAccount: "Don't have an account?",
      registerLink: 'Sign Up Now',
      terms: 'By signing in, you agree to our',
      termsLink: 'Terms & Conditions',
      and: 'and',
      privacyLink: 'Privacy Policy'
    },
    su: {
      back: 'Balik',
      title: 'Wilujeng Sumping Deui',
      subtitle: 'Asup ka akun anjeun pikeun neraskeun',
      email: 'Email',
      emailPlaceholder: 'nama@email.com',
      password: 'Kata Sandi',
      passwordPlaceholder: 'Lebetkeun kata sandi anjeun',
      rememberMe: 'Inget kuring',
      forgotPassword: 'Pohokeun kata sandi?',
      submit: 'Asup',
      loading: 'Ngolah...',
      error: 'Email atawa kata sandi salah',
      divider: 'atawa',
      noAccount: 'Teu boga akun?',
      registerLink: 'Daptar Ayeuna',
      terms: 'Ku asup, anjeun satuju kana',
      termsLink: 'Sarat & Katangtuan',
      and: 'sareng',
      privacyLink: 'Kawijakan Privasi'
    }
  };

  const t = translations[language];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.login(formData.email, formData.password);
      
      // Small delay untuk memastikan state sudah update
      setTimeout(() => {
        // Redirect berdasarkan role user setelah login sukses
        if (authService.isAdmin()) {
          window.location.hash = '#admin';
        } else {
          window.location.hash = '#dashboard';
        }
      }, 100);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || t.error);
    } finally {
      // Pastikan loading selalu di-reset
      setIsLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-600 relative overflow-hidden">
      {/* Animated Background Elements - Same as landing page */}
      <div ref={containerRef} className="absolute inset-0 overflow-hidden" style={{ willChange: 'transform' }}>
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

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Back Button & Language Selector */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => window.location.hash = ''}
              className="flex items-center text-white/90 hover:text-white transition-colors duration-300 group"
            >
              <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="text-sm font-medium">{t.back}</span>
            </button>

            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="px-4 py-1.5 pr-8 rounded-full bg-white/10 backdrop-blur-xl text-sm text-white border border-white/30 font-medium hover:border-white/50 hover:bg-white/20 transition-all duration-300 cursor-pointer shadow-sm flex items-center gap-2 transform hover:scale-105"
              >
                <span>{language.toUpperCase()}</span>
                <svg 
                  className={`w-4 h-4 text-white transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} 
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
                  <div className="absolute top-full right-0 mt-2 w-32 bg-white/95 backdrop-blur-xl rounded-xl border border-white/40 shadow-lg z-50 overflow-hidden animate-fade-in">
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
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              <img 
                src="/logo_hawa_fix.png" 
                alt="HAWA Logo" 
                className="h-12 w-auto object-contain"
              />
              <span className="text-3xl font-black text-white tracking-tight">HAWA</span>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
                {t.title}
              </h1>
              <p className="text-white/80 text-sm sm:text-base">
                {t.subtitle}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white/90 mb-2">
                  {t.email}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="text-white/60" size={20} />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300"
                    placeholder={t.emailPlaceholder}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-white/90 mb-2">
                  {t.password}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-white/60" size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-12 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300"
                    placeholder={t.passwordPlaceholder}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-white transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2 w-4 h-4 rounded border-white/30 bg-white/20 text-blue-600 focus:ring-2 focus:ring-white/50"
                  />
                  <span>{t.rememberMe}</span>
                </label>
                <a
                  href="#"
                  className="text-white font-semibold hover:text-white/80 transition-colors duration-300"
                >
                  {t.forgotPassword}
                </a>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-blue-600 px-6 py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? t.loading : t.submit}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-white/30"></div>
              <span className="px-4 text-white/60 text-sm">{t.divider}</span>
              <div className="flex-1 border-t border-white/30"></div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-white/80 text-sm">
                {t.noAccount}{' '}
                <a
                  href="#register"
                  className="text-white font-bold hover:text-white/80 transition-colors duration-300 underline"
                >
                  {t.registerLink}
                </a>
              </p>
            </div>
          </div>

          {/* Footer Text */}
          <p className="text-center mt-6 text-white/70 text-xs sm:text-sm">
            {t.terms}{' '}
            <a href="#" className="text-white font-semibold hover:text-white/80 transition-colors duration-300 underline">
              {t.termsLink}
            </a>{' '}
            {t.and}{' '}
            <a href="#" className="text-white font-semibold hover:text-white/80 transition-colors duration-300 underline">
              {t.privacyLink}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

