import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Settings } from 'lucide-react';

export default function AdminSetup() {
  const [username, setUsername] = useState('cody@jonesroadbeauty.com');
  const [newPassword, setNewPassword] = useState('');
  const [useEmergencyLogin, setUseEmergencyLogin] = useState(false);

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { username: string; newPassword: string }) => {
      return await apiRequest('/api/reset-password', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: "Password Reset!",
        description: "Your password has been updated. You can now login with the new password.",
      });
      setNewPassword('');
    },
    onError: (error) => {
      console.error('Password reset error:', error);
      toast({
        title: "Reset Failed",
        description: "Could not reset password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const emergencyLoginMutation = useMutation({
    mutationFn: async (data: { username: string }) => {
      return await apiRequest('/api/emergency-login', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: "Emergency Access Granted!",
        description: "You've been logged in. Redirecting to the app...",
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error) => {
      console.error('Emergency login error:', error);
      toast({
        title: "Emergency Login Failed",
        description: "Could not complete emergency login. Try password reset instead.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (useEmergencyLogin) {
      if (!username.trim()) {
        toast({
          title: "Missing Information",
          description: "Please enter your username.",
          variant: "destructive",
        });
        return;
      }
      emergencyLoginMutation.mutate({ username: username.trim() });
    } else {
      if (!username.trim() || !newPassword.trim()) {
        toast({
          title: "Missing Information",
          description: "Please enter both username and new password.",
          variant: "destructive",
        });
        return;
      }
      resetPasswordMutation.mutate({ username: username.trim(), newPassword });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Admin Setup</CardTitle>
          <p className="text-sm text-gray-600">Reset your password to access the application</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="emergencyLogin"
                checked={useEmergencyLogin}
                onChange={(e) => setUseEmergencyLogin(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="emergencyLogin" className="text-sm">
                Emergency Login (skip password reset)
              </Label>
            </div>

            {!useEmergencyLogin && (
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              style={{ backgroundColor: '#004182' }}
              disabled={resetPasswordMutation.isPending || emergencyLoginMutation.isPending}
            >
              {resetPasswordMutation.isPending ? 'Resetting...' : 
               emergencyLoginMutation.isPending ? 'Logging in...' :
               useEmergencyLogin ? 'Emergency Login' : 'Reset Password'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              After resetting, go back to{' '}
              <a href="/login" className="text-blue-600 hover:underline">
                login page
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}