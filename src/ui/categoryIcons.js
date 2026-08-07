import React from 'react';
import Svg, { Circle, Line, Path, Rect, G, Polyline } from 'react-native-svg';

/**
 * Drawn icons for event categories, replacing the emoji that used to stand in
 * for them. Emoji render as full-colour Apple glyphs that ignore the palette
 * and look different on every platform; these take a colour and sit on the
 * same 24x24 grid as the rest of the iconography.
 */

const Frame = ({ size, children }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {children}
  </Svg>
);

const stroke = (color, width = 1.7) => ({
  stroke: color,
  strokeWidth: width,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
});

/** Music — a beamed pair of notes. */
const Music = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M9 17.5V6.2l9-1.7v11.2" {...stroke(c)} />
    <Circle cx={7} cy={17.6} r={2.4} fill={c} />
    <Circle cx={16} cy={15.9} r={2.4} fill={c} />
  </Frame>
);

/** Comedy — a grinning mask. */
const Comedy = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M4.6 6.5h14.8v6.2c0 4.2-3.3 7.6-7.4 7.6s-7.4-3.4-7.4-7.6V6.5Z" {...stroke(c)} />
    <Circle cx={9.2} cy={11.4} r={1.1} fill={c} />
    <Circle cx={14.8} cy={11.4} r={1.1} fill={c} />
    <Path d="M9 15.2c1.8 1.5 4.2 1.5 6 0" {...stroke(c, 1.6)} />
  </Frame>
);

/** Sports — a ball with seams. */
const Sports = ({ c, s }) => (
  <Frame size={s}>
    <Circle cx={12} cy={12} r={8} {...stroke(c)} />
    <Path d="M4.6 9.2c4 1.4 10.8 1.4 14.8 0M4.6 14.8c4-1.4 10.8-1.4 14.8 0" {...stroke(c, 1.4)} />
    <Path d="M12 4v16" {...stroke(c, 1.4)} />
  </Frame>
);

/** Theater — curtain and stage. */
const Theater = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M4 4h16M6.5 4c0 6 -1 9 -2.5 11.5M17.5 4c0 6 1 9 2.5 11.5" {...stroke(c)} />
    <Path d="M9.5 4c0 8 -1.2 12 -3 16M14.5 4c0 8 1.2 12 3 16" {...stroke(c, 1.4)} />
  </Frame>
);

/** Golf — flag in a hole. */
const Golf = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M8.5 19V4l8 3.2-8 3.2" {...stroke(c)} />
    <Path d="M5 19.4c1.8.9 12.2.9 14 0" {...stroke(c, 1.5)} />
  </Frame>
);

/** Lifting — a barbell. */
const Lifting = ({ c, s }) => (
  <Frame size={s}>
    <Line x1={7.5} y1={12} x2={16.5} y2={12} {...stroke(c, 2)} />
    <Rect x={4} y={8.5} width={3} height={7} rx={1.2} {...stroke(c)} />
    <Rect x={17} y={8.5} width={3} height={7} rx={1.2} {...stroke(c)} />
  </Frame>
);

/** Running — a figure mid-stride. */
const Running = ({ c, s }) => (
  <Frame size={s}>
    <Circle cx={14.5} cy={5.2} r={2.1} fill={c} />
    <Path d="M6.5 20l3.2-4.4 2.1-2.6 1.6 3.1L16 20" {...stroke(c)} />
    <Path d="M9.8 11.2 14 9.4l3.4 2.1 2.6-.4" {...stroke(c)} />
  </Frame>
);

/** Drinks — a stemmed glass. */
const Drinks = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M6.5 4h11l-5.5 7-5.5-7Z" {...stroke(c)} />
    <Path d="M12 11v8M8.5 19.6h7" {...stroke(c)} />
  </Frame>
);

