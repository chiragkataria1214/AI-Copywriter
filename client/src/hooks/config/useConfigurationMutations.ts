import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/utils/useToast';
import { TrainingConfig } from '@shared/training-config';

export const useTrainingConfiguration = () => {
  const queryClient = useQueryClient();
  
  // Training Configuration States
  const [editingConfig, setEditingConfig] = useState<TrainingConfig | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [reviewStats, setReviewStats] = useState<any>(null);

  const loadTrainingConfigMutation = useMutation({
    mutationFn: async () => apiRequest('/api/training-config'),
    onSuccess: (data) => {
      setEditingConfig(data);
      toast({
        title: "Configuration Loaded",
        description: "You can now edit the AI training configuration.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Load Configuration",
        description: "Could not load the training configuration.",
        variant: "destructive",
      });
    },
  });

  const saveTrainingConfigMutation = useMutation({
    mutationFn: async (config: TrainingConfig) => {
      const startTime = Date.now();
      console.log('Starting training config save...', {
        emailFrameworksCount: config.copyFrameworks?.emailFrameworks?.length || 0,
        totalImageCount: config.copyFrameworks?.emailFrameworks?.reduce((acc, fw) => acc + (fw.images?.length || 0), 0) || 0
      });
      
      const result = await apiRequest('/api/training-config', {
        method: 'POST',
        body: config,
      });
      
      const duration = Date.now() - startTime;
      console.log(`Training config save completed in ${duration}ms`);
      
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Configuration Saved",
        description: "The AI training configuration has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['trainingConfig'] });
    },
    onError: (error: any) => {
      console.error('Training config save error:', error);
      const errorMessage = error?.message || 'Could not save the training configuration.';
      toast({
        title: "Failed to Save Configuration",
        description: errorMessage.includes('timeout') 
          ? "Save operation timed out. The configuration might be too large or the server is busy."
          : errorMessage,
        variant: "destructive",
      });
    },
  });

  // Partial saves
  const saveBrandGuidelinesMutation = useMutation({
    mutationFn: async (brandGuidelines: TrainingConfig['brandGuidelines']) => {
      return await apiRequest('/api/training-config/brand-guidelines', {
        method: 'POST',
        body: { brandGuidelines },
      });
    },
    onSuccess: () => {
      toast({ title: 'Saved', description: 'Brand guidelines updated.' });
      queryClient.invalidateQueries({ queryKey: ['trainingConfig'] });
    },
    onError: (error: any) => {
      console.error('Brand guidelines save error:', error);
      toast({ title: 'Failed to Save', description: 'Could not save brand guidelines.', variant: 'destructive' });
    },
  });

  const saveProductClaimsMutation = useMutation({
    mutationFn: async (productClaims: TrainingConfig['productClaims']) => {
      return await apiRequest('/api/training-config/product-claims', {
        method: 'POST',
        body: { productClaims },
      });
    },
    onSuccess: () => {
      toast({ title: 'Saved', description: 'Product claims updated.' });
      queryClient.invalidateQueries({ queryKey: ['trainingConfig'] });
    },
    onError: (error: any) => {
      console.error('Product claims save error:', error);
      toast({ title: 'Failed to Save', description: 'Could not save product claims.', variant: 'destructive' });
    },
  });

  const saveModelParametersMutation = useMutation({
    mutationFn: async (modelParameters: TrainingConfig['modelParameters']) => {
      return await apiRequest('/api/training-config/model-parameters', {
        method: 'POST',
        body: { modelParameters },
      });
    },
    onSuccess: () => {
      toast({ title: 'Saved', description: 'Model parameters updated.' });
      queryClient.invalidateQueries({ queryKey: ['trainingConfig'] });
    },
    onError: (error: any) => {
      console.error('Model parameters save error:', error);
      toast({ title: 'Failed to Save', description: 'Could not save model parameters.', variant: 'destructive' });
    },
  });

  const saveStationPromptsMutation = useMutation({
    mutationFn: async (stationPrompts: TrainingConfig['stationPrompts']) => {
      return await apiRequest('/api/training-config/station-prompts', {
        method: 'POST',
        body: { stationPrompts },
      });
    },
    onSuccess: () => {
      toast({ title: 'Saved', description: 'Station prompts updated.' });
      queryClient.invalidateQueries({ queryKey: ['trainingConfig'] });
      queryClient.invalidateQueries({ queryKey: ['stationPrompts'] });
    },
    onError: (error: any) => {
      console.error('Station prompts save error:', error);
      toast({ title: 'Failed to Save', description: 'Could not save station prompts.', variant: 'destructive' });
    },
  });

  const saveCopyFrameworksMutation = useMutation({
    mutationFn: async (copyFrameworks: TrainingConfig['copyFrameworks']) => {
      return await apiRequest('/api/training-config/copy-frameworks', {
        method: 'POST',
        body: { copyFrameworks },
      });
    },
    onSuccess: () => {
      toast({ title: 'Saved', description: 'Copy frameworks updated.' });
      queryClient.invalidateQueries({ queryKey: ['trainingConfig'] });
    },
    onError: (error: any) => {
      console.error('Copy frameworks save error:', error);
      toast({ title: 'Failed to Save', description: 'Could not save copy frameworks.', variant: 'destructive' });
    },
  });

  const savePersonaPillarsMutation = useMutation({
    mutationFn: async (personaPillars: TrainingConfig['personaPillars']) => {
      return await apiRequest('/api/training-config/persona-pillars', {
        method: 'POST',
        body: { personaPillars },
      });
    },
    onSuccess: () => {
      toast({ title: 'Saved', description: 'Personas updated.' });
      queryClient.invalidateQueries({ queryKey: ['trainingConfig'] });
    },
    onError: (error: any) => {
      console.error('Persona save error:', error);
      toast({ title: 'Failed to Save', description: 'Could not save personas.', variant: 'destructive' });
    },
  });

  const saveSinglePersonaMutation = useMutation({
    mutationFn: async ({ personaName, personaData }: { personaName: string; personaData: any }) => {
      return await apiRequest(`/api/training-config/persona-pillars/${encodeURIComponent(personaName)}`, {
        method: 'POST',
        body: personaData,
      });
    },
    onSuccess: () => {
      toast({ title: 'Saved', description: 'Persona updated.' });
      queryClient.invalidateQueries({ queryKey: ['trainingConfig'] });
    },
    onError: (error: any) => {
      console.error('Single persona save error:', error);
      toast({ title: 'Failed to Save', description: 'Could not save persona.', variant: 'destructive' });
    },
  });

  const saveSingleProductClaimsMutation = useMutation({
    mutationFn: async ({ productKey, productData }: { productKey: string; productData: any }) => {
      return await apiRequest(`/api/training-config/product-claims/${encodeURIComponent(productKey)}`, {
        method: 'POST',
        body: productData,
      });
    },
    onSuccess: () => {
      toast({ title: 'Saved', description: 'Product claims updated.' });
      queryClient.invalidateQueries({ queryKey: ['trainingConfig'] });
    },
    onError: (error: any) => {
      console.error('Single product claims save error:', error);
      toast({ title: 'Failed to Save', description: 'Could not save product claims.', variant: 'destructive' });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async ({ productId, productKey }: { productId: string; productKey?: string }) => {
      return await apiRequest(`/api/products/${productId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (_, { productKey }) => {
      toast({
        title: "Product Deleted",
        description: "The product has been successfully deleted from the database.",
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Product",
        description: "Could not delete the product from the database.",
        variant: "destructive",
      });
    },
  });

  return {
    // State
    editingConfig,
    setEditingConfig,
    newProductName,
    setNewProductName,
    expandedProducts,
    setExpandedProducts,
    reviewStats,
    setReviewStats,
    
    // Mutations
    loadTrainingConfigMutation,
    saveTrainingConfigMutation,
    saveBrandGuidelinesMutation,
    saveProductClaimsMutation,
    saveModelParametersMutation,
    saveStationPromptsMutation,
    saveCopyFrameworksMutation,
    savePersonaPillarsMutation,
    saveSinglePersonaMutation,
    saveSingleProductClaimsMutation,
    deleteProductMutation
  };
};