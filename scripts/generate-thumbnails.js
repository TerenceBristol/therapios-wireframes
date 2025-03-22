const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const wireframes = [
  {
    name: 'dashboard',
    color: '#E3F2FD',
    accent: '#2196F3'
  },
  {
    name: 'treatment-documentation',
    color: '#F3E5F5',
    accent: '#9C27B0'
  },
  {
    name: 'treatment-documentation-updated',
    color: '#EDE7F6',
    accent: '#673AB7'
  },
  {
    name: 'prescription-renewals',
    color: '#E8F5E9',
    accent: '#4CAF50'
  },
  {
    name: 'admin-dashboard',
    color: '#FFF3E0',
    accent: '#FF9800'
  }
];

function generateThumbnail(name, bgColor, accentColor) {
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Draw some wireframe-like elements
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;

  // Header
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(40, 40, width - 80, 60);
  
  // Sidebar
  ctx.fillRect(40, 120, 200, height - 160);
  
  // Main content area
  ctx.fillRect(260, 120, width - 300, height - 160);
  
  // Add some "content" lines
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(280, 150 + i * 30);
    ctx.lineTo(width - 60, 150 + i * 30);
    ctx.stroke();
  }

  // Save the image
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(__dirname, '..', 'public', 'images', 'wireframes', `${name}-thumb.png`);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated thumbnail: ${outputPath}`);
}

// Generate thumbnails for each wireframe
wireframes.forEach(({ name, color, accent }) => {
  generateThumbnail(name, color, accent);
}); 