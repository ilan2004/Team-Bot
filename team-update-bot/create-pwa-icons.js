const fs = require('fs');
const path = require('path');

// Create a simple SVG icon template
const createSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#09090b" rx="${size * 0.2}"/>
  <rect x="${size * 0.15}" y="${size * 0.15}" width="${size * 0.7}" height="${size * 0.7}" fill="#ffffff" rx="${size * 0.1}"/>
  <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" fill="#09090b" font-family="Arial, sans-serif" font-size="${size * 0.25}" font-weight="bold">TU</text>
</svg>`;
};

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create SVG icons for now (browsers can use these)
iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const fileName = `icon-${size}x${size}.svg`;
  const filePath = path.join(iconsDir, fileName);
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`Created ${fileName}`);
});

console.log(`\nCreated ${iconSizes.length} SVG icons in public/icons/`);
console.log('Note: For production, consider converting these SVG icons to PNG format using an image processing tool.');
console.log('SVG icons will work for most PWA functionality, but PNG is preferred for better compatibility.');
