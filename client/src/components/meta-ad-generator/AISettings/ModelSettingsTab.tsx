import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrainingConfig } from '@shared/training-config';

interface ModelSettingsTabProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
}

export const ModelSettingsTab: React.FC<ModelSettingsTabProps> = ({
  editingConfig,
  setEditingConfig
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-800 font-medium">AI Model Configuration</p>
        <p className="text-sm text-purple-700 mt-1">
          Configure Claude AI model parameters for optimal copy generation performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Label className="text-sm font-medium text-gray-900 mb-3 block">
            <span className="inline-flex items-center">
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
              Model Version
            </span>
          </Label>
          <Input
            value={editingConfig?.modelParameters?.model || ''}
            onChange={(e) => setEditingConfig({
              ...editingConfig,
              modelParameters: {
                ...editingConfig.modelParameters,
                model: e.target.value
              }
            })}
            className="text-gray-900 font-medium border-purple-200 focus:border-purple-400"
            placeholder="claude-sonnet-4-20250514"
            disabled={false}
          />
          <p className="text-xs text-gray-600 mt-1">Latest available Claude model version</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-900 mb-3 block">
            <span className="inline-flex items-center">
              <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
              Max Tokens
            </span>
          </Label>
          <Input
            type="number"
            value={editingConfig?.modelParameters?.maxTokens || ''}
            onChange={(e) => setEditingConfig({
              ...editingConfig,
              modelParameters: {
                ...editingConfig.modelParameters,
                maxTokens: parseInt(e.target.value) || 1024
              }
            })}
            className="text-gray-900 font-medium border-indigo-200 focus:border-indigo-400"
            placeholder="1024"
            disabled={false}
          />
          <p className="text-xs text-gray-600 mt-1">Maximum response length (1024-4000 recommended)</p>
        </div>
      </div>
    </div>
  );
}; 