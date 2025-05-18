
export interface Game {
  id: string;
  title: string;
  imgSrc: string;
  isPiratePun: boolean;
  coinCost: number;
  unlocked: boolean;
  category?: string; // Adding the optional category property
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
    title: "Pirates: Legend of the Black Buccaneer",
    imgSrc: "https://cdn.mobygames.com/covers/4212203-pirates-legend-of-the-black-buccaneer-playstation-2-front-cover.jpg",
    isPiratePun: false,
    coinCost: 14,
    unlocked: false,
    category: "action"
  },
  {
    id: "23",
    title: "Raven's Cry",
    imgSrc: "https://upload.wikimedia.org/wikipedia/en/c/cb/Raven%27s_Cry_cover_art.jpg",
    isPiratePun: false,
    coinCost: 21,
    unlocked: false,
    category: "action"
  },
  {
    id: "24",
    title: "Pirates: Tides of Fortune",
    imgSrc: "https://www.mmogames.com/wp-content/uploads/2012/05/pirates-tides-of-fortune-logo.jpg",
    isPiratePun: false,
    coinCost: 23,
    unlocked: false,
    category: "strategy"
  },
  {
    id: "25",
    title: "Tortuga: A Pirate's Tale",
    imgSrc: "https://cdn.akamai.steamstatic.com/steam/apps/1728650/header.jpg",
    isPiratePun: false,
    coinCost: 31,
    unlocked: false,
    category: "strategy"
  },
  {
    id: "26",
    title: "Naval Action",
    imgSrc: "https://cdn.akamai.steamstatic.com/steam/apps/311310/header.jpg",
    isPiratePun: false,
    coinCost: 38,
    unlocked: false,
    category: "simulation"
  },
  {
    id: "27",
    title: "Blood & Gold: Caribbean!",
    imgSrc: "https://cdn.akamai.steamstatic.com/steam/apps/413710/header.jpg",
    isPiratePun: false,
    coinCost: 17,
    unlocked: false,
    category: "rpg"
  },
  {
    id: "28",
    title: "Abandon Ship",
    imgSrc: "https://cdn.akamai.steamstatic.com/steam/apps/551860/header.jpg",
    isPiratePun: false,
    coinCost: 29,
    unlocked: false,
    category: "adventure"
  },
  {
    id: "29",
    title: "The Pirate: Caribbean Hunt",
    imgSrc: "https://cdn.akamai.steamstatic.com/steam/apps/512470/header.jpg",
    isPiratePun: false,
    coinCost: 13,
    unlocked: false,
    category: "simulation"
  },
  {
    id: "30",
    title: "Salt 2: Shores of Gold",
    imgSrc: "https://cdn.akamai.steamstatic.com/steam/apps/1284100/header.jpg",
    isPiratePun: false,
    coinCost: 27,
    unlocked: false,
    category: "adventure"
  },
  {
    id: "31",
    title: "Corsairs Legacy",
    imgSrc: "https://cdn.akamai.steamstatic.com/steam/apps/1546740/header.jpg",
    isPiratePun: false,
    coinCost: 40,
    unlocked: false,
    category: "action"
  },
  {
    id: "32",
    title: "Pirates of Black Cove",
    imgSrc: "https://cdn.akamai.steamstatic.com/steam/apps/49330/header.jpg",
    isPiratePun: false,
    coinCost: 11,
    unlocked: false,
    category: "strategy"
  },
  {
    id: "33",
    title: "Freebooter",
    imgSrc: "https://cdn.akamai.steamstatic.com/steam/apps/1719460/header.jpg",
    isPiratePun: false,
    coinCost: 33,
    unlocked: false,
    category: "adventure"
  },
  {
    id: "34",
    title: "Port of Call",
    imgSrc: "https://cdn.akamai.steamstatic.com/steam/apps/1783340/header.jpg",
    isPiratePun: false,
    coinCost: 36,
    unlocked: false,
    category: "simulation"
  },
  {
    id: "35",
    title: "Buccaneer: The Pursuit of Infamy",
    imgSrc: "https://cdn.akamai.steamstatic.com/steam/apps/23100/header.jpg",
    isPiratePun: false,
    coinCost: 18,
    unlocked: false,
    category: "action"
  }
];
