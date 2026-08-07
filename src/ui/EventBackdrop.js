import React, { useMemo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path, G } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import {
  EVENT_CARD_BACKDROPS,
  BACKDROP_SCRIM_OPACITY,
  BACKDROP_BLUR_INTENSITY,
} from '../config/appearance';

/**
 * Artwork behind an event card.
 *
 * Local events have a real promo image from Ticketmaster, so that gets blurred
 * and dimmed until it reads as texture rather than a picture. Connection events
 * have no image, so we generate one from the activity type and city — a colour
 * pair plus a simple motif, deterministic per event so a card always looks the
 * same.
 */

// Two-stop gradients keyed to what's being posted.
const PALETTES = {
  golf: ['#14532d', '#0f766e'],
  lifting: ['#3f1d38', '#7c2d5a'],
  running: ['#7c2d12', '#b45309'],
  beer: ['#78350f', '#a16207'],
  movies: ['#1e1b4b', '#4c1d95'],
  academic: ['#0c4a6e', '#155e75'],
  outdoor: ['#14532d', '#166534'],
  social: ['#701a75', '#9d174d'],
  creative: ['#4a044e', '#6b21a8'],
  music: ['#4c1d95', '#7e22ce'],
  comedy: ['#7c2d12', '#9a3412'],
  sports: ['#14532d', '#15803d'],
  theater: ['#4a044e', '#86198f'],
  default: ['#0f2c3f', '#134e4a'],
};

const paletteFor = (type) => PALETTES[type] || PALETTES.default;

/** Stable hash so a given event always gets the same motif placement. */
const hashString = (value) => {
  let hash = 0;
  const text = String(value || '');
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash;
};

/**
 * A skyline silhouette along the bottom, seeded from the city name, so an event
 * in Chicago doesn't look identical to one in Austin.
 */
function Skyline({ seed, width, height, color }) {
  const buildings = useMemo(() => {
    const hash = hashString(seed);
    const count = 9;
    const slotWidth = width / count;

    return Array.from({ length: count }, (_, index) => {
      const local = (hash >> (index % 12)) % 100;
      const buildingHeight = height * (0.18 + (local / 100) * 0.42);
      return {
        x: index * slotWidth + slotWidth * 0.12,
        width: slotWidth * 0.76,
        height: buildingHeight,
        y: height - buildingHeight,
      };
    });
  }, [seed, width, height]);

  return (
    <G opacity={0.5}>
      {buildings.map((building, index) => (
        <Rect
          key={index}
          x={building.x}
          y={building.y}
          width={building.width}
          height={building.height}
          fill={color}
          rx={1.5}
        />
      ))}
    </G>
  );
}

function GeneratedArtwork({ event, width, height }) {
  const [from, to] = paletteFor(event?.type);
  const hash = hashString(event?.id || event?.title);
  const gradientId = `grad-${hash}`;

  // A few soft orbs, placed deterministically, to break up the flat gradient.
  const orbs = Array.from({ length: 3 }, (_, index) => ({
    cx: ((hash >> (index * 3)) % 100) / 100 * width,
    cy: ((hash >> (index * 5)) % 60) / 100 * height,
    r: 26 + ((hash >> index) % 34),
  }));

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={from} />
          <Stop offset="1" stopColor={to} />
        </LinearGradient>
      </Defs>

      <Rect x={0} y={0} width={width} height={height} fill={`url(#${gradientId})`} />

      {orbs.map((orb, index) => (
        <Circle key={index} cx={orb.cx} cy={orb.cy} r={orb.r} fill="#ffffff" opacity={0.05} />
      ))}

      <Skyline seed={event?.city || event?.location} width={width} height={height} color="#000000" />

      {/* A single sweep to suggest motion */}
      <Path
        d={`M0 ${height * 0.72} Q ${width * 0.45} ${height * 0.5} ${width} ${height * 0.78}`}
        stroke="#ffffff"
        strokeWidth={1}
        opacity={0.12}
        fill="none"
      />
    </Svg>
  );
}

export default function EventBackdrop({ event, height = 120, width = 320, radius: cornerRadius }) {
  const { colors, radius } = useTheme();
  const { settings } = useSettings();

  // Off either by build flag or by the user's own preference.
  if (!EVENT_CARD_BACKDROPS || !settings.showEventBackdrops) return null;

  const borderRadius = cornerRadius ?? radius.lg;
  const hasPhoto = Boolean(event?.imageUrl);

  return (
    <View style={[StyleSheet.absoluteFill, { borderRadius, overflow: 'hidden' }]} pointerEvents="none">
      {hasPhoto ? (
        <>
          <Image source={{ uri: event.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <BlurView
            intensity={BACKDROP_BLUR_INTENSITY}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        </>
      ) : (
        <GeneratedArtwork event={event} width={width} height={height} />
      )}

      {/* Scrim keeps text legible whatever the artwork underneath is doing. */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.card, opacity: BACKDROP_SCRIM_OPACITY },
        ]}
      />
    </View>
  );
}
