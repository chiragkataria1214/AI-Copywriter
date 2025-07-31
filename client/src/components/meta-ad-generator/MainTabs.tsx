import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Users, FileText, Brain, Mail, Settings, Lock } from 'lucide-react';

interface MainTabsProps {
    activeTab: string;
    handleAISettingsClick: () => void;
    hasAdminAccess: boolean;
}

export const MainTabs = ({ activeTab, handleAISettingsClick, hasAdminAccess }: MainTabsProps) => {
    return (
        <div className="flex w-full mb-6 sm:mb-8">
            <TabsList className="grid grid-cols-6 flex-1">
                <TabsTrigger value="paid-social" className="tabs-trigger-fix flex-col sm:flex-row space-y-0 sm:space-y-0 sm:space-x-2">
                    <Sparkles size={16} />
                    <span className="text-xs sm:text-sm">Paid Social</span>
                </TabsTrigger>
                <TabsTrigger value="organic-social" className="tabs-trigger-fix flex-col sm:flex-row space-y-0 sm:space-y-0 sm:space-x-2">
                    <Users size={16} />
                    <span className="text-xs sm:text-sm">Organic Social</span>
                </TabsTrigger>
                <TabsTrigger value="landing" className="tabs-trigger-fix flex-col sm:flex-row space-y-0 sm:space-y-0 sm:space-x-2">
                    <FileText size={16} />
                    <span className="text-xs sm:text-sm">Landing Page</span>
                </TabsTrigger>
                <TabsTrigger value="custom" className="tabs-trigger-fix flex-col sm:flex-row space-y-0 sm:space-y-0 sm:space-x-2">
                    <Brain size={16} />
                    <span className="text-xs sm:text-sm">Custom Request</span>
                </TabsTrigger>
                <TabsTrigger value="retention" className="tabs-trigger-fix flex-col sm:flex-row space-y-0 sm:space-y-0 sm:space-x-2">
                    <Mail size={16} />
                    <span className="text-xs sm:text-sm">Retention</span>
                </TabsTrigger>
                <TabsTrigger
                    value="settings"
                    className="tabs-trigger-fix flex-col sm:flex-row space-y-0 sm:space-y-0 sm:space-x-2 h-auto py-2 px-3"
                    onClick={handleAISettingsClick}
                    style={activeTab === 'settings' ? { backgroundColor: '#004182', color: 'white' } : {}}
                >
                    {hasAdminAccess ? <Settings size={16} /> : <Lock size={16} />}
                    <span className="text-xs sm:text-sm">AI Settings</span>
                </TabsTrigger>
            </TabsList>
        </div>
    );
}; 