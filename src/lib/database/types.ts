export interface Team {
  id: string;
  name: string;
  points: number;
}

export interface Participant {
  id: string;
  name: string;
  teamId: string;
  points: number;
}

export interface Competition {
  id: string;
  name: string;
  description?: string;
  pointsValue: number;
  isCompleted: boolean;
  winnerTeamId?: string;
}

export interface Admin {
  id: string;
  username: string;
  passwordHash: string;
}

export interface PointRecord {
  id: string;
  teamId?: string;
  participantId?: string;
  competitionId?: string;
  points: number;
  description: string;
  createdAt: string;
}

export interface IDatabase {
  // Admins
  getAdmins(): Promise<Admin[]>;
  getAdminByUsername(username: string): Promise<Admin | null>;
  getAdminById(id: string): Promise<Admin | null>;
  createAdmin(username: string, passwordHash: string): Promise<Admin>;
  updateAdmin(id: string, data: { username?: string; passwordHash?: string }): Promise<void>;
  deleteAdmin(id: string): Promise<void>;

  // Teams
  getTeams(): Promise<Team[]>;
  createTeam(name: string): Promise<Team>;
  updateTeam(id: string, name: string): Promise<void>;
  deleteTeam(id: string): Promise<void>;
  
  // Participants
  getParticipants(): Promise<Participant[]>;
  createParticipant(name: string, teamId: string): Promise<Participant>;
  updateParticipant(id: string, name: string, teamId: string): Promise<void>;
  deleteParticipant(id: string): Promise<void>;
  
  // Competitions
  getCompetitions(): Promise<Competition[]>;
  createCompetition(name: string, description?: string): Promise<Competition>;
  updateCompetition(id: string, name: string, description?: string): Promise<void>;
  deleteCompetition(id: string): Promise<void>;
  
  // Scoring
  addPoints(data: {
    teamId?: string;
    participantId?: string;
    competitionId?: string;
    points: number;
    description: string;
  }): Promise<void>;
  
  // Rankings
  getTeamRanking(): Promise<Team[]>;
  getParticipantRanking(): Promise<Participant[]>;

  // Points Details
  getPointsHistory(filters: { teamId?: string; participantId?: string }): Promise<PointRecord[]>;
  updatePoints(id: string, points: number, description: string): Promise<void>;
  deletePoints(id: string): Promise<void>;
}
