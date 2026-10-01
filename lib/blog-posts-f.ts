import type { BlogPost } from "./blog-post-types"
import { a } from "./blog-link"

// Style posts, part 3: haircut guides for specific problems, and the celebrity face shape data (Liam: the method).
export const postsF: BlogPost[] = [
  {
    slug: "best-haircut-for-face-shape",
    title: "The Best Haircut for Your Face Shape: A Chart for All 7",
    excerpt: "A quick chart of the best haircuts for all 7 face shapes, for women and men, plus the one rule behind all face shape advice.",
    summary: "The best haircut for your face shape balances it: oval suits almost anything; round suits height and length (lobs, side parts, quiffs); square suits soft texture and layers; oblong suits fringes and side volume; heart suits chin-length bobs and side fringes; diamond suits fringes and chin-length cuts; triangle suits volume on top. The rule behind all of them: add width where your face is narrow and length where it is short.",
    date: "",
    isoDate: "",
    readTime: "",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["best haircut for face shape", "best haircut for my face shape", "what haircut would look good on me", "haircut face shape chart", "what haircut best suits me"],
    sections: [
      {
        h2: "The One Rule Behind Face Shape Haircuts",
        paragraphs: [
          "Every recommendation in this chart comes from the same idea: a haircut changes the outline people see. To balance a face, add visual width where it's narrow, add length where it's short, and keep volume away from the widest part. Fringes shorten; height lengthens; fullness at the sides widens; tight sides narrow.",
          "Don't know your shape yet? Start with " + a("/blog/what-is-my-face-shape", "how to find your face shape") + ".",
        ],
      },
      {
        h2: "Oval",
        paragraphs: ["<strong>Women:</strong> almost anything: blunt bob, pixie, long layers, curtain bangs, shag. <strong>Men:</strong> almost anything: textured crop, side part, buzz cut, quiff, longer flow. <strong>Watch out for:</strong> lots of height with flat sides. Full guides: " + a("/blog/haircuts-for-oval-faces", "women") + ", " + a("/blog/oval-face-haircuts-men", "men") + "."],
      },
      {
        h2: "Round",
        paragraphs: ["<strong>Women:</strong> long layers, lob past the chin, deep side part, side-swept or curtain bangs, pixie with height. <strong>Men:</strong> high fade with a quiff or pompadour, side part, faux hawk; a beard longer at the chin. <strong>Avoid:</strong> chin-length blunt bobs and heavy straight fringes. Full guides: " + a("/blog/haircuts-for-round-faces", "women") + ", " + a("/blog/round-face-haircuts-men", "men") + "."],
      },
      {
        h2: "Square",
        paragraphs: ["<strong>Women:</strong> soft waves, long layers below the jaw, side part, side-swept bangs, textured lob. <strong>Men:</strong> classic short cuts (crew cut, side part, textured crop); add texture to soften. <strong>Avoid:</strong> blunt cuts ending at the jaw, boxy flat tops. " + a("/blog/square-face-hairstyles", "Full guide") + "."],
      },
      {
        h2: "Oblong (Long)",
        paragraphs: ["<strong>Women:</strong> full or curtain fringe, chin- to shoulder-length bob, waves at the sides. <strong>Men:</strong> side part with fuller sides, textured crop with a fringe, Caesar cut. <strong>Avoid:</strong> height at the crown, very long straight hair. " + a("/blog/hairstyles-for-long-faces", "Full guide") + "."],
      },
      {
        h2: "Heart",
        paragraphs: ["<strong>Women:</strong> chin-length bob, lob with waves, side-swept or curtain bangs, layers from the chin. <strong>Men:</strong> medium length with a side part or textured fringe; a beard to widen the chin. <strong>Avoid:</strong> volume at the crown, slicked-back styles. " + a("/blog/heart-shaped-face-haircuts", "Full guide") + "."],
      },
      {
        h2: "Diamond",
        paragraphs: ["<strong>Women:</strong> fringes, chin-length bob, side-swept layers, hair tucked behind the ears. <strong>Men:</strong> textured fringe or crop with fuller sides; a beard. <strong>Avoid:</strong> volume at the cheekbones, tight skin fades. " + a("/blog/diamond-face-shape-hairstyles", "Full guide") + "."],
      },
      {
        h2: "Triangle (Pear)",
        paragraphs: ["<strong>Women:</strong> volume at the crown and temples, side-swept fringe, layers from the cheekbones, length past the jaw. <strong>Men:</strong> textured quiff or side part with some side fullness; short beard sides. <strong>Avoid:</strong> bobs that flare at the jaw. " + a("/blog/triangle-face-shape", "Full guide") + "."],
      },
      {
        h2: "Face Shape Isn't the Only Thing",
        paragraphs: [
          "Hair type matters as much as shape. Fine hair looks thicker in blunt cuts; thick hair needs layers to remove weight; curls need length to hang; cowlicks decide where a part can go. Lifestyle matters too: a pompadour needs styling every morning, a crop doesn't.",
          "The " + a("/ai-stylist", "free face scan in Ollie Stylist") + " combines your measured face shape with your hair texture to rank cuts, and Ollie Pro shows the top picks on your own photo, so you can see a cut before you commit to it.",
        ],
      },
    ],
    faqs: [
      { q: "How do I know what haircut will suit me?", a: "Find your face shape, then pick cuts that balance it: width where your face is narrow and length where it's short. Then filter by hair type and how much styling you want." },
      { q: "Is there an app that shows what haircut suits me?", a: "Ollie Stylist's free face scan measures your face shape in the browser and ranks haircuts for it; Ollie Pro tries the cuts on your own photo." },
      { q: "What haircut suits every face shape?", a: "A shoulder-length cut with soft layers and a side part is the closest to universal, because it adds a little length and a little width without extremes." },
    ],
    relatedSlugs: ["what-is-my-face-shape", "face-shape-guide", "how-to-ask-for-a-haircut"],
  },
  {
    slug: "haircuts-for-chubby-faces",
    title: "Haircuts for Chubby Faces and Double Chins",
    excerpt: "Haircuts that slim a chubby face and draw attention away from a double chin, for women and men, plus the styling habits that make the biggest difference.",
    summary: "The most flattering haircuts for chubby faces add height and vertical lines and keep volume away from the cheeks and jaw: long layers, a lob below the chin, a deep side part, side-swept bangs and, for men, short sides with height on top. To downplay a double chin, avoid cuts that end at the chin, and add a beard or face-framing layers that angle down past the jawline.",
    date: "",
    isoDate: "",
    readTime: "",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["haircuts for chubby faces", "double chin hairstyles", "hairstyles for fat faces", "haircut for chubby face male", "haircuts that make your face look thinner"],
    sections: [
      {
        h2: "What Actually Slims a Face",
        paragraphs: [
          "A haircut can't change the face underneath, but it decides where the eye goes and which lines it follows. Fuller faces look slimmer with vertical and diagonal lines (long layers, side parts, angled cuts) and with height at the crown. They look fuller with horizontal lines at the cheeks or chin and with volume at the sides.",
          "These principles overlap with advice for round faces, because full cheeks soften any face shape toward round. If your face is round even when you're lean, see " + a("/blog/haircuts-for-round-faces", "haircuts for round faces") + ".",
        ],
      },
      {
        h2: "Haircuts for Women With Fuller Faces",
        paragraphs: [
          "<strong>Long layers:</strong> length past the shoulders with layers starting below the chin. <strong>Angled lob:</strong> longer at the front, ending a few centimetres past the chin. <strong>Deep side part:</strong> an instant diagonal. <strong>Side-swept bangs:</strong> a diagonal across the forehead rather than a straight block. <strong>Face-framing layers:</strong> pieces that start at the chin and angle down past the jaw. <strong>Textured pixie with height:</strong> if you want short hair, put all the volume on top.",
        ],
      },
      {
        h2: "Haircuts for Men With Fuller Faces",
        paragraphs: [
          "<strong>High fade with a quiff:</strong> narrow sides and height on top. <strong>Side part with a taper:</strong> a clean line and tight sides. <strong>Textured crop pushed up:</strong> not flat and forward. <strong>Undercut:</strong> length on top styled up or to the side. Avoid long, puffy sides, bowl cuts and buzz cuts on their own; a buzz cut works better with a beard.",
        ],
      },
      {
        h2: "Hairstyles That Downplay a Double Chin",
        paragraphs: [
          "Avoid any cut that ends at the chin or jaw, because the hemline points at the area you want to soften. Choose lengths that end clearly above (a pixie with height) or clearly below (a lob or longer). Layers that angle down past the jawline lead the eye down toward the neck and collarbones.",
          "Men have a stronger tool: a beard. A well-shaped beard with a defined neckline, set about a finger's width above the Adam's apple, creates a jawline. Keep the sides shorter than the chin so the face looks longer. See " + a("/blog/beard-styles-round-face", "beard styles for round faces") + ".",
        ],
      },
      {
        h2: "Styling Habits That Make the Biggest Difference",
        paragraphs: [
          "Lift at the roots with a blow-dryer or texture spray; flat hair widens a face. Tuck one side behind an ear for asymmetry. Choose glasses with angular frames slightly wider than your face. And good posture, with your chin slightly forward and down for photos, reduces a double chin more than any haircut. More on that in " + a("/blog/how-to-look-good-in-photos", "how to look good in photos") + ".",
          "The " + a("/ai-stylist", "free face scan in Ollie Stylist") + " measures your face shape in your browser and ranks cuts for it, and with Ollie Pro you can try them on your own photo first.",
        ],
      },
    ],
    faqs: [
      { q: "What haircut makes a chubby face look thinner?", a: "Cuts with height on top and vertical or diagonal lines: long layers, angled lobs, deep side parts and side-swept bangs, or short sides with height for men." },
      { q: "What hairstyle hides a double chin?", a: "Lengths that end clearly above or below the chin, with layers angling down past the jaw. Avoid cuts that end at the chin. For men, a beard with a defined neckline." },
      { q: "Should chubby faces have short hair?", a: "Short hair works when it has height on top and close sides. Avoid short cuts that are full at the sides or end at the cheeks." },
    ],
    relatedSlugs: ["haircuts-for-round-faces", "round-face-haircuts-men", "how-to-look-slimmer-in-clothes"],
  },
  {
    slug: "hairstyles-for-big-forehead",
    title: "Hairstyles for a Big Forehead: 12 Cuts That Balance It",
    excerpt: "12 hairstyles for a big forehead, for women and men: fringes, side parts, textured crops and the styles that make a high forehead look smaller.",
    summary: "The best hairstyles for a big forehead cover or break up part of it: full, curtain or side-swept bangs, a deep side part, face-framing layers, a textured fringe for men, and volume at the sides rather than the crown. Avoid slicked-back styles, very tight buns and lots of height on top, which show the full forehead.",
    date: "",
    isoDate: "",
    readTime: "",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["hairstyles for big forehead", "haircuts for big forehead", "big forehead hairstyles men", "hairstyles for high forehead", "bangs for big forehead"],
    sections: [
      {
        h2: "Big Forehead or High Hairline?",
        paragraphs: [
          "A forehead looks big when it takes up more than about a third of the face's height. That can come from the bone (a tall forehead) or from the hairline (a high or receding hairline). The fixes overlap, but if your hairline has moved back over time, also see " + a("/blog/receding-hairline-haircuts", "receding hairline haircuts") + ".",
          "Heart shaped faces, which are widest at the forehead, often come with a forehead that looks large. Here are 12 cuts that balance it.",
        ],
      },
      { h2: "1. Full Fringe", paragraphs: ["A straight fringe at or just above the brows hides most of the forehead. It works best on straight or slightly wavy hair."] },
      { h2: "2. Curtain Bangs", paragraphs: ["Parted in the middle and swept outward, curtain bangs cover the centre and corners of the forehead with less commitment than a full fringe."] },
      { h2: "3. Side-Swept Bangs", paragraphs: ["A long fringe swept to one side covers part of the forehead and draws a diagonal line across it."] },
      { h2: "4. Deep Side Part", paragraphs: ["Moving the part far to one side lets hair fall across the forehead. It's free and easy to try tonight."] },
      { h2: "5. Wispy Bangs", paragraphs: ["Thin, light bangs break up a large forehead without covering it fully, good for fine hair."] },
      { h2: "6. Face-Framing Layers", paragraphs: ["Layers starting around the cheekbones pull attention down the face and away from the forehead."] },
      { h2: "7. Shoulder-Length Waves", paragraphs: ["Volume at the sides balances a tall or wide forehead better than volume at the crown."] },
      { h2: "8. Textured Fringe (Men)", paragraphs: ["A choppy fringe pushed forward and slightly to the side covers part of the forehead and looks casual."] },
      { h2: "9. French Crop (Men)", paragraphs: ["A short, straight fringe and faded sides. One of the best men's cuts for a big forehead."] },
      { h2: "10. Caesar Cut (Men)", paragraphs: ["Short all over with a short, straight fringe combed forward. It hides a high hairline neatly."] },
      { h2: "11. Messy Medium Length (Men)", paragraphs: ["Hair grown to the ears and worn loose falls naturally onto the forehead."] },
      { h2: "12. Side Part With a Low Quiff (Men)", paragraphs: ["If you prefer hair up, keep the quiff low and swept to the side rather than straight up, which shows the whole forehead."] },
      {
        h2: "Styles to Avoid",
        paragraphs: [
          "Slicked-back hair, tight high ponytails and buns, and pompadours with lots of height all expose the full forehead and add height above it. A centre part with flat hair on both sides frames the forehead like a picture.",
          "The " + a("/ai-stylist", "free face scan in Ollie Stylist") + " measures your forehead, cheekbone and jaw widths in your browser and ranks cuts for your face, and with Ollie Pro you can see a fringe on your own photo before you cut one.",
        ],
      },
    ],
    faqs: [
      { q: "What hairstyle is best for a big forehead?", a: "Bangs (full, curtain or side-swept), a deep side part and face-framing layers. For men, a textured fringe, French crop or Caesar cut." },
      { q: "Do bangs suit a big forehead?", a: "Yes. Bangs are the most effective way to make a big forehead look smaller. Curtain or side-swept bangs are lower commitment than a full fringe." },
      { q: "What should I avoid with a big forehead?", a: "Slicked-back styles, high tight ponytails and buns, and tall quiffs or pompadours, which show the whole forehead." },
    ],
    relatedSlugs: ["receding-hairline-haircuts", "curtain-bangs", "heart-shaped-face"],
  },
  {
    slug: "curly-hair-round-face",
    title: "Curly Hair for Round Faces: Cuts That Add Length",
    excerpt: "Curly hair can suit a round face perfectly. The curly cuts that add length, where to put the volume, and the shapes to avoid.",
    summary: "Curly hair suits a round face when the volume sits on top and the overall shape is longer than it is wide. The best cuts are long layered curls, a curly lob past the chin, a curly shag with crown volume, and short curls with tapered sides. Avoid round, full shapes that end at the cheeks or chin, which make a round face look wider.",
    date: "",
    isoDate: "",
    readTime: "",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["curly hair round face", "curly haircuts for round faces", "short curly hair round face", "curly hair men round face", "curly hairstyles for round faces"],
    sections: [
      {
        h2: "Why Curls and Round Faces Need Planning",
        paragraphs: [
          "Curls add volume, and volume goes wherever the cut lets it. If it builds at the sides, around the cheeks, a round face looks wider. If it builds on top and the shape stays longer than wide, a round face looks longer. The goal is a curly silhouette that is more oval than round.",
          "A curly cut should be done by a stylist who cuts curls dry or curl by curl, because curls shrink: a cut that looks right wet can end up much shorter dry.",
        ],
      },
      {
        h2: "Long Layered Curls",
        paragraphs: ["Long curls with layers starting below the chin add length and let the curls fall instead of puffing out at the sides. Ask for the shortest layers at the crown for lift."],
      },
      {
        h2: "Curly Lob",
        paragraphs: ["A lob that ends a few centimetres past the chin, with layers to stop it forming a triangle shape. Keep it longer at the front."],
      },
      {
        h2: "Curly Shag",
        paragraphs: ["A shag adds volume at the crown and shorter layers on top, which suits round faces well. Ask for the layers to start around the cheekbones rather than at them."],
      },
      {
        h2: "Curly Bangs",
        paragraphs: ["Curly bangs that fall past the brows and are swept slightly to one side break up the width of a round face. Keep them long enough not to spring up into a horizontal line."],
      },
      {
        h2: "Short Curls for Men",
        paragraphs: ["Short curls on top with tapered or faded sides are ideal for a round face. The taper removes width and the curls add height. Avoid letting curls grow out evenly into a round mop."],
      },
      {
        h2: "Shapes to Avoid",
        paragraphs: [
          "A round curly bob ending at the chin, curls cut to one length (which form a triangle or ball) and curls that are fullest at cheek level all widen a round face. A centre part with equal volume on both sides does too.",
          "The " + a("/ai-stylist", "free face scan in Ollie Stylist") + " asks for your hair texture and ranks curly cuts for your measured face shape. For more lengths, see " + a("/blog/haircuts-for-round-faces", "haircuts for round faces") + ".",
        ],
      },
    ],
    faqs: [
      { q: "Does curly hair suit a round face?", a: "Yes, when the volume is on top and the overall shape is longer than wide. Long layered curls, a curly lob past the chin and a curly shag all work." },
      { q: "What curly haircut suits a round face male?", a: "Short curls on top with tapered or faded sides, which add height and remove width." },
      { q: "What should curly-haired round faces avoid?", a: "Chin-length curly bobs, one-length curls that form a ball or triangle shape, and volume at cheek level." },
    ],
    relatedSlugs: ["haircuts-for-round-faces", "layered-haircut-round-face", "round-face-haircuts-men"],
  },
  {
    slug: "layered-haircut-round-face",
    title: "Layered Haircuts for Round Faces",
    excerpt: "How to ask for layers that slim a round face: where they should start, which layered cuts work best, and the layering mistakes to avoid.",
    summary: "Layered haircuts suit round faces when the layers start below the chin and add height at the crown. The best options are long layers, face-framing layers that angle down, a layered lob and a layered shag with crown volume. The main mistake is short layers at cheek level, which add width exactly where a round face is widest.",
    date: "",
    isoDate: "",
    readTime: "",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["layered haircut for round face", "layers for round face", "long layered haircut round face", "face framing layers round face", "layered bob round face"],
    sections: [
      {
        h2: "Where Layers Should Start on a Round Face",
        paragraphs: [
          "Layers remove weight and create movement, and the place they start decides where the volume goes. On a round face, the shortest face-framing layer should start at or below the chin, so movement sits under the widest part of the face. Shorter layers at the crown, hidden underneath the top, add height.",
          "Short layers at cheek level, the classic 'feathered' cut, put volume and a visual line across the widest part of a round face.",
        ],
      },
      {
        h2: "Long Layers",
        paragraphs: ["Hair below the shoulders with layers from the chin down. This is the safest layered cut for a round face: length plus movement, no added width."],
      },
      {
        h2: "Face-Framing Layers",
        paragraphs: ["Pieces at the front that start at the chin and angle down create diagonal lines along the face. Ask for them to be 'longer than my chin' to be safe."],
      },
      {
        h2: "Layered Lob",
        paragraphs: ["A collarbone-length cut with light layers for movement. Keep the ends textured rather than blunt, and the front slightly longer."],
      },
      {
        h2: "Layered Shag",
        paragraphs: ["A shag has lots of layers, but on a round face ask for the volume on top and the face-framing pieces long, not a full feathered fringe at cheek height."],
      },
      {
        h2: "How to Ask Your Stylist",
        paragraphs: [
          "Say: 'I'd like layers that start below my chin, some height at the crown, and nothing that adds width at my cheeks.' Bring a photo of the cut on someone with a similar face shape and hair type. Point to exactly where you want the shortest front piece to fall. More tips in " + a("/blog/how-to-ask-for-a-haircut", "how to ask for a haircut") + ".",
          "The " + a("/ai-stylist", "free face scan in Ollie Stylist") + " confirms whether your face is round and ranks layered cuts for it.",
        ],
      },
    ],
    faqs: [
      { q: "Do layers suit a round face?", a: "Yes, if they start below the chin and add height at the crown. Short layers at cheek level add width." },
      { q: "Where should face-framing layers start for a round face?", a: "At or below the chin, angling down, so the movement sits under the widest part of the face." },
      { q: "Is a layered bob good for a round face?", a: "A layered lob that ends below the chin, with textured ends and a slightly longer front, suits a round face. Avoid a chin-length layered bob." },
    ],
    relatedSlugs: ["haircuts-for-round-faces", "curly-hair-round-face", "short-hair-round-face"],
  },
  {
    slug: "bangs-for-round-face",
    title: "Bangs for Round Faces: Which Fringe Works",
    excerpt: "Can you have bangs with a round face? Which fringes slim a round face, which ones make it rounder, and how to wear them.",
    summary: "Round faces suit bangs that create diagonal or vertical lines: curtain bangs, side-swept bangs, long wispy bangs and an asymmetric fringe. They are less suited to heavy, blunt, straight-across bangs, which shorten the face and draw a horizontal line across it. Keep any fringe long enough to reach the brows or past them, and pair it with length or height elsewhere.",
    date: "",
    isoDate: "",
    readTime: "",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["bangs for round face", "curtain bangs round face", "side bangs round face", "fringe for round face", "should round faces have bangs"],
    sections: [
      {
        h2: "Can You Have Bangs With a Round Face?",
        paragraphs: [
          "Yes, if you choose the right kind. A round face is about as wide as it is long, so bangs need to avoid making it shorter or wider. Bangs that slant, part or thin out add angles and lines that slim; heavy straight bangs do the opposite.",
        ],
      },
      {
        h2: "Curtain Bangs",
        paragraphs: ["Parted in the middle and swept outward, curtain bangs frame the face in a V shape and open up the forehead's centre. They're the most popular fringe for round faces. Keep the ends past the cheekbones. More in " + a("/blog/curtain-bangs", "curtain bangs for every face shape") + "."],
      },
      {
        h2: "Side-Swept Bangs",
        paragraphs: ["A long fringe swept to one side creates a diagonal across the forehead, one of the most slimming lines for a round face. Pair it with a side part."],
      },
      {
        h2: "Long Wispy Bangs",
        paragraphs: ["Thin, light bangs let some forehead show through, so they don't form a solid horizontal block. They suit fine hair."],
      },
      {
        h2: "Asymmetric Fringe",
        paragraphs: ["A fringe cut longer on one side than the other adds an angle. It works especially well with pixies and short bobs."],
      },
      {
        h2: "The Fringe to Approach With Care",
        paragraphs: [
          "Heavy, blunt bangs cut straight across at the brows draw a strong horizontal line and shorten the face. If you love the look, keep it slightly longer, thin the ends, and add height or length elsewhere, for example with long layers.",
          "The " + a("/ai-stylist", "free face scan in Ollie Stylist") + " checks your face shape, and Ollie Pro lets you see a fringe on your own photo before you cut, which matters with bangs because they take months to grow out.",
        ],
      },
    ],
    faqs: [
      { q: "Do bangs make a round face look bigger?", a: "Heavy straight-across bangs can, because they shorten the face. Curtain, side-swept and wispy bangs slim a round face instead." },
      { q: "What bangs are best for a round face?", a: "Curtain bangs and long side-swept bangs, which create diagonal lines and frame the face." },
      { q: "Should round faces get blunt bangs?", a: "Usually not. If you do, keep them slightly longer and thinned, and add height or length elsewhere." },
    ],
    relatedSlugs: ["curtain-bangs", "haircuts-for-round-faces", "short-hair-round-face"],
  },
  {
    slug: "celebrity-face-shapes",
    title: "Celebrity Face Shapes: What 4,000 Faces Measured by AI Reveal",
    excerpt: "Ollie ran its face shape scan on 4,032 celebrities. How common each shape is, how men and women differ, and how the measurement works.",
    summary: "Ollie measured the face shapes of 4,032 celebrities with the same scan Ollie Stylist runs in your browser. Oval was most common (22%), then heart (18%), triangle (14.5%), round (12.2%), oblong (12.1%), square (11.9%) and diamond (9.3%). Men were far more often square (16.7% vs 3.1%) and women far more often heart (26.9% vs 12.9%) or diamond (17.8% vs 4.6%). One photo can't fix a face shape exactly, so each result is a probability.",
    date: "",
    isoDate: "",
    readTime: "",
    category: "Deep Dive",
    author: "Liam Bradley",
    keywords: ["celebrity face shapes", "face shape statistics", "most common face shape", "face shape data", "ai face shape"],
    sections: [
      {
        h2: "What Was Measured",
        paragraphs: [
          "Ollie's celebrity index holds 5,955 well-known living people with freely licensed photos from Wikimedia Commons. For each person, up to three photos were run through Google's MediaPipe Face Landmarker, which places 478 points on a face. Only straight-on photos were kept: head turned or tilted less than 10 degrees, and a face at least 100 pixels across at the cheekbones. 4,032 people had at least one photo that passed.",
          "These are the same rules the " + a("/ai-stylist", "face scan in Ollie Stylist") + " uses on your camera, so the numbers below describe exactly what the tool measures.",
        ],
      },
      {
        h2: "How a Face Shape Is Calculated",
        paragraphs: [
          "Four widths are measured from the landmarks and divided by the distance between the cheekbones, so the result doesn't depend on photo size: face length (top of the forehead to chin), forehead width (between the temples), jaw width (lower jaw corners) and chin width (either side of the chin). Across 9,195 straight-on photos, the average face was 1.18 times as long as it was wide at the cheekbones, with the forehead at 0.93, the jaw at 0.90 and the chin at 0.58 of cheekbone width.",
          "Each of the four ratios is turned into a z-score against those averages, then compared with seven prototypes, one per shape, written in the same z-score units. A round prototype, for example, is short with a slightly wide jaw and chin; a heart prototype has a wide forehead and a narrow jaw and chin. A Gaussian weight on the distance to each prototype becomes a probability, so every face gets a likelihood for all seven shapes.",
          "One honest caveat: the prototypes were set by hand from how stylists describe each shape, not fitted to faces labelled by experts. They encode the standard definitions, and they can be refined if users report wrong results.",
        ],
      },
      {
        h2: "The Results: How Common Each Shape Is",
        paragraphs: [
          "<strong>Oval 22.0%</strong> (889 people), <strong>heart 18.0%</strong> (727), <strong>triangle 14.5%</strong> (586), <strong>round 12.2%</strong> (491), <strong>oblong 12.1%</strong> (486), <strong>square 11.9%</strong> (478) and <strong>diamond 9.3%</strong> (375).",
          "Oval comes out most common partly by design: its prototype sits close to the average face, so faces near the middle land there. That's also why oval results are rarely confident. No celebrity's oval probability passed 50%, while 349 heart shaped faces did.",
        ],
      },
      {
        h2: "Men vs Women",
        paragraphs: [
          "Of the 4,032, 2,568 were men and 1,441 women (Wikidata gender; a few had none recorded). The shapes split very differently. <strong>Men:</strong> oval 21.2%, square 16.7%, triangle 15.7%, round 15.2%, oblong 13.8%, heart 12.9%, diamond 4.6%. <strong>Women:</strong> heart 26.9%, oval 23.6%, diamond 17.8%, triangle 12.6%, oblong 9.0%, round 7.0%, square 3.1%.",
          "The pattern fits what's known about facial differences between the sexes: men's jaws are on average wider relative to the cheekbones, which pushes faces toward square, round and triangle, while women's narrower jaws and chins push faces toward heart and diamond.",
        ],
      },
      {
        h2: "How Repeatable Is a Face Shape?",
        paragraphs: [
          "Not very, from a single photo. Comparing several photos of the same person, their ratios varied about two thirds as much as they varied between different people. Hair over the forehead, a slight head tilt, camera distance and expression all move the numbers. That's why the scan reports probabilities and scores haircuts against all shapes, and why celebrity examples on this blog use only faces the scan was confident about.",
          "See the celebrities in each group: " + a("/blog/celebrities-with-round-faces", "round") + ", " + a("/blog/celebrities-with-oval-faces", "oval") + ", " + a("/blog/celebrities-with-heart-shaped-faces", "heart") + " and " + a("/blog/celebrities-with-square-faces", "square") + ".",
        ],
      },
    ],
    faqs: [
      { q: "What is the most common face shape?", a: "Oval: 22% of the 4,032 celebrities Ollie measured. Heart was second at 18%." },
      { q: "Do men and women have different face shapes?", a: "Their shapes are distributed very differently. 16.7% of men but 3.1% of women were square; 26.9% of women but 12.9% of men were heart shaped." },
      { q: "How does AI measure face shape?", a: "Ollie's scan places 478 landmarks on the face, measures face length and forehead, jaw and chin widths relative to cheekbone width, and compares them with prototypes for each of 7 shapes to give a probability for each." },
      { q: "How accurate is a face shape from one photo?", a: "Only moderately. The same person's measurements vary about two thirds as much between photos as between people, so a single photo gives a likely shape, not a certain one." },
    ],
    relatedSlugs: ["face-shape-guide", "celebrities-with-heart-shaped-faces", "how-face-recognition-works"],
  },
  {
    slug: "celebrities-with-round-faces",
    title: "Celebrities With Round Faces, Measured by AI",
    excerpt: "Which celebrities have round faces? The stars Ollie's face scan measured as round, from Ed Sheeran to Sadie Sink, and the haircuts they wear.",
    summary: "Celebrities with round faces, as measured by Ollie's face shape scan, include Virat Kohli, Max Verstappen, Lando Norris, Ed Sheeran, Andrea Bocelli and Finn Wolfhard, and among women Sadie Sink, Megan Rapinoe and Julie Christie. Round faces are about as wide as long with soft jaws. In the scan of 4,032 celebrities, 12.2% were round: 15.2% of men but only 7% of women.",
    date: "",
    isoDate: "",
    readTime: "",
    category: "Culture",
    author: "Wendy Wei",
    keywords: ["celebrities with round faces", "famous people with round faces", "round face celebrities male", "round face celebrities female", "actors with round faces"],
    sections: [
      {
        h2: "How These Celebrities Were Measured",
        paragraphs: [
          "Most celebrity face shape lists are guesses from a single red carpet photo. These come from measurement: Ollie ran the face scan from " + a("/ai-stylist", "Ollie Stylist") + " on one to three straight-on, freely licensed photos of each of 4,032 celebrities, and listed only people the scan was at least 50% sure were round. The percentage after each name is that probability.",
          "A round face is about as wide as it is long, with full cheeks and a soft, rounded jaw. In the full scan, 12.2% of celebrities were round, but the split was uneven: 15.2% of men and only 7% of women. The method is explained in " + a("/blog/celebrity-face-shapes", "what 4,000 celebrity faces reveal") + ".",
        ],
      },
      {
        h2: "Male Celebrities With Round Faces",
        paragraphs: [
          "<strong>Virat Kohli</strong> (70%), <strong>Max Verstappen</strong> (69%), <strong>Samuel Eto'o</strong> (65%), <strong>Lando Norris</strong> (64%), <strong>Andrea Bocelli</strong> (60%), <strong>Tom Welling</strong> (58%), <strong>Finn Wolfhard</strong> (58%), <strong>Kyle MacLachlan</strong> (57%), <strong>Oscar Piastri</strong> (55%), <strong>Bill Pullman</strong> (53%), <strong>Ryan Hurst</strong> (53%), <strong>Brandon Sanderson</strong> (52%), <strong>Sadio Mané</strong> (52%), <strong>Alan Alda</strong> (51%) and <strong>Ed Sheeran</strong> (51%). Comedian and TV host <strong>Andy Richter</strong> was the most confidently round face in the whole index, at 87%.",
          "Formula 1 is well represented: Verstappen, Norris and Piastri all came out round, a reminder that face shape has nothing to do with build.",
        ],
      },
      {
        h2: "Female Celebrities With Round Faces",
        paragraphs: [
          "Round faces were much rarer among women in the index. Those the scan was at least 50% sure of include <strong>June Squibb</strong> (64%), <strong>Megan Rapinoe</strong> (60%), <strong>Suzi Quatro</strong> (59%), <strong>Julie Christie</strong> (54%), <strong>Sadie Sink</strong> (53%), <strong>Jaimie Alexander</strong> (51%) and <strong>Parminder Nagra</strong> (50%). Just below the line were <strong>Jennifer Garner</strong> (48%), <strong>Juliette Lewis</strong> (47%) and <strong>Lily Allen</strong> (46%), whose faces sit between round and neighbouring shapes.",
        ],
      },
      {
        h2: "What Round-Faced Celebrities Do With Their Hair",
        paragraphs: [
          "Look at the men on the list and a pattern shows: short sides and some height or texture on top, often with a beard. Virat Kohli's short-sided cut with a full, shaped beard is a textbook way to lengthen a round face. Ed Sheeran's short, textured crop keeps volume on top rather than the sides.",
          "For your own cut, see " + a("/blog/round-face-haircuts-men", "round face haircuts for men") + " and " + a("/blog/haircuts-for-round-faces", "haircuts for round faces") + ". To check your shape the same way these celebrities were measured, try the free face scan.",
        ],
      },
      {
        h2: "Why Some Lists Disagree",
        paragraphs: [
          "If you've seen these names listed under other shapes elsewhere, that's expected. Face shape depends on the photo, the angle, weight at the time and how the hairline falls, and many faces sit near the border of two shapes. Ollie's scan reports probabilities for exactly this reason; the percentages above show how clear-cut each case was.",
        ],
      },
    ],
    faqs: [
      { q: "Which male celebrities have round faces?", a: "Ollie's face scan measured Virat Kohli, Max Verstappen, Lando Norris, Samuel Eto'o, Andrea Bocelli, Finn Wolfhard and Ed Sheeran, among others, as round." },
      { q: "Which female celebrities have round faces?", a: "June Squibb, Megan Rapinoe, Suzi Quatro, Julie Christie and Sadie Sink were measured as round with at least 50% confidence." },
      { q: "How common is a round face among celebrities?", a: "12.2% of the 4,032 celebrities Ollie measured: 15.2% of men and 7% of women." },
    ],
    relatedSlugs: ["celebrity-face-shapes", "round-face-haircuts-men", "haircuts-for-round-faces"],
  },
]
