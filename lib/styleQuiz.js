// Style quiz data + scoring. No AI — every answer adds points to the cuts it
// suits, and the highest totals win. Tweak weights or `fits` lists freely.

export const QUESTIONS = [
  {
    id: 'faceShape',
    title: "What's your face shape?",
    hint: 'Pull your hair back and look straight into a mirror. Compare your forehead, cheekbones and jaw.',
    visual: 'face',
    weight: 2,
    options: [
      { value: 'oval', label: 'Oval', sub: 'Longer than wide, soft jaw' },
      { value: 'round', label: 'Round', sub: 'Full cheeks, about as wide as long' },
      { value: 'square', label: 'Square', sub: 'Strong, angular jaw' },
      { value: 'oblong', label: 'Oblong', sub: 'Long face, straight sides' },
      { value: 'heart', label: 'Heart', sub: 'Wide forehead, narrow chin' },
      { value: 'diamond', label: 'Diamond', sub: 'Wide cheekbones, narrow forehead and chin' },
    ],
  },
  {
    id: 'hairType',
    title: "What's your hair type?",
    hint: 'How does it dry if you leave it alone after a shower?',
    visual: 'strands',
    weight: 3,
    options: [
      { value: 'straight', label: 'Straight', sub: 'Falls flat, no bend' },
      { value: 'wavy', label: 'Wavy', sub: 'Loose S-shaped bends' },
      { value: 'curly', label: 'Curly', sub: 'Defined loops and ringlets' },
      { value: 'coily', label: 'Coily', sub: 'Tight coils or zig-zags' },
    ],
  },
  {
    id: 'thickness',
    title: 'How thick is your hair?',
    hint: "Think about how much of it there is, not how coarse each strand is.",
    visual: 'density',
    weight: 1,
    options: [
      { value: 'fine', label: 'Fine', sub: 'Scalp shows through easily' },
      { value: 'medium', label: 'Medium', sub: 'Somewhere in between' },
      { value: 'thick', label: 'Thick', sub: 'Lots of it, hard to see scalp' },
    ],
  },
  {
    id: 'hairColor',
    title: "What's your hair color?",
    hint: 'Darker hair makes fades pop more. Lighter hair shows off texture.',
    visual: 'color',
    weight: 0,
    options: [
      { value: 'black', label: 'Black', swatch: ['#1a1a1a', '#3a3a3a'] },
      { value: 'darkBrown', label: 'Dark brown', swatch: ['#3b2618', '#5c3d28'] },
      { value: 'lightBrown', label: 'Light brown', swatch: ['#7a5232', '#a37650'] },
      { value: 'blonde', label: 'Blonde', swatch: ['#c9a466', '#e6cb8f'] },
      { value: 'red', label: 'Red / ginger', swatch: ['#8c3b1c', '#b8562b'] },
      { value: 'gray', label: 'Gray / silver', swatch: ['#8d8d8d', '#c8c8c8'] },
    ],
  },
  {
    id: 'length',
    title: 'How much length do you want on top?',
    hint: 'Sides will be shorter either way.',
    weight: 3,
    options: [
      { value: 'short', label: 'Short', sub: 'Under 1–2 inches, easy to manage' },
      { value: 'medium', label: 'Medium', sub: 'Enough to push around and texture' },
      { value: 'long', label: 'Longer', sub: 'Lots of length and movement' },
    ],
  },
  {
    id: 'upkeep',
    title: 'How much time do you spend on your hair?',
    weight: 2,
    options: [
      { value: 'low', label: 'Basically none', sub: 'Wake up and go' },
      { value: 'some', label: 'A couple minutes', sub: 'Some product, quick finger style' },
      { value: 'high', label: 'I like styling it', sub: 'Blow dryer, product, the works' },
    ],
  },
  {
    id: 'vibe',
    title: 'What look are you going for?',
    weight: 2,
    options: [
      { value: 'clean', label: 'Clean & sharp', sub: 'Neat, professional, low-key' },
      { value: 'textured', label: 'Textured & messy', sub: 'Effortless, lived-in' },
      { value: 'trendy', label: 'Bold & trendy', sub: 'What everyone is asking for right now' },
    ],
  },
  {
    id: 'beard',
    title: 'What about facial hair?',
    weight: 0,
    options: [
      { value: 'none', label: 'Clean shaven', sub: 'No beard' },
      { value: 'stubble', label: 'Stubble', sub: 'Light shadow' },
      { value: 'beard', label: 'Beard', sub: 'Want it shaped up too' },
    ],
  },
]