/** Film — a strip of frames. */
const Film = ({ c, s }) => (
  <Frame size={s}>
    <Rect x={3.5} y={5.5} width={17} height={13} rx={2.4} {...stroke(c)} />
    <Path d="M8 5.5v13M16 5.5v13" {...stroke(c, 1.4)} />
    <Path d="M3.5 12h17" {...stroke(c, 1.4)} />
  </Frame>
);

/** Learning — an open book. */
const Learning = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M12 6.8C10.3 5.5 8 5 4.8 5.2v12.4c3.2-.2 5.5.3 7.2 1.6 1.7-1.3 4-1.8 7.2-1.6V5.2C16 5 13.7 5.5 12 6.8Z" {...stroke(c)} />
    <Line x1={12} y1={6.8} x2={12} y2={19.2} {...stroke(c, 1.4)} />
  </Frame>
);

/** Outdoors — peaks. */
const Outdoors = ({ c, s }) => (
  <Frame size={s}>
    <Polyline points="2.8,18.8 9,8.2 13.2,15 15.4,11.4 21.2,18.8" {...stroke(c)} />
    <Circle cx={17.4} cy={6.4} r={2} fill={c} />
  </Frame>
);

/** Social — three linked people. */
const Social = ({ c, s }) => (
  <Frame size={s}>
    <Circle cx={12} cy={7.4} r={2.6} {...stroke(c)} />
    <Circle cx={5.4} cy={14.6} r={2.2} {...stroke(c)} />
    <Circle cx={18.6} cy={14.6} r={2.2} {...stroke(c)} />
    <Path d="M8.6 19.4c.8-1.7 2-2.6 3.4-2.6s2.6.9 3.4 2.6" {...stroke(c, 1.5)} />
  </Frame>
);

/** Creative — a camera aperture. */
const Creative = ({ c, s }) => (
  <Frame size={s}>
    <Rect x={3} y={7} width={18} height={12.5} rx={2.6} {...stroke(c)} />
    <Path d="M8.8 7l1.4-2.6h3.6L15.2 7" {...stroke(c)} />
    <Circle cx={12} cy={13.4} r={3.4} {...stroke(c)} />
  </Frame>
);

/** Food — plate and cutlery. */
const Food = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M6.5 3.6v7.2M4.4 3.6v3.6c0 1.2.9 2.2 2.1 2.2s2.1-1 2.1-2.2V3.6M6.5 10.8V20.4" {...stroke(c, 1.5)} />
    <Path d="M16.4 20.4v-7.6c-1.5 0-2.5-1-2.5-2.6 0-3 1.5-6.6 3.6-6.6s3.6 3.6 3.6 6.6c0 1.6-1 2.6-2.5 2.6v7.6" {...stroke(c, 1.5)} />
  </Frame>
);

/** Fallback — a calendar. */
const Calendar = ({ c, s }) => (
  <Frame size={s}>
    <Rect x={3.6} y={5.4} width={16.8} height={14.2} rx={2.6} {...stroke(c)} />
    <Path d="M3.6 10h16.8M8.4 3.6v3.4M15.6 3.6v3.4" {...stroke(c)} />
  </Frame>
);

/** Every event type the app produces, mapped to a drawing. */
const BY_TYPE = {
  music: Music,
  'music-festival': Music,
  concerts: Music,
  comedy: Comedy,
  sports: Sports,
  golf: Golf,
  lifting: Lifting,
  fitness: Lifting,
  running: Running,
  theater: Theater,
  festivals: Theater,
  beer: Drinks,
  drinking: Drinks,
  movies: Film,
  academic: Learning,
  outdoor: Outdoors,
  social: Social,
  creative: Creative,
  art: Creative,
  food: Food,
};

export function getCategoryIcon(type) {
  return BY_TYPE[String(type || '').toLowerCase()] || Calendar;
}

/** Renders the icon for an event type. */
export default function CategoryIcon({ type, color = '#fff', size = 22 }) {
  const Drawing = getCategoryIcon(type);
  return <Drawing c={color} s={size} />;
}
