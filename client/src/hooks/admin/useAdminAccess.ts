import { useState } from 'react';
import { toast } from '@/hooks/utils/useToast';

export const useAdminAccess = () => {
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [showAdminKeyPrompt, setShowAdminKeyPrompt] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');

  // Admin key verification
  const verifyAdminKey = async (key: string, onSuccess?: () => void) => {
    try {
      const response = await fetch('/api/verify-admin-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminKey: key }),
      });

      if (response.ok) {
        setHasAdminAccess(true);
        setShowAdminKeyPrompt(false);
        setAdminKeyInput('');
        toast({
          title: "Access Granted",
          description: "Loading configuration...",
          variant: "default",
        });
        
        // Call the success callback if provided
        if (onSuccess) {
          // Small delay to ensure UI updates before loading
          setTimeout(() => {
            onSuccess();
          }, 100);
        }
        
        return true;
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid admin key",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify admin key",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleAISettingsClick = (onSuccess?: () => void) => {
    if (hasAdminAccess) {
      onSuccess?.();
    } else {
      setShowAdminKeyPrompt(true);
    }
  };

  const closeAdminKeyPrompt = () => {
    setShowAdminKeyPrompt(false);
    setAdminKeyInput('');
  };

  return {
    hasAdminAccess,
    showAdminKeyPrompt,
    adminKeyInput,
    setAdminKeyInput,
    verifyAdminKey,
    handleAISettingsClick,
    closeAdminKeyPrompt
  };
};