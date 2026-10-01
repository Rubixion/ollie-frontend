import type { BlogPost } from "./blog-post-types"
import { a } from "./blog-link"

// Style posts, part 1: face shapes (written 2026-10-01 for Ollie Stylist). Shape shares come from
// celeb_v2/celeb_face_shapes.py: the /ai-stylist face scan's own classifier run on 4,032 celebrities.
export const postsD: BlogPost[] = [
  {
    slug: "face-shape-guide",
    title: "Face Shapes: The 7 Types and How to Tell Yours Apart",
    excerpt: "The 7 face shapes are oval, round, square, oblong, heart, diamond and triangle. How to tell them apart, how common each one is, and what suits each.",
    summary: "There are 7 face shapes: oval, round, square, oblong, heart, diamond and triangle. They are told apart by four measurements: face length, forehead width, cheekbone width and jaw width. When Ollie measured 4,032 celebrities with its face scan, oval was the most common shape (22%), followed by heart (18%) and triangle (14.5%). Diamond was the rarest (9.3%).",
    date: "",
    isoDate: "2026-07-22",
    updatedIsoDate: "2026-10-01",
    readTime: "",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["face shapes", "types of face shapes", "7 face shapes", "face shape chart", "oval face", "round face", "heart shaped face"],
    sections: [
      {
        h2: "The 7 Face Shapes at a Glance",
        paragraphs: [
          "Face shapes describe the outline of your face from the front: how long it is compared with its width, and which of three widths is the biggest. Those widths are the forehead, the cheekbones and the jaw. Every shape is a different mix of the same four measurements.",
          "<strong>Oval:</strong> a little longer than wide, with the cheekbones slightly wider than a gently rounded jaw. <strong>Round:</strong> about as wide as it is long, with full cheeks and a soft jaw. <strong>Square:</strong> a strong, angular jaw about as wide as the forehead and cheekbones. <strong>Oblong</strong> (also called long or rectangle): clearly longer than wide, with straight sides. <strong>Heart:</strong> a wide forehead that tapers to a narrow, often pointed chin. <strong>Diamond:</strong> wide cheekbones with a narrower forehead and chin. <strong>Triangle</strong> (also called pear): a jaw wider than the forehead.",
        ],
      },
      {
        h2: "How Common Is Each Face Shape?",
        paragraphs: [
          "Most face shape guides never say how common each shape is, so Ollie measured it. The face scan in Ollie Stylist was run on one to three straight-on photos of each of 4,032 celebrities in Ollie's index, using exactly the same measurements and rules it uses on you.",
          "The results: <strong>oval 22%</strong>, <strong>heart 18%</strong>, <strong>triangle 14.5%</strong>, <strong>round 12.2%</strong>, <strong>oblong 12.1%</strong>, <strong>square 11.9%</strong> and <strong>diamond 9.3%</strong>. Men and women differ a lot. Heart was the most common shape among women (26.9%, against 12.9% of men), while square faces were mostly male (16.7% of men, only 3.1% of women). Diamond was far more common among women (17.8%) than men (4.6%).",
          "Celebrities aren't a random sample of people, and hair, angle and expression nudge any single photo, so treat these as rough shares rather than census figures. They still show the pattern stylists describe: oval is the most common single shape, but most people are something else.",
        ],
      },
      {
        h2: "How to Tell Your Face Shape Apart",
        paragraphs: [
          "Pull your hair back and look straight at a mirror or a front-facing photo taken at arm's length or further (close selfies widen the middle of the face). Then compare: Is your face clearly longer than it is wide? If yes, you're probably oblong, or oval if the jaw is softly rounded. If length and width are close, you're probably round (soft jaw) or square (angular jaw).",
          "Next, find the widest point. Widest at the forehead points to heart. Widest at the cheekbones, with a narrow forehead and chin, points to diamond. Widest at the jaw points to triangle. For a full walkthrough with a tape measure, see " + a("/blog/what-is-my-face-shape", "how to work out your face shape") + ".",
        ],
      },
      {
        h2: "What Suits Each Face Shape",
        paragraphs: [
          "The rule behind almost all face shape advice is balance: add visual weight where the face is narrow and keep it away from where the face is wide. A round face gains length from height on top and close sides. An oblong face gains width from fuller sides and a fringe, and loses length by avoiding extra height. A square face softens with texture and movement. A heart face balances with volume around the jaw and chin. A diamond face suits fringes and fullness at the temples. A triangle face suits volume on top and at the temples.",
          "The same logic runs through glasses (frames that contrast with your outline), beards (adding or removing width at the jaw) and even necklines. If you'd rather not guess, the " + a("/ai-stylist", "free face scan in Ollie Stylist") + " measures your face in your browser and ranks haircuts, beards and glasses for your shape. Nothing from the scan is uploaded.",
        ],
      },
      {
        h2: "Why Your Face Shape Can Seem to Change",
        paragraphs: [
          "Most faces sit between two shapes, and small things move the reading: your hairline, weight, the angle of the camera and even your expression. That's why Ollie's scan reports how likely each shape is instead of a single label, and scores haircuts against all of them. One photo can't pin a face shape down exactly. If two shapes come out close, the advice for both usually overlaps, and the cuts that suit both are the safest bet.",
        ],
      },
    ],
    faqs: [
      { q: "What are the 7 face shapes?", a: "Oval, round, square, oblong (long), heart, diamond and triangle (pear). They differ in face length compared with width and in which part is widest: forehead, cheekbones or jaw." },
      { q: "What is the most common face shape?", a: "In Ollie's measurement of 4,032 celebrities, oval was the most common (22%), followed by heart (18%) and triangle (14.5%). Diamond was the rarest at 9.3%." },
      { q: "What is the most attractive face shape?", a: "No shape is objectively most attractive. Oval is often called the ideal only because its balanced proportions suit the most haircuts and frames. Research on attractiveness points more to averageness, symmetry and clear skin than to outline shape." },
      { q: "Can your face shape change?", a: "Your bone structure stays the same in adulthood, but weight, ageing and hairline changes can shift how your outline reads. Many people also sit between two shapes, so their result can differ from photo to photo." },
    ],
    relatedSlugs: ["what-is-my-face-shape", "best-haircut-for-face-shape", "celebrity-face-shapes"],
  },
  {
    slug: "what-is-my-face-shape",
    title: "What Is My Face Shape? How to Tell in 60 Seconds",
    excerpt: "Find your face shape in 60 seconds with a mirror, or measure it with a tape: the four measurements that decide whether you're oval, round, square, heart and more.",
    summary: "To find your face shape, compare four measurements: face length (hairline to chin), forehead width, cheekbone width and jaw width. If your face is clearly longer than wide it is oval or oblong; if length and width are close it is round or square. Then the widest point decides the rest: forehead for heart, cheekbones for diamond, jaw for triangle.",
    date: "",
    isoDate: "",
    readTime: "",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["what is my face shape", "how to determine face shape", "how to find your face shape", "face shape test", "how to measure face shape"],
    sections: [
      {
        h2: "The 60-Second Mirror Test",
        paragraphs: [
          "Tie or push your hair back so your hairline, temples and jaw are visible. Stand square to a mirror, or take a photo with the back camera from about a metre away; a close front-camera selfie makes the middle of the face look wider than it is. Keep your expression neutral, because a big smile widens the lower face.",
          "Now answer two questions. First: is your face clearly longer than it is wide? Second: where is it widest, at the forehead, the cheekbones or the jaw? Those two answers are enough to place most faces.",
        ],
      },
      {
        h2: "Reading Your Answers",
        paragraphs: [
          "<strong>Clearly longer than wide, soft jaw:</strong> oval. <strong>Clearly longer than wide, straight sides and a squarer jaw:</strong> oblong. <strong>About as wide as long, soft jaw and full cheeks:</strong> round. <strong>About as wide as long, sharp angular jaw:</strong> square.",
          "<strong>Widest at the forehead, narrowing to a slim or pointed chin:</strong> heart. <strong>Widest at the cheekbones, narrower forehead and chin:</strong> diamond. <strong>Widest at the jaw, narrower forehead:</strong> triangle. If you fit two descriptions, you're probably between shapes, which is very common.",
        ],
      },
      {
        h2: "The Tape Measure Method",
        paragraphs: [
          "For a firmer answer, use a soft tape measure. Measure four things: <strong>face length</strong> from the centre of your hairline to the tip of your chin; <strong>forehead width</strong> across the widest part, usually halfway between eyebrows and hairline; <strong>cheekbone width</strong> across the high points just below the outer corners of your eyes; and <strong>jaw width</strong> from the corner of the jaw below one ear to the same point on the other side.",
          "Compare length with cheekbone width. A face about 1.5 times as long as it is wide reads as oval; much longer reads as oblong; close to equal reads as round or square. Then compare the three widths to find the widest point. Measurements from a tape are rarely exact to the millimetre, so look for clear differences rather than tiny ones.",
        ],
      },
      {
        h2: "Let a Face Scan Measure It",
        paragraphs: [
          "The " + a("/ai-stylist", "free face scan in Ollie Stylist") + " does the same job with your camera. It finds 478 points on your face, measures the same four proportions over several straight-on frames, and compares them with norms taken from thousands of real faces. It then tells you how likely each of the 7 shapes is, not just one label, and ranks haircuts, beards and glasses to match. The scan runs entirely in your browser and nothing from it is uploaded.",
          "Why probabilities? When Ollie tested the scan on celebrity photos, the same person's measurements varied photo to photo by about two thirds as much as they varied between different people. In plain terms, one photo can't settle a borderline case, so the best advice is advice that works for the shapes you're closest to.",
        ],
      },
      {
        h2: "Common Mistakes That Give the Wrong Shape",
        paragraphs: [
          "Hair covering the forehead or jaw hides two of the four measurements. A tilted head shortens or lengthens the face. Smiling widens the jaw. Wide-angle selfies inflate the nose and cheeks. And weight changes soften the jaw, which can make a square face read as round. Check your shape on two or three photos taken on different days before you book a big haircut around it.",
          "Once you know your shape, see " + a("/blog/best-haircut-for-face-shape", "the best haircut for each face shape") + " or the full guide to " + a("/blog/face-shape-guide", "all 7 face shapes") + ".",
        ],
      },
    ],
    faqs: [
      { q: "How do I know my face shape?", a: "Pull your hair back and compare your face length with its width, then find the widest point: forehead (heart), cheekbones (diamond) or jaw (triangle). Long faces are oval or oblong; faces about as wide as long are round or square." },
      { q: "How do I measure my face shape?", a: "Measure face length from hairline to chin, then forehead, cheekbone and jaw width. Compare length with cheekbone width, and find which of the three widths is largest." },
      { q: "Is there an app that tells your face shape?", a: "Yes. Ollie Stylist's free face scan measures your face shape in the browser with your camera, shows how likely each of the 7 shapes is and suggests haircuts, beards and glasses. Nothing from the scan is uploaded." },
      { q: "Why do I get different face shapes in different photos?", a: "Camera distance, head tilt, expression and hair all move the measurements, and many faces sit between two shapes. Check several straight-on photos and focus on the shapes you get most often." },
    ],
    relatedSlugs: ["face-shape-guide", "oval-vs-round-face", "best-haircut-for-face-shape"],
  },
  {
    slug: "heart-shaped-face",
    title: "Heart Shaped Face: Signs, Best Haircuts and Famous Examples",
    excerpt: "A heart shaped face is widest at the forehead and narrows to a slim chin. The signs, what suits it, and celebrities whose faces Ollie measured as heart shaped.",
    summary: "A heart shaped face is widest at the forehead and tapers through the cheeks to a narrow, often pointed chin, sometimes with a widow's peak. It suits haircuts that add width around the jaw, such as chin-length bobs, side-swept fringes and waves from the cheekbones down. It is common: 18% of the 4,032 celebrities Ollie measured were heart shaped, including Ariana Grande, Beyoncé and Sydney Sweeney.",
    date: "",
    isoDate: "",
    readTime: "",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["heart shaped face", "heart face shape", "heart shape face meaning", "heart shaped face men", "heart vs oval face"],
    sections: [
      {
        h2: "What Is a Heart Shaped Face?",
        paragraphs: [
          "A heart shaped face is widest across the forehead and narrows steadily through the cheekbones to a slim chin. The chin is often slightly pointed, and some heart shaped faces have a widow's peak, a V-shaped point in the hairline that completes the 'heart' outline. The jaw is narrower than both the forehead and the cheekbones.",
          "It's sometimes called an inverted triangle face, because the outline is the opposite of a triangle face, which is widest at the jaw.",
        ],
      },
      {
        h2: "Signs You Have a Heart Shaped Face",
        paragraphs: [
          "With your hair pulled back, check three things. Your forehead is the widest part of your face. Your cheekbones are wide but a little narrower than your forehead. Your jaw narrows noticeably toward a small chin. If your forehead and cheekbones are about equal and the chin is narrow, you may sit between heart and diamond.",
          "The most common mix-up is with oval. An oval face also narrows toward the chin, but gently, and its widest point is the cheekbones rather than the forehead. If the narrowing is sharp and starts high, it's heart. For a side-by-side comparison, see " + a("/blog/oval-vs-round-face", "oval vs round vs heart faces") + ".",
        ],
      },
      {
        h2: "How Common Are Heart Shaped Faces?",
        paragraphs: [
          "More common than most guides suggest. When Ollie ran its face scan on 4,032 celebrities, 18% came out heart shaped, second only to oval. Among women it was the single most common shape, at 26.9%. Among men it was 12.9%.",
          "Celebrities the scan measured as clearly heart shaped include Ariana Grande, Beyoncé, Sydney Sweeney, Anya Taylor-Joy, Lupita Nyong'o, Reese Witherspoon, Carey Mulligan and Amanda Seyfried, and among men David Beckham and Robert Lewandowski. See the full list of " + a("/blog/celebrities-with-heart-shaped-faces", "celebrities with heart shaped faces") + ".",
        ],
      },
      {
        h2: "What Suits a Heart Shaped Face",
        paragraphs: [
          "The aim is to balance a wide forehead with a narrow chin. That means adding width and movement in the lower half of the face and keeping height and bulk off the top. Chin-length bobs and lobs, waves or curls that start around the cheekbones, side-swept or curtain fringes that cover part of the forehead, and layers that flick out at the jaw all do this.",
          "Very short, slicked-back styles that expose the whole forehead, and lots of volume at the crown, do the opposite. For men, a medium-length textured crop with a side part works well, and a fuller beard adds width at the jaw. More options are in " + a("/blog/heart-shaped-face-haircuts", "haircuts for heart shaped faces") + ".",
        ],
      },
      {
        h2: "Glasses, Brows and Makeup for Heart Faces",
        paragraphs: [
          "Frames that are wider at the bottom, rimless frames or light colours keep attention away from the forehead. Oval and round frames soften the narrow chin. Very top-heavy frames, such as heavy browline styles, add width where you already have it.",
          "Soft, rounded brows suit heart faces better than sharply arched ones. If you use contour, a little at the temples and highlight on the chin balance the outline. To check whether you're heart shaped, the " + a("/ai-stylist", "free face scan in Ollie Stylist") + " measures it in your browser.",
        ],
      },
    ],
    faqs: [
      { q: "What does a heart shaped face look like?", a: "It is widest at the forehead and narrows through the cheekbones to a slim, often pointed chin, sometimes with a widow's peak in the hairline." },
      { q: "How common is a heart shaped face?", a: "In Ollie's scan of 4,032 celebrities, 18% had heart shaped faces, the second most common shape. It was the most common shape among women at 26.9%." },
      { q: "What hairstyle suits a heart shaped face?", a: "Styles that add width at the jaw and cover part of the forehead: chin-length bobs and lobs, side-swept or curtain fringes, and waves or layers from the cheekbones down." },
      { q: "Can men have a heart shaped face?", a: "Yes. 12.9% of the men Ollie measured were heart shaped. Medium-length textured cuts with a side part and a fuller beard balance a narrow chin." },
    ],
    relatedSlugs: ["heart-shaped-face-haircuts", "celebrities-with-heart-shaped-faces", "oval-vs-round-face"],
  },
  {
    slug: "oblong-face-shape",
    title: "Oblong Face Shape: How to Tell and What Suits a Long Face",
    excerpt: "An oblong face is clearly longer than it is wide, with straight sides. How to tell it from oval, plus the haircuts, beards and glasses that balance a long face.",
    summary: "An oblong face shape, also called a long or rectangle face, is clearly longer than it is wide, with a forehead, cheekbones and jaw of similar width. It is balanced by adding width and taking away length: fringes, fuller sides, waves and shoulder-length or shorter cuts, and avoiding height on top. 12.1% of the celebrities Ollie measured were oblong.",
    date: "",
    isoDate: "",
    readTime: "",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["oblong face shape", "long face shape", "rectangle face shape", "oblong face", "oblong face hairstyles"],
    sections: [
      {
        h2: "What Is an Oblong Face Shape?",
        paragraphs: [
          "An oblong face is noticeably longer than it is wide, and its sides run fairly straight: the forehead, cheekbones and jaw are close in width. Many have a tall forehead or a long chin. It's also called a long face, or a rectangle face when the jaw is square.",
          "Oblong faces are common. In Ollie's face scan of 4,032 celebrities, 12.1% came out oblong, with men slightly more likely (13.8%) than women (9%). Celebrities the scan measured as clearly oblong include Adam Sandler, Jon Bernthal, Paul Rudd, Glen Powell, Sarah Jessica Parker, Cindy Crawford and Catherine, Princess of Wales.",
        ],
      },
      {
        h2: "Oblong vs Oval: How to Tell",
        paragraphs: [
          "Both are longer than wide. The difference is the sides. An oval face curves: the cheekbones are the widest point and the jaw rounds off gently. An oblong face is straighter, with little difference between forehead, cheekbones and jaw, and it is usually longer overall. If your jaw is angular and the face is long, you're oblong (rectangle) rather than oval.",
          "A tape measure helps: an oval face is roughly one and a half times as long as it is wide; an oblong face is longer than that. Not sure? The " + a("/ai-stylist", "free face scan in Ollie Stylist") + " measures your proportions in your browser and shows how likely each shape is.",
        ],
      },
      {
        h2: "The Rule for Long Faces: Add Width, Not Height",
        paragraphs: [
          "Everything that suits an oblong face follows one idea: make the face look a little wider and a little shorter. Width comes from fullness at the sides, waves, curls and layers around the cheekbones. Length comes off with a fringe, which shortens the forehead, and with cuts that end around the chin or shoulders instead of far below them.",
          "What to avoid: lots of height at the crown, very long straight hair with a centre part, and tight sides with a tall top. All three stretch the face further.",
        ],
      },
      {
        h2: "Haircuts That Suit an Oblong Face",
        paragraphs: [
          "For longer hair: a lob or shoulder-length cut with soft waves, curtain bangs or a full straight fringe, and layers starting at the cheekbones. A chin-length bob with volume at the sides is one of the most flattering cuts for a long face.",
          "For men: a classic side part with some fullness at the sides, a textured crop with a fringe pushed forward, or a medium-length messy cut. Skip high fades with a tall quiff or pompadour. The full list is in " + a("/blog/hairstyles-for-long-faces", "hairstyles for long faces") + ".",
        ],
      },
      {
        h2: "Beards and Glasses for a Long Face",
        paragraphs: [
          "A beard that is fuller on the sides than at the chin adds width; a long pointed beard adds length, so keep the chin area shorter. Light stubble or a short boxed beard both work.",
          "Deep, wide frames with a strong top line cut the length of the face. Oversized, square or aviator frames work well; small, narrow frames make a long face look longer. Decorative temples (the arms of the glasses) also add width.",
        ],
      },
    ],
    faqs: [
      { q: "What is an oblong face shape?", a: "A face that is clearly longer than it is wide, with forehead, cheekbones and jaw of similar width. It's also called a long or rectangle face." },
      { q: "Is an oblong face the same as an oval face?", a: "No. Both are longer than wide, but an oval face curves, with the cheekbones widest and a rounded jaw, while an oblong face has straighter sides and is usually longer." },
      { q: "What haircut suits an oblong face?", a: "Cuts that add width and reduce length: fringes, chin- to shoulder-length bobs and lobs, waves and side volume. For men, side parts and textured crops without a tall top." },
      { q: "How common is an oblong face?", a: "12.1% of the 4,032 celebrities Ollie measured had oblong faces: 13.8% of men and 9% of women." },
    ],
    relatedSlugs: ["hairstyles-for-long-faces", "face-shape-guide", "what-is-my-face-shape"],
  },
  {
    slug: "haircuts-for-round-faces",
    title: "Haircuts for Round Faces: 15 Cuts That Slim and Lengthen",
    excerpt: "15 haircuts for round faces that add length and angles, from long layers and lobs to pixies and curtain bangs, plus the cuts to avoid.",
    summary: "The best haircuts for round faces add length and angles: long layers, a lob that falls past the chin, side parts, side-swept or curtain bangs, and pixie cuts with height on top. Avoid chin-length blunt bobs, heavy straight-across fringes and volume at the cheeks, which make a round face look wider. Round faces are about as wide as they are long, with full cheeks and a soft jaw.",
    date: "",
    isoDate: "",
    readTime: "",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["haircuts for round faces", "best haircuts for round faces", "hairstyles for round faces", "round face haircuts", "round face hairstyles female"],
    sections: [
      {
        h2: "What Makes a Haircut Work for a Round Face",
        paragraphs: [
          "A round face is about as wide as it is long, with full cheeks and a soft, rounded jaw. Flattering cuts do two things: they add vertical lines that make the face look longer, and they add angles that contrast with the curves. Length below the chin, height at the crown, side parts and face-framing pieces that fall past the cheeks all help.",
          "Cuts that end right at the widest part of the face, at the cheeks or the chin, draw a horizontal line there and make it look wider. Here are 15 cuts that work, from long to short.",
        ],
      },
      {
        h2: "1. Long Layers",
        paragraphs: ["Long hair with layers starting below the chin creates vertical lines and movement without bulk at the cheeks. Keep the shortest layer at or below the collarbone."],
      },
      {
        h2: "2. The Lob (Long Bob)",
        paragraphs: ["A lob that falls 3 to 5 centimetres past the chin elongates the neck and face. A slight angle, longer at the front, adds a flattering diagonal line."],
      },
      {
        h2: "3. Deep Side Part",
        paragraphs: ["Moving your part to one side breaks the symmetry of a round face and creates an asymmetric line. It works with almost every length and costs nothing."],
      },
      {
        h2: "4. Curtain Bangs",
        paragraphs: ["Bangs parted in the middle and swept outward frame the face in a soft V shape. Keep them long enough to fall past the cheekbones. More in " + a("/blog/bangs-for-round-face", "bangs for round faces") + "."],
      },
      {
        h2: "5. Side-Swept Bangs",
        paragraphs: ["A long side-swept fringe cuts a diagonal across the forehead, which slims the face more than a straight-across fringe."],
      },
      {
        h2: "6. Face-Framing Layers",
        paragraphs: ["Shorter pieces at the front that start around the chin and angle down create lines that run along the face rather than across it."],
      },
      {
        h2: "7. Pixie Cut With Height",
        paragraphs: ["A pixie can suit a round face if it has height and texture on top and close sides. Avoid a flat, rounded pixie that hugs the head. See " + a("/blog/short-hair-round-face", "short hair for round faces") + " for more short options."],
      },
      {
        h2: "8. Asymmetric Bob",
        paragraphs: ["A bob that is longer on one side adds angles and draws the eye diagonally. Keep the longer side below the chin."],
      },
      {
        h2: "9. Shag With Long Layers",
        paragraphs: ["A modern shag adds texture at the crown and choppy layers around the face. Ask for the volume on top rather than at the sides."],
      },
      {
        h2: "10. Sleek Long Straight Hair",
        paragraphs: ["Straight hair worn long and close to the face creates strong vertical lines. A middle part is fine here as long as the hair falls past the shoulders."],
      },
      {
        h2: "11. Voluminous Crown, Smooth Sides",
        paragraphs: ["Whatever the length, volume at the crown and flatter sides lengthen the face. A half-up style with height at the back does this for long hair."],
      },
      {
        h2: "12. Long Waves",
        paragraphs: ["Loose waves starting below the chin add movement without width at the cheeks. Waves that start too high widen the face."],
      },
      {
        h2: "13. High Ponytail or Top Knot",
        paragraphs: ["Pulling hair up high adds height. Leaving a few face-framing strands at the front keeps it soft."],
      },
      {
        h2: "14. Layered Curls",
        paragraphs: ["Curly hair suits round faces when the volume is kept on top and the shape is longer than it is wide. See " + a("/blog/curly-hair-round-face", "curly hair for round faces") + "."],
      },
      {
        h2: "15. Tapered Pixie With a Side Fringe",
        paragraphs: ["A tapered nape and a longer side-swept fringe create an angled line from forehead to jaw, one of the most slimming short cuts."],
      },
      {
        h2: "Cuts to Avoid With a Round Face",
        paragraphs: [
          "A chin-length blunt bob creates a horizontal line at the widest part of the face. A heavy, straight-across fringe shortens the face. Tight curls or volume at cheek level add width. Slicking everything back with no height exposes the full outline.",
          "Not sure your face is round? Round is often confused with oval or square. The " + a("/ai-stylist", "free face scan in Ollie Stylist") + " measures your proportions in your browser and ranks haircuts for your shape.",
        ],
      },
    ],
    faqs: [
      { q: "What is the best haircut for a round face?", a: "Cuts that add length and angles: long layers, a lob past the chin, a deep side part, side-swept or curtain bangs and pixies with height on top." },
      { q: "Should round faces have short or long hair?", a: "Both work. Long hair lengthens the face naturally; short cuts work when they have height on top and close sides. Avoid lengths that end right at the cheeks or chin." },
      { q: "Do bangs suit a round face?", a: "Yes, if they are side-swept or curtain bangs that fall past the cheekbones. Heavy straight-across bangs shorten the face and make it look rounder." },
      { q: "What haircut makes a round face look slimmer?", a: "Long layers, an angled lob, a deep side part and face-framing layers create vertical and diagonal lines that slim a round face." },
    ],
    relatedSlugs: ["short-hair-round-face", "layered-haircut-round-face", "round-face-haircuts-men"],
  },
  {
    slug: "round-face-haircuts-men",
    title: "Round Face Haircuts for Men: 12 Cuts That Add Angles",
    excerpt: "12 haircuts for men with round faces: fades with height, quiffs, side parts and textured crops, plus how a beard sharpens a round jaw.",
    summary: "The best haircuts for men with round faces keep the sides short and add height on top, which lengthens the face and adds angles: a high fade with a quiff, a pompadour, an undercut, a side part or a textured crop with height. Avoid bowl cuts, heavy fringes and length at the sides. A beard kept longer at the chin than the cheeks also sharpens a round jaw.",
    date: "",
    isoDate: "",
    readTime: "",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["round face haircuts men", "haircuts for round faces men", "best haircut for round face male", "round face hairstyles men", "chubby face haircuts men"],
    sections: [
      {
        h2: "The Formula: Short Sides, Height on Top",
        paragraphs: [
          "A round face is about as wide as it is long, with full cheeks and a soft jaw. The goal of a haircut is to make the face read longer and more angular. Short or faded sides narrow the head, and height on top adds length. Sharp lines, like a hard part or a clean edge-up, add the angles a round face lacks.",
          "Among the celebrities Ollie's face scan measured as clearly round are Ed Sheeran, Virat Kohli, Max Verstappen, Lando Norris and Finn Wolfhard. Here are 12 cuts that suit a round face.",
        ],
      },
      { h2: "1. High Fade With a Quiff", paragraphs: ["The classic choice: sides faded high and tight, with a quiff swept up and back. It adds the most height and the most length."] },
      { h2: "2. Pompadour", paragraphs: ["Longer hair on top swept up and back into volume, with short sides. It needs product and a few minutes each morning, but it lengthens a round face more than almost anything."] },
      { h2: "3. Undercut", paragraphs: ["Disconnected short sides with longer hair on top. Style the top up or to the side; avoid letting it fall flat forward."] },
      { h2: "4. Side Part With a Taper", paragraphs: ["A hard or natural side part adds a strong line, and tapered sides keep width down. It reads smart and suits beards well."] },
      { h2: "5. Textured Crop With Height", paragraphs: ["A crop works on a round face if the top is textured and pushed up rather than combed flat into a straight fringe. Ask for a high fade so the sides stay tight."] },
      { h2: "6. Faux Hawk", paragraphs: ["Hair pushed toward the centre to form a ridge adds height and a vertical line without the commitment of a mohawk."] },
      { h2: "7. Spiky Hair", paragraphs: ["Short spikes with matte product add height and texture. Keep the sides short so the spikes do the work."] },
      { h2: "8. Slick Back With a Fade", paragraphs: ["Hair swept straight back with volume at the front, combined with faded sides. Flat slick-backs with no lift can make a round face look fuller, so keep some height."] },
      { h2: "9. Angular Fringe", paragraphs: ["A fringe cut on a diagonal across the forehead adds a sharp line. Avoid a straight, heavy fringe."] },
      { h2: "10. Comb Over Fade", paragraphs: ["A side-swept top with a fade underneath. It combines a side part's asymmetry with tight sides."] },
      { h2: "11. Brush Up", paragraphs: ["Medium-length hair brushed straight up from the forehead, with short sides. Easier to style than a pompadour and nearly as lengthening."] },
      { h2: "12. Buzz Cut With a Beard", paragraphs: ["A buzz cut on its own can emphasise roundness, but paired with a well-shaped beard that is longer at the chin, it lengthens the face. More on whether it suits you in " + a("/blog/buzz-cut-face-shape", "buzz cuts by face shape") + "."] },
      {
        h2: "What to Avoid",
        paragraphs: [
          "Bowl cuts and heavy, straight fringes shorten the face. Long or puffy sides add width at the cheeks. A centre part with flat hair on both sides draws attention to a round outline.",
        ],
      },
      {
        h2: "Using a Beard to Sharpen a Round Face",
        paragraphs: [
          "A beard is the easiest way to add angles. Keep the cheeks short and tidy and let the chin grow a little longer, so the beard extends the face downward. A defined cheek line and neckline make the jaw look sharper. See " + a("/blog/beard-styles-round-face", "beard styles for round faces") + " for specific styles.",
          "Want to check you're round and not square or oval? The " + a("/ai-stylist", "free face scan in Ollie Stylist") + " measures your face shape in your browser and ranks haircuts and beards for it.",
        ],
      },
    ],
    faqs: [
      { q: "What haircut is best for a round face male?", a: "A high fade or undercut with height on top, such as a quiff, pompadour or brush up. Short sides narrow the face and height lengthens it." },
      { q: "Should men with round faces have long hair?", a: "Long hair can work if it is layered and kept off the cheeks, but short sides with height on top is the most reliable way to lengthen a round face." },
      { q: "Does a beard help a round face?", a: "Yes. A beard that is short on the cheeks and longer at the chin lengthens a round face and adds a defined jawline." },
      { q: "Which famous men have round faces?", a: "Celebrities Ollie's face scan measured as clearly round include Ed Sheeran, Virat Kohli, Max Verstappen, Lando Norris and Finn Wolfhard." },
    ],
    relatedSlugs: ["beard-styles-round-face", "haircuts-for-round-faces", "celebrities-with-round-faces"],
  },
  {
    slug: "short-hair-round-face",
    title: "Short Hair for Round Faces: Pixies, Bobs and Lobs That Work",
    excerpt: "Yes, round faces can wear short hair. The pixies, bobs and lobs that lengthen a round face, and the one length to stay away from.",
    summary: "Short hair suits round faces when it adds height and angles. The best short cuts for a round face are a pixie with volume on top, a long pixie with a side-swept fringe, an angled or asymmetric bob, and a lob that ends a few centimetres below the chin. The one length to avoid is a blunt bob that ends exactly at the chin, which draws a line across the widest part of the face.",
    date: "",
    isoDate: "",
    readTime: "",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["short hair for round face", "short haircuts for round faces", "pixie cut round face", "bob for round face", "lob round face"],
    sections: [
      {
        h2: "Can You Have Short Hair With a Round Face?",
        paragraphs: [
          "Yes. The myth that round faces need long hair comes from cuts that end at the cheeks or chin, the widest part of a round face. Short hair that adds height on top and keeps the sides close actually lengthens the face, and it shows off the cheekbones and neck.",
          "The key ideas: volume at the crown, not the sides; asymmetry or a side part; and either clearly above the cheeks (a pixie) or clearly below the chin (a lob).",
        ],
      },
      {
        h2: "Pixie Cuts for Round Faces",
        paragraphs: [
          "<strong>Textured pixie with height:</strong> short, tapered sides and a longer, piecey top styled up. The height does the lengthening. <strong>Long pixie with a side fringe:</strong> a longer pixie with a sweeping fringe that crosses the forehead diagonally. It's softer and very slimming. <strong>Undercut pixie:</strong> a shaved or very short side and nape with length on top; bold, and it removes width completely.",
          "Avoid a rounded 'helmet' pixie that follows the curve of the head; it repeats the round outline. A pixie needs a trim every four to six weeks to keep its shape.",
        ],
      },
      {
        h2: "Bobs for Round Faces",
        paragraphs: [
          "<strong>Angled (A-line) bob:</strong> shorter at the back and longer at the front, so the front pieces fall below the chin and create a diagonal line. <strong>Asymmetric bob:</strong> longer on one side, usually worn with a deep side part. <strong>Textured bob with a side part:</strong> choppy ends and lift at the root keep it from looking round.",
          "The bob to avoid is the blunt, chin-length bob with a centre part. It frames the face in a horizontal line right at its widest point.",
        ],
      },
      {
        h2: "Lobs for Round Faces",
        paragraphs: [
          "A lob (long bob) ending at the collarbone is the safest short-ish cut for a round face. It's short enough to feel fresh and long enough to lengthen. Add face-framing layers or soft waves that start below the chin. A slight angle toward the front helps further.",
          "For more lengths, see the full guide to " + a("/blog/haircuts-for-round-faces", "haircuts for round faces") + ".",
        ],
      },
      {
        h2: "Styling Short Hair on a Round Face",
        paragraphs: [
          "Blow-dry with your fingers lifting at the root, and use texture spray or a light paste to keep volume at the crown. Tuck one side behind the ear for instant asymmetry. Don't flatten the top or curl the sides outward at cheek level.",
          "Before cutting, it's worth confirming your shape. The " + a("/ai-stylist", "free face scan in Ollie Stylist") + " measures it in your browser and ranks short and long cuts for your face. With Ollie Pro you can try a cut on your own photo before you book.",
        ],
      },
    ],
    faqs: [
      { q: "Does short hair suit a round face?", a: "Yes, when it adds height on top and keeps the sides close. Pixies with volume, angled bobs and lobs below the chin all lengthen a round face." },
      { q: "What length should I avoid with a round face?", a: "A blunt bob that ends exactly at the chin, especially with a centre part. It draws a horizontal line at the widest part of the face." },
      { q: "Is a pixie cut good for a round face?", a: "A textured pixie with height on top or a long pixie with a side fringe suits a round face. Avoid a flat, rounded pixie that follows the curve of the head." },
    ],
    relatedSlugs: ["haircuts-for-round-faces", "bangs-for-round-face", "layered-haircut-round-face"],
  },
  {
    slug: "haircuts-for-oval-faces",
    title: "Haircuts for Oval Faces: Why Almost Everything Works",
    excerpt: "Oval faces suit almost every haircut. Why that is, which cuts show the shape off best, and the few things that can still go wrong.",
    summary: "Oval faces suit almost every haircut because their proportions are balanced: a little longer than wide, cheekbones slightly wider than a softly rounded jaw. Cuts that show the shape off include long layers, a lob, a blunt bob, curtain bangs, a pixie and a shag. The only real risks are styles that hide the face completely or add a lot of height, which can make an oval face look long.",
    date: "",
    isoDate: "",
    readTime: "",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["haircuts for oval faces", "oval face shape hairstyles", "hairstyles for oval faces", "oval face haircut", "best haircut for oval face female"],
    sections: [
      {
        h2: "Why Oval Faces Suit Almost Any Haircut",
        paragraphs: [
          "Most haircut advice is about balance: adding width to narrow places or length to short faces. An oval face is already balanced. It's about one and a half times as long as it is wide, the cheekbones are the widest point, and the forehead and jaw are similar and gently rounded. There's nothing to correct, so the haircut can follow taste, hair type and lifestyle instead.",
          "Oval is also the most common face shape. In Ollie's face scan of 4,032 celebrities, 22% came out oval, more than any other shape. Celebrities it measured as oval include Anne Hathaway, Angelina Jolie, Priyanka Chopra, Emma Thompson and Julianne Moore.",
        ],
      },
      {
        h2: "Cuts That Show an Oval Face Off Best",
        paragraphs: [
          "<strong>Blunt bob:</strong> a chin-length bob, which can widen other face shapes, frames an oval face neatly. <strong>Pixie cut:</strong> short cuts show the balanced outline and cheekbones; Anne Hathaway's short cut for Les Misérables is a well-known example. <strong>Long layers:</strong> movement without hiding the face. <strong>Lob:</strong> collarbone length, straight or wavy.",
          "<strong>Curtain bangs or a full fringe:</strong> an oval face can carry a straight, heavy fringe that would shorten a round face too much. <strong>Shag or wolf cut:</strong> lots of texture works because there's no width to worry about. <strong>Centre parts:</strong> an oval face is symmetric enough to wear a centre part with any length.",
        ],
      },
      {
        h2: "The Few Things That Can Go Wrong",
        paragraphs: [
          "An oval face can look long if you add a lot of height at the crown and keep the sides flat, or wear very long straight hair with a centre part and nothing around the face. If your face is at the longer end of oval, a fringe or some side volume keeps it balanced.",
          "Heavy curtains of hair hiding the cheekbones waste the shape's main advantage. And it's worth checking you really are oval: oval is the shape people most often assume, and it's easily confused with oblong or heart. For the men's version, see " + a("/blog/oval-face-haircuts-men", "haircuts for oval faces (men)") + ".",
        ],
      },
      {
        h2: "Choosing Between So Many Options",
        paragraphs: [
          "When almost anything works, decide by hair type and upkeep. Fine, straight hair suits blunt bobs and lobs, which make the ends look thicker. Thick or wavy hair suits layers and shags, which remove weight. If you want low maintenance, choose a length that's easy to tie back. If you like a change, a fringe is the cheapest way to get one.",
          "The " + a("/ai-stylist", "free face scan in Ollie Stylist") + " confirms whether you're oval and ranks cuts for your shape and hair texture. With Ollie Pro you can try several on your own photo before you choose.",
        ],
      },
    ],
    faqs: [
      { q: "What haircut suits an oval face?", a: "Almost any: bobs, pixies, lobs, long layers, shags and fringes all suit an oval face because its proportions are already balanced." },
      { q: "Why is the oval face shape considered ideal?", a: "Because its balanced proportions suit the widest range of haircuts, glasses and styles, not because it is more attractive. It is also the most common shape: 22% of the celebrities Ollie measured." },
      { q: "What should oval faces avoid?", a: "Too much height on top with flat sides, or very long straight hair with nothing around the face, which can make an oval face look long." },
    ],
    relatedSlugs: ["oval-face-haircuts-men", "celebrities-with-oval-faces", "face-shape-guide"],
  },
]
