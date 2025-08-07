import { z } from 'zod';

// Junip API Response Schemas
export const JunipReviewSchema = z.object({
  id: z.string(),
  product_id: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  body: z.string(),
  reviewer_name: z.string(),
  reviewer_email: z.string().optional(),
  verified_buyer: z.boolean().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  helpful_count: z.number().optional(),
  published: z.boolean().optional(),
  product_name: z.string().optional(),
  product_sku: z.string().optional(),
});

export const JunipProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string().optional(),
  handle: z.string().optional(),
  average_rating: z.number().optional(),
  review_count: z.number().optional(),
});

export const JunipApiResponseSchema = z.object({
  reviews: z.array(JunipReviewSchema),
  products: z.array(JunipProductSchema).optional(),
  pagination: z.object({
    current_page: z.number(),
    per_page: z.number(),
    total_pages: z.number(),
    total_count: z.number(),
  }).optional(),
});

export type JunipReview = z.infer<typeof JunipReviewSchema>;
export type JunipProduct = z.infer<typeof JunipProductSchema>;
export type JunipApiResponse = z.infer<typeof JunipApiResponseSchema>;

/**
 * Junip API Client for fetching reviews and products
 */
export class JunipApiClient {
  private apiKey: string;
  private baseUrl: string;
  private shopDomain: string;

  constructor(apiKey: string, shopDomain: string) {
    this.apiKey = apiKey;
    this.shopDomain = shopDomain;
    this.baseUrl = 'https://api.juniphq.com/v1';
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add common parameters
    url.searchParams.append('shop_domain', this.shopDomain);
    
    // Add additional parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'JRB-AI-Copywriter/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Junip API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetch all reviews with pagination support
   */
  async fetchAllReviews(options: {
    limit?: number;
    published_only?: boolean;
    product_id?: string;
    since?: string; // ISO date string
  } = {}): Promise<JunipReview[]> {
    const allReviews: JunipReview[] = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const params = {
        page: currentPage,
        per_page: 100, // Max per page
        published: options.published_only ? 'true' : undefined,
        product_id: options.product_id,
        since: options.since,
      };

      try {
        const response = await this.makeRequest('/reviews', params);
        const parsed = JunipApiResponseSchema.parse(response);
        
        allReviews.push(...parsed.reviews);

        // Check if we have more pages
        if (parsed.pagination) {
          hasMorePages = currentPage < parsed.pagination.total_pages;
          currentPage++;
        } else {
          hasMorePages = false;
        }

        // Respect rate limits and user-defined limits
        if (options.limit && allReviews.length >= options.limit) {
          return allReviews.slice(0, options.limit);
        }

        // Add small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error fetching reviews page ${currentPage}:`, error);
        throw error;
      }
    }

    return allReviews;
  }

  /**
   * Fetch products from Junip
   */
  async fetchProducts(): Promise<JunipProduct[]> {
    try {
      const response = await this.makeRequest('/products');
      const parsed = JunipApiResponseSchema.parse(response);
      return parsed.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Fetch reviews for a specific product
   */
  async fetchProductReviews(productId: string, options: {
    published_only?: boolean;
    since?: string;
  } = {}): Promise<JunipReview[]> {
    return this.fetchAllReviews({
      ...options,
      product_id: productId,
    });
  }

  /**
   * Fetch recent reviews since a specific date
   */
  async fetchRecentReviews(sinceDate: Date, options: {
    published_only?: boolean;
    limit?: number;
  } = {}): Promise<JunipReview[]> {
    return this.fetchAllReviews({
      ...options,
      since: sinceDate.toISOString(),
    });
  }

  /**
   * Test API connection and credentials
   */
  async testConnection(): Promise<{ success: boolean; message: string; reviewCount?: number }> {
    try {
      const response = await this.makeRequest('/reviews', { per_page: 1 });
      const parsed = JunipApiResponseSchema.parse(response);
      
      return {
        success: true,
        message: 'Successfully connected to Junip API',
        reviewCount: parsed.pagination?.total_count || parsed.reviews.length,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

/**
 * Create Junip API client from environment variables
 */
export function createJunipClient(): JunipApiClient | null {
  const apiKey = process.env.JUNIP_API_KEY;
  const shopDomain = process.env.JUNIP_SHOP_DOMAIN;

  if (!apiKey || !shopDomain) {
    console.warn('Junip API credentials not found in environment variables');
    return null;
  }

  return new JunipApiClient(apiKey, shopDomain);
}