const ANIMATION_PATTERNS = [
  ["GSAP", [/gsap/i, /ScrollTrigger/i]],
  ["Framer Motion", [/framer-motion/i, /motion\./i]],
  ["AOS", [/data-aos/i, /\baos\b/i]],
  ["Lottie", [/lottie/i]],
  ["CSS Animations", [/animation:/i, /@keyframes/i]],
  ["CSS Transitions", [/transition:/i]],
  ["Parallax", [/parallax/i]]
];

export function detectAnimations(html = "") {
  const detected = [];

  for (const [label, patterns] of ANIMATION_PATTERNS) {
    if (patterns.some(pattern => pattern.test(html))) {
      detected.push(label);
    }
  }

  return detected;
}
