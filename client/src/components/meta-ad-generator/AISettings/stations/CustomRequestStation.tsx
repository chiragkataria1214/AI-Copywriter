import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TrainingConfig } from '@shared/training-config';
import { ChevronDown, ChevronRight, Sparkles, Lock, Copy } from 'lucide-react';

interface CustomRequestStationProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  expandedStations: Set<string>;
  setExpandedStations: (stations: Set<string>) => void;
  copyToClipboard: (text: string, label: string) => Promise<void>;
}

const StationToggleButton = ({ isOpen, onClick, title, icon, iconColor, description }: any) => (
  <div className="bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200">
    <button onClick={onClick} className="flex items-center justify-between w-full p-4">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {isOpen ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
          <span className={iconColor}>{icon}</span>
        </div>
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {!isOpen && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-500 font-medium">{isOpen ? 'Collapse' : 'Expand'}</span>
      </div>
    </button>
  </div>
);

const extractOutputStructure = (prompt: string) => {
  const outputRequirementMatch = prompt.match(/(CRITICAL OUTPUT REQUIREMENT:[\s\S]*?Your response must follow this exact[^:]*structure:[^}]*})/i);
  if (outputRequirementMatch) return outputRequirementMatch[1];
  const arrayStructureMatch = prompt.match(/(CRITICAL OUTPUT REQUIREMENT:[\s\S]*?Your response must follow this exact[^:]*structure:[^}]*\])/i);
  if (arrayStructureMatch) return arrayStructureMatch[1];
  const textStructureMatch = prompt.match(/(CRITICAL OUTPUT REQUIREMENT:[\s\S]*?You MUST return your response as[^.]*\.)/i);
  if (textStructureMatch) return textStructureMatch[1];
  return null;
};

const getEditablePrompt = (prompt: string) => {
  const structure = extractOutputStructure(prompt);
  return structure ? prompt.replace(structure, '').trim() : prompt;
};

const reconstructPrompt = (editableContent: string, originalPrompt: string) => {
  const structure = extractOutputStructure(originalPrompt);
  if (structure) {
    const lines = editableContent.split('\n');
    const insertIndex = lines.findIndex(line => line.trim() === '') || 1;
    const beforeStructure = lines.slice(0, insertIndex).join('\n');
    const afterStructure = lines.slice(insertIndex).join('\n');
    return `${beforeStructure}\n\n${structure}\n\n${afterStructure}`.trim();
  }
  return editableContent;
};

const ProtectedPromptEditor = ({ label, value, onChange, placeholder, rows = 8, disabled = false, copyToClipboard }: any) => {
  const outputStructure = extractOutputStructure(value);
  const editableContent = getEditablePrompt(value);
  const handleChange = (newEditableContent: string) => {
    const reconstructedPrompt = reconstructPrompt(newEditableContent, value);
    onChange(reconstructedPrompt);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 bg-white border rounded-lg p-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">{label}</h4>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(value, label)} disabled={!value}>
              <Copy size={16} className="mr-1" />Copy
            </Button>
          </div>
          {disabled ? (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{editableContent || placeholder}</pre>
            </div>
          ) : (
            <Textarea value={editableContent} onChange={(e) => handleChange(e.target.value)} className="text-gray-900 resize-y border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-4 transition-all duration-200" rows={rows} placeholder={placeholder} disabled={disabled} />
          )}
        </div>
      </div>
      {outputStructure && (
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Protected Output Structure</span>
          </div>
          <div className="bg-white border border-amber-200 rounded p-3">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{outputStructure}</pre>
          </div>
          <p className="text-xs text-amber-700 mt-2">This section is protected to ensure frontend compatibility.</p>
        </div>
      )}
    </div>
  );
};

const EnhancedTextField = ({ label, value, onChange, placeholder, rows = 4, disabled = false, bgColor = "bg-blue-50", borderColor = "border-blue-200", copyToClipboard }: any) => (
  <div className="space-y-4 bg-white border rounded-lg p-4">
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{label}</h4>
        <Button variant="outline" size="sm" onClick={() => copyToClipboard(value, label)} disabled={!value}><Copy size={16} className="mr-1" />Copy</Button>
      </div>
      {disabled ? (
        <div className={`${bgColor} rounded-lg p-4 ${borderColor} border max-h-64 overflow-y-auto`}>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{value || placeholder}</pre>
        </div>
      ) : (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} className="text-gray-900 resize-y border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-4 transition-all duration-200" rows={rows} placeholder={placeholder} disabled={disabled} />
      )}
    </div>
  </div>
);

