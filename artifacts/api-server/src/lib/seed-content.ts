export const sampleContent = {
  config: {
    birthdayPersonName: "Vignesh",
    birthdayDate: "2026-09-23",
    introText: "A small place to keep the things worth remembering.",
  },
  memories: [
  {
    title: "A Pink Little Moment",
    description: "Somewhere under that pretty pink sky, a few feelings were finally confessed — not completely, not perfectly, but enough to make this photo mean a little more than it looks.",
    memoryDate: null,
    imageStorageKey: "/objects/uploads/Memory1.jpeg",
    displayOrder: 1
  },
  {
    title: "Before the PPT",
    description: "We escaped to a random college café just to make the pre-PPT tension a little less unbearable. You had tea, I had ice cream, and for a while, the presentation was the least important thing.",
    memoryDate: null,
    imageStorageKey: "/objects/uploads/Memory2.jpeg",
    displayOrder: 2
  },
  {
    title: "So... It Was Planned? 😭",
    description: "I genuinely thought we had just happened to meet there. Then I found out the little parking-lot mirror selfie moment wasn't as accidental as I thought. 😅",
    memoryDate: null,
    imageStorageKey: "/objects/uploads/Memory3.jpeg",
    displayOrder: 3
  },
 ],
  openWhen: [
    { title: "Open when you're sad", message: "You do not have to solve everything today. Take the next small step, then let the rest wait.", displayOrder: 1 },
    { title: "Open when you need a laugh", message: "Remember that none of us really knows what we are doing. We are all just improvising with confidence.", displayOrder: 2 },
    { title: "Open when you can't sleep", message: "The night is allowed to be quiet. Put your phone down, breathe slowly, and remember that tomorrow is not asking for perfection.", displayOrder: 3 },
    { title: "Open when something amazing happens", message: "I knew you would get here. Tell me everything, including the tiny details.", displayOrder: 4 },
  ],
  finalLetter: "Life is going to change a lot from here. Some things will work out exactly how you imagined, some won’t, and some of the best things will probably be the ones you never planned for.\n\nJust don’t forget to enjoy where you are while you’re busy thinking about where you’re going.\n\nWe’ve got a lot of memories behind us and hopefully a lot more ahead. Happy birthday, bro. Here’s to whatever comes next.",
  birthdayMessage: "I hope this year gives you more of the days that make you feel completely yourself. You deserve the good surprises, the quiet wins, and all the ordinary moments that turn out to matter.",
} as const;