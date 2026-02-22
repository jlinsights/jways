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