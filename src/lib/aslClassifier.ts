// Rule-based ASL alphabet classifier from MediaPipe Hands landmarks.
// MediaPipe returns 21 normalized 3D landmarks per hand (x, y in [0,1]; z relative).
// Index map:
//  0 = WRIST
//  1-4   = THUMB (CMC, MCP, IP, TIP)
//  5-8   = INDEX (MCP, PIP, DIP, TIP)
//  9-12  = MIDDLE
// 13-16  = RING
// 17-20  = PINKY
//
// We compute which fingers are "extended" using a simple geometry test
// (tip is farther from the wrist than the PIP joint along the finger axis),
// then match the (thumb, index, middle, ring, pinky) extension pattern + a
// few extra heuristics to a letter. This is a lightweight static-pose
// classifier — it covers most of the ASL alphabet that doesn't require
// motion (J and Z require motion and are intentionally excluded).

export type Landmark = { x: number; y: number; z: number };

const FINGER_JOINTS = {
  thumb: { tip: 4, ip: 3, mcp: 2 },
  index: { tip: 8, dip: 7, pip: 6, mcp: 5 },
  middle: { tip: 12, dip: 11, pip: 10, mcp: 9 },
  ring: { tip: 16, dip: 15, pip: 14, mcp: 13 },
  pinky: { tip: 20, dip: 19, pip: 18, mcp: 17 },
} as const;

function dist(a: Landmark, b: Landmark) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function isFingerExtended(lm: Landmark[], finger: keyof typeof FINGER_JOINTS) {
  const wrist = lm[0];
  const j: any = FINGER_JOINTS[finger];
  if (finger === "thumb") {
    return dist(lm[j.tip], wrist) > dist(lm[j.ip], wrist) * 1.05;
  }
  const tipAbovePip = lm[j.tip].y < lm[j.pip].y - 0.02;
  const tipFurther = dist(lm[j.tip], wrist) > dist(lm[j.pip], wrist) * 1.05;
  return tipAbovePip && tipFurther;
}

export function getExtendedFingers(lm: Landmark[]) {
  return {
    thumb: isFingerExtended(lm, "thumb"),
    index: isFingerExtended(lm, "index"),
    middle: isFingerExtended(lm, "middle"),
    ring: isFingerExtended(lm, "ring"),
    pinky: isFingerExtended(lm, "pinky"),
  };
}

// Pattern key: T I M R P (1 = extended, 0 = curled)
function patternKey(e: ReturnType<typeof getExtendedFingers>) {
  return [e.thumb, e.index, e.middle, e.ring, e.pinky].map((b) => (b ? 1 : 0)).join("");
}

export function classifyASL(lm: Landmark[]): { letter: string; confidence: number } | null {
  if (!lm || lm.length < 21) return null;
  const e = getExtendedFingers(lm);
  const key = patternKey(e);

  // Primary lookup table — covers the common static fingerspelled letters.
  // This is an approximation; ambiguities resolved by extra rules below.
  const table: Record<string, string> = {
    "00000": "A", // closed fist, thumb to side
    "01000": "D", // index up only (also could be 1)
    "01100": "U", // index + middle up together
    "11000": "L", // thumb + index, perpendicular
    "01111": "B", // four fingers up, thumb across palm
    "11111": "5", // open hand — use as space trigger
    "00001": "I",
    "10001": "Y",
    "01001": "rock", // index + pinky (not a letter)
    "00011": "?",
  };

  let letter = table[key] ?? "?";

  // Disambiguation using geometry
  const wrist = lm[0];
  const indexTip = lm[8];
  const middleTip = lm[12];
  const thumbTip = lm[4];

  // V vs U: both fingers extended; if spread apart -> V, together -> U
  if (key === "01100") {
    const tipGap = dist(indexTip, middleTip);
    const palmSize = dist(wrist, lm[9]);
    if (tipGap > palmSize * 0.45) letter = "V";
    else letter = "U";
  }

  // W: index + middle + ring extended
  if (key === "01110") letter = "W";

  // F: thumb + index touching (circle), other 3 extended
  if (key === "00111" || key === "10111") {
    const pinch = dist(thumbTip, indexTip);
    const palmSize = dist(wrist, lm[9]);
    if (pinch < palmSize * 0.25) letter = "F";
    else letter = "?";
  }

  // O: all fingertips curled toward thumb forming a circle
  if (key === "00000" || key === "10000") {
    const pinch = dist(thumbTip, indexTip);
    const palmSize = dist(wrist, lm[9]);
    if (pinch < palmSize * 0.3 && pinch > palmSize * 0.05) {
      letter = "O";
    } else if (key === "10000") {
      // Thumb up only
      letter = "A";
    }
  }

  // C: hand curved like a C — fingers slightly curled, thumb opposite
  // index tip and thumb tip moderately apart, all non-thumb fingers semi-curled
  if (key === "00000") {
    const pinch = dist(thumbTip, indexTip);
    const palmSize = dist(wrist, lm[9]);
    if (pinch > palmSize * 0.4 && pinch < palmSize * 0.9) {
      letter = "C";
    }
  }

  // R: index + middle crossed (extended but tips overlapping)
  if (key === "01100") {
    const tipGap = dist(indexTip, middleTip);
    const palmSize = dist(wrist, lm[9]);
    if (tipGap < palmSize * 0.15) letter = "R";
  }

  // Open hand "5" — treat as space command
  if (key === "11111") letter = "SPACE";

  // Confidence is heuristic — based on how clean the pattern is
  const confidence = letter === "?" ? 0.3 : 0.75;

  return { letter, confidence };
}
