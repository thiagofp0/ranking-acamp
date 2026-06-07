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

export async function updateTeamAction(id: string, name: string) {
  await db.updateTeam(id, name);
  revalidatePath("/admin/equipes");
  revalidatePath("/");
}

export async function deleteTeamAction(id: string) {
  await db.deleteTeam(id);
  revalidatePath("/admin/equipes");
  revalidatePath("/");
}

export async function createParticipant(name: string, teamId: string) {
  await db.createParticipant(name, teamId);
  revalidatePath("/admin/participantes");
}

export async function updateParticipantAction(id: string, name: string, teamId: string) {
  await db.updateParticipant(id, name, teamId);
  revalidatePath("/admin/participantes");
  revalidatePath("/");
}

export async function deleteParticipantAction(id: string) {
  await db.deleteParticipant(id);
  revalidatePath("/admin/participantes");
  revalidatePath("/");
}

export async function createCompetition(name: string, description?: string, pointsValue: number = 0) {
  await db.createCompetition(name, description, pointsValue);
  revalidatePath("/admin/provas");
  revalidatePath("/");
}
export async function updateCompetitionAction(
  id: string, 
  name: string, 
  description?: string, 
  pointsValue?: number, 
  isCompleted?: boolean, 
  winnerTeamId?: string
) {
  await db.updateCompetition(id, name, description, pointsValue, isCompleted, winnerTeamId);
  revalidatePath("/admin/provas");
  revalidatePath("/");
}

export async function deleteCompetitionAction(id: string) {
  await db.deleteCompetition(id);
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

export async function getAllPointsHistory() {
  return await db.getPointsHistory({});
}

export async function getPointsHistory(filters: { teamId?: string; participantId?: string }) {
  return await db.getPointsHistory(filters);
}

export async function updatePointsAction(id: string, points: number, description: string, revalidatePathStr: string) {
  await db.updatePoints(id, points, description);
  revalidatePath(revalidatePathStr);
  revalidatePath("/");
}

export async function deletePointsAction(id: string, revalidatePathStr: string) {
  await db.deletePoints(id);
  revalidatePath(revalidatePathStr);
  revalidatePath("/");
}
