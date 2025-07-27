import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function BypassPage() {
  const [, setLocation] = useLocation();
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const handleBypassLogin = async () => {
    setIsCreatingSession(true);
    
    try {
      const response = await fetch('/api/bypass-login');
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Access Granted",
          description: "You've been logged in as a demo user",
        });
        
        // Force page reload to update auth state
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } else {
        throw new Error('Bypass login failed');
      }
    } catch (error) {
      console.error('Bypass login error:', error);
      toast({
        title: "Access Failed",
        description: "Could not create demo session",
        variant: "destructive",
      });
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-gray-900">
            AI Copywriter Access
          </CardTitle>
          <p className="text-gray-600">
            Temporary bypass for development and demo access
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleBypassLogin}
            disabled={isCreatingSession}
            className="w-full bg-[#004182] hover:bg-[#003366] text-white"
            size="lg"
          >
            {isCreatingSession ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Session...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Access AI Copywriter
              </>
            )}
          </Button>
          
          <div className="text-center text-sm text-gray-500 space-y-1">
            <p>This creates a temporary admin session</p>
            <p>Full access to all copywriting features</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}