const EnhancedArrayField = ({ label, value, onChange, placeholder, rows = 4, disabled = false, bgColor = "bg-green-50", borderColor = "border-green-200", copyToClipboard }: any) => {
  const textValue = Array.isArray(value) ? value.join('\n') : '';
  return (
    <div className="space-y-4 bg-white border rounded-lg p-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">{label}</h4>
          <Button variant="outline" size="sm" onClick={() => copyToClipboard(textValue, label)} disabled={!textValue}><Copy size={16} className="mr-1" />Copy</Button>
        </div>
        {disabled ? (
          <div className={`${bgColor} rounded-lg p-4 ${borderColor} border max-h-64 overflow-y-auto`}>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{textValue || placeholder}</pre>
          </div>
        ) : (
          <Textarea value={textValue} onChange={(e) => onChange(e.target.value.split('\n').map(item => item.trim()).filter(Boolean))} className="text-gray-900 resize-y border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-4 transition-all duration-200" rows={rows} placeholder={placeholder} disabled={disabled} />
        )}
      </div>
    </div>
  );
};

export const CustomRequestStation: React.FC<CustomRequestStationProps> = ({ editingConfig, setEditingConfig, effectiveUser, expandedStations, setExpandedStations, copyToClipboard }) => {
  const toggleStation = (stationId: string) => {
    const newExpanded = new Set(expandedStations);
    if (expandedStations.has(stationId)) {
      newExpanded.delete(stationId);
    } else {
      newExpanded.add(stationId);
    }
    setExpandedStations(newExpanded);
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <StationToggleButton isOpen={expandedStations.has('customRequest')} onClick={() => toggleStation('customRequest')} title="Custom Request Station" icon={<Sparkles className="w-5 h-5" />} iconColor="text-pink-500" description="Versatile copywriter for any custom marketing request" />
      {expandedStations.has('customRequest') && (
        <div className="p-6 pt-4 border-t border-gray-100 space-y-6">
          <ProtectedPromptEditor label="System Prompt" value={editingConfig?.stationPrompts?.customRequest?.systemPrompt || ''} onChange={(value) => setEditingConfig({...editingConfig, stationPrompts: {...editingConfig?.stationPrompts, customRequest: {...editingConfig?.stationPrompts?.customRequest, systemPrompt: value}}})} placeholder="You are a versatile copywriter capable of handling any custom marketing request..." rows={6} disabled={effectiveUser?.role !== 'admin'} copyToClipboard={copyToClipboard} />
          <EnhancedTextField label="User Prompt Template" value={editingConfig?.stationPrompts?.customRequest?.userPromptTemplate || ''} onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({...editingConfig, stationPrompts: {...editingConfig?.stationPrompts, customRequest: {...editingConfig?.stationPrompts?.customRequest, userPromptTemplate: value}}})} placeholder="Handle this custom request: [USER_REQUEST] for [BRAND/PRODUCT] with [SPECIFIC_REQUIREMENTS]..." rows={4} disabled={effectiveUser?.role !== 'admin'} bgColor="bg-green-50" borderColor="border-green-200" copyToClipboard={copyToClipboard} />
          <EnhancedArrayField label="Request Type Guidelines" value={editingConfig?.stationPrompts?.customRequest?.requestTypeGuidelines || []} onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({...editingConfig, stationPrompts: {...editingConfig?.stationPrompts, customRequest: {...editingConfig?.stationPrompts?.customRequest, requestTypeGuidelines: value}}})} placeholder="Product descriptions: Focus on benefits and use cases&#10;Social media captions: Platform-appropriate length and tone&#10;Blog posts: SEO-optimized with clear structure" rows={5} disabled={effectiveUser?.role !== 'admin'} bgColor="bg-rose-50" borderColor="border-rose-200" copyToClipboard={copyToClipboard} />
        </div>
      )}
    </div>
  );
}; 