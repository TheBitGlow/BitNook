export interface GameInfo {
  slug: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  iconName: string
  color: string
  href: string
  category: 'puzzle' | 'strategy' | 'arcade' | 'card'
  updatedAt: string
}

export type GameRegistryItem = GameInfo

export const GAMES: GameInfo[] = [
  {
    slug: 'tetris',
    name: '俄罗斯方块',
    nameEn: 'Tetris',
    description: '经典7-bag方块下落消除游戏，支持硬降、等级与壁踢',
    descriptionEn: 'Classic 7-bag falling block game with hard drop and wall kicks',
    iconName: 'Boxes',
    color: '#06B6D4',
    href: '/games/tetris',
    category: 'arcade',
    updatedAt: '2026-03-20',
  },
  {
    slug: 'minesweeper',
    name: '扫雷',
    nameEn: 'Minesweeper',
    description: '经典Windows扫雷挑战，首击开局保护与真实排雷逻辑',
    descriptionEn: 'Classic minesweeper with safe first-click opening and record tracking',
    iconName: 'Bomb',
    color: '#EF4444',
    href: '/games/minesweeper',
    category: 'puzzle',
    updatedAt: '2026-03-20',
  },
  {
    slug: 'snake',
    name: '贪吃蛇',
    nameEn: 'Snake',
    description: '经典的贪吃蛇移动挑战，支持触屏虚拟方向键与暂停记录',
    descriptionEn: 'Classic retro snake game with mobile touch controls and high score saving',
    iconName: 'Activity',
    color: '#10B981',
    href: '/games/snake',
    category: 'arcade',
    updatedAt: '2026-03-20',
  },
  {
    slug: 'gomoku',
    name: '五子棋',
    nameEn: 'Gomoku',
    description: '15×15标准棋盘五子棋，支持双人对弈与启发式AI对决',
    descriptionEn: 'Five-in-a-row board game with PvP and heuristic AI modes',
    iconName: 'CircleDot',
    color: '#F59E0B',
    href: '/games/gomoku',
    category: 'strategy',
    updatedAt: '2026-03-20',
  },
  {
    slug: 'match3',
    name: '宝石消消乐',
    nameEn: 'Match-3',
    description: '经典三消休闲闯关，支持连续消除、自动洗牌与消除特效',
    descriptionEn: 'Tile-matching puzzle with gravity cascades, combos, and auto-shuffle',
    iconName: 'Sparkles',
    color: '#EC4899',
    href: '/games/match3',
    category: 'puzzle',
    updatedAt: '2026-03-20',
  },
  {
    slug: 'chess-international',
    name: '国际象棋',
    nameEn: 'International Chess',
    description: '标准国际象棋规则，支持将军、将死、逼和、王车易位与兵升变',
    descriptionEn: 'Full chess engine with checkmate, castling, en passant, and promotion',
    iconName: 'Crown',
    color: '#8B5CF6',
    href: '/games/chess-international',
    category: 'strategy',
    updatedAt: '2026-03-20',
  },
  {
    slug: 'chess-chinese',
    name: '中国象棋',
    nameEn: 'Chinese Chess',
    description: '传统楚河汉界中国象棋，严谨将军、将死、困毙、吃子与悔棋',
    descriptionEn: 'Traditional Xiangqi with check detection, mate logic, and full undo replay',
    iconName: 'Castle',
    color: '#EF4444',
    href: '/games/chess-chinese',
    category: 'strategy',
    updatedAt: '2026-03-20',
  },
  {
    slug: 'freecell',
    name: '空当接龙',
    nameEn: 'FreeCell',
    description: '经典单人纸牌空当接龙，支持空位多牌连续移动与悔棋',
    descriptionEn: 'Classic FreeCell solitaire supporting multi-card sequence moves and undo',
    iconName: 'Spade',
    color: '#3B82F6',
    href: '/games/freecell',
    category: 'card',
    updatedAt: '2026-03-20',
  },
]

export function getAllGames(): GameInfo[] {
  return GAMES
}

export function getGameBySlug(slug: string): GameInfo | undefined {
  return GAMES.find(g => g.slug === slug)
}
