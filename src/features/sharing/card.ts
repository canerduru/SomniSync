export type CardFormat = 'post' | 'story';
export interface CardPayload {
  title: string;
  tags: string[];
  imageUri: string;
  date: string;
  footer: string;
  demoLabel: string;
  format?: CardFormat;
}
export function cardDimensions(format: CardFormat = 'post') {
  return { width: 1080, height: format === 'story' ? 1920 : 1350 };
}
const cleanText = (text: string, limit: number) =>
  text
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit);
export const xmlEscape = (text: string) =>
  text.replace(
    /[<>&"']/g,
    (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[ch]!,
  );
export function titleLines(title: string) {
  const words = cleanText(title, 140)
    .split(' ')
    .flatMap((word) => word.match(/.{1,27}/gu) || []);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > 27 && line) {
      lines.push(line);
      line = word;
    } else line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}
export function cardLayout(data: CardPayload) {
  const { width, height } = cardDimensions(data.format);
  return {
    width,
    height,
    imageHeight: Math.round(height * 0.64),
    dateY: Math.round(height * 0.7),
    titleY: Math.round(height * 0.7) + 70,
    tagsY: height - 160,
    footerY: height - 55,
    title: titleLines(data.title),
    tags: data.tags
      .slice(0, 3)
      .map((tag) => cleanText(tag, 18))
      .join(' / '),
    date: cleanText(data.date, 20),
    footer: cleanText(data.footer, 40),
    demoLabel: cleanText(data.demoLabel, 36),
  };
}
export function buildShareSvg(data: CardPayload) {
  const g = cardLayout(data);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${g.width}" height="${g.height}" viewBox="0 0 ${g.width} ${g.height}"><defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#080808" stop-opacity="0"/><stop offset="1" stop-color="#080808"/></linearGradient></defs><rect width="${g.width}" height="${g.height}" fill="#080808"/><image x="0" y="0" width="1080" height="${g.imageHeight}" preserveAspectRatio="xMidYMid slice" href="${xmlEscape(data.imageUri)}"/><rect y="${g.imageHeight - 160}" width="1080" height="160" fill="url(#shade)"/><text x="64" y="75" fill="#eee" font-family="sans-serif" font-size="24" letter-spacing="5">SOMNISYNC ◌</text><text x="1016" y="75" text-anchor="end" fill="#ddd" font-family="sans-serif" font-size="16">${xmlEscape(g.demoLabel)}</text><text x="64" y="${g.dateY}" fill="#aaa" font-family="sans-serif" font-size="22">${xmlEscape(g.date)}</text>${g.title.map((line, i) => `<text x="64" y="${g.titleY + i * 60}" fill="#f1f0ea" font-family="Georgia, serif" font-size="52">${xmlEscape(line)}</text>`).join('')}<text x="64" y="${g.tagsY}" fill="#bbb" font-family="sans-serif" font-size="22">${xmlEscape(g.tags)}</text><line x1="64" y1="${g.footerY - 50}" x2="1016" y2="${g.footerY - 50}" stroke="#444"/><text x="64" y="${g.footerY}" fill="#aaa" font-family="sans-serif" font-size="16" letter-spacing="2">${xmlEscape(g.footer)}</text><text x="1016" y="${g.footerY}" text-anchor="end" fill="#ddd" font-family="sans-serif" font-size="22">S / S</text></svg>`;
}
