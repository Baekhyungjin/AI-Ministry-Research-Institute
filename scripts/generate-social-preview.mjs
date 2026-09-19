import sharp from 'sharp';

const width = 1200;
const height = 630;
const background = Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f8f5ff"/>
      <stop offset="0.55" stop-color="#eef3ff"/>
      <stop offset="1" stop-color="#e5f7ff"/>
    </linearGradient>
    <radialGradient id="pink" cx="0" cy="0" r="1" gradientTransform="translate(820 320) rotate(90) scale(300)">
      <stop stop-color="#ed2bc8" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#ed2bc8" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blue" cx="0" cy="0" r="1" gradientTransform="translate(1050 420) rotate(90) scale(330)">
      <stop stop-color="#10b8f0" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#10b8f0" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#pink)"/>
  <rect width="1200" height="630" fill="url(#blue)"/>
  <rect x="54" y="54" width="1092" height="522" rx="34" fill="#ffffff" fill-opacity="0.62" stroke="#ffffff" stroke-opacity="0.82"/>
  <text x="105" y="150" fill="#2467e8" font-family="Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="4">MINISTRY AI RESEARCH INSTITUTE</text>
  <text x="105" y="267" fill="#0b1c35" font-family="Malgun Gothic, Arial, sans-serif" font-size="72" font-weight="800" letter-spacing="-4">목회AI연구소</text>
  <rect x="105" y="310" width="96" height="6" rx="3" fill="#e92ac9"/>
  <rect x="201" y="310" width="96" height="6" rx="3" fill="#147ee8"/>
  <text x="105" y="382" fill="#263b58" font-family="Malgun Gothic, Arial, sans-serif" font-size="31" font-weight="700">기술보다 사람을, 도구보다 사명을 먼저.</text>
  <text x="105" y="442" fill="#607089" font-family="Malgun Gothic, Arial, sans-serif" font-size="22">목회 현장을 위한 AI 연구 · 교육 · 실천 플랫폼</text>
  <text x="105" y="510" fill="#8b5cf6" font-family="Arial, sans-serif" font-size="17" font-weight="800" letter-spacing="2">AI × FAITH · RESEARCH × PRACTICE</text>
</svg>`);

const mark = await sharp('public/images/brand/ministry-ai-mark-transparent.png')
  .resize({ width: 360, height: 360, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp(background)
  .composite([{ input: mark, left: 770, top: 135 }])
  .png({ compressionLevel: 9, palette: true })
  .toFile('public/images/brand/ministry-ai-social-preview-v1.png');

console.log('Created public/images/brand/ministry-ai-social-preview-v1.png');
