import { useCallback } from 'react';

/**
 * Hook that provides safe array operations to prevent runtime errors
 * when working with potentially undefined arrays
 */
export const useSafeArrayOperations = () => {
  
  // Safe includes check
  const safeIncludes = useCallback((array: any[] | undefined | null, item: any): boolean => {
    return Array.isArray(array) && array.includes(item);
  }, []);

  // Safe filter operation
  const safeFilter = useCallback(<T>(array: T[] | undefined | null, predicate: (item: T) => boolean): T[] => {
    return Array.isArray(array) ? array.filter(predicate) : [];
  }, []);

  // Safe map operation
  const safeMap = useCallback(<T, U>(array: T[] | undefined | null, mapper: (item: T) => U): U[] => {
    return Array.isArray(array) ? array.map(mapper) : [];
  }, []);

  // Safe every operation
  const safeEvery = useCallback(<T>(array: T[] | undefined | null, predicate: (item: T) => boolean): boolean => {
    return Array.isArray(array) && array.length > 0 ? array.every(predicate) : false;
  }, []);

  // Safe some operation
  const safeSome = useCallback(<T>(array: T[] | undefined | null, predicate: (item: T) => boolean): boolean => {
    return Array.isArray(array) ? array.some(predicate) : false;
  }, []);

  // Safe spread operation
  const safeSpread = useCallback(<T>(array: T[] | undefined | null): T[] => {
    return Array.isArray(array) ? [...array] : [];
  }, []);

  // Safe concat operation
  const safeConcat = useCallback(<T>(array1: T[] | undefined | null, array2: T[] | undefined | null): T[] => {
    const safe1 = Array.isArray(array1) ? array1 : [];
    const safe2 = Array.isArray(array2) ? array2 : [];
    return [...safe1, ...safe2];
  }, []);

  // Safe add item operation
  const safeAddItem = useCallback(<T>(array: T[] | undefined | null, item: T): T[] => {
    const safeArray = Array.isArray(array) ? array : [];
    return [...safeArray, item];
  }, []);

  // Safe remove item operation
  const safeRemoveItem = useCallback(<T>(array: T[] | undefined | null, item: T): T[] => {
    return Array.isArray(array) ? array.filter(i => i !== item) : [];
  }, []);

  // Safe toggle item operation
  const safeToggleItem = useCallback(<T>(array: T[] | undefined | null, item: T): T[] => {
    const safeArray = Array.isArray(array) ? array : [];
    if (safeArray.includes(item)) {
      return safeArray.filter(i => i !== item);
    } else {
      return [...safeArray, item];
    }
  }, []);

  return {
    safeIncludes,
    safeFilter,
    safeMap,
    safeEvery,
    safeSome,
    safeSpread,
    safeConcat,
    safeAddItem,
    safeRemoveItem,
    safeToggleItem
  };
};