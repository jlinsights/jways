import type {
  DashboardUser,
  ShipmentListItem,
  ShipmentStatus,
  QuoteHistory,
  QuoteStatus,
  QuoteFormData,
  DashboardDocument,
  DocumentCategory,
  Invoice,
  InvoiceStatus,
  BillingSummary,
  UserProfile,
  NotificationSetting,
} from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Mock Data ───

const MOCK_USER: DashboardUser = {
  id: 'usr-001',
  name: '홍길동',
  email: 'test@jways.co.kr',
  company: '삼성전자 (주)',
  phone: '010-1234-5678',
  role: 'customer',
};

const MOCK_SHIPMENTS: ShipmentListItem[] = [
  { id: 'SH-001', blNumber: 'JW-8839-KR', origin: 'ICN (인천)', destination: 'LAX (로스앤젤레스)', status: 'in-transit', mode: 'sea', departureDate: '2026-02-15', estimatedArrival: '2026-02-28', cargoType: '일반화물', weight: '2,500 kg', containerCount: 1, progress: 65 },
  { id: 'SH-002', blNumber: 'JW-7721-KR', origin: 'BUS (부산)', destination: 'SHA (상하이)', status: 'delivered', mode: 'sea', departureDate: '2026-02-05', estimatedArrival: '2026-02-12', cargoType: '전자부품', weight: '1,200 kg', progress: 100 },
  { id: 'SH-003', blNumber: 'JW-9102-KR', origin: 'ICN (인천)', destination: 'NRT (나리타)', status: 'in-transit', mode: 'air', departureDate: '2026-02-20', estimatedArrival: '2026-02-21', cargoType: '반도체', weight: '450 kg', progress: 80 },
  { id: 'SH-004', blNumber: 'JW-6543-KR', origin: 'BUS (부산)', destination: 'HKG (홍콩)', status: 'customs', mode: 'sea', departureDate: '2026-02-10', estimatedArrival: '2026-02-18', cargoType: '냉동식품', weight: '5,000 kg', containerCount: 2, progress: 90 },
  { id: 'SH-005', blNumber: 'JW-3345-KR', origin: 'ICN (인천)', destination: 'SIN (싱가포르)', status: 'delivered', mode: 'air', departureDate: '2026-02-01', estimatedArrival: '2026-02-02', cargoType: '의약품', weight: '200 kg', progress: 100 },
  { id: 'SH-006', blNumber: 'JW-4421-KR', origin: 'BUS (부산)', destination: 'HAM (함부르크)', status: 'in-transit', mode: 'sea', departureDate: '2026-02-08', estimatedArrival: '2026-03-05', cargoType: '자동차부품', weight: '12,000 kg', containerCount: 3, progress: 40 },
  { id: 'SH-007', blNumber: 'JW-5567-KR', origin: 'ICN (인천)', destination: 'JFK (뉴욕)', status: 'delayed', mode: 'air', departureDate: '2026-02-18', estimatedArrival: '2026-02-22', cargoType: '화장품', weight: '800 kg', progress: 55 },
  { id: 'SH-008', blNumber: 'JW-1198-KR', origin: 'BUS (부산)', destination: 'RTM (로테르담)', status: 'delivered', mode: 'sea', departureDate: '2026-01-20', estimatedArrival: '2026-02-15', cargoType: '섬유제품', weight: '8,500 kg', containerCount: 2, progress: 100 },
  { id: 'SH-009', blNumber: 'JW-2234-KR', origin: 'ICN (인천)', destination: 'BKK (방콕)', status: 'customs', mode: 'air', departureDate: '2026-02-22', estimatedArrival: '2026-02-23', cargoType: '전자제품', weight: '350 kg', progress: 85 },
  { id: 'SH-010', blNumber: 'JW-8870-KR', origin: 'BUS (부산)', destination: 'SYD (시드니)', status: 'in-transit', mode: 'sea', departureDate: '2026-02-12', estimatedArrival: '2026-03-01', cargoType: '일반화물', weight: '6,200 kg', containerCount: 2, progress: 50 },
  { id: 'SH-011', blNumber: 'JW-9901-KR', origin: 'ICN (인천)', destination: 'CDG (파리)', status: 'delivered', mode: 'air', departureDate: '2026-02-03', estimatedArrival: '2026-02-04', cargoType: '화장품', weight: '150 kg', progress: 100 },
  { id: 'SH-012', blNumber: 'JW-0055-KR', origin: 'BUS (부산)', destination: 'TYO (도쿄)', status: 'pending', mode: 'sea', departureDate: '2026-02-26', estimatedArrival: '2026-03-03', cargoType: '화학제품', weight: '3,000 kg', containerCount: 1, progress: 0 },
];

