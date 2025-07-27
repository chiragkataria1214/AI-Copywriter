import { importFromText } from './review-importer';

// Extract reviews from the fetched Junip page content
export async function importJunipReviewsFromPage() {
  // Sample of real reviews from your Junip page
  const reviews = [
    {
      rating: 5,
      content: "Absolutely, hands-down, the best mascara! After buying this mascara a few times (and loving it each time), I went back to another brand that I used to use all the time, thinking I was just imagining how good the Jones Road mascara was but nope! I had to come back and get it again. It really gives me the long, pretty lash look that I absolutely love! Truly the best mascara!",
      reviewer: "Elizabeth U",
      product: "mascara"
    },
    {
      rating: 5,
      content: "Love the lightweight of the foundation. It goes on easy and last for a long time, even in the melting heat of a St Louis summer.",
      reviewer: "Cheri H",
      product: "foundation"
    },
    {
      rating: 5,
      content: "Doesn't leave a white cast! Instead leaves a nice glow. I hope JR continues with providing SPF options that are broad spectrum.",
      reviewer: "Heather K",
      product: "sunscreen"
    },
    {
      rating: 5,
      content: "The miracle balm feels a little greasy on my skin. I am trying to use it sparingly to solve this problem. Color is spot on",
      reviewer: "Cindi W",
      product: "miracle balm"
    },
    {
      rating: 5,
      content: "Beautiful color, great texture",
      reviewer: "madeleine s",
      product: "lip stick"
    },
    {
      rating: 5,
      content: "The packaging is clever, the smaller contents were perfect for travel and the options for color fit my needs beautifully.",
      reviewer: "Loucy D",
      product: "hero kit"
    },
    {
      rating: 5,
      content: "The application is easy & smooth, the color blends well with my skin tone and does not look like my foundation is heavy or thick.",
      reviewer: "Loucy D",
      product: "foundation"
    },
    {
      rating: 5,
      content: "The color appeared to be a very good blend with my skin, it goes on smoothly and dries within looking dry or flakey.",
      reviewer: "Loucy D",
      product: "tinted moisturizer"
    }
  ];

  // Convert to proper format for import
  const reviewText = reviews.map(review => 
    `${review.content}

Product: ${review.product}
Rating: ${review.rating}/5
Reviewer: ${review.reviewer}`
  ).join('\n\n---\n\n');

  console.log('Importing Jones Road reviews from Junip page...');
  const result = await importFromText(reviewText, 'junip-page');
  
  return result;
}