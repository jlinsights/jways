import { getRouteMatch } from './tariff';
import type {
  ShipmentListItem,
  TransportMode,
  ShipmentCO2,
  MonthlyCO2,
  ModeCO2,
  ESGScore,
  ReductionScenario,
  CarbonOffsetEstimate,
  CarbonOffsetProgram,
} from '../types';

// ─── Constants ───

const OFFSET_PROGRAMS: CarbonOffsetProgram[] = [
  { name: 'Gold Standard', description: '가장 엄격한 국제 탄소 크레딧 인증', priceRange: '$20-50/tCO₂e', certification: 'Gold Standard Foundation' },
  { name: 'VCS (Verra)', description: '세계 최대 자발적 탄소 크레딧 프로그램', priceRange: '$10-30/tCO₂e', certification: 'Verra' },
  { name: 'CDM (Clean Development)', description: 'UN 기후변화협약 공식 감축 메커니즘', priceRange: '$5-15/tCO₂e', certification: 'UNFCCC' },
];

// Default CO2 factors when route not found in Tariff Engine
const DEFAULT_CO2_PER_KG = { sea: 0.015, air: 0.58 };

// City pattern → country code mapping for MOCK_SHIPMENTS
const CITY_COUNTRY_MAP: Record<string, string> = {
  'ICN': 'KR', '인천': 'KR',
  'BUS': 'KR', '부산': 'KR',
  'LAX': 'US', '로스앤젤레스': 'US',
  'SHA': 'CN', '상하이': 'CN',
  'NRT': 'JP', '나리타': 'JP',
  'TYO': 'JP', '도쿄': 'JP',
  'HKG': 'SG', '홍콩': 'SG',   // HK not in Tariff → fallback SG
  'SIN': 'SG', '싱가포르': 'SG',
  'HAM': 'DE', '함부르크': 'DE',
  'JFK': 'US', '뉴욕': 'US',
  'RTM': 'NL', '로테르담': 'NL',
  'BKK': 'TH', '방콕': 'TH',
  'SYD': 'AU', '시드니': 'AU',
  'CDG': 'DE', '파리': 'DE',   // FR not in Tariff → fallback DE
};

// ─── Utility ───

export function parseWeight(weightStr: string): number {
  return Number(weightStr.replace(/[^0-9.]/g, '')) || 0;
}

function extractCountryCode(locationStr: string): string {
  // "ICN (인천)" → try "ICN" first, then "인천"
  const parts = locationStr.split(/[()]/);
  for (const part of parts) {
    const trimmed = part.trim();
    if (CITY_COUNTRY_MAP[trimmed]) return CITY_COUNTRY_MAP[trimmed];
  }
  return 'KR'; // fallback
}

function buildPortCode(countryCode: string): string {
  // Build a pseudo port code for getRouteMatch (expects 2-char country prefix)
  return countryCode + 'XXX';
}

// ─── Core CO2 Calculations ───

export function getRouteCO2PerKg(
  origin: string,
  destination: string,
  mode: TransportMode
): number {
  const originCountry = extractCountryCode(origin);
  const destCountry = extractCountryCode(destination);

  const route = getRouteMatch(
    buildPortCode(originCountry),
    buildPortCode(destCountry)
  );

  if (!route) {
    return DEFAULT_CO2_PER_KG[mode];
  }

  return mode === 'sea' ? route.sea.co2PerKg : route.air.co2PerKg;
}

export function calculateShipmentCO2(shipment: ShipmentListItem): ShipmentCO2 {
  const weightKg = parseWeight(shipment.weight);
  const mode = shipment.mode;
  const co2PerKg = getRouteCO2PerKg(shipment.origin, shipment.destination, mode);
  const co2Kg = Math.round(weightKg * co2PerKg * 10) / 10;

  const originCountry = extractCountryCode(shipment.origin);
  const destCountry = extractCountryCode(shipment.destination);

  return {
    shipmentId: shipment.id,
    blNumber: shipment.blNumber,
    origin: shipment.origin,
    destination: shipment.destination,
    mode,
    weightKg,
    co2Kg,
    co2PerKg,
    routeKey: `${originCountry}→${destCountry}`,
    departureDate: shipment.departureDate,
  };
}

export function calculateAllShipmentsCO2(shipments: ShipmentListItem[]): ShipmentCO2[] {
  return shipments.map(calculateShipmentCO2);
}

// ─── Aggregation ───

export function aggregateMonthlyCO2(shipmentCO2s: ShipmentCO2[]): MonthlyCO2[] {
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월'];
  const monthBuckets: Record<number, { emissions: number; count: number }> = {};

  // Initialize 6 months
  for (let i = 1; i <= 6; i++) {
    monthBuckets[i] = { emissions: 0, count: 0 };
  }

  for (const s of shipmentCO2s) {
    const month = new Date(s.departureDate).getMonth() + 1; // 1-12
    if (month >= 1 && month <= 6 && monthBuckets[month]) {
      monthBuckets[month].emissions += s.co2Kg;
      monthBuckets[month].count += 1;
    }
  }

  // Generate target: start at 5000, decrease 5% each month
  let target = 5000;
  return monthNames.map((name, i) => {
    const bucket = monthBuckets[i + 1];
    const result: MonthlyCO2 = {
      month: name,
      emissions: Math.round(bucket.emissions),
      target: Math.round(target),
      shipmentCount: bucket.count,
    };
    target *= 0.95;
    return result;
  });
}

