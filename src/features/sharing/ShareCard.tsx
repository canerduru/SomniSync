import Svg, {
  Defs,
  Image,
  Line,
  LinearGradient,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { cardLayout, type CardPayload } from './card';

export function ShareCard({ payload }: { payload: CardPayload }) {
  const g = cardLayout(payload);
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${g.width} ${g.height}`}>
      <Defs>
        <LinearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#080808" stopOpacity={0} />
          <Stop offset="1" stopColor="#080808" />
        </LinearGradient>
      </Defs>
      <Rect width={g.width} height={g.height} fill="#080808" />
      {payload.imageUri ? (
        <Image
          x={0}
          y={0}
          width={1080}
          height={g.imageHeight}
          href={{ uri: payload.imageUri }}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : null}
      <Rect y={g.imageHeight - 160} width={1080} height={160} fill="url(#shade)" />
      <SvgText x={64} y={75} fill="#eee" fontFamily="sans-serif" fontSize={24} letterSpacing={5}>
        SOMNISYNC ◌
      </SvgText>
      <SvgText x={1016} y={75} textAnchor="end" fill="#ddd" fontFamily="sans-serif" fontSize={16}>
        {g.demoLabel}
      </SvgText>
      <SvgText x={64} y={g.dateY} fill="#aaa" fontFamily="sans-serif" fontSize={22}>
        {g.date}
      </SvgText>
      {g.title.map((line, i) => (
        <SvgText
          key={i}
          x={64}
          y={g.titleY + i * 60}
          fill="#f1f0ea"
          fontFamily="Georgia, serif"
          fontSize={52}
        >
          {line}
        </SvgText>
      ))}
      <SvgText x={64} y={g.tagsY} fill="#bbb" fontFamily="sans-serif" fontSize={22}>
        {g.tags}
      </SvgText>
      <Line x1={64} y1={g.footerY - 50} x2={1016} y2={g.footerY - 50} stroke="#444" />
      <SvgText
        x={64}
        y={g.footerY}
        fill="#aaa"
        fontFamily="sans-serif"
        fontSize={16}
        letterSpacing={2}
      >
        {g.footer}
      </SvgText>
      <SvgText
        x={1016}
        y={g.footerY}
        textAnchor="end"
        fill="#ddd"
        fontFamily="sans-serif"
        fontSize={22}
      >
        S / S
      </SvgText>
    </Svg>
  );
}
