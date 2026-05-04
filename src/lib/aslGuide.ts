// Plain-language descriptions of how to form each Sign Language fingerspelling letter.
// Aimed at hearing users who want to sign back to a deaf/mute person.
//
// Letter illustrations are sourced from Wikimedia Commons (public domain).
// Phrase animations are custom-built SMIL SVGs in /public/asl/anim/ that
// loop the hand motion so users can learn from a moving demo on hover.

export type SignGuide = {
  letter: string;
  shape: string;
  tip?: string;
  actionSteps?: string[];
  motion?: boolean;
  imageUrl?: string;
  /** Optional looping animated SVG/GIF that plays on hover to show the motion. */
  animUrl?: string;
};

const DEFAULT_STATIC_STEPS = [
  "Copy the hand shape shown in the picture.",
  "Match the palm direction written in the description.",
  "Hold the sign steady for one second.",
];

const ACTION_STEPS: Record<string, string[]> = {
  J: [
    "Make the I hand shape with your pinky up.",
    "Move the pinky down and curve it upward like writing J in the air.",
    "Finish with the palm facing forward.",
  ],
  Z: [
    "Point your index finger forward.",
    "Draw a Z shape in the air: across, diagonal down, across.",
    "Keep the movement sharp and clear.",
  ],
  HELLO: [
    "Open your flat hand beside your forehead like a salute.",
    "Keep your palm facing outward.",
    "Move the hand away from your face in a small wave.",
  ],
  "THANK YOU": [
    "Place a flat hand at your chin with palm facing in.",
    "Move the hand forward toward the other person.",
    "Finish with palm slightly upward, as if sending thanks.",
  ],
  YES: [
    "Close your hand into a fist.",
    "Hold it in front of your body.",
    "Bend the wrist up and down two times like nodding yes.",
  ],
  NO: [
    "Extend index and middle fingers with thumb open.",
    "Bring the two fingers down to touch the thumb.",
    "Repeat once like a small mouth closing.",
  ],
  PLEASE: [
    "Place a flat open palm on the center of your chest.",
    "Keep the palm touching your chest.",
    "Move the hand in a small circle.",
  ],
  SORRY: [
    "Make a closed fist.",
    "Place the fist on your chest.",
    "Move the fist in a small circle.",
  ],
  "I LOVE YOU": [
    "Open thumb, index finger, and pinky.",
    "Fold middle and ring fingers down.",
    "Hold palm forward toward the person.",
  ],
  HELP: [
    "Put your non-dominant hand flat, palm up.",
    "Place your dominant fist with thumb up on top of that palm.",
    "Lift both hands upward together.",
  ],
  WATER: [
    "Make a W with three fingers.",
    "Place the index-finger side near your chin.",
    "Tap the chin two times.",
  ],
  "EAT / FOOD": [
    "Pinch all fingertips together like holding food.",
    "Bring the fingertips to your mouth.",
    "Tap at the mouth once or twice.",
  ],
  GOOD: [
    "Touch a flat hand to your chin.",
    "Move that hand forward and down.",
    "Land it on your other open palm.",
  ],
  BAD: [
    "Touch a flat hand to your chin.",
    "Move it forward.",
    "Flip the palm down as it moves away.",
  ],
  NAME: [
    "Make an H hand shape with both hands.",
    "Cross the two H hands like an X.",
    "Tap them together two times.",
  ],
  SPACE: [
    "Spread all five fingers open.",
    "Hold the open hand forward.",
    "Use it as a clear pause or word break.",
  ],
  LOVE: [
    "Close both hands into fists.",
    "Cross both arms over your chest.",
    "Gently squeeze inward like hugging yourself.",
  ],
  FRIEND: [
    "Hook the index fingers of both hands together.",
    "Unhook and rotate the hands.",
    "Hook them again the opposite way.",
  ],
  FAMILY: [
    "Make F hand shapes with both hands.",
    "Touch the thumbs and index fingers together in front of you.",
    "Move both hands outward in a circle until the pinkies meet.",
  ],
  HAPPY: [
    "Open both hands with palms toward your chest.",
    "Brush the hands upward on your chest.",
    "Repeat the upward movement with a happy expression.",
  ],
  SAD: [
    "Open both hands in front of your face with fingers spread.",
    "Keep palms facing inward.",
    "Move both hands slowly downward past the face.",
  ],
  MOTHER: [
    "Open your hand with fingers spread.",
    "Bring the thumb to your chin.",
    "Tap the thumb on the chin.",
  ],
  FATHER: [
    "Open your hand with fingers spread.",
    "Bring the thumb to your forehead.",
    "Tap the thumb on the forehead.",
  ],
  HOME: [
    "Pinch fingertips together like an O hand.",
    "Touch the fingertips near the side of your mouth.",
    "Move them to your cheek and touch again.",
  ],
  WORK: [
    "Make two closed fists.",
    "Hold one fist still in front of you.",
    "Tap the wrist/side of the other fist on it twice.",
  ],
  SCHOOL: [
    "Hold one flat hand palm up.",
    "Bring the other flat hand above it.",
    "Clap the top palm down onto the bottom palm two times.",
  ],
  MORE: [
    "Pinch fingertips together on both hands.",
    "Hold both pinched hands in front of you.",
    "Tap the fingertips together two times.",
  ],
  STOP: [
    "Hold one hand flat, palm up.",
    "Make the other hand flat like a blade.",
    "Chop the blade hand down onto the palm.",
  ],
  GO: [
    "Point both index fingers upward.",
    "Aim them in the direction of travel.",
    "Swing both hands forward together.",
  ],
  WANT: [
    "Hold both open hands forward with palms up.",
    "Curl the fingers slightly.",
    "Pull both hands back toward your body.",
  ],
  NEED: [
    "Make an X hand shape with a bent index finger.",
    "Hold it in front of your body.",
    "Move it downward firmly once or twice.",
  ],
  UNDERSTAND: [
    "Hold a closed fist near your forehead.",
    "Keep the hand still for a moment.",
    "Flick the index finger upward like a light turning on.",
  ],
  WHAT: [
    "Hold both palms up with relaxed fingers.",
    "Keep your elbows near your body.",
    "Shake both hands side to side with a questioning face.",
  ],
  WHERE: [
    "Point one index finger upward.",
    "Hold it in front of your body.",
    "Shake the finger side to side.",
  ],
  WHO: [
    "Make an L hand shape near your chin.",
    "Keep the thumb near the chin.",
    "Bend the index finger up and down.",
  ],
  HOW: [
    "Bend fingers of both hands and touch the knuckles together.",
    "Roll both hands forward.",
    "Finish with palms facing upward.",
  ],
  "NICE TO MEET YOU": [
    "Wipe one flat hand across the other palm for NICE.",
    "Raise both index fingers facing each other.",
    "Move the index fingers together so they meet.",
  ],
  "SEE YOU LATER": [
    "Make a V sign near your eyes and move it forward for SEE.",
    "Make an L sign for LATER.",
    "Twist the L hand forward at the wrist.",
  ],
  BATHROOM: [
    "Make a T hand shape.",
    "Hold it in front of your shoulder.",
    "Shake the T side to side.",
  ],
  SLEEP: [
    "Open one hand in front of your face.",
    "Draw the hand downward past your eyes.",
    "Close the fingers as the hand moves down.",
  ],
  HUNGRY: [
    "Make a curved C hand near your throat.",
    "Touch the chest lightly.",
    "Slide the C hand downward toward your stomach.",
  ],
  DRINK: [
    "Curve your hand like holding a cup.",
    "Bring the hand up to your mouth.",
    "Tilt it slightly like taking a sip.",
  ],
  HOT: [
    "Make a claw hand in front of your mouth.",
    "Twist the hand quickly outward.",
    "Throw it away from your mouth like something is hot.",
  ],
  COLD: [
    "Make fists with both hands.",
    "Hold them near your body.",
    "Shake both fists quickly like shivering.",
  ],
  HUG: [
    "Close both hands into fists.",
    "Cross both arms over your chest.",
    "Gently squeeze inward like a hug.",
  ],
  BEAUTIFUL: [
    "Open one hand in front of your face with fingers spread.",
    "Circle the hand around the face.",
    "Close the fingers together near the chin.",
  ],
  "NAMASTE 🇮🇳": [
    "Press both palms together in front of your chest.",
    "Keep fingers pointing upward.",
    "Bow your head slightly with respect.",
  ],
};

