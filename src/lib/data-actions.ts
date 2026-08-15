"use server";

import { getDatabase } from "./database/sqlite";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getSession } from "./auth";

const db = getDatabase();

async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("Não autorizado.");
  }
  return session;
}

async function logAction(
  session: { userId: string; username: string },
  actionType: string,
  description: string,
  target?: { type: string; id: string }
) {
  await db.createAuditLog({
    actionType,
    performedBy: session.userId,
    performedByUsername: session.username,
    targetType: target?.type,
    targetId: target?.id,
    description,
  });
}

export async function getAdmins() {
  return await db.getAdmins();
}

export async function createAdminAction(username: string, pass: string) {
  const session = await requireSession();
  const passwordHash = await bcrypt.hash(pass, 10);
  await db.createAdmin(username, passwordHash);
  await logAction(session, "admin_created", `Administrador "${username}" criado`);
  revalidatePath("/admin/usuarios");
}

export async function updateAdminAction(id: string, username?: string, pass?: string) {
  const session = await requireSession();
  const data: { username?: string; passwordHash?: string } = {};
  if (username) data.username = username;
  if (pass) data.passwordHash = await bcrypt.hash(pass, 10);

  await db.updateAdmin(id, data);
  const changes = [username && "usuário", pass && "senha"].filter(Boolean).join(" e ");
  await logAction(session, "admin_updated", `Administrador atualizado (${changes})`, { type: "admin", id });
  revalidatePath("/admin/usuarios");
}

export async function deleteAdminAction(id: string) {
  const session = await requireSession();
  await db.deleteAdmin(id);
  await logAction(session, "admin_deleted", "Administrador excluído", { type: "admin", id });
  revalidatePath("/admin/usuarios");
}

export async function createTeam(name: string) {
  const session = await requireSession();
  const team = await db.createTeam(name);
  await logAction(session, "team_created", `Equipe "${name}" criada`, { type: "team", id: team.id });
  revalidatePath("/admin/equipes");
}

export async function updateTeamAction(id: string, name: string) {
  const session = await requireSession();
  await db.updateTeam(id, name);
  await logAction(session, "team_updated", `Equipe "${name}" atualizada`, { type: "team", id });
  revalidatePath("/admin/equipes");
  revalidatePath("/");
}

export async function deleteTeamAction(id: string) {
  const session = await requireSession();
  await db.deleteTeam(id);
  await logAction(session, "team_deleted", "Equipe excluída", { type: "team", id });
  revalidatePath("/admin/equipes");
  revalidatePath("/");
}

export async function createParticipant(name: string, teamId: string, isLeader: boolean = false) {
  const session = await requireSession();
  const participant = await db.createParticipant(name, teamId, isLeader);
  await logAction(session, "participant_created", `Participante "${name}" criado${isLeader ? " (líder)" : ""}`, { type: "participant", id: participant.id });
  revalidatePath("/admin/participantes");
}

export async function updateParticipantAction(id: string, name: string, teamId: string, isLeader: boolean = false) {
  const session = await requireSession();
  await db.updateParticipant(id, name, teamId, isLeader);
  await logAction(session, "participant_updated", `Participante "${name}" atualizado${isLeader ? " (líder)" : ""}`, { type: "participant", id });
  revalidatePath("/admin/participantes");
  revalidatePath("/");
}

export async function deleteParticipantAction(id: string) {
  const session = await requireSession();
  await db.deleteParticipant(id);
  await logAction(session, "participant_deleted", "Participante excluído", { type: "participant", id });
  revalidatePath("/admin/participantes");
  revalidatePath("/");
}

export async function createCompetition(name: string, description?: string, pointsValue: number = 0) {
  const session = await requireSession();
  const competition = await db.createCompetition(name, description, pointsValue);
  await logAction(session, "competition_created", `Prova "${name}" criada`, { type: "competition", id: competition.id });
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
  const session = await requireSession();
  await db.updateCompetition(id, name, description, pointsValue, isCompleted, winnerTeamId);
  await logAction(session, "competition_updated", `Prova "${name}" atualizada`, { type: "competition", id });
  revalidatePath("/admin/provas");
  revalidatePath("/");
}

export async function deleteCompetitionAction(id: string) {
  const session = await requireSession();
  await db.deleteCompetition(id);
  await logAction(session, "competition_deleted", "Prova excluída", { type: "competition", id });
  revalidatePath("/admin/provas");
}
export async function addPointsAction(data: {
  teamId?: string;
  participantId?: string;
  competitionId?: string;
  points: number;
  description: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireSession();
    await db.addPoints(data);

    let targetLabel = "";
    if (data.participantId) {
      const participant = (await db.getParticipants()).find(p => p.id === data.participantId);
      targetLabel = participant ? `participante "${participant.name}"` : "participante";
    } else if (data.teamId) {
      const team = (await db.getTeams()).find(t => t.id === data.teamId);
      targetLabel = team ? `equipe "${team.name}"` : "equipe";
    }
    await logAction(
      session,
      "points_added",
      `${data.points} ponto(s) lançados para ${targetLabel}: ${data.description}`,
      data.participantId
        ? { type: "participant", id: data.participantId }
        : data.teamId
        ? { type: "team", id: data.teamId }
        : undefined
    );

    revalidatePath("/admin/pontos");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao lançar pontos." };
  }
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
  const session = await requireSession();
  await db.updatePoints(id, points, description);
  await logAction(session, "points_updated", `Lançamento de pontos atualizado: ${points} - ${description}`, { type: "points", id });
  revalidatePath(revalidatePathStr);
  revalidatePath("/");
}

export async function deletePointsAction(id: string, revalidatePathStr: string) {
  const session = await requireSession();
  await db.deletePoints(id);
  await logAction(session, "points_deleted", "Lançamento de pontos excluído", { type: "points", id });
  revalidatePath(revalidatePathStr);
  revalidatePath("/");
}

export async function getAuditLogs(filters: { actionType?: string; userId?: string; from?: string; to?: string; page?: number; pageSize?: number }) {
  await requireSession();
  return await db.getAuditLogs(filters);
}
