import { getDatabase } from "./database/sqlite";
import { revalidatePath } from "next/cache";

const db = getDatabase();

export async function createTeam(name: string) {
  await db.createTeam(name);
  revalidatePath("/admin/equipes");
}

export async function createParticipant(name: string, teamId: string) {
  await db.createParticipant(name, teamId);
  revalidatePath("/admin/participantes");
}

export async function createCompetition(name: string, description?: string) {
  await db.createCompetition(name, description);
  revalidatePath("/admin/provas");
}

export async function addPointsAction(data: {
  teamId?: string;
  participantId?: string;
  competitionId?: string;
  points: number;
  description: string;
}) {
  await db.addPoints(data);
  revalidatePath("/admin/pontos");
  revalidatePath("/");
}

export async function getTeams() {
  return await db.getTeams();
}

export async function getParticipants() {
  return await db.getParticipants();
}

export async function getCompetitions() {
  return await db.getCompetitions();
}
