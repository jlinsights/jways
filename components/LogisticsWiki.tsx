import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, BookOpen, Hash } from 'lucide-react';

interface WikiItem {
  term: string;
  def: string;
}

interface WikiCategory {
  category: string;
  items: WikiItem[];
}

const wikiData: WikiCategory[] = [
  {
    category: '해상 운송 기본 용어',
    items: [
      { term: 'FCL (Full Container Load)', def: '한 화주의 화물로 컨테이너 1개를 가득 채우는 운송 방식입니다. 단독으로 컨테이너를 사용하므로 화물 혼재 과정이 없어 비교적 안전하고 신속합니다.' },
      { term: 'LCL (Less than Container Load)', def: '컨테이너 1개를 채우기 부족한 소량 화물을 여러 화주의 화물과 혼재(Consolidation)하여 함께 운송하는 방식입니다. CBM 단위로 운임을 정산합니다.' },
      { term: 'B/L (Bill of Lading, 선하증권)', def: '운송인이 화물을 인수했다는 증명서이자, 목적지에서 화물을 인도받을 수 있는 권리를 나타내는 가장 중요한 유가증권입니다. 원본 B/L 외에 Surrendered B/L 방식도 많이 쓰입니다.' },
      { term: 'CBM (Cubic Meter)', def: '가로 1m x 세로 1m x 높이 1m의 부피. 해상 LCL 화물 운임을 산정하는 척도로 사용됩니다.' },
    ]
  },
  {
    category: '통관 및 관세청 연관',
    items: [
      { term: 'HS Code (품목분류번호)', def: '국제 통일 상품 분류 체계에 따라 무역 거래 상품을 숫자 코드로 분류한 것입니다. 관세율을 결정하고 수입 요건을 확인하는 핵심 기준이 됩니다.' },
      { term: '관부가세', def: '물품 수입 시 국가에 납부하는 세금입니다. 관세(일반적으로 물품가액+운임의 약 8%)와 부가가치세(관세가 포함된 과세가격의 10%)로 구성됩니다.' },
      { term: '통관 보류 (Customs Hold)', def: '수출입 신고 건에 대해 서류 미비, 품목 검사 필요 등의 사유로 세관에서 통관(결재)을 일시 정지하는 조치입니다.' },
    ]
  },
  {
    category: '주요 부대 비용 (Surcharges)',
    items: [
      { term: 'THC (Terminal Handling Charge)', def: '터미널 화물 처리비. 컨테이너가 터미널에 입고되어 선박에 싣기까지, 또는 하역되어 게이트를 나갈 때까지 발생하는 항만 하역 및 이동 비용입니다.' },
      { term: 'BAF (Bunker Adjustment Factor)', def: '유류할증료. 선박의 주 연료인 벙커유의 가격 변동에 따른 손실을 보전하기 위해 기본 운임 외에 부과하는 할증료입니다.' },
      { term: 'Demurrage & Detention', def: 'Demurrage(체화료): 컨테이너가 지정된 항만 터미널(CY) 내에서 무료 기간(Free Time)을 초과해 머무를 때 부과.\nDetention(지체료): CY 밖으로 반출한 빈 컨테이너를 무료 기간 내에 반납하지 않을 때 부과.' },
    ]
  }
];

const LogisticsWiki: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]); // Array of item terms

  // Filter logic
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return wikiData;
    
    const termLower = searchTerm.toLowerCase();
    
    return wikiData.map(category => ({
      ...category,
      items: category.items.filter(item => 
        item.term.toLowerCase().includes(termLower) || 
        item.def.toLowerCase().includes(termLower)
      )
    })).filter(category => category.items.length > 0);
  }, [searchTerm]);

  const toggleItem = (term: string) => {
    setExpandedItems(prev => 
      prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term]
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      {/* Header & Search */}
       <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 md:p-8 text-white relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm text-indigo-100">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold">물류 백과사전 & FAQ</h3>
              <p className="text-indigo-200 text-sm mt-0.5">헷갈리는 무역 용어를 쉽게 검색해 보세요.</p>
            </div>
          </div>

          <div className="relative mt-6 max-w-xl">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="FCL, 적하보험, 관세 등 검색어 입력..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 hover:border-white/40 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder:text-indigo-200/70 rounded-2xl py-3 pl-12 pr-4 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 max-h-[600px] overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950">
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">"{searchTerm}"에 대한 검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredData.map((category, cIdx) => (
              <div key={cIdx} className="space-y-4">
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <Hash size={16} className="text-jways-blue" />
                  {category.category}
                </h4>
                
                <div className="space-y-3">
                  {category.items.map((item) => {
                    const isExpanded = expandedItems.includes(item.term) || searchTerm.trim().length > 0;
                    
                    return (
                      <div 
                        key={item.term} 
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all hover:border-jways-blue/30"
                      >
                        <button 
                          onClick={() => toggleItem(item.term)}
                          className="w-full flex items-center justify-between p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-jways-blue/50"
                        >
                          <span className="font-bold text-slate-900 dark:text-white text-sm md:text-base pr-4">
                            {item.term}
                          </span>
                          <span className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown size={18} />
                          </span>
                        </button>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="px-4 pb-4"
                            >
                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm whitespace-pre-wrap leading-relaxed">
                                {item.def}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticsWiki;
