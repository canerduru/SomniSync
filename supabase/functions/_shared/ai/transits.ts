import { Body, Ecliptic, GeoVector } from 'npm:astronomy-engine@2.1.19';
import type { TransitContext } from './domain.ts';
const signs = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
];
export function calculateTransits(at: Date): TransitContext {
  if (!Number.isFinite(at.getTime()) || at.getUTCFullYear() < 1900 || at.getUTCFullYear() > 2100)
    throw new Error('INVALID_TRANSIT_DATE');
  const positions = [
    Body.Sun,
    Body.Moon,
    Body.Mercury,
    Body.Venus,
    Body.Mars,
    Body.Jupiter,
    Body.Saturn,
  ].map((body) => {
    const longitude = Ecliptic(GeoVector(body, at, true)).elon;
    return {
      body: String(body).toLowerCase(),
      longitude: Math.round(longitude * 1000) / 1000,
      sign: signs[Math.floor(longitude / 30)]!,
    };
  });
  return {
    available: true,
    source: 'astronomy-engine@2.1.19',
    calculated_at: at.toISOString(),
    system: 'geocentric_tropical_ecliptic_of_date',
    positions,
  };
}
