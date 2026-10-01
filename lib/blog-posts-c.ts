import type { BlogPost } from "./blog-post-types"

export const postsC: BlogPost[] = [
  {
    slug: "aging-face-recognition",
    title: "How Aging Affects Face Recognition Accuracy Over Time",
    excerpt: "Your face changes significantly over decades, but AI can still match photos taken 30 years apart. Here is how modern systems handle the aging challenge.",
    summary: "Facial recognition does work as you age, but accuracy drops as the gap between photos grows. Skin, fat and muscle change over decades while bone structure stays largely the same after early adulthood, and the network relies mostly on that structure. Photos a few years apart usually match well; photos decades apart, much less reliably.",
    date: "July 27, 2026",
    isoDate: "2026-07-27",
    updatedIsoDate: "2026-10-01",
    readTime: "4 min read",
    category: "Science",
    author: "Wendy Wei",
    keywords: ["does facial recognition work as you age", "aging face recognition", "face recognition accuracy", "cross-age", "bone structure", "facial aging", "face recognition old photos", "old photo facial recognition", "cross-age matching", "celebrity match", "aging", "face recognition"],
    sections: [
      {
        h2: "What Changes and What Doesn't",
        paragraphs: [
          "Aging affects different facial components at different rates. <strong>Soft tissue</strong>, skin, subcutaneous fat, and muscle, changes substantially: skin loses elasticity and develops texture, fat redistributes and reduces in some areas, and facial volume changes over decades. <strong>Bone structure</strong>, by contrast, is largely stable after early adulthood. The mandible, orbital bones, and nasal cartilage retain their fundamental configuration for most of adult life.",
          "Face recognition systems built on deep embeddings primarily capture structural geometry rather than surface texture, making them more robust to aging than systems that relied on texture features. The embedding of the same person photographed at 25 and at 55 will be more similar than a texture-based comparison would suggest, the bone geometry anchor keeps the embedding in roughly the same region of face space.",
        ],
      },
      {
        h2: "Cross-Age Matching in Practice",
        paragraphs: [
          "Cross-age face verification benchmarks test systems on pairs with large temporal gaps. State-of-the-art systems achieve above 90% accuracy on these benchmarks when gaps are under 20 years, with accuracy declining for larger gaps, particularly when childhood photos are compared against adult photos, since facial proportions change substantially during growth.",
          "For Ollie, cross-age robustness means that a photo taken a decade ago will typically return the same top celebrity matches as a recent photo, the stable geometry signal dominates the changing surface signal. Photos from adolescence or early adulthood may diverge, because the face structure may not yet have fully developed.",
        ],
      },
      {
        h2: "When Consistency Breaks Down",
        paragraphs: [
          "Three scenarios produce meaningful shifts across age: <strong>adolescent photos</strong> (face proportions change substantially during puberty), <strong>very large weight changes</strong> (which alter soft tissue geometry significantly), and <strong>medical conditions</strong> that affect facial structure. Outside these scenarios, adult photos across a 20-year span will typically produce consistent top matches.",
          "To test your own consistency, try uploading a photo from 5+ years ago alongside a recent one and compare the rankings. Where they agree, the similarity is robustly structural. Where they differ, the difference reflects photo condition variation or genuine facial change.",
        ],
      },
    ],
    faqs: [
      { q: "Does aging affect my celebrity match results?", a: "Moderately. Deep embedding systems are robust to aging because they capture bone structure rather than surface texture. Photos from the same adult period will produce consistent results; childhood photos may differ." },
      { q: "Can face recognition match photos taken 20 years apart?", a: "Usually yes with good photo quality. State-of-the-art cross-age systems achieve over 90% accuracy on 20-year gaps. Larger gaps or childhood-to-adult pairs are harder." },
      { q: "Will my celebrity match change as I get older?", a: "Slowly, if at all, for adults. Bone structure is stable, keeping the embedding in the same region of face space. Large weight changes or photos from adolescence can produce more noticeable shifts." },
    ],
    relatedSlugs: ["celebrity-match-different-era", "face-recognition-math", "what-is-facial-embedding"],
  },
  {
    slug: "photo-angle-celebrity-match",
    title: "The Best Angle for a Celebrity Face Match (According to the AI)",
    excerpt: "Camera angle changes how your facial features appear at the pixel level. Here is what the research says about which angles produce the most accurate results, and why.",
    summary: "The best angle for a face picture, for AI matching, is straight on, within about 15 degrees in any direction, with the camera at eye level. Turning, tilting or shooting from above or below changes how your 3D face projects into a 2D photo, which changes the features the network reads. Face the camera for the most accurate celebrity match.",
    date: "July 26, 2026",
    isoDate: "2026-07-26",
    readTime: "4 min read",
    category: "Guide",
    author: "Wendy Wei",
    keywords: ["best angle for face picture", "face recognition angle", "camera angle", "head pose", "celebrity match", "face recognition"],
    sections: [
      {
        h2: "How Angle Affects Embedding Accuracy",
        paragraphs: [
          "Face recognition networks are trained on predominantly front-facing images because most real-world applications require matching front-facing portraits. When you provide a photo at an angle, the 2D projection of your 3D face changes, features that are prominently visible from the front are partially obscured at an angle, and vice versa. This changes the feature pattern the network extracts.",
          "The three degrees of angular freedom, <strong>yaw</strong> (left/right rotation), <strong>pitch</strong> (up/down tilt), and <strong>roll</strong> (sideways tilt), each affect the result differently. Yaw (looking left or right) has the largest effect, because it significantly changes which features are visible. Pitch and roll have smaller effects at moderate values.",
        ],
      },
      {
        h2: "Optimal Angle Range",
        paragraphs: [
          "The optimal range for face matching is ±15 degrees of yaw (within 15 degrees of straight-on), ±10 degrees of pitch, and ±10 degrees of roll. Within this range, the face alignment pipeline can successfully normalise the crop, and the embedding remains stable. Beyond ±25–30 degrees of yaw, accuracy begins to degrade noticeably.",
          "A slight upward tilt (camera slightly above eye level, looking up) is the most common angle in controlled portrait photography and is well represented in training data. Photos taken from dramatically below (looking down the nose) or very high above (making the face appear foreshortened) should be avoided.",
        ],
      },
    ],
    faqs: [
      { q: "What is the best angle to look for a celebrity match photo?", a: "Straight-on or within 15 degrees of straight-on. Looking slightly upward at the camera (camera above eye level) is ideal and well-represented in celebrity training data." },
      { q: "Does a slight angle in my photo affect the match?", a: "Within about 15 degrees of yaw rotation, the effect is minimal. Beyond 25-30 degrees, accuracy begins to degrade noticeably." },
    ],
    relatedSlugs: ["best-photo-celebrity-match", "selfie-vs-passport-match", "face-detection-vs-recognition"],
  },
  {
    slug: "group-photo-matching",
    title: "Why Group Photos Usually Give Poor Celebrity Match Results",
    excerpt: "Cropping your face from a group photo might seem convenient, but it rarely works well for face matching. Here is why and what to do instead.",
    summary: "Group photos give poor face recognition and celebrity match results because each face takes up only a small part of the picture, so it has too few pixels. Cropping does not add detail back, and group shots also bring bad angles and uneven light; Ollie also matches only the largest face in a photo. Use a photo of just you, with your face filling a good part of the frame.",
    date: "July 24, 2026",
    updatedIsoDate: "2026-09-23",
    isoDate: "2026-07-24",
    readTime: "3 min read",
    category: "Guide",
    author: "Wendy Wei",
    keywords: ["group photo face recognition", "group photo", "image resolution", "celebrity match", "face detection", "photo tips"],
    sections: [
      {
        h2: "The Resolution Problem",
        paragraphs: [
          "Group photos typically show multiple people at a distance, giving each face a small fraction of the total image resolution. A 12-megapixel photo of a group of eight people might show each face at only 200–400 pixels wide, borderline for accurate face recognition. When you crop and upload that small face region, the face detection pipeline is working with limited pixel information.",
          "Ollie's network reads a face aligned to 112 × 112 pixels, and the aligner needs clean detail to work from, so the face in your photo should be comfortably larger than that. Below that size, detail is insufficient and the embedding quality degrades. Group photo crops from standard smartphone photos often fall right at this borderline or below it, particularly if the photo was taken from more than a few metres away.",
        ],
      },
      {
        h2: "What to Use Instead",
        paragraphs: [
          "For best results, take a dedicated portrait photo for matching, you alone, rear camera at arm's length or further, good lighting. This gives maximum face resolution, controlled conditions, and no competing faces in the frame. It takes 30 seconds and produces substantially better results than even a cropped group photo from an event.",
          "If you only have group photos available, choose one where you were closest to the camera, look for the sharpest, least motion-blurred option, and make sure you are roughly front-facing in the shot. Set expectations accordingly, the match may be less reliable than a dedicated portrait.",
        ],
      },
    ],
    faqs: [
      { q: "Can I use a group photo for celebrity face matching?", a: "You can, but results are often less accurate. Group photos give each face limited resolution, and cropped regions may be below the minimum quality threshold for reliable embedding extraction." },
    ],
    relatedSlugs: ["best-photo-celebrity-match", "face-detection-vs-recognition", "why-same-person-different-ai-results"],
  },
  {
    slug: "celebrity-doppelgangers-throughout-history",
    title: "Celebrity Doppelgangers Throughout History: Faces That Repeat",
    excerpt: "The same facial archetypes appear in royal portraits, ancient sculpture, and modern celebrities. Here is what repeated historical face types tell us about facial geometry.",
    summary: "Historical doppelgangers exist because the same facial proportions recur across centuries: the genes behind them stay in the population, so similar faces appear in Roman busts, Renaissance portraits and today's celebrities. Face recognition measures that structure, not the era, so a modern face can closely resemble a centuries-old one.",
    date: "July 23, 2026",
    updatedIsoDate: "2026-09-26",
    isoDate: "2026-07-23",
    readTime: "5 min read",
    category: "Culture",
    author: "Wendy Wei",
    keywords: ["historical doppelgangers", "celebrity doppelgangers from history", "famous doppelgangers", "facial archetype", "historical portraits", "face recognition", "celebrity doppelganger"],
    sections: [
      {
        h2: "The Recurring Face Archetype",
        paragraphs: [
          "Historians of portraiture have long noted that certain facial types recur across centuries and cultures, the same strong jaw and prominent brow appears in Roman busts, in Renaissance portraits, and in contemporary celebrities. These recurring types are not coincidences or artistic conventions. They reflect the underlying population genetics: certain facial proportion combinations are common enough that they appear across historical eras and diverse populations.",
          "The deep structure of these archetypes is what the face recognition embedding captures. When you match a celebrity who became famous decades before you were born, the match is an archetype match, your facial proportions belong to a type that has existed throughout recorded history.",
        ],
      },
      {
        h2: "Seeing Archetypes in Your Own Results",
        paragraphs: [
          "Ollie's database holds living celebrities, so it will not show you a Roman emperor. But the same archetypes run through it: a match with an actor who became famous in the 1970s and a match with a new star can both reflect the type your face belongs to.",
          "When a match seems to come from another generation, you share proportions with a well-known example of that type. The match is no less real for spanning decades.",
        ],
      },
    ],
    faqs: [
      { q: "Why do some people look like historical figures from different eras?", a: "Facial archetypes, characteristic proportion combinations, recur across populations and centuries because the genetic variants driving those proportions remain in the gene pool. Face recognition detects this structural similarity regardless of era." },
    ],
    relatedSlugs: ["celebrity-match-different-era", "why-everyone-has-doppelganger", "most-matched-celebrities"],
  },
  {
    slug: "face-shape-guide",
    title: "Face Shapes Explained: What 'Oval', 'Square', and 'Heart' Actually Mean for AI",
    excerpt: "Traditional face shape categories describe the overall outline. AI face recognition measures something more detailed. Here is how the two relate, and how each predicts your celebrity match.",
    summary: "The main face shapes are oval, round, square, heart, diamond and oblong, defined by the outline of your hairline, cheekbones and jaw. They are useful for choosing haircuts and glasses but too coarse for AI. Face recognition encodes much finer proportions in 512 numbers, which is why two square faces can match different celebrities.",
    date: "July 22, 2026",
    isoDate: "2026-07-22",
    readTime: "4 min read",
    category: "Culture",
    author: "Wendy Wei",
    keywords: ["face shapes", "what face shape do i have", "face shape chart", "oval face", "square face", "face recognition"],
    sections: [
      {
        h2: "What Traditional Face Shapes Measure",
        paragraphs: [
          "Traditional face shape categories, oval, round, square, heart, diamond, oblong, describe the two-dimensional silhouette of the face: the outline defined by the hairline, jaw, and widest point. These categories are useful heuristics for hairstyling and eyewear recommendations because they predict the visual balance of shapes applied around the face.",
          "From a face recognition perspective, these categories are quite coarse. Two faces categorised as 'square' might have very different inter-ocular distances, very different nose shapes, and very different midface proportions. The same celebrity embedding could sit in the 'square face' category and match users across a wide range of actual feature configurations within that category.",
        ],
      },
      {
        h2: "What AI Measures Instead",
        paragraphs: [
          "A 512-dimensional facial embedding captures far more than the face silhouette. It simultaneously encodes: inter-ocular distance relative to face width, midface proportions (nose length relative to face height), jaw angle and definition, cheekbone prominence, nose bridge width, and many other geometric relationships, each varying continuously rather than falling into categories.",
          "This richer representation explains why people with the same traditional face shape can receive very different celebrity matches. Two 'oval-faced' people whose midface proportions differ, or whose eye spacing differs, will have embeddings in different regions of face space and will match different sets of celebrities.",
        ],
      },
    ],
    faqs: [
      { q: "What is my face shape and how does it affect my celebrity match?", a: "Traditional face shapes (oval, square, heart) describe the overall silhouette. AI matches on many more dimensions simultaneously, two people with the same shape category can receive very different matches due to differences in feature proportions." },
    ],
    relatedSlugs: ["what-celebrity-match-reveals", "face-recognition-math", "why-everyone-has-doppelganger"],
  },
  {
    slug: "celebrity-face-evolution",
    title: "How Celebrity Beauty Standards Have Changed Over 50 Years",
    excerpt: "The faces that became famous in 1970 differ systematically from those that became famous in 2020. Here is how beauty standards have shifted, and what it means for face matching.",
    summary: "Beauty standards have changed over time: classic Hollywood favoured strong symmetry and sharp cheekbones, the 1970s more natural looks, and the 1990s and 2000s large eyes and particular jaw shapes. Each era's celebrity beauty standards reflect its culture, its cameras and its entertainment industry, and the shift shows in which faces became famous.",
    date: "July 21, 2026",
    isoDate: "2026-07-21",
    readTime: "4 min read",
    category: "Culture",
    author: "Wendy Wei",
    keywords: ["beauty standards over time", "celebrity beauty standards", "beauty ideals", "face types", "celebrity culture", "facial features"],
    sections: [
      {
        h2: "The Shifting Face of Fame",
        paragraphs: [
          "Different eras have favoured different facial types for celebrity status. The classic Hollywood era (1930s–1950s) tended toward strong symmetry, defined cheekbones, and the angular features associated with film noir cinematography. The 1970s shifted toward more naturalistic features. The 1990s and 2000s favoured particular combinations of large eyes and specific jaw profiles. Each era reflects the intersection of cultural aesthetics, media technologies, and the selection pressures of the industry.",
          "These temporal clusters are visible in the face recognition embedding space. When celebrity embeddings are visualised and labelled by decade, some loose temporal clustering appears, not because features change across decades, but because different eras selected for different proportion combinations in the people who achieved widespread fame.",
        ],
      },
      {
        h2: "What Era Clustering Means for Your Match",
        paragraphs: [
          "If your matches consistently come from a particular era, you share facial proportions with the type favoured by that era's celebrity culture. This is aesthetically interesting, it identifies which visual archetype your face most closely resembles. It does not mean your face belongs to that era, only that the clearest examples of your facial type in the database happened to achieve prominence during that period.",
          "Era clustering in Ollie's database is loose, because it holds living celebrities only: older eras are represented by stars who became famous young and are still well known today.",
        ],
      },
    ],
    faqs: [
      { q: "Why do my matches tend to come from a particular decade?", a: "Facial types are clustered partly by era because different periods selected for different proportion combinations in celebrities. Your proportions may naturally match a type that was prominent in a specific era." },
    ],
    relatedSlugs: ["celebrity-match-different-era", "most-matched-celebrities", "history-of-face-recognition"],
  },
  {
    slug: "golden-ratio-face",
    title: "The Golden Ratio and Facial Attractiveness: Myth vs Reality",
    excerpt: "The golden ratio has been claimed to explain facial beauty for centuries. Here is what the actual research shows, and how it relates to facial geometry in AI.",
    summary: "The golden ratio face theory, that the most attractive faces follow the 1.618 ratio, is mostly a myth: controlled research finds weak or inconsistent links. Averageness, symmetry and signs of health and youth predict attractiveness far better. Golden ratio face tests and calculators are entertainment, not science.",
    date: "July 18, 2026",
    isoDate: "2026-07-18",
    readTime: "4 min read",
    category: "Culture",
    author: "Wendy Wei",
    keywords: ["golden ratio face", "golden ratio face test", "facial attractiveness", "1.618", "symmetry", "beauty myth"],
    sections: [
      {
        h2: "The Claim and the Evidence",
        paragraphs: [
          "The claim that the <strong>golden ratio</strong> (approximately 1.618) governs facial attractiveness has been popularised in cosmetic surgery, beauty guides, and viral videos. The idea is that faces with key proportions approximating this ratio are perceived as most beautiful. Like many appealing simple explanations, the reality is more complicated.",
          "Controlled empirical research on the golden ratio and facial attractiveness is mixed at best. While some studies have found modest correlations between certain facial measurements and the ratio, others find no effect, or find that the relationship is confounded by averageness, faces close to the population mean on many dimensions tend to be both attractive and to approximate many ratio targets simultaneously.",
        ],
      },
      {
        h2: "What Actually Predicts Attractiveness",
        paragraphs: [
          "The most robust predictors of facial attractiveness in the research literature are: <strong>averageness</strong> (faces near the mathematical average of the population are more attractive), <strong>symmetry</strong> (bilateral symmetry is attractive but has a smaller effect than often claimed), and <strong>sexual dimorphism</strong> (more pronounced sex-typical features are attractive within groups, but with complex cultural variation).",
          "Notably, AI face recognition does not include attractiveness as a dimension. The embedding encodes identity-relevant geometry, the features that distinguish individuals, not beauty-relevant geometry. High-scoring matches reflect structural similarity to the celebrity's bone configuration, not any assessment of attractiveness.",
        ],
      },
    ],
    faqs: [
      { q: "Does the golden ratio really determine facial attractiveness?", a: "The evidence is weak. Averageness (closeness to the population mean on many dimensions) is a more robust predictor of attractiveness than golden ratio proportions." },
      { q: "Does Ollie's face recognition measure attractiveness?", a: "No. The embedding captures identity-relevant geometry, features that distinguish individuals. Attractiveness is not encoded as a dimension." },
    ],
    relatedSlugs: ["symmetrical-faces", "what-celebrity-match-reveals", "why-people-say-you-look-like-someone"],
  },
  {
    slug: "face-attractiveness-research",
    title: "What 50 Years of Attractiveness Research Tells Us About Face Perception",
    excerpt: "Attractiveness is partly universal and partly cultural. Here is what the research consensus actually says, and how it relates to face recognition technology.",
    summary: "What makes a face attractive? Fifty years of research point to averageness, symmetry and signs of health and youth: composite average faces are rated more attractive than most real ones, across cultures. Agreement is strongest for the extremes; individual taste and culture explain the rest.",
    date: "July 17, 2026",
    isoDate: "2026-07-17",
    readTime: "4 min read",
    category: "Science",
    author: "Wendy Wei",
    keywords: ["what makes a face attractive", "facial attractiveness", "attractiveness research", "average faces", "symmetry", "face perception"],
    sections: [
      {
        h2: "The Universality of Attractiveness",
        paragraphs: [
          "Studies across cultures with varying levels of media exposure find broad agreement on facial attractiveness ratings for certain extreme cases, very symmetric faces are consistently rated more attractive; composites of many faces (mathematical average faces) are consistently rated higher than most individual faces. These findings support some cross-cultural universality in the attractiveness response.",
          "However, cross-cultural agreement is modest for faces in the middle of the attractiveness distribution, and some features that predict attractiveness within one cultural context are neutral or negative in others. The universality is partial, not complete.",
        ],
      },
      {
        h2: "Average Faces Are More Attractive",
        paragraphs: [
          "The finding that <strong>composite (average) faces</strong> are more attractive than most individuals in the composite was first documented by Francis Galton in 1883 and has been replicated many times since. The current explanation is partly pathogen-resistance signalling: an average face configuration indicates an absence of genetic mutations that would cause deviation from the population mean.",
          "This averageness effect has an important implication for face recognition: the celebrities who are most commonly matched (whose embeddings are closest to the population mean) may also tend to be among the most conventionally attractive celebrities in the database. The embedding space and the attractiveness space share some geometry without being identical.",
        ],
      },
    ],
    faqs: [
      { q: "Is attractiveness the same across all cultures?", a: "Partly. Symmetry and averageness show cross-cultural consistency. Many specific feature preferences are culture-specific and influenced by media exposure." },
    ],
    relatedSlugs: ["golden-ratio-face", "symmetrical-faces", "most-matched-celebrities"],
  },
  {
    slug: "celebrity-resemblance-and-self-image",
    title: "What Your Celebrity Match Says About How You See Yourself",
    excerpt: "People react very differently to their celebrity matches, with delight, scepticism, or surprise. Here is the psychology of self-image and how it filters your reaction to AI results.",
    summary: "Your reaction to a celebrity resemblance often says more about how you see yourself than about the match. People accept matches with celebrities they admire and doubt equally strong matches with ones they don't. The AI only measures facial proportions; the meaning comes from you.",
    date: "July 16, 2026",
    isoDate: "2026-07-16",
    readTime: "4 min read",
    category: "Wellness",
    author: "Wendy Wei",
    keywords: ["celebrity resemblance", "celebrity lookalike", "self-image", "motivated reasoning", "celebrity match", "face perception"],
    sections: [
      {
        h2: "Why Reactions Vary So Much",
        paragraphs: [
          "People's reactions to their celebrity match reveal as much about their self-image as about the match itself. Someone who receives a match with a celebrity they admire often accepts it immediately; the same geometric similarity, matched to someone they are neutral about, may produce scepticism. This asymmetry reflects motivated reasoning: we evaluate facial comparisons partly through the lens of how the comparison makes us feel.",
          "The AI's computation is emotionally neutral, it measures geometric distance in 512-dimensional space without any awareness of whether a celebrity is admired or not. The emotional charge comes entirely from the human interpretation of the result.",
        ],
      },
      {
        h2: "The Self-Image Filter",
        paragraphs: [
          "Self-image profoundly shapes perception of facial comparisons. People who have a positive self-image are more likely to accept matches that confirm their self-concept and find interesting angles in unexpected ones. People with more self-critical tendencies may systematically find fault with any result, not because the result is wrong, but because self-criticism makes genuine comparison feel uncomfortable.",
          "The most productive approach treats the celebrity match as geometric information, not evaluation. Your top match indicates which celebrity's bone structure is most similar to yours, information about proportion and geometry, not about beauty, worth, or status.",
        ],
      },
    ],
    faqs: [
      { q: "What does my reaction to my celebrity match reveal?", a: "Reactions are strongly shaped by how the match comparison makes you feel about yourself, not just by accuracy. The AI's result is emotionally neutral; the emotional charge comes from self-image filters." },
    ],
    relatedSlugs: ["your-own-face", "why-people-say-you-look-like-someone", "what-celebrity-match-reveals"],
  },
  {
    slug: "face-reading-pseudoscience",
    title: "Face Reading and Physiognomy: Why Your Personality Is Not in Your Face",
    excerpt: "Claims that facial features reveal personality, intelligence, or criminal tendency have a long history, and no scientific support. Here is why the claims persist and why they are wrong.",
    summary: "Face reading, or physiognomy, the idea that personality can be read from facial features, is a pseudoscience. It was popular from ancient Greece to the 19th century and was used to justify racism, and modern research finds no reliable link between face shape and character. AI tools that claim to read personality or criminality from faces repeat the same mistake.",
    date: "July 12, 2026",
    isoDate: "2026-07-12",
    readTime: "4 min read",
    category: "Science",
    author: "Wendy Wei",
    keywords: ["face reading", "physiognomy", "face reading personality", "pseudoscience", "Lombroso", "AI ethics"],
    sections: [
      {
        h2: "The History of Physiognomy",
        paragraphs: [
          "Physiognomy, the practice of reading character from facial features, dates to ancient Greece and was considered a serious discipline through the Renaissance and into the 19th century. Johann Kaspar Lavater's Physiognomische Fragmente (1775–1778) systematised the practice into a four-volume work. Francis Galton attempted statistical versions using composite photography. Cesare Lombroso applied it to criminology, claiming to identify criminal 'types' from facial characteristics.",
          "All of these approaches have been thoroughly discredited. Controlled studies find no reliable relationship between facial features and personality traits, intelligence, criminality, or moral character. The correlations occasionally found in studies using automated facial coding are explainable by confounds, age, health, emotional state, or the habitual expressions that modify facial appearance over time, not by any direct face-character relationship.",
        ],
      },
      {
        h2: "The Resurgence in AI Contexts",
        paragraphs: [
          "Claims of machine physiognomy, that AI can determine personality, criminality, or sexual orientation from facial images, have appeared in academic publications and commercial products. These claims face fundamental methodological problems: the claimed correlations are statistically fragile, confounded with demographic variables, and in several high-profile cases have been shown to reflect dataset biases rather than genuine face-character relationships.",
          "Distinguishing legitimate face recognition capability (identity comparison, which is well-validated) from illegitimate character inference capability (which is not) is critical for responsible AI development. The former is technically and ethically defensible; the latter is not.",
        ],
      },
    ],
    faqs: [
      { q: "Can AI really tell personality from facial features?", a: "No. Claims of AI personality inference from faces are not scientifically supported. Controlled studies find no reliable face-personality relationship, and claimed correlations reflect methodological problems or dataset biases." },
      { q: "What is the difference between face recognition and physiognomy?", a: "Face recognition computes identity similarity between face images, a validated capability. Physiognomy claims to infer character traits from facial features, a pseudoscientific claim without empirical support." },
    ],
    relatedSlugs: ["celebrity-doppelgangers-throughout-history", "bias-in-face-recognition", "history-of-face-recognition"],
  },
  {
    slug: "what-makes-a-face-memorable",
    title: "What Makes a Face Memorable? The Science of Facial Distinctiveness",
    excerpt: "Some faces stick in memory immediately; others fade after minutes. Research reveals that memorability is a consistent, measurable property of faces, here is what makes it happen.",
    summary: "What makes a face memorable is mostly the face itself: people agree strongly on which faces they remember. Distinctive faces, those far from average, are remembered best, while average faces are easily forgotten. The same distinctiveness sets a face apart in face recognition embedding space.",
    date: "July 8, 2026",
    isoDate: "2026-07-08",
    readTime: "4 min read",
    category: "Science",
    author: "Wendy Wei",
    keywords: ["what makes a face memorable", "memorable face", "facial distinctiveness", "face memory", "face perception", "face recognition"],
    sections: [
      {
        h2: "Memorability Is Consistent Across People",
        paragraphs: [
          "Face memorability, whether a particular face is remembered after brief exposure, is surprisingly consistent across different observers. Studies using large sets of face images find that inter-observer agreement on which faces are memorable and which are forgettable is high (r > 0.7), suggesting that memorability is a property of the face itself, not just the observer.",
          "This consistency implies that memorability reflects stable, objective characteristics of face images that all observers process similarly. It is not random and not primarily driven by personal association.",
        ],
      },
      {
        h2: "What Makes Faces Memorable",
        paragraphs: [
          "<strong>Distinctiveness</strong> is the strongest predictor of face memorability. Faces that deviate from the population average, in eye size, nose shape, overall proportions, or other dimensions, are more memorable because they violate the expected configuration more strongly. The unusual face leaves a stronger memory trace precisely because it requires more processing effort to accommodate.",
          "The averageness-memorability relationship is the inverse of the averageness-attractiveness relationship: average faces are more attractive but less memorable; distinctive faces are less conventionally attractive but more memorable. This trade-off reflects different evolutionary pressures on two separate cognitive functions.",
        ],
      },
      {
        h2: "Memorability and Face Matching",
        paragraphs: [
          "In terms of celebrity matching, memorable (distinctive) celebrities tend to appear in fewer people's results, they occupy peripheral regions of embedding space and only match faces with genuinely similar distinctive proportions. Forgettable (average) celebrities appear more frequently, as their central embedding position makes them close to more people.",
          "A match with a highly distinctive celebrity is typically a strong, visually obvious resemblance. A match with a more average-featured celebrity may reflect central embedding position as much as specific feature similarity.",
        ],
      },
    ],
    faqs: [
      { q: "Are distinctive faces more memorable?", a: "Yes. Faces that deviate from the population average are more memorable because they violate expected configurations more strongly, requiring more processing and leaving stronger memory traces." },
      { q: "Does having a distinctive face affect my celebrity match?", a: "Yes. Distinctive faces tend to match fewer celebrities but at stronger, more visually obvious resemblance. Average-featured faces match more celebrities at lower specific resemblance." },
    ],
    relatedSlugs: ["most-matched-celebrities", "celebrities-that-fool-ai", "face-attractiveness-research"],
  },
  {
    slug: "face-memory-psychology",
    title: "How Many Faces Can a Human Remember? About 5,000",
    excerpt: "Most people recognise about 5,000 faces, some over 10,000 (Jenkins et al., 2018). How the brain stores them, and how that compares with face recognition AI.",
    summary: "How many faces can we remember? About 5,000 for most people, according to a 2018 study by Jenkins and colleagues, with individuals ranging from about 1,000 to over 10,000. We build this store over a lifetime of meeting people and seeing celebrities. The brain indexes faces by their overall configuration, not as a list of features.",
    date: "July 2, 2026",
    isoDate: "2026-07-02",
    readTime: "4 min read",
    category: "Psychology",
    author: "Wendy Wei",
    keywords: ["how many faces can we remember", "face memory", "how many faces can you recognize", "face recognition", "memory", "psychology"],
    sections: [
      {
        h2: "How Many Faces Do We Know?",
        paragraphs: [
          "A 2018 study by Jenkins et al. estimated that the average person can recognise approximately 5,000 faces, a number that surprised many researchers. The study measured this by showing participants large numbers of celebrity and personal contact faces and counting distinct identities they could recognise. Individual variation was large, with ranges spanning from around 1,000 to over 10,000.",
          "This database is built over a lifetime of social exposure. Face memories are more durable than most other types of memory, people often recognise classmates they have not seen in 30+ years from a single photo. The face memory system is specifically optimised for long-duration storage and rapid retrieval.",
        ],
      },
      {
        h2: "How the Brain Indexes Faces",
        paragraphs: [
          "The brain's face memory system stores face representations in a way that differs from other object memories. Faces are stored as multi-dimensional representations in distributed memory structures, with connections to associated information (name, context, personal relationship). The same face can be recognised from a single feature (distinctive nose) or from the holistic gestalt without any individual feature being diagnostic.",
          "The multi-dimensional storage is conceptually similar to embedding space: each stored face is a point in a representational space where proximity reflects similarity. Recognition occurs when a new perceptual experience activates the stored representation most strongly, the brain is performing something analogous to nearest-neighbour search, just implemented in biological neural tissue.",
        ],
      },
    ],
    faqs: [
      { q: "How many faces can a person remember?", a: "Approximately 5,000 on average, with individual variation from around 1,000 to over 10,000. Face memory is specifically durable, supporting recognition of people not seen in decades." },
    ],
    relatedSlugs: ["brain-recognises-face", "how-face-recognition-works", "what-is-facial-embedding"],
  },
  {
    slug: "weight-change-and-matching",
    title: "Does Weight Change Affect Your Celebrity Face Match?",
    excerpt: "Significant weight change alters facial volume and soft tissue distribution. Here is how much this affects face recognition, and whether your match changes after losing or gaining weight.",
    summary: "Does losing weight change face shape? Somewhat: weight change mostly alters the cheeks, jawline and area around the eyes, while your bone structure stays the same. Moderate weight change usually leaves facial recognition results and your celebrity match much the same; large changes can shift them. Weight loss tends to make bone structure more visible.",
    date: "June 26, 2026",
    isoDate: "2026-06-26",
    readTime: "3 min read",
    category: "Guide",
    author: "Wendy Wei",
    keywords: ["does losing weight change face shape", "weight loss facial recognition", "weight change", "face shape", "celebrity match", "bone structure"],
    sections: [
      {
        h2: "How Weight Changes the Face",
        paragraphs: [
          "Weight changes redistribute facial fat, primarily affecting the cheeks, jawline definition, and the thickness of soft tissue structures around the eyes and midface. At high body weights, fuller cheeks can appear to reduce inter-cheekbone distance and reduce the apparent definition of bony facial features. At lower body weights, bony structure becomes more prominent and facial geometry more closely matches the bony skeleton.",
          "The bony skeleton, the basis for the most stable components of a facial embedding, does not change with weight. But the soft tissue overlay can change substantially, altering the apparent geometry of features and shifting the facial embedding toward or away from different regions of face space.",
        ],
      },
      {
        h2: "Practical Effect on Matching",
        paragraphs: [
          "For modest weight changes, the effect on celebrity matching is usually small. The embedding is robust to typical soft tissue variation because the network has been trained on faces across a wide range of healthy body weights. For large weight changes (30+ kg / 65+ lbs), the soft tissue changes become large enough to noticeably shift the embedding.",
          "People who have lost significant weight often report that their celebrity matches change, typically toward celebrities with more defined bony features. This reflects a genuine shift in facial geometry rather than a recognition error.",
        ],
      },
    ],
    faqs: [
      { q: "Will my celebrity match change if I lose or gain significant weight?", a: "Possibly. Small weight changes have minimal effect. Large weight changes alter soft tissue geometry enough to shift the facial embedding, potentially changing top matches." },
    ],
    relatedSlugs: ["what-is-facial-embedding", "aging-face-recognition", "best-photo-celebrity-match"],
  },
  {
    slug: "hair-color-affects-matching",
    title: "Does Hair Colour Affect Your Face Match? The Surprising Answer",
    excerpt: "Hair colour is not encoded in the facial embedding. Here is why, and in what circumstances hairstyle choices can still affect your result.",
    summary: "Changing your hair colour has almost no effect on your face match, because face recognition crops tightly to the face and mostly leaves the hair out. Hair only matters when it covers the forehead, eyebrows or cheeks. It can change how you look to people, though, which is why a match may feel different after dyeing.",
    date: "June 25, 2026",
    isoDate: "2026-06-25",
    readTime: "3 min read",
    category: "Guide",
    author: "Wendy Wei",
    keywords: ["does hair color change your face", "hair colour face recognition", "hair color", "celebrity match", "face crop", "face recognition"],
    sections: [
      {
        h2: "Why Hair Colour Doesn't Affect Your Embedding",
        paragraphs: [
          "The face recognition pipeline crops to the face region, cheeks, forehead, chin, largely excluding the hair. The facial embedding encodes the geometry of this cropped region: feature positions and their spatial relationships. Hair colour is not a geometric property of the face; it is a surface colour property of the region the crop deliberately excludes.",
          "This means changing your hair colour has essentially no effect on your celebrity match results. The same is true for hair highlights, dye treatments, and other colour changes. Even very striking colour changes (going from black to blonde) will not meaningfully shift your facial embedding.",
        ],
      },
      {
        h2: "When Hair Can Affect Results",
        paragraphs: [
          "Hair does affect results in two specific cases: when it falls across the face (obscuring the crop region), and when a hairstyle creates strong visual asymmetry that affects the alignment pipeline. Long bangs covering the forehead, hair swept dramatically to one side, or very voluminous styles that push the face off-centre in the frame can all affect the face detection and alignment pipeline, potentially degrading embedding quality.",
          "The solution is to pull hair back for a matching photo, or ensure that the face crop region is fully visible and approximately centred in the frame. The hair itself can be any colour or style, what matters is that it does not encroach on the face region.",
        ],
      },
    ],
    faqs: [
      { q: "Does changing my hair colour affect my celebrity face match?", a: "No. Hair colour is not encoded in the facial embedding. The face crop excludes most hair, so colour changes have essentially no effect on matching results." },
      { q: "Can long hair covering my face affect my match?", a: "Yes. Hair that falls across the face region can degrade face alignment and embedding quality. Pull hair back for best results." },
    ],
    relatedSlugs: ["glasses-hats-hair", "best-photo-celebrity-match", "what-is-facial-embedding"],
  },
  {
    slug: "beard-affects-matching",
    title: "Does Having a Beard Change Your Celebrity Face Match?",
    excerpt: "A beard covers the lower face, a region that carries real identity information. Here is exactly how much facial hair affects face recognition accuracy and what you can do about it.",
    summary: "A beard can affect face recognition and Face ID because it hides the jawline and chin, which the network uses for identity. Light stubble changes little, while a full beard can shift your celebrity match. Try a photo with and without the beard to see the difference.",
    date: "June 24, 2026",
    isoDate: "2026-06-24",
    readTime: "3 min read",
    category: "Guide",
    author: "Wendy Wei",
    keywords: ["does beard affect face id", "beard facial recognition", "beard", "facial hair", "celebrity match", "face recognition"],
    sections: [
      {
        h2: "What a Beard Covers",
        paragraphs: [
          "A full beard or heavy stubble covers the chin, jaw line, and sometimes extends to the cheeks, regions that contribute meaningfully to the facial embedding. Jaw shape and chin prominence are stable bony features that the network has learned to use for identity. A dense beard effectively removes these features from the information available for embedding extraction.",
          "Unlike hair colour (which is excluded from the crop) or glasses (which affect the most-weighted eye region), beard coverage falls in a middle category. It is a meaningful occlusion but not as severe as the impact of glasses on the eye region.",
        ],
      },
      {
        h2: "The Practical Effect",
        paragraphs: [
          "For light stubble (1–3 days), the effect on matching is minimal. The sparse coverage changes texture more than geometry, and the network handles this variation well. For heavy stubble and short beards (3–10mm), there is a small but measurable shift in embedding quality. For full dense beards, the effect becomes larger, particularly if the beard is styled in a way that substantially alters apparent jaw width or chin shape.",
          "If you have a beard and are curious how it affects your results, try matching both a bearded and a clean-shaven photo (or a recent photo from before growing the beard). Systematic differences in the top match reveal the extent to which the beard is masking jaw and chin geometry.",
        ],
      },
    ],
    faqs: [
      { q: "Does a beard affect celebrity face matching accuracy?", a: "Yes, moderately. Light stubble has minimal effect. A full dense beard can shift the embedding by masking jaw and chin geometry, which are identity-relevant features." },
      { q: "Should I shave for the best celebrity match?", a: "If you want the most geometrically accurate result, a clean-shaven photo is better. But the match with a beard still reflects genuine similarity, it just reflects your bearded appearance." },
    ],
    relatedSlugs: ["glasses-hats-hair", "best-photo-celebrity-match", "face-detection-vs-recognition"],
  },
  {
    slug: "ollie-how-it-works",
    title: "How Ollie's Celebrity Lookalike AI Works: A Technical Overview",
    excerpt: "From upload to results, here is the complete technical picture of what Ollie does to your photo, every pipeline step explained in plain English.",
    summary: "Ollie is a celebrity lookalike AI that works in four steps: detect your face and five key points, align it to 112 by 112 pixels, turn it into a 512-number embedding with a neural network trained from scratch, and compare it with thousands of verified celebrity photos. The closest celebrities become your top five matches. Your photo is processed in memory and never stored.",
    date: "June 22, 2026",
    updatedIsoDate: "2026-09-26",
    isoDate: "2026-06-22",
    readTime: "6 min read",
    category: "Technology",
    author: "Liam Bradley",
    keywords: ["celebrity lookalike AI", "how does celebrity lookalike app work", "face recognition", "face embedding", "neural network", "Ollie", "ai celebrity look alike", "celebrity lookalike app", "celebrity look alike finder"],
    sections: [
      {
        h2: "The Full Pipeline",
        paragraphs: [
          "Ollie processes your photo through a short sequence of steps. Each has one job, and together they produce your celebrity matches. Knowing the pipeline explains both why results are usually sensible and where they can go wrong.",
          "The four stages are: <strong>1.</strong> Face detection, finding your face and five key points on it. <strong>2.</strong> Face alignment, straightening and cropping the face to a standard size. <strong>3.</strong> Embedding extraction, turning the face into a 512-number facial fingerprint. <strong>4.</strong> Comparison, measuring the distance from your fingerprint to every celebrity photo and ranking the closest celebrities.",
        ],
      },
      {
        h2: "Detection and Alignment (Steps 1–2)",
        paragraphs: [
          "Detection uses <strong>InsightFace</strong> to find every face in your image. Ollie keeps the largest one and locates five landmarks on it: both eye centres, the nose tip and both mouth corners. Those five points define a transformation that maps the face onto a standard 112 × 112 pixel crop, with the eyes level and in fixed positions.",
          "This alignment step is critical. The recognition network was trained on crops aligned exactly this way, so a badly aligned face, from a strong angle or a face half out of frame, gives a less reliable fingerprint.",
        ],
      },
      {
        h2: "The Neural Network (Step 3)",
        paragraphs: [
          "The aligned crop goes through Ollie's own 20-layer convolutional network, built in the SphereFace style with residual connections. Its last layer outputs 512 numbers, which are normalised to unit length. That vector is your facial fingerprint, in exactly the same format as every celebrity fingerprint in the database.",
          "The network was written and trained from scratch in PyTorch, with no pretrained weights. It learned from MS1MV2, about 5.8 million photos of 85,742 people, using the CosFace loss, over about 10 days on a single NVIDIA RTX 4060 Ti. It scores 98.5% on the LFW benchmark, whose people were all removed from the training data first.",
        ],
      },
      {
        h2: "Comparison and Ranking (Step 4)",
        paragraphs: [
          "Every celebrity photo in the database was run through the same network ahead of time. Your fingerprint is compared with all of them at once, a single matrix calculation that takes milliseconds, and each celebrity is scored by their single closest photo.",
          "The distances are rescaled into percentages that are easier to read, and the five closest celebrities come back to you, each with the photo that matched you best. The match score comes from the network alone; there are no hand-made adjustments for skin tone or other features. By default the results are limited to celebrities of the gender InsightFace estimates from your face, using each celebrity's gender as recorded on Wikidata; you can pick men or women yourself, and narrow the list to actors, singers or footballers.",
        ],
      },
    ],
    faqs: [
      { q: "Is Ollie a celebrity lookalike app?", a: "Ollie is a celebrity lookalike AI that runs in your browser, so there is nothing to install. It works on phones and computers, and uses its own face-recognition model trained from scratch by the Ollie team." },
      { q: "How many steps does Ollie's face matching pipeline have?", a: "Four: face detection, face alignment, embedding extraction, and comparison against every celebrity photo." },
      { q: "What neural network does Ollie use?", a: "A 20-layer SphereFace-style convolutional network trained from scratch on MS1MV2 with the CosFace loss. Its fingerprints have 512 numbers and it scores 98.5% on LFW." },
      { q: "How does Ollie search the celebrity database so fast?", a: "Celebrity fingerprints are computed ahead of time, so a search only runs your photo through the network once and then compares one fingerprint with the stored ones, which takes milliseconds." },
    ],
    relatedSlugs: ["how-face-recognition-works", "siamese-neural-networks-explained", "what-is-facial-embedding"],
  },
  {
    slug: "improving-ollie-results",
    title: "Six Ways to Get Better Celebrity Match Results From Ollie",
    excerpt: "A few simple changes to how you take and select photos can dramatically improve your Ollie results. Here are the six highest-impact improvements you can make.",
    summary: "For the most accurate celebrity lookalike results: use the rear camera, find soft even light, take off glasses, keep a neutral expression, upload the original photo rather than a screenshot, and try more than one photo. The rear camera makes the biggest difference because selfie lenses distort your proportions. Matches that repeat across photos are the most reliable.",
    date: "June 21, 2026",
    isoDate: "2026-06-21",
    readTime: "4 min read",
    category: "Guide",
    author: "Wendy Wei",
    keywords: ["most accurate celebrity lookalike", "celebrity lookalike accurate", "best celebrity lookalike app", "photo tips", "celebrity match", "face recognition"],
    sections: [
      {
        h2: "1. Switch to the Rear Camera",
        paragraphs: [
          "The single highest-impact change most users can make is switching from the front (selfie) camera to the rear camera. Front cameras use wide-angle lenses at close range, systematically distorting facial proportions. Rear cameras at arm's length or further produce undistorted geometry. This change alone can shift your top match to a more intuitively correct result.",
        ],
      },
      {
        h2: "2. Find Better Light",
        paragraphs: [
          "Sit facing a large window or step outdoors on an overcast day. Even, diffuse light from the front illuminates both sides of your face equally, preventing shadow-induced geometric distortions. Five minutes outdoors near a window is the second-highest-impact change for most users.",
        ],
      },
      {
        h2: "3. Remove Glasses",
        paragraphs: [
          "If you wear glasses, remove them for one matching photo. Glasses occlude the eye region, the most identity-weighted part of the face, and add reflective artefacts. Even thin-rimmed glasses can reduce embedding quality. Try both with and without to compare results.",
        ],
      },
      {
        h2: "4. Use a Neutral Expression",
        paragraphs: [
          "Relax your face to a neutral or mildly positive expression. Avoid wide smiles (which partially close the eyes and reshape the midface) and forced neutral expressions (which create unusual muscle tension). Natural resting face produces the most stable embedding.",
        ],
      },
      {
        h2: "5. Use an Original File",
        paragraphs: [
          "Upload the original camera file, not a screenshot, a social media download, or a heavily edited export. Original files have maximum resolution and minimal compression artefacts. Social media platforms compress images significantly on upload and download, degrading face recognition quality.",
        ],
      },
      {
        h2: "6. Try Multiple Photos",
        paragraphs: [
          "Upload 2–3 photos taken on different occasions under good conditions. Consistent top matches across multiple photos indicate genuine geometric similarity. Shifting matches indicate photo condition variation. The celebrity that appears most consistently across multiple good-quality photos is your most reliable match.",
        ],
      },
    ],
    faqs: [
      { q: "What is the single biggest improvement I can make for Ollie results?", a: "Switching from the front (selfie) camera to the rear camera and taking the photo from arm's length or further. This eliminates wide-angle lens distortion of facial proportions." },
      { q: "How many photos should I upload for best results?", a: "Try 2–3 photos under different good conditions. Consistent matches across photos are more reliable than any single result." },
    ],
    relatedSlugs: ["best-photo-celebrity-match", "best-lighting-for-match", "glasses-hats-hair"],
  },
  {
    slug: "understanding-your-results",
    title: "Understanding Your Ollie Results: What the Scores and Rankings Mean",
    excerpt: "A guide to interpreting everything on your Ollie results page, what the percentages mean, why the ranking matters more than the score, and how to read the top five.",
    summary: "Your celebrity lookalike percentage on Ollie is a rescaled similarity score: higher means your facial proportions are closer to that celebrity's. It is for ranking, not a probability, so the order of your top five matters more than the exact number. Scores of 90% and above usually mean a resemblance people can see.",
    date: "June 20, 2026",
    updatedIsoDate: "2026-09-26",
    isoDate: "2026-06-20",
    readTime: "4 min read",
    category: "Guide",
    author: "Wendy Wei",
    keywords: ["celebrity lookalike percentage", "face match percentage", "similarity score", "celebrity match", "celebrity lookalike results", "face recognition", "celebrity lookalike test", "celebrity look alike results"],
    sections: [
      {
        h2: "The Percentage Score",
        paragraphs: [
          "The percentage similarity score on each result is the distance between your facial embedding and the celebrity's in 512-dimensional space, rescaled so it is easier to read. A score of 90%+ indicates very strong geometric similarity, the kind most people would notice on direct visual comparison. Scores of 70–89% indicate meaningful similarity in specific geometric dimensions. Below 70%, matches are present but may not be visually obvious.",
          "The percentage is not a probability. It does not mean there is a 90% chance you are the same person as the celebrity. It means the celebrity's fingerprint is very close to yours compared with the rest of the database. Treat the ranges above as a loose rule of thumb, not measured thresholds.",
        ],
      },
      {
        h2: "Why Ranking Matters More Than Score",
        paragraphs: [
          "Absolute scores vary between photos of the same person due to photo conditions. A photo taken under ideal conditions produces higher absolute scores across the board than a photo taken under poor conditions. This means you cannot directly compare absolute scores from two different photo sessions.",
          "What remains stable is the <strong>ranking</strong>: which celebrity is #1 vs #2 vs #3. If the same celebrity appears at #1 consistently across multiple photos, that is a strong and reliable signal of genuine geometric similarity. Focus on the ranking when interpreting results across different photo sessions.",
        ],
      },
      {
        h2: "Reading the Top Five",
        paragraphs: [
          "The top five results give more information than just the #1 match. Look for shared features across multiple top-five results: if several celebrities all have a similar jaw shape, strong cheekbones, or similar eye spacing, those shared features are likely driving your embedding's position in face space, and are characteristic of your face.",
          "If your top five results look very diverse with no obvious common thread, you are likely in a central region of face space where multiple celebrity clusters are approximately equidistant. Your face does not strongly resemble any one archetype; it is structurally average across many dimensions.",
        ],
      },
    ],
    faqs: [
      { q: "Is a celebrity lookalike test accurate?", a: "It measures real facial proportions, but there is no single right answer to who you look like. Treat the percentage as a way to compare your five matches with each other, not as a verdict, and try a few photos to see which names repeat." },
      { q: "What does the percentage score mean on Ollie results?", a: "A rescaled similarity score based on embedding distance, useful for ranking. Above 90% is very strong resemblance; 70–89% is meaningful similarity; below 70% the match is present but may not be visually obvious." },
      { q: "Should I focus on the #1 result or look at all five?", a: "Both. Your #1 is the closest geometric match, but looking across the top five for shared features is more informative about what specifically characterises your face's position in embedding space." },
    ],
    relatedSlugs: ["what-is-similarity-score", "confidence-vs-accuracy", "what-celebrity-match-reveals"],
  },
  {
    slug: "vggface2-explained",
    title: "VGGFace2 Explained: 3.3 Million Faces of 9,131 People",
    excerpt: "VGGFace2 is Oxford's face recognition dataset: 3.31 million photos of 9,131 people. What is in it, how it was built, and how it compares with MS1MV2.",
    summary: "VGGFace2 is a face recognition dataset from Oxford's Visual Geometry Group, released in 2018, with 3.31 million images of 9,131 people, about 362 per person. It was built for variety in pose, age, lighting and ethnicity. Ollie's model was not trained on VGGFace2; it was trained on MS1MV2.",
    date: "June 18, 2026",
    updatedIsoDate: "2026-09-23",
    isoDate: "2026-06-18",
    readTime: "4 min read",
    category: "Machine Learning",
    author: "Liam Bradley",
    keywords: ["VGGFace2", "VGGFace2 dataset", "face recognition dataset", "Visual Geometry Group", "deep learning", "face recognition"],
    sections: [
      {
        h2: "What Is VGGFace2?",
        paragraphs: [
          "<strong>VGGFace2</strong> is a large-scale face recognition dataset developed by the Visual Geometry Group at the University of Oxford, released in 2018. It contains 3.31 million images of 9,131 subjects (celebrities and public figures), with an average of 362.6 images per subject. Subjects were selected to span a wide range of ages, ethnicities, and professions.",
          "What distinguishes VGGFace2 from earlier datasets is its emphasis on variation. Each subject is represented across wide variation in pose (0°–65° yaw), age (across decades for many subjects), ethnicity, and image quality conditions. This variation is what makes models trained on it robust to real-world photo conditions.",
        ],
      },
      {
        h2: "How It Compares to Earlier Datasets",
        paragraphs: [
          "The original VGGFace dataset (2015) contained 2.6 million images of 2,622 subjects, impressive at the time but limited in identity diversity. The MS-Celeb dataset (2016) contained 10 million images but had widely reported label noise and demographic imbalance. VGGFace2 addressed these issues with more careful collection methodology and deliberate demographic balancing.",
          "LFW (Labeled Faces in the Wild), the classic benchmark, contains only 13,000 images of 5,749 subjects, far too small for training but useful for evaluation. VGGFace2 occupies the training-focused end of the data spectrum: large enough to train powerful representations, diverse enough to generalise broadly.",
        ],
      },
    ],
    faqs: [
      { q: "What is VGGFace2?", a: "VGGFace2 is a large-scale face recognition dataset containing 3.31 million images of 9,131 subjects, developed by Oxford's Visual Geometry Group. It emphasises variation in pose, age, and ethnicity for robust model training." },
      { q: "Was Ollie trained on VGGFace2?", a: "No. Ollie's network was trained from scratch on MS1MV2, about 5.8 million photos of 85,742 people. VGGFace2 is covered here because it shaped how modern face datasets are built." },
    ],
    relatedSlugs: ["training-data-matters", "siamese-neural-networks-explained", "how-face-recognition-works"],
  },
  {
    slug: "resnet-face-recognition",
    title: "Why ResNet Is the Backbone of Most Modern Face Recognition Systems",
    excerpt: "ResNet solved the vanishing gradient problem in deep neural networks, making 50–100+ layer networks trainable. Here is why it became the standard backbone for face recognition.",
    summary: "ResNet is the backbone of most modern face recognition because its residual (skip) connections solved the vanishing gradient problem, making very deep networks trainable. Each block learns a small correction that is added to its input, so the training signal flows through dozens or hundreds of layers. Ollie's own 20-layer network uses the same residual idea.",
    date: "June 16, 2026",
    isoDate: "2026-06-16",
    readTime: "4 min read",
    category: "Machine Learning",
    author: "Liam Bradley",
    keywords: ["ResNet face recognition", "ResNet", "residual connections", "vanishing gradient", "deep learning", "face recognition"],
    sections: [
      {
        h2: "The Vanishing Gradient Problem",
        paragraphs: [
          "Training deep neural networks (networks with many layers) using gradient descent was extremely difficult before 2015. Gradients, the signals used to update network parameters, shrink as they propagate backward through many layers, becoming negligibly small by the time they reach the early layers. This <strong>vanishing gradient problem</strong> prevented deep networks from learning effectively: early layers received almost no training signal.",
          "The consequence was a ceiling on useful depth. In the early 2010s, most powerful networks had 5–10 layers. Deeper networks trained worse than shallower ones, despite theoretically having more capacity.",
        ],
      },
      {
        h2: "Residual Connections: The Solution",
        paragraphs: [
          "He et al. (2015) solved the vanishing gradient problem with <strong>residual connections</strong>, skip connections that allow gradient to flow directly from later layers to earlier ones without passing through all intermediate layers. A residual block adds its input to its output: output = f(x) + x. This identity shortcut ensures that even if the learned function f(x) has vanishing gradients, the identity path carries gradient directly through.",
          "The result was dramatic: ResNet-152 (152 layers) trained successfully and outperformed much shallower networks. ResNet won the ImageNet competition in 2015 by a substantial margin. More relevantly for face recognition, it unlocked the training of much deeper face recognition networks, and depth correlates directly with representational richness.",
        ],
      },
    ],
    faqs: [
      { q: "What is ResNet?", a: "ResNet (Residual Network) is a deep learning architecture introduced by He et al. in 2015 that uses skip connections to solve the vanishing gradient problem, enabling training of 50–150+ layer networks." },
      { q: "Why do face recognition systems use ResNet?", a: "ResNet's depth enables rich, discriminative face representations. Its skip connections make it trainable even at 50+ layers. ResNet-50 and ResNet-100 are standard backbones for production face recognition systems." },
    ],
    relatedSlugs: ["how-cnns-see-faces", "siamese-neural-networks-explained", "training-data-matters"],
  },
  {
    slug: "arcface-explained",
    title: "ArcFace: The Loss Function That Makes Modern Face Recognition So Accurate",
    excerpt: "ArcFace replaced contrastive and triplet loss in most production face recognition systems. Here is what angular margin loss is and why it produces better-structured embedding spaces.",
    summary: "ArcFace is a loss function that trains face recognition by adding an angular margin between each face and the wrong identities, which forces tighter, better-separated clusters. It trains like a simple classifier, so it avoids the pair mining that contrastive and triplet loss need. Ollie's model uses CosFace, a close relative that applies the margin to the cosine instead.",
    date: "June 15, 2026",
    isoDate: "2026-06-15",
    readTime: "4 min read",
    category: "Machine Learning",
    author: "Liam Bradley",
    keywords: ["ArcFace", "ArcFace loss", "angular margin loss", "CosFace", "face recognition", "loss function"],
    sections: [
      {
        h2: "From Contrastive to Angular Margin Loss",
        paragraphs: [
          "Contrastive and triplet loss were the dominant training objectives for face recognition through 2017. Both work on pairs or triplets, requiring careful hard negative mining and batch construction. They are effective but require significant engineering effort and can be unstable.",
          "<strong>ArcFace</strong> (Deng et al., 2019) introduced a simpler and more powerful approach: angular margin softmax. Rather than training on pairs, ArcFace adds a fixed angular margin m to the angle between a face embedding and its correct class centre in the embedding space. This forces the network to push same-class embeddings to be not just closer to their class centre than to other class centres, but distinctly closer by a defined angular amount.",
        ],
      },
      {
        h2: "Why Angular Margin Works So Well",
        paragraphs: [
          "The angular margin in ArcFace produces more uniformly distributed class centres in the embedding space and cleaner decision boundaries between classes. Unlike triplet loss, which only requires pairwise ordering, ArcFace enforces absolute angular separation, producing tighter clusters and larger inter-class gaps.",
          "The practical effect is that ArcFace-trained models produce embeddings that separate cleanly at lower similarity thresholds, making face verification more reliable at intermediate confidence levels. ArcFace achieves 99.83% accuracy on LFW,essentially saturating that benchmark. It has become the standard loss function for production-grade face recognition systems worldwide.",
        ],
      },
    ],
    faqs: [
      { q: "What is ArcFace?", a: "ArcFace is a face recognition training objective that adds an angular margin to the standard softmax classification loss, producing tighter identity clusters and larger inter-class gaps in the embedding space." },
      { q: "Why does ArcFace outperform contrastive loss?", a: "ArcFace enforces absolute angular separation between classes rather than relative ordering, producing more uniform and discriminative embedding space structure. It is also simpler to train as it operates on individual examples, not pairs." },
    ],
    relatedSlugs: ["contrastive-loss-explained", "training-data-matters", "what-is-facial-embedding"],
  },
  {
    slug: "face-recognition-benchmark",
    title: "Face Recognition Benchmarks Explained: LFW, IJB-C, and Beyond",
    excerpt: "How do researchers measure whether a face recognition system is good? Here is a guide to the major benchmarks, what they test, and their limitations.",
    summary: "Face recognition benchmarks measure how accurately models match faces. LFW (Labeled Faces in the Wild, 2007) has 13,233 images of 5,749 people; top models now score above 99.8%, so harder IARPA Janus benchmarks such as IJB-C are used today. Ollie's model scores 98.5% on LFW.",
    date: "June 14, 2026",
    isoDate: "2026-06-14",
    readTime: "4 min read",
    category: "Machine Learning",
    author: "Liam Bradley",
    keywords: ["face recognition benchmark", "LFW benchmark", "Labeled Faces in the Wild", "IJB-C", "face verification", "accuracy"],
    sections: [
      {
        h2: "LFW: The Classic Standard",
        paragraphs: [
          "<strong>Labeled Faces in the Wild (LFW)</strong> was introduced in 2007 and became the standard benchmark for a decade. It contains 13,233 face images of 5,749 people sourced from the internet, paired for verification testing (same person / different person). On this benchmark, human-level performance was approximately 97.5%. Modern deep learning systems achieve 99.8%+,essentially solving the benchmark.",
          "LFW's limitations are widely acknowledged: it has relatively well-lit, roughly frontal photos; it is skewed toward white Western males; and it is too easy for current systems. Its scores no longer differentiate between high-performing methods.",
        ],
      },
      {
        h2: "IARPA Janus: Harder Benchmarks",
        paragraphs: [
          "IARPA's Janus benchmarks (IJB-A, IJB-B, IJB-C) were designed to be substantially harder than LFW. IJB-C contains 11,779 subjects including both still images and video frames, with deliberate inclusion of difficult pose, illumination, and expression conditions. NIST's FRVT (Face Recognition Vendor Test) is the most comprehensive independent evaluation, testing commercial and research systems on very large datasets including millions of photos.",
          "Performance on IJB-C at the standard verification threshold (False Match Rate = 0.01%) benchmarks typically around 95–97% for top systems, significantly harder than LFW. NIST FRVT remains the gold standard for evaluating real-world face recognition system performance.",
        ],
      },
    ],
    faqs: [
      { q: "What is LFW in face recognition?", a: "Labeled Faces in the Wild, a benchmark dataset of 13,000+ face pairs used to evaluate verification accuracy. It was the standard benchmark for a decade but is now largely solved by modern systems." },
      { q: "What benchmark do serious face recognition systems use today?", a: "NIST FRVT (Face Recognition Vendor Test) and IARPA Janus benchmarks (IJB-C) are the most rigorous current evaluations. They include harder conditions than LFW and test demographic performance differences." },
    ],
    relatedSlugs: ["why-ai-beats-human-eye", "vggface2-explained", "training-data-matters"],
  },
  {
    slug: "celebrity-database-how-built",
    title: "How Ollie's Celebrity Database Was Built",
    excerpt: "Behind every match is a database of thousands of celebrities, each with verified, freely licensed photos. Here is how the list was chosen and how every photo was checked.",
    summary: "Ollie's celebrity face database was built from Wikidata and Wikimedia Commons: living adults famous across many languages, ranked by recent Wikipedia views, with only freely licensed photos. Every photo is checked with face recognition to confirm it shows the right person, and fakes, memes, sunglasses and duplicates are removed. Each celebrity keeps 2 to 12 verified photos.",
    date: "June 9, 2026",
    updatedIsoDate: "2026-09-23",
    isoDate: "2026-06-09",
    readTime: "4 min read",
    category: "Technology",
    author: "Liam Bradley",
    keywords: ["celebrity face database", "celebrity face dataset", "Wikimedia Commons", "Wikidata", "face recognition", "celebrity lookalike"],
    sections: [
      {
        h2: "Choosing the Celebrities",
        paragraphs: [
          "The list starts from Wikidata: every living person covered by at least ten language editions of Wikipedia. Each is ranked by how many people read their English Wikipedia article over the previous six months, with a boost for being covered in many languages, so the list reflects who is famous now. Because English Wikipedia under-counts stars from other regions, a second list ranks people from East and South Asia, Southeast Asia, Latin America, Africa and the Middle East by views on their own languages' Wikipedias, about half of them women.",
          "Only adults are included, and a known birth date is required, so nobody under 18 slips in. People known mainly for adult entertainment or for serious crimes are left out.",
        ],
      },
      {
        h2: "Only Freely Licensed Photos",
        paragraphs: [
          "Every photo comes from <strong>Wikimedia Commons</strong> and must carry a free license that allows reuse with credit: public domain, CC0, CC BY, CC BY-SA and a few similar licenses. Photos under non-commercial or no-derivatives licenses are never used, and files flagged for deletion are skipped.",
          "For each photo Ollie keeps the photographer's name, the license and a link to the original, and shows that credit under the photo in your results.",
        ],
      },
      {
        h2: "Checking Every Photo",
        paragraphs: [
          "Candidates come from the person's own Wikidata photo, photos tagged as depicting them, their Commons category, and name searches. Each one is checked automatically before it is kept: one clear, large face; not a group shot; facing the camera; sharp; in colour, so no black-and-white or sepia prints; no sunglasses; an adult face; and a real photograph rather than a statue, wax figure, drawing, poster or meme, checked with both the file's title and an image model.",
          "Identity is checked too. A face-recognition model compares every candidate with the person's own Wikidata photo and with their other photos, and keeps only clear matches. If the reference photos disagree about who the person is, the person is skipped rather than guessed. Near-duplicates and too many photos from the same event are dropped.",
        ],
      },
      {
        h2: "Building the Index",
        paragraphs: [
          "Each celebrity ends up with 2 to 12 verified photos. Every photo is run through Ollie's network once, and the resulting fingerprints are stored side by side, one per photo rather than one averaged fingerprint per person, so a search can show you the exact photo that matched you best.",
          "When you search, your fingerprint is compared with every stored one, and each celebrity is scored by their closest photo.",
        ],
      },
    ],
    faqs: [
      { q: "How many celebrities are in Ollie's database?", a: "Thousands of the most-viewed living celebrities on Wikipedia, each with 2 to 12 verified photos." },
      { q: "Where do the celebrity photos come from?", a: "From Wikimedia Commons, under free licenses such as public domain, CC0, CC BY and CC BY-SA. Every result credits its photographer and links to the original." },
      { q: "How do you make sure every photo shows the right person?", a: "A face-recognition model compares each photo with the person's own Wikidata photo and their other photos, and keeps only clear matches. If the references disagree, the person is skipped." },
    ],
    relatedSlugs: ["vggface2-explained", "how-face-recognition-works", "what-is-facial-embedding"],
  },
]
