import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Tracking from './components/Tracking';
import CBMCalculator from './components/CBMCalculator';
import Services from './components/Services';
import WhyUs from './components/WhyUs';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Header />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        <Hero />
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
        <Services />
        
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
               <button className="px-8 py-4 bg-white text-jways-blue font-bold rounded-full hover:bg-slate-100 transition-colors shadow-lg">
                 무료 견적 요청하기
               </button>
             </div>
           </div>
        </section>

        <WhyUs />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default App;