export const getSignActionSteps = (sign: SignGuide) =>
  sign.actionSteps ?? ACTION_STEPS[sign.letter] ?? DEFAULT_STATIC_STEPS;

// Use direct file URLs (not /thumb/) — SVGs render natively in <img> at any size
// and the /thumb/ endpoint requires a .png suffix for SVG sources, which broke loading.
const wm = (file: string) => `https://upload.wikimedia.org/wikipedia/commons/${file}`;

export const ASL_ALPHABET: SignGuide[] = [
  {
    letter: "A",
    shape: "Closed fist, thumb resting on the side (not tucked in).",
    imageUrl: wm("2/27/Sign_language_A.svg"),
  },
  {
    letter: "B",
    shape: "Flat palm facing forward, four fingers straight up, thumb folded across the palm.",
    imageUrl: wm("1/18/Sign_language_B.svg"),
  },
  {
    letter: "C",
    shape: "Curve all fingers and thumb to form the letter C, palm facing sideways.",
    imageUrl: wm("e/e3/Sign_language_C.svg"),
  },
  {
    letter: "D",
    shape: "Index finger pointing up, other fingers touch the thumb forming a circle.",
    imageUrl: wm("0/06/Sign_language_D.svg"),
  },
  {
    letter: "E",
    shape: "Fingers curled down to touch the thumb, thumb tucked under the fingertips.",
    imageUrl: wm("c/cd/Sign_language_E.svg"),
  },
  {
    letter: "F",
    shape: "Index and thumb touch in a circle (OK sign), other three fingers straight up.",
    imageUrl: wm("8/8f/Sign_language_F.svg"),
  },
  {
    letter: "G",
    shape: "Index finger and thumb extended sideways, parallel, like a small gun pointing left.",
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
    shape: "Start with the I sign, then draw the letter J in the air with your pinky.",
    motion: true,
    imageUrl: wm("b/b1/Sign_language_J.svg"),
  },
  {
    letter: "K",
    shape: "Index up, middle finger out at an angle, thumb tucked between them.",
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
    shape: "Thumb tucked under two folded fingers (index, middle) — two knuckles over thumb.",
    imageUrl: wm("e/e6/Sign_language_N.svg"),
  },
  {
    letter: "O",
    shape: "All fingers curve to meet the thumb, forming a round O shape.",
    imageUrl: wm("e/e0/Sign_language_O.svg"),
  },
  {
    letter: "P",
    shape: "Like K but rotated downward — palm faces down, middle finger points down.",
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
    shape: "Closed fist with the thumb tucked between the index and middle fingers.",
    imageUrl: wm("1/13/Sign_language_T.svg"),
  },
  {
    letter: "U",
    shape: "Index and middle fingers up together (touching), others closed.",
    imageUrl: wm("7/7c/Sign_language_U.svg"),
  },
  {
    letter: "V",
    shape: "Index and middle fingers up in a V (peace sign), others closed.",
    imageUrl: wm("c/ca/Sign_language_V.svg"),
  },
  {
    letter: "W",
    shape: "Index, middle, and ring fingers up and spread, thumb holds down the pinky.",
    imageUrl: wm("8/83/Sign_language_W.svg"),
  },
  {
    letter: "X",
    shape: "Index finger bent into a hook, all other fingers closed.",
    imageUrl: wm("b/b7/Sign_language_X.svg"),
  },
  {
    letter: "Y",
    shape: "Thumb and pinky extended (hang loose / 🤙), other fingers folded down.",
    imageUrl: wm("1/1d/Sign_language_Y.svg"),
  },
  {
    letter: "Z",
    shape: "Draw the letter Z in the air with your index finger.",
    motion: true,
    imageUrl: wm("0/0a/Sign_language_Z.svg"),
  },
];

