import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';
import { generateProductSlug, slugToDisplayName } from '@shared/utils';

interface ProductClaimsProps {
  productClaims: any;
  setProductClaims: (claims: any) => void;
  products: any;
  setProducts: (products: any) => void;
  effectiveUser: any;
  handleDeleteProduct: (productKey: string) => void;
  addClaim: (productKey: string, type: 'approved' | 'prohibited') => void;
  removeClaim: (productKey: string, index: number, type: 'approved' | 'prohibited') => void;
  handleClaimChange: (productKey: string, index: number, type: 'approved' | 'prohibited', value: string) => void;
  handleClaimSwitch: (productKey: string, index: number, type: 'approved' | 'prohibited', checked: boolean) => void;
  newProductName: string;
  setNewProductName: (name: string) => void;
}

export const ProductClaims: React.FC<ProductClaimsProps> = ({
  productClaims,
  setProductClaims,
  products,
  setProducts,
  effectiveUser,
  handleDeleteProduct,
  addClaim,
  removeClaim,
  handleClaimChange,
  handleClaimSwitch,
  newProductName,
  setNewProductName,
}) => {
  const isAdmin = effectiveUser?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800 font-medium">Product Claims Management</p>
        <p className="text-sm text-green-700 mt-1">
          Configure approved and prohibited claims for all products. AI uses these to ensure compliant copy generation.
        </p>
      </div>

      {isAdmin && (
        <div className="border border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
          <h4 className="text-sm font-medium text-blue-800 mb-3">Add New Product</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Product name (e.g., 'lip-gloss')"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              className="text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (newProductName.trim()) {
                  // Generate proper slug for the key using utility function
                  const productKey = generateProductSlug(newProductName);
                  setProductClaims({
                    ...productClaims,
                    [productKey]: {
                      approvedClaims: [''],
                      prohibitedClaims: [''],
                      enabledApproved: [true],
                      enabledProhibited: [true]
                    }
                  });
                  setNewProductName('');
                }
              }}
              disabled={!newProductName.trim()}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Add Product
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {Object.keys(productClaims.productClaims).map((productKey) => (
          <div key={productKey} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-semibold text-gray-800 capitalize">{productKey.replace(/-/g, ' ')}</h4>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteProduct(productKey)}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Product
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-green-700 mb-2 block">Approved Claims</Label>
                <div className="space-y-2">
                  {(productClaims.productClaims[productKey].approvedClaims || []).map((claim: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Switch
                        checked={productClaims.productClaims[productKey].enabledApproved[index]}
                        onCheckedChange={(checked) => handleClaimSwitch(productKey, index, 'approved', checked)}
                        disabled={!isAdmin}
                      />
                      <Input
                        value={claim}
                        onChange={(e) => handleClaimChange(productKey, index, 'approved', e.target.value)}
                        className="text-sm"
                        disabled={!isAdmin}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeClaim(productKey, index, 'approved')}
                        disabled={!isAdmin}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addClaim(productKey, 'approved')}
                    disabled={!isAdmin}
                    className="w-full border-dashed"
                  >
                    + Add Approved Claim
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-red-700 mb-2 block">Prohibited Claims</Label>
                <div className="space-y-2">
                  {(productClaims.productClaims[productKey].prohibitedClaims || []).map((claim: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Switch
                        checked={productClaims.productClaims[productKey].enabledProhibited[index]}
                        onCheckedChange={(checked) => handleClaimSwitch(productKey, index, 'prohibited', checked)}
                        disabled={!isAdmin}
                      />
                      <Input
                        value={claim}
                        onChange={(e) => handleClaimChange(productKey, index, 'prohibited', e.target.value)}
                        className="text-sm"
                        disabled={!isAdmin}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeClaim(productKey, index, 'prohibited')}
                        disabled={!isAdmin}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addClaim(productKey, 'prohibited')}
                    disabled={!isAdmin}
                    className="w-full border-dashed"
                  >
                    + Add Prohibited Claim
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
