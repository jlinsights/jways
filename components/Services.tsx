import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Ship, Truck, Warehouse, ArrowUpRight, X, CheckCircle2, Search } from 'lucide-react';
import Section from './ui/Section';
import { ServiceItem, ServiceType } from '../types';

const services: ServiceItem[] = [
  {
    id: 'air',
    title: '항공 운송',
    category: 'Air',
    description: '전 세계 어디든 신속하고 정확한 항공 화물 운송 서비스를 제공합니다. 긴급 화물부터 대형 화물까지 최적의 솔루션을 경험하세요.',
    longDescription: '제이웨이즈의 항공 운송 서비스는 전 세계 주요 공항을 연결하는 광범위한 네트워크를 기반으로 합니다. 긴급한 서류부터 대형 화물까지, 고객의 요구에 맞춘 최적의 스케줄과 합리적인 운임을 제공합니다. 24시간 운영되는 공항 관제 시스템과 연동하여 실시간으로 화물의 위치를 파악하고, 예측 불가능한 상황에도 신속하게 대처합니다.',
    features: [
      '전 세계 100+ 국가 연결 네트워크',
      '긴급 화물 우선 선적 (Express Service)',
      '특수 화물(위험물, 신선식품) 전문 처리',
      '도어 투 도어(Door-to-Door) 연계 서비스'
    ],
    icon: Plane,
    image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'ocean',
    title: '해상 운송',
    category: 'Ocean',
    description: 'LCL부터 FCL까지, 효율적이고 경제적인 해상 운송 네트워크를 구축했습니다. 글로벌 파트너십을 통한 안정적인 스케줄을 보장합니다.',
    longDescription: '대량 화물 운송의 가장 효율적인 솔루션인 해상 운송 서비스를 제공합니다. 소량 화물(LCL)부터 컨테이너 화물(FCL)까지, 고객의 화물 특성과 물량에 맞는 최적의 선사와 컨테이너를 매칭해 드립니다. 주요 항만 터미널과의 긴밀한 협력을 통해 통관 및 하역 시간을 최소화하여 물류 비용을 절감합니다.',
    features: [
      '주요 글로벌 선사와의 전략적 제휴',
      'LCL 콘솔리데이션 및 FCL 서비스',
      '특수 컨테이너(Reefer, Open Top) 지원',
      '복합 운송(Sea & Air) 솔루션 제공'
    ],
    icon: Ship,
    image: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'land',
    title: '육상 운송',
    category: 'Land',
    description: '도어 투 도어(Door-to-Door) 서비스를 위한 완벽한 내륙 운송 시스템. 실시간 관제 시스템으로 안전하게 배송합니다.',
    longDescription: '항만이나 공항에서 최종 목적지까지, 혹은 내륙 간 이동을 위한 완벽한 육상 운송 솔루션입니다. 자체 보유 트럭과 협력사 네트워크를 통합한 운송 관리 시스템(TMS)을 통해 최적의 경로를 산출하고 배차합니다. 냉동/냉장 차량 등 특수 차량을 완비하여 콜드체인 물류도 완벽하게 수행합니다.',
    features: [
      '전국 커버리지 물류 네트워크',
      'GPS 기반 실시간 차량 위치 관제',
      '콜드체인(냉동/냉장) 운송 전문',
      '당일 배송 및 예약 배송 시스템'
    ],
    icon: Truck,
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'warehouse',
    title: '물류 창고',
    category: 'Warehouse',
    description: '스마트 재고 관리 시스템을 갖춘 최첨단 물류 센터. 보관, 포장, 유통 가공까지 원스톱 풀필먼트 서비스를 제공합니다.',
    longDescription: '최첨단 WMS(창고관리시스템)가 적용된 제이웨이즈의 물류 센터에서 체계적인 재고 관리를 경험하세요. 단순 보관을 넘어 입고 검수, 포장, 라벨링, 반품 관리 등 풀필먼트 전 과정을 대행합니다. 로봇 자동화 설비를 도입하여 작업 속도와 정확도를 혁신적으로 높였습니다.',
    features: [
      '실시간 재고 연동 스마트 WMS',
      '자동화 설비(DAS/DPS) 구축',
      '유통 가공 및 임가공 서비스',
      '365일 24시간 철저한 보안 시스템'
    ],
    icon: Warehouse,
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200'
  },
];

const categories = ['All', 'Air', 'Ocean', 'Land', 'Warehouse'];

interface ServicesProps {
  onOpenQuote: (service: ServiceType) => void;
}

