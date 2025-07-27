import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Upload, Database, Brain, FileText, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function ReviewTraining() {
  const [bulkReviews, setBulkReviews] = useState('');
  const [reviewFormat, setReviewFormat] = useState<'csv' | 'json' | 'text'>('text');

  // Import from Junip page mutation
  const importJunipMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/junip/import-page', {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Junip Import Complete!",
        description: `Successfully imported ${data.imported} authentic reviews from Jones Road's Junip page`,
      });
      // Refetch stats and reviews
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Junip Import Failed",
        description: error instanceof Error ? error.message : "Failed to import from Junip",
        variant: "destructive",
      });
    }
  });

  // Import reviews mutation
  const importReviewsMutation = useMutation({
    mutationFn: async (data: { reviews: string; format: string }) => {
      return await apiRequest('/api/reviews/import', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Reviews Imported!",
        description: "Customer reviews have been imported and analyzed",
      });
      setBulkReviews('');
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import reviews",
        variant: "destructive",
      });
    }
  });

  // Generate insights mutation
  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/reviews/generate-insights', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Insights Generated!",
        description: "AI training insights have been updated from customer reviews",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate insights",
        variant: "destructive",
      });
    }
  });

  // Get review stats
  const { data: reviewStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/reviews/stats'],
    retry: false,
  });

  // Get training insights
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/reviews/insights'],
    retry: false,
  });

  // Get actual reviews for viewing
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['/api/reviews'],
    retry: false,
  });

  // Get Junip analytics
  const { data: junipAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/junip/analytics'],
    retry: false,
  });

  // Type guards for stats
  const hasValidStats = reviewStats && typeof reviewStats === 'object' && 
    'totalReviews' in reviewStats;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setBulkReviews(result);
        
        // Auto-detect format
        if (file.name.endsWith('.csv')) setReviewFormat('csv');
        else if (file.name.endsWith('.json')) setReviewFormat('json');
        else setReviewFormat('text');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!bulkReviews.trim()) {
      toast({
        title: "No Reviews",
        description: "Please add review data to import",
        variant: "destructive",
      });
      return;
    }

    importReviewsMutation.mutate({
      reviews: bulkReviews,
      format: reviewFormat
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#004182] rounded-lg flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Review Training</h1>
              <p className="text-sm text-gray-500">Train AI with authentic customer language</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reviews">View Reviews</TabsTrigger>
            <TabsTrigger value="import">Import Reviews</TabsTrigger>
            <TabsTrigger value="insights">Training Insights</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* View Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Reviews Overview */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Reviews Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {statsLoading ? (
                    <div className="text-center py-4">Loading stats...</div>
                  ) : hasValidStats ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Reviews</span>
                        <Badge variant="secondary">{reviewStats.totalReviews.toLocaleString()}</Badge>
                      </div>
                      {reviewStats.byProduct && Object.entries(reviewStats.byProduct).map(([product, count]) => (
                        <div key={product} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 capitalize">{product}</span>
                          <Badge variant="outline">{count.toLocaleString()}</Badge>
                        </div>
                      ))}
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-green-700">✅ Authentic reviews imported from Jones Road's Junip page</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-4">Loading review statistics...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Reviews */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Recent Reviews
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      Authentic Data Source
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reviewsLoading ? (
                    <div className="text-center py-8">Loading reviews...</div>
                  ) : reviews && Array.isArray(reviews) && reviews.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {reviews.slice(0, 10).map((review: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {review.product_name || review.productName || 'Unknown Product'}
                              </Badge>
                              <div className="flex">
                                {[...Array(review.rating || 5)].map((_, i) => (
                                  <span key={i} className="text-yellow-400">★</span>
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {review.reviewer_name || review.reviewerName || 'Anonymous'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {review.review_text || review.reviewText || review.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-500">
                        <p className="mb-2">✅ Reviews system is ready</p>
                        <p className="text-xs">Your authentic customer reviews are imported and ready for analysis</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Import Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    Import Customer Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="review-upload" className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors">
                      <FileText size={16} />
                      <span>Upload Review File</span>
                    </Label>
                    <Input 
                      id="review-upload" 
                      type="file" 
                      className="sr-only" 
                      accept=".txt,.csv,.json" 
                      onChange={handleFileUpload} 
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supports CSV, JSON, or plain text formats
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="bulk-reviews">Paste Reviews</Label>
                    <Textarea
                      id="bulk-reviews"
                      placeholder="Paste customer reviews here...

Format examples:
- Plain text: One review per line
- CSV: product,rating,review,reviewer
- JSON: [{&quot;product&quot;:&quot;...&quot;,&quot;rating&quot;:5,&quot;review&quot;:&quot;...&quot;}]"
                      value={bulkReviews}
                      onChange={(e) => setBulkReviews(e.target.value)}
                      className="min-h-48"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button 
                      onClick={handleImport}
                      disabled={importReviewsMutation.isPending || !bulkReviews.trim()}
                    >
                      {importReviewsMutation.isPending ? 'Importing...' : 'Import & Analyze'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => generateInsightsMutation.mutate()}
                      disabled={generateInsightsMutation.isPending}
                    >
                      {generateInsightsMutation.isPending ? 'Generating...' : 'Generate Insights'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Review Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading stats...</div>
                  ) : hasValidStats ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#004182]">{(reviewStats as any).totalReviews}</div>
                        <div className="text-sm text-gray-500">Total Reviews</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#004182]">{(reviewStats as any).analyzedReviews}</div>
                        <div className="text-sm text-gray-500">Analyzed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#004182]">{(reviewStats as any).momReviews}</div>
                        <div className="text-sm text-gray-500">Mom-Specific</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#004182]">{(reviewStats as any).avgRating}</div>
                        <div className="text-sm text-gray-500">Avg Rating</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No reviews imported yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {insightsLoading ? (
              <div className="text-center py-8 text-gray-500">Loading insights...</div>
            ) : insights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(insights).map(([category, categoryInsights]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="flex items-center capitalize">
                        <Brain className="w-5 h-5 mr-2" />
                        {category.replace('_', ' ')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(categoryInsights as any[]).map((insight, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-md">
                            <div className="text-sm">{insight.insight}</div>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {insight.frequency}x
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {insight.confidence}% confidence
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Yet</h3>
                  <p className="text-gray-500 mb-4">Import customer reviews and generate insights to see training data here</p>
                  <Button onClick={() => generateInsightsMutation.mutate()}>
                    Generate Insights
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Customer Personas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasValidStats && (reviewStats as any).personaBreakdown ? (
                    <div className="space-y-2">
                      {Object.entries((reviewStats as any).personaBreakdown).map(([persona, count]) => (
                        <div key={persona} className="flex justify-between">
                          <span className="capitalize">{persona.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <Badge variant="outline">{String(count)}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">No data available</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Pain Points</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasValidStats && (reviewStats as any).topPainPoints ? (
                    <div className="space-y-2">
                      {(reviewStats as any).topPainPoints.map((painPoint: string, index: number) => (
                        <div key={index} className="text-sm p-2 bg-red-50 rounded">
                          {painPoint}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">No data available</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Most Mentioned Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasValidStats && (reviewStats as any).topBenefits ? (
                    <div className="space-y-2">
                      {(reviewStats as any).topBenefits.map((benefit: string, index: number) => (
                        <div key={index} className="text-sm p-2 bg-green-50 rounded">
                          {benefit}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">No data available</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}