/**
 * ImageCompressor utility for optimizing image uploads and processing
 */

interface CompressionOptions {
  /**
   * Maximum width of compressed image in pixels
   */
  maxWidth?: number;
  
  /**
   * Maximum height of compressed image in pixels
   */
  maxHeight?: number;
  
  /**
   * Quality of compressed image (0 to 1)
   */
  quality?: number;
  
  /**
   * Target file size in bytes
   */
  targetSize?: number;
  
  /**
   * Preserve original aspect ratio
   */
  preserveRatio?: boolean;
  
  /**
   * Output format: 'jpeg', 'png', 'webp'
   */
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

/**
 * Compress an image file using canvas rendering
 * 
 * @param file Original image file to compress
 * @param options Compression options
 * @returns Promise with the compressed file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    preserveRatio = true,
    format = 'image/jpeg',
    targetSize
  } = options;
  
  // Skip compression for SVG, GIF files or if file is already smaller than target size
  if (
    file.type === 'image/svg+xml' || 
    file.type === 'image/gif' ||
    (targetSize && file.size <= targetSize)
  ) {
    return file;
  }
  
  return new Promise((resolve, reject) => {
    // Read file as data URL
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      // Create an image element
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Calculate dimensions to maintain aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (preserveRatio) {
          // Scale down to fit within max dimensions
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        } else {
          // Use max dimensions directly
          width = maxWidth;
          height = maxHeight;
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = height;
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Draw image with smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with specified quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob from canvas'));
              return;
            }
            
            // Create new file with original name but compressed content
            const fileName = file.name;
            const fileExt = format === 'image/jpeg' ? '.jpg' : 
                           format === 'image/png' ? '.png' : 
                           format === 'image/webp' ? '.webp' : '';
                           
            // Replace original extension with new format extension if different
            const newFileName = fileName.includes('.') ?
              fileName.replace(/\.[^\.]+$/, fileExt) :
              `${fileName}${fileExt}`;
            
            const newFile = new File([blob], newFileName, {
              type: format,
              lastModified: Date.now()
            });
            
            // If we have a target size and still too large, reduce quality further
            if (targetSize && newFile.size > targetSize && format === 'image/jpeg') {
              // Try with lower quality, recursively
              const lowerQuality = Math.max(quality - 0.1, 0.5); // Don't go below 0.5 quality
              compressImage(file, {
                ...options,
                quality: lowerQuality
              })
              .then(resolve)
              .catch(reject);
              return;
            }
            
            resolve(newFile);
          },
          format,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };
  });
}

/**
 * Generate a low-quality placeholder image
 * 
 * @param file Original image file
 * @returns Promise with data URL for low quality placeholder
 */
export async function generatePlaceholderImage(file: File): Promise<string> {
  return compressImage(file, {
    maxWidth: 20,
    maxHeight: 20,
    quality: 0.1,
    format: 'image/jpeg'
  }).then(compressedFile => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to generate placeholder'));
    });
  });
}

/**
 * Batch compress multiple image files
 * 
 * @param files Array of image files to compress
 * @param options Compression options
 * @returns Promise with array of compressed files
 */
export async function batchCompressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  const compressPromises = files.map(file => compressImage(file, options));
  return Promise.all(compressPromises);
}

/**
 * Get optimized image URL parameters for different scenarios
 * 
 * @param url Base image URL
 * @param scenario Predefined quality scenario
 * @returns Modified URL with quality parameters
 */
export function getOptimizedImageUrl(
  url: string,
  scenario: 'thumbnail' | 'preview' | 'display' | 'fullsize' = 'display'
): string {
  if (!url) return url;
  
  // Quality and size parameters based on scenario
  const params = {
    thumbnail: { width: 150, quality: 60 },
    preview: { width: 400, quality: 70 },
    display: { width: 800, quality: 80 },
    fullsize: { width: 1600, quality: 90 }
  };
  
  const { width, quality } = params[scenario];
  
  // Check if URL already has query parameters
  const separator = url.includes('?') ? '&' : '?';
  
  return `${url}${separator}width=${width}&quality=${quality}`;
}
