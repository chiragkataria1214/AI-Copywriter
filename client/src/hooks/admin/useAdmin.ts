import { useState } from 'react';
import { toast } from '@/hooks/utils/useToast';

export const useAdmin = () => {
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');

  const verifyAdminKey = async (key: string) => {
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
        setAdminKeyInput('');
        toast({
          title: "Access Granted",
          description: "You now have access to AI Settings",
          variant: "default",
        });
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

  return {
    hasAdminAccess,
    adminKeyInput,
    setAdminKeyInput,
    verifyAdminKey,
  };
};