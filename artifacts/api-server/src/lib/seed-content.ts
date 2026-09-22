export const sampleContent = {
  config: {
    birthdayPersonName: "Ari",
    birthdayDate: "2026-12-14",
    introText: "A small place to keep the things worth remembering.",
  },
  memories: [
    { title: "That random evening", description: "The kind of night that was ordinary until it became one of the ones we kept talking about.", memoryDate: "2025-08-16", displayOrder: 1 },
    { title: "A very good detour", description: "No plan, a little too much coffee, and somehow exactly where we needed to be.", memoryDate: "2025-02-08", displayOrder: 2 },
    { title: "The tiny victory", description: "You did the thing you had been putting off. I hope you remember how proud you looked afterward.", memoryDate: null, displayOrder: 3 },
  ],
  openWhen: [
    { title: "Open when you're sad", message: "You do not have to solve everything today. Take the next small step, then let the rest wait.", displayOrder: 1 },
    { title: "Open when you need a laugh", message: "Remember that none of us really knows what we are doing. We are all just improvising with confidence.", displayOrder: 2 },
    { title: "Open when you can't sleep", message: "The night is allowed to be quiet. Put your phone down, breathe slowly, and remember that tomorrow is not asking for perfection.", displayOrder: 3 },
    { title: "Open when something amazing happens", message: "I knew you would get here. Tell me everything, including the tiny details.", displayOrder: 4 },
  ],
  finalLetter: "There are so many versions of you I have gotten to know, and I like every one of them. The loud ones, the uncertain ones, the ones who are still figuring it out. You do not have to become someone else to be worth celebrating. Keep making room for the life that feels like yours.",
  birthdayMessage: "I hope this year gives you more of the days that make you feel completely yourself. You deserve the good surprises, the quiet wins, and all the ordinary moments that turn out to matter.",
} as const;