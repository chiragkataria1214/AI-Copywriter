import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Upload, Image, Mail, Sparkles, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface EmailImageAnalyzerProps {
  emailFrameworks: any[];
}

export const EmailImageAnalyzer: React.FC<EmailImageAnalyzerProps> = ({
  emailFrameworks
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { toast } = useToast();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file.",
          variant: "destructive"
        });
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage || !selectedFramework) {
      toast({
        title: "Missing Information",
        description: "Please select both an image and a framework.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('selectedFramework', selectedFramework);

      const response = await fetch('/api/email-image-analysis', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
      
      toast({
        title: "Analysis Complete",
        description: "Email image has been analyzed successfully.",
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze email image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setImagePreview('');
    setSelectedFramework('');
    setAnalysisResult(null);
  };

  const activeFrameworks = emailFrameworks.filter(fw => fw.isActive === 'true');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Image className="w-5 h-5 text-blue-500" />
          <span>Email Image Analyzer</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload an email design to analyze its structure and extract copywriting elements
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Upload */}
        <div>
          <Label className="text-sm font-medium text-gray-900 mb-3 block">
            Upload Email Design
          </Label>
          {!imagePreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Selected email design"
                className="w-full max-w-md mx-auto rounded-lg border border-gray-200"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={clearSelection}
                className="absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Framework Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-900 mb-3 block">
            Select Email Framework
          </Label>
          <Select value={selectedFramework} onValueChange={setSelectedFramework}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a framework for analysis" />
            </SelectTrigger>
            <SelectContent>
              {activeFrameworks.map((framework) => (
                <SelectItem key={framework.name} value={framework.name}>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-green-500" />
                    <span>{framework.displayName}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={!selectedImage || !selectedFramework || isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze Email Design
            </>
          )}
        </Button>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              Analysis Results
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-green-800">AI Analysis:</p>
                <p className="text-sm text-green-700 mt-1">{analysisResult.aiAnalysis}</p>
              </div>
              
              {analysisResult.extractedElements && (
                <div>
                  <p className="text-sm font-medium text-green-800">Extracted Elements:</p>
                  <div className="text-sm text-green-700 mt-1 space-y-1">
                    {analysisResult.extractedElements.subject && (
                      <p><strong>Subject:</strong> {analysisResult.extractedElements.subject}</p>
                    )}
                    {analysisResult.extractedElements.preheader && (
                      <p><strong>Preheader:</strong> {analysisResult.extractedElements.preheader}</p>
                    )}
                    {analysisResult.extractedElements.ctaButtons && (
                      <p><strong>CTA Buttons:</strong> {analysisResult.extractedElements.ctaButtons.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-green-200">
                <p className="text-xs text-green-600">
                  Framework: {activeFrameworks.find(fw => fw.name === analysisResult.selectedFramework)?.displayName}
                </p>
                <p className="text-xs text-green-600">
                  Confidence: {analysisResult.confidence}%
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};