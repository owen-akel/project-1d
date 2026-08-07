import React from 'react';
import Svg, { Circle, Line, Path, Rect, Polygon } from 'react-native-svg';

/**
 * Category icons for events.
 *
 * These live at 18–24px on map pins and event cards, which rules out fine line
 * art — an earlier pass drew a theatre curtain as three thin strokes and it
 * read as a "π". The rule here is one recognisable silhouette per icon, solid
 * fills over outlines, and nothing that needs more than a glance.
 */

const Frame = ({ size, children }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {children}
  </Svg>
);

const bold = (color, width = 2) => ({
  stroke: color,
  strokeWidth: width,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
});

/* ---------------------------------------------------------------- music --- */

/** Music — a filled eighth note. */
const MusicNote = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M10.5 17V6l8-1.7v10.4" {...bold(c, 2)} />
    <Circle cx={8} cy={17.4} r={3} fill={c} />
    <Circle cx={16} cy={15.7} r={3} fill={c} />
  </Frame>
);

/**
 * Gigs — headphones. A guitar pick was the first attempt and it read as a map
 * pin once it sat inside a circular marker, which is the one thing it must not
 * look like here.
 */
const Headphones = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M4.4 15.2v-2.8a7.6 7.6 0 0 1 15.2 0v2.8" {...bold(c, 2.2)} />
    <Rect x={2.6} y={13.6} width={4.6} height={7} rx={2.3} fill={c} />
    <Rect x={16.8} y={13.6} width={4.6} height={7} rx={2.3} fill={c} />
  </Frame>
);

/** Comedy — a mic. */
const Microphone = ({ c, s }) => (
  <Frame size={s}>
    <Rect x={9} y={2.6} width={6} height={10.4} rx={3} fill={c} />
    <Path d="M5.6 11a6.4 6.4 0 0 0 12.8 0" {...bold(c)} />
    <Path d="M12 17.4V21M8.6 21h6.8" {...bold(c)} />
  </Frame>
);

/* --------------------------------------------------------------- stage ---- */

/**
 * Theatre — a single filled mask. Two overlapping outlined masks turned to
 * mush at this size, so this is one shape with cut-out features.
 */
const Mask = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M4 4.6h16v7.1c0 4.7-3.6 8.5-8 8.5s-8-3.8-8-8.5V4.6Z" fill={c} />
    <Circle cx={9} cy={10.4} r={1.5} fill="#000" opacity={0.55} />
    <Circle cx={15} cy={10.4} r={1.5} fill="#000" opacity={0.55} />
    <Path d="M8.8 14.6c1.9 1.7 4.5 1.7 6.4 0" stroke="#000" strokeOpacity={0.55} strokeWidth={1.8} strokeLinecap="round" fill="none" />
  </Frame>
);

/** Dance — a figure mid-step. */
const Dancer = ({ c, s }) => (
  <Frame size={s}>
    <Circle cx={14} cy={4.6} r={2.6} fill={c} />
    <Path d="M13.8 8.2 11 13.2l3.6 2.4L13 21" {...bold(c, 2.1)} />
    <Path d="M11 13.2 6 15.4M14.6 15.6 19.4 12.4" {...bold(c, 2.1)} />
  </Frame>
);

/** Family — a balloon. */
const Balloon = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M12 2.6c3.4 0 6 2.9 6 6.4 0 3.6-3.4 6.6-6 6.6s-6-3-6-6.6c0-3.5 2.6-6.4 6-6.4Z" fill={c} />
    <Path d="M12 15.6v1.6c0 1.8-1.8 1.6-1.8 3.4" {...bold(c, 1.8)} />
  </Frame>
);

/* --------------------------------------------------------------- sport ---- */

const Basketball = ({ c, s }) => (
  <Frame size={s}>
    <Circle cx={12} cy={12} r={8.4} {...bold(c, 2)} />
    <Path d="M12 3.6v16.8M3.6 12h16.8" {...bold(c, 1.6)} />
    <Path d="M6.4 6.4c3.2 3.2 3.2 8 0 11.2M17.6 6.4c-3.2 3.2-3.2 8 0 11.2" {...bold(c, 1.6)} />
  </Frame>
);