const anim = (name: string) => `/asl/anim/${name}.svg`;

export const COMMON_PHRASES: SignGuide[] = [
  {
    letter: "HELLO",
    shape:
      "Open flat hand at your forehead (like a salute), then move it outward away from your face.",
    motion: true,
    imageUrl: "/asl/sign_hello.svg",
    animUrl: anim("sign_hello"),
  },
  {
    letter: "THANK YOU",
    shape: "Flat hand touches your chin, then moves forward and down toward the other person.",
    motion: true,
    imageUrl: "/asl/sign_thank_you.svg",
    animUrl: anim("sign_thank_you"),
  },
  {
    letter: "YES",
    shape: "Closed fist (S sign) nodding up and down, like a head nodding yes.",
    motion: true,
    imageUrl: "/asl/sign_yes.png",
    animUrl: anim("sign_yes"),
  },
  {
    letter: "NO",
    shape: "Index and middle fingers tap down onto the thumb (like a snapping mouth closing).",
    motion: true,
    imageUrl: "/asl/sign_no.svg",
    animUrl: anim("sign_no"),
  },
  {
    letter: "PLEASE",
    shape: "Flat open palm on your chest, moved in a small circle.",
    motion: true,
    imageUrl: "/asl/sign_please.svg",
    animUrl: anim("sign_please"),
  },
  {
    letter: "SORRY",
    shape: "Closed fist (A sign) on your chest, moved in a small circle.",
    motion: true,
    imageUrl: "/asl/sign_sorry.png",
    animUrl: anim("sign_sorry"),
  },
  {
    letter: "I LOVE YOU",
    shape: "Thumb, index, and pinky extended; middle and ring folded down. Palm faces forward.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c1/ILY_handsign.svg",
  },
  {
    letter: "HELP",
    shape:
      "Closed fist (thumb up) resting on top of your other flat palm, then lift both hands together.",
    motion: true,
    imageUrl: "/asl/sign_help.png",
    animUrl: anim("sign_help"),
  },
  {
    letter: "WATER",
    shape: "Make a W with three fingers and tap the side of your index finger to your chin.",
    motion: true,
    imageUrl: "/asl/sign_water.svg",
    animUrl: anim("sign_water"),
  },
  {
    letter: "EAT / FOOD",
    shape: "Pinch fingertips together (like holding food) and tap them to your mouth.",
    motion: true,
    imageUrl: "/asl/sign_eat_food.png",
    animUrl: anim("sign_eat_food"),
  },
  {
    letter: "GOOD",
    shape: "Flat hand touches your chin, then drops down onto your other open palm.",
    motion: true,
    animUrl: anim("sign_thank_you"),
  },
  {
    letter: "BAD",
    shape: "Flat hand touches your chin, then flips palm down and moves away.",
    motion: true,
    animUrl: anim("sign_thank_you"),
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
  {
    letter: "LOVE",
    shape: "Cross both arms over your chest, fists closed, like hugging yourself.",
    motion: true,
    imageUrl: "/asl/sign_love.png",
    animUrl: anim("sign_love"),
  },
  {
    letter: "FRIEND",
    shape: "Hook both index fingers together, then flip and hook them the other way.",
    motion: true,
    imageUrl: "/asl/sign_friend.png",
    animUrl: anim("sign_friend"),
  },
  {
    letter: "FAMILY",
    shape:
      "Make F sign with both hands (index + thumb circle), touch thumbs together, then arc them outward into a circle until pinkies touch.",
    motion: true,
    imageUrl: "/asl/sign_family.png",
    animUrl: anim("sign_family"),
  },
  {
    letter: "HAPPY",
    shape: "Flat open hands brush upward on your chest in circular motions.",
    motion: true,
    imageUrl: "/asl/sign_happy.png",
    animUrl: anim("sign_happy"),
  },
  {
    letter: "SAD",
    shape:
      "Open hands in front of your face, fingers spread, slowly slide them downward while making a sad expression.",
    motion: true,
    imageUrl: "/asl/sign_sad.png",
    animUrl: anim("sign_sad"),
  },
  {
    letter: "MOTHER",
    shape: "Open hand with fingers spread, tap your thumb to your chin.",
    motion: true,
    animUrl: anim("sign_mother"),
  },
  {
    letter: "FATHER",
    shape: "Open hand with fingers spread, tap your thumb to your forehead.",
    motion: true,
    imageUrl: "/asl/sign_father.png",
    animUrl: anim("sign_father"),
  },
  {
    letter: "HOME",
    shape:
      "Pinch fingertips together, touch the side of your mouth, then move and touch your cheek.",
    motion: true,
    imageUrl: "/asl/sign_home.png",
    animUrl: anim("sign_home"),
  },
  {
    letter: "WORK",
    shape:
      "Two closed fists (S sign), tap the wrist of your dominant hand on top of the other a couple times.",
    motion: true,
    imageUrl: "/asl/sign_work.png",
    animUrl: anim("sign_work"),
  },
  {
    letter: "SCHOOL",
    shape:
      "Flat hands, clap your dominant palm down onto your other palm twice (like a teacher clapping for attention).",
    motion: true,
    imageUrl: "/asl/sign_school.png",
    animUrl: anim("sign_school"),
  },
  {
    letter: "MORE",
    shape:
      "Pinch fingertips of both hands together (flat-O shape), then tap fingertips together twice.",
    motion: true,
    imageUrl: "/asl/sign_more.png",
    animUrl: anim("sign_more"),
  },
  {
    letter: "STOP",
    shape:
      "Edge of your dominant flat hand chops down sharply onto the palm of your other flat hand.",
    motion: true,
    imageUrl: "/asl/sign_stop.png",
    animUrl: anim("sign_stop"),
  },
  {
    letter: "GO",
    shape:
      "Both index fingers pointing up, then swing them forward together in the direction you mean.",
    motion: true,
    imageUrl: "/asl/sign_go.png",
    animUrl: anim("sign_go"),
  },
  {
    letter: "WANT",
    shape:
      "Both open hands palms up in front of you, curl fingers and pull hands toward your body.",
    motion: true,
    imageUrl: "/asl/sign_want.png",
    animUrl: anim("sign_want"),
  },
  {
    letter: "NEED",
    shape: "Make X sign (bent index finger) and move it firmly downward a couple times.",
    motion: true,
    imageUrl: "/asl/sign_need.png",
    animUrl: anim("sign_need"),
  },
  {
    letter: "UNDERSTAND",
    shape:
      "Closed fist near your forehead, then flick the index finger up (like a lightbulb turning on).",
    motion: true,
    imageUrl: "/asl/sign_understand.png",
    animUrl: anim("sign_understand"),
  },
  {
    letter: "WHAT",
    shape:
      "Both palms up, fingers relaxed, shake hands slightly side to side with a questioning expression.",
    motion: true,
    imageUrl: "/asl/sign_what.png",
    animUrl: anim("sign_what"),
  },
  {
    letter: "WHERE",
    shape: "Index finger pointing up, shake it side to side quickly.",
    motion: true,
    imageUrl: "/asl/sign_where.png",
    animUrl: anim("sign_where"),
  },
  {
    letter: "WHO",
    shape:
      "Make L sign at your chin, then bend the index finger up and down (or circle thumb at chin).",
    motion: true,
    imageUrl: "/asl/sign_who.png",
    animUrl: anim("sign_who"),
  },
  {
    letter: "HOW",
    shape:
      "Bent fingers of both hands touching back-to-back at the knuckles, then roll them forward so palms face up.",
    motion: true,
    imageUrl: "/asl/sign_how.png",
    animUrl: anim("sign_how"),
  },
  {
    letter: "NICE TO MEET YOU",
    shape:
      "Sign NICE (flat hand wipes across other flat palm), then MEET (two index fingers up, bring them together to 'meet').",
    motion: true,
    animUrl: anim("sign_friend"),
  },
  {
    letter: "SEE YOU LATER",
    shape:
      "V sign at your eyes pointing forward (SEE), then L sign twisting forward at the wrist (LATER).",
    motion: true,
    animUrl: anim("sign_hello"),
  },
  {
    letter: "BATHROOM",
    shape: "Make T sign (fist with thumb between index and middle), shake it side to side.",
    motion: true,
    animUrl: anim("sign_where"),
  },
  {
    letter: "SLEEP",
    shape:
      "Open hand in front of your face, slowly close fingers as you draw the hand down past your eyes (eyes closing).",
    motion: true,
    animUrl: anim("sign_sad"),
  },
  {
    letter: "HUNGRY",
    shape:
      "C sign (curved hand) at your chest, slide it downward from your throat to your stomach.",
    motion: true,
    imageUrl: "/asl/sign_hungry.png",
    animUrl: anim("sign_hungry"),
  },
  {
    letter: "DRINK",
    shape: "C sign (curved hand) brought up to your mouth like holding a cup and sipping.",
    motion: true,
    imageUrl: "/asl/sign_drink.png",
    animUrl: anim("sign_drink"),
  },
  {
    letter: "HOT",
    shape:
      "Claw-shape hand in front of your mouth, then quickly twist and throw it away (like spitting out something hot).",
    motion: true,
    imageUrl: "/asl/sign_hot.png",
    animUrl: anim("sign_hot"),
  },
  {
    letter: "COLD",
    shape: "Both fists (S sign) shake in front of your body, like shivering.",
    motion: true,
    imageUrl: "/asl/sign_cold.png",
    animUrl: anim("sign_cold"),
  },
  {
    letter: "HUG",
    shape: "Cross both arms over your chest and gently squeeze, like giving yourself a hug.",
    motion: true,
    imageUrl: "/asl/sign_love.png",
    animUrl: anim("sign_love"),
  },
  {
    letter: "BEAUTIFUL",
    shape: "Open 5-hand circles in front of your face, then closes into a flat-O at your chin.",
    motion: true,
    imageUrl: "/asl/sign_beautiful.png",
    animUrl: anim("sign_beautiful"),
  },
  // Indian-flavored greeting — culturally common everyday sign
  {
    letter: "NAMASTE 🇮🇳",
    shape:
      "Press both palms flat together in front of your chest (prayer position) and bow your head slightly. The traditional Indian greeting — widely used in Indian Sign Language too.",
    motion: true,
    animUrl: anim("sign_please"),
  },
];
