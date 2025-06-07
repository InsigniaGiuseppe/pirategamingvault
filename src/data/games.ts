
export interface Game {
  id: string;
  title: string;
  imgSrc: string;
  isPiratePun?: boolean;
  coinCost: number;
  unlocked: boolean;
  category: string;
}

export const games: Game[] = [
  // RPG Games
  {
    id: "witcher-3",
    title: "The Witcher 3: Wild Hunt",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg",
    isPiratePun: false,
    coinCost: 30,
    unlocked: false,
    category: "rpg"
  },
  {
    id: "cyberpunk-2077",
    title: "Cyberpunk 2077",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
    isPiratePun: false,
    coinCost: 35,
    unlocked: false,
    category: "rpg"
  },
  {
    id: "elden-ring",
    title: "Elden Ring",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg",
    isPiratePun: false,
    coinCost: 40,
    unlocked: false,
    category: "rpg"
  },
  {
    id: "baldurs-gate-3",
    title: "Baldur's Gate 3",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg",
    isPiratePun: false,
    coinCost: 35,
    unlocked: false,
    category: "rpg"
  },

  // FPS Games - Using reliable Steam images where available
  {
    id: "valorant",
    title: "Valorant",
    imgSrc: "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt5c8bfe84d31ef9dc/6364b56b84a1b1083e7c3a84/VALORANT_YR3_Announcement_Banner_Article.jpg",
    isPiratePun: false,
    coinCost: 25,
    unlocked: false,
    category: "fps"
  },
  {
    id: "call-of-duty-warzone",
    title: "Call of Duty: Warzone",
    imgSrc: "https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/global/features/meta-share-mw2.jpg",
    isPiratePun: false,
    coinCost: 20,
    unlocked: false,
    category: "fps"
  },
  {
    id: "counter-strike-2",
    title: "Counter-Strike 2",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
    isPiratePun: false,
    coinCost: 15,
    unlocked: false,
    category: "fps"
  },
  {
    id: "overwatch-2",
    title: "Overwatch 2",
    imgSrc: "https://blz-contentstack-images.akamaized.net/v3/assets/blt9c12f249ac15c7ec/blt9ebab0efdc4aa4a7/6512c6cce3e9b96b3b38f8b0/ow2_keyart.jpg",
    isPiratePun: false,
    coinCost: 25,
    unlocked: false,
    category: "fps"
  },

  // MOBA Games
  {
    id: "league-of-legends",
    title: "League of Legends",
    imgSrc: "https://cmsassets.rgpub.io/sanity/images/dsfx7636/news/e02afea7dd4b2d28f1b1d2c4ed91b6e3a9642aa0-1920x1080.jpg",
    isPiratePun: false,
    coinCost: 20,
    unlocked: false,
    category: "moba"
  },
  {
    id: "dota-2",
    title: "Dota 2",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg",
    isPiratePun: false,
    coinCost: 20,
    unlocked: false,
    category: "moba"
  },

  // Strategy Games
  {
    id: "civilization-vi",
    title: "Civilization VI",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/289070/header.jpg",
    isPiratePun: false,
    coinCost: 25,
    unlocked: false,
    category: "strategy"
  },
  {
    id: "age-of-empires-iv",
    title: "Age of Empires IV",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1466860/header.jpg",
    isPiratePun: false,
    coinCost: 30,
    unlocked: false,
    category: "strategy"
  },

  // Battle Royale
  {
    id: "fortnite",
    title: "Fortnite",
    imgSrc: "https://cdn2.unrealengine.com/fortnite-chapter-5-season-1-1920x1080-d35912cc2dc4.jpg",
    isPiratePun: false,
    coinCost: 15,
    unlocked: false,
    category: "battle-royale"
  },
  {
    id: "apex-legends",
    title: "Apex Legends",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg",
    isPiratePun: false,
    coinCost: 20,
    unlocked: false,
    category: "battle-royale"
  },

  // MMO Games
  {
    id: "world-of-warcraft",
    title: "World of Warcraft",
    imgSrc: "https://bnetcmsus-a.akamaihd.net/cms/page_media/w4/W4DKWRNPCXL81665783006021.jpg",
    isPiratePun: false,
    coinCost: 25,
    unlocked: false,
    category: "mmorpg"
  },
  {
    id: "final-fantasy-xiv",
    title: "Final Fantasy XIV",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/39210/header.jpg",
    isPiratePun: false,
    coinCost: 30,
    unlocked: false,
    category: "mmorpg"
  },

  // Horror Games
  {
    id: "phasmophobia",
    title: "Phasmophobia",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/739630/header.jpg",
    isPiratePun: false,
    coinCost: 15,
    unlocked: false,
    category: "horror"
  },
  {
    id: "dead-by-daylight",
    title: "Dead by Daylight",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/381210/header.jpg",
    isPiratePun: false,
    coinCost: 20,
    unlocked: false,
    category: "horror"
  },

  // Sports Games
  {
    id: "fifa-24",
    title: "EA Sports FC 24",
    imgSrc: "https://media.contentapi.ea.com/content/dam/ea/easportsfc/fc-24/common/fc24-featured-image-16x9.jpg.adapt.crop16x9.1023w.jpg",
    isPiratePun: false,
    coinCost: 35,
    unlocked: false,
    category: "sports"
  },
  {
    id: "rocket-league",
    title: "Rocket League",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/252950/header.jpg",
    isPiratePun: false,
    coinCost: 20,
    unlocked: false,
    category: "sports"
  },

  // Adventure Games
  {
    id: "red-dead-redemption-2",
    title: "Red Dead Redemption 2",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg",
    isPiratePun: false,
    coinCost: 40,
    unlocked: false,
    category: "adventure"
  },
  {
    id: "gta-v",
    title: "Grand Theft Auto V",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg",
    isPiratePun: false,
    coinCost: 25,
    unlocked: false,
    category: "adventure"
  },

  // Simulation Games
  {
    id: "the-sims-4",
    title: "The Sims 4",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1222670/header.jpg",
    isPiratePun: false,
    coinCost: 20,
    unlocked: false,
    category: "simulation"
  },
  {
    id: "cities-skylines",
    title: "Cities: Skylines",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/255710/header.jpg",
    isPiratePun: false,
    coinCost: 15,
    unlocked: false,
    category: "simulation"
  },

  // Racing Games
  {
    id: "forza-horizon-5",
    title: "Forza Horizon 5",
    imgSrc: "https://compass-ssl.xbox.com/assets/73/2a/732a850c-6c8d-4fad-b3db-6cd5e108b7b5.jpg?n=Forza-Horizon-5_GLP-Page-Hero-1084_1920x1080.jpg",
    isPiratePun: false,
    coinCost: 35,
    unlocked: false,
    category: "racing"
  },
  {
    id: "f1-23",
    title: "F1 23",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/2108330/header.jpg",
    isPiratePun: false,
    coinCost: 30,
    unlocked: false,
    category: "racing"
  },

  // Indie Games
  {
    id: "hades",
    title: "Hades",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg",
    isPiratePun: false,
    coinCost: 20,
    unlocked: false,
    category: "indie"
  },
  {
    id: "stardew-valley",
    title: "Stardew Valley",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg",
    isPiratePun: false,
    coinCost: 15,
    unlocked: false,
    category: "indie"
  }
];

export default games;
