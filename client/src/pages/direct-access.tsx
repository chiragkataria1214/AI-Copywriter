import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';

export default function DirectAccess() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Force refetch auth data and redirect
    queryClient.invalidateQueries({ queryKey: ['/api/me'] });
    setTimeout(() => {
      setLocation('/');
    }, 100);
  }, [queryClient, setLocation]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    </div>
  );
}