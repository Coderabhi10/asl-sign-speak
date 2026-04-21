// Plain-language descriptions of how to form each ASL fingerspelling letter.
// Aimed at hearing users who want to sign back to a deaf/mute person.
//
// Images are sourced from Wikimedia Commons (public domain, by user "Ds13"),
// the canonical ASL alphabet illustration set used by educational sites.
// https://commons.wikimedia.org/wiki/Category:Hand_signs_of_letters_in_American_Sign_Language

export type SignGuide = {
  letter: string;
  shape: string;
  tip?: string;
  motion?: boolean;
  imageUrl?: string;
};

// Use direct file URLs (not /thumb/) — SVGs render natively in <img> at any size
// and the /thumb/ endpoint requires a .png suffix for SVG sources, which broke loading.
const wm = (file: string) =>
  `https://upload.wikimedia.org/wikipedia/commons/${file}`;

export const ASL_ALPHABET: SignGuide[] = [
  {
    letter: "A",
    shape: "Closed fist, thumb resting on the side (not tucked in).",
    imageUrl: wm("2/27/Sign_language_A.svg"),
  },
  {
    letter: "B",
    shape:
      "Flat palm facing forward, four fingers straight up, thumb folded across the palm.",
    imageUrl: wm("1/18/Sign_language_B.svg"),
  },
  {
    letter: "C",
    shape:
      "Curve all fingers and thumb to form the letter C, palm facing sideways.",
    imageUrl: wm("e/e3/Sign_language_C.svg"),
  },
  {
    letter: "D",
    shape:
      "Index finger pointing up, other fingers touch the thumb forming a circle.",
    imageUrl: wm("0/06/Sign_language_D.svg"),
  },
  {
    letter: "E",
    shape:
      "Fingers curled down to touch the thumb, thumb tucked under the fingertips.",
    imageUrl: wm("c/cd/Sign_language_E.svg"),
  },
  {
    letter: "F",
    shape:
      "Index and thumb touch in a circle (OK sign), other three fingers straight up.",
    imageUrl: wm("8/8f/Sign_language_F.svg"),
  },
  {
    letter: "G",
    shape:
      "Index finger and thumb extended sideways, parallel, like a small gun pointing left.",
    imageUrl: wm("d/d9/Sign_language_G.svg"),
  },
  {
    letter: "H",
    shape: "Index and middle fingers extended sideways together, others tucked.",
    imageUrl: wm("9/97/Sign_language_H.svg"),
  },
  {
    letter: "I",
    shape: "Pinky finger up, all other fingers (and thumb) closed in a fist.",
    imageUrl: wm("1/10/Sign_language_I.svg"),
  },
  {
    letter: "J",
    shape:
      "Start with the I sign, then draw the letter J in the air with your pinky.",
    motion: true,
    imageUrl: wm("b/b1/Sign_language_J.svg"),
  },
  {
    letter: "K",
    shape:
      "Index up, middle finger out at an angle, thumb tucked between them.",
    imageUrl: wm("9/97/Sign_language_K.svg"),
  },
  {
    letter: "L",
    shape: "Index finger up, thumb out sideways, forming an L shape.",
    imageUrl: wm("d/d2/Sign_language_L.svg"),
  },
  {
    letter: "M",
    shape:
      "Thumb tucked under three folded fingers (index, middle, ring) — three knuckles over thumb.",
    imageUrl: wm("c/c4/Sign_language_M.svg"),
  },
  {
    letter: "N",
    shape:
      "Thumb tucked under two folded fingers (index, middle) — two knuckles over thumb.",
    imageUrl: wm("e/e6/Sign_language_N.svg"),
  },
  {
    letter: "O",
    shape: "All fingers curve to meet the thumb, forming a round O shape.",
    imageUrl: wm("e/e0/Sign_language_O.svg"),
  },
  {
    letter: "P",
    shape:
      "Like K but rotated downward — palm faces down, middle finger points down.",
    imageUrl: wm("0/08/Sign_language_P.svg"),
  },
  {
    letter: "Q",
    shape: "Like G but rotated downward — index and thumb point down.",
    imageUrl: wm("3/34/Sign_language_Q.svg"),
  },
  {
    letter: "R",
    shape: "Index and middle fingers up, crossed (middle in front of index).",
    imageUrl: wm("3/3d/Sign_language_R.svg"),
  },
  {
    letter: "S",
    shape: "Closed fist with the thumb wrapped across the front of the fingers.",
    imageUrl: wm("3/3f/Sign_language_S.svg"),
  },
  {
    letter: "T",
    shape:
      "Closed fist with the thumb tucked between the index and middle fingers.",
    imageUrl: wm("1/13/Sign_language_T.svg"),
  },
  {
    letter: "U",
    shape: "Index and middle fingers up together (touching), others closed.",
    imageUrl: wm("7/7c/Sign_language_U.svg"),
  },
  {
    letter: "V",
    shape:
      "Index and middle fingers up in a V (peace sign), others closed.",
    imageUrl: wm("c/ca/Sign_language_V.svg"),
  },
  {
    letter: "W",
    shape:
      "Index, middle, and ring fingers up and spread, thumb holds down the pinky.",
    imageUrl: wm("8/83/Sign_language_W.svg"),
  },
  {
    letter: "X",
    shape: "Index finger bent into a hook, all other fingers closed.",
    imageUrl: wm("b/b7/Sign_language_X.svg"),
  },
  {
    letter: "Y",
    shape:
      "Thumb and pinky extended (hang loose / 🤙), other fingers folded down.",
    imageUrl: wm("1/1d/Sign_language_Y.svg"),
  },
  {
    letter: "Z",
    shape: "Draw the letter Z in the air with your index finger.",
    motion: true,
    imageUrl: wm("0/0a/Sign_language_Z.svg"),
  },
];

export const COMMON_PHRASES: SignGuide[] = [
  {
    letter: "HELLO",
    shape:
      "Open flat hand at your forehead (like a salute), then move it outward away from your face.",
    motion: true,
  },
  {
    letter: "THANK YOU",
    shape:
      "Flat hand touches your chin, then moves forward and down toward the other person.",
    motion: true,
  },
  {
    letter: "YES",
    shape:
      "Closed fist (S sign) nodding up and down, like a head nodding yes.",
    motion: true,
  },
  {
    letter: "NO",
    shape:
      "Index and middle fingers tap down onto the thumb (like a snapping mouth closing).",
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
    shape:
      "Thumb, index, and pinky extended; middle and ring folded down. Palm faces forward.",
    imageUrl: wm("c/c1/ILY_handsign.svg"),
  },
  {
    letter: "HELP",
    shape:
      "Closed fist (thumb up) resting on top of your other flat palm, then lift both hands together.",
    motion: true,
  },
  {
    letter: "WATER",
    shape:
      "Make a W with three fingers and tap the side of your index finger to your chin.",
    motion: true,
  },
  {
    letter: "EAT / FOOD",
    shape:
      "Pinch fingertips together (like holding food) and tap them to your mouth.",
    motion: true,
  },
  {
    letter: "GOOD",
    shape:
      "Flat hand touches your chin, then drops down onto your other open palm.",
    motion: true,
  },
  {
    letter: "BAD",
    shape:
      "Flat hand touches your chin, then flips palm down and moves away.",
    motion: true,
  },
  {
    letter: "NAME",
    shape:
      "Make H sign with both hands (index + middle out), then tap them together in an X shape twice.",
    motion: true,
  },
  {
    letter: "SPACE",
    shape:
      "Open hand with all 5 fingers spread — used here to finalize and speak the current word.",
  },
];
