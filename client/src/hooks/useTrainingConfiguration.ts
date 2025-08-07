import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/useToast';
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
    deleteProductMutation
  };
};