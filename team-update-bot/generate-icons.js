const fs = require('fs');
const path = require('path');

// Simple SVG icon template
const svgTemplate = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#09090b" rx="${size * 0.2}"/>
  <rect x="${size * 0.15}" y="${size * 0.15}" width="${size * 0.7}" height="${size * 0.7}" fill="#ffffff" rx="${size * 0.1}"/>
  <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" fill="#09090b" font-family="Arial, sans-serif" font-size="${size * 0.25}" font-weight="bold">TU</text>
</svg>
`;

// Convert SVG to data URL for embedding
const svgToDataUrl = (svgString) => {
  return `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;
};

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate HTML file to create PNGs from SVGs
let htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Icon Generator</title>
  <style>
    canvas { border: 1px solid #ccc; margin: 10px; }
  </style>
</head>
<body>
  <h1>PWA Icon Generator</h1>
  <div id="canvases"></div>
  
  <script>
    const iconSizes = ${JSON.stringify(iconSizes)};
    const canvasesContainer = document.getElementById('canvases');
    
    iconSizes.forEach(size => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      canvas.id = 'canvas-' + size;
      canvasesContainer.appendChild(canvas);
      
      const ctx = canvas.getContext('2d');
      
      // Create SVG
      const svgString = \`${svgTemplate('${size}').replace(/\${size}/g, '${size}')}\`.replace(/\\${size}/g, size);
      
      // Create image from SVG
      const img = new Image();
      const svgBlob = new Blob([svgString], {type: 'image/svg+xml'});
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = function() {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        
        // Convert to PNG and download
        canvas.toBlob(function(blob) {
          const link = document.createElement('a');
          link.download = \`icon-\${size}x\${size}.png\`;
          link.href = URL.createObjectURL(blob);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      };
      
      img.src = url;
    });
  </script>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync(path.join(__dirname, 'icon-generator.html'), htmlContent);

console.log('Icon generator created! Open icon-generator.html in your browser to generate and download PWA icons.');
console.log('After downloading, move the icon files to public/icons/ directory.');
