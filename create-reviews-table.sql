-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name VARCHAR NOT NULL,
  review_text TEXT NOT NULL,
  rating INTEGER NOT NULL,
  reviewer_name VARCHAR,
  reviewer_age VARCHAR,
  skin_type VARCHAR,
  source VARCHAR NOT NULL,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  review_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create review_analysis table
CREATE TABLE IF NOT EXISTS review_analysis (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id VARCHAR REFERENCES reviews(id),
  sentiment VARCHAR,
  key_themes TEXT,
  customer_language TEXT,
  pain_points TEXT,
  benefits TEXT,
  mom_specific BOOLEAN DEFAULT false,
  personas JSONB,
  age_group VARCHAR,
  lifestyle_context JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create training_insights table
CREATE TABLE IF NOT EXISTS training_insights (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR NOT NULL,
  insight TEXT NOT NULL,
  supporting_review_ids JSONB,
  frequency INTEGER DEFAULT 1,
  confidence INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);