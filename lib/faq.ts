import { INDEX, MODEL, SEARCH_LOG_DAYS } from "@/lib/facts"
import { GUEST_LIMIT } from "@/lib/search-quota"

// Shared by /faq (all of it) and /celebrity-lookalike (the steps and a few questions, so the page people land on still explains itself)
export const STEPS = [
  [
    "Ollie finds your face.",
    "InsightFace, an open-source face detector, finds the largest face in your photo and lines it up so the eyes and mouth sit in the same place every time.",
  ],
  [
    "The model turns it into numbers.",
    "Ollie's own machine learning (ML) model, a neural network, reads the aligned face and outputs 512 numbers that describe its structure. Photos of the same person land close together, and different people land further apart.",
  ],
  [
    "Celebrities are ranked by closeness.",
    `Those numbers are compared with ${INDEX.photos} photos of ${INDEX.celebrities} celebrities (${INDEX.photosPerPerson} photos each). Each celebrity is scored by their single closest photo, and you see the top five with the photo that matched.`,
  ],
]

export const FAQ: [string, string][] = [
  [
    "How accurate is Ollie?",
    `Ollie's face-recognition model scores ${MODEL.lfw} on Labeled Faces in the Wild (LFW), a standard test that asks whether two photos show the same person, and none of the people in LFW were in its training data. Lookalike matching has no right answer, so there's no accuracy figure for it. Your top match is the celebrity whose face the model places closest to yours, and the percentage is only meant for comparing your five results with each other.`,
  ],
  [
    "Is Ollie free?",
    `Yes. You get ${GUEST_LIMIT} free searches a day without an account. After that, sign in with email or Google to keep searching; accounts are free too. There are no ads and nothing to buy. The limits exist because every search runs a neural network on a paid server.`,
  ],
  [
    "Do you keep my photo?",
    `No. Your photo is held in memory on the matching server only while your search runs, then discarded. It is never saved, logged, shown to anyone, or used to train the model, and neither are the numbers made from your face or your results. Ollie keeps a small record of each search (the time, your account or an IP-based ID, and your IP address) to enforce the free-search limit, and deletes it after ${SEARCH_LOG_DAYS} days.`,
  ],
  [
    "Why do I get different results with different photos?",
    "Because Ollie reads the photo, not you. Lighting, head angle, expression, glasses, distance from the camera and image quality all change how your face looks in pixels, which changes the numbers the model produces. Celebrities near the top often swap places between photos. For the most reliable result, use a sharp, front-facing photo in soft light, and try two or three photos to see who keeps showing up.",
  ],
  [
    "Does it work for women?",
    "Yes. The celebrity index includes women and men, and the model was trained on photos of both. By default Ollie estimates from your photo whether your face looks male or female and compares you with celebrities of that gender, whose gender comes from Wikidata. The estimate can be wrong. To choose yourself, set the Gender menu on the match page to Men or Women before you search.",
  ],
  [
    "What actor or actress do I look like?",
    "Set Compare with to Actors before you search, and Ollie ranks only people best known for acting (on Wikidata), so your top five are all actors and actresses. Leave Gender on Auto to compare you with actors of the gender your face looks, or pick Men or Women yourself. With All celebrities, your matches can also be singers, athletes and other famous people.",
  ],
  [
    "Can I match with only actors, singers or footballers?",
    "Yes. Pick Actors, Singers or Footballers in the Compare with menu before you search. Ollie goes by what each person is best known for on Wikidata, so a singer with one film role counts as a singer. All celebrities is the default.",
  ],
  [
    "Which celebrities are included?",
    `${INDEX.celebrities} of the most famous living adults: actors, musicians, athletes, politicians, business people and online creators. They were chosen by how much their English Wikipedia page was read over six months and how many language editions of Wikipedia cover them, plus a regional list ranked by views on Asian, Latin American, African and Middle Eastern Wikipedias. People known mainly for crimes or adult films are left out. Every photo is a freely licensed picture from ${INDEX.source}, credited under your matches.`,
  ],
  [
    "Can I use a group photo?",
    "You can, but Ollie only matches the largest face in the photo. If someone else's face is bigger or closer to the camera, you'll get their matches instead of yours. Crop the photo to just your face first. It takes a few seconds and gives a cleaner result.",
  ],
  [
    "How is Ollie different from other lookalike AI apps?",
    `The face-recognition model behind Ollie was written and trained from scratch by the Ollie team, instead of calling a commercial face-recognition service. Every celebrity photo is openly licensed and credited, and your photo is never stored. It's a small project, so the celebrity list is smaller than a big company's would be, and its limitations are listed on this page.`,
  ],
]
