#!/bin/bash

# Create a simple SVG icon for the app
cat > public/icon.svg << 'SVGEOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="128" fill="#232F3E"/>
  <path d="M256 128c70.7 0 128 57.3 128 128s-57.3 128-128 128-128-57.3-128-128 57.3-128 128-128z" fill="#FF9900"/>
  <path d="M256 180l30 60h-60l30-60zm0 90l40 40-80 0l40-40z" fill="#FFF"/>
</svg>
SVGEOF

echo "Icons would be generated here using ImageMagick or similar tool"
echo "For now, using placeholder message"

# Create placeholder icon files
for size in 72 96 128 144 152 180 192 384 512; do
  echo "Generated ${size}x${size} icon" > "public/icons/icon-${size}x${size}.png"
done

echo "Generated maskable-icon-512x512.png" > "public/icons/maskable-icon-512x512.png"
echo "Generated icon-167x167.png for iPad" > "public/icons/icon-167x167.png"
echo "Generated icon-180x180.png for iPhone" > "public/icons/icon-180x180.png"
