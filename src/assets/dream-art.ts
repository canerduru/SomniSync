export type ArtKind = 'water' | 'falling' | 'mirror';
export function artwork(kind: ArtKind) {
  const stars = Array.from(
    { length: 85 },
    (_, i) =>
      `<circle cx="${(i * 137 + 31) % 800}" cy="${(i * 73 + 19) % 440}" r="${i % 4 === 0 ? 1.2 : 0.6}" fill="#ddd" opacity="${0.15 + (i % 5) * 0.1}"/>`,
  ).join('');
  const lines = Array.from(
    { length: 30 },
    (_, i) =>
      `<path d="M0 ${460 + i * 10} Q200 ${445 + i * 10} 400 ${465 + i * 10} T800 ${460 + i * 10}" stroke="#ddd" stroke-opacity="${0.02 + i * 0.001}" fill="none"/>`,
  ).join('');
  const city = Array.from(
    { length: 17 },
    (_, i) =>
      `<rect x="${i * 49}" y="${380 - ((i * 31) % 100)}" width="${25 + (i % 3) * 5}" height="${150 + ((i * 31) % 100)}" fill="#16191a" stroke="#747474" stroke-opacity=".2"/>`,
  ).join('');
  const stairs = Array.from(
    { length: 18 },
    (_, i) =>
      `<path d="M${160 + i * 21} ${670 - i * 21} h${330 - i * 11} v-21" stroke="#bababa" stroke-opacity="${0.12 + i * 0.02}" stroke-width="2" fill="none"/>`,
  ).join('');
  const person = `<circle cx="400" cy="456" r="8" fill="#050505"/><path d="M394 465 L390 496 L410 496 L406 465 Z M395 495 L392 516 M405 495 L408 516" fill="#050505" stroke="#050505" stroke-width="5"/>`;
  const scene =
    kind === 'water'
      ? `${city}<ellipse cx="400" cy="454" rx="160" ry="27" fill="#ddd" opacity=".08"/>${lines}<path d="M365 420 V323 Q400 285 435 323 V420" fill="#ddd" opacity=".45"/>${person}`
      : kind === 'falling'
        ? `${stairs}<ellipse cx="414" cy="440" rx="7" ry="17" transform="rotate(35 414 440)" fill="#090909"/><path d="M404 428 L421 449 M413 432 L432 430 M410 437 L390 444" stroke="#090909" stroke-width="5"/>`
        : `<path d="M245 650 V245 Q400 105 555 245 V650" fill="#191919" stroke="#bbb" stroke-opacity=".45" stroke-width="3"/><path d="M265 650 V258 Q400 138 535 258 V650" fill="url(#fog)"/><ellipse cx="400" cy="610" rx="220" ry="90" fill="#bbb" opacity=".06"/>${person}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#08090b"/><stop offset=".6" stop-color="#303236"/><stop offset="1" stop-color="#050506"/></linearGradient><radialGradient id="halo"><stop stop-color="#dedede" stop-opacity=".18"/><stop offset="1" stop-color="#dedede" stop-opacity="0"/></radialGradient><linearGradient id="fog" x2="0" y2="1"><stop stop-color="#080808"/><stop offset="1" stop-color="#777"/></linearGradient></defs><rect width="800" height="800" fill="url(#sky)"/><circle cx="400" cy="265" r="260" fill="url(#halo)"/>${stars}<circle cx="400" cy="245" r="${kind === 'mirror' ? 55 : 105}" fill="#c9c9c5"/><circle cx="365" cy="212" r="34" fill="#999" opacity=".1"/><circle cx="435" cy="261" r="27" fill="#666" opacity=".12"/>${scene}<rect y="720" width="800" height="80" fill="#080808" opacity=".6"/></svg>`;
}
export const artUri = (kind: ArtKind) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(artwork(kind))}`;