const MOCK_QUOTES: QuoteHistory[] = [
  { id: 'QT-2024-001', requestDate: '2026-02-20', serviceType: 'air', origin: 'ICN (인천)', destination: 'LAX (로스앤젤레스)', cargoType: '일반화물', weight: '500 kg', status: 'pending', estimatedPrice: '₩3,500,000', validUntil: '2026-02-27', assignedManager: '김물류' },
  { id: 'QT-2024-002', requestDate: '2026-02-18', serviceType: 'ocean', origin: 'BUS (부산)', destination: 'HKG (홍콩)', cargoType: '냉동식품', weight: '5,000 kg', status: 'approved', estimatedPrice: '₩8,200,000', validUntil: '2026-03-18', assignedManager: '박해운' },
  { id: 'QT-2024-003', requestDate: '2026-02-15', serviceType: 'air', origin: 'ICN (인천)', destination: 'NRT (나리타)', cargoType: '반도체', weight: '200 kg', status: 'approved', estimatedPrice: '₩1,800,000', validUntil: '2026-03-15', assignedManager: '김물류' },
  { id: 'QT-2024-004', requestDate: '2026-02-10', serviceType: 'ocean', origin: 'BUS (부산)', destination: 'HAM (함부르크)', cargoType: '자동차부품', weight: '12,000 kg', status: 'expired', estimatedPrice: '₩25,000,000', validUntil: '2026-02-17' },
  { id: 'QT-2024-005', requestDate: '2026-02-22', serviceType: 'land', origin: '서울', destination: '부산', cargoType: '전자부품', weight: '1,000 kg', status: 'pending', estimatedPrice: '₩950,000', validUntil: '2026-03-01', assignedManager: '이택배' },
  { id: 'QT-2024-006', requestDate: '2026-02-08', serviceType: 'warehouse', origin: '인천 자유무역지역', destination: '-', cargoType: '일반화물', weight: '3,000 kg', status: 'rejected', assignedManager: '박해운' },
];

const MOCK_DOCUMENTS: DashboardDocument[] = [
  { id: 'DOC-001', name: 'BL-JW8839-KR', category: 'bl', shipmentId: 'SH-001', shipmentBlNumber: 'JW-8839-KR', uploadDate: '2026-02-15', fileSize: '245 KB', status: 'issued' },
  { id: 'DOC-002', name: 'INV-2024-0839', category: 'invoice', shipmentId: 'SH-001', shipmentBlNumber: 'JW-8839-KR', uploadDate: '2026-02-15', fileSize: '128 KB', status: 'issued' },
  { id: 'DOC-003', name: 'PL-JW8839', category: 'packing-list', shipmentId: 'SH-001', shipmentBlNumber: 'JW-8839-KR', uploadDate: '2026-02-15', fileSize: '89 KB', status: 'issued' },
  { id: 'DOC-004', name: 'BL-JW7721-KR', category: 'bl', shipmentId: 'SH-002', shipmentBlNumber: 'JW-7721-KR', uploadDate: '2026-02-05', fileSize: '231 KB', status: 'issued' },
  { id: 'DOC-005', name: 'INV-2024-0721', category: 'invoice', shipmentId: 'SH-002', shipmentBlNumber: 'JW-7721-KR', uploadDate: '2026-02-05', fileSize: '115 KB', status: 'issued' },
  { id: 'DOC-006', name: 'CO-JW9102', category: 'co', shipmentId: 'SH-003', shipmentBlNumber: 'JW-9102-KR', uploadDate: '2026-02-20', fileSize: '67 KB', status: 'issued' },
  { id: 'DOC-007', name: 'BL-JW6543-KR', category: 'bl', shipmentId: 'SH-004', shipmentBlNumber: 'JW-6543-KR', uploadDate: '2026-02-10', fileSize: '256 KB', status: 'issued' },
  { id: 'DOC-008', name: 'INV-2024-0543', category: 'invoice', shipmentId: 'SH-004', shipmentBlNumber: 'JW-6543-KR', uploadDate: '2026-02-10', fileSize: '142 KB', status: 'pending' },
  { id: 'DOC-009', name: 'INS-JW3345', category: 'insurance', shipmentId: 'SH-005', shipmentBlNumber: 'JW-3345-KR', uploadDate: '2026-02-01', fileSize: '98 KB', status: 'issued' },
  { id: 'DOC-010', name: 'BL-JW4421-KR', category: 'bl', shipmentId: 'SH-006', shipmentBlNumber: 'JW-4421-KR', uploadDate: '2026-02-08', fileSize: '278 KB', status: 'issued' },
  { id: 'DOC-011', name: 'PL-JW4421', category: 'packing-list', shipmentId: 'SH-006', shipmentBlNumber: 'JW-4421-KR', uploadDate: '2026-02-08', fileSize: '76 KB', status: 'issued' },
  { id: 'DOC-012', name: 'INV-2024-0421', category: 'invoice', shipmentId: 'SH-006', shipmentBlNumber: 'JW-4421-KR', uploadDate: '2026-02-08', fileSize: '134 KB', status: 'draft' },
  { id: 'DOC-013', name: 'BL-JW1198-KR', category: 'bl', shipmentId: 'SH-008', shipmentBlNumber: 'JW-1198-KR', uploadDate: '2026-01-20', fileSize: '245 KB', status: 'issued' },
  { id: 'DOC-014', name: 'CO-JW8870', category: 'co', shipmentId: 'SH-010', shipmentBlNumber: 'JW-8870-KR', uploadDate: '2026-02-12', fileSize: '54 KB', status: 'pending' },
  { id: 'DOC-015', name: 'INV-2024-0870', category: 'invoice', shipmentId: 'SH-010', shipmentBlNumber: 'JW-8870-KR', uploadDate: '2026-02-12', fileSize: '119 KB', status: 'draft' },
];

const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-001', invoiceNumber: 'INV-2024-0839', shipmentId: 'SH-001', blNumber: 'JW-8839-KR', issueDate: '2026-02-15', dueDate: '2026-03-15', amount: 5200000, currency: 'KRW', status: 'unpaid', description: 'ICN→LAX 해상운송 비용' },
  { id: 'INV-002', invoiceNumber: 'INV-2024-0721', shipmentId: 'SH-002', blNumber: 'JW-7721-KR', issueDate: '2026-02-05', dueDate: '2026-03-05', amount: 3100000, currency: 'KRW', status: 'paid', description: 'BUS→SHA 해상운송 비용' },
  { id: 'INV-003', invoiceNumber: 'INV-2024-0102', shipmentId: 'SH-003', blNumber: 'JW-9102-KR', issueDate: '2026-02-20', dueDate: '2026-03-20', amount: 1800000, currency: 'KRW', status: 'unpaid', description: 'ICN→NRT 항공운송 비용' },
  { id: 'INV-004', invoiceNumber: 'INV-2024-0543', shipmentId: 'SH-004', blNumber: 'JW-6543-KR', issueDate: '2026-02-10', dueDate: '2026-02-20', amount: 8400000, currency: 'KRW', status: 'overdue', description: 'BUS→HKG 해상운송 + 냉동 비용' },
  { id: 'INV-005', invoiceNumber: 'INV-2024-0345', shipmentId: 'SH-005', blNumber: 'JW-3345-KR', issueDate: '2026-02-01', dueDate: '2026-03-01', amount: 2500000, currency: 'KRW', status: 'paid', description: 'ICN→SIN 항공운송 비용' },
  { id: 'INV-006', invoiceNumber: 'INV-2024-0421', shipmentId: 'SH-006', blNumber: 'JW-4421-KR', issueDate: '2026-02-08', dueDate: '2026-02-18', amount: 15400000, currency: 'KRW', status: 'overdue', description: 'BUS→HAM 해상운송 비용' },
  { id: 'INV-007', invoiceNumber: 'INV-2024-0198', shipmentId: 'SH-008', blNumber: 'JW-1198-KR', issueDate: '2026-01-20', dueDate: '2026-02-20', amount: 9800000, currency: 'KRW', status: 'paid', description: 'BUS→RTM 해상운송 비용' },
  { id: 'INV-008', invoiceNumber: 'INV-2024-0870', shipmentId: 'SH-010', blNumber: 'JW-8870-KR', issueDate: '2026-02-12', dueDate: '2026-03-12', amount: 7200000, currency: 'KRW', status: 'partial', description: 'BUS→SYD 해상운송 비용' },
];

const MOCK_NOTIFICATIONS: NotificationSetting[] = [
  { id: 'notif-1', label: '화물 상태 변경', description: '화물의 운송 상태가 변경될 때 알림', emailEnabled: true, smsEnabled: false },
  { id: 'notif-2', label: '서류 발급 알림', description: 'B/L, Invoice 등 서류가 발급될 때 알림', emailEnabled: true, smsEnabled: true },
  { id: 'notif-3', label: '정산 기한 알림', description: '인보이스 납부 기한이 다가올 때 알림', emailEnabled: true, smsEnabled: false },
  { id: 'notif-4', label: '견적 회신 알림', description: '요청한 견적에 대한 회신이 도착할 때 알림', emailEnabled: true, smsEnabled: false },
  { id: 'notif-5', label: '뉴스레터', description: 'J-Ways 물류 뉴스 및 프로모션 정보', emailEnabled: false, smsEnabled: false },
];

