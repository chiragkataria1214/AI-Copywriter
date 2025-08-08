import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Copy, Settings, ChevronDown, ChevronRight, Eye, Cpu, FileText } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export interface GenerationMetadata {
  stationName: string;
  timestamp: string;
  modelUsed: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt: string;
  userPrompt: string;
  requestPayload?: any;
  rawResponse?: string;
  brandGuidelines?: string[];
  frameworks?: string[];
  personaSettings?: {
    persona: string;
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
    payload: false,
    prompts: false,
    response: false,
    model: false
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
                    <h4 className="font-medium text-gray-900">System Prompt</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(metadata.systemPrompt, 'System prompt')}
                    >
                      <Copy size={16} className="mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {metadata.systemPrompt}
                    </pre>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">User Prompt</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(metadata.userPrompt, 'User prompt')}
                    >
                      <Copy size={16} className="mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {metadata.userPrompt}
                    </pre>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

      

          {/* Request Payload */}
          {metadata.requestPayload && (
            <Collapsible open={openSections.payload} onOpenChange={() => toggleSection('payload')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-4 bg-white border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Request Payload</span>
                    <Badge variant="secondary">JSON</Badge>
                  </div>
                  {openSections.payload ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Request Payload</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(metadata.requestPayload, null, 2), 'Request payload')}
                    >
                      <Copy size={16} className="mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(metadata.requestPayload, null, 2)}
                    </pre>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Raw Response */}
          {metadata.rawResponse && (
            <Collapsible open={openSections.response} onOpenChange={() => toggleSection('response')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-4 bg-white border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Raw AI Response</span>
                    <Badge variant="secondary">Full</Badge>
                  </div>
                  {openSections.response ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Raw AI Response</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(metadata.rawResponse || '', 'Raw response')}
                    >
                      <Copy size={16} className="mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {metadata.rawResponse}
                    </pre>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}