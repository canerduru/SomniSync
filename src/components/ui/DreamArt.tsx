import { SvgXml } from 'react-native-svg';
import { Image, View } from 'react-native';
import { artwork } from '@/assets/dream-art';
import type { ArtKind } from '@/assets/dream-art';
export function DreamArt({ kind, height = 320 }: { kind: ArtKind; height?: number | '100%' }) {
  return (
    <View
      accessible={false}
      style={{ width: '100%', height, overflow: 'hidden', backgroundColor: '#141414' }}
    >
      <SvgXml xml={artwork(kind)} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
    </View>
  );
}
export function Orbit({ size = 190 }: { size?: number }) {
  return (
    <SvgXml
      width={size}
      height={size}
      xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220"><circle cx="110" cy="110" r="105" fill="none" stroke="#393939"/><circle cx="110" cy="110" r="78" fill="none" stroke="#4c4c4c"/><ellipse cx="110" cy="110" rx="105" ry="36" transform="rotate(-32 110 110)" fill="none" stroke="#777"/><circle cx="110" cy="110" r="43" fill="#d2d2cd"/><path d="M107 67 A43 43 0 1 0 107 153 A34 43 0 0 1 107 67" fill="#121212"/><circle cx="32" cy="142" r="4" fill="#eee"/><path d="M180 32v12 M174 38h12" stroke="#aaa"/></svg>`}
    />
  );
}

export function DreamVisual({
  uri,
  height = 320,
}: {
  uri: string | null;
  height?: number | '100%';
}) {
  const xml = uri?.startsWith('data:image/svg+xml')
    ? decodeURIComponent(uri.slice(uri.indexOf(',') + 1))
    : null;
  return (
    <View
      accessible={false}
      style={{ width: '100%', height, overflow: 'hidden', backgroundColor: '#141414' }}
    >
      {xml ? (
        <SvgXml xml={xml} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      ) : uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : null}
    </View>
  );
}
