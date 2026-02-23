import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: LucideIcon;
  image: string;
  longDescription: string;
  features: string[];
}

export interface StatItem {
  value: string;
  label: string;
  subLabel: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

// ─── Tracking & Milestone Types ───

export type MilestoneCategory = 'departure' | 'transit' | 'customs' | 'arrival';
export type TransportMode = 'air' | 'sea';

export interface TrackingStep {
  id: string;
  label: string;
  date: string;
  time: string;
  status: 'completed' | 'current' | 'pending';
  location: string;
  category?: MilestoneCategory;
  eta?: string;
  completedAt?: string;
  detail?: string;
  vessel?: string;
  port?: string;
}

export interface MilestoneCategoryGroup {
  category: MilestoneCategory;
  label: string;
  steps: TrackingStep[];
}

export interface GeoLocation {
  city: string;
  code: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
}

export interface ETAInfo {
  estimatedArrival: string;
  confidence: 'high' | 'medium' | 'low';
  delayDays?: number;
  lastUpdated: string;
}

export interface ShipmentDocument {
  id: string;
  type: 'bl' | 'invoice' | 'packing-list' | 'certificate';
  name: string;
  status: 'issued' | 'pending' | 'draft';
  date?: string;
  fileSize?: string;
}

export interface Waypoint {
  name: string;
  code: string;
  location: GeoLocation;
  arrivalDate?: string;
  departureDate?: string;
  type: 'port' | 'airport' | 'terminal';
}

export interface CargoDetails {
  weight: string;
  cbm: string;
  containerType?: string;
  packages: number;
  hsCode?: string;
}

export interface ShipmentData {
  id: string;
  status: string;
  estimatedDelivery: string;
  origin: GeoLocation;
  destination: GeoLocation;
  current: GeoLocation & { progress: number };
  steps: TrackingStep[];
  mode?: TransportMode;
  totalProgress?: number;
  categories?: MilestoneCategoryGroup[];
  eta?: ETAInfo;
  documents?: ShipmentDocument[];
  waypoints?: Waypoint[];
  cargoDetails?: CargoDetails;
}

// ─── CBM Calculator Types ───

export type UnitSystem = 'metric' | 'imperial';

export interface CargoItem {
  id: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  quantity: string;
}

export interface CBMResults {
  totalCBM: number;
  totalActualWeight: number;
  airVolumeWeight: number;
  airChargeableWeight: number;
  seaVolumeWeight: number;
  seaChargeableRT: number;
}

export interface UnitLabels {
  dimension: string;
  weight: string;
}

// ─── Quote Wizard Types ───

export type ServiceType = 'air' | 'ocean' | 'land' | 'warehouse';

export interface QuoteFormData {
  name: string;
  email: string;
  serviceType: ServiceType | '';
  origin: string;
  destination: string;
  cargoType: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  targetDate: string;
  message: string;
}

export interface QuoteModalState {
  isOpen: boolean;
  preSelectedService?: ServiceType;
  prefillData?: Partial<QuoteFormData>;
}

// ─── Dashboard / Auth Types ───

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  role: 'customer' | 'admin';
}

// ─── Shipment List Types ───

export type ShipmentStatus = 'in-transit' | 'customs' | 'delivered' | 'delayed' | 'pending';

export interface ShipmentListItem {
  id: string;
  blNumber: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  mode: TransportMode;
  departureDate: string;
  estimatedArrival: string;
  cargoType: string;
  weight: string;
  containerCount?: number;
  progress: number;
}

// ─── Quote History Types ───

export type QuoteStatus = 'pending' | 'approved' | 'expired' | 'rejected';

export interface QuoteHistory {
  id: string;
  requestDate: string;
  serviceType: ServiceType;
  origin: string;
  destination: string;
  cargoType: string;
  weight: string;
  status: QuoteStatus;
  estimatedPrice?: string;
  validUntil?: string;
  assignedManager?: string;
}

// ─── Document Types ───

export type DocumentCategory = 'bl' | 'invoice' | 'packing-list' | 'co' | 'insurance' | 'other';

export interface DashboardDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  shipmentId: string;
  shipmentBlNumber: string;
  uploadDate: string;
  fileSize: string;
  status: 'issued' | 'pending' | 'draft';
}

// ─── Billing Types ───

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | 'partial';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  shipmentId: string;
  blNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  description: string;
}

export interface BillingSummary {
  totalOutstanding: number;
  monthlySettled: number;
  overdueCount: number;
  currency: string;
}

// ─── Settings Types ───

export interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  company: string;
  phone: string;
  position?: string;
}

// ─── Instant Quote Types ───

export type Incoterms = 'FOB' | 'CIF' | 'DDP' | 'EXW';
export type ContainerType = '20ft' | '40ft' | '40ft-hc';

export interface PortInfo {
  code: string;
  name: string;
  nameEn: string;
  country: string;
  type: 'sea' | 'air' | 'both';
}

export interface TariffBreakdown {
  baseFreight: number;
  baf: number;
  thc: number;
  docFee: number;
  insurance?: number;
  customs?: number;
  inland?: number;
}

export interface TariffResult {
  mode: 'sea' | 'air';
  totalPrice: number;
  currency: string;
  breakdown: TariffBreakdown;
  transitDays: string;
  co2Kg: number;
  containerType?: ContainerType;
  chargeableWeight?: number;
}

export interface QuoteComparisonResult {
  sea: TariffResult | null;
  air: TariffResult | null;
  recommended: 'sea' | 'air' | null;
  recommendReason: string;
}

export interface QuoteHistoryItem {
  id: string;
  timestamp: string;
  origin: PortInfo;
  destination: PortInfo;
  weight: number;
  cbm: number;
  incoterms: Incoterms;
  containerType?: ContainerType;
  result: QuoteComparisonResult;
}

export interface InstantQuoteFormData {
  origin: string;
  destination: string;
  weight: string;
  cbm: string;
  mode: 'sea' | 'air' | 'both';
  incoterms: Incoterms;
  containerType: ContainerType;
}