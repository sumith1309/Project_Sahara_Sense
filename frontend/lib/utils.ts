import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RiskLevel } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDust(value: number | null): string {
  if (value === null) return 'N/A';
  return `${value.toFixed(1)} μg/m³`;
}

export function formatTemperature(value: number | null): string {
  if (value === null) return 'N/A';
  return `${value.toFixed(1)}°C`;
}

export function formatVisibility(value: number | null): string {
  if (value === null) return 'N/A';
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} km`;
  }
  return `${value.toFixed(0)} m`;
}

export function formatWindSpeed(value: number | null): string {
  if (value === null) return 'N/A';
  return `${value.toFixed(1)} km/h`;
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRiskLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    LOW: 'Low Risk',
    MODERATE: 'Moderate',
    HIGH: 'High Risk',
    SEVERE: 'Severe',
    EXTREME: 'Extreme',
    UNKNOWN: 'Unknown',
  };
  return labels[level];
}

export function getWindDirection(degrees: number | null): string {
  if (degrees === null) return 'N/A';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}
