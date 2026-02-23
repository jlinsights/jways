import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Ship, TrendingDown, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { icon: Ship, label: '해상 운송 비율', value: '68%', description: '친환경 해상 운송 적극 활용' },
  { icon: TrendingDown, label: '탄소 배출 감축', value: '-14%', description: '전년 동기 대비 감축 실적' },
  { icon: Award, label: 'ESG 등급', value: 'A', description: '자체 ESG 평가 기준 달성' },
];

const ESGSection: React.FC = () => {
  return (
    <section
      aria-labelledby="esg-section-title"
      className="py-24 px-6 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300 border-t border-teal-100 dark:border-slate-800"
    >
      <div className="max-w-5xl mx-auto text-center">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-sm font-bold mb-6">
            <Leaf size={16} /> ESG Commitment
          </div>
          <h2 id="esg-section-title" className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            친환경 물류, 제이웨이즈의 약속
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            지속 가능한 미래를 위해 탄소 배출량을 줄이고<br className="hidden sm:inline" />
            친환경 운송 솔루션을 제공합니다.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              role="article"
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-teal-100 dark:border-slate-700 shadow-sm"
            >
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                <stat.icon size={24} />
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mb-2">{stat.value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/login"
            className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-full transition-colors shadow-lg shadow-teal-500/20"
          >
            🔒 ESG 상세 리포트 보기
          </Link>
          <Link
            to="/instant-quote"
            className="px-8 py-4 border-2 border-teal-600 dark:border-teal-500 text-teal-700 dark:text-teal-400 font-bold rounded-full hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
          >
            💡 무료 CO₂ 계산해보기
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ESGSection;
