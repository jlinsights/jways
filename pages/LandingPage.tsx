import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Tracking from '../components/Tracking';
import CBMCalculator from '../components/CBMCalculator';
import ExchangeRate from '../components/ExchangeRate';
import IncotermsGuide from '../components/IncotermsGuide';
import LogisticsWiki from '../components/LogisticsWiki';
import Services from '../components/Services';
import WhyUs from '../components/WhyUs';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import QuoteModal from '../components/QuoteModal';
import { ServiceType, QuoteModalState } from '../types';

const LandingPage: React.FC = () => {
  const [quoteModal, setQuoteModal] = useState<QuoteModalState>({ isOpen: false });

  const openQuoteModal = (preSelectedService?: ServiceType) => {
    setQuoteModal({ isOpen: true, preSelectedService });
  };

  const closeQuoteModal = () => {
    setQuoteModal({ isOpen: false });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Header />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        <Hero onOpenQuote={() => openQuoteModal()} />
        <Tracking />
        <section className="py-24 px-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">화물 부피 & 운임 중량 계산</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">가로, 세로, 높이와 무게를 입력하여 예상되는 CBM과 해상/항공 적용 운임 중량을 실시간으로 확인해 보세요.</p>
            </div>
            <CBMCalculator />
          </div>
        </section>
        <Services onOpenQuote={(service: ServiceType) => openQuoteModal(service)} />

        {/* Call to Action Section inserted between major blocks */}
        <section className="bg-white dark:bg-slate-900 py-24 px-6 transition-colors duration-300">
           <div className="max-w-5xl mx-auto bg-gradient-to-r from-jways-blue to-indigo-600 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10">
               <h2 className="text-3xl md:text-4xl font-bold mb-6">준비되셨나요?</h2>
               <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                 제이웨이즈와 함께라면 전 세계 어디든 당신의 시장이 됩니다. <br/>
                 지금 바로 무료 견적을 받아보세요.
               </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <button
                   onClick={() => openQuoteModal()}
                   className="px-8 py-4 bg-white text-jways-blue font-bold rounded-full hover:bg-slate-100 transition-colors shadow-lg"
                 >
                   무료 견적 요청하기
                 </button>
                 <Link
                   to="/instant-quote"
                   className="px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-jways-blue transition-all"
                 >
                   빠른 운임 조회
                 </Link>
               </div>
             </div>
           </div>
        </section>

        {/* Trade Knowledge & Resources Section */}
        <section className="bg-slate-50 dark:bg-slate-950 py-24 px-6 transition-colors duration-300 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">무역 백과사전 & 리소스</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">초보 화주부터 수출입 전문가까지, 효율적이고 안전한 무역 업무를 위한 필수 정보와 가이드를 제공합니다.</p>
            </div>
            
            <ExchangeRate />
            
            <IncotermsGuide />
            
            <LogisticsWiki />
          </div>
        </section>

        <WhyUs />
      </main>
      <Footer />
      <ScrollToTop />
      <QuoteModal
        isOpen={quoteModal.isOpen}
        onClose={closeQuoteModal}
        preSelectedService={quoteModal.preSelectedService}
      />
    </div>
  );
}

export default LandingPage;