const Baseball = ({ c, s }) => (
  <Frame size={s}>
    <Circle cx={12} cy={12} r={8.4} {...bold(c, 2)} />
    <Path d="M6.8 6.2c2.2 2.6 2.2 9 0 11.6M17.2 6.2c-2.2 2.6-2.2 9 0 11.6" {...bold(c, 1.7)} />
  </Frame>
);

const Soccer = ({ c, s }) => (
  <Frame size={s}>
    <Circle cx={12} cy={12} r={8.4} {...bold(c, 2)} />
    <Polygon points="12,7 15.8,9.8 14.4,14.2 9.6,14.2 8.2,9.8" fill={c} />
  </Frame>
);

const Hockey = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M4.6 3.8 13.6 16h4.2" {...bold(c, 2.2)} />
    <Rect x={14.8} y={16.6} width={7} height={3.8} rx={1.9} fill={c} />
  </Frame>
);

/** Generic sport. */
const Ball = ({ c, s }) => (
  <Frame size={s}>
    <Circle cx={12} cy={12} r={8.4} {...bold(c, 2)} />
    <Path d="M4.2 9.2c4.6 1.8 11 1.8 15.6 0M4.2 14.8c4.6-1.8 11-1.8 15.6 0" {...bold(c, 1.6)} />
  </Frame>
);

/* -------------------------------------------------------------- others ---- */

const Clapperboard = ({ c, s }) => (
  <Frame size={s}>
    <Rect x={3} y={10} width={18} height={10} rx={2} fill={c} />
    <Path d="M3.4 9.6 5.6 5l16.6 1.4-.5 3.2H3.4Z" fill={c} />
    <Path d="m10 5.4-1.4 4M15.4 5.9 14 9.6" stroke="#000" strokeOpacity={0.5} strokeWidth={1.6} strokeLinecap="round" />
  </Frame>
);

const Palette = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M12 3.4c5 0 8.8 3.4 8.8 7.8 0 2.6-2.1 3.8-3.7 3.8h-1.6c-1.2 0-2 .8-2 1.8 0 .5.2.9.4 1.3.2.3.3.7.3 1 0 1-.9 1.5-2.2 1.5-4.9 0-8.8-3.9-8.8-8.8S7.1 3.4 12 3.4Z" {...bold(c, 2)} />
    <Circle cx={8.4} cy={9.6} r={1.5} fill={c} />
    <Circle cx={12.6} cy={7.6} r={1.5} fill={c} />
    <Circle cx={16.4} cy={10} r={1.5} fill={c} />
  </Frame>
);

const Cutlery = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M6.8 3v6.4M4.4 3v3.6c0 1.4 1 2.4 2.4 2.4s2.4-1 2.4-2.4V3M6.8 9.4V21" {...bold(c, 2)} />
    <Path d="M16.8 21v-7.6c-1.6 0-2.8-1.1-2.8-2.8 0-3.2 1.7-7 3.8-7s3.8 3.8 3.8 7c0 1.7-1.2 2.8-2.8 2.8V21" {...bold(c, 2)} />
  </Frame>
);

const Glass = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M5.2 4h13.6L12 12 5.2 4Z" fill={c} />
    <Path d="M12 12v8M8.2 20h7.6" {...bold(c, 2)} />
  </Frame>
);

const GolfFlag = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M8.4 3.4v17" {...bold(c, 2.2)} />
    <Path d="M8.4 3.8 17.6 7l-9.2 3.2V3.8Z" fill={c} />
    <Path d="M4.4 20.4c2.2 1.1 13 1.1 15.2 0" {...bold(c, 1.8)} />
  </Frame>
);

const Barbell = ({ c, s }) => (
  <Frame size={s}>
    <Line x1={7} y1={12} x2={17} y2={12} {...bold(c, 2.4)} />
    <Rect x={2.8} y={7.4} width={4} height={9.2} rx={1.6} fill={c} />
    <Rect x={17.2} y={7.4} width={4} height={9.2} rx={1.6} fill={c} />
  </Frame>
);

