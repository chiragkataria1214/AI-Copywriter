import { useState } from 'react';
import { Copy, Check, Target, Sparkles, Video, FileText } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export default function DemoGenerator() {
  const [activeTab, setActiveTab] = useState('ads');
  const [transcription, setTranscription] = useState('');
  const [concept, setConcept] = useState('lifeJuggler');
  const [subPersona, setSubPersona] = useState('newMom');
  const [targetAudience, setTargetAudience] = useState('');
  const [landingPageUrl, setLandingPageUrl] = useState('');
  const [brandDrBalance, setBrandDrBalance] = useState([50]);
  
  // Ad Copy States
  const [generatedHeadlines, setGeneratedHeadlines] = useState<Array<{ framework: string; copy: string }>>([]);
  const [generatedPrimaryText, setGeneratedPrimaryText] = useState('');
  
  // Copy states
  const [copiedHeadlines, setCopiedHeadlines] = useState(false);
  const [copiedPrimaryText, setCopiedPrimaryText] = useState(false);

  // Define personas
  const personas = {
    lifeJuggler: {
      label: 'Life Juggler',
      description: 'Busy individuals balancing multiple priorities who need efficient, reliable solutions',
      subPersonas: {
        newMom: { label: 'New Mom', valueProps: ['time-saving', 'gentle on skin', 'natural look'] },
        workingMom: { label: 'Working Mom', valueProps: ['professional appearance', 'quick application', 'long-lasting'] },
        careerWoman: { label: 'Career Woman', valueProps: ['sophisticated look', 'confidence boost', 'versatile'] }
      }
    },
    minimalist: {
      label: 'Minimalist',
      description: 'Individuals who prefer a streamlined routine with multi-functional products',
      subPersonas: {}
    },
    beautyEnthusiast: {
      label: 'Beauty Enthusiast',
      description: 'Passionate about beauty products and always trying new things',
      subPersonas: {}
    }
  };

  // Generate Ad Copy Mutation for demo
  const generateAdCopyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/demo/generate-ad-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedHeadlines(data.headlines || []);
      setGeneratedPrimaryText(data.primaryText || '');
      toast({
        title: "Copy Generated!",
        description: "Your ad copy has been created using Claude AI",
      });
    },
    onError: (error) => {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate ad copy",
        variant: "destructive",
      });
    }
  });

  const handleGenerateAdCopy = () => {
    const selectedPersona = personas[concept as keyof typeof personas];
    const brandPercent = brandDrBalance[0];
    const drPercent = 100 - brandPercent;

    generateAdCopyMutation.mutate({
      transcription,
      concept,
      subPersona,
      targetAudience: targetAudience || selectedPersona?.label,
      landingPageUrl,
      brandDrBalance: brandPercent,
      useJonesBrandGuide: true
    });
  };

  const copyToClipboard = async (text: string, type: 'headlines' | 'primaryText') => {
    try {
      await navigator.clipboard.writeText(text);
      
      if (type === 'headlines') {
        setCopiedHeadlines(true);
        setTimeout(() => setCopiedHeadlines(false), 2000);
      } else {
        setCopiedPrimaryText(true);
        setTimeout(() => setCopiedPrimaryText(false), 2000);
      }
      
      toast({
        title: "Copied!",
        description: `${type === 'headlines' ? 'Headlines' : 'Primary text'} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const copyHeadlinesText = generatedHeadlines.map(h => h.copy).join('\n');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#004182] rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Copywriter</h1>
              <p className="text-sm text-gray-500">Demo Mode - Jones Road Beauty</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ads" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Ad Copy Generator</span>
            </TabsTrigger>
            <TabsTrigger value="landing" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Landing Pages</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ads" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h3 className="text-lg font-semibold">Input Content</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="transcription">Video Transcription or Content</Label>
                      <Textarea
                        id="transcription"
                        placeholder="Paste your video transcription, marketing content, or key points here..."
                        value={transcription}
                        onChange={(e) => setTranscription(e.target.value)}
                        className="min-h-32"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="concept">Target Persona</Label>
                      <Select value={concept} onValueChange={setConcept}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(personas).map(([key, persona]) => (
                            <SelectItem key={key} value={key}>
                              {persona.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {personas[concept as keyof typeof personas]?.subPersonas && Object.keys(personas[concept as keyof typeof personas].subPersonas || {}).length > 0 && (
                      <div>
                        <Label htmlFor="subPersona">Sub-Persona</Label>
                        <Select value={subPersona} onValueChange={setSubPersona}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(personas[concept as keyof typeof personas].subPersonas || {}).map(([key, subP]) => (
                              <SelectItem key={key} value={key}>
                                {(subP as any).label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="landing-url">Landing Page URL (Optional)</Label>
                      <Input
                        id="landing-url"
                        placeholder="https://jonesroadbeauty.com/products/..."
                        value={landingPageUrl}
                        onChange={(e) => setLandingPageUrl(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Brand/DR Balance: {brandDrBalance[0]}% Brand / {100 - brandDrBalance[0]}% Direct Response</Label>
                      <div className="px-2 py-4">
                        <Slider
                          value={brandDrBalance}
                          onValueChange={setBrandDrBalance}
                          max={100}
                          min={0}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleGenerateAdCopy}
                      disabled={generateAdCopyMutation.isPending}
                      className="w-full bg-[#004182] hover:bg-[#003366] text-white"
                      size="lg"
                    >
                      {generateAdCopyMutation.isPending ? (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                          Generating with Claude AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Ad Copy
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Output Section */}
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Generated Copy</h3>
                  </div>

                  {generatedHeadlines.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Headlines</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(copyHeadlinesText, 'headlines')}
                          className="flex items-center space-x-1"
                        >
                          {copiedHeadlines ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedHeadlines ? 'Copied!' : 'Copy All'}</span>
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {generatedHeadlines.map((headline, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Badge variant="secondary" className="shrink-0 text-xs">
                              {headline.framework}
                            </Badge>
                            <p className="flex-1 text-sm">{headline.copy}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {generatedPrimaryText && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Primary Text</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(generatedPrimaryText, 'primaryText')}
                          className="flex items-center space-x-1"
                        >
                          {copiedPrimaryText ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedPrimaryText ? 'Copied!' : 'Copy'}</span>
                        </Button>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm leading-relaxed">{generatedPrimaryText}</p>
                      </div>
                    </div>
                  )}

                  {generatedHeadlines.length === 0 && !generatedPrimaryText && (
                    <div className="text-center py-12 text-gray-500">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Generated ad copy will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="landing" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Landing page generator coming soon in demo mode</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}