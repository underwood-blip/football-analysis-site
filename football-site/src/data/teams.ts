export const TEAMS = [
  { id: 'ARS', name: 'Arsenal', short: 'ARS' },
  { id: 'AVL', name: 'Aston Villa', short: 'AVL' },
  { id: 'BOU', name: 'Bournemouth', short: 'BOU' },
  { id: 'BRE', name: 'Brentford', short: 'BRE' },
  { id: 'BHA', name: 'Brighton', short: 'BHA' },
  { id: 'CHE', name: 'Chelsea', short: 'CHE' },
  { id: 'COV', name: 'Coventry', short: 'COV' },
  { id: 'CRY', name: 'Crystal Palace', short: 'CRY' },
  { id: 'EVE', name: 'Everton', short: 'EVE' },
  { id: 'FUL', name: 'Fulham', short: 'FUL' },
  { id: 'HUL', name: 'Hull', short: 'HUL' },
  { id: 'IPS', name: 'Ipswich', short: 'IPS' },
  { id: 'LEE', name: 'Leeds', short: 'LEE' },
  { id: 'LIV', name: 'Liverpool', short: 'LIV' },
  { id: 'MCI', name: 'Man City', short: 'MCI' },
  { id: 'MUN', name: 'Man United', short: 'MUN' },
  { id: 'NEW', name: 'Newcastle', short: 'NEW' },
  { id: 'NFO', name: "Nott'm Forest", short: 'NFO' },
  { id: 'SUN', name: 'Southampton', short: 'SUN' },
  { id: 'TOT', name: 'Tottenham', short: 'TOT' },
] as const

export const NAME_TO_ID: Record<string, string> = {
  'Arsenal': 'ARS', 'Aston Villa': 'AVL', 'Bournemouth': 'BOU',
  'Brentford': 'BRE', 'Brighton': 'BHA', 'Chelsea': 'CHE',
  'Coventry': 'COV', 'Crystal Palace': 'CRY', 'Everton': 'EVE',
  'Fulham': 'FUL', 'Hull': 'HUL', 'Ipswich': 'IPS',
  'Leeds': 'LEE', 'Liverpool': 'LIV', 'Man City': 'MCI',
  'Man United': 'MUN', 'Newcastle': 'NEW', "Nott'm Forest": 'NFO',
  'Southampton': 'SUN', 'Tottenham': 'TOT',
}

export const VENUES: Record<string, string> = {
  ARS: 'Emirates Stadium', AVL: 'Villa Park', BOU: 'Vitality Stadium',
  BRE: 'Gtech Community Stadium', BHA: 'American Express Stadium',
  CHE: 'Stamford Bridge', COV: 'Coventry Building Society Arena',
  CRY: 'Selhurst Park', EVE: 'Hill Dickinson Stadium',
  FUL: 'Craven Cottage', HUL: 'MKM Stadium', IPS: 'Portman Road',
  LEE: 'Elland Road', LIV: 'Anfield', MCI: 'Etihad Stadium',
  MUN: 'Old Trafford', NEW: "St James' Park", NFO: 'The City Ground',
  SUN: 'Stadium of Light', TOT: 'Tottenham Hotspur Stadium',
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
