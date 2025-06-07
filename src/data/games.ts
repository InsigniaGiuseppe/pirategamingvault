
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
  {
    id: "skyrim",
    title: "The Elder Scrolls V: Skyrim",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/489830/header.jpg",
    isPiratePun: false,
    coinCost: 25,
    unlocked: false,
    category: "rpg"
  },

  // FPS Games
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
    id: "call-of-duty-mw3",
    title: "Call of Duty: Modern Warfare III",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/2519060/header.jpg",
    isPiratePun: false,
    coinCost: 30,
    unlocked: false,
    category: "fps"
  },
  {
    id: "valorant",
    title: "Valorant",
    imgSrc: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=337&fit=crop",
    isPiratePun: false,
    coinCost: 25,
    unlocked: false,
    category: "fps"
  },
  {
    id: "overwatch-2",
    title: "Overwatch 2",
    imgSrc: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=600&h=337&fit=crop",
    isPiratePun: false,
    coinCost: 25,
    unlocked: false,
    category: "fps"
  },
  {
    id: "doom-eternal",
    title: "DOOM Eternal",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/782330/header.jpg",
    isPiratePun: false,
    coinCost: 30,
    unlocked: false,
    category: "fps"
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
  {
    id: "horizon-zero-dawn",
    title: "Horizon Zero Dawn",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1151640/header.jpg",
    isPiratePun: false,
    coinCost: 30,
    unlocked: false,
    category: "adventure"
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
  {
    id: "total-war-warhammer-3",
    title: "Total War: WARHAMMER III",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1142710/header.jpg",
    isPiratePun: false,
    coinCost: 35,
    unlocked: false,
    category: "strategy"
  },

  // Battle Royale
  {
    id: "fortnite",
    title: "Fortnite",
    imgSrc: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=600&h=337&fit=crop",
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

  // MMORPG Games
  {
    id: "world-of-warcraft",
    title: "World of Warcraft",
    imgSrc: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=337&fit=crop",
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
    id: "fc-24",
    title: "EA Sports FC 24",
    imgSrc: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=337&fit=crop",
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
    imgSrc: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=337&fit=crop",
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
  },
  {
    id: "hollow-knight",
    title: "Hollow Knight",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
    isPiratePun: false,
    coinCost: 15,
    unlocked: false,
    category: "indie"
  },

  // MOBA Games
  {
    id: "league-of-legends",
    title: "League of Legends",
    imgSrc: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=337&fit=crop",
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
  }
];

export default games;
