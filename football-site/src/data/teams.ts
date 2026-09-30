export const TEAMS = [
  { id: 'ARS', name: 'Arsenal', short: 'ARS', cn: '阿森纳' },
  { id: 'AVL', name: 'Aston Villa', short: 'AVL', cn: '阿斯顿维拉' },
  { id: 'BOU', name: 'AFC Bournemouth', short: 'BOU', cn: '伯恩茅斯' },
  { id: 'BRE', name: 'Brentford', short: 'BRE', cn: '布伦特福德' },
  { id: 'BHA', name: 'Brighton Hove Albion', short: 'BHA', cn: '布莱顿' },
  { id: 'CHE', name: 'Chelsea', short: 'CHE', cn: '切尔西' },
  { id: 'CRY', name: 'Crystal Palace', short: 'CRY', cn: '水晶宫' },
  { id: 'EVE', name: 'Everton', short: 'EVE', cn: '埃弗顿' },
  { id: 'FUL', name: 'Fulham', short: 'FUL', cn: '富勒姆' },
  { id: 'HUL', name: 'Hull City', short: 'HUL', cn: '赫尔城' },
  { id: 'IPS', name: 'Ipswich Town', short: 'IPS', cn: '伊普斯维奇' },
  { id: 'LEEDS', name: 'Leeds United', short: 'LEEDS', cn: '利兹联' },
  { id: 'LIV', name: 'Liverpool', short: 'LIV', cn: '利物浦' },
  { id: 'MCI', name: 'Manchester City', short: 'MCI', cn: '曼城' },
  { id: 'MUN', name: 'Manchester United', short: 'MUN', cn: '曼联' },
  { id: 'NEW', name: 'Newcastle United', short: 'NEW', cn: '纽卡斯尔' },
  { id: 'NFO', name: 'Nottingham Forest', short: 'NFO', cn: '诺丁汉森林' },
  { id: 'COV', name: 'Coventry City', short: 'COV', cn: '考文垂' },
  { id: 'SUN', name: 'Sunderland', short: 'SUN', cn: '桑德兰' },
  { id: 'TOT', name: 'Tottenham Hotspur', short: 'TOT', cn: '热刺' },
] as const

export const NAME_TO_ID: Record<string, string> = {
  'Arsenal': 'ARS', 'Aston Villa': 'AVL', 'AFC Bournemouth': 'BOU',
  'Brentford': 'BRE', 'Brighton Hove Albion': 'BHA', 'Chelsea': 'CHE',
  'Crystal Palace': 'CRY', 'Everton': 'EVE',
  'Fulham': 'FUL', 'Hull City': 'HUL', 'Ipswich Town': 'IPS',
  'Leeds United': 'LEEDS', 'Liverpool': 'LIV', 'Manchester City': 'MCI',
  'Manchester United': 'MUN', 'Newcastle United': 'NEW', 'Nottingham Forest': 'NFO',
  'Coventry City': 'COV', 'Sunderland': 'SUN', 'Tottenham Hotspur': 'TOT',
  '阿森纳': 'ARS', '阿斯顿维拉': 'AVL', '伯恩茅斯': 'BOU',
  '布伦特福德': 'BRE', '布莱顿': 'BHA', '切尔西': 'CHE',
  '水晶宫': 'CRY', '埃弗顿': 'EVE',
  '富勒姆': 'FUL', '赫尔城': 'HUL', '伊普斯维奇': 'IPS',
  '利兹联': 'LEEDS', '利物浦': 'LIV', '曼城': 'MCI',
  '曼联': 'MUN', '纽卡斯尔': 'NEW', '诺丁汉森林': 'NFO',
  '考文垂': 'COV', '桑德兰': 'SUN', '热刺': 'TOT',
}

export const VENUES: Record<string, string> = {
  ARS: 'Emirates Stadium', AVL: 'Villa Park', BOU: 'Vitality Stadium',
  BRE: 'Gtech Community Stadium', BHA: 'American Express Stadium',
  CHE: 'Stamford Bridge', CRY: 'Selhurst Park', EVE: 'Goodison Park',
  FUL: 'Craven Cottage', HUL: 'MKM Stadium', IPS: 'Portman Road',
  LEEDS: 'Elland Road', LIV: 'Anfield', MCI: 'Etihad Stadium',
  MUN: 'Old Trafford', NEW: "St James' Park", NFO: 'The City Ground',
  COV: 'Cox Plate Stadium', SUN: 'Stadium of Light', TOT: 'Tottenham Hotspur Stadium',
}

export const SEASON_WEIGHTS: Record<string, number> = {
  '2627': 1.0, '2526': 0.78, '2425': 0.61, '2324': 0.48,
  '2223': 0.37, '2122': 0.29, '2021': 0.23, '1920': 0.18,
  '1819': 0.14, '1718': 0.11,
}

export const PRIOR_GAMES = 6
export const HOME_ADVANTAGE = 1.12
export const DRAW_INFLATION = 1.08
export const MAX_GOALS = 8
export const CONFIDENCE_CAP = 0.78
export const DISPLAY_MARGIN = 1.06
