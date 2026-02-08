import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Tracking from './components/Tracking';
import Services from './components/Services';
import WhyUs from './components/WhyUs';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main>
        <Hero />
        <Tracking />
        <Services />
        
        {/* Call to Action Section inserted between major blocks */}
        <section className="bg-white py-24 px-6">
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