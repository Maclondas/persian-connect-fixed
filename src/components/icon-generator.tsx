// Simple icon generator for PWA icons
// This creates Persian Connect icons programmatically

interface IconGeneratorProps {
  size: number;
  text?: string;
}

export function generateIconSVG(size: number, text: string = 'PC'): string {
  const fontSize = Math.floor(size * 0.4);
  const borderRadius = Math.floor(size * 0.15);
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${borderRadius}" fill="#0ac2af"/>
    <text x="${size/2}" y="${size/2 + fontSize/3}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle">${text}</text>
  </svg>`;
}

export function generateIconDataURL(size: number, text: string = 'PC'): string {
  const svg = generateIconSVG(size, text);
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Function to download SVG as PNG (would need to be called from browser)
export function downloadIconAsPNG(size: number, text: string = 'PC', filename: string) {
  const svg = generateIconSVG(size, text);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  canvas.width = size;
  canvas.height = size;
  
  img.onload = () => {
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };
  
  img.src = generateIconDataURL(size, text);
}