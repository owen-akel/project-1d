import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, G, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { getInitials } from './Avatar';

const TAU = Math.PI * 2;

const INNER_RING = 0.27;
const OUTER_RING = 0.42;

// Focused mode: the friend takes the centre, their own connections orbit at
// this radius, and the fan avoids the direction "you" sits in.
const PEER_RADIUS = 0.31;
const PEER_FAN = Math.PI * 1.5;
const MAX_PEERS = 10;
const MAX_DOTS_PER_FRIEND = 5;

/** Distance from the centre of a square to its edge along `angle`. */
const distanceToEdge = (angle, half) => {
  const cos = Math.abs(Math.cos(angle));
  const sin = Math.abs(Math.sin(angle));
  return Math.min(cos < 1e-6 ? Infinity : half / cos, sin < 1e-6 ? Infinity : half / sin);
};

/**
 * Radial view of the user's network.
 *
 * Overview: you at the centre, direct friends on the inner ring, their own
 * connections sampled onto the outer ring.
 *
 * Focused (`focusedFriendId` set): that friend becomes the new centre of the
 * canvas and their connections spread around them. "You" is pulled out along
 * the angle the friend originally occupied and parked on the canvas edge — half
 * off-screen — so the pair sits close together and the web keeps its bearing.
 *
 * `highlightedIds` emphasises matching nodes (direct or second degree) and dims
 * the rest; leave it empty for no emphasis.
 *
 * friends: [{ id, name, city, secondDegreeCount, peers: [{ id, name, city }] }]
 */
