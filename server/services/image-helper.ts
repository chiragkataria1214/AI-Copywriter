import {
    DEFAULT_IMAGE_MEDIA_TYPE,
    IMAGE_MAX_DIMENSION,
    IMAGE_MAX_SIZE_BYTES,
  } from '@shared/constants';
import sharp from 'sharp';

// Helper functions for image processing
export function detectImageType(base64String: string): string {
    // If it's already a data URL, extract the type
    if (base64String.startsWith('data:image/')) {
      if (base64String.startsWith('data:image/png')) return 'image/png';
      if (base64String.startsWith('data:image/jpeg') || base64String.startsWith('data:image/jpg')) return 'image/jpeg';
      if (base64String.startsWith('data:image/gif')) return 'image/gif';
      if (base64String.startsWith('data:image/webp')) return 'image/webp';
    }
    
    // For raw base64, try to detect from magic bytes
    const bytes = base64String.substring(0, 20);
    
    // PNG signature: iVBORw0KGgo
    if (bytes.startsWith('iVBORw0KGgo')) return 'image/png';
    
    // JPEG signature: /9j/
    if (bytes.startsWith('/9j/')) return 'image/jpeg';
    
    // GIF signature: R0lGODlh or R0lGODdh
    if (bytes.startsWith('R0lGODlh') || bytes.startsWith('R0lGODdh')) return 'image/gif';
    
    // WebP signature: UklGR
    if (bytes.startsWith('UklGR')) return 'image/webp';
    
    // Default to jpeg if cannot detect
    return DEFAULT_IMAGE_MEDIA_TYPE;
  }
  
  // Function to resize image if it exceeds Anthropic's dimension or file size limits
  export async function resizeImageIfNeeded(
    base64String: string,
    maxDimension: number = IMAGE_MAX_DIMENSION,
    maxSizeBytes: number = IMAGE_MAX_SIZE_BYTES,
  ): Promise<{ data: string; mediaType: string }> {
    try {
      // Extract base64 data (remove data URL prefix if present)
      let imageData = base64String;
      let originalMediaType = DEFAULT_IMAGE_MEDIA_TYPE; // default
      
      if (base64String.startsWith('data:image/')) {
        const base64Match = base64String.match(/^data:image\/[^;]+;base64,(.+)$/);
        if (base64Match) {
          imageData = base64Match[1];
          // Extract original media type from data URL
          const mediaTypeMatch = base64String.match(/^data:(image\/[^;]+);/);
          if (mediaTypeMatch) {
            originalMediaType = mediaTypeMatch[1];
          }
        }
      } else {
        // For raw base64, detect the type
        originalMediaType = detectImageType(base64String);
      }
      
      // Convert base64 to buffer
      const buffer = Buffer.from(imageData, 'base64');
      
      // Get image metadata
      const metadata = await sharp(buffer).metadata();
      
      // Check current file size
      const currentSizeBytes = buffer.length;
      console.log(`Image size: ${currentSizeBytes} bytes (${(currentSizeBytes / 1024 / 1024).toFixed(2)}MB), limit: ${(maxSizeBytes / 1024 / 1024).toFixed(2)}MB`);
      
      // Check if resizing or compression is needed
      const needsDimensionResize = metadata.width && metadata.height && 
          (metadata.width > maxDimension || metadata.height > maxDimension);
      const needsSizeCompression = currentSizeBytes > maxSizeBytes;
      
      if (needsDimensionResize || needsSizeCompression) {
        console.log(`Processing image: dimensions=${needsDimensionResize ? 'YES' : 'NO'}, size=${needsSizeCompression ? 'YES' : 'NO'}`);
        
        let sharpInstance = sharp(buffer);
        
        // Resize if needed
        if (needsDimensionResize) {
          console.log(`Resizing image from ${metadata.width}x${metadata.height} to fit within ${maxDimension}px`);
          sharpInstance = sharpInstance.resize(maxDimension, maxDimension, {
            fit: 'inside',
            withoutEnlargement: true
          });
        }
        
        // Start with high quality and reduce if needed
        let quality = 85;
        let processedBuffer: Buffer;
        let currentDimension = maxDimension;
        
        // Progressive compression and resizing loop
        do {
          processedBuffer = await sharp(buffer)
            .resize(currentDimension, currentDimension, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .jpeg({ quality })
            .toBuffer();
          
          console.log(`Compressed to ${processedBuffer.length} bytes with quality ${quality} and dimension ${currentDimension}`);
          
          // If still too large, try reducing quality first, then dimensions
          if (processedBuffer.length > maxSizeBytes) {
            if (quality > 20) {
              quality -= 15;
            } else if (currentDimension > 1000) {
              // Reset quality and reduce dimensions
              quality = 70;
              currentDimension = Math.max(1000, Math.floor(currentDimension * 0.8));
            } else {
              // Final aggressive compression
              quality = Math.max(10, quality - 10);
            }
          } else {
            break;
          }
        } while (processedBuffer.length > maxSizeBytes && (quality > 10 || currentDimension > 500));
        
        // Final safety check - if still too large, apply most aggressive settings
        if (processedBuffer.length > maxSizeBytes) {
          console.log('Applying final aggressive compression...');
          processedBuffer = await sharp(buffer)
            .resize(800, 800, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .jpeg({ 
              quality: 10,
              progressive: true,
              optimiseScans: true,
              trellisQuantisation: true,
              overshootDeringing: true
            })
            .toBuffer();
          
          console.log(`Final aggressive compression: ${processedBuffer.length} bytes`);
          
          // Last resort - if still too large, throw an error
          if (processedBuffer.length > maxSizeBytes) {
            throw new Error(`Unable to compress image below ${(maxSizeBytes / 1024 / 1024).toFixed(1)}MB limit. Final size: ${(processedBuffer.length / 1024 / 1024).toFixed(2)}MB`);
          }
        }
        
        // Convert back to base64
        return {
          data: processedBuffer.toString('base64'),
          mediaType: 'image/jpeg' // Always JPEG after processing
        };
      }
      
      // Return original if no processing needed
      return {
        data: imageData,
        mediaType: originalMediaType
      };
    } catch (error) {
      console.error('Error processing image:', error);
      
      // If processing fails, try a simple fallback compression
      try {
        console.log('Attempting fallback compression...');
        const fallbackData = base64String.startsWith('data:image/') 
          ? base64String.split(',')[1] 
          : base64String;
        
        const buffer = Buffer.from(fallbackData, 'base64');
        const compressedBuffer = await sharp(buffer)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 50 })
          .toBuffer();
        
        if (compressedBuffer.length <= maxSizeBytes) {
          console.log(`Fallback compression successful: ${compressedBuffer.length} bytes`);
          return {
            data: compressedBuffer.toString('base64'),
            mediaType: 'image/jpeg'
          };
        }
      } catch (fallbackError) {
        console.error('Fallback compression also failed:', fallbackError);
      }
      
      // If all else fails, throw an error rather than returning oversized image
      throw new Error('Unable to process image to meet size requirements');
    }
  }
  /**
   * Processes an image for Anthropic API usage
   * Handles data URLs, raw base64, and URL fetching with consistent resizing and formatting
   */
  export async function processImageForAnthropic(
    imageInput: string,
    options: {
      maxDimension?: number;
      maxSizeBytes?: number;
      logContext?: string;
    } = {}
  ): Promise<{
    type: 'image';
    source: {
      type: 'base64';
      media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
      data: string;
    };
  } | null> {
    const { maxDimension = IMAGE_MAX_DIMENSION, maxSizeBytes = IMAGE_MAX_SIZE_BYTES, logContext = 'image' } = options;
  
    try {
      let base64Data: string;
      let originalMediaType: string = DEFAULT_IMAGE_MEDIA_TYPE;
  
      // Handle different input formats
      if (imageInput.startsWith('data:image/')) {
        // Data URL format
        const mimeMatch = imageInput.match(/^data:image\/([a-zA-Z0-9+/]+);base64,(.+)$/);
        if (mimeMatch) {
          originalMediaType = `image/${mimeMatch[1]}`;
          base64Data = mimeMatch[2];
        } else {
          throw new Error('Invalid data URL format');
        }
      } else if (imageInput.startsWith('http')) {
        // URL - fetch and convert
        const imageResponse = await fetch(imageInput);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }
        const buffer = await imageResponse.arrayBuffer();
        base64Data = Buffer.from(buffer).toString('base64');
        originalMediaType = imageResponse.headers.get('content-type') || 'image/jpeg';
      } else {
        // Assume raw base64
        base64Data = imageInput;
        originalMediaType = detectImageType(imageInput);
      }
  
      // Log original image details if context provided
      if (logContext) {
        const originalSizeBytes = Buffer.from(base64Data, 'base64').length;
        console.log(`${logContext} processing:`, {
          detectedType: originalMediaType,
          originalSizeBytes,
          originalSizeMB: (originalSizeBytes / 1024 / 1024).toFixed(2)
        });
      }
  
      // Resize and compress image
      const { data: resizedImageData, mediaType: finalMediaType } = await resizeImageIfNeeded(
        base64Data, 
        maxDimension, 
        maxSizeBytes
      );
  
      // Log final processed image size
      if (logContext) {
        const finalSizeBytes = Buffer.from(resizedImageData, 'base64').length;
        console.log(`${logContext} processed:`, {
          finalSizeBytes,
          finalSizeMB: (finalSizeBytes / 1024 / 1024).toFixed(2),
          mediaType: finalMediaType
        });
      }
  
      return {
        type: 'image',
        source: {
          type: 'base64',
          media_type: finalMediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: resizedImageData
        }
      };
  
    } catch (error) {
      console.error(`Failed to process ${logContext}:`, error);
      return null;
    }
  }
  