const Services: React.FC<ServicesProps> = ({ onOpenQuote }) => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref to store the element that had focus before modal opened
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const filteredServices = services.filter(service => {
    const matchesCategory = activeCategory === 'All' || service.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = service.title.toLowerCase().includes(searchLower) || 
                          service.description.toLowerCase().includes(searchLower) ||
                          service.longDescription.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  // Handle Modal Interactions: Scroll Lock, Escape Key, Focus Trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedService(null);
        return;
      }
      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };

    if (selectedService) {
      // Save current focus
      lastFocusedElementRef.current = document.activeElement as HTMLElement;

      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setIsLoading(false);

      return () => {
          window.removeEventListener('keydown', handleKeyDown);
      }
    } else {
      document.body.style.overflow = 'unset';
      // Restore focus to the element that was focused before modal opened
      if (lastFocusedElementRef.current) {
        lastFocusedElementRef.current.focus();
        lastFocusedElementRef.current = null;
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedService]);

  const handleInquiryClick = () => {
    if (selectedService) {
      onOpenQuote(selectedService.id as ServiceType);
    }
    setSelectedService(null);
  };

  return (
    <Section id="services" bg="light" className="relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Our Services
            </h2>
            <p className="text-slate-600 max-w-lg text-lg">
              고객의 비즈니스 성공을 위한 맞춤형 물류 솔루션. <br/>
              제이웨이즈가 물류의 모든 과정을 책임집니다.
            </p>
          </motion.div>

          <div className="flex flex-col gap-4 items-end w-full md:w-auto">
            {/* Search Bar */}
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="relative w-full md:w-72 group"
            >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-jways-blue transition-colors pointer-events-none">
                    <Search size={20} aria-hidden="true" />
                </div>
                <input 
                  type="text" 
                  placeholder="서비스 검색 (예: 항공, 해상)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue shadow-sm hover:shadow-md transition-all placeholder:text-slate-400"
                  aria-label="Search services"
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                        aria-label="Clear search"
                    >
                        <X size={16} aria-hidden="true" />
                    </button>
                )}
            </motion.div>

            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="flex flex-wrap gap-2 md:gap-3 justify-end"
               role="tablist"
               aria-label="Service categories"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === cat}
                  aria-controls="services-grid"
                  id={`tab-${cat}`}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative px-5 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 z-10 ${
                    activeCategory === cat
                      ? 'text-white'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {activeCategory === cat && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 bg-jways-blue rounded-full -z-10 shadow-lg shadow-blue-500/30"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {cat}
                </button>
              ))}
            </motion.div>
          </div>
        </div>

        <motion.div 
          id="services-grid"
          role="tabpanel"
          aria-labelledby={`tab-${activeCategory}`}
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
        >
          <AnimatePresence mode='popLayout'>
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <motion.div
                  layout
                  key={service.id}
                  layoutId={`card-${service.id}`}
                  onClick={() => setSelectedService(service)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  variants={{
                    hover: { 
                        y: -10, 
                        scale: 1.02,
                        transition: { duration: 0.2, ease: "easeOut" }
                    }
                  }}
                  whileHover="hover"
                  className="group relative h-[400px] overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-jways-blue focus-visible:ring-offset-2 focus-visible:outline-none"
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${service.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedService(service);
                    }
                  }}
                >
                  {/* Image Background */}
                  <div className="absolute inset-0">
                    <motion.img
                      layoutId={`image-${service.id}`}
                      src={service.image}
                      alt=""
                      className="w-full h-full object-cover"
                      variants={{
                        hover: { scale: 1.1 }
                      }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300" />
                    
                    {/* Animated Glow Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" aria-hidden="true">
                        <div className="absolute -bottom-[20%] -right-[20%] w-[80%] h-[80%] bg-jways-blue/40 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000 ease-out mix-blend-screen" />
                        <div className="absolute -top-[20%] -left-[20%] w-[60%] h-[60%] bg-cyan-400/20 rounded-full blur-[60px] group-hover:scale-125 transition-transform duration-1000 ease-out delay-100 mix-blend-screen" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 transform transition-transform duration-500 translate-y-0 md:translate-y-12 group-hover:translate-y-0 relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <motion.div 
                        layoutId={`icon-${service.id}`}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-jways-blue text-white flex items-center justify-center shadow-lg"
                      >
                         {service.id === 'air' && (
                            <motion.div
                                variants={{
                                    hover: {
                                        y: [-2, 2, -2],
                                        rotate: [-5, 5, -5],
                                        transition: {
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }
                                    }
                                }}
                            >
                                <service.icon size={24} aria-hidden="true" />
                            </motion.div>
                         )}

                         {service.id === 'ocean' && (
                            <motion.div
                                variants={{
                                    hover: {
                                        x: [-2, 2, -2],
                                        rotate: [-3, 3, -3],
                                        transition: {
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }
                                    }
                                }}
                            >
                                <service.icon size={24} aria-hidden="true" />
                            </motion.div>
                         )}

                         {service.id === 'land' && (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                <motion.g
                                    variants={{ hover: { rotate: 360 } }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    style={{ originX: "5.5px", originY: "18.5px" }}
                                >
                                    <circle cx="5.5" cy="18.5" r="2.5" />
                                    <path d="M5.5 17v3" strokeWidth="1.5" />
                                </motion.g>
                                <motion.g
                                    variants={{ hover: { rotate: 360 } }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    style={{ originX: "18.5px", originY: "18.5px" }}
                                >
                                    <circle cx="18.5" cy="18.5" r="2.5" />
                                    <path d="M18.5 17v3" strokeWidth="1.5" />
                                </motion.g>
                            </svg>
                         )}

                         {!['air', 'ocean', 'land'].includes(service.id) && (
                            <motion.div
                                variants={{
                                    hover: { scale: [1, 1.1, 1] }
                                }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <service.icon size={24} aria-hidden="true" />
                            </motion.div>
                         )}
                      </motion.div>
                      <motion.h3 
                        layoutId={`title-${service.id}`} 
                        className="text-xl md:text-2xl font-bold text-white"
                        variants={{
                            hover: { y: -5 }
                        }}
                      >
                        {service.title}
                      </motion.h3>
                    </div>
                    
                    <p className="text-slate-200 mb-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-2 text-sm md:text-base">
                      {service.description}
                    </p>

                    <div className="flex items-center gap-2 text-white font-semibold text-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 delay-200" aria-hidden="true">
                      자세히 보기 <ArrowUpRight size={16} />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
                <motion.div
                    key="no-results"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200"
                >
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-slate-400">
                        <Search size={32} aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">검색 결과가 없습니다</h3>
                    <p className="text-slate-500 max-w-xs">
                        "{searchQuery}"에 대한 서비스를 찾을 수 없습니다. <br />
                        다른 키워드로 검색해보세요.
                    </p>
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="mt-6 px-6 py-2 bg-white border border-slate-200 hover:border-jways-blue text-slate-600 hover:text-jways-blue rounded-full text-sm font-semibold transition-colors"
                    >
                        전체 목록 보기
                    </button>
                </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby={`modal-title-${selectedService.id}`}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            
            {/* Modal Card */}
            <motion.div
              ref={modalRef}
              layoutId={`card-${selectedService.id}`}
              className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row"
            >
              {/* Close Button - Optimized visibility for both mobile (over image) and desktop (over white bg) */}
              <button 
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-jways-blue 
                           bg-black/20 text-white hover:bg-black/40 backdrop-blur-md
                           md:bg-white md:dark:bg-slate-800 md:text-slate-500 md:dark:text-slate-400 md:shadow-md md:hover:bg-slate-100 md:dark:hover:bg-slate-700"
                aria-label="Close modal"
                autoFocus 
                type="button"
              >
                <X size={24} aria-hidden="true" />
              </button>

              {/* Modal Image Section - Larger Image */}
              <div className="md:w-1/2 h-64 md:h-auto relative">
                <motion.img
                  layoutId={`image-${selectedService.id}`}
                  src={selectedService.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                <div className="absolute bottom-6 left-6 md:hidden">
                    <motion.h3 layoutId={`title-${selectedService.id}`} className="text-3xl font-bold text-white shadow-black drop-shadow-lg">
                        {selectedService.title}
                    </motion.h3>
                </div>
              </div>

              {/* Modal Content Section - Detailed Information */}
              <div className="md:w-1/2 p-8 md:p-12 bg-white dark:bg-slate-900 relative">
                <div className="hidden md:flex items-center gap-4 mb-6">
                    <motion.div 
                        layoutId={`icon-${selectedService.id}`}
                        className="w-14 h-14 rounded-2xl bg-jways-blue text-white flex items-center justify-center shadow-lg"
                    >
                        <selectedService.icon size={28} aria-hidden="true" />
                    </motion.div>
                    <motion.h3 id={`modal-title-${selectedService.id}`} layoutId={`title-desktop-${selectedService.id}`} className="text-3xl font-bold text-slate-900 dark:text-white">
                        {selectedService.title}
                    </motion.h3>
                </div>

                {isLoading ? (
                  // Skeleton Loader
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                    aria-label="Loading content"
                  >
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="h-full bg-jways-blue"
                        />
                    </div>

                    <div className="space-y-3">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-[90%] animate-pulse" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-[95%] animate-pulse" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-[80%] animate-pulse" />
                    </div>

                    <div className="space-y-4 pt-4">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse" />
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6">
                      <div className="w-full h-14 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                    </div>
                  </motion.div>
                ) : (
                  // Actual Content
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { 
                            opacity: 1, 
                            transition: { 
                                staggerChildren: 0.1,
                                when: "beforeChildren"
                            } 
                        }
                    }}
                  >
                      {/* Expanded Description */}
                      <motion.p 
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                        }}
                        className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8"
                      >
                          {selectedService.longDescription}
                      </motion.p>

                      <motion.div 
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                        }}
                        className="space-y-4 mb-10"
                      >
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">주요 특징</h4>
                          <ul className="space-y-3">
                              {selectedService.features.map((feature, idx) => (
                                  <motion.li 
                                    key={idx} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + (idx * 0.1), duration: 0.4 }}
                                    className="flex items-start gap-3 text-slate-600 dark:text-slate-300"
                                  >
                                      <CheckCircle2 className="w-5 h-5 text-jways-blue shrink-0 mt-0.5" aria-hidden="true" />
                                      <span>{feature}</span>
                                  </motion.li>
                              ))}
                          </ul>
                      </motion.div>

                      <motion.button 
                         onClick={handleInquiryClick}
                         variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                         }}
                         className="w-full py-4 bg-jways-navy text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                      >
                          서비스 문의하기
                          <ArrowUpRight size={18} aria-hidden="true" />
                      </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Section>
  );
};

export default Services;