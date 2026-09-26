import type { TeamId } from "./types";

export const HOME_VENUES: Partial<Record<TeamId, string>> = {
  ARS: "Emirates Stadium",
  AVL: "Villa Park",
  BOU: "Vitality Stadium",
  BRE: "Gtech Community Stadium",
  BHA: "American Express Stadium",
  CHE: "Stamford Bridge",
  COV: "Coventry Building Society Arena",
  CRY: "Selhurst Park",
  EVE: "Hill Dickinson Stadium",
  FUL: "Craven Cottage",
  HUL: "MKM Stadium",
  IPS: "Portman Road",
  LEE: "Elland Road",
  LIV: "Anfield",
  MCI: "Etihad Stadium",
  MUN: "Old Trafford",
  NEW: "St James' Park",
  NFO: "The City Ground",
  SUN: "Stadium of Light",
  TOT: "Tottenham Hotspur Stadium",
};

export function venueOf(id: TeamId): string | undefined {
  return HOME_VENUES[id];
}
