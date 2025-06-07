
export interface Game {
  id: string;
  title: string;
  imgSrc: string;
  isPiratePun: boolean;
  coinCost: number;
  unlocked: boolean;
  category?: string;
}

export const games: Game[] = [
  // First 4 games are free
  {
    id: "1",
    title: "Sea of Thieves",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1172620/header.jpg",
    isPiratePun: false,
    coinCost: 0,
    unlocked: true,
    category: "action"
  },
  {
    id: "2",
    title: "Assassin's Creed IV: Black Flag",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/242050/header.jpg",
    isPiratePun: false,
    coinCost: 0,
    unlocked: true,
    category: "action"
  },
  {
    id: "3",
    title: "The Secret of Monkey Island",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/32360/header.jpg",
    isPiratePun: false,
    coinCost: 0,
    unlocked: true,
    category: "adventure"
  },
  {
    id: "4",
    title: "Sid Meier's Pirates!",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/3920/header.jpg",
    isPiratePun: false,
    coinCost: 0,
    unlocked: true,
    category: "strategy"
  },
  // Popular current games
  {
    id: "5",
    title: "Call of Duty: Black Ops 6",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/2933620/header.jpg",
    isPiratePun: false,
    coinCost: 45,
    unlocked: false,
    category: "fps"
  },
  {
    id: "6",
    title: "Fortnite",
    imgSrc: "https://cdn2.unrealengine.com/14br-consoles-1920x1080-wlogo-f010219b1dbf.jpg",
    isPiratePun: false,
    coinCost: 0,
    unlocked: false,
    category: "battle-royale"
  },
  {
    id: "7",
    title: "Counter-Strike 2",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
    isPiratePun: false,
    coinCost: 0,
    unlocked: false,
    category: "fps"
  },
  {
    id: "8",
    title: "Valorant",
    imgSrc: "https://images.contentstack.io/v3/assets/blt187521ff0727be24/blt6b9e27cc54b2e7d9/60ee1fc8e74d174034d7ae5e/lol-champion-rumble-splash-art.jpg",
    isPiratePun: false,
    coinCost: 0,
    unlocked: false,
    category: "fps"
  },
  {
    id: "9",
    title: "Cyberpunk 2077",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
    isPiratePun: false,
    coinCost: 40,
    unlocked: false,
    category: "rpg"
  },
  {
    id: "10",
    title: "Baldur's Gate 3",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg",
    isPiratePun: false,
    coinCost: 45,
    unlocked: false,
    category: "rpg"
  },
  {
    id: "11",
    title: "Elden Ring",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg",
    isPiratePun: false,
    coinCost: 50,
    unlocked: false,
    category: "rpg"
  },
  {
    id: "12",
    title: "Minecraft",
    imgSrc: "https://www.minecraft.net/content/dam/games/minecraft/key-art/Games_Subnav_Minecraft-300x465.jpg",
    isPiratePun: false,
    coinCost: 20,
    unlocked: false,
    category: "sandbox"
  },
  {
    id: "13",
    title: "Grand Theft Auto V",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg",
    isPiratePun: false,
    coinCost: 35,
    unlocked: false,
    category: "action"
  },
  {
    id: "14",
    title: "Red Dead Redemption 2",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg",
    isPiratePun: false,
    coinCost: 45,
    unlocked: false,
    category: "action"
  },
  {
    id: "15",
    title: "Apex Legends",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg",
    isPiratePun: false,
    coinCost: 0,
    unlocked: false,
    category: "battle-royale"
  },
  {
    id: "16",
    title: "League of Legends",
    imgSrc: "https://images.contentstack.io/v3/assets/blt187521ff0727be24/blt6b9e27cc54b2e7d9/60ee1fc8e74d174034d7ae5e/lol-champion-rumble-splash-art.jpg",
    isPiratePun: false,
    coinCost: 0,
    unlocked: false,
    category: "moba"
  },
  {
    id: "17",
    title: "World of Warcraft",
    imgSrc: "https://bnetcmsus-a.akamaihd.net/cms/page_media/1W04QMRVD6361571234134076.jpg",
    isPiratePun: false,
    coinCost: 30,
    unlocked: false,
    category: "mmorpg"
  },
  {
    id: "18",
    title: "Palworld",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1623730/header.jpg",
    isPiratePun: false,
    coinCost: 25,
    unlocked: false,
    category: "survival"
  },
  {
    id: "19",
    title: "Helldivers 2",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/553850/header.jpg",
    isPiratePun: false,
    coinCost: 30,
    unlocked: false,
    category: "fps"
  },
  {
    id: "20",
    title: "Stellar Blade",
    imgSrc: "https://image.api.playstation.com/vulcan/ap/rnd/202312/0117/ac64b8f48c80fc0885b8e1a1f42ca1f99e4c9e65fe1e94c0.jpg",
    isPiratePun: false,
    coinCost: 42,
    unlocked: false,
    category: "action"
  },
  // New trending games from 2024
  {
    id: "21",
    title: "Black Myth: Wukong",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/2358720/header.jpg",
    isPiratePun: false,
    coinCost: 48,
    unlocked: false,
    category: "action"
  },
  {
    id: "22",
    title: "Warhammer 40,000: Space Marine 2",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/2183900/header.jpg",
    isPiratePun: false,
    coinCost: 44,
    unlocked: false,
    category: "action"
  },
  {
    id: "23",
    title: "Dragon Age: The Veilguard",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1845910/header.jpg",
    isPiratePun: false,
    coinCost: 46,
    unlocked: false,
    category: "rpg"
  },
  {
    id: "24",
    title: "Metaphor: ReFantazio",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/2679460/header.jpg",
    isPiratePun: false,
    coinCost: 42,
    unlocked: false,
    category: "rpg"
  },
  {
    id: "25",
    title: "Lethal Company",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1966720/header.jpg",
    isPiratePun: false,
    coinCost: 18,
    unlocked: false,
    category: "horror"
  },
  {
    id: "26",
    title: "Rust",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
    isPiratePun: false,
    coinCost: 28,
    unlocked: false,
    category: "survival"
  },
  {
    id: "27",
    title: "Valheim",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg",
    isPiratePun: false,
    coinCost: 22,
    unlocked: false,
    category: "survival"
  },
  {
    id: "28",
    title: "Among Us",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/945360/header.jpg",
    isPiratePun: false,
    coinCost: 8,
    unlocked: false,
    category: "party"
  },
  {
    id: "29",
    title: "Fall Guys",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1097150/header.jpg",
    isPiratePun: false,
    coinCost: 0,
    unlocked: false,
    category: "party"
  },
  {
    id: "30",
    title: "Rocket League",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/252950/header.jpg",
    isPiratePun: false,
    coinCost: 0,
    unlocked: false,
    category: "sports"
  }
];
