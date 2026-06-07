import Database from 'better-sqlite3';
import { IDatabase, Team, Participant, Competition } from './types';
import path from 'path';

export class SQLiteDatabase implements IDatabase {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(process.cwd(), 'ranking.db');
    this.db = new Database(dbPath);
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        points INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS participants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        teamId TEXT NOT NULL,
        points INTEGER DEFAULT 0,
        FOREIGN KEY (teamId) REFERENCES teams(id)
      );

      CREATE TABLE IF NOT EXISTS competitions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS points_history (
        id TEXT PRIMARY KEY,
        teamId TEXT,
        participantId TEXT,
        competitionId TEXT,
        points INTEGER NOT NULL,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teamId) REFERENCES teams(id),
        FOREIGN KEY (participantId) REFERENCES participants(id),
        FOREIGN KEY (competitionId) REFERENCES competitions(id)
      );

      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);
  }

  async getTeams(): Promise<Team[]> {
    return this.db.prepare('SELECT * FROM teams ORDER BY name').all() as Team[];
  }

  async createTeam(name: string): Promise<Team> {
    const id = crypto.randomUUID();
    this.db.prepare('INSERT INTO teams (id, name) VALUES (?, ?)').run(id, name);
    return { id, name, points: 0 };
  }

  async getParticipants(): Promise<Participant[]> {
    return this.db.prepare('SELECT * FROM participants ORDER BY name').all() as Participant[];
  }

  async createParticipant(name: string, teamId: string): Promise<Participant> {
    const id = crypto.randomUUID();
    this.db.prepare('INSERT INTO participants (id, name, teamId) VALUES (?, ?, ?)').run(id, name, teamId);
    return { id, name, teamId, points: 0 };
  }

  async getCompetitions(): Promise<Competition[]> {
    return this.db.prepare('SELECT * FROM competitions').all() as Competition[];
  }

  async createCompetition(name: string, description?: string): Promise<Competition> {
    const id = crypto.randomUUID();
    this.db.prepare('INSERT INTO competitions (id, name, description) VALUES (?, ?, ?)').run(id, name, description);
    return { id, name, description };
  }

  async addPoints(data: {
    teamId?: string;
    participantId?: string;
    competitionId?: string;
    points: number;
    description: string;
  }): Promise<void> {
    const id = crypto.randomUUID();
    
    const insertHistory = this.db.transaction(() => {
      this.db.prepare(`
        INSERT INTO points_history (id, teamId, participantId, competitionId, points, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, data.teamId || null, data.participantId || null, data.competitionId || null, data.points, data.description);

      if (data.participantId) {
        // Points for participant also go to the team
        this.db.prepare('UPDATE participants SET points = points + ? WHERE id = ?').run(data.points, data.participantId);
        
        const participant = this.db.prepare('SELECT teamId FROM participants WHERE id = ?').get(data.participantId) as { teamId: string };
        if (participant) {
            this.db.prepare('UPDATE teams SET points = points + ? WHERE id = ?').run(data.points, participant.teamId);
        }
      } else if (data.teamId) {
        // Points only for the team
        this.db.prepare('UPDATE teams SET points = points + ? WHERE id = ?').run(data.points, data.teamId);
      }
    });

    insertHistory();
  }

  async getTeamRanking(): Promise<Team[]> {
    return this.db.prepare('SELECT * FROM teams ORDER BY points DESC, name ASC').all() as Team[];
  }

  async getParticipantRanking(): Promise<Participant[]> {
    return this.db.prepare('SELECT * FROM participants ORDER BY points DESC, name ASC').all() as Participant[];
  }
}

// Singleton instance
let dbInstance: IDatabase | null = null;

export function getDatabase(): IDatabase {
  if (!dbInstance) {
    dbInstance = new SQLiteDatabase();
  }
  return dbInstance;
}