export default function ConnectionWeb({
  friends = [],
  size = 300,
  maxFriends = 14,
  focusedFriendId = null,
  highlightedIds = null,
  onFocusFriend,
  onOpenProfile,
  centerLabel = 'You',
}) {
  const { colors } = useTheme();

  const shown = useMemo(() => friends.slice(0, maxFriends), [friends, maxFriends]);
  const overflow = Math.max(0, friends.length - shown.length);

  const cx = size / 2;
  const cy = size / 2;

  const hasHighlight = Boolean(highlightedIds && highlightedIds.size > 0);
  const isLit = (id) => !hasHighlight || highlightedIds.has(id);

  // A friend's angle is fixed by its slot in the ring, and focused mode reuses
  // it, so nothing appears to jump between the two states.
  const angles = useMemo(() => {
    const map = new Map();
    shown.forEach((friend, index) => {
      map.set(friend.id, -Math.PI / 2 + (index / Math.max(shown.length, 1)) * TAU);
    });
    return map;
  }, [shown]);

  const overview = useMemo(() => {
    const innerRadius = size * INNER_RING;
    const outerRadius = size * OUTER_RING;

    return shown.map((friend) => {
      const angle = angles.get(friend.id);
      const x = cx + innerRadius * Math.cos(angle);
      const y = cy + innerRadius * Math.sin(angle);

      const peers = (friend.peers || []).slice(0, MAX_DOTS_PER_FRIEND);
      const spread = (TAU / Math.max(shown.length, 1)) * 0.72;
      const dots = peers.map((peer, index) => {
        const offset = peers.length === 1 ? 0 : (index / (peers.length - 1) - 0.5) * spread;
        const dotAngle = angle + offset;
        return {
          peer,
          x: cx + outerRadius * Math.cos(dotAngle),
          y: cy + outerRadius * Math.sin(dotAngle),
        };
      });

      return { friend, x, y, angle, dots };
    });
  }, [shown, angles, size, cx, cy]);

  const focused = useMemo(() => {
    if (!focusedFriendId) return null;
    const friend = shown.find((item) => item.id === focusedFriendId);
    if (!friend) return null;

    const angle = angles.get(friend.id) ?? -Math.PI / 2;
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);

    // The friend owns the centre; "you" sits on the edge behind them, so its
    // bubble is half cut off and the two are close together.
    const friendPos = { x: cx, y: cy };
    const backAngle = angle + Math.PI;
    const edge = distanceToEdge(backAngle, size / 2);
    const youPos = { x: cx - dirX * edge, y: cy - dirY * edge };

    const visiblePeers = (friend.peers || []).slice(0, MAX_PEERS);

    // Fan the peers away from "you" so nothing crowds the link between the pair.
    const peers = visiblePeers.map((peer, index) => {
      const offset =
        visiblePeers.length === 1 ? 0 : (index / (visiblePeers.length - 1) - 0.5) * PEER_FAN;
      const peerAngle = angle + offset;
      return {
        peer,
        x: friendPos.x + size * PEER_RADIUS * Math.cos(peerAngle),
        y: friendPos.y + size * PEER_RADIUS * Math.sin(peerAngle),
      };
    });

    // Ghost the rest of the ring around where "you" now is, preserving bearings.
    const ghosts = shown
      .filter((item) => item.id !== friend.id)
      .map((item) => {
        const ghostAngle = angles.get(item.id);
        return {
          id: item.id,
          x: youPos.x + size * INNER_RING * Math.cos(ghostAngle),
          y: youPos.y + size * INNER_RING * Math.sin(ghostAngle),
        };
      });

    return { friend, friendPos, youPos, peers, ghosts };
  }, [focusedFriendId, shown, angles, size, cx, cy]);

  return (
    <View style={{ width: size, height: size, alignSelf: 'center', overflow: 'hidden' }}>
      <Svg width={size} height={size}>
        {focused ? (
          <>
            {focused.ghosts.map((ghost) => (
              <G key={`ghost-${ghost.id}`} opacity={0.16}>
                <Line
                  x1={focused.youPos.x}
                  y1={focused.youPos.y}
                  x2={ghost.x}
                  y2={ghost.y}
                  stroke={colors.textTertiary}
                  strokeWidth={1}
                />
                <Circle cx={ghost.x} cy={ghost.y} r={9} fill={colors.textTertiary} />
              </G>
            ))}

            {focused.peers.map(({ peer, x, y }) => (
              <Line
                key={`peer-link-${peer.id}`}
                x1={focused.friendPos.x}
                y1={focused.friendPos.y}
                x2={x}
                y2={y}
                stroke={isLit(peer.id) ? colors.primary : colors.textTertiary}
                strokeWidth={1}
                opacity={isLit(peer.id) ? 0.55 : 0.25}
              />
            ))}

            <Line
              x1={focused.youPos.x}
              y1={focused.youPos.y}
              x2={focused.friendPos.x}
              y2={focused.friendPos.y}
              stroke={colors.primary}
              strokeWidth={2.5}
              opacity={0.8}
            />

            {focused.peers.map(({ peer, x, y }) => {
              const lit = isLit(peer.id);
              return (
                <G
                  key={`peer-${peer.id}`}
                  onPress={onOpenProfile ? () => onOpenProfile(peer.id) : undefined}
                  opacity={lit ? 1 : 0.35}
                >
                  <Circle
                    cx={x}
                    cy={y}
                    r={lit && hasHighlight ? 15 : 13}
                    fill={lit && hasHighlight ? colors.primaryMuted : colors.card}
                    stroke={lit && hasHighlight ? colors.primary : colors.borderStrong}
                    strokeWidth={1.5}
                  />
                  <SvgText
                    x={x}
                    y={y + 4}
                    fontSize={10}
                    fontWeight="700"
                    fill={lit && hasHighlight ? colors.primary : colors.textSecondary}
                    textAnchor="middle"
                  >
                    {getInitials(peer.name)}
                  </SvgText>
                </G>
              );
            })}

            <Circle
              cx={focused.youPos.x}
              cy={focused.youPos.y}
              r={30}
              fill={colors.primary}
              opacity={0.9}
            />
            <SvgText
              x={focused.youPos.x}
              y={focused.youPos.y + 5}
              fontSize={12}
              fontWeight="700"
              fill={colors.onPrimary}
              textAnchor="middle"
            >
              {centerLabel}
            </SvgText>

            <G onPress={onOpenProfile ? () => onOpenProfile(focused.friend.id) : undefined}>
              <Circle
                cx={focused.friendPos.x}
                cy={focused.friendPos.y}
                r={30}
                fill={colors.primary}
                stroke={colors.background}
                strokeWidth={3}
              />
              <SvgText
                x={focused.friendPos.x}
                y={focused.friendPos.y + 5}
                fontSize={14}
                fontWeight="700"
                fill={colors.onPrimary}
                textAnchor="middle"
              >
                {getInitials(focused.friend.name)}
              </SvgText>
            </G>

            {/* No overflow label here — "you" sits on the edge and would
                collide with it. The count lives in the card's subtitle. */}
          </>
        ) : (
          <>
            <Circle cx={cx} cy={cy} r={size * INNER_RING} stroke={colors.border} strokeWidth={1} fill="none" />
            <Circle
              cx={cx}
              cy={cy}
              r={size * OUTER_RING}
              stroke={colors.border}
              strokeWidth={1}
              fill="none"
              opacity={0.6}
            />

            {overview.map(({ friend, x, y, dots }) =>
              dots.map(({ peer, x: dotX, y: dotY }) => {
                const lit = isLit(peer.id);
                return (
                  <G
                    key={`${friend.id}-dot-${peer.id}`}
                    onPress={onOpenProfile ? () => onOpenProfile(peer.id) : undefined}
                  >
                    <Line
                      x1={x}
                      y1={y}
                      x2={dotX}
                      y2={dotY}
                      stroke={lit && hasHighlight ? colors.primary : colors.textTertiary}
                      strokeWidth={1}
                      opacity={lit ? (hasHighlight ? 0.5 : 0.35) : 0.12}
                    />
                    <Circle
                      cx={dotX}
                      cy={dotY}
                      r={lit && hasHighlight ? 6 : 3.5}
                      fill={lit && hasHighlight ? colors.primary : colors.textTertiary}
                      opacity={lit ? (hasHighlight ? 1 : 0.55) : 0.18}
                    />
                  </G>
                );
              })
            )}

            {overview.map(({ friend, x, y }) => (
              <Line
                key={`${friend.id}-link`}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke={colors.primary}
                strokeWidth={1.5}
                opacity={isLit(friend.id) ? 0.45 : 0.15}
              />
            ))}

            {overview.map(({ friend, x, y }) => {
              const lit = isLit(friend.id);
              return (
                <G
                  key={friend.id}
                  onPress={onFocusFriend ? () => onFocusFriend(friend.id) : undefined}
                  opacity={lit ? 1 : 0.35}
                >
                  <Circle
                    cx={x}
                    cy={y}
                    r={16}
                    fill={lit && hasHighlight ? colors.primary : colors.primaryMuted}
                    stroke={colors.primary}
                    strokeWidth={lit && hasHighlight ? 2.5 : 1.5}
                  />
                  <SvgText
                    x={x}
                    y={y + 4}
                    fontSize={11}
                    fontWeight="700"
                    fill={lit && hasHighlight ? colors.onPrimary : colors.primary}
                    textAnchor="middle"
                  >
                    {getInitials(friend.name)}
                  </SvgText>
                </G>
              );
            })}

            <Circle cx={cx} cy={cy} r={30} fill={colors.primary} />
            <SvgText
              x={cx}
              y={cy + 5}
              fontSize={13}
              fontWeight="700"
              fill={colors.onPrimary}
              textAnchor="middle"
            >
              {centerLabel}
            </SvgText>

            {overflow > 0 ? (
              <SvgText
                x={cx}
                y={size - 6}
                fontSize={11}
                fontWeight="600"
                fill={colors.textTertiary}
                textAnchor="middle"
              >
                {`+${overflow} more`}
              </SvgText>
            ) : null}
          </>
        )}
      </Svg>
    </View>
  );
}
