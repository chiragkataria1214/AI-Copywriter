import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, BarChart3, FileText, Upload, Brain } from 'lucide-react';
import { BRAND_NAME } from '@shared/constants';

interface CustomerReviewsTabProps {
  effectiveUser: any;
  reviewStats: any;
  products: Record<string, any>;
}

export const CustomerReviewsTab: React.FC<CustomerReviewsTabProps> = ({
  effectiveUser,
  reviewStats,
  products
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800 font-medium">Customer Review Analytics & Training</p>
        <p className="mt-2 text-sm text-gray-500">
          Comprehensive analytics dashboard for your {reviewStats?.totalReviews?.toLocaleString() || '0'}+ authentic customer reviews from {BRAND_NAME}'s Junip platform.
        </p>
      </div>

      {/* Sub-tabs for comprehensive analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reviews">Review Browser</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {reviewStats === undefined ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-[#004182]">{reviewStats?.totalReviews?.toLocaleString() || '0'}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Reviews</div>
                  <div className="text-xs text-green-600 mt-2 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    Live Data
                  </div>
                </div>

                <div className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-600">{reviewStats?.avgRating || '0'}★</div>
                  <div className="text-sm text-gray-600 mt-1">Average Rating</div>
                  <div className="text-xs text-gray-500 mt-2">Perfect satisfaction</div>
                </div>

                <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-600">{reviewStats?.positivePercentage || '0'}%</div>
                  <div className="text-sm text-gray-600 mt-1">Positive Sentiment</div>
                  <div className="text-xs text-gray-500 mt-2">Outstanding satisfaction</div>
                </div>

                <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-orange-600">{Object.keys(reviewStats?.byProduct || {}).length}</div>
                  <div className="text-sm text-gray-600 mt-1">Top Products</div>
                  <div className="text-xs text-gray-500 mt-2">With review data</div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-green-800">Authentic Data Source Verified</h3>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>
                          Reviews imported from {BRAND_NAME}'s official Junip customer review platform
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {reviewStats?.totalReviews?.toLocaleString() || '0'} Reviews Active
                  </Badge>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Product Review Distribution
            </h3>
            <p className="text-sm text-blue-600">Visual breakdown of your authentic customer reviews by product</p>
          </div>

          {reviewStats === undefined ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(products).slice(0, 4).map(([key, product], index) => {
                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-green-500'];
                const count = reviewStats?.byProduct?.[key] || 0;
                const color = colors[index % colors.length];
                return { product: (product as any).displayName, count, color, key };
              }).map(({ product, count, color, key }) => {
                const percentage = (reviewStats?.totalReviews || 0) > 0 ? Math.round((count / (reviewStats?.totalReviews || 1)) * 100) : 0;
                return (
                  <div key={product} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${color}`}></div>
                        <span className="text-sm font-medium">{product}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {count.toLocaleString()} reviews ({percentage}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Review Browser Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-medium text-purple-800 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Browse Customer Reviews
            </h3>
            <p className="text-sm text-purple-600">Search and filter through your authentic customer feedback</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="review-search">Search Reviews</Label>
              <Input
                id="review-search"
                placeholder="Search review content, customer names, or keywords..."
                className="mt-1"
              />
            </div>
            <div className="w-48">
              <Label htmlFor="product-filter">Filter by Product</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {Object.entries(products).map(([key, product]) => (
                    <SelectItem key={key} value={key}>
                      {(product as any).displayName} ({reviewStats?.byProduct?.[key] || 0} reviews)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-yellow-50 text-center">
            <Database className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
            <p className="text-yellow-700 font-medium">Live Review Data Connected</p>
            <p className="text-sm text-yellow-600 mt-1">
              Your {reviewStats?.totalReviews?.toLocaleString() || 'review'} reviews are active and ready for AI training
            </p>
          </div>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-medium text-orange-800 flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Import Customer Reviews
            </h3>
            <p className="text-sm text-orange-600">Add more reviews from any platform to enhance AI training</p>
          </div>

          <div className="space-y-4">
            {effectiveUser?.role !== 'admin' && (
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/junip/import-page', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' }
                    });

                    const result = await response.json();
                    if (result.success) {
                      alert(`Success! Imported ${result.imported} real customer reviews from your Junip page and analyzed them for AI training!`);
                    } else {
                      alert('Import failed: ' + result.message);
                    }
                  } catch (error) {
                    alert('Import error: ' + (error as Error).message);
                  }
                }}
              >
                Import Reviews from Junip Page
              </Button>
            )}

            <div>
              <Label className="text-sm font-medium">Manual Review Import</Label>
              <Textarea
                placeholder="Paste customer reviews here..."
                className="mt-2"
                rows={4}
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>

            {effectiveUser?.role !== 'admin' && (
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  try {
                    const reviewText = (document.querySelector('textarea[placeholder*="reviews"]') as HTMLTextAreaElement)?.value;
                    if (!reviewText?.trim()) {
                      alert('Please paste some reviews in the text area above first');
                      return;
                    }

                    const response = await fetch('/api/reviews/import-text', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        content: reviewText,
                        source: 'junip-manual'
                      })
                    });

                    const result = await response.json();
                    if (result.success) {
                      alert(`Successfully imported ${result.imported} reviews and analyzed them for AI training!`);
                    } else {
                      alert('Import failed: ' + result.message);
                    }
                  } catch (error) {
                    alert('Import error: ' + (error as Error).message);
                  }
                }}
              >
                Import from Text Above
              </Button>
            )}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h3 className="font-medium text-indigo-800 flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              AI Training Insights
            </h3>
            <p className="text-sm text-indigo-600">Generate insights from customer reviews to train AI on authentic language patterns</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <h4 className="font-medium text-green-800">Customer Language</h4>
              <p className="text-sm text-green-600 mt-1">Authentic phrases like "hands-down the best mascara"</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <h4 className="font-medium text-blue-800">Pain Points</h4>
              <p className="text-sm text-blue-600 mt-1">Common customer challenges addressed</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <h4 className="font-medium text-purple-800">Benefits</h4>
              <p className="text-sm text-purple-600 mt-1">Most mentioned product benefits</p>
            </div>
          </div>

          {effectiveUser?.role !== 'admin' && (
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                try {
                  const response = await fetch('/api/reviews/generate-insights', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  });

                  const result = await response.json();
                  if (result.success) {
                    alert('Training insights generated successfully! The AI now has updated customer language patterns.');
                  } else {
                    alert('Failed to generate insights: ' + result.message);
                  }
                } catch (error) {
                  alert('Error: ' + (error as Error).message);
                }
              }}
            >
              Generate Training Insights
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}; 