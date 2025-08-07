/**
 * Utility functions for brand/DR balance calculations
 */

export const getBrandDrLabel = (brandDrBalance: number[]): string => {
  if (!brandDrBalance || !Array.isArray(brandDrBalance) || brandDrBalance.length === 0) {
    return '50% Brand / 50% DR'; // Default fallback
  }
  const value = brandDrBalance[0];
  return `${value}% Brand / ${100 - value}% DR`;
};

export const createGetBrandDrLabel = (brandDrBalance: number[]) => {
  return () => getBrandDrLabel(brandDrBalance);
};

export const getWordCount = (text: string): number => {
  if (!text || text.trim() === '') return 0;
  return text.trim().split(/\s+/).length;
};