import { useState, useEffect } from 'react';
import { Info, Sparkles, Zap, Target, Brain } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface FeatureTooltipProps {
  children: React.ReactNode;
  title: string;
  description: string;
  feature?: 'new' | 'enhanced' | 'pro' | 'ai' | 'beta';
  shortcut?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  showDelay?: number;
  pulse?: boolean;
}

const featureConfig = {
  new: {
    icon: Sparkles,
    badge: 'NEW',
    color: 'bg-emerald-500 text-white',
    iconColor: 'text-emerald-500'
  },
  enhanced: {
    icon: Zap,
    badge: 'ENHANCED',
    color: 'bg-blue-500 text-white',
    iconColor: 'text-blue-500'
  },
  pro: {
    icon: Target,
    badge: 'PRO',
    color: 'bg-purple-500 text-white',
    iconColor: 'text-purple-500'
  },
  ai: {
    icon: Brain,
    badge: 'AI',
    color: 'bg-orange-500 text-white',
    iconColor: 'text-orange-500'
  },
  beta: {
    icon: Info,
    badge: 'BETA',
    color: 'bg-yellow-500 text-white',
    iconColor: 'text-yellow-500'
  }
};

export function FeatureTooltip({ 
  children, 
  title, 
  description, 
  feature,
  shortcut,
  placement = 'top',
  showDelay = 300,
  pulse = false
}: FeatureTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isHovered) {
      timeout = setTimeout(() => setShowTooltip(true), showDelay);
    } else {
      setShowTooltip(false);
    }
    return () => clearTimeout(timeout);
  }, [isHovered, showDelay]);

  const config = feature ? featureConfig[feature] : null;
  const IconComponent = config?.icon || Info;

  return (
    <TooltipProvider delayDuration={showDelay}>
      <Tooltip open={showTooltip}>
        <TooltipTrigger asChild>
          <div 
            className="relative inline-flex items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {children}
            
            {/* Feature indicator */}
            {feature && (
              <div className={`
                absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center
                ${config?.color}
                ${pulse ? 'animate-pulse' : ''}
                transition-all duration-300 ease-out
                ${isHovered ? 'scale-110' : 'scale-100'}
              `}>
                <IconComponent className="w-2 h-2" />
              </div>
            )}
            
            {/* Subtle glow effect on hover */}
            {isHovered && feature && (
              <div className={`
                absolute inset-0 rounded-lg opacity-20 blur-sm
                ${config?.color}
                transition-opacity duration-300
              `} />
            )}
          </div>
        </TooltipTrigger>
        
        <TooltipContent 
          side={placement}
          className="max-w-xs p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg"
          sideOffset={8}
        >
          <div className="space-y-2">
            {/* Header with title and feature badge */}
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {title}
              </h4>
              {feature && (
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-2 py-0.5 ${config?.color}`}
                >
                  {config?.badge}
                </Badge>
              )}
            </div>
            
            {/* Description */}
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {description}
            </p>
            
            {/* Keyboard shortcut */}
            {shortcut && (
              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">Shortcut:</span>
                <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded border">
                  {shortcut}
                </kbd>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Specialized tooltip for AI features
interface AIFeatureTooltipProps {
  children: React.ReactNode;
  title: string;
  description: string;
  modelInfo?: string;
  accuracy?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export function AIFeatureTooltip({ 
  children, 
  title, 
  description, 
  modelInfo = "Claude 4.0 Sonnet",
  accuracy,
  placement = 'top'
}: AIFeatureTooltipProps) {
  return (
    <FeatureTooltip
      title={title}
      description={description}
      feature="ai"
      placement={placement}
      pulse={true}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {children}
          </TooltipTrigger>
          <TooltipContent 
            side={placement}
            className="max-w-sm p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border border-orange-200 dark:border-orange-800 shadow-lg"
            sideOffset={8}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-orange-500" />
                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {title}
                </h4>
                <Badge className="bg-orange-500 text-white text-xs">AI</Badge>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {description}
              </p>
              
              <div className="grid grid-cols-1 gap-2 pt-2 border-t border-orange-200 dark:border-orange-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Model:</span>
                  <span className="text-xs font-mono text-orange-600 dark:text-orange-400">{modelInfo}</span>
                </div>
                {accuracy && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Accuracy:</span>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">{accuracy}</span>
                  </div>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </FeatureTooltip>
  );
}

// Quick tooltip for simple hints
interface QuickTooltipProps {
  children: React.ReactNode;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export function QuickTooltip({ children, content, placement = 'top' }: QuickTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={placement} className="text-xs">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}