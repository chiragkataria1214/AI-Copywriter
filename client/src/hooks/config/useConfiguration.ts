import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export const useConfiguration = () => {
  const [products, setProducts] = useState<Record<string, any>>({});
  const [productClaims, setProductClaims] = useState<Record<string, any>>({});
  const [personas, setPersonas] = useState<Record<string, any>>({});
  const [brandGuidelines, setBrandGuidelines] = useState<any>({});
  const [copyFrameworks, setCopyFrameworks] = useState<any>({});
  const [stationPrompts, setStationPrompts] = useState<any>({});
  const [modelSettings, setModelSettings] = useState<any>({});

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

  useEffect(() => {
    if (productsData) setProducts(productsData);
  }, [productsData]);

  useEffect(() => {
    if (personasData) {
      setPersonas(personasData);
      if (Object.keys(personasData).length > 0) {
        const firstPersona = Object.keys(personasData)[0];
        setPersonas((prevPersonas) => ({
          ...prevPersonas,
          selected: firstPersona,
        }));
      }
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

  return {
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
    productsLoading,
    personasLoading,
    brandGuidelinesLoading,
    copyFrameworksLoading,
    stationPromptsLoading,
    modelSettingsLoading,
  };
};