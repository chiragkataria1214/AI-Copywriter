import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductSelectionProps {
  landingPageType: string;
  selectedProduct: string;
  setSelectedProduct: (product: string) => void;
  selectedProducts: string[];
  setSelectedProducts: (products: string[]) => void;
  products?: Record<string, any>;
}

export function ProductSelection({ 
  landingPageType,
  selectedProduct,
  setSelectedProduct,
  selectedProducts,
  setSelectedProducts,
  products: dynamicProducts
}: ProductSelectionProps) {
  // Fallback to authentic Jones Road Beauty products if dynamic data is not available
  const fallbackProducts = [
    { value: 'The Best Mascara', label: 'The Best Mascara' },
    { value: 'Everyday Sunscreen', label: 'Everyday Sunscreen' },
    { value: 'Miracle Balm', label: 'Miracle Balm' },
    { value: 'Miracle Balm Palette', label: 'Miracle Balm Palette' },
    { value: 'Just Enough Tinted Moisturizer', label: 'Just Enough Tinted Moisturizer' },
    { value: 'Like a Mother Mascara', label: 'Like a Mother Mascara' },
    { value: 'The Makeup Travel Kit 2.0', label: 'The Makeup Travel Kit 2.0' },
    { value: 'Lip and Cheek Stick', label: 'Lip and Cheek Stick' },
    { value: 'Under Eye Rescue SPF 30', label: 'Under Eye Rescue SPF 30' },
    { value: 'What the Foundation', label: 'What the Foundation' },
    { value: 'Cool Gloss', label: 'Cool Gloss' },
    { value: 'Just a Sec', label: 'Just a Sec' },
    { value: 'Gel Liner', label: 'Gel Liner' },
    { value: 'The Foundation Brush', label: 'The Foundation Brush' },
    { value: 'The Lip Liner', label: 'The Lip Liner' },
    { value: 'Holiday Kit', label: 'Holiday Kit' }
  ];

  // Convert dynamic products to the expected format or use fallback
  const products = dynamicProducts 
    ? Object.entries(dynamicProducts).map(([key, product]: [string, any]) => ({
        value: key, // Use the key from the API response, which matches the backend product claims keys
        label: product.displayName || product.name || product.label || key
      }))
    : fallbackProducts;

  const getProductDisplayName = (value: string) => {
    const product = products.find(p => p.value === value);
    return product?.label || value;
  };

  if (landingPageType === 'multiProduct') {
    return (
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          Select Products to Feature (Multi-Select)
        </Label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {products.map((product) => (
            <Button
              key={product.value}
              variant={selectedProducts.includes(product.value) ? "default" : "outline"}
              size="sm"
              className={`text-xs px-2 py-2 h-auto ${
                selectedProducts.includes(product.value)
                  ? 'bg-[#004182] text-white border-[#004182]' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                if (selectedProducts.includes(product.value)) {
                  setSelectedProducts(selectedProducts.filter(p => p !== product.value));
                } else {
                  setSelectedProducts([...selectedProducts, product.value]);
                }
              }}
            >
              {product.label}
            </Button>
          ))}
        </div>
        
        {selectedProducts.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Selected: {selectedProducts.map(getProductDisplayName).join(', ')}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <Label className="text-sm font-medium text-gray-700 mb-3 block">
        Quick Select - Top Products
      </Label>
      <div className="flex flex-wrap gap-2 mb-4">
        {products.slice(0, 4).map((product) => (
          <Button
            key={product.value}
            variant={selectedProduct === product.value ? "default" : "outline"}
            size="sm"
            className={`text-xs px-3 py-1 h-8 ${
              selectedProduct === product.value 
                ? 'bg-[#004182] text-white border-[#004182]' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedProduct(product.value)}
          >
            {product.label}
          </Button>
        ))}
      </div>
      
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Or choose from all products
        </Label>
        <Select value={selectedProduct || "all"} onValueChange={(value) => setSelectedProduct(value === "all" ? "" : value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All products (no filtering)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All products</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.value} value={product.value}>
                {product.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedProduct && (
        <p className="text-xs text-gray-500 mt-2">
          AI will use customer reviews specific to {getProductDisplayName(selectedProduct)} for authentic language patterns
        </p>
      )}
    </div>
  );
}