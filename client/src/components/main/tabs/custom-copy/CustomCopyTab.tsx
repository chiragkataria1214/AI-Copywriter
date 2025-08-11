import React, { useRef } from 'react';
import { Brain, Sparkles, Copy, FileText, Download, Eye, Target } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { asBlob } from 'html-docx-js';
import { saveAs } from 'file-saver';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ProductSelection } from '@/components/common/ProductSelection';
import { Product } from '@shared/schema';
import { UseMutationResult } from '@tanstack/react-query';
import { TargetPersona } from '@/components/common/TargetPersona';
import { StandardizedDebugButton } from '@/components/common/StandardizedDebugButton';
import { STATION_KEYS } from '@/hooks/generation/useDebugInfo';
import { BRAND_NAME } from '@shared/constants';
import { BrandDrBalance } from '@/components/common/BrandDrBalance';
import { Check } from 'lucide-react';

interface Persona {
  label: string;
}

interface CustomCopyTabProps {
  // State variables
  customRequest: string;
  setCustomRequest: (value: string) => void;
  generatedCustomResponse: string;
  customRequestHistory: Array<{
    request: string;
    response: string;
    timestamp: Date;
  }>;
  persona: string;
  setPersona: (value: string) => void;
  selectedProduct: string;
  setSelectedProduct: (value: string) => void;
  selectedProducts: string[];
  setSelectedProducts: (value: string[]) => void;
  brandDrBalance: number[];
  setBrandDrBalance: (value: number[]) => void;
  useBrandGuide: boolean;
  setUseBrandGuide: (value: boolean) => void;
  
  // Data
  personas: Record<string, Persona>;
  products: Product[];
  
  // Functions
  generateCustomCopyMutation: UseMutationResult<any, Error, void, unknown>;
  getGenerationDisabledState: (stationType: 'customRequest') => { disabled: boolean; reason: string };
  copyToClipboard: (text: string, type: string) => Promise<void>;
  setSelectedItemForRevision: (value: { type: "headline" | "primaryText" | "landingCopy" | "custom" | "retention" | "staticAd" | "socialCaption"; index?: number; field?: string } | null) => void;
  setShowRevisionPanel: (value: boolean) => void;
  setCurrentGenerationMetadata: (metadata: any) => void;
  setShowGenerationDetails: (value: boolean) => void;
  
  // Settings data
  modelSettings?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  stationPrompts?: {
    customRequest?: {
      systemPrompt?: string;
    };
  };
  brandGuidelines?: {
    guidelines?: string[];
  };
  copyFrameworks?: {
    customRequest?: {
      frameworks?: string[];
    };
  };
  debugInfoManager?: {
    getDebugInfo: (stationKey: string) => any;
    setDebugInfo: (stationKey: string, debugInfo: any) => void;
  };
}

