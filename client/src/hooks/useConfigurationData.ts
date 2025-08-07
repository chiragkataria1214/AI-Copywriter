import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Persona {
  label: string;
}

export const useConfigurationData = () => {
  // Configuration data states
  const [products, setProducts] = useState<Record<string, any>>({});
  const [productClaims, setProductClaims] = useState<Record<string, any>>({});
  const [personas, setPersonas] = useState<Record<string, Persona>>({});
  const [brandGuidelines, setBrandGuidelines] = useState<any>({});
  const [copyFrameworks, setCopyFrameworks] = useState<any>({});
  const [stationPrompts, setStationPrompts] = useState<any>({});
  const [modelSettings, setModelSettings] = useState<any>({});

  // Data fetching queries
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiRequest('/api/config/products'),
  });

  const { data: personasData, isLoading: personasLoading } = useQuery({
    queryKey: ['personas'],
    queryFn: () => apiRequest('/api/config/personas'),
  });

  const { data: brandGuidelinesData, isLoading: brandGuidelinesLoading } = useQuery({
    queryKey: ['brandGuidelines'],
    queryFn: () => apiRequest('/api/config/brand-guidelines'),
  });

  const { data: copyFrameworksData, isLoading: copyFrameworksLoading } = useQuery({
    queryKey: ['copyFrameworks'],
    queryFn: () => apiRequest('/api/config/copy-frameworks'),
  });

  const { data: stationPromptsData, isLoading: stationPromptsLoading } = useQuery({
    queryKey: ['stationPrompts'],
    queryFn: () => apiRequest('/api/config/station-prompts'),
  });

  const { data: modelSettingsData, isLoading: modelSettingsLoading } = useQuery({
    queryKey: ['modelSettings'],
    queryFn: () => apiRequest('/api/config/model-settings'),
  });

  // Update states when data is loaded
  useEffect(() => {
    if (productsData) setProducts(productsData);
  }, [productsData]);

  useEffect(() => {
    if (personasData) {
      setPersonas(personasData);
    }
  }, [personasData]);

  useEffect(() => {
    if (brandGuidelinesData) setBrandGuidelines(brandGuidelinesData);
  }, [brandGuidelinesData]);

  useEffect(() => {
    if (copyFrameworksData) setCopyFrameworks(copyFrameworksData);
  }, [copyFrameworksData]);

  useEffect(() => {
    if (stationPromptsData) setStationPrompts(stationPromptsData);
  }, [stationPromptsData]);

  useEffect(() => {
    if (modelSettingsData) setModelSettings(modelSettingsData);
  }, [modelSettingsData]);

  const isLoading = productsLoading || personasLoading || brandGuidelinesLoading || 
    copyFrameworksLoading || stationPromptsLoading || modelSettingsLoading;

  return {
    // Data
    products,
    setProducts,
    productClaims,
    setProductClaims,
    personas,
    setPersonas,
    brandGuidelines,
    setBrandGuidelines,
    copyFrameworks,
    setCopyFrameworks,
    stationPrompts,
    setStationPrompts,
    modelSettings,
    setModelSettings,
    
    // Loading states
    isLoading,
    productsLoading,
    personasLoading,
    brandGuidelinesLoading,
    copyFrameworksLoading,
    stationPromptsLoading,
    modelSettingsLoading
  };
};