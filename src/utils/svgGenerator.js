const themes = {
  light: { bg: '#ffffff', text: '#2c3e50', author: '#7f8c8d', accent: '#3498db' },
  dark: { bg: '#2c3e50', text: '#ecf0f1', author: '#95a5a6', accent: '#3498db' },
  gradient: { bg: 'url(#gradient)', text: '#ffffff', author: '#ecf0f1', accent: '#ffffff' },
  ocean: { bg: '#006994', text: '#ffffff', author: '#e0f2f7', accent: '#4fc3f7' },
  sunset: { bg: '#ff6b6b', text: '#ffffff', author: '#ffe66d', accent: '#ffd93d' },
  forest: { bg: '#2d6a4f', text: '#ffffff', author: '#d8f3dc', accent: '#95d5b2' },
  purple: { bg: '#6a4c93', text: '#ffffff', author: '#c9ada7', accent: '#d4a5a5' }
};

// Helper function to wrap text for SVG
function wrapText(text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    // Approximate character width (adjust based on font)
    if (testLine.length * 12 < maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  
  if (currentLine) lines.push(currentLine);
  return lines;
}

// Escape XML special characters
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSvg(quote, options = {}) {
  const width = parseInt(options.width) || 800;
  const height = parseInt(options.height) || 400;
  const theme = options.theme || 'light';
  
  const colors = themes[theme] || themes.light;
  
  // Wrap text for better display
  const textLines = wrapText(quote.text, width - 100);
  const lineHeight = 35;
  const textBlockHeight = textLines.length * lineHeight;
  const startY = (height - textBlockHeight - 60) / 2 + 40;
  
  // Escape text for XML
  const escapedAuthor = escapeXml(quote.author);
  
  // Generate SVG
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="${colors.bg}" rx="10"/>
  
  <!-- Decorative quote marks -->
  <text x="50" y="60" font-family="Georgia, serif" font-size="60" fill="${colors.accent}" opacity="0.3">"</text>
  
  <!-- Quote text -->
  <text font-family="Georgia, serif" font-size="24" fill="${colors.text}" text-anchor="middle">
    ${textLines.map((line, i) => `<tspan x="${width/2}" y="${startY + (i * lineHeight)}">${escapeXml(line)}</tspan>`).join('\n    ')}
  </text>
  
  <!-- Author -->
  <text x="${width/2}" y="${startY + textBlockHeight + 40}" font-family="Georgia, serif" font-size="20" fill="${colors.author}" text-anchor="middle" font-style="italic">
    — ${escapedAuthor}
  </text>
  
  <!-- Decorative line -->
  <line x1="${width/2 - 100}" y1="${startY + textBlockHeight + 15}" x2="${width/2 + 100}" y2="${startY + textBlockHeight + 15}" stroke="${colors.accent}" stroke-width="2" opacity="0.5"/>
</svg>`;
}

module.exports = { generateSvg, themes };
