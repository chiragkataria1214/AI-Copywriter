import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TOP_PRODUCTS } from '@shared/constants';

// Popular products list is now centralized in `@shared/constants`

interface Product {
  name: string;
  displayName: string;
}

interface ProductSelectionProps {
  selectedProducts: string[];
  setSelectedProducts: (products: string[]) => void;
  products: Product[] | Record<string, Product>;
  title?: string;
  description?: string;
  className?: string;
  showQuickSelect?: boolean;
  showDropdown?: boolean;
  maxHeight?: string;
}

export const ProductSelection: React.FC<ProductSelectionProps> = ({
  selectedProducts,
  setSelectedProducts,
  products,
  title = "Product Context (Multi-Select)",
  description = "Select products to mention in your copy. Multiple products can be selected for comprehensive copy generation.",
  className = "",
  showQuickSelect = true,
  showDropdown = true,
  maxHeight = "max-h-60"
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize products to array format
  const normalizedProducts: Product[] = Array.isArray(products) 
    ? products 
    : Object.entries(products).map(([key, product]) => ({
        name: key,
        displayName: product?.displayName || key
      }));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleProduct = (productName: string) => {
    if (selectedProducts.includes(productName)) {
      setSelectedProducts(selectedProducts.filter(p => p !== productName));
    } else {
      setSelectedProducts([...selectedProducts, productName]);
    }
  };

  const toggleTopProducts = () => {
    const allTopSelected = TOP_PRODUCTS.every(product => selectedProducts.includes(product));
    
    if (allTopSelected) {
      // Deselect all top products
      setSelectedProducts(selectedProducts.filter(p => !TOP_PRODUCTS.includes(p)));
    } else {
      // Select all top products
      const newSelection = [...new Set([...selectedProducts, ...TOP_PRODUCTS])];
      setSelectedProducts(newSelection);
    }
  };

  const toggleAllProducts = () => {
    const allProductNames = normalizedProducts.map(product => product.name);
    if (selectedProducts.length === allProductNames.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(allProductNames);
    }
  };

  const getProductByName = (name: string): Product | undefined => {
    return normalizedProducts.find(p => p.name === name);
  };

  const topProductsInCatalog = TOP_PRODUCTS.filter(productName => 
    normalizedProducts.some(p => p.name === productName)
  );

  const otherProducts = normalizedProducts.filter(product => 
    !TOP_PRODUCTS.includes(product.name)
  );

  const allTopSelected = topProductsInCatalog.every(product => selectedProducts.includes(product));

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">{title}</Label>
        <p className="text-xs text-gray-500 mb-4">{description}</p>

        {showQuickSelect && topProductsInCatalog.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium text-gray-600">Quick Select - Popular Products</Label>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 hover:text-blue-800 h-auto p-1"
                onClick={toggleTopProducts}
              >
                {allTopSelected ? `Deselect Top ${topProductsInCatalog.length}` : `Select Top ${topProductsInCatalog.length}`}
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {topProductsInCatalog.map((productName) => {
                const product = getProductByName(productName);
                if (!product) return null;
                
                const isSelected = selectedProducts.includes(productName);
                return (
                  <button
                    key={productName}
                    onClick={() => toggleProduct(productName)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-blue-500 text-white border-2 border-blue-500 shadow-sm'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full mr-2 flex items-center justify-center ${
                      isSelected ? 'bg-white' : 'bg-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-2 h-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    {product.displayName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showDropdown && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-xs font-medium text-gray-600">All Products</Label>
              <Button
                variant="outline"
                size="sm"
                className="text-xs px-3 py-1 h-auto border-dashed hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                onClick={toggleAllProducts}
              >
                {selectedProducts.length === normalizedProducts.length ? "Deselect All" : "Select All"}
              </Button>
            </div>

            {/* Multi-Select Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="outline"
                className="w-full justify-between text-left font-normal"
                onClick={(e) => {
                  e.preventDefault();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
              >
                <span className="text-sm">
                  {(() => {
                    if (selectedProducts.length === 0) {
                      return "Choose products...";
                    } else if (selectedProducts.length === 1) {
                      const product = getProductByName(selectedProducts[0]);
                      return product?.displayName || selectedProducts[0];
                    } else {
                      return `${selectedProducts.length} products selected`;
                    }
                  })()}
                </span>
                <svg className={`w-4 h-4 opacity-50 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
              
              {isDropdownOpen && (
                <div className={`absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg ${maxHeight} overflow-y-auto`}>
                  {/* Popular Products Section */}
                  {topProductsInCatalog.length > 0 && (
                    <div className="border-b border-gray-100 bg-blue-50 px-3 py-2">
                      <div className="text-xs font-semibold text-blue-800 mb-2">★ Popular Products</div>
                      {topProductsInCatalog.map((productName) => {
                        const product = getProductByName(productName);
                        if (!product) return null;
                        
                        const isSelected = selectedProducts.includes(productName);
                        return (
                          <div
                            key={productName}
                            className="flex items-center px-1 py-1.5 hover:bg-blue-100 cursor-pointer rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProduct(productName);
                            }}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                              isSelected 
                                ? 'bg-blue-500 border-blue-500' 
                                : 'border-blue-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm font-medium text-blue-900">{product.displayName}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* All Other Products */}
                  {otherProducts.length > 0 && (
                    <div className="px-3 py-2">
                      <div className="text-xs font-semibold text-gray-600 mb-2">All Products</div>
                      {otherProducts.map((product) => {
                        const isSelected = selectedProducts.includes(product.name);
                        return (
                          <div
                            key={product.name}
                            className="flex items-center px-1 py-1.5 hover:bg-gray-50 cursor-pointer rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProduct(product.name);
                            }}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                              isSelected 
                                ? 'bg-blue-500 border-blue-500' 
                                : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm">{product.displayName}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected Products Summary */}
        {selectedProducts.length > 0 && (
          <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-blue-900">
                  {selectedProducts.length} Product{selectedProducts.length !== 1 ? 's' : ''} Selected
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100 h-6 px-2"
                onClick={() => setSelectedProducts([])}
              >
                Clear all
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedProducts.map((productName) => {
                const product = getProductByName(productName);
                const productLabel = product?.displayName || productName;
                return (
                  <Badge 
                    key={productName} 
                    variant="secondary" 
                    className="text-xs bg-white text-blue-800 border border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    {productLabel}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {selectedProducts.length === 0 && (
          <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">
                No products selected - AI will generate general copy without specific product focus
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};