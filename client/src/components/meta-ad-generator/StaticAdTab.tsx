import {
    Card,
    CardContent
} from '@/components/ui/card';
import {
    Button
} from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Label
} from '@/components/ui/label';
import {
    Camera,
    Upload,
    Target,
    Check
} from 'lucide-react';

interface StaticAdTabProps {
    personas: any;
    concept: string;
    setConcept: (value: string) => void;
}

export const StaticAdTab = ({
    personas,
    concept,
    setConcept
}: StaticAdTabProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Input Section */}
            <div className="space-y-4 sm:space-y-6">
                {/* Upload Section */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Camera className="text-jones-primary mr-2 sm:mr-3" size={18} />
                            Upload Ad Creative
                        </h3>

                        <div className="space-y-4 sm:space-y-6">
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Static Ad Image
                                </Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-sm text-gray-600">
                                        Click to upload an ad image (JPG, PNG)
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Max file size: 10MB
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Analysis Options */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Target className="text-jones-primary mr-2 sm:mr-3" size={18} />
                            Analysis Settings
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Target Persona</Label>
                                <Select value={concept} onValueChange={setConcept}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select persona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(personas).map(([key, persona]) => (
                                            <SelectItem key={key} value={key}>{(persona as any).label || key}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700">Analysis Focus</Label>
                                <select className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                                    <option>Visual Design Analysis</option>
                                    <option>Copy Effectiveness</option>
                                    <option>Jones Road Adaptation</option>
                                    <option>Comprehensive Review</option>
                                </select>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700">Output Format</Label>
                                <select className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                                    <option>Analysis + Variations</option>
                                    <option>Analysis Only</option>
                                    <option>Variations Only</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Button className="w-full flex items-center justify-center space-x-2" disabled>
                    <Camera size={16} />
                    <span>Analyze Ad & Generate Variations (Coming Soon)</span>
                </Button>
            </div>

            {/* Preview Section */}
            <div className="space-y-4 sm:space-y-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center py-16">
                            <Camera size={64} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Static Ad Analysis</h3>
                            <p className="text-gray-500">
                                Upload any static ad to get detailed analysis and Jones Road Beauty variations
                            </p>
                            <div className="mt-6 text-left space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Check size={16} className="mr-2 text-green-500" />
                                    Visual design breakdown
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Check size={16} className="mr-2 text-green-500" />
                                    Copy effectiveness scoring
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Check size={16} className="mr-2 text-green-500" />
                                    Jones Road brand adaptations
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Check size={16} className="mr-2 text-green-500" />
                                    Competitive positioning insights
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}; 