import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Send } from 'lucide-react';

const Footer: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  const socialLinks = [
    { Icon: Facebook, label: 'Facebook' },
    { Icon: Twitter, label: 'Twitter' },
    { Icon: Instagram, label: 'Instagram' },
    { Icon: Linkedin, label: 'LinkedIn' }
  ];

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('이메일 주소를 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      setError('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    // Simulate API call
    setSuccess(true);
    setEmail('');
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <footer id="contact" className="bg-[#050b14] text-slate-400 py-16 px-6 border-t border-white/5">
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="bg-gradient-to-r from-jways-blue/10 to-transparent border border-white/10 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-jways-blue/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" aria-hidden="true" />
          
          <div className="relative z-10 text-center md:text-left max-w-xl">
            <h3 className="text-2xl font-bold text-white mb-2">Jways 뉴스레터 구독</h3>
            <p className="text-slate-400">
              최신 물류 트렌드, 시장 분석 리포트, 그리고 제이웨이즈의 프로모션 소식을 가장 먼저 받아보세요.
            </p>
          </div>

          <div className="relative z-10 w-full md:w-auto min-w-[320px] lg:min-w-[450px]">
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
              <div className="relative flex-grow">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${error ? 'text-red-500' : 'text-slate-500'}`} aria-hidden="true" />
                <motion.input 
                  type="email" 
                  placeholder="이메일 주소를 입력해주세요" 
                  aria-label="Email address for newsletter"
                  aria-describedby="newsletter-feedback"
                  className={`w-full pl-12 pr-4 py-3.5 bg-[#0a1120] border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-all ${
                    error
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-white/10 focus:border-jways-blue focus:ring-jways-blue'
                  }`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                />
              </div>
              <button 
                type="submit"
                className="px-6 py-3.5 min-h-[44px] bg-jways-blue hover:bg-blue-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 whitespace-nowrap"
              >
                구독하기 <Send size={18} aria-hidden="true" />
              </button>
            </form>
            <AnimatePresence>
                {error && (
                <motion.p
                    role="alert"
                    id="newsletter-feedback"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 -bottom-7 text-xs text-red-500 font-medium ml-1 mt-1"
                >
                    ⚠ {error}
                </motion.p>
                )}
                {success && (
                <motion.p
                    role="status"
                    id="newsletter-feedback"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 -bottom-7 text-xs text-green-500 font-medium ml-1 mt-1"
                >
                    ✓ 구독이 완료되었습니다!
                </motion.p>
                )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-6">
             <div className="w-8 h-8 bg-jways-blue rounded-tr-xl rounded-bl-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
             </div>
             <span className="text-2xl font-bold text-white">Jways</span>
          </div>
          <p className="mb-6 leading-relaxed text-sm">
            제이웨이즈는 전 세계를 연결하는 혁신적인 물류 파트너입니다. 
            고객님의 소중한 화물을 안전하고 신속하게 운송합니다.
          </p>
          <div className="flex gap-4">
            {socialLinks.map(({ Icon, label }, i) => (
              <a 
                key={i} 
                href="#" 
                className="group relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-all duration-300 hover:bg-jways-blue hover:text-white hover:scale-110"
                aria-label={label}
              >
                <Icon size={18} aria-hidden="true" />
                
                {/* Tooltip */}
                <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-xl border border-white/10 whitespace-nowrap z-20 pointer-events-none">
                  {label}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-bold mb-6">Quick Links</h3>
          <ul className="space-y-4 text-sm">
            {['회사소개', '서비스 안내', '운임 조회', '화물 추적', '고객센터'].map((item) => (
              <li key={item}>
                <a href="#" className="hover:text-jways-blue transition-colors block">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-white font-bold mb-6">Services</h3>
          <ul className="space-y-4 text-sm">
            {['항공 운송 (Air Freight)', '해상 운송 (Ocean Freight)', '내륙 운송 (Land Transport)', '창고 보관 (Warehousing)', '프로젝트 화물 (Project Cargo)'].map((item) => (
              <li key={item}>
                <a href="#" className="hover:text-jways-blue transition-colors block">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-bold mb-6">Contact Us</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-jways-blue mt-1 shrink-0" aria-hidden="true" />
              <span>서울특별시 강서구 화곡로68길 82, <br/>강서IT빌딩</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-jways-blue shrink-0" aria-hidden="true" />
              <span>02-1234-5678</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-jways-blue shrink-0" aria-hidden="true" />
              <span>contact@jways.com</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        <p>&copy; 2024 Jways Logistics. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white">개인정보처리방침</a>
          <a href="#" className="hover:text-white">이용약관</a>
          <a href="#" className="hover:text-white">사이트맵</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;