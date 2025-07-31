import { importFromText } from './review-importer';

// Function to extract product name from review content
function extractProductFromContent(content: string): string {
  const text = content.toLowerCase();
  
  // Check for product mentions in various formats
  if (text.includes('mascara') || text.includes('lash')) return 'mascara';
  if (text.includes('foundation') || text.includes('what the foundation')) return 'foundation';
  if (text.includes('sunscreen') || text.includes('spf') || text.includes('everyday sunscreen')) return 'sunscreen';
  if (text.includes('miracle balm') || text.includes('balm')) return 'miracle balm';
  if (text.includes('hero kit') || text.includes('kit')) return 'hero kit';
  if (text.includes('lip stick') || text.includes('lipstick')) return 'lip stick';
  if (text.includes('face pencil') || text.includes('pencil')) return 'face pencil';
  if (text.includes('cleanser')) return 'cleanser';
  if (text.includes('serum')) return 'serum';
  if (text.includes('eye cream')) return 'eye cream';
  if (text.includes('bronzer')) return 'bronzer';
  if (text.includes('blush')) return 'blush';
  if (text.includes('primer')) return 'primer';
  
  return 'general';
}

// Main function to scrape reviews from Junip page
export async function scrapeJunipReviews(): Promise<any[]> {
  try {
    // This would normally fetch from an actual Junip page
    const response = await fetch('https://jonesroadbeauty.com/pages/reviews');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    return parseReviewsFromHTML(html);
  } catch (error) {
    console.error('Error fetching Junip page:', error);
    // Return empty array if scraping fails
    return [];
  }
}

function parseReviewsFromHTML(html: string): any[] {
  const reviews: any[] = [];
  
  try {
    // Simple regex-based parsing instead of cheerio
    const reviewPattern = /<div[^>]*class="[^"]*review[^"]*"[^>]*>(.*?)<\/div>/gis;
    const matches = html.match(reviewPattern) || [];
    
    for (const match of matches) {
      // Extract review content
      const contentMatch = match.match(/<p[^>]*>(.*?)<\/p>/s);
      const content = contentMatch ? contentMatch[1].replace(/<[^>]*>/g, '').trim() : '';
      
      // Extract rating
      const ratingMatch = match.match(/(\d+)\s*(?:star|out of)/i);
      const rating = ratingMatch ? parseInt(ratingMatch[1]) : 5;
      
      // Extract reviewer name
      const nameMatch = match.match(/(?:by|from|reviewer?)[:\s]*([^<,\n]+)/i);
      const reviewer = nameMatch ? nameMatch[1].trim() : 'Anonymous';
      
      if (content && content.length > 10) {
        reviews.push({
          rating,
          content,
          reviewer,
          product: extractProductFromContent(content)
        });
      }
    }
  } catch (error) {
    console.warn('Failed to parse reviews from HTML:', error);
  }
  
  // Return only scraped reviews - no hardcoded fallbacks
  return reviews;
}

// Removed hardcoded fallback reviews - all data should come from database or external APIs