// Each cut is one of the photos in /public/images. `fits` lists the answers
// it works well with, per question.
export const CUTS = [
  {
    id: 'textured-fringe',
    name: 'Textured Fringe Taper',
    image: '/images/Haircut1.png',
    description: 'Choppy texture on top pushed forward into a fringe, with a clean low taper on the sides and neckline.',
    fits: {
      faceShape: ['oval', 'oblong', 'heart', 'diamond'],
      hairType: ['straight', 'wavy'],
      thickness: ['medium', 'thick'],
      length: ['medium'],
      upkeep: ['some'],
      vibe: ['textured', 'trendy'],
    },
  },
  {
    id: 'messy-flow',
    name: 'Messy Flow Taper',
    image: '/images/Haircut2.png',
    description: 'Longer, piecey top with lots of movement and a low taper that keeps it tidy around the ears.',
    fits: {
      faceShape: ['oval', 'round', 'square'],
      hairType: ['wavy', 'straight'],
      thickness: ['thick', 'medium'],
      length: ['long', 'medium'],
      upkeep: ['some', 'high'],
      vibe: ['textured', 'trendy'],
    },
  },
  {
    id: 'curly-fringe',
    name: 'Curly Fringe Low Taper',
    image: '/images/Haircut3.png',
    description: 'Natural curls left long up front to fall over the forehead, faded down low on the sides. Pairs well with a beard.',
    fits: {
      faceShape: ['oblong', 'heart', 'diamond', 'oval'],
      hairType: ['wavy', 'curly'],
      thickness: ['medium', 'thick'],
      length: ['long', 'medium'],
      upkeep: ['low', 'some'],
      vibe: ['trendy', 'textured'],
    },
  },
  {
    id: 'spiky-texture',
    name: 'Spiky Texture Taper',
    image: '/images/Haircut4.png',
    description: 'Height and spiky texture on top with a taper that blends out tight at the neck. Adds height to the face.',
    fits: {
      faceShape: ['round', 'square', 'oval'],
      hairType: ['straight'],
      thickness: ['thick', 'medium'],
      length: ['medium'],
      upkeep: ['some', 'high'],
      vibe: ['textured', 'trendy'],
    },
  },
  {
    id: 'curly-top',
    name: 'Curly Top Taper',
    image: '/images/Haircut5.png',
    description: 'Lets curls do the work. Volume stays on top while a low taper keeps the back and sides clean.',
    fits: {
      faceShape: ['round', 'square', 'oval', 'diamond'],
      hairType: ['curly', 'coily', 'wavy'],
      thickness: ['thick', 'medium'],
      length: ['long', 'medium'],
      upkeep: ['low', 'some'],
      vibe: ['trendy', 'textured'],
    },
  },
  {
    id: 'short-crop',
    name: 'Short Crop Low Fade',
    image: '/images/Haircut6.png',
    description: 'Short, even length on top with a low fade. About as low-maintenance as a cut gets.',
    fits: {
      faceShape: ['square', 'oval', 'diamond', 'heart'],
      hairType: ['straight', 'wavy', 'curly', 'coily'],
      thickness: ['fine', 'medium', 'thick'],
      length: ['short'],
      upkeep: ['low'],
      vibe: ['clean'],
    },
  },
]

const FACE_TIPS = {
  oval: 'Oval faces are balanced, so almost any cut works. Pick based on your hair and lifestyle.',
  round: 'Height on top and shorter sides make a round face look longer and more defined.',
  square: 'Your jaw is already strong. Texture on top softens it without hiding it.',
  oblong: 'A fringe or forward styling makes a long face look shorter. Avoid a lot of height.',
  heart: 'Some length and fringe up front balances a wider forehead.',
  diamond: 'A fringe softens the forehead, and keeping some fullness on the sides balances your cheekbones.',
}

const COLOR_TIPS = {
  black: 'With dark hair, a fade really shows its blend.',
  darkBrown: 'Dark brown hair shows a clean fade line nicely.',
  lightBrown: 'Lighter hair hides small imperfections, so a choppy texture looks great.',
  blonde: 'Blonde hair makes texture stand out more than the fade, so play up the top.',
  red: 'Red hair photographs well with texture, so lean into movement on top.',
  gray: 'Silver hair looks sharpest kept neat. Clean lines go a long way.',
}

const ANSWER_REASONS = {
  faceShape: (label) => `Flatters a ${label.toLowerCase()} face shape`,
  hairType: (label) => `Works with ${label.toLowerCase()} hair`,
  thickness: (label) => `Suits ${label.toLowerCase()}-density hair`,
  length: (label) => `${label} length on top, like you wanted`,
  upkeep: () => 'Fits your styling routine',
  vibe: (label) => `Matches the ${label.toLowerCase()} look`,
}

function labelFor(questionId, value) {
  return QUESTIONS.find((q) => q.id === questionId)?.options.find((o) => o.value === value)?.label ?? value
}

export function scoreCuts(answers) {
  const maxScore = QUESTIONS.reduce((sum, q) => sum + q.weight, 0)

  const ranked = CUTS.map((cut) => {
    let score = 0
    const reasons = []
    for (const q of QUESTIONS) {
      if (!q.weight || !answers[q.id]) continue
      if (cut.fits[q.id]?.includes(answers[q.id])) {
        score += q.weight
        reasons.push(ANSWER_REASONS[q.id](labelFor(q.id, answers[q.id])))
      }
    }
    return { ...cut, score, match: Math.round((score / maxScore) * 100), reasons }
  }).sort((a, b) => b.score - a.score)

  const tips = [FACE_TIPS[answers.faceShape], COLOR_TIPS[answers.hairColor]].filter(Boolean)
  if (answers.beard === 'beard') tips.push('Add a beard trim (+$5) when you book to get it shaped up to match.')
  if (answers.beard === 'stubble') tips.push('A quick line-up on your stubble will make the cut look sharper.')

  return { ranked, tips }
}
