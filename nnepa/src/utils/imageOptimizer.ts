/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Compresses an image file from mobile/PC camera or gallery into an optimized data URL.
 * Automatically resizes large images (e.g. 12MP phone photos) to a max dimension of 1280px
 * and compresses to high-quality JPEG/WebP (typically 80KB - 200KB).
 */
export async function optimizeImageFile(
  file: File,
  maxDimension = 1280,
  quality = 0.82
): Promise<{ dataUrl: string; originalSize: number; optimizedSize: number; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio preserving dimensions
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback if canvas context fails
          const fallbackData = (e.target?.result as string) || '';
          resolve({
            dataUrl: fallbackData,
            originalSize,
            optimizedSize: fallbackData.length,
            mimeType: file.type || 'image/jpeg'
          });
          return;
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const optimizedSize = Math.round((dataUrl.length * 3) / 4); // Approx byte size of base64

        resolve({
          dataUrl,
          originalSize,
          optimizedSize,
          mimeType: 'image/jpeg'
        });
      };

      img.onerror = (err) => reject(new Error('Failed to decode image file.'));
      img.src = (e.target?.result as string) || '';
    };

    reader.onerror = (err) => reject(new Error('Failed to read file from storage.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes to readable string (e.g. 2.4 MB, 140 KB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
