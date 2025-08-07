import { useCallback } from 'react';
import { useMetaAdGeneratorContext } from '@/contexts/MetaAdGeneratorContext';

export const useBrandDrUtils = (brandDrBalance: number[]) => {
  const { getBrandDrLabel: getBrandDrLabelUtil } = useMetaAdGeneratorContext();

  // Create a parameterless function that uses the current brandDrBalance
  const getBrandDrLabel = useCallback(() => {
    return getBrandDrLabelUtil(brandDrBalance);
  }, [getBrandDrLabelUtil, brandDrBalance]);

  return {
    getBrandDrLabel
  };
};