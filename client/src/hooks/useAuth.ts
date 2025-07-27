import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Get current user
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/me'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/logout', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // Redirect to login
      setLocation('/login');
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Still redirect even if logout failed
      queryClient.clear();
      setLocation('/login');
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  const isAuthenticated = !!user && !error;
  const isUnauthenticated = error && (error?.message?.includes('401') || error?.message?.includes('Authentication required'));



  return {
    user,
    isLoading,
    isAuthenticated,
    isUnauthenticated,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}