import { getDatabase } from "@/lib/database/sqlite";

export async function getTeamRanking() {
  const db = getDatabase();
  return await db.getTeamRanking();
}

export async function getParticipantRanking() {
  const db = getDatabase();
  return await db.getParticipantRanking();
}
