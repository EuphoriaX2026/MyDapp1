// src/types.ts

// Interface for package card data
export interface CardData {
  id: number;
  packageType: string;
  price: number;
  title: string;
  duration: string;
  isActive: boolean;
  className: string;
  hash?: string;
}

// Interface for report table items
export interface ReportItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  hash: string;
}