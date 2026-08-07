import React from 'react';
import Svg, { Circle, Line, Path, Rect, Polyline, Ellipse } from 'react-native-svg';

/**
 * Drawn icons for event categories — the job the emoji used to do, without
 * being stock Apple glyphs that ignore the palette and shift between platforms.
 *
 * Ticketmaster collapses almost everything into a handful of segments, so
 * `type` alone puts most of a city's events on the same icon. `resolveCategory`
 * reads the genre first, which is where the useful detail lives (Musical, Rock,
 * Basketball, Film…), and only falls back to the broader segment.
 *
 * Everything is drawn on a 24x24 grid and kept simple enough to read at 18px.
 */

const Frame = ({ size, children }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {children}
  </Svg>
);

const line = (color, width = 1.8) => ({
  stroke: color,
  strokeWidth: width,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
});

/* ---------------------------------------------------------------- music --- */

const MusicNote = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M10 18V5.5l8-1.6V16" {...line(c)} />
    <Circle cx={7.6} cy={18.1} r={2.6} fill={c} />
    <Circle cx={15.6} cy={16.5} r={2.6} fill={c} />
  </Frame>
);

const Microphone = ({ c, s }) => (
  <Frame size={s}>
    <Rect x={9.4} y={2.8} width={5.2} height={10} rx={2.6} {...line(c)} />
    <Path d="M6 11.2a6 6 0 0 0 12 0" {...line(c)} />
    <Path d="M12 17.2V21M9 21h6" {...line(c)} />
  </Frame>
);

const Guitar = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M17.5 3.2 21 6.7l-2.6 2.2-2.9-2.9 2-2.8Z" {...line(c, 1.6)} />
    <Path d="M15.5 6 10 11.5" {...line(c, 1.6)} />
    <Ellipse cx={7.6} cy={15.4} rx={5.2} ry={4.6} {...line(c)} />
    <Circle cx={7.6} cy={15.4} r={1.7} fill={c} />
  </Frame>
);

/* --------------------------------------------------------------- stage ---- */

/** Theatre — the classic paired masks. */
const Masks = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M3 5.5h8.5v5.2c0 2.9-1.9 5.2-4.25 5.2S3 13.6 3 10.7V5.5Z" {...line(c, 1.6)} />
    <Path d="M12.5 8h8.5v5.2c0 2.9-1.9 5.2-4.25 5.2s-4.25-2.3-4.25-5.2V8Z" {...line(c, 1.6)} />
    <Path d="M5.6 12.3c.9.8 2.1.8 3 0" {...line(c, 1.4)} />
    <Path d="M15.1 13.6c.9.8 2.1.8 3 0" {...line(c, 1.4)} />
  </Frame>
);

/** Play / drama — a curtained stage. */
const Curtain = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M3 4h18" {...line(c)} />
    <Path d="M6 4c0 7-1 11-3 15M18 4c0 7 1 11 3 15" {...line(c, 1.6)} />
    <Path d="M10 4c0 8-.6 12-1.6 15M14 4c0 8 .6 12 1.6 15" {...line(c, 1.4)} />
  </Frame>
);

/** Dance — a figure mid-step. */
const Dance = ({ c, s }) => (
  <Frame size={s}>
    <Circle cx={13.6} cy={4.6} r={2.1} fill={c} />
    <Path d="M13.4 8.4 11 13l3.4 2.2L13 21" {...line(c)} />
    <Path d="M11 13 6.4 15M14.4 15.2 19 12.4" {...line(c)} />
  </Frame>
);

/** Family / children — a balloon. */
const Balloon = ({ c, s }) => (
  <Frame size={s}>
    <Ellipse cx={12} cy={9} rx={5.6} ry={6.4} {...line(c)} />
    <Path d="M12 15.4v1.8M12 17.2c0 1.6-1.6 1.6-1.6 3.2" {...line(c, 1.5)} />
  </Frame>
);

/* --------------------------------------------------------------- sport ---- */

const Basketball = ({ c, s }) => (
  <Frame size={s}>
    <Circle cx={12} cy={12} r={8.2} {...line(c)} />
    <Path d="M12 3.8v16.4M3.8 12h16.4" {...line(c, 1.4)} />
    <Path d="M6.2 6.2c3.4 3.4 3.4 8.2 0 11.6M17.8 6.2c-3.4 3.4-3.4 8.2 0 11.6" {...line(c, 1.4)} />
  </Frame>
);

const Baseball = ({ c, s }) => (
  <Frame size={s}>
    <Circle cx={12} cy={12} r={8.2} {...line(c)} />
    <Path d="M6.6 6.2c2 2.4 2 9.2 0 11.6M17.4 6.2c-2 2.4-2 9.2 0 11.6" {...line(c, 1.4)} />
  </Frame>
);

