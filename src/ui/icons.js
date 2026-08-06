import React from 'react';
import Svg, { Circle, Line, Path, G, Rect } from 'react-native-svg';

/**
 * Hand-drawn vector icons, so the tab bar themes with the palette and stays
 * crisp at any size. Each takes a `color` and a `size`; `active` fills the
 * shape rather than just outlining it.
 *
 * All icons are drawn on a 24x24 grid.
 */

const Icon = ({ size = 24, children }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {children}
  </Svg>
);

/** Local — a map pin whose head is a small constellation of people. */
export const LocalIcon = ({ color = '#fff', size = 24, active = false }) => (
  <Icon size={size}>
    <Path
      d="M12 21.5c4.2-4.4 6.3-7.7 6.3-10.4A6.3 6.3 0 0 0 12 4.8a6.3 6.3 0 0 0-6.3 6.3c0 2.7 2.1 6 6.3 10.4Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
      fill={active ? color : 'none'}
      fillOpacity={active ? 0.16 : 0}
    />
    <Circle cx={12} cy={11} r={2.4} fill={color} />
    <Circle cx={8.6} cy={9.2} r={1} fill={color} opacity={0.75} />
    <Circle cx={15.4} cy={9.2} r={1} fill={color} opacity={0.75} />
  </Icon>
);

/** Connections — a small node graph: one hub, three linked peers. */
export const ConnectionsIcon = ({ color = '#fff', size = 24, active = false }) => (
  <Icon size={size}>
    <G stroke={color} strokeWidth={1.6} strokeLinecap="round">
      <Line x1={12} y1={12} x2={6.5} y2={6.5} />
      <Line x1={12} y1={12} x2={18} y2={8.5} />
      <Line x1={12} y1={12} x2={9.5} y2={18.5} />
    </G>
    <Circle cx={12} cy={12} r={3} fill={active ? color : 'none'} stroke={color} strokeWidth={1.8} />
    <Circle cx={6} cy={6} r={2.1} fill={color} />
    <Circle cx={18.4} cy={8.1} r={2.1} fill={color} opacity={0.85} />
    <Circle cx={9.1} cy={19} r={2.1} fill={color} opacity={0.7} />
  </Icon>
);

/** Chat — a rounded speech bubble with a tail. */
export const ChatIcon = ({ color = '#fff', size = 24, active = false }) => (
  <Icon size={size}>
    <Path
      d="M4.5 10.6c0-2.9 2.4-5.2 5.3-5.2h4.4c2.9 0 5.3 2.3 5.3 5.2 0 2.9-2.4 5.3-5.3 5.3H10l-3.4 2.7c-.5.4-1.2 0-1.2-.6v-2.5a5.2 5.2 0 0 1-.9-2.9v-2Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
      fill={active ? color : 'none'}
      fillOpacity={active ? 0.18 : 0}
    />
    <Circle cx={9.4} cy={11.4} r={1.05} fill={color} />
    <Circle cx={12.6} cy={11.4} r={1.05} fill={color} />
    <Circle cx={15.8} cy={11.4} r={1.05} fill={color} />
  </Icon>
);

/** Profile — bust silhouette. */
export const ProfileIcon = ({ color = '#fff', size = 24, active = false }) => (
  <Icon size={size}>
    <Circle
      cx={12}
      cy={8.4}
      r={3.5}
      stroke={color}
      strokeWidth={1.7}
      fill={active ? color : 'none'}
      fillOpacity={active ? 0.2 : 0}
    />
    <Path
      d="M5.4 19.4c0-3.2 2.9-5.4 6.6-5.4s6.6 2.2 6.6 5.4"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      fill="none"
    />
  </Icon>
);

/** Settings gear. */
export const GearIcon = ({ color = '#fff', size = 22 }) => (
  <Icon size={size}>
    <Circle cx={12} cy={12} r={3.1} stroke={color} strokeWidth={1.7} fill="none" />
    <Path
      d="M12 3.6l1.2 2.1 2.4-.4.5 2.4 2.1 1.2-1.3 2 1.3 2-2.1 1.2-.5 2.4-2.4-.4L12 20.4l-1.2-2.1-2.4.4-.5-2.4-2.1-1.2 1.3-2-1.3-2 2.1-1.2.5-2.4 2.4.4L12 3.6Z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
      fill="none"
    />
  </Icon>
);

/**
 * The 1D mark: a single degree of separation drawn literally — you at the
 * centre, one ring of connections, spokes fanning out to the right.
 */
export const BrandMark = ({ color = '#2DD4BF', size = 44, background = null }) => {
  const spokes = [-52, -26, 0, 26, 52];

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {background ? <Rect x={0} y={0} width={48} height={48} rx={12} fill={background} /> : null}

      {/* Fanned connections */}
      <G stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.9}>
        {spokes.map((degrees) => {
          const radians = (degrees * Math.PI) / 180;
          return (
            <Line
              key={degrees}
              x1={22}
              y1={24}
              x2={22 + 15 * Math.cos(radians)}
              y2={24 + 15 * Math.sin(radians)}
            />
          );
        })}
      </G>

      {spokes.map((degrees) => {
        const radians = (degrees * Math.PI) / 180;
        return (
          <Circle
            key={`dot-${degrees}`}
            cx={22 + 15 * Math.cos(radians)}
            cy={24 + 15 * Math.sin(radians)}
            r={2.6}
            fill={color}
          />
        );
      })}

      {/* You */}
      <Circle cx={22} cy={24} r={6.4} fill={color} />
    </Svg>
  );
};