export function aggregateModeCO2(shipmentCO2s: ShipmentCO2[]): ModeCO2[] {
  const seaShipments = shipmentCO2s.filter(s => s.mode === 'sea');
  const airShipments = shipmentCO2s.filter(s => s.mode === 'air');

  const seaTotal = seaShipments.reduce((sum, s) => sum + s.co2Kg, 0);
  const airTotal = airShipments.reduce((sum, s) => sum + s.co2Kg, 0);

  return [
    {
      name: '해상 운송',
      value: Math.round(seaTotal),
      shipmentCount: seaShipments.length,
      avgCO2PerKg: seaShipments.length > 0
        ? Math.round((seaShipments.reduce((sum, s) => sum + s.co2PerKg, 0) / seaShipments.length) * 1000) / 1000
        : 0,
    },
    {
      name: '항공 운송',
      value: Math.round(airTotal),
      shipmentCount: airShipments.length,
      avgCO2PerKg: airShipments.length > 0
        ? Math.round((airShipments.reduce((sum, s) => sum + s.co2PerKg, 0) / airShipments.length) * 1000) / 1000
        : 0,
    },
  ];
}

// ─── ESG Score ───

export function calculateESGScore(shipmentCO2s: ShipmentCO2[]): ESGScore {
  // Environmental: higher sea ratio → higher score
  const totalShipments = shipmentCO2s.length || 1;
  const seaCount = shipmentCO2s.filter(s => s.mode === 'sea').length;
  const seaRatio = seaCount / totalShipments;
  const environmental = Math.min(100, Math.round(seaRatio * 120 + 20));

  // Social: mock-based (safety record)
  const social = 88;

  // Governance: mock-based (compliance rate)
  const governance = 82;

  const overall = Math.round(environmental * 0.4 + social * 0.3 + governance * 0.3);

  let grade: ESGScore['grade'];
  if (overall >= 90) grade = 'A+';
  else if (overall >= 80) grade = 'A';
  else if (overall >= 70) grade = 'B+';
  else if (overall >= 60) grade = 'B';
  else if (overall >= 50) grade = 'C';
  else grade = 'D';

  return { environmental, social, governance, overall, grade };
}

// ─── Reduction Simulator ───

export function simulateReduction(shipmentCO2: ShipmentCO2): ReductionScenario {
  if (shipmentCO2.mode === 'sea') {
    // Already optimal
    return {
      shipmentId: shipmentCO2.shipmentId,
      currentMode: 'sea',
      currentCO2: shipmentCO2.co2Kg,
      alternativeMode: 'air',
      alternativeCO2: shipmentCO2.co2Kg,
      savedCO2: 0,
      savedPercent: 0,
      additionalDays: '-',
      costDifference: '-',
    };
  }

  // Air → Sea conversion
  const seaCO2PerKg = getRouteCO2PerKg(
    shipmentCO2.origin,
    shipmentCO2.destination,
    'sea'
  );
  const alternativeCO2 = Math.round(shipmentCO2.weightKg * seaCO2PerKg * 10) / 10;
  const savedCO2 = Math.round((shipmentCO2.co2Kg - alternativeCO2) * 10) / 10;
  const savedPercent = shipmentCO2.co2Kg > 0
    ? Math.round((savedCO2 / shipmentCO2.co2Kg) * 1000) / 10
    : 0;

  // Estimate additional transit days and cost difference from route data
  const originCountry = extractCountryCode(shipmentCO2.origin);
  const destCountry = extractCountryCode(shipmentCO2.destination);
  const route = getRouteMatch(
    buildPortCode(originCountry),
    buildPortCode(destCountry)
  );

  let additionalDays = '+20~25일';
  let costDifference = '약 -$2,000';
  if (route) {
    const seaDays = route.sea.transitDays; // e.g., "25-30"
    const airDays = route.air.transitDays; // e.g., "3-5"
    additionalDays = `+${seaDays} (항공 ${airDays})`;

    // Rough cost estimate: air is ~5x more expensive per kg
    const seaCost = shipmentCO2.weightKg * (route.sea.basePerKg || 0.04);
    const airCost = shipmentCO2.weightKg * route.air.basePerKg;
    const diff = Math.round(seaCost - airCost);
    costDifference = diff < 0 ? `약 -$${Math.abs(diff).toLocaleString()}` : `약 +$${diff.toLocaleString()}`;
  }

  return {
    shipmentId: shipmentCO2.shipmentId,
    currentMode: 'air',
    currentCO2: shipmentCO2.co2Kg,
    alternativeMode: 'sea',
    alternativeCO2,
    savedCO2,
    savedPercent,
    additionalDays,
    costDifference,
  };
}

// ─── Carbon Offset ───

export function calculateOffsetCost(totalCO2Kg: number): CarbonOffsetEstimate {
  const totalCO2Tonnes = Math.round((totalCO2Kg / 1000) * 100) / 100;
  return {
    totalCO2Kg: Math.round(totalCO2Kg),
    totalCO2Tonnes,
    pricePerTonne: { min: 10, max: 50 },
    estimatedCost: {
      min: Math.round(totalCO2Tonnes * 10 * 100) / 100,
      max: Math.round(totalCO2Tonnes * 50 * 100) / 100,
    },
    currency: 'USD',
    programs: OFFSET_PROGRAMS,
  };
}