const Soccer = ({ c, s }) => (
  <Frame size={s}>
    <Circle cx={12} cy={12} r={8.2} {...line(c)} />
    <Path d="m12 7.4 3.6 2.6-1.4 4.3h-4.4L8.4 10 12 7.4Z" {...line(c, 1.4)} />
    <Path d="M12 3.8v3.6M4.4 9.6 8.4 10M19.6 9.6 15.6 10M7.6 19l2.2-4.7M16.4 19l-2.2-4.7" {...line(c, 1.2)} />
  </Frame>
);

const Hockey = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M5 4.5 13.5 16h4.8" {...line(c)} />
    <Ellipse cx={18.4} cy={18.4} rx={3.4} ry={1.9} {...line(c)} />
  </Frame>
);

/** Generic sport — a ball with seams. */
const Ball = ({ c, s }) => (
  <Frame size={s}>
    <Circle cx={12} cy={12} r={8.2} {...line(c)} />
    <Path d="M4.4 9.4c4.4 1.6 10.8 1.6 15.2 0M4.4 14.6c4.4-1.6 10.8-1.6 15.2 0" {...line(c, 1.4)} />
  </Frame>
);

/* -------------------------------------------------------------- others ---- */

const Clapperboard = ({ c, s }) => (
  <Frame size={s}>
    <Rect x={3} y={9.4} width={18} height={10.6} rx={2} {...line(c)} />
    <Path d="M3.6 9.4 6 4.6l17.4 1.2-.6 3.6" {...line(c, 1.5)} />
    <Path d="m9.4 4.9-1.6 4.3M14.8 5.3l-1.6 4.1" {...line(c, 1.4)} />
  </Frame>
);

const Palette = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M12 3.6c4.9 0 8.6 3.4 8.6 7.6 0 2.6-2 3.7-3.6 3.7h-1.6c-1.2 0-2 .8-2 1.8 0 .5.2.9.4 1.3.3.4.4.8.4 1.2 0 1-.9 1.6-2.2 1.6-4.8 0-8.6-3.8-8.6-8.6S7.2 3.6 12 3.6Z" {...line(c, 1.6)} />
    <Circle cx={8.4} cy={9.4} r={1.2} fill={c} />
    <Circle cx={12.6} cy={7.6} r={1.2} fill={c} />
    <Circle cx={16.4} cy={9.8} r={1.2} fill={c} />
  </Frame>
);

const Cutlery = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M7 3.4v6.2M4.8 3.4v3.4c0 1.2.9 2.2 2.2 2.2s2.2-1 2.2-2.2V3.4M7 9.6V20.6" {...line(c, 1.6)} />
    <Path d="M16.6 20.6v-7.4c-1.5 0-2.6-1-2.6-2.6 0-3 1.6-6.6 3.6-6.6s3.6 3.6 3.6 6.6c0 1.6-1 2.6-2.6 2.6v7.4" {...line(c, 1.6)} />
  </Frame>
);

const Glass = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M6 4h12l-6 7.4L6 4Z" {...line(c)} />
    <Path d="M12 11.4V20M8.6 20h6.8" {...line(c)} />
  </Frame>
);

const GolfFlag = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M8.4 19.6V3.6l8.4 3.4-8.4 3.4" {...line(c)} />
    <Path d="M4.6 19.8c2 1 12.8 1 14.8 0" {...line(c, 1.5)} />
  </Frame>
);

const Barbell = ({ c, s }) => (
  <Frame size={s}>
    <Line x1={7} y1={12} x2={17} y2={12} {...line(c, 2.2)} />
    <Rect x={3.2} y={8} width={3.4} height={8} rx={1.3} {...line(c)} />
    <Rect x={17.4} y={8} width={3.4} height={8} rx={1.3} {...line(c)} />
  </Frame>
);

const Runner = ({ c, s }) => (
  <Frame size={s}>
    <Circle cx={14.8} cy={4.8} r={2.2} fill={c} />
    <Path d="M6.4 20.4 10 15.4l2.2-2.8 1.8 3.4L16.6 20.4" {...line(c)} />
    <Path d="m10.2 11 4.2-1.8 3.4 2.2 2.6-.4" {...line(c)} />
  </Frame>
);

const Mountains = ({ c, s }) => (
  <Frame size={s}>
    <Polyline points="2.6,19 9,8 13.4,15.2 15.6,11.4 21.4,19" {...line(c)} />
    <Circle cx={17.6} cy={6} r={2} fill={c} />
  </Frame>
);

const Book = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M12 6.6C10.2 5.2 7.8 4.7 4.6 5v12.6c3.2-.3 5.6.2 7.4 1.6 1.8-1.4 4.2-1.9 7.4-1.6V5c-3.2-.3-5.6.2-7.4 1.6Z" {...line(c)} />
    <Line x1={12} y1={6.6} x2={12} y2={19.2} {...line(c, 1.4)} />
  </Frame>
);

