const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create SVG icon template
function createSVGIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#007AFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0056b3;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">SR</text>
</svg>`;
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate PNG icons (we'll use SVG for now as placeholder)
iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);
  
  // For now, save as SVG with PNG extension (browsers will handle it)
  // In production, you'd want to use a proper image conversion library
  fs.writeFileSync(filepath.replace('.png', '.svg'), svgContent);
  
  console.log(`Generated ${filename}`);
});

// Generate special icons
const specialIcons = [
  { name: 'dashboard-96x96.png', size: 96, icon: '📊' },
  { name: 'competitors-96x96.png', size: 96, icon: '🏪' },
  { name: 'customers-96x96.png', size: 96, icon: '👥' },
  { name: 'close-96x96.png', size: 96, icon: '✕' }
];

specialIcons.forEach(({ name, size, icon }) => {
  const svgContent = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#007AFF"/>
  <text x="50%" y="50%" font-size="${size * 0.5}" text-anchor="middle" dominant-baseline="central">${icon}</text>
</svg>`;
  
  const filepath = path.join(iconsDir, name.replace('.png', '.svg'));
  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${name}`);
});

console.log('✅ PWA icons generated successfully!');
console.log('📝 Note: These are SVG placeholders. For production, convert to PNG using a proper image library.'); 