export function CustomCopyTab({
  customRequest,
  setCustomRequest,
  generatedCustomResponse,
  customRequestHistory,
  persona,
  setPersona,
  selectedProduct,
  setSelectedProduct,
  selectedProducts,
  setSelectedProducts,
  brandDrBalance,
  setBrandDrBalance,
  useBrandGuide,
  setUseBrandGuide,
  personas,
  products,
  generateCustomCopyMutation,
  getGenerationDisabledState,
  copyToClipboard,
  setSelectedItemForRevision,
  setShowRevisionPanel,
  setCurrentGenerationMetadata,
  setShowGenerationDetails,
  modelSettings,
  stationPrompts,
  brandGuidelines,
  copyFrameworks,
  debugInfoManager,
}: CustomCopyTabProps) {

  const generatedContentRef = useRef<HTMLDivElement>(null);
  const [copiedStates, setCopiedStates] = React.useState<Record<string, boolean>>({});

  const handleCopyToClipboard = (text: string, type: string) => {
    copyToClipboard(text, type);
    setCopiedStates(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [type]: false }));
    }, 2000);
  };

  const downloadAsTxt = () => {
    const blob = new Blob([generatedCustomResponse], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'generated-copy.txt');
  };

  const downloadAsPdf = () => {
    if (generatedContentRef.current) {
      html2canvas(generatedContentRef.current).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('generated-copy.pdf');
      });
    }
  };

  const downloadAsDocx = () => {
    if (generatedContentRef.current) {
      const htmlString = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Generated Copy</title></head><body>${generatedContentRef.current.innerHTML}</body></html>`;
      const blob = asBlob(htmlString) as Blob;
      saveAs(blob, 'generated-copy.docx');
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Input Section */}
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="text-jones-primary mr-2 sm:mr-3" size={18} />
              Custom Copy Request
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe what you need
                </Label>
                <Textarea
                  placeholder="Example: Write a product announcement for our new mascara launch targeting busy moms, or create social media captions for a limited-time promotion, or write email subject lines for our newsletter..."
                  value={customRequest}
                  onChange={(e) => setCustomRequest(e.target.value)}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Be as specific as possible about format, persona, tone, and purpose
                </p>
              </div>

              {/* Basic Settings */}
              <div className="space-y-3">
                <TargetPersona
                  personas={personas}
                  persona={persona}
                  setPersona={setPersona}
                  title="Target Persona"
                  showCard={false}
                  showIcon={false}
                  // fallbackOptions={[
                  //   { key: "lifeJuggler", label: "Life Juggler" },
                  //   { key: "cleanBeautyEnthusiast", label: "Clean Beauty Enthusiast" },
                  //   { key: "timeConstrainedProfessional", label: "Time-Constrained Professional" },
                  //   { key: "naturalBeautySeeker", label: "Natural Beauty Seeker" }
                  // ]}
                />

                <ProductSelection
                  selectedProducts={selectedProducts}
                  setSelectedProducts={setSelectedProducts}
                  products={products}
                  title="Product Context (Multi-Select)"
                  description="Select products to mention in your custom copy. Multiple products can be selected for comprehensive copy generation."
                />

                <BrandDrBalance
                  brandDrBalance={brandDrBalance}
                  setBrandDrBalance={setBrandDrBalance}
                  useBrandGuide={useBrandGuide}
                  setUseBrandGuide={setUseBrandGuide}
                />
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full">
                      <Button
                        onClick={() => generateCustomCopyMutation.mutate()}
                        disabled={!customRequest.trim() || generateCustomCopyMutation.isPending || getGenerationDisabledState('customRequest').disabled}
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        {generateCustomCopyMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Brain size={16} />
                            <span>Generate Custom Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {(getGenerationDisabledState('customRequest').disabled || !customRequest.trim()) && (
                    <TooltipContent>
                      <p>
                        {!customRequest.trim()
                          ? 'Please enter a custom request'
                          : getGenerationDisabledState('customRequest').reason
                        }
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Output Section */}
      <div className="space-y-4 sm:space-y-6">
        {generateCustomCopyMutation.isPending ? (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="text-jones-primary mr-2 sm:mr-3" size={18} />
                Generating Custom Copy
              </h3>
              
              <div className="text-center py-12">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
                <p className="text-gray-600 font-medium mb-2">Processing Your Request</p>
                <p className="text-sm text-gray-500">
                  Creating custom copy tailored to your specific requirements and brand guidelines...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : generatedCustomResponse && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <Sparkles className="text-jones-primary mr-2 sm:mr-3" size={18} />
                  Custom Copy
                </h3>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs">
                        <Download size={14} className="mr-1" />
                        <span>Download</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={downloadAsTxt}>as TXT</DropdownMenuItem>
                      <DropdownMenuItem onClick={downloadAsPdf}>as PDF</DropdownMenuItem>
                      {/* <DropdownMenuItem onClick={downloadAsDocx}>as DOCX</DropdownMenuItem> */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedItemForRevision({ type: 'custom' });
                      setShowRevisionPanel(true);
                    }}
                    className="w-full sm:w-auto text-xs"
                  >
                    <Target size={14} className="mr-1" />
                    <span>Improve</span>
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                                              <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyToClipboard(generatedCustomResponse, 'custom')}
                        className="w-full sm:w-auto text-xs px-2"
                      >
                        {copiedStates['custom'] ? <Check size={14} /> : <Copy size={14} />}
                      </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {copiedStates['custom'] ? 'Copied' : 'Copy'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <StandardizedDebugButton
                    stationKey={STATION_KEYS.CUSTOM_REQUEST}
                    stationName="Custom Request"
                    fallbackPrompts={{
                      systemPrompt: stationPrompts?.customRequest?.systemPrompt || `Expert marketing copywriter for ${BRAND_NAME}...`,
                      userPrompt: `Request: ${customRequest}\nAudience: ${persona}`
                    }}
                    modelSettings={modelSettings}
                    setCurrentGenerationMetadata={setCurrentGenerationMetadata}
                    setShowGenerationDetails={setShowGenerationDetails}
                    className="flex items-center space-x-1 text-xs"
                    size="sm"
                    debugInfoManager={debugInfoManager}
                  />
                </div>
              </div>

              <div ref={generatedContentRef} className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-4 border">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                >
                  {generatedCustomResponse}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Request History */}
        {customRequestHistory.length > 0 && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="text-jones-primary mr-2 sm:mr-3" size={18} />
                Recent Requests
              </h3>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {customRequestHistory.slice(0, 5).map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">
                      {item.timestamp.toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Request: {item.request.substring(0, 100)}
                      {item.request.length > 100 && '...'}
                    </div>
                    <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                      {item.response.substring(0, 200)}
                      {item.response.length > 200 && '...'}
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopyToClipboard(item.response, `history-${index}`)}
                            className="mt-2 flex items-center space-x-1"
                          >
                            {copiedStates[`history-${index}`] ? <Check size={12} /> : <Copy size={12} />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {copiedStates[`history-${index}`] ? 'Copied' : 'Copy'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 