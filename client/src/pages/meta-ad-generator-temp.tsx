import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Lock, Settings, Sparkles, FileText, Camera, Brain, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function MetaAdGenerator() {
  const [activeTab, setActiveTab] = useState('ads');
  const { toast } = useToast();
  
  // Admin key protection for AI Settings
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [showAdminKeyPrompt, setShowAdminKeyPrompt] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');

  // Ad copy generation state
  const [transcription, setTranscription] = useState('');
  const [customBrief, setCustomBrief] = useState('');
  const [concept, setConcept] = useState('lifeJuggler');
  const [subPersona, setSubPersona] = useState('newMom');
  const [targetAudience, setTargetAudience] = useState('');
  const [landingPageUrl, setLandingPageUrl] = useState('');
  const [brandDrBalance, setBrandDrBalance] = useState([50]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [useJonesBrandGuide, setUseJonesBrandGuide] = useState(true);
  const [airLink, setAirLink] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');

  // Generated content state
  const [generatedHeadlines, setGeneratedHeadlines] = useState([]);
  const [generatedPrimaryText, setGeneratedPrimaryText] = useState('');
  const [selectedHeadlineIndex, setSelectedHeadlineIndex] = useState(0);

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

  // Ad copy generation mutation
  const generateAdCopyMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        transcription,
        customBrief,
        concept,
        subPersona,
        targetAudience,
        landingPageUrl,
        brandDrBalance: brandDrBalance[0],
        useJonesBrandGuide,
        airLink,
        uploadedImage,
        selectedProduct
      };
      
      return await apiRequest('/api/demo/generate-ad-copy', {
        method: 'POST',
        body: payload
      });
    },
    onSuccess: (data) => {
      setGeneratedHeadlines(data.headlines || []);
      setGeneratedPrimaryText(data.primaryText || '');
      setSelectedHeadlineIndex(0);
      toast({
        title: "Ad Copy Generated Successfully",
        description: "Your ad copy has been generated using Claude AI.",
      });
    },
    onError: (error) => {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate ad copy. Please try again.",
        variant: "destructive"
      });
    }
  });

  const generateAdCopy = () => {
    generateAdCopyMutation.mutate();
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
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

          {/* Ad Copy Tab */}
          <TabsContent value="ads">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Input Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Generate Ad Copy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Video Transcription or Brief</label>
                    <Textarea
                      placeholder="Paste your video transcription or marketing brief here..."
                      value={transcription}
                      onChange={(e) => setTranscription(e.target.value)}
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Custom Brief (Optional)</label>
                    <Input
                      placeholder="Additional context or specific requirements..."
                      value={customBrief}
                      onChange={(e) => setCustomBrief(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Target Audience</label>
                    <select
                      value={concept}
                      onChange={(e) => setConcept(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="lifeJuggler">Life Juggler</option>
                      <option value="socialButterflyMom">Social Butterfly Mom</option>
                      <option value="careerDrivenMom">Career Driven Mom</option>
                      <option value="selfCareFocused">Self Care Focused</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Sub-Persona</label>
                    <select
                      value={subPersona}
                      onChange={(e) => setSubPersona(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="newMom">New Mom</option>
                      <option value="workingMom">Working Mom</option>
                      <option value="stayAtHomeMom">Stay-at-Home Mom</option>
                      <option value="singleMom">Single Mom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Brand/DR Balance: {brandDrBalance[0]}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={brandDrBalance[0]}
                      onChange={(e) => setBrandDrBalance([parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Direct Response</span>
                      <span>Brand Focused</span>
                    </div>
                  </div>

                  <Button 
                    onClick={generateAdCopy} 
                    className="w-full text-white hover:opacity-90"
                    style={{ backgroundColor: '#004182' }}
                    disabled={generateAdCopyMutation.isPending}
                  >
                    {generateAdCopyMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2" size={16} />
                        Generate Ad Copy
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Output Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Generated Ad Copy</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedHeadlines.length > 0 ? (
                    <div className="space-y-4">
                      {/* Headlines */}
                      <div>
                        <h3 className="font-medium mb-3">Headlines</h3>
                        <div className="space-y-2">
                          {generatedHeadlines.map((headline, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                              <div className="flex-1">
                                <div className="text-xs text-blue-600 font-medium mb-1">
                                  {headline.framework}
                                </div>
                                <div className="text-sm">{headline.copy}</div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(headline.copy, 'Headline')}
                                className="ml-2"
                              >
                                <Copy size={14} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Primary Text */}
                      {generatedPrimaryText && (
                        <div>
                          <h3 className="font-medium mb-3">Primary Text</h3>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-start justify-between">
                              <p className="text-sm flex-1">{generatedPrimaryText}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(generatedPrimaryText, 'Primary Text')}
                                className="ml-2"
                              >
                                <Copy size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Sparkles className="mx-auto mb-4 text-gray-400" size={48} />
                      <p>Generate ad copy to see results here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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