import { useState } from 'react';
import { DEFAULT_PERSONA_KEY, DEFAULT_USE_JONES_BRAND_GUIDE, DEFAULT_BRAND_DR_BALANCE } from '@shared/constants';

export const useContentInputs = () => {
  const [transcription, setTranscription] = useState('');
  const [airLink, setAirLink] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [customBrief, setCustomBrief] = useState('');
  const [persona, setPersona] = useState(DEFAULT_PERSONA_KEY);
  const [targetAudience, setTargetAudience] = useState('');
  const [landingPageUrl, setLandingPageUrl] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [useJonesBrandGuide, setUseJonesBrandGuide] = useState(DEFAULT_USE_JONES_BRAND_GUIDE);
  const [brandDrBalance, setBrandDrBalance] = useState([DEFAULT_BRAND_DR_BALANCE]);
  const [enableInfluencerMode, setEnableInfluencerMode] = useState(false);
  const [influencerHandle, setInfluencerHandle] = useState('');
  const [voiceAnalysisMethod, setVoiceAnalysisMethod] = useState('combined');
  const [influencerBrandBalance, setInfluencerBrandBalance] = useState([DEFAULT_BRAND_DR_BALANCE]);
  const [contentType, setContentType] = useState('video');
  const [customRequest, setCustomRequest] = useState('');
  const [customRequestHistory, setCustomRequestHistory] = useState<Array<{
    request: string;
    response: string;
    timestamp: Date;
  }>>([]);
  const [generatedCustomResponse, setGeneratedCustomResponse] = useState('');

  return {
    transcription,
    setTranscription,
    airLink,
    setAirLink,
    uploadedImage,
    setUploadedImage,
    customBrief,
    setCustomBrief,
    persona,
    setPersona,
    targetAudience,
    setTargetAudience,
    landingPageUrl,
    setLandingPageUrl,
    selectedProduct,
    setSelectedProduct,
    selectedProducts,
    setSelectedProducts,
    useJonesBrandGuide,
    setUseJonesBrandGuide,
    brandDrBalance,
    setBrandDrBalance,
    enableInfluencerMode,
    setEnableInfluencerMode,
    influencerHandle,
    setInfluencerHandle,
    voiceAnalysisMethod,
    setVoiceAnalysisMethod,
    influencerBrandBalance,
    setInfluencerBrandBalance,
    contentType,
    setContentType,
    customRequest,
    setCustomRequest,
    customRequestHistory,
    setCustomRequestHistory,
    generatedCustomResponse,
    setGeneratedCustomResponse,
  };
};