import { getDatabase } from "./database/sqlite";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

const db = getDatabase();

export async function getAdmins() {
  return await db.getAdmins();
}

export async function createAdminAction(username: string, pass: string) {
  const passwordHash = await bcrypt.hash(pass, 10);
  await db.createAdmin(username, passwordHash);
  revalidatePath("/admin/usuarios");
}

export async function updateAdminAction(id: string, username?: string, pass?: string) {
  const data: { username?: string; passwordHash?: string } = {};
  if (username) data.username = username;
  if (pass) data.passwordHash = await bcrypt.hash(pass, 10);
  
  await db.updateAdmin(id, data);
  revalidatePath("/admin/usuarios");
}

export async function deleteAdminAction(id: string) {
  await db.deleteAdmin(id);
  revalidatePath("/admin/usuarios");
}

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
