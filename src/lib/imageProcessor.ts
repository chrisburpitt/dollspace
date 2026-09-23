// src/lib/imageProcessor.ts (THE INTERACTIVE CLIENT TRANSFORMATION SUITE)

interface RenderOptions {
  rotation: number;     // 0, 90, 180, 270 degrees
  isMirrored: boolean;   // horizontal flip toggle
  cropX: number;        // bounding percentage boxes
  cropY: number;
  cropSize: number;
}

/**
 * Reads an image element source, applies pixel matrix changes on an internal
 * HTML5 Canvas canvas box, and outputs a clean, web-ready binary Blob payload.
 */
export function processProfileImageCanvas(
  imgElement: HTMLImageElement,
  options: RenderOptions
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return resolve(null);

    // Set a uniform production standard resolution for profile avatars (e.g. 400x400 square)
    const targetSize = 400;
    canvas.width = targetSize;
    canvas.height = targetSize;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // 1. Move canvas origin locator grid matrix to the dead center to rotate cleanly
    ctx.translate(targetSize / 2, targetSize / 2);

    // 2. Execute 90-degree iterative rotation calculations
    ctx.rotate((options.rotation * Math.PI) / 180);

    // 3. Execute horizontal reflection mirroring flips
    if (options.isMirrored) {
      ctx.scale(-1, 1);
    }

    // Move back to top-left draw origin context parameters
    ctx.translate(-targetSize / 2, -targetSize / 2);

    // 4. Compute cropping map windows based on user sliders percentages
    const sourceX = (options.cropX / 100) * imgElement.naturalWidth;
    const sourceY = (options.cropY / 100) * imgElement.naturalHeight;
    const sourceSize = (options.cropSize / 100) * Math.min(imgElement.naturalWidth, imgElement.naturalHeight);

    // Draw the computed transformations onto the binary canvas viewport
    ctx.drawImage(
      imgElement,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize, // Source crop box parameters
      0,
      0,
      targetSize,
      targetSize  // Destination canvas target fill
    );

    // Export the canvas layer directly into a highly compressed web-ready JPEG image
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.85);
  });
}
