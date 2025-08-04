import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Target, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const ProductLaunchTabs = (props: any) => {
    return (
        <Tabs value={props.productLaunchSubTab} onValueChange={props.setProductLaunchSubTab} className="w-full">
            <div className="flex justify-center mb-6">
                <TabsList className="grid grid-cols-3 w-auto">
                    <TabsTrigger value="brief-creation" className="flex items-center space-x-2">
                        <FileText size={16} />
                        <span>Brief Creation</span>
                    </TabsTrigger>
                    <TabsTrigger value="integrated-strategy" className="flex items-center space-x-2">
                        <Target size={16} />
                        <span>Integrated Strategy</span>
                    </TabsTrigger>
                    <TabsTrigger value="launch-copy-output" className="flex items-center space-x-2">
                        <Zap size={16} />
                        <span>Launch Copy Output</span>
                    </TabsTrigger>
                </TabsList>
            </div>

            {/* Brief Creation Sub-Tab */}
            <TabsContent value="brief-creation">
                <BriefCreationTab {...props} />
            </TabsContent>

            {/* Integrated Strategy Sub-Tab */}
            <TabsContent value="integrated-strategy">
                <ComingSoonTab 
                    title="Integrated Strategy" 
                    description="Create comprehensive launch strategies across all marketing channels."
                />
            </TabsContent>

            {/* Launch Copy Output Sub-Tab */}
            <TabsContent value="launch-copy-output">
                <ComingSoonTab 
                    title="Launch Copy Output" 
                    description="Generate cohesive copy for all launch touchpoints and campaigns."
                />
            </TabsContent>
        </Tabs>
    );
};

// Brief Creation Tab Component
const BriefCreationTab = (props: any) => {
    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Product Launch Brief</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Create a comprehensive brief for your product launch campaign.
                    </p>
                    <div className="text-center py-8">
                        <p className="text-gray-500">Brief Creation interface coming soon...</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Coming Soon Component
const ComingSoonTab = ({ title, description }: { title: string; description: string }) => {
    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">{title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{description}</p>
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <Zap size={24} className="text-gray-400" />
                        </div>
                        <h4 className="text-xl font-semibold text-gray-600 mb-2">Coming Soon</h4>
                        <p className="text-gray-500">This feature is currently under development.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};