const Runner = ({ c, s }) => (
  <Frame size={s}>
    <Circle cx={15} cy={4.6} r={2.6} fill={c} />
    <Path d="M6 20.6 9.8 15.2l2.4-3 1.9 3.6L16.8 20.6" {...bold(c, 2.1)} />
    <Path d="m10.2 10.8 4.4-2 3.5 2.3 2.5-.4" {...bold(c, 2.1)} />
  </Frame>
);

const Mountains = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M2.2 19.4 9 7.6l4.4 7.4L15.6 11l6.2 8.4H2.2Z" fill={c} />
    <Circle cx={17.8} cy={5.6} r={2.2} fill={c} />
  </Frame>
);

const Book = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M12 6.6C10.1 5.1 7.6 4.6 4.4 4.9v12.8c3.2-.3 5.7.2 7.6 1.7 1.9-1.5 4.4-2 7.6-1.7V4.9c-3.2-.3-5.7.2-7.6 1.7Z" {...bold(c, 2)} />
    <Line x1={12} y1={6.6} x2={12} y2={19.4} {...bold(c, 1.7)} />
  </Frame>
);

const People = ({ c, s }) => (
  <Frame size={s}>
    <Circle cx={12} cy={6.6} r={3} fill={c} />
    <Circle cx={4.8} cy={13.6} r={2.4} fill={c} />
    <Circle cx={19.2} cy={13.6} r={2.4} fill={c} />
    <Path d="M7.4 20c1.1-2.4 2.7-3.6 4.6-3.6s3.5 1.2 4.6 3.6" {...bold(c, 2)} />
  </Frame>
);

const Camera = ({ c, s }) => (
  <Frame size={s}>
    <Rect x={2.6} y={6.6} width={18.8} height={13.4} rx={2.8} {...bold(c, 2)} />
    <Path d="M8.4 6.6 9.8 3.8h4.4l1.4 2.8" {...bold(c, 2)} />
    <Circle cx={12} cy={13.4} r={3.8} fill={c} />
  </Frame>
);

/** Fallback — a ticket, which at least says "event". */
const Ticket = ({ c, s }) => (
  <Frame size={s}>
    <Path d="M3.4 6.6h17.2v3.2a2.2 2.2 0 0 0 0 4.4v3.2H3.4v-3.2a2.2 2.2 0 0 0 0-4.4V6.6Z" {...bold(c, 2)} />
    <Path d="M13.6 8.6v6.8" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeDasharray="2 2.4" />
  </Frame>
);

/* ------------------------------------------------------------ resolution -- */

const DRAWINGS = {
  music: MusicNote,
  gig: Headphones,
  standup: Microphone,
  stage: Mask,
  dance: Dancer,
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
  default: Ticket,
};

// Genre wins over segment: Ticketmaster files nearly every listing in a city
// under one or two segments, so the segment alone gives a whole map one icon.
const GENRE_RULES = [
  [/rock|pop|metal|indie|alternative|hip.?hop|rap|country|punk|folk|r&b|electronic|dance music/i, 'gig'],
  [/classical|opera|orchestra|symphony|jazz|blues/i, 'music'],
  [/comedy|stand.?up/i, 'standup'],
  // Ahead of the stage rules: "Children's Theatre" is family, not drama.
  [/children|family|puppet/i, 'family'],
  [/dance|ballet/i, 'dance'],
  [/musical|theat|play|drama|broadway/i, 'stage'],
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
  [/sport|athletic/i, 'sports'],
  [/music|concert/i, 'music'],
];

const TYPE_ALIASES = {
  music: 'music',
  'music-festival': 'gig',
  concerts: 'gig',
  comedy: 'standup',
  theater: 'stage',
  theatre: 'stage',
  festivals: 'stage',
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
  // "Arts & Theatre" swallow everything filed under it, so a Dance or Fine Art
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
