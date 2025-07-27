import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function BypassPage() {
  const [, setLocation] = useLocation();

  const handleDirectAccess = () => {
    toast({
      title: "Accessing AI Copywriter",
      description: "Loading demo mode with full access",
    });
    
    // Direct navigation to demo mode
    setLocation('/demo');
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
            onClick={handleDirectAccess}
            className="w-full bg-[#004182] hover:bg-[#003366] text-white"
            size="lg"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Access AI Copywriter (Demo Mode)
          </Button>
          
          <div className="text-center text-sm text-gray-500 space-y-1">
            <p>Demo mode with full access</p>
            <p>No authentication required</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}