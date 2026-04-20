// Plain-language descriptions of how to form each ASL fingerspelling letter.
// Aimed at hearing users who want to sign back to a deaf/mute person.

export type SignGuide = {
  letter: string;
  shape: string;
  tip?: string;
  motion?: boolean;
};

export const ASL_ALPHABET: SignGuide[] = [
  { letter: "A", shape: "Closed fist, thumb resting on the side (not tucked in)." },
  { letter: "B", shape: "Flat palm facing forward, four fingers straight up, thumb folded across the palm." },
  { letter: "C", shape: "Curve all fingers and thumb to form the letter C, palm facing sideways." },
  { letter: "D", shape: "Index finger pointing up, other fingers touch the thumb forming a circle." },
  { letter: "E", shape: "Fingers curled down to touch the thumb, thumb tucked under the fingertips." },
  { letter: "F", shape: "Index and thumb touch in a circle (OK sign), other three fingers straight up." },
  { letter: "G", shape: "Index finger and thumb extended sideways, parallel, like a small gun pointing left." },
  { letter: "H", shape: "Index and middle fingers extended sideways together, others tucked." },
  { letter: "I", shape: "Pinky finger up, all other fingers (and thumb) closed in a fist." },
  { letter: "J", shape: "Start with the I sign, then draw the letter J in the air with your pinky.", motion: true },
  { letter: "K", shape: "Index up, middle finger out at an angle, thumb tucked between them." },
  { letter: "L", shape: "Index finger up, thumb out sideways, forming an L shape." },
  { letter: "M", shape: "Thumb tucked under three folded fingers (index, middle, ring) — three knuckles over thumb." },
  { letter: "N", shape: "Thumb tucked under two folded fingers (index, middle) — two knuckles over thumb." },
  { letter: "O", shape: "All fingers curve to meet the thumb, forming a round O shape." },
  { letter: "P", shape: "Like K but rotated downward — palm faces down, middle finger points down." },
  { letter: "Q", shape: "Like G but rotated downward — index and thumb point down." },
  { letter: "R", shape: "Index and middle fingers up, crossed (middle in front of index)." },
  { letter: "S", shape: "Closed fist with the thumb wrapped across the front of the fingers." },
  { letter: "T", shape: "Closed fist with the thumb tucked between the index and middle fingers." },
  { letter: "U", shape: "Index and middle fingers up together (touching), others closed." },
  { letter: "V", shape: "Index and middle fingers up in a V (peace sign), others closed." },
  { letter: "W", shape: "Index, middle, and ring fingers up and spread, thumb holds down the pinky." },
  { letter: "X", shape: "Index finger bent into a hook, all other fingers closed." },
  { letter: "Y", shape: "Thumb and pinky extended (hang loose / 🤙), other fingers folded down." },
  { letter: "Z", shape: "Draw the letter Z in the air with your index finger.", motion: true },
];

export const COMMON_PHRASES: SignGuide[] = [
  {
    letter: "HELLO",
    shape: "Open flat hand at your forehead (like a salute), then move it outward away from your face.",
    motion: true,
  },
  {
    letter: "THANK YOU",
    shape: "Flat hand touches your chin, then moves forward and down toward the other person.",
    motion: true,
  },
  {
    letter: "YES",
    shape: "Closed fist (S sign) nodding up and down, like a head nodding yes.",
    motion: true,
  },
  {
    letter: "NO",
    shape: "Index and middle fingers tap down onto the thumb (like a snapping mouth closing).",
    motion: true,
  },
  {
    letter: "PLEASE",
    shape: "Flat open palm on your chest, moved in a small circle.",
    motion: true,
  },
  {
    letter: "SORRY",
    shape: "Closed fist (A sign) on your chest, moved in a small circle.",
    motion: true,
  },
  {
    letter: "I LOVE YOU",
    shape: "Thumb, index, and pinky extended; middle and ring folded down. Palm faces forward.",
  },
  {
    letter: "HELP",
    shape: "Closed fist (thumb up) resting on top of your other flat palm, then lift both hands together.",
    motion: true,
  },
  {
    letter: "WATER",
    shape: "Make a W with three fingers and tap the side of your index finger to your chin.",
    motion: true,
  },
  {
    letter: "EAT / FOOD",
    shape: "Pinch fingertips together (like holding food) and tap them to your mouth.",
    motion: true,
  },
  {
    letter: "GOOD",
    shape: "Flat hand touches your chin, then drops down onto your other open palm.",
    motion: true,
  },
  {
    letter: "BAD",
    shape: "Flat hand touches your chin, then flips palm down and moves away.",
    motion: true,
  },
  {
    letter: "NAME",
    shape: "Make H sign with both hands (index + middle out), then tap them together in an X shape twice.",
    motion: true,
  },
  {
    letter: "SPACE",
    shape: "Open hand with all 5 fingers spread — used here to finalize and speak the current word.",
  },
];
