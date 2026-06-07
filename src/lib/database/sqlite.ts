import Database from 'better-sqlite3';
import { IDatabase, Team, Participant, Competition, Admin } from './types';
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
        description TEXT,
        pointsValue INTEGER DEFAULT 0,
        isCompleted INTEGER DEFAULT 0,
        winnerTeamId TEXT,
        FOREIGN KEY (winnerTeamId) REFERENCES teams(id)
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
        passwordHash TEXT NOT NULL
      );
    `);

    // Migração: Renomear coluna password para passwordHash se existir
    const tableInfo = this.db.prepare("PRAGMA table_info(admins)").all() as any[];
    const hasOldPasswordColumn = tableInfo.some(col => col.name === 'password');
    const hasNewPasswordColumn = tableInfo.some(col => col.name === 'passwordHash');

    if (hasOldPasswordColumn && !hasNewPasswordColumn) {
      this.db.exec("ALTER TABLE admins RENAME COLUMN password TO passwordHash");
    }
  }

  async getAdminByUsername(username: string): Promise<Admin | null> {
    const admin = this.db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
    return (admin as Admin) || null;
  }

  async getAdminById(id: string): Promise<Admin | null> {
    const admin = this.db.prepare('SELECT * FROM admins WHERE id = ?').get(id);
    return (admin as Admin) || null;
  }

  async getAdmins(): Promise<Admin[]> {
    return this.db.prepare('SELECT id, username, passwordHash FROM admins ORDER BY username').all() as Admin[];
  }

  async createAdmin(username: string, passwordHash: string): Promise<Admin> {
    const id = crypto.randomUUID();
    this.db.prepare('INSERT INTO admins (id, username, passwordHash) VALUES (?, ?, ?)').run(id, username, passwordHash);
    return { id, username, passwordHash };
  }

  async updateAdmin(id: string, data: { username?: string; passwordHash?: string }): Promise<void> {
    if (data.username && data.passwordHash) {
      this.db.prepare('UPDATE admins SET username = ?, passwordHash = ? WHERE id = ?').run(data.username, data.passwordHash, id);
    } else if (data.username) {
      this.db.prepare('UPDATE admins SET username = ? WHERE id = ?').run(data.username, id);
    } else if (data.passwordHash) {
      this.db.prepare('UPDATE admins SET passwordHash = ? WHERE id = ?').run(data.passwordHash, id);
    }
  }

  async deleteAdmin(id: string): Promise<void> {
    this.db.prepare('DELETE FROM admins WHERE id = ?').run(id);
  }

  async getTeams(): Promise<Team[]> {
    return this.db.prepare('SELECT * FROM teams ORDER BY name').all() as Team[];
  }

  async createTeam(name: string): Promise<Team> {
    const id = crypto.randomUUID();
    this.db.prepare('INSERT INTO teams (id, name) VALUES (?, ?)').run(id, name);
    return { id, name, points: 0 };
  }

  async updateTeam(id: string, name: string): Promise<void> {
    this.db.prepare('UPDATE teams SET name = ? WHERE id = ?').run(name, id);
  }

  async deleteTeam(id: string): Promise<void> {
    const deleteTx = this.db.transaction(() => {
      // Remover pontos relacionados, participantes ou apenas impedir se houver dependências?
      // Por simplicidade e segurança de dados, vamos apenas deletar a equipe.
      // SQL Foreign Keys cuidariam de impedir se não fosse cascade, mas vamos garantir.
      this.db.prepare('DELETE FROM points_history WHERE teamId = ?').run(id);
      this.db.prepare('DELETE FROM participants WHERE teamId = ?').run(id);
      this.db.prepare('DELETE FROM teams WHERE id = ?').run(id);
    });
    deleteTx();
  }

  async getParticipants(): Promise<Participant[]> {
    return this.db.prepare('SELECT * FROM participants ORDER BY name').all() as Participant[];
  }

  async createParticipant(name: string, teamId: string): Promise<Participant> {
    const id = crypto.randomUUID();
    this.db.prepare('INSERT INTO participants (id, name, teamId) VALUES (?, ?, ?)').run(id, name, teamId);
    return { id, name, teamId, points: 0 };
  }

  async updateParticipant(id: string, name: string, teamId: string): Promise<void> {
    this.db.prepare('UPDATE participants SET name = ?, teamId = ? WHERE id = ?').run(name, teamId, id);
  }

  async deleteParticipant(id: string): Promise<void> {
    const deleteTx = this.db.transaction(() => {
      this.db.prepare('DELETE FROM points_history WHERE participantId = ?').run(id);
      this.db.prepare('DELETE FROM participants WHERE id = ?').run(id);
    });
    deleteTx();
  }

  async getCompetitions(): Promise<Competition[]> {
    const rows = this.db.prepare('SELECT * FROM competitions').all() as any[];
    return rows.map(row => ({
      ...row,
      isCompleted: Boolean(row.isCompleted)
    }));
  }

  async createCompetition(name: string, description?: string, pointsValue: number = 0): Promise<Competition> {
    const id = crypto.randomUUID();
    this.db.prepare('INSERT INTO competitions (id, name, description, pointsValue) VALUES (?, ?, ?, ?)').run(id, name, description || null, pointsValue);
    return { id, name, description, pointsValue, isCompleted: false };
  }

  async updateCompetition(id: string, name: string, description?: string, pointsValue?: number, isCompleted?: boolean, winnerTeamId?: string): Promise<void> {
    this.db.prepare(`
      UPDATE competitions 
      SET name = ?, 
          description = ?, 
          pointsValue = ?, 
          isCompleted = ?, 
          winnerTeamId = ? 
      WHERE id = ?
    `).run(
      name, 
      description || null, 
      pointsValue ?? 0, 
      isCompleted ? 1 : 0, 
      winnerTeamId || null, 
      id
    );
  }

  async deleteCompetition(id: string): Promise<void> {
    this.db.prepare('DELETE FROM points_history WHERE competitionId = ?').run(id);
    this.db.prepare('DELETE FROM competitions WHERE id = ?').run(id);
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

  async getPointsHistory(filters: { teamId?: string; participantId?: string }): Promise<PointRecord[]> {
    let query = 'SELECT * FROM points_history WHERE 1=1';
    const params: any[] = [];

    if (filters.teamId) {
      query += ' AND teamId = ?';
      params.push(filters.teamId);
    }
    if (filters.participantId) {
      query += ' AND participantId = ?';
      params.push(filters.participantId);
    }

    query += ' ORDER BY createdAt DESC';
    return this.db.prepare(query).all(...params) as PointRecord[];
  }

  async updatePoints(id: string, points: number, description: string): Promise<void> {
    const transaction = this.db.transaction(() => {
      const oldRecord = this.db.prepare('SELECT * FROM points_history WHERE id = ?').get(id) as PointRecord;
      if (!oldRecord) return;

      const diff = points - oldRecord.points;

      // Update team points if applicable
      if (oldRecord.teamId) {
        this.db.prepare('UPDATE teams SET points = points + ? WHERE id = ?').run(diff, oldRecord.teamId);
      }
      
      // Update participant points if applicable
      if (oldRecord.participantId) {
        this.db.prepare('UPDATE participants SET points = points + ? WHERE id = ?').run(diff, oldRecord.participantId);
        
        // If participant point change, ensure team total is also updated (already done above if teamId exists)
        // Note: our addPoints logic adds to BOTH if participantId is present.
        if (!oldRecord.teamId) {
            const p = this.db.prepare('SELECT teamId FROM participants WHERE id = ?').get(oldRecord.participantId) as { teamId: string };
            if (p) this.db.prepare('UPDATE teams SET points = points + ? WHERE id = ?').run(diff, p.teamId);
        }
      }

      this.db.prepare('UPDATE points_history SET points = ?, description = ? WHERE id = ?').run(points, description, id);
    });

    transaction();
  }

  async deletePoints(id: string): Promise<void> {
    const transaction = this.db.transaction(() => {
      const oldRecord = this.db.prepare('SELECT * FROM points_history WHERE id = ?').get(id) as PointRecord;
      if (!oldRecord) return;

      const pointsToSubtract = oldRecord.points;

      if (oldRecord.teamId) {
        this.db.prepare('UPDATE teams SET points = points - ? WHERE id = ?').run(pointsToSubtract, oldRecord.teamId);
      }
      
      if (oldRecord.participantId) {
        this.db.prepare('UPDATE participants SET points = points - ? WHERE id = ?').run(pointsToSubtract, oldRecord.participantId);
        
        if (!oldRecord.teamId) {
            const p = this.db.prepare('SELECT teamId FROM participants WHERE id = ?').get(oldRecord.participantId) as { teamId: string };
            if (p) this.db.prepare('UPDATE teams SET points = points - ? WHERE id = ?').run(pointsToSubtract, p.teamId);
        }
      }

      this.db.prepare('DELETE FROM points_history WHERE id = ?').run(id);
    });

    transaction();
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
