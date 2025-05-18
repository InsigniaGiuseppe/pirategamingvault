
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
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/7/77/Sea_of_thieves_cover_art.jpg",
    isPiratePun: false,
    coinCost: 0,
    unlocked: true,
    category: "action"
  },
  {
    id: "2",
    title: "Assassin's Creed IV: Black Flag",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/0/03/Assassins_Creed_IV_Black_Flag_cover.jpg",
    isPiratePun: false,
    coinCost: 0,
    unlocked: true,
    category: "action"
  },
  {
    id: "3",
    title: "The Secret of Monkey Island",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/a/a8/The_Secret_of_Monkey_Island_artwork.jpg",
    isPiratePun: false,
    coinCost: 0,
    unlocked: true,
    category: "adventure"
  },
  {
    id: "4",
    title: "Sid Meier's Pirates!",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/0/0f/Sid_Meier%27s_Pirates%21_%282004%29_Coverart.png",
    isPiratePun: false,
    coinCost: 0,
    unlocked: true,
    category: "strategy"
  },
  // Paid games below
  {
    id: "5",
    title: "Port Royale 4",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1024650/header.jpg",
    isPiratePun: false,
    coinCost: 15,
    unlocked: false,
    category: "strategy"
  },
  {
    id: "6",
    title: "Skull & Bones",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/e/e4/Skull_and_Bones_cover_art.jpg",
    isPiratePun: false,
    coinCost: 25,
    unlocked: false,
    category: "action"
  },
  {
    id: "7",
    title: "ATLAS",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/834910/header.jpg",
    isPiratePun: false,
    coinCost: 20,
    unlocked: false,
    category: "adventure"
  },
  {
    id: "8",
    title: "Pillars of Eternity II: Deadfire",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/3/3a/Pillars_of_Eternity_II_Deadfire_cover_art.jpg",
    isPiratePun: false,
    coinCost: 30,
    unlocked: false,
    category: "rpg"
  },
  {
    id: "9", 
    title: "One Piece: Pirate Warriors 4",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/0/0c/One_Piece_Pirate_Warriors_4.jpg",
    isPiratePun: false,
    coinCost: 35,
    unlocked: false,
    category: "action"
  },
  {
    id: "10",
    title: "Risen 2: Dark Waters",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/1/11/Risen_2_-_Dark_Waters_cover.jpg",
    isPiratePun: false,
    coinCost: 18,
    unlocked: false,
    category: "rpg"
  },
  {
    id: "11",
    title: "Blackwake",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/420290/header.jpg",
    isPiratePun: false,
    coinCost: 12,
    unlocked: false,
    category: "action"
  },
  {
    id: "12",
    title: "King of Seas",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1209410/header.jpg",
    isPiratePun: false,
    coinCost: 22,
    unlocked: false,
    category: "adventure"
  },
  {
    id: "13",
    title: "Furious Seas",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/875760/header.jpg",
    isPiratePun: false,
    coinCost: 15,
    unlocked: false,
    category: "action"
  },
  {
    id: "14",
    title: "Tempest: Pirate Action RPG",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/418180/header.jpg",
    isPiratePun: false,
    coinCost: 20,
    unlocked: false,
    category: "rpg"
  },
  {
    id: "15",
    title: "Man O' War: Corsair",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/344240/header.jpg",
    isPiratePun: false,
    coinCost: 16,
    unlocked: false,
    category: "action"
  },
  // Adding 20 more games
  {
    id: "16",
    title: "Black Sails",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/1612770/header.jpg",
    isPiratePun: false,
    coinCost: 28,
    unlocked: false,
    category: "adventure"
  },
  {
    id: "17",
    title: "Lego Pirates of the Caribbean",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/3/3c/Lego_Pirates_of_the_Caribbean_cover.jpg",
    isPiratePun: false,
    coinCost: 24,
    unlocked: false,
    category: "adventure"
  },
  {
    id: "18",
    title: "Puzzle Pirates",
    imgSrc: "https://cdn.akamai.steamstatic.com/steam/apps/99910/header.jpg",
    isPiratePun: false,
    coinCost: 10,
    unlocked: false,
    category: "puzzle"
  },
  {
    id: "19",
    title: "Age of Pirates 2",
    imgSrc: "https://cdn.mobygames.com/covers/4635245-age-of-pirates-2-city-of-abandoned-ships-windows-front-cover.jpg",
    isPiratePun: false,
    coinCost: 32,
    unlocked: false,
    category: "rpg"
  },
  {
    id: "20",
    title: "Uncharted Waters",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/a/a4/Uncharted_Waters_cover.jpg",
    isPiratePun: false,
    coinCost: 26,
    unlocked: false,
    category: "strategy"
  },
  {
    id: "21",
    title: "Pirates of the Burning Sea",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/d/d8/Pirates_of_the_Burning_Sea_cover.jpg",
    isPiratePun: false,
    coinCost: 19,
    unlocked: false,
    category: "mmo"
  },
  {
    id: "22",
    title: "Call of Duty: Modern Warfare 2",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/5/51/Call_of_Duty_Modern_Warfare_II_Key_Art.jpg",
    isPiratePun: false,
    coinCost: 30,
    unlocked: false,
    category: "fps"
  },
  {
    id: "23",
    title: "Battlefield 2042",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/e/ec/Battlefield_2042_cover_art.jpg",
    isPiratePun: false,
    coinCost: 25,
    unlocked: false,
    category: "fps"
  },
  {
    id: "24",
    title: "Apex Legends",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/d/db/Apex_legends_cover.jpg",
    isPiratePun: false,
    coinCost: 0,
    unlocked: false,
    category: "fps"
  },
  {
    id: "25",
    title: "PUBG: Battlegrounds",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/e/e9/Playerunknown%27s_Battlegrounds_Steam_Logo.jpg",
    isPiratePun: false,
    coinCost: 20,
    unlocked: false,
    category: "fps"
  },
  {
    id: "26",
    title: "Halo Infinite",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/1/13/Halo_Infinite.png",
    isPiratePun: false,
    coinCost: 35,
    unlocked: false,
    category: "fps"
  },
  {
    id: "27",
    title: "Destiny 2",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/0/05/Destiny_2_artwork.jpg",
    isPiratePun: false,
    coinCost: 15,
    unlocked: false,
    category: "fps"
  },
  {
    id: "28",
    title: "Warframe",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/b/bd/Warframe_Cover_Art.png",
    isPiratePun: false,
    coinCost: 0,
    unlocked: false,
    category: "action"
  },
  {
    id: "29",
    title: "Rainbow Six Siege",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/4/47/Tom_Clancy%27s_Rainbow_Six_Siege_cover_art.jpg",
    isPiratePun: false,
    coinCost: 22,
    unlocked: false,
    category: "fps"
  },
  {
    id: "30",
    title: "Escape from Tarkov",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/5/5e/Escape_from_Tarkov_cover_art.jpg",
    isPiratePun: false,
    coinCost: 40,
    unlocked: false,
    category: "fps"
  },
  {
    id: "31",
    title: "Titanfall 2",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/3/3b/Titanfall_2.jpg",
    isPiratePun: false,
    coinCost: 18,
    unlocked: false,
    category: "fps"
  },
  {
    id: "32",
    title: "Far Cry 6",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/3/35/Far_cry_6_cover.jpg",
    isPiratePun: false,
    coinCost: 32,
    unlocked: false,
    category: "fps"
  },
  {
    id: "33",
    title: "The Division 2",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/a/af/The_Division_2_art.jpg",
    isPiratePun: false,
    coinCost: 24,
    unlocked: false,
    category: "action"
  },
  {
    id: "34",
    title: "Metro Exodus",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/a/af/Metro_exodus_cover.jpeg",
    isPiratePun: false,
    coinCost: 26,
    unlocked: false,
    category: "fps"
  },
  {
    id: "35",
    title: "Valorant",
    imgSrc: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Valorant_logo_-_pink_color_version.svg",
    isPiratePun: false,
    coinCost: 0,
    unlocked: false,
    category: "fps"
  },
  {
    id: "36",
    title: "CS:GO",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/6/6e/CS2_Cover_Art.jpg",
    isPiratePun: false,
    coinCost: 0,
    unlocked: false,
    category: "fps"
  },
  {
    id: "37",
    title: "Payday 3",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/9/9e/Payday_3_cover_art.jpg",
    isPiratePun: false,
    coinCost: 28,
    unlocked: false,
    category: "fps"
  },
  {
    id: "38",
    title: "Ghost Recon: Wildlands",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/b/b9/Ghost_Recon_Wildlands_cover_art.jpg",
    isPiratePun: false,
    coinCost: 20,
    unlocked: false,
    category: "action"
  },
  {
    id: "39",
    title: "Hunt: Showdown",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/5/5b/Hunt_Showdown_cover_art.jpg",
    isPiratePun: false,
    coinCost: 30,
    unlocked: false,
    category: "fps"
  },
  {
    id: "40",
    title: "Borderlands 3",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/9/91/Borderlands_3_cover_art.jpg",
    isPiratePun: false,
    coinCost: 25,
    unlocked: false,
    category: "fps"
  },
  {
    id: "41",
    title: "Left 4 Dead 2",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/b/ba/Left4Dead2.jpg",
    isPiratePun: false,
    coinCost: 15,
    unlocked: false,
    category: "fps"
  },
  {
    id: "42",
    title: "Insurgency: Sandstorm",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/6/69/Insurgency_Sandstorm_cover_art.jpg",
    isPiratePun: false,
    coinCost: 18,
    unlocked: false,
    category: "fps"
  },
  {
    id: "43",
    title: "Once Human",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/2139460/header.jpg",
    isPiratePun: false,
    coinCost: 40,
    unlocked: false,
    category: "survival"
  },
  {
    id: "44",
    title: "Valheim",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/7/77/Valheim_2021_logo.jpg",
    isPiratePun: false,
    coinCost: 22,
    unlocked: false,
    category: "survival"
  },
  {
    id: "45",
    title: "Rust",
    imgSrc: "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
    isPiratePun: false,
    coinCost: 28,
    unlocked: false,
    category: "survival"
  },
  {
    id: "46",
    title: "Baldur's Gate 3",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/b/b2/Baldurs_Gate_3_cover_art.jpg",
    isPiratePun: false,
    coinCost: 45,
    unlocked: false,
    category: "rpg"
  },
  {
    id: "47",
    title: "Minecraft",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png",
    isPiratePun: false,
    coinCost: 20,
    unlocked: false,
    category: "sandbox"
  },
  {
    id: "48",
    title: "Elden Ring",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/5/5e/Elden_Ring_Box_art.jpg",
    isPiratePun: false,
    coinCost: 50,
    unlocked: false,
    category: "rpg"
  },
  {
    id: "49",
    title: "Cyberpunk 2077",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg",
    isPiratePun: false,
    coinCost: 40,
    unlocked: false,
    category: "rpg"
  },
  {
    id: "50",
    title: "Red Dead Redemption 2",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg",
    isPiratePun: false,
    coinCost: 45,
    unlocked: false,
    category: "action"
  }
];
