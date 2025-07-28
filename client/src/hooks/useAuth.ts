import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Get current user
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/me'],
    retry: (failureCount, error: any) => {
      // Don't retry if it's an auth error
      if (error?.message?.includes('401') || error?.message?.includes('Authentication required')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 0, // Don't cache auth state
    gcTime: 0, // Don't store in cache
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: false
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

  // Setup admin mutation
  const setupAdminMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/setup-admin', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      // Refresh user data to get updated role
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
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
    isAdmin: (user as any)?.role === 'admin',
    logout,
    isLoggingOut: logoutMutation.isPending,
    setupAdmin: () => setupAdminMutation.mutate(),
    isSettingUpAdmin: setupAdminMutation.isPending,
  };
}