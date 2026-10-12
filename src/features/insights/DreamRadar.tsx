import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Line, Polygon } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Button, c, Label, TextButton, ui } from '@/components/ui/kit';
import type { DreamEntry } from '@/types/dream';
import { analyzeThemes, type ThemeMode } from './themes';

const point = (index: number, value: number) => {
  const angle = -Math.PI / 2 + (index * Math.PI) / 3;
  return { x: 150 + Math.cos(angle) * value, y: 150 + Math.sin(angle) * value };
};
const polygon = (values: number[]) =>
  values
    .map((value, i) => {
      const p = point(i, value);
      return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    })
    .join(' ');

export function DreamRadar({
  dreams,
  selected,
  onSelect,
}: {
  dreams: readonly DreamEntry[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<ThemeMode>('universal');
  const [sourceMode, setSourceMode] = useState<'live' | 'mock'>(
    dreams.some((d) => d.analysis_source === 'live') ? 'live' : 'mock',
  );
  const data = useMemo(
    () =>
      analyzeThemes(
        dreams.filter((d) => d.analysis_source === sourceMode),
        mode,
      ),
    [dreams, mode, sourceMode],
  );
  const label = (id: string) => t(`radar.themes.${id}` as 'radar.themes.water');
  return (
    <View style={{ gap: 16 }}>
      <Label>{t('radar.title')}</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {(['live', 'mock'] as const)
          .filter((source) => dreams.some((d) => d.analysis_source === source))
          .map((source) => (
            <Button
              key={source}
              secondary={sourceMode !== source}
              selected={sourceMode === source}
              title={t(source === 'live' ? 'grounding.liveRecords' : 'grounding.demo')}
              onPress={() => setSourceMode(source)}
            />
          ))}
      </View>
      <Text style={ui.note}>{t('radar.scope', { count: data.total })}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {(['universal', 'symbolic'] as const).map((item) => (
          <Button
            key={item}
            title={t(`radar.${item}`)}
            selected={mode === item}
            secondary={mode !== item}
            onPress={() => setMode(item)}
          />
        ))}
      </View>
      <Text style={ui.note}>{t(mode === 'symbolic' ? 'radar.symbolicNote' : 'radar.method')}</Text>
      {data.total === 0 ? (
        <Text style={ui.subtitle}>{t('radar.empty')}</Text>
      ) : (
        <>
          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel={data.axes
              .map((axis) => `${label(axis.id)}: ${axis.count}/${data.total}, ${axis.percentage}%`)
              .join('; ')}
            style={{ alignSelf: 'center', width: '100%', maxWidth: 300, aspectRatio: 1 }}
          >
            <Svg width="100%" height="100%" viewBox="0 0 300 300">
              {[25, 50, 75, 100].map((radius) => (
                <Polygon
                  key={radius}
                  points={polygon(Array(6).fill(radius))}
                  stroke={c.border}
                  strokeWidth={1}
                  fill="none"
                />
              ))}
              {data.axes.map((axis, index) => {
                const end = point(index, 100);
                return (
                  <Line key={axis.id} x1={150} y1={150} x2={end.x} y2={end.y} stroke={c.border} />
                );
              })}
              <Polygon
                points={polygon(data.axes.map((axis) => axis.percentage))}
                fill={c.text}
                fillOpacity={0.12}
                stroke={c.text}
                strokeWidth={2}
              />
            </Svg>
          </View>
          <Text style={ui.note}>{t('radar.axisOrder')}</Text>
        </>
      )}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {data.axes.map((axis) => (
          <Button
            key={axis.id}
            title={`${label(axis.id)} · ${axis.count}/${data.total} · %${axis.percentage}`}
            selected={selected === axis.id}
            secondary={selected !== axis.id}
            onPress={() => onSelect(selected === axis.id ? '' : axis.id)}
            style={{ flexGrow: 1, flexBasis: '45%' }}
          />
        ))}
      </View>
      {selected ? <TextButton title={t('radar.clear')} onPress={() => onSelect('')} /> : null}
      <Text style={ui.note}>
        {data.dominant.length
          ? t('radar.dominant', { themes: data.dominant.map(label).join(', ') })
          : t('radar.unclassified')}
      </Text>
    </View>
  );
}
