import { Pool } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createReviewsTables() {
  try {
    console.log('Creating reviews tables...');
    
    const sql = readFileSync('./create-reviews-table.sql', 'utf8');
    await pool.query(sql);
    
    console.log('Reviews tables created successfully!');
    
    // Test that the table exists
    const result = await pool.query('SELECT COUNT(*) FROM reviews');
    console.log('Reviews table test query successful, count:', result.rows[0].count);
    
  } catch (error) {
    console.error('Error creating reviews tables:', error);
  } finally {
    await pool.end();
  }
}

createReviewsTables();