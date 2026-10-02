import type { BlogPost } from "./blog-post-types"
import { a } from "./blog-link"

// Style posts, part 9: colour, style types and occasions.
export const postsL: BlogPost[] = [
  {
    slug: "color-analysis",
    title: "Color Analysis: Find Your Season in 5 Minutes",
    excerpt: "Seasonal color analysis sorts you into spring, summer, autumn or winter by undertone, depth and contrast. How to find yours at home and what to wear.",
    summary: "Seasonal color analysis matches clothes to your natural colouring using three things: undertone (warm or cool), depth (light or deep) and clarity (bright or soft). Warm and light is spring, cool and soft is summer, warm and deep is autumn, cool and high-contrast is winter. You can get close at home in daylight with a mirror, a white top and a few test colours held under your face.",
    date: "",
    isoDate: "2026-09-10T14:51:00Z",
    readTime: "3 min read",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["color analysis", "seasonal color analysis", "what season am i", "color analysis test", "12 season color analysis"],
    sections: [
      {
        h2: "What Color Analysis Is",
        paragraphs: [
          "Color analysis picks the clothing colours that suit your skin, hair and eyes. The seasonal system grew out of the colour theory of Bauhaus teacher Johannes Itten and became popular with Carole Jackson's 1980 book <em>Color Me Beautiful</em>. It sorts people into four seasons, which many analysts now split into 12.",
          "The idea is simple: colours that share your natural undertone and contrast make skin look even and eyes look clear, while colours that clash can make you look tired or washed out. There's little formal research behind the exact seasons, so treat them as a useful starting point rather than a rule.",
        ],
      },
      {
        h2: "The Four Seasons",
        paragraphs: [
          "<strong>Spring:</strong> warm undertone, light to medium depth, bright. Golden blonde or light auburn hair is common. Wears warm, clear colours: coral, peach, warm green, camel, light navy. <strong>Summer:</strong> cool undertone, light depth, soft. Ash blonde or light brown hair. Wears soft, cool colours: dusty pink, powder blue, lavender, grey-navy.",
          "<strong>Autumn:</strong> warm undertone, medium to deep, soft. Auburn, chestnut or warm brown hair. Wears earthy colours: olive, rust, mustard, chocolate, cream. <strong>Winter:</strong> cool undertone, deep or high contrast, bright. Dark hair with light or deep skin. Wears clear, strong colours: black, pure white, true red, emerald, royal blue.",
          "The 12-season version splits each season by its strongest trait. Spring, for example, becomes light, warm and bright spring.",
        ],
      },
      {
        h2: "How to Find Your Season at Home",
        paragraphs: [
          "Use daylight from a window, no make-up, and hair pulled back or covered if it's dyed. Hold each test colour under your chin and look at your skin, not the fabric.",
          "<strong>1. Undertone.</strong> Compare pure white with cream, and silver with gold. If white and silver look better, you lean cool; cream and gold, warm. Our " + a("/blog/what-colors-look-good-on-me", "skin undertone guide") + " has more tests. <strong>2. Depth.</strong> If very dark colours overpower you, you're light (spring or summer); if pastels wash you out, you're deep (autumn or winter). <strong>3. Clarity.</strong> If bright, saturated colours look good, you're bright (spring or winter); if muted, greyed colours look better, you're soft (summer or autumn).",
          "Combine the three and you have your season. Ask a friend to watch too, since it's easier to judge someone else's face.",
        ],
      },
      {
        h2: "Using It Without Rebuying Everything",
        paragraphs: [
          "Colour matters most near your face: shirts, knitwear, scarves, collars and glasses frames. Trousers and shoes can stay neutral. If you love a colour outside your season, wear it below the waist or add a better colour at the neck.",
          "To see a colour on a body like yours, try it on the free model in " + a("/ai-stylist", "Ollie Stylist") + ". Pick the model look closest to yours and compare a warm and a cool version of the same outfit.",
        ],
      },
    ],
    faqs: [
      { q: "What are the 4 color seasons?", a: "Spring (warm, light, bright), summer (cool, light, soft), autumn (warm, deep, soft) and winter (cool, deep, bright)." },
      { q: "How do I know my color season?", a: "In daylight, test your undertone (white vs cream, silver vs gold), your depth (light vs dark colours) and your clarity (bright vs muted colours). The combination gives your season." },
      { q: "Is color analysis scientific?", a: "It's based on colour theory and contrast rather than formal research, so treat the seasons as a useful guide, not a rule." },
    ],
    relatedSlugs: ["what-colors-look-good-on-me", "capsule-wardrobe-men", "glow-up-tips"],
  },
  {
    slug: "what-colors-look-good-on-me",
    title: "What Colors Look Good on Me? A Skin Undertone Guide",
    excerpt: "Find your skin undertone (warm, cool or neutral) with 4 simple tests, then see which clothing colours suit each one, for every skin tone.",
    summary: "The colours that look best on you depend mostly on your skin's undertone, not how light or dark it is. Warm undertones (golden or peachy) suit earthy colours, cream and gold; cool undertones (pink or bluish) suit jewel tones, pure white and silver; neutral undertones can wear most colours. Test yours with the vein, jewellery, white-fabric and sun tests in daylight.",
    date: "",
    isoDate: "2026-09-23T19:08:00Z",
    readTime: "3 min read",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["what colors look good on me", "skin undertone", "undertone test", "warm vs cool undertone", "colors for my skin tone"],
    sections: [
      {
        h2: "Skin Tone vs Undertone",
        paragraphs: [
          "Skin tone is how light or deep your skin is. Undertone is the colour underneath: warm (yellow, golden or peachy), cool (pink, red or bluish) or neutral (a mix). Two people with the same skin tone can have different undertones, and undertone is what decides which colours flatter you.",
        ],
      },
      {
        h2: "4 Undertone Tests",
        paragraphs: [
          "<strong>1. Vein test.</strong> In daylight, look at the veins on your inner wrist. Greenish suggests warm, blue or purple suggests cool, and hard to tell suggests neutral. It's quick but not reliable on its own, so use it with the others.",
          "<strong>2. Jewellery test.</strong> If gold looks better against your skin, you lean warm; if silver does, cool. <strong>3. White fabric test.</strong> Hold bright white and then cream fabric under your face. Pure white flatters cool undertones; cream flatters warm. <strong>4. Sun test.</strong> If you tan easily and rarely burn, you often lean warm; if you burn first, you often lean cool.",
          "If the tests disagree, you're probably neutral, which is good news: you can wear most colours.",
        ],
      },
      {
        h2: "Colours for Each Undertone",
        paragraphs: [
          "<strong>Warm:</strong> olive, rust, mustard, camel, coral, warm red, cream, chocolate brown and warm navy. Go easy on icy pastels and stark black near the face. <strong>Cool:</strong> navy, emerald, royal blue, raspberry, lavender, true red, grey and pure white. Go easy on orange and yellow-green. <strong>Neutral:</strong> almost anything; soft white, dusty pink, jade, teal and medium blue are especially safe.",
          "Depth matters too. Light skin often looks best in light to medium colours or soft contrast; deep skin can carry very bright colours and strong contrast, like white with black. For the full system with seasons, see " + a("/blog/color-analysis", "color analysis") + ".",
        ],
      },
      {
        h2: "Colours That Suit Almost Everyone",
        paragraphs: [
          "Teal, soft white, medium navy, eggplant and true red sit between warm and cool, so they work on most people. If you're building a small wardrobe, start there; see the " + a("/blog/capsule-wardrobe-men", "men's capsule wardrobe") + ".",
          "You can try colours on a model with a look close to yours in " + a("/ai-stylist", "Ollie Stylist") + " before you buy.",
        ],
      },
    ],
    faqs: [
      { q: "How do I know if I'm warm or cool toned?", a: "In daylight, compare gold and silver jewellery and pure white and cream fabric near your face. Gold and cream point to warm; silver and white point to cool. If both look fine, you're neutral." },
      { q: "What colors look good on everyone?", a: "Teal, soft white, medium navy, eggplant and true red are close to universal because they sit between warm and cool." },
      { q: "Is the vein test accurate?", a: "Only roughly. Vein colour depends on lighting and skin thickness, so combine it with the jewellery and white-fabric tests." },
    ],
    relatedSlugs: ["color-analysis", "capsule-wardrobe-men", "how-to-look-good-in-photos"],
  },
  {
    slug: "old-money-style-men",
    title: "Old Money Style for Men: The Complete Outfit Guide",
    excerpt: "Old money style for men is quiet, well-fitted classic clothing with no logos. The core pieces, 5 outfits and the mistakes that make it look costumed.",
    summary: "Old money style, also called quiet luxury, is classic menswear that looks expensive without showing it: no logos, good fabrics, neutral colours and a perfect fit. The core pieces are a navy blazer, oxford shirts, merino and cable-knit sweaters, polo shirts, pleated or flat-front chinos, grey wool trousers and loafers. It looks best kept simple and slightly lived-in.",
    date: "",
    isoDate: "2026-09-06T10:25:00Z",
    readTime: "3 min read",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["old money style men", "old money outfits men", "quiet luxury men", "old money aesthetic", "old money clothing brands"],
    sections: [
      {
        h2: "What Old Money Style Means",
        paragraphs: [
          "Old money style borrows from the way inherited-wealth families have dressed for generations: Ivy League campuses, country clubs, sailing and Sunday lunches. The look is quiet. Nothing has a big logo, nothing is trendy, and everything fits. The point is that the clothes look good for decades, not one season.",
          "It became a social media trend in the early 2020s, and \"quiet luxury\" is the same idea in newer words.",
        ],
      },
      {
        h2: "The Core Pieces",
        paragraphs: [
          "<strong>Tailoring:</strong> a navy blazer, grey wool trousers and a navy or grey suit. <strong>Shirts:</strong> white and light blue oxford cloth button-downs, linen shirts for summer, knitted and piqué polos. <strong>Knitwear:</strong> merino crew necks, cable-knit sweaters, a quarter-zip and a cardigan. <strong>Trousers:</strong> chinos in stone, navy and olive, and pleated wool trousers. <strong>Shoes:</strong> penny loafers, suede loafers, brown derbies and white leather sneakers. <strong>Extras:</strong> a leather belt that matches your shoes, a simple watch on a leather strap.",
          "Colours stay quiet: navy, cream, white, grey, camel, olive, brown and soft blue.",
        ],
      },
      {
        h2: "5 Old Money Outfits",
        paragraphs: [
          "<strong>1. Weekend:</strong> cream cable-knit sweater, stone chinos, brown suede loafers. <strong>2. Summer:</strong> white linen shirt with sleeves rolled, navy shorts or light chinos, loafers without socks. <strong>3. Smart dinner:</strong> navy blazer, light blue oxford shirt, grey wool trousers, dark brown loafers. <strong>4. Autumn:</strong> camel overcoat over a grey merino crew neck, dark trousers, brown boots. <strong>5. Casual:</strong> navy knitted polo, olive chinos, white leather sneakers.",
        ],
      },
      {
        h2: "How to Not Look Costumed",
        paragraphs: [
          "Don't wear every signature piece at once; a sweater over the shoulders, loafers, a blazer crest and a signet ring together looks like a costume. Pick two or three classic pieces and keep the rest plain. Fit matters more than brand: get trousers hemmed and blazers taken in, and see " + a("/blog/how-should-a-suit-fit", "how a suit should fit") + ".",
          "Hair is part of the look: a classic side part, an Ivy League cut or a neat, slightly longer swept-back style. " + a("/ai-stylist", "Ollie Stylist") + " has an Old money style in Choose for me, so you can see a full outfit on a model set to your build and pick a haircut that suits your face shape.",
        ],
      },
    ],
    faqs: [
      { q: "What is old money style for men?", a: "Classic, well-fitted menswear with no logos and quiet colours: navy blazers, oxford shirts, knitwear, chinos and loafers." },
      { q: "What shoes are old money?", a: "Penny loafers, suede loafers, brown derbies, boat shoes in summer and plain white leather sneakers." },
      { q: "Is old money style expensive?", a: "It doesn't have to be. Plain pieces in good fabrics that fit well matter more than brands, and many classics are easy to find second-hand." },
    ],
    relatedSlugs: ["preppy-style", "smart-casual-men", "capsule-wardrobe-men"],
  },
  {
    slug: "smart-casual-men",
    title: "Smart Casual for Men, Explained",
    excerpt: "Smart casual for men sits between business casual and weekend clothes. What it means, what to wear, 5 example outfits and what to avoid.",
    summary: "Smart casual for men means neat, put-together clothes without a suit or tie: dark jeans or chinos, a collared shirt, polo or fine knit, an optional unstructured blazer, and clean leather shoes or minimal sneakers. It's a step more relaxed than business casual. Avoid sportswear, graphic T-shirts, shorts (unless stated), ripped denim and scuffed trainers.",
    date: "",
    isoDate: "2026-09-19T15:42:00Z",
    readTime: "3 min read",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["smart casual men", "smart casual dress code men", "smart casual outfits men", "what is smart casual", "smart casual vs business casual"],
    sections: [
      {
        h2: "What Smart Casual Means",
        paragraphs: [
          "Smart casual is a dress code for dinners, parties, dates, creative offices and many events. It asks you to look like you made an effort without dressing for a meeting. In practice, it's casual pieces chosen and worn carefully: dark, clean, well-fitted and without logos.",
        ],
      },
      {
        h2: "What to Wear",
        paragraphs: [
          "<strong>Tops:</strong> oxford or casual button-down shirts, polo shirts, fine merino or cotton knitwear, and a plain, heavy T-shirt under a jacket. <strong>Jackets:</strong> an unstructured blazer, a chore jacket, a bomber, an overshirt or a smart overcoat. <strong>Trousers:</strong> dark, unripped jeans, chinos or casual wool trousers. <strong>Shoes:</strong> loafers, desert or Chelsea boots, derbies, or plain white or black leather sneakers kept clean.",
        ],
      },
      {
        h2: "5 Smart Casual Outfits",
        paragraphs: [
          "<strong>1.</strong> Navy unstructured blazer, white T-shirt, dark jeans, white leather sneakers. <strong>2.</strong> Grey merino crew neck over a light blue oxford shirt, stone chinos, brown suede desert boots. <strong>3.</strong> Black knitted polo, charcoal trousers, black loafers. <strong>4.</strong> Olive overshirt, cream T-shirt, dark jeans, brown Chelsea boots. <strong>5.</strong> Navy polo, beige chinos, brown loafers for a summer event.",
        ],
      },
      {
        h2: "Smart Casual vs Business Casual",
        paragraphs: [
          "Business casual is office clothing: collared shirt, chinos or wool trousers, leather shoes, maybe a blazer. Smart casual relaxes it: dark jeans, knitwear and sneakers are fine. See " + a("/blog/business-casual-men", "business casual for men") + " for the office version.",
          "Avoid sportswear, hoodies, shorts unless the invite says so, graphic T-shirts, ripped jeans and running trainers. If in doubt, add a blazer; it's easy to take off.",
          "Want a starting point? In " + a("/ai-stylist", "Ollie Stylist") + ", Choose for me with the Clean classic or Minimal style builds a smart casual outfit on a model set to your build.",
        ],
      },
    ],
    faqs: [
      { q: "Can you wear jeans for smart casual?", a: "Yes, dark, clean, unripped jeans that fit well are standard smart casual." },
      { q: "Are sneakers smart casual?", a: "Plain leather sneakers in white or black, kept clean, are smart casual. Running trainers aren't." },
      { q: "Is a polo shirt smart casual?", a: "Yes, a plain polo, especially a knitted one, is smart casual." },
    ],
    relatedSlugs: ["business-casual-men", "what-to-wear-on-a-first-date", "capsule-wardrobe-men"],
  },
  {
    slug: "business-casual-men",
    title: "Business Casual for Men: What It Means Now",
    excerpt: "Business casual for men today: collared shirts, chinos or wool trousers, leather shoes and an optional blazer. What's allowed, 5 outfits and what to skip.",
    summary: "Business casual for men means office clothes without a suit and tie: a collared shirt or polo, fine knitwear, chinos or wool trousers, leather shoes, and an optional blazer. Many offices now also accept dark jeans and clean leather sneakers. It's smarter than smart casual: skip T-shirts on their own, hoodies, sportswear and shorts.",
    date: "",
    isoDate: "2026-09-02T20:59:00Z",
    readTime: "3 min read",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["business casual men", "business casual attire men", "business casual outfits men", "what is business casual", "business casual shoes men"],
    sections: [
      {
        h2: "What Business Casual Means",
        paragraphs: [
          "Business casual is the most common office dress code. It sits between business formal (suit and tie) and smart casual. Since remote and hybrid work became normal, many offices have relaxed it, so the safest move is to check what colleagues wear in your first week and dress at their level or one step above.",
        ],
      },
      {
        h2: "The Core Pieces",
        paragraphs: [
          "<strong>Shirts:</strong> oxford button-downs and poplin shirts in white, light blue, pale pink or subtle stripes and checks; polo shirts in plain colours. <strong>Knitwear:</strong> merino crew necks, V-necks, quarter-zips and cardigans over a shirt. <strong>Trousers:</strong> chinos in navy, grey, stone and olive, and wool trousers. <strong>Jackets:</strong> navy or grey blazer, or a sport coat. <strong>Shoes:</strong> loafers, derbies, brogues, Chelsea boots and, in relaxed offices, plain leather sneakers.",
          "Ties are optional. Match your belt to your shoes.",
        ],
      },
      {
        h2: "5 Business Casual Outfits",
        paragraphs: [
          "<strong>1.</strong> Light blue oxford shirt, navy chinos, brown loafers. <strong>2.</strong> White shirt, grey merino V-neck, charcoal wool trousers, black derbies. <strong>3.</strong> Navy blazer, striped shirt, stone chinos, brown suede Chelsea boots. <strong>4.</strong> Navy quarter-zip over a white shirt, grey trousers, brown brogues. <strong>5.</strong> Plain navy polo, olive chinos, white leather sneakers for a relaxed Friday.",
        ],
      },
      {
        h2: "What to Skip",
        paragraphs: [
          "T-shirts on their own, hoodies, sportswear, shorts, ripped or light-wash jeans, flip-flops and running shoes. For the more relaxed dress code, see " + a("/blog/smart-casual-men", "smart casual for men") + "; for fit, see " + a("/blog/how-should-a-suit-fit", "how a suit should fit") + ".",
          "In " + a("/ai-stylist", "Ollie Stylist") + ", the Clean classic and Preppy styles in Choose for me build office-ready outfits on a model set to your build, with links to buy each piece.",
        ],
      },
    ],
    faqs: [
      { q: "Are jeans business casual for men?", a: "In many offices dark, clean jeans are now fine with a collared shirt and leather shoes. In more traditional offices, stick to chinos or wool trousers." },
      { q: "Is a polo business casual?", a: "Yes, a plain polo shirt is business casual in most offices." },
      { q: "Do you need a blazer for business casual?", a: "No. A blazer is optional, but it's useful for meetings and easy to take off." },
    ],
    relatedSlugs: ["smart-casual-men", "how-should-a-suit-fit", "capsule-wardrobe-men"],
  },
  {
    slug: "capsule-wardrobe-men",
    title: "Capsule Wardrobe for Men: 20 Pieces That Work Together",
    excerpt: "A men's capsule wardrobe of 20 pieces in neutral colours that all mix and match: the full list, why each piece is there and how to build it.",
    summary: "A capsule wardrobe is a small set of clothes that all work together. This men's capsule has 20 pieces: 4 T-shirts and polos, 3 shirts, 3 knits, 3 trousers, 3 jackets and 4 pairs of shoes, all in navy, grey, white, olive, stone and brown, so almost any top goes with any bottom. Build it slowly, replacing worn-out clothes with pieces from the list.",
    date: "",
    isoDate: "2026-09-15T11:16:00Z",
    readTime: "3 min read",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["capsule wardrobe men", "men's capsule wardrobe", "minimalist wardrobe men", "wardrobe essentials men", "basic wardrobe men"],
    sections: [
      {
        h2: "What a Capsule Wardrobe Is",
        paragraphs: [
          "A capsule wardrobe is a small collection of clothes that all go together. The term is usually credited to London boutique owner Susie Faux in the 1970s. The benefits are fewer decisions in the morning, less spending and more outfits from fewer clothes.",
          "The secret is colour: keep everything to a few neutrals that match each other, then add one or two colours you love. The 20 pieces below use navy, grey, white, olive, stone and brown.",
        ],
      },
      {
        h2: "The 20 Pieces",
        paragraphs: [
          "<strong>Tops (4):</strong> 1. white T-shirt, 2. navy T-shirt, 3. grey T-shirt, 4. navy polo shirt. <strong>Shirts (3):</strong> 5. white oxford shirt, 6. light blue oxford shirt, 7. olive or chambray overshirt.",
          "<strong>Knitwear (3):</strong> 8. grey merino crew neck, 9. navy merino crew neck, 10. cream or oatmeal heavier knit. <strong>Trousers (3):</strong> 11. dark indigo jeans, 12. stone chinos, 13. grey wool trousers.",
          "<strong>Jackets (3):</strong> 14. navy unstructured blazer, 15. waterproof or field jacket, 16. navy or camel overcoat. <strong>Shoes (4):</strong> 17. white leather sneakers, 18. brown suede desert or Chelsea boots, 19. brown or black loafers, 20. dark leather derbies.",
        ],
      },
      {
        h2: "How the Pieces Combine",
        paragraphs: [
          "Every top goes with every pair of trousers, which gives you 30 top-and-trouser combinations from the 10 tops and 3 trousers before you add jackets and shoes. Weekend: T-shirt, jeans, overshirt, sneakers. Office: oxford shirt, merino, wool trousers, loafers. Dinner: blazer, white shirt, chinos, suede boots.",
          "Adjust the list to your life. If you work in an office that wears suits, swap the overshirt for a suit. In a hot climate, swap two knits for linen shirts and add shorts.",
        ],
      },
      {
        h2: "Building It Without Overspending",
        paragraphs: [
          "Don't buy all 20 at once. Start with what you own that fits the colours, then replace clothes as they wear out. Spend most on the things you wear most and that last: shoes, outerwear and trousers. Get them tailored: hemmed trousers and adjusted sleeves make cheap clothes look expensive. If you're unsure which colours suit you, read " + a("/blog/what-colors-look-good-on-me", "what colors look good on me") + ".",
          "You can put the pieces together on a model set to your build and height in " + a("/ai-stylist", "Ollie Stylist") + ", then follow the shop links for the ones you need.",
        ],
      },
    ],
    faqs: [
      { q: "How many items should be in a men's capsule wardrobe?", a: "Usually 20 to 35 pieces including shoes and outerwear. This guide uses 20." },
      { q: "What colours are best for a capsule wardrobe?", a: "Neutrals that all match: navy, grey, white, olive, stone and brown, plus one or two accent colours you like." },
      { q: "Should a capsule wardrobe include suits?", a: "Only if you need one regularly. Otherwise a navy blazer and grey wool trousers cover most smart occasions." },
    ],
    relatedSlugs: ["smart-casual-men", "old-money-style-men", "aesthetic-types"],
  },
  {
    slug: "preppy-style",
    title: "Preppy Style: How to Dress Preppy Without Looking Costumed",
    excerpt: "Preppy style is classic American campus clothing: oxford shirts, chinos, knitwear, stripes and loafers. Key pieces for men and women, and how to keep it modern.",
    summary: "Preppy style comes from the clothes worn at American prep schools and Ivy League colleges in the mid-20th century: oxford button-down shirts, chinos, cable knits, rugby and polo shirts, stripes, blazers and loafers or boat shoes. Today it's classic with a little colour. Keep it modern by mixing one or two preppy pieces with plain basics and choosing relaxed, well-fitted cuts.",
    date: "",
    isoDate: "2026-09-28T16:33:00Z",
    readTime: "3 min read",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["preppy style", "preppy outfits", "preppy aesthetic", "preppy clothes", "preppy style men"],
    sections: [
      {
        h2: "Where Preppy Comes From",
        paragraphs: [
          "Preppy is named after the private preparatory schools that fed America's Ivy League colleges. From the 1950s, students there wore oxford shirts, chinos, crew-neck sweaters and loafers, a look later called Ivy style. The 1980 book <em>The Official Preppy Handbook</em> made it a known style, and brands such as Ralph Lauren built on it.",
          "Preppy overlaps with old money style. The difference is colour and energy: preppy uses more stripes, brighter colours and sporty pieces, while " + a("/blog/old-money-style-men", "old money style") + " stays quieter.",
        ],
      },
      {
        h2: "The Key Pieces",
        paragraphs: [
          "<strong>For everyone:</strong> oxford button-down shirts, polo and rugby shirts, cable-knit and V-neck sweaters, Breton stripes, a navy blazer, chinos, a quilted gilet or trench coat, penny loafers, boat shoes and white canvas sneakers. <strong>For women, also:</strong> pleated or A-line skirts, shirt dresses, cardigans, headbands and ballet flats. <strong>For men, also:</strong> chino shorts in summer, knitted ties and a waxed field jacket.",
          "Colours: navy, white, red, kelly green, pink, light blue, khaki and cream, often in stripes or gingham.",
        ],
      },
      {
        h2: "How to Keep It Modern",
        paragraphs: [
          "Pair one preppy piece with plain basics: a striped rugby shirt with dark jeans and white sneakers, or a cable knit with relaxed trousers. Avoid wearing a sweater tied over your shoulders with a blazer and boat shoes all at once. Choose relaxed rather than tight fits, which look more current.",
          "Hair that suits preppy style is neat but not stiff: a side part, an Ivy League cut, a long bob or a sleek low bun.",
        ],
      },
      {
        h2: "Try a Preppy Outfit",
        paragraphs: [
          "Preppy is one of the 9 styles in Choose for me in " + a("/ai-stylist", "Ollie Stylist") + ". It builds a full outfit on a free model set to your build and height, with links to every piece. See all 9 in " + a("/blog/aesthetic-types", "aesthetic types") + ".",
        ],
      },
    ],
    faqs: [
      { q: "What is preppy style?", a: "Classic American campus clothing: oxford shirts, chinos, cable knits, polo and rugby shirts, stripes, blazers and loafers or boat shoes." },
      { q: "What's the difference between preppy and old money?", a: "They share many pieces, but preppy uses more colour, stripes and sporty clothes, while old money style is quieter and more muted." },
      { q: "What shoes are preppy?", a: "Penny loafers, boat shoes, white canvas sneakers and, for women, ballet flats." },
    ],
    relatedSlugs: ["old-money-style-men", "aesthetic-types", "capsule-wardrobe-men"],
  },
  {
    slug: "aesthetic-types",
    title: "Aesthetic Types: Find Your Style in 9 Looks",
    excerpt: "The 9 clothing aesthetics, from clean classic and old money to streetwear, techwear and Y2K: what each one looks like and how to tell which is yours.",
    summary: "A style aesthetic is a consistent look built from certain colours, fits and pieces. Ollie Stylist uses 9: clean classic, old money, streetwear, minimal, rugged workwear, techwear, Gen-Z/Y2K, preppy and athleisure. To find yours, save outfits you like, look for the repeated colours and fits, and check which aesthetic suits your daily life, your budget and your build.",
    date: "",
    isoDate: "2026-09-11T07:50:00Z",
    readTime: "3 min read",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["aesthetic types", "types of aesthetics", "clothing aesthetics", "style types", "what is my aesthetic"],
    sections: [
      {
        h2: "The 9 Aesthetics",
        paragraphs: [
          "<strong>1. Clean classic:</strong> navy, white and grey in fits that never date: oxford shirts, chinos, plain knitwear, leather sneakers. <strong>2. Old money:</strong> knitwear, pleated trousers, loafers and quiet colours; see " + a("/blog/old-money-style-men", "old money style") + ". <strong>3. Streetwear:</strong> heavy cotton, relaxed fits, hoodies, graphic pieces and statement sneakers.",
          "<strong>4. Minimal:</strong> few colours (often black, white, grey and beige), good fabric and no logos. <strong>5. Rugged / workwear:</strong> canvas jackets, flannel shirts, raw denim and boots, built to last. <strong>6. Techwear:</strong> technical, often waterproof fabrics, mostly black, with functional straps, zips and pockets.",
          "<strong>7. Gen-Z / Y2K:</strong> baggy denim, retro sneakers, cropped or oversized tops and playful layers inspired by the early 2000s. <strong>8. Preppy:</strong> oxford cloth, stripes, cable knits and boat shoes; see " + a("/blog/preppy-style", "preppy style") + ". <strong>9. Athleisure:</strong> gym-to-street clothes: joggers, technical tees, zip-ups and clean trainers.",
        ],
      },
      {
        h2: "How to Find Your Aesthetic",
        paragraphs: [
          "<strong>1. Save what you like.</strong> Collect 20 to 30 outfits from Pinterest, Instagram or street-style photos without thinking too hard. <strong>2. Find the pattern.</strong> Look for repeated colours, fits (slim, relaxed, oversized) and pieces. <strong>3. Check your life.</strong> A techwear wardrobe makes sense for a rainy city commute; old money suits an office. <strong>4. Check your wardrobe.</strong> Which clothes do you already reach for most?",
          "Most people are a mix of two, such as minimal with workwear or classic with preppy. That's fine; pick one as the base and borrow from the other.",
        ],
      },
      {
        h2: "Matching Your Build and Face",
        paragraphs: [
          "Any aesthetic works on any body, but fit decides how it looks. Relaxed streetwear and Y2K can swamp a short or slim frame unless the proportions are balanced; structured classic and old money pieces flatter most builds. See " + a("/blog/how-to-dress-for-your-body-type", "how to dress for your body type") + " for details.",
          "Your haircut should match too: a textured crop or curtains for streetwear and Y2K, a side part for classic and preppy, a buzz or crew cut for workwear.",
        ],
      },
      {
        h2: "Try All 9 for Free",
        paragraphs: [
          "In " + a("/ai-stylist", "Ollie Stylist") + ", pick a style and tap Choose for me to get a full outfit in any of the 9 aesthetics on a model set to your gender, look, build and height. Then scan your face for haircuts that suit both your face shape and the style.",
        ],
      },
    ],
    faqs: [
      { q: "What are the main types of aesthetics?", a: "Common clothing aesthetics include clean classic, old money, streetwear, minimal, rugged workwear, techwear, Gen-Z/Y2K, preppy and athleisure." },
      { q: "How do I find my aesthetic?", a: "Save 20 to 30 outfits you like, look for the repeated colours, fits and pieces, then pick the aesthetic that also fits your daily life." },
      { q: "Can you have more than one aesthetic?", a: "Yes. Most people mix two, using one as the base and borrowing pieces from the other." },
    ],
    relatedSlugs: ["preppy-style", "old-money-style-men", "capsule-wardrobe-men"],
  },
  {
    slug: "what-to-wear-on-a-first-date",
    title: "What to Wear on a First Date",
    excerpt: "What to wear on a first date for men and women: outfits for coffee, dinner, drinks and activity dates, plus the simple rules that make a good impression.",
    summary: "On a first date, wear something one step smarter than the venue, that fits well and that you feel comfortable in. For men: dark jeans or chinos, a clean shirt, polo or fine knit, and clean shoes. For women: well-fitted jeans or trousers with a nice top, or a simple dress, with comfortable shoes. Match the activity, choose colours near your face that suit you, and avoid anything you'll fidget with.",
    date: "",
    isoDate: "2026-09-24T12:07:00Z",
    readTime: "3 min read",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["what to wear on a first date", "first date outfit", "first date outfit men", "first date outfit women", "what to wear on a date"],
    sections: [
      {
        h2: "The Simple Rules",
        paragraphs: [
          "<strong>1. Dress one step above the venue.</strong> If others will be in T-shirts, wear a shirt or a nice top. <strong>2. Fit beats fashion.</strong> Clothes that fit well look better than new or expensive ones. <strong>3. Be comfortable.</strong> If you're tugging at a hem or limping in new shoes, it shows. <strong>4. Look like yourself.</strong> Dress like the best version of how you usually look, so you're recognisable from your photos. <strong>5. Get the details right:</strong> clean shoes, pressed clothes, and a recent haircut.",
        ],
      },
      {
        h2: "Outfits by Date Type",
        paragraphs: [
          "<strong>Coffee:</strong> men: plain T-shirt or polo, overshirt, dark jeans, white leather sneakers. Women: knit top or blouse, straight jeans, ankle boots or clean sneakers. <strong>Dinner:</strong> men: oxford shirt or fine knit, chinos or dark trousers, loafers or boots, and an unstructured blazer for a nicer restaurant. Women: a simple dress or silky top with tailored trousers, and shoes you can walk in.",
          "<strong>Drinks:</strong> men: dark shirt or knitted polo, dark jeans, Chelsea boots. Women: a nice top with jeans or a slip skirt, and a jacket. <strong>Activity (walk, mini golf, gallery):</strong> clean casual: jeans, a T-shirt or sweater, a light jacket and comfortable sneakers.",
        ],
      },
      {
        h2: "Colour and Grooming",
        paragraphs: [
          "Wear a colour that suits your undertone near your face; see " + a("/blog/what-colors-look-good-on-me", "what colors look good on me") + ". Some studies have linked red clothing to people being rated as more attractive, but later attempts to repeat them found smaller or no effects, so wear red only if you like it.",
          "Grooming matters as much as clothes: tidy hair, trimmed beard or brows, clean nails and a light amount of fragrance, if any. For a bigger refresh before the date, see " + a("/blog/glow-up-tips", "glow up tips") + ".",
        ],
      },
      {
        h2: "Plan the Outfit in Advance",
        paragraphs: [
          "Try outfit ideas on a model set to your build in " + a("/ai-stylist", "Ollie Stylist") + ". The Clean classic and Minimal styles in Choose for me work for most first dates, and you can see a haircut that suits your face shape too.",
        ],
      },
    ],
    faqs: [
      { q: "What should a guy wear on a first date?", a: "Dark jeans or chinos, a clean shirt, polo or fine knit, and clean leather shoes or sneakers. Add a blazer for a nicer restaurant." },
      { q: "What should a woman wear on a first date?", a: "Well-fitted jeans or trousers with a nice top, or a simple dress, with shoes you're comfortable walking in." },
      { q: "What colour is best for a first date?", a: "One that suits your skin undertone. Red has a mixed research record, so wear what makes you feel confident." },
    ],
    relatedSlugs: ["smart-casual-men", "glow-up-tips", "how-to-look-good-in-photos"],
  },
  {
    slug: "glow-up-tips",
    title: "Glow Up Tips That Actually Change How You Look",
    excerpt: "Glow up tips that make a real difference: the right haircut for your face shape, skin care, brows, sleep, posture and clothes that fit. A step-by-step plan.",
    summary: "The glow up changes that make the biggest visible difference are a haircut that suits your face shape, a simple skin routine with daily sunscreen, groomed brows and facial hair, enough sleep, better posture and clothes that fit and suit your colouring. Most take weeks, not months, and cost little. Start with the haircut and fit, which change how you look on day one.",
    date: "",
    isoDate: "2026-09-07T17:24:00Z",
    readTime: "3 min read",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["glow up tips", "how to glow up", "glow up", "how to look better", "glow up checklist"],
    sections: [
      {
        h2: "1. Get a Haircut That Suits Your Face",
        paragraphs: [
          "A haircut changes your look more than anything else you can do in a day. Pick one that balances your face shape: height on top for round faces, softness for square ones, width at the sides for long ones. Start with " + a("/blog/best-haircut-for-face-shape", "the best haircut for your face shape") + ", then see " + a("/blog/how-to-ask-for-a-haircut", "how to ask for it") + " at the barber or salon.",
        ],
      },
      {
        h2: "2. Skin, Brows and Facial Hair",
        paragraphs: [
          "A basic routine is enough: a gentle cleanser, a moisturiser and broad-spectrum sunscreen every morning. Dermatologists consider daily sunscreen the most effective way to prevent early skin ageing. Shape your brows by removing stray hairs below the natural line; see " + a("/blog/eyebrow-shapes", "eyebrow shapes") + ". If you have a beard, keep a clean neckline and cheek line; see " + a("/blog/beard-styles-for-face-shape", "beard styles for your face shape") + ".",
        ],
      },
      {
        h2: "3. Sleep, Water and Movement",
        paragraphs: [
          "In a Swedish study, people photographed after a night of sleep deprivation were rated by strangers as less attractive, less healthy and more tired than in photos taken after normal sleep. Aim for 7 to 9 hours. Regular exercise improves posture and how clothes sit, and drinking enough water helps you feel better even if it won't transform your skin on its own.",
          "Stand tall: shoulders back and down, chin level. Good posture can make you look taller and slimmer in photos; see " + a("/blog/how-to-look-taller", "how to look taller") + ".",
        ],
      },
      {
        h2: "4. Clothes That Fit and Suit You",
        paragraphs: [
          "Fit matters more than brands. Get trousers hemmed and choose the right size in the shoulders. Wear colours that suit your undertone near your face; see " + a("/blog/what-colors-look-good-on-me", "what colors look good on me") + ". Pick one aesthetic and build around it; see " + a("/blog/aesthetic-types", "aesthetic types") + ".",
        ],
      },
      {
        h2: "5. Plan It in One Place",
        paragraphs: [
          "In " + a("/ai-stylist", "Ollie Stylist") + ", a free face scan in your browser ranks haircuts, beards and glasses for your face shape, and you can dress a model set to your build in outfits from 9 styles. With Ollie Pro, you can see the new haircut on your own photo before you book it.",
        ],
      },
    ],
    faqs: [
      { q: "How can I glow up fast?", a: "Get a haircut that suits your face shape, groom your brows and facial hair, sleep well for a week, and wear clothes that fit. Those show results within days." },
      { q: "What is the biggest glow up change?", a: "For most people, a haircut that suits their face shape, followed by clothes that fit properly." },
      { q: "Does sleep really change how you look?", a: "Yes. In a Swedish study, people photographed after sleep deprivation were rated as less attractive and more tired than after normal sleep." },
    ],
    relatedSlugs: ["best-haircut-for-face-shape", "hairstyles-that-make-you-look-younger", "how-to-look-good-in-photos"],
  },
  {
    slug: "how-to-look-good-in-photos",
    title: "How to Look Good in Photos: 10 Tips That Work",
    excerpt: "How to look good in photos: camera distance, light, angles, posture, a real smile and colours that suit you. 10 simple tips for selfies and group photos.",
    summary: "To look better in photos, keep the camera at least an arm's length away or use the 2x lens, face soft window light, hold the camera at or slightly above eye level, push your chin forward and slightly down, angle your body, relax your shoulders and smile with your eyes. Phone cameras held close make the nose look bigger: one study found a selfie at 12 inches made the nose about 30% wider than a photo at 5 feet.",
    date: "",
    isoDate: "2026-09-20T08:41:00Z",
    readTime: "3 min read",
    category: "Style",
    author: "Wendy Wei",
    keywords: ["how to look good in photos", "how to look good in pictures", "how to take a good selfie", "why do i look bad in photos", "photogenic tips"],
    sections: [
      {
        h2: "Why You Look Different in Photos",
        paragraphs: [
          "A phone held close to your face distorts it. A 2018 study in <em>JAMA Facial Plastic Surgery</em> found that a selfie taken at 12 inches made the nose look about 30% wider than a photo of the same face at 5 feet. Photos are also flipped compared with your mirror image, and because you're used to your reflection, the unflipped version can look slightly wrong to you, even though it's how other people see you.",
        ],
      },
      {
        h2: "10 Tips for Better Photos",
        paragraphs: [
          "<strong>1. Step back.</strong> Hold the camera at least an arm's length away, or use the 2x or portrait lens from further back. <strong>2. Face the light.</strong> Soft daylight from a window in front of you hides texture; avoid light from directly above. <strong>3. Camera at eye level or slightly above.</strong> From below, it adds weight to the chin and neck. <strong>4. Chin forward and slightly down.</strong> It defines the jaw; see " + a("/blog/jawline", "how to get a better jawline") + ". <strong>5. Angle your body</strong> about 45 degrees to the camera instead of square on.",
          "<strong>6. Relax your shoulders</strong> and lengthen your neck. <strong>7. Smile with your eyes.</strong> A real (Duchenne) smile raises the cheeks and narrows the eyes; think of something funny instead of saying cheese. <strong>8. Find your side.</strong> Most faces aren't symmetrical; take a few photos from each side and compare. <strong>9. Wear a colour that suits you</strong> and avoid busy patterns; see " + a("/blog/what-colors-look-good-on-me", "what colors look good on me") + ". <strong>10. Take a burst</strong> and pick the best one. Professional photographers take many shots for one keeper.",
        ],
      },
      {
        h2: "Group Photos and Video Calls",
        paragraphs: [
          "In group photos, stand slightly behind and to the side of others rather than at the front, where you'll look larger. On video calls, put the camera at eye level (stack books under a laptop) and sit facing a window.",
        ],
      },
      {
        h2: "Use a Good Photo for the Face Scan",
        paragraphs: [
          "The same tips give better results with Ollie's tools. A front-facing photo in even light, with nothing covering your face, gives the most accurate face-shape scan in " + a("/ai-stylist", "Ollie Stylist") + ".",
        ],
      },
    ],
    faqs: [
      { q: "Why do I look bad in photos but fine in the mirror?", a: "Phone cameras held close distort your face, and photos show you unflipped, while you're used to your mirror image. Stepping back and using soft light helps." },
      { q: "How far away should the camera be for a selfie?", a: "At least an arm's length, or use the 2x lens from further away. At 12 inches the nose can look about 30% wider than at 5 feet." },
      { q: "What angle is most flattering in photos?", a: "Camera at or slightly above eye level, body turned about 45 degrees, and chin pushed forward and slightly down." },
    ],
    relatedSlugs: ["glow-up-tips", "jawline", "what-colors-look-good-on-me"],
  },
]
