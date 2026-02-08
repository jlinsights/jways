import React, { useRef, useEffect } from 'react';
import { motion, useInView, useMotionValue, useSpring, useScroll, useTransform } from 'framer-motion';
import Section from './ui/Section';

const stats = [
  { value: '150+', label: 'Global Partners', sub: '전 세계 파트너' },
  { value: '24/7', label: 'Support', sub: '연중무휴 지원' },
  { value: '98%', label: 'On-Time', sub: '정시 도착률' },
  { value: '10M+', label: 'Parcels', sub: '연간 처리 물량' },
];

const Counter = ({ value }: { value: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const { number, suffix } = React.useMemo(() => {
    const match = value.match(/^([\d.,]+)(.*)$/);
    if (match) {
      return {
        number: parseFloat(match[1].replace(/,/g, '')),
        suffix: match[2]
      };
    }
    return { number: 0, suffix: '' };
  }, [value]);

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 40, damping: 15, mass: 1 });

  useEffect(() => {
    if (isInView) {
      motionValue.set(number);
    }
  }, [isInView, number, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        // Intentionally using Math.floor to keep integer numbers during animation
        ref.current.textContent = Math.floor(latest).toLocaleString() + suffix;
      }
    });
    return unsubscribe;
  }, [springValue, suffix]);

  // Initial render content
  return <span ref={ref} className="tabular-nums">{number > 0 ? `0${suffix}` : value}</span>;
};

const WhyUs: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Refined animations for the decorative text
  const x = useTransform(scrollYProgress, [0, 1], ["15%", "-15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.12, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return (
    <Section ref={sectionRef} id="about" className="bg-jways-navy relative overflow-hidden">
      {/* Decorative background text */}
      <motion.div 
        style={{ x, opacity, scale }}
        className="absolute top-1/2 left-0 w-full -translate-y-1/2 overflow-hidden leading-none select-none pointer-events-none"
        aria-hidden="true"
      >
        <div className="text-[20vw] font-black text-white whitespace-nowrap text-center tracking-tighter opacity-80 blur-sm">
          JWAYS LOGISTICS
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h4 className="text-jways-blue font-bold tracking-wider uppercase mb-4">Why Choose Us</h4>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                복잡한 물류를 <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">단순하고 명쾌하게.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                제이웨이즈는 단순히 물건을 나르는 것이 아닙니다. 
                우리는 고객의 비즈니스 가치를 전달합니다. 
                빅데이터 기반의 경로 최적화, AI 화물 분석, 블록체인 기반의 보안 시스템으로 
                차원이 다른 물류 경험을 선사합니다.
              </p>
              
              <ul className="space-y-4 mb-8">
                {['실시간 통합 관제 시스템', '통관 및 서류 자동화', '탄소 배출 최소화 친환경 운송'].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 text-slate-300">
                     <div className="w-6 h-6 rounded-full bg-jways-blue/20 flex items-center justify-center text-jways-blue">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                         <polyline points="20 6 9 17 4 12"></polyline>
                       </svg>
                     </div>
                     {item}
                   </li>
                ))}
              </ul>

              <button className="px-8 py-4 border border-white/20 rounded-full text-white hover:bg-white hover:text-jways-navy transition-all font-semibold">
                회사 소개서 다운로드
              </button>
            </motion.div>
          </div>

          <div className="lg:w-1/2 grid grid-cols-2 gap-4 md:gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm text-center hover:bg-white/10 transition-colors"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    <Counter value={stat.value} />
                </div>
                <div className="text-jways-blue font-bold text-lg mb-1">{stat.label}</div>
                <div className="text-slate-500 text-sm">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default WhyUs;