import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Lock, Settings, Sparkles, FileText, Camera, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MetaAdGenerator() {
  const [activeTab, setActiveTab] = useState('ads');
  const { toast } = useToast();
  
  // Admin key protection for AI Settings
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [showAdminKeyPrompt, setShowAdminKeyPrompt] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');

  // Handle AI Settings tab click
  const handleAISettingsClick = () => {
    if (hasAdminAccess) {
      setActiveTab('settings');
    } else {
      setShowAdminKeyPrompt(true);
    }
  };

  // Admin key verification
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
        setShowAdminKeyPrompt(false);
        setAdminKeyInput('');
        setActiveTab('settings');
        toast({
          title: "Access Granted",
          description: "You now have access to AI Settings",
          variant: "default",
        });
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid admin key",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify admin key",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AI Copywriter</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">user@jonesroadbeauty.com</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex w-full mb-6 sm:mb-8">
            <TabsList className="grid grid-cols-4 flex-1">
              <TabsTrigger value="ads" className="flex-col sm:flex-row space-y-0 sm:space-y-0 sm:space-x-2">
                <Sparkles size={16} />
                <span className="text-xs sm:text-sm">Ad Copy</span>
              </TabsTrigger>
              <TabsTrigger value="landing" className="flex-col sm:flex-row space-y-0 sm:space-y-0 sm:space-x-2">
                <FileText size={16} />
                <span className="text-xs sm:text-sm">Landing Page</span>
              </TabsTrigger>
              <TabsTrigger value="static-ad" className="flex-col sm:flex-row space-y-0 sm:space-y-0 sm:space-x-2">
                <Camera size={16} />
                <span className="text-xs sm:text-sm">Static Ad</span>
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex-col sm:flex-row space-y-0 sm:space-y-0 sm:space-x-2">
                <Brain size={16} />
                <span className="text-xs sm:text-sm">Custom Request</span>
              </TabsTrigger>
            </TabsList>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'outline'}
              onClick={handleAISettingsClick}
              className="ml-2 flex-col sm:flex-row space-y-0 sm:space-y-0 sm:space-x-2 h-auto py-2 px-3"
              style={activeTab === 'settings' ? { backgroundColor: '#004182', color: 'white' } : {}}
            >
              {hasAdminAccess ? <Settings size={16} /> : <Lock size={16} />}
              <span className="text-xs sm:text-sm">
                {hasAdminAccess ? 'AI Settings' : 'AI Settings (Protected)'}
              </span>
            </Button>
          </div>

          <TabsContent value="ads">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Ad Copy Generator</h3>
                <p className="text-gray-600">Generate compelling ad copy for your campaigns.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="landing">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Landing Page Generator</h3>
                <p className="text-gray-600">Create high-converting landing pages.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="static-ad">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Static Ad Analysis</h3>
                <p className="text-gray-600">Analyze static ad images and generate copy.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Custom Request</h3>
                <p className="text-gray-600">Make custom copywriting requests.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Settings Tab - Protected by Admin Key */}
          <TabsContent value="settings">
            {!hasAdminAccess ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Card className="w-full max-w-md">
                  <CardContent className="p-8 text-center">
                    <Lock className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Protected Area
                    </h3>
                    <p className="text-gray-600 mb-6">
                      AI Settings contains sensitive training configuration and requires admin access.
                    </p>
                    <Button
                      onClick={() => setShowAdminKeyPrompt(true)}
                      className="w-full"
                      style={{ backgroundColor: '#004182' }}
                    >
                      <Lock className="mr-2" size={16} />
                      Enter Admin Key
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="mr-2" size={20} />
                      AI Training Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4">
                      Configure AI training parameters and brand guidelines.
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-2">Admin Access Granted</h4>
                      <p className="text-sm text-green-700">
                        You now have access to all AI Settings and training configuration options.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>

      {/* Admin Key Prompt Dialog */}
      <Dialog open={showAdminKeyPrompt} onOpenChange={setShowAdminKeyPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Lock className="mr-2" size={18} />
              AI Settings Access
            </DialogTitle>
            <DialogDescription>
              Enter the admin key to access AI Settings and training configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin key..."
              value={adminKeyInput}
              onChange={(e) => setAdminKeyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  verifyAdminKey(adminKeyInput);
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAdminKeyPrompt(false);
                setAdminKeyInput('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => verifyAdminKey(adminKeyInput)}
              disabled={!adminKeyInput}
              style={{ backgroundColor: '#004182' }}
            >
              Access Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}