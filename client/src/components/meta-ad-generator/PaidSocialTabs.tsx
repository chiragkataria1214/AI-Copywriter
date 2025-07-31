import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Camera } from 'lucide-react';
import { AdCopyTab } from './AdCopyTab';
import { StaticAdTab } from './StaticAdTab';

export const PaidSocialTabs = (props: any) => {
    return (
        <Tabs value={props.paidSocialSubTab} onValueChange={props.setPaidSocialSubTab} className="w-full">
            <div className="flex justify-center mb-6">
                <TabsList className="grid grid-cols-2 w-auto">
                    <TabsTrigger value="ad-copy" className="flex items-center space-x-2">
                        <Sparkles size={16} />
                        <span>Ad Copy</span>
                    </TabsTrigger>
                    <TabsTrigger value="static-ad" className="flex items-center space-x-2">
                        <Camera size={16} />
                        <span>Static Ad</span>
                    </TabsTrigger>
                </TabsList>
            </div>

            {/* Ad Copy Sub-Tab */}
            <TabsContent value="ad-copy">
                <AdCopyTab {...props} />
            </TabsContent>

            {/* Static Ad Sub-Tab */}
            <TabsContent value="static-ad">
                <StaticAdTab {...props} />
            </TabsContent>
        </Tabs>
    );
}; 