// ─── Auth API ───

export async function loginAPI(email: string, password: string): Promise<{ user: DashboardUser; token: string }> {
  await delay(500);
  if (email === 'test@jways.co.kr' && password === 'password') {
    return { user: MOCK_USER, token: 'mock-jwt-token-jways-2026' };
  }
  throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
}

export async function logoutAPI(): Promise<void> {
  await delay(300);
}

// ─── Shipments API ───

export async function getShipments(filters?: { status?: ShipmentStatus; search?: string }): Promise<ShipmentListItem[]> {
  await delay(400);
  let result = [...MOCK_SHIPMENTS];
  if (filters?.status) {
    result = result.filter(s => s.status === filters.status);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(s =>
      s.blNumber.toLowerCase().includes(q) ||
      s.origin.toLowerCase().includes(q) ||
      s.destination.toLowerCase().includes(q)
    );
  }
  return result;
}

export async function getShipmentDetail(id: string): Promise<ShipmentListItem | null> {
  await delay(300);
  return MOCK_SHIPMENTS.find(s => s.id === id) || null;
}

// ─── Quotes API ───

export async function getQuoteHistory(filters?: { status?: QuoteStatus }): Promise<QuoteHistory[]> {
  await delay(400);
  let result = [...MOCK_QUOTES];
  if (filters?.status) {
    result = result.filter(q => q.status === filters.status);
  }
  return result;
}

export async function createQuoteRequest(data: QuoteFormData): Promise<QuoteHistory> {
  await delay(800);
  const newQuote: QuoteHistory = {
    id: `QT-2024-${String(MOCK_QUOTES.length + 1).padStart(3, '0')}`,
    requestDate: new Date().toISOString().split('T')[0],
    serviceType: data.serviceType as QuoteHistory['serviceType'],
    origin: data.origin,
    destination: data.destination,
    cargoType: data.cargoType,
    weight: data.weight + ' kg',
    status: 'pending',
    assignedManager: '김물류',
  };
  MOCK_QUOTES.push(newQuote);
  return newQuote;
}

// ─── Documents API ───

export async function getDocuments(filters?: { category?: DocumentCategory; shipmentId?: string; search?: string }): Promise<DashboardDocument[]> {
  await delay(400);
  let result = [...MOCK_DOCUMENTS];
  if (filters?.category) {
    result = result.filter(d => d.category === filters.category);
  }
  if (filters?.shipmentId) {
    result = result.filter(d => d.shipmentId === filters.shipmentId);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.shipmentBlNumber.toLowerCase().includes(q)
    );
  }
  return result;
}

export async function downloadDocument(_id: string): Promise<void> {
  await delay(600);
  // Mock: no actual file download
}

// ─── Billing API ───

export async function getInvoices(filters?: { status?: InvoiceStatus }): Promise<Invoice[]> {
  await delay(400);
  let result = [...MOCK_INVOICES];
  if (filters?.status) {
    result = result.filter(i => i.status === filters.status);
  }
  return result;
}

export async function getBillingSummary(): Promise<BillingSummary> {
  await delay(300);
  const unpaid = MOCK_INVOICES.filter(i => i.status === 'unpaid' || i.status === 'overdue' || i.status === 'partial');
  const totalOutstanding = unpaid.reduce((sum, i) => sum + i.amount, 0);
  const paidThisMonth = MOCK_INVOICES.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const overdueCount = MOCK_INVOICES.filter(i => i.status === 'overdue').length;
  return { totalOutstanding, monthlySettled: paidThisMonth, overdueCount, currency: 'KRW' };
}

// ─── Settings API ───

let mockProfile: UserProfile = {
  name: MOCK_USER.name,
  email: MOCK_USER.email,
  company: MOCK_USER.company,
  phone: MOCK_USER.phone,
  position: '물류팀 과장',
};

export async function getUserProfile(): Promise<UserProfile> {
  await delay(300);
  return { ...mockProfile };
}

export async function updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  await delay(500);
  mockProfile = { ...mockProfile, ...data };
  return { ...mockProfile };
}

export async function getNotificationSettings(): Promise<NotificationSetting[]> {
  await delay(300);
  return MOCK_NOTIFICATIONS.map(n => ({ ...n }));
}

export async function updateNotificationSetting(id: string, data: Partial<NotificationSetting>): Promise<NotificationSetting> {
  await delay(300);
  const idx = MOCK_NOTIFICATIONS.findIndex(n => n.id === id);
  if (idx >= 0) {
    Object.assign(MOCK_NOTIFICATIONS[idx], data);
    return { ...MOCK_NOTIFICATIONS[idx] };
  }
  throw new Error('Notification setting not found');
}