const People = ({ c, s }) => (
  <Frame size={s}>
    <Circle cx={12} cy={7} r={2.8} {...line(c)} />
    <Circle cx={5} cy={14.4} r={2.2} {...line(c)} />
    <Circle cx={19} cy={14.4} r={2.2} {...line(c)} />
    <Path d="M8.4 19.6c.9-1.9 2.1-2.8 3.6-2.8s2.7.9 3.6 2.8" {...line(c, 1.5)} />
  </Frame>
);

const Camera = ({ c, s }) => (
  <Frame size={s}>
    <Rect x={2.8} y={6.8} width={18.4} height={13} rx={2.6} {...line(c)} />
    <Path d="M8.6 6.8 10 4.2h4l1.4 2.6" {...line(c)} />
    <Circle cx={12} cy={13.4} r={3.6} {...line(c)} />
  </Frame>
);

const CalendarIcon = ({ c, s }) => (
  <Frame size={s}>
    <Rect x={3.4} y={5.4} width={17.2} height={14.4} rx={2.6} {...line(c)} />
    <Path d="M3.4 10.2h17.2M8.4 3.4v3.6M15.6 3.4v3.6" {...line(c)} />
  </Frame>
);

/* ------------------------------------------------------------ resolution -- */

const DRAWINGS = {
  music: MusicNote,
  rock: Guitar,
  standup: Microphone,
  theatre: Masks,
  play: Curtain,
  dance: Dance,
  family: Balloon,
  basketball: Basketball,
  baseball: Baseball,
  soccer: Soccer,
  hockey: Hockey,
  sports: Ball,
  film: Clapperboard,
  art: Palette,
  food: Cutlery,
  drinks: Glass,
  golf: GolfFlag,
  lifting: Barbell,
  running: Runner,
  outdoor: Mountains,
  academic: Book,
  social: People,
  creative: Camera,
  default: CalendarIcon,
};

// Genre wins over segment: Ticketmaster files nearly every NY listing under
// "Arts & Theatre", so the segment alone would give a whole city one icon.
const GENRE_RULES = [
  [/rock|pop|metal|indie|alternative|hip.?hop|rap|country|jazz|blues|r&b|electronic|dance music/i, 'rock'],
  [/classical|opera|orchestra/i, 'music'],
  [/comedy|stand.?up/i, 'standup'],
  // Before the theatre rules: "Children's Theatre" is family, not drama.
  [/children|family|puppet/i, 'family'],
  [/musical/i, 'theatre'],
  [/dance|ballet/i, 'dance'],
  [/theat|play|drama/i, 'play'],
  [/basketball/i, 'basketball'],
  [/baseball/i, 'baseball'],
  [/soccer|football/i, 'soccer'],
  [/hockey/i, 'hockey'],
  [/film|movie|cinema/i, 'film'],
  [/art|museum|exhibit|craft/i, 'art'],
  [/food|culinary|dining|taste/i, 'food'],
  [/beer|wine|spirits|brew/i, 'drinks'],
  [/golf/i, 'golf'],
  [/running|marathon|race/i, 'running'],
];

const TYPE_ALIASES = {
  music: 'music',
  'music-festival': 'music',
  concerts: 'music',
  comedy: 'standup',
  theater: 'theatre',
  theatre: 'theatre',
  festivals: 'theatre',
  sports: 'sports',
  golf: 'golf',
  lifting: 'lifting',
  fitness: 'lifting',
  running: 'running',
  beer: 'drinks',
  drinking: 'drinks',
  movies: 'film',
  academic: 'academic',
  outdoor: 'outdoor',
  social: 'social',
  creative: 'creative',
  art: 'art',
  food: 'food',
};

/** Best category for an event, reading genre before falling back to type. */
export function resolveCategory(event) {
  if (!event) return 'default';

  // Genre on its own first. Matching genre and segment together would let
  // "Arts & Theatre" swallow everything filed under it — a Dance or Fine Art
  // listing would come back as drama.
  const byGenre = GENRE_RULES.find(([pattern]) => pattern.test(event.genre || ''));
  if (byGenre) return byGenre[1];

  const byType = TYPE_ALIASES[String(event.type || '').toLowerCase()];
  if (byType) return byType;

  const bySegment = GENRE_RULES.find(([pattern]) => pattern.test(event.segment || ''));
  return bySegment ? bySegment[1] : 'default';
}

/**
 * Pass a whole `event` so the genre can be considered. A bare `type` string
 * still works for callers that only have that.
 */
export default function CategoryIcon({ event, type, color = '#fff', size = 22 }) {
  const category = resolveCategory(event || { type });
  const Drawing = DRAWINGS[category] || DRAWINGS.default;
  return <Drawing c={color} s={size} />;
}
