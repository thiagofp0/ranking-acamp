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
  
  // Participants
  getParticipants(): Promise<Participant[]>;
  createParticipant(name: string, teamId: string): Promise<Participant>;
  
  // Competitions
  getCompetitions(): Promise<Competition[]>;
  createCompetition(name: string, description?: string): Promise<Competition>;
  
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
}
