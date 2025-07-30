import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Copy, Settings, ChevronDown, ChevronRight, Eye, Clock, User, Cpu, FileText, Target, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface GenerationMetadata {
  stationName: string;
  timestamp: string;
  modelUsed: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt: string;
  userPrompt: string;
  brandGuidelines?: string[];
  frameworks?: string[];
  personaSettings?: {
    concept: string;
    subPersona?: string;
  };
  productClaims?: {
    approved: string[];
    prohibited: string[];
  };
  brandDrBalance?: number;
  selectedProduct?: string;
  settingsVersion?: string;
}

interface GenerationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: GenerationMetadata | null;
  onEditSettings?: () => void;
  userRole?: string;
}

export function GenerationDetailsModal({ isOpen, onClose, metadata, onEditSettings, userRole }: GenerationDetailsModalProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    prompts: true,
    model: false,
    brand: false,
    frameworks: false,
    persona: false,
    product: false
  });
  const { toast } = useToast();

  if (!metadata) return null;

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied successfully`,
      duration: 2000,
    });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#004182]" />
              Generation Details - {metadata.stationName}
            </DialogTitle>
            {onEditSettings && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (userRole === 'admin') {
                    onEditSettings();
                    onClose();
                  } else {
                    toast({
                      title: "Access Required",
                      description: "Admin access required to edit AI Settings",
                      variant: "destructive"
                    });
                  }
                }}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Edit AI Settings
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Generation Overview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium">Generated</div>
                  <div className="text-gray-600">{formatTimestamp(metadata.timestamp)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium">Model</div>
                  <div className="text-gray-600">{metadata.modelUsed}</div>
                </div>
              </div>
              {metadata.brandDrBalance !== undefined && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">Brand/DR Balance</div>
                    <div className="text-gray-600">{metadata.brandDrBalance}% Brand</div>
                  </div>
                </div>
              )}
              {metadata.selectedProduct && (
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">Product Focus</div>
                    <div className="text-gray-600">{metadata.selectedProduct}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Prompts Section */}
          <Collapsible open={openSections.prompts} onOpenChange={() => toggleSection('prompts')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 bg-white border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">AI Prompts</span>
                  <Badge variant="secondary" className="ml-2">Active</Badge>
                </div>
                {openSections.prompts ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="space-y-4 bg-white border rounded-lg p-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">System Prompt</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(metadata.systemPrompt, 'System prompt')}
                      className="h-6 px-2"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="bg-gray-50 rounded p-3 text-sm font-mono text-gray-700 max-h-32 overflow-y-auto">
                    {metadata.systemPrompt}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">User Prompt Template</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(metadata.userPrompt, 'User prompt')}
                      className="h-6 px-2"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="bg-gray-50 rounded p-3 text-sm font-mono text-gray-700 max-h-32 overflow-y-auto">
                    {metadata.userPrompt}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Model Configuration */}
          <Collapsible open={openSections.model} onOpenChange={() => toggleSection('model')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 bg-white border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  <span className="font-medium">Model Configuration</span>
                </div>
                {openSections.model ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-white border rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Model</div>
                    <div className="text-gray-600">{metadata.modelUsed}</div>
                  </div>
                  {metadata.temperature !== undefined && (
                    <div>
                      <div className="font-medium">Temperature</div>
                      <div className="text-gray-600">{metadata.temperature}</div>
                    </div>
                  )}
                  {metadata.maxTokens && (
                    <div>
                      <div className="font-medium">Max Tokens</div>
                      <div className="text-gray-600">{metadata.maxTokens}</div>
                    </div>
                  )}
                  {metadata.settingsVersion && (
                    <div>
                      <div className="font-medium">Settings Version</div>
                      <div className="text-gray-600 font-mono text-xs">{metadata.settingsVersion}</div>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Brand Guidelines */}
          {metadata.brandGuidelines && metadata.brandGuidelines.length > 0 && (
            <Collapsible open={openSections.brand} onOpenChange={() => toggleSection('brand')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-4 bg-white border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Brand Guidelines Applied</span>
                    <Badge variant="secondary">{metadata.brandGuidelines.length} rules</Badge>
                  </div>
                  {openSections.brand ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-white border rounded-lg p-4">
                  <div className="space-y-2">
                    {metadata.brandGuidelines.map((guideline, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-[#004182] rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{guideline}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Copywriting Frameworks */}
          {metadata.frameworks && metadata.frameworks.length > 0 && (
            <Collapsible open={openSections.frameworks} onOpenChange={() => toggleSection('frameworks')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-4 bg-white border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Frameworks Used</span>
                    <Badge variant="secondary">{metadata.frameworks.length} frameworks</Badge>
                  </div>
                  {openSections.frameworks ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {metadata.frameworks.map((framework, index) => (
                      <Badge key={index} variant="outline">{framework}</Badge>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Persona Settings */}
          {metadata.personaSettings && (
            <Collapsible open={openSections.persona} onOpenChange={() => toggleSection('persona')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-4 bg-white border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Persona Targeting</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  {openSections.persona ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-white border rounded-lg p-4">
                  <div className="space-y-3">
                    <div>
                      <div className="font-medium text-sm">Primary Persona</div>
                      <div className="text-gray-600">{metadata.personaSettings.concept}</div>
                    </div>
                    {metadata.personaSettings.subPersona && (
                      <div>
                        <div className="font-medium text-sm">Sub-Persona</div>
                        <div className="text-gray-600">{metadata.personaSettings.subPersona}</div>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Product Claims */}
          {metadata.productClaims && (metadata.productClaims.approved.length > 0 || metadata.productClaims.prohibited.length > 0) && (
            <Collapsible open={openSections.product} onOpenChange={() => toggleSection('product')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-4 bg-white border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    <span className="font-medium">Product Claims</span>
                    <Badge variant="secondary">
                      {metadata.productClaims.approved.length + metadata.productClaims.prohibited.length} claims
                    </Badge>
                  </div>
                  {openSections.product ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-white border rounded-lg p-4 space-y-4">
                  {metadata.productClaims.approved.length > 0 && (
                    <div>
                      <div className="font-medium text-sm text-green-700 mb-2">Approved Claims</div>
                      <div className="flex flex-wrap gap-1">
                        {metadata.productClaims.approved.map((claim, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                            {claim}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {metadata.productClaims.prohibited.length > 0 && (
                    <div>
                      <div className="font-medium text-sm text-red-700 mb-2">Prohibited Claims</div>
                      <div className="flex flex-wrap gap-1">
                        {metadata.productClaims.prohibited.map((claim, index) => (
                          <Badge key={index} variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                            {claim}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}