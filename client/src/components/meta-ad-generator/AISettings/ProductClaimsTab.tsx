import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronRight, Plus, Package, Trash2 } from 'lucide-react';
import { TrainingConfig } from '@shared/training-config';
import { generateProductSlug, slugToDisplayName } from '@shared/utils';

interface ProductClaimsTabProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  newProductName: string;
  setNewProductName: (name: string) => void;
  expandedProducts: Set<string>;
  setExpandedProducts: (products: Set<string>) => void;
  products: Record<string, any>;
  productClaims: Record<string, any>;
  setProductClaims: (claims: Record<string, any>) => void;
  deleteProductMutation: any;
}

export const ProductClaimsTab: React.FC<ProductClaimsTabProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  newProductName,
  setNewProductName,
  expandedProducts,
  setExpandedProducts,
  products,
  productClaims,
  setProductClaims,
  deleteProductMutation
}) => {
  return (
    <div className="space-y-6">
      {/* Add New Product Section */}
      {effectiveUser?.role === 'admin' && (
        <div className="relative overflow-hidden border-2 border-dashed border-blue-300 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200">
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16">
            <div className="w-full h-full bg-blue-200 rounded-full opacity-20"></div>
          </div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-900">Add New Product</h4>
                <p className="text-sm text-blue-700">Create product-specific claim guidelines</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Enter product name (e.g., 'Lip Gloss', 'Foundation')"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="text-sm bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400 placeholder:text-blue-400"
                />
              </div>
              <Button
                size="sm"
                onClick={() => {
                  if (newProductName.trim()) {
                    // Generate proper slug for the key using utility function
                    const productKey = generateProductSlug(newProductName);
                    
                    setEditingConfig({
                      ...editingConfig,
                      productClaims: {
                        ...editingConfig.productClaims,
                        [productKey]: {
                          approvedClaims: [''],
                          prohibitedClaims: [''],
                          enabledApproved: [true],
                          enabledProhibited: [true]
                        }
                      }
                    });
                    setNewProductName('');
                  }
                }}
                disabled={!newProductName.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
            
            {newProductName.trim() && (
              <div className="mt-3 p-3 bg-white/60 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">
                  <span className="font-medium">Preview:</span> This will create a new product called "{newProductName}" 
                  with empty approved and prohibited claims lists that you can customize.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Products List */}
      <div className="space-y-6">
        {/* Show all products from catalog plus existing claims */}
        {(() => {
          const allProductKeys = new Set([
            ...Object.keys(products),
            ...Object.keys(editingConfig?.productClaims || {})
          ]);

          return Array.from(allProductKeys).map((productKey: string) => {
            const claimsData = editingConfig?.productClaims?.[productKey] || {
              approvedClaims: [],
              prohibitedClaims: [],
              enabledApproved: [],
              enabledProhibited: []
            };

            const displayName = products[productKey]?.displayName || slugToDisplayName(productKey);

            const isExpanded = expandedProducts.has(productKey);
            
            const toggleExpanded = () => {
              const newExpanded = new Set(expandedProducts);
              if (isExpanded) {
                newExpanded.delete(productKey);
              } else {
                newExpanded.add(productKey);
              }
              setExpandedProducts(newExpanded);
            };

            return (
              <div key={productKey} className="border border-gray-200 rounded-lg">
                <div 
                  className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={toggleExpanded}
                >
                  <div className="flex items-center space-x-3">
                    {isExpanded ? (
                      <ChevronDown size={20} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-500" />
                    )}
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      {displayName}
                      {effectiveUser?.role === 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-3 text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent toggle when clicking delete
                            if (window.confirm(`Are you sure you want to delete the product '${displayName}'? This action cannot be undone.`)) {
                              const productId = products[productKey]?.id;
                              if (productId) {
                                deleteProductMutation.mutate(productId);
                              } else {
                                const updatedClaims = { ...productClaims };
                                delete updatedClaims[productKey];
                                setProductClaims(updatedClaims);
                              }
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {claimsData.approvedClaims?.length || 0} Approved
                    </Badge>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      {claimsData.prohibitedClaims?.length || 0} Prohibited
                    </Badge>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Approved Claims */}
                      <div>
                        <Label className="text-sm font-medium text-green-800 mb-3 block">✓ Approved Claims</Label>
                        <div className="space-y-3">
                          {(claimsData.approvedClaims || ['']).map((claim: string, index: number) => (
                            <div key={`approved-${index}`} className="space-y-2">
                              <div className="flex items-center space-x-3">
                                <Switch
                                  checked={claimsData.enabledApproved?.[index] !== false}
                                  onCheckedChange={(checked) => {
                                    const enabled = [...(claimsData.enabledApproved || [])];
                                    enabled[index] = checked;
                                    setEditingConfig({
                                      ...editingConfig,
                                      productClaims: {
                                        ...editingConfig.productClaims,
                                        [productKey]: {
                                          ...claimsData,
                                          enabledApproved: enabled
                                        }
                                      }
                                    });
                                  }}
                                  className="flex-shrink-0"
                                />
                                <span className="text-green-500 text-sm font-bold flex-shrink-0">✓</span>
                                {effectiveUser?.role === 'admin' && claimsData.approvedClaims?.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 flex-shrink-0 ml-auto"
                                    onClick={() => {
                                      const claims = [...(claimsData.approvedClaims || [])];
                                      const enabled = [...(claimsData.enabledApproved || [])];
                                      claims.splice(index, 1);
                                      enabled.splice(index, 1);
                                      setEditingConfig({
                                        ...editingConfig,
                                        productClaims: {
                                          ...editingConfig.productClaims,
                                          [productKey]: {
                                            ...claimsData,
                                            approvedClaims: claims,
                                            enabledApproved: enabled
                                          }
                                        }
                                      });
                                    }}
                                  >
                                    ×
                                  </Button>
                                )}
                              </div>
                              <Textarea
                                value={claim}
                                onChange={(e) => {
                                  if (effectiveUser?.role === 'admin') {
                                    const claims = [...(claimsData.approvedClaims || [])];
                                    claims[index] = e.target.value;
                                    setEditingConfig({
                                      ...editingConfig,
                                      productClaims: {
                                        ...editingConfig.productClaims,
                                        [productKey]: {
                                          ...claimsData,
                                          approvedClaims: claims
                                        }
                                      }
                                    });
                                  }
                                }}
                                className="text-sm resize-none min-h-[60px] border-green-200 focus:border-green-400"
                                placeholder="Enter approved product claim..."
                                disabled={effectiveUser?.role !== 'admin'}
                              />
                            </div>
                          ))}
                          {effectiveUser?.role === 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const claims = [...(claimsData.approvedClaims || [])];
                                const enabled = [...(claimsData.enabledApproved || [])];
                                claims.push('');
                                enabled.push(true);
                                setEditingConfig({
                                  ...editingConfig,
                                  productClaims: {
                                    ...editingConfig.productClaims,
                                    [productKey]: {
                                      ...claimsData,
                                      approvedClaims: claims,
                                      enabledApproved: enabled
                                    }
                                  }
                                });
                              }}
                              className="w-full border-dashed border-green-300 text-green-600 hover:bg-green-50"
                            >
                              + Add approved claim
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Prohibited Claims */}
                      <div>
                        <Label className="text-sm font-medium text-red-800 mb-3 block">✗ Prohibited Claims</Label>
                        <div className="space-y-3">
                          {(claimsData.prohibitedClaims || ['']).map((claim: string, index: number) => (
                            <div key={`prohibited-${index}`} className="space-y-2">
                              <div className="flex items-center space-x-3">
                                <Switch
                                  checked={claimsData.enabledProhibited?.[index] !== false}
                                  onCheckedChange={(checked) => {
                                    const enabled = [...(claimsData.enabledProhibited || [])];
                                    enabled[index] = checked;
                                    setEditingConfig({
                                      ...editingConfig,
                                      productClaims: {
                                        ...editingConfig.productClaims,
                                        [productKey]: {
                                          ...claimsData,
                                          enabledProhibited: enabled
                                        }
                                      }
                                    });
                                  }}
                                  className="flex-shrink-0"
                                />
                                <span className="text-red-500 text-sm font-bold flex-shrink-0">✗</span>
                                {effectiveUser?.role === 'admin' && claimsData.prohibitedClaims?.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 flex-shrink-0 ml-auto"
                                    onClick={() => {
                                      const claims = [...(claimsData.prohibitedClaims || [])];
                                      const enabled = [...(claimsData.enabledProhibited || [])];
                                      claims.splice(index, 1);
                                      enabled.splice(index, 1);
                                      setEditingConfig({
                                        ...editingConfig,
                                        productClaims: {
                                          ...editingConfig.productClaims,
                                          [productKey]: {
                                            ...claimsData,
                                            prohibitedClaims: claims,
                                            enabledProhibited: enabled
                                          }
                                        }
                                      });
                                    }}
                                  >
                                    ×
                                  </Button>
                                )}
                              </div>
                              <Textarea
                                value={claim}
                                onChange={(e) => {
                                  if (effectiveUser?.role === 'admin') {
                                    const claims = [...(claimsData.prohibitedClaims || [])];
                                    claims[index] = e.target.value;
                                    setEditingConfig({
                                      ...editingConfig,
                                      productClaims: {
                                        ...editingConfig.productClaims,
                                        [productKey]: {
                                          ...claimsData,
                                          prohibitedClaims: claims
                                        }
                                      }
                                    });
                                  }
                                }}
                                className="text-sm resize-none min-h-[60px] border-red-200 focus:border-red-400"
                                placeholder="Enter prohibited product claim..."
                                disabled={effectiveUser?.role !== 'admin'}
                              />
                            </div>
                          ))}
                          {effectiveUser?.role === 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const claims = [...(claimsData.prohibitedClaims || [])];
                                const enabled = [...(claimsData.enabledProhibited || [])];
                                claims.push('');
                                enabled.push(true);
                                setEditingConfig({
                                  ...editingConfig,
                                  productClaims: {
                                    ...editingConfig.productClaims,
                                    [productKey]: {
                                      ...claimsData,
                                      prohibitedClaims: claims,
                                      enabledProhibited: enabled
                                    }
                                  }
                                });
                              }}
                              className="w-full border-dashed border-red-300 text-red-600 hover:bg-red-50"
                            >
                              + Add prohibited claim
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}; 