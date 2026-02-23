import type { PortInfo, Incoterms, ContainerType, TariffBreakdown, TariffResult, QuoteComparisonResult, QuoteHistoryItem } from '../types';

// ─── Major Ports (20) ───

export const MAJOR_PORTS: PortInfo[] = [
  // Korea
  { code: 'KRPUS', name: '부산항', nameEn: 'Busan', country: 'KR', type: 'sea' },
  { code: 'KRICN', name: '인천항', nameEn: 'Incheon', country: 'KR', type: 'both' },
  { code: 'KRICN-AIR', name: '인천공항', nameEn: 'Incheon Airport', country: 'KR', type: 'air' },
  // Asia
  { code: 'CNSHA', name: '상하이항', nameEn: 'Shanghai', country: 'CN', type: 'sea' },
  { code: 'CNPEK', name: '베이징공항', nameEn: 'Beijing Airport', country: 'CN', type: 'air' },
  { code: 'JPTYO', name: '도쿄항', nameEn: 'Tokyo', country: 'JP', type: 'both' },
  { code: 'SGSIN', name: '싱가포르항', nameEn: 'Singapore', country: 'SG', type: 'both' },
  { code: 'HKHKG', name: '홍콩항', nameEn: 'Hong Kong', country: 'HK', type: 'both' },
  { code: 'VNSGN', name: '호치민항', nameEn: 'Ho Chi Minh', country: 'VN', type: 'sea' },
  // Americas
  { code: 'USLAX', name: 'LA항', nameEn: 'Los Angeles', country: 'US', type: 'sea' },
  { code: 'USLAX-AIR', name: 'LA공항', nameEn: 'LAX Airport', country: 'US', type: 'air' },
  { code: 'USNYC', name: '뉴욕항', nameEn: 'New York', country: 'US', type: 'both' },
  // Europe
  { code: 'DEHAM', name: '함부르크항', nameEn: 'Hamburg', country: 'DE', type: 'sea' },
  { code: 'DEFRA', name: '프랑크푸르트공항', nameEn: 'Frankfurt Airport', country: 'DE', type: 'air' },
  { code: 'NLRTM', name: '로테르담항', nameEn: 'Rotterdam', country: 'NL', type: 'sea' },
  { code: 'GBFXT', name: '펠릭스토우항', nameEn: 'Felixstowe', country: 'GB', type: 'sea' },
  // Middle East / Others
  { code: 'AEJEA', name: '제벨알리항', nameEn: 'Jebel Ali', country: 'AE', type: 'sea' },
  { code: 'AEDXB', name: '두바이공항', nameEn: 'Dubai Airport', country: 'AE', type: 'air' },
  { code: 'AUBNE', name: '브리즈번항', nameEn: 'Brisbane', country: 'AU', type: 'sea' },
  { code: 'THLCH', name: '랏차방항', nameEn: 'Laem Chabang', country: 'TH', type: 'sea' },
];

// ─── Route Tariff Data (10 Routes) ───

interface RouteTariff {
  origin: string;
  destination: string;
  sea: {
    basePerCBM: number;
    basePerKg: number;
    container20ft: number;
    container40ft: number;
    container40hc: number;
    bafPercent: number;
    thc: number;
    docFee: number;
    transitDays: string;
    co2PerKg: number;
  };
  air: {
    basePerKg: number;
    minCharge: number;
    fscPercent: number;
    thc: number;
    docFee: number;
    transitDays: string;
    co2PerKg: number;
  };
}

