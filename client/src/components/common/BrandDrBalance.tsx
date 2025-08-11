import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { BRAND_NAME } from '@shared/constants';

interface BrandDrBalanceProps {
    useBrandGuide: boolean;
    setUseBrandGuide: (value: boolean) => void;
    brandDrBalance: number[];
    setBrandDrBalance: (value: number[]) => void;
}

export const BrandDrBalance = ({
    useBrandGuide,
    setUseBrandGuide,
    brandDrBalance,
    setBrandDrBalance
}: BrandDrBalanceProps) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Label className="text-sm font-medium text-gray-700">Use {BRAND_NAME} Brand Guide</Label>
                    <p className="text-xs text-gray-500">Apply ${BRAND_NAME} brand voice and guidelines</p>
                </div>
                <Switch checked={useBrandGuide} onCheckedChange={setUseBrandGuide} />
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-700">Brand/DR Balance</Label>
                    <span className="text-sm text-gray-500">{`${(brandDrBalance?.[0] ?? 0)}% BR / ${Math.max(0, 100 - (brandDrBalance?.[0] ?? 0))}% DR`}</span>
                </div>
                <Slider
                    value={brandDrBalance}
                    onValueChange={setBrandDrBalance}
                    max={100}
                    step={1}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>All DR</span>
                    <span>Balanced</span>
                    <span>All Brand</span>
                </div>
            </div>
        </div>
    );
};
