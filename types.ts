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

// Tracking Types
export interface TrackingStep {
  id: string;
  label: string;
  date: string;
  time: string;
  status: 'completed' | 'current' | 'pending';
  location: string;
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
}