const ROUTE_TARIFFS: RouteTariff[] = [
  {
    origin: 'KR', destination: 'US',
    sea: { basePerCBM: 45, basePerKg: 0.04, container20ft: 1800, container40ft: 2800, container40hc: 3100, bafPercent: 15, thc: 250, docFee: 65, transitDays: '25-30', co2PerKg: 0.016 },
    air: { basePerKg: 5.5, minCharge: 150, fscPercent: 10, thc: 80, docFee: 65, transitDays: '3-5', co2PerKg: 0.602 },
  },
  {
    origin: 'KR', destination: 'CN',
    sea: { basePerCBM: 25, basePerKg: 0.025, container20ft: 800, container40ft: 1300, container40hc: 1450, bafPercent: 10, thc: 180, docFee: 50, transitDays: '3-5', co2PerKg: 0.012 },
    air: { basePerKg: 3.0, minCharge: 100, fscPercent: 8, thc: 50, docFee: 50, transitDays: '1-2', co2PerKg: 0.55 },
  },
  {
    origin: 'KR', destination: 'JP',
    sea: { basePerCBM: 20, basePerKg: 0.02, container20ft: 650, container40ft: 1050, container40hc: 1200, bafPercent: 8, thc: 160, docFee: 50, transitDays: '2-4', co2PerKg: 0.010 },
    air: { basePerKg: 2.8, minCharge: 80, fscPercent: 8, thc: 45, docFee: 50, transitDays: '1', co2PerKg: 0.50 },
  },
  {
    origin: 'KR', destination: 'DE',
    sea: { basePerCBM: 55, basePerKg: 0.05, container20ft: 2200, container40ft: 3400, container40hc: 3750, bafPercent: 18, thc: 280, docFee: 75, transitDays: '30-35', co2PerKg: 0.018 },
    air: { basePerKg: 6.0, minCharge: 200, fscPercent: 12, thc: 90, docFee: 75, transitDays: '3-5', co2PerKg: 0.65 },
  },
  {
    origin: 'KR', destination: 'NL',
    sea: { basePerCBM: 52, basePerKg: 0.048, container20ft: 2100, container40ft: 3250, container40hc: 3600, bafPercent: 17, thc: 270, docFee: 70, transitDays: '28-33', co2PerKg: 0.017 },
    air: { basePerKg: 5.8, minCharge: 190, fscPercent: 11, thc: 85, docFee: 70, transitDays: '3-5', co2PerKg: 0.63 },
  },
  {
    origin: 'KR', destination: 'SG',
    sea: { basePerCBM: 30, basePerKg: 0.03, container20ft: 1100, container40ft: 1750, container40hc: 1950, bafPercent: 12, thc: 200, docFee: 55, transitDays: '7-10', co2PerKg: 0.014 },
    air: { basePerKg: 3.5, minCharge: 120, fscPercent: 9, thc: 60, docFee: 55, transitDays: '2-3', co2PerKg: 0.56 },
  },
  {
    origin: 'KR', destination: 'VN',
    sea: { basePerCBM: 28, basePerKg: 0.028, container20ft: 950, container40ft: 1550, container40hc: 1750, bafPercent: 11, thc: 190, docFee: 50, transitDays: '5-8', co2PerKg: 0.013 },
    air: { basePerKg: 3.2, minCharge: 110, fscPercent: 8, thc: 55, docFee: 50, transitDays: '2', co2PerKg: 0.54 },
  },
  {
    origin: 'KR', destination: 'AE',
    sea: { basePerCBM: 48, basePerKg: 0.045, container20ft: 1900, container40ft: 3000, container40hc: 3300, bafPercent: 16, thc: 260, docFee: 65, transitDays: '18-22', co2PerKg: 0.015 },
    air: { basePerKg: 4.5, minCharge: 160, fscPercent: 10, thc: 75, docFee: 65, transitDays: '3-4', co2PerKg: 0.58 },
  },
  {
    origin: 'KR', destination: 'AU',
    sea: { basePerCBM: 42, basePerKg: 0.04, container20ft: 1700, container40ft: 2650, container40hc: 2950, bafPercent: 14, thc: 240, docFee: 60, transitDays: '14-18', co2PerKg: 0.015 },
    air: { basePerKg: 5.0, minCharge: 170, fscPercent: 10, thc: 70, docFee: 60, transitDays: '3-4', co2PerKg: 0.60 },
  },
  {
    origin: 'KR', destination: 'TH',
    sea: { basePerCBM: 26, basePerKg: 0.026, container20ft: 900, container40ft: 1450, container40hc: 1650, bafPercent: 10, thc: 185, docFee: 50, transitDays: '5-7', co2PerKg: 0.013 },
    air: { basePerKg: 3.0, minCharge: 100, fscPercent: 8, thc: 50, docFee: 50, transitDays: '2', co2PerKg: 0.53 },
  },
];

// ─── Port Search ───

export function searchPorts(query: string, modeFilter?: 'sea' | 'air' | 'both'): PortInfo[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  return MAJOR_PORTS.filter((port) => {
    const matchesQuery =
      port.code.toLowerCase().includes(q) ||
      port.name.includes(query) ||
      port.nameEn.toLowerCase().includes(q) ||
      port.country.toLowerCase().includes(q);
    if (!matchesQuery) return false;
    if (!modeFilter || modeFilter === 'both') return true;
    return port.type === modeFilter || port.type === 'both';
  });
}

// ─── Route Matching ───

export function getRouteMatch(originCode: string, destCode: string): RouteTariff | null {
  const originCountry = originCode.substring(0, 2);
  const destCountry = destCode.substring(0, 2);

  // Direct match
  let match = ROUTE_TARIFFS.find(
    (r) => r.origin === originCountry && r.destination === destCountry
  );
  if (match) return match;

  // Reverse match
  match = ROUTE_TARIFFS.find(
    (r) => r.origin === destCountry && r.destination === originCountry
  );
  if (match) return match;

  // Default: use KR→US as fallback
  return ROUTE_TARIFFS[0];
}

// ─── Incoterms Cost Adjustment ───

function applyIncoterms(
  breakdown: TariffBreakdown,
  incoterms: Incoterms,
  baseTotal: number
): TariffBreakdown {
  switch (incoterms) {
    case 'EXW':
      return {
        baseFreight: 0,
        baf: 0,
        thc: 0,
        docFee: 0,
      };
    case 'FOB':
      return { ...breakdown };
    case 'CIF':
      return {
        ...breakdown,
        insurance: Math.round(baseTotal * 0.003 * 100) / 100,
      };
    case 'DDP':
      return {
        ...breakdown,
        insurance: Math.round(baseTotal * 0.003 * 100) / 100,
        customs: Math.round(baseTotal * 0.08 * 100) / 100,
        inland: 150,
      };
    default:
      return { ...breakdown };
  }
}

function sumBreakdown(b: TariffBreakdown): number {
  return (
    b.baseFreight +
    b.baf +
    b.thc +
    b.docFee +
    (b.insurance ?? 0) +
    (b.customs ?? 0) +
    (b.inland ?? 0)
  );
}

// ─── Sea Freight Calculation ───

function calculateSeaFreight(
  route: RouteTariff,
  weightKg: number,
  cbm: number,
  container: ContainerType,
  incoterms: Incoterms
): TariffResult {
  const s = route.sea;

  // Container-based pricing
  let baseFreight: number;
  switch (container) {
    case '40ft':
      baseFreight = s.container40ft;
      break;
    case '40ft-hc':
      baseFreight = s.container40hc;
      break;
    default:
      baseFreight = s.container20ft;
  }

  // Also add CBM-based surcharge for LCL
  const cbmCharge = cbm * s.basePerCBM;
  baseFreight = Math.max(baseFreight, cbmCharge);

  const baf = Math.round(baseFreight * (s.bafPercent / 100));
  const fobBreakdown: TariffBreakdown = {
    baseFreight: Math.round(baseFreight),
    baf,
    thc: s.thc,
    docFee: s.docFee,
  };

  const fobTotal = sumBreakdown(fobBreakdown);
  const breakdown = applyIncoterms(fobBreakdown, incoterms, fobTotal);
  const totalPrice = Math.round(sumBreakdown(breakdown));

  return {
    mode: 'sea',
    totalPrice,
    currency: 'USD',
    breakdown,
    transitDays: s.transitDays,
    co2Kg: Math.round(weightKg * s.co2PerKg * 10) / 10,
    containerType: container,
    chargeableWeight: Math.max(weightKg, cbm * 1000),
  };
}

// ─── Air Freight Calculation ───

function calculateAirFreight(
  route: RouteTariff,
  weightKg: number,
  cbm: number,
  incoterms: Incoterms
): TariffResult {
  const a = route.air;

  // Volume weight (air: CBM * 167)
  const volumeWeight = cbm * 167;
  const chargeableWeight = Math.max(weightKg, volumeWeight);

  let baseFreight = Math.max(chargeableWeight * a.basePerKg, a.minCharge);
  baseFreight = Math.round(baseFreight);

  const fsc = Math.round(baseFreight * (a.fscPercent / 100));
  const fobBreakdown: TariffBreakdown = {
    baseFreight,
    baf: fsc,
    thc: a.thc,
    docFee: a.docFee,
  };

  const fobTotal = sumBreakdown(fobBreakdown);
  const breakdown = applyIncoterms(fobBreakdown, incoterms, fobTotal);
  const totalPrice = Math.round(sumBreakdown(breakdown));

  return {
    mode: 'air',
    totalPrice,
    currency: 'USD',
    breakdown,
    transitDays: a.transitDays,
    co2Kg: Math.round(chargeableWeight * a.co2PerKg * 10) / 10,
    chargeableWeight,
  };
}

// ─── Recommendation Logic ───

function getRecommendation(
  sea: TariffResult | null,
  air: TariffResult | null
): { mode: 'sea' | 'air' | null; reason: string } {
  if (!sea && !air) return { mode: null, reason: '' };
  if (!sea) return { mode: 'air', reason: '항공 운송만 가능한 구간입니다.' };
  if (!air) return { mode: 'sea', reason: '해상 운송만 가능한 구간입니다.' };

  if (sea.totalPrice < air.totalPrice * 0.6) {
    return { mode: 'sea', reason: '해상 운송이 40% 이상 저렴합니다.' };
  }
  if (air.totalPrice < sea.totalPrice) {
    return { mode: 'air', reason: '항공 운송이 더 경제적입니다.' };
  }
  return { mode: 'sea', reason: '비용 대비 효율이 높습니다.' };
}

// ─── Main Calculation ───

export function calculateQuote(params: {
  origin: PortInfo;
  destination: PortInfo;
  weightKg: number;
  cbm: number;
  incoterms: Incoterms;
  containerType?: ContainerType;
}): QuoteComparisonResult {
  const { origin, destination, weightKg, cbm, incoterms, containerType = '20ft' } = params;
  const route = getRouteMatch(origin.code, destination.code);

  if (!route) {
    return { sea: null, air: null, recommended: null, recommendReason: '해당 구간의 요금 데이터가 없습니다.' };
  }

  const canSea = origin.type !== 'air' && destination.type !== 'air';
  const canAir = origin.type !== 'sea' && destination.type !== 'sea';

  const sea = canSea ? calculateSeaFreight(route, weightKg, cbm, containerType, incoterms) : null;
  const air = canAir ? calculateAirFreight(route, weightKg, cbm, incoterms) : null;

  const rec = getRecommendation(sea, air);

  return {
    sea,
    air,
    recommended: rec.mode,
    recommendReason: rec.reason,
  };
}

// ─── Currency Formatting ───

export function formatUSD(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
}

// ─── History Management ───

const HISTORY_KEY = 'jways_quote_history';
const MAX_HISTORY = 10;

export function getQuoteHistory(): QuoteHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QuoteHistoryItem[];
  } catch {
    return [];
  }
}

export function saveQuoteHistory(item: QuoteHistoryItem): void {
  const history = getQuoteHistory();
  // Prepend new item (LIFO)
  const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function removeQuoteHistoryItem(id: string): void {
  const history = getQuoteHistory().filter((h) => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearQuoteHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

// ─── Relative Time ───

export function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}
