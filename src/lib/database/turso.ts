import { createClient, Client } from '@libsql/client';
import { IDatabase, Team, Participant, Competition, Admin, PointRecord } from './types';

export class TursoDatabase implements IDatabase {
  private client: Client;

  constructor() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      throw new Error('TURSO_DATABASE_URL is not defined');
    }

    this.client = createClient({
      url,
      authToken,
    });
    
    // As tabelas devem ser criadas via Turso CLI ou dashboard para persistência real,
    // mas deixaremos a lógica de inicialização aqui caso precise rodar localmente no futuro.
    this.init();
  }

  private async init() {
    try {
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS teams (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          points INTEGER DEFAULT 0
        );
      `);
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS participants (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          teamId TEXT NOT NULL,
          points INTEGER DEFAULT 0,
          FOREIGN KEY (teamId) REFERENCES teams(id)
        );
      `);
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS competitions (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          pointsValue INTEGER DEFAULT 0,
          isCompleted INTEGER DEFAULT 0,
          winnerTeamId TEXT,
          FOREIGN KEY (winnerTeamId) REFERENCES teams(id)
        );
      `);
      await this.client.execute(`
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
      `);
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS admins (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          passwordHash TEXT NOT NULL
        );
      `);
    } catch (e) {
      console.error('Erro ao inicializar tabelas do Turso:', e);
    }
  }

  async getAdminByUsername(username: string): Promise<Admin | null> {
    const rs = await this.client.execute({
      sql: 'SELECT * FROM admins WHERE username = ?',
      args: [username]
    });
    return rs.rows[0] ? (rs.rows[0] as unknown as Admin) : null;
  }

  async getAdminById(id: string): Promise<Admin | null> {
    const rs = await this.client.execute({
      sql: 'SELECT * FROM admins WHERE id = ?',
      args: [id]
    });
    return rs.rows[0] ? (rs.rows[0] as unknown as Admin) : null;
  }

  async getAdmins(): Promise<Admin[]> {
    const rs = await this.client.execute('SELECT id, username, passwordHash FROM admins ORDER BY username');
    return rs.rows as unknown as Admin[];
  }

  async createAdmin(username: string, passwordHash: string): Promise<Admin> {
    const id = crypto.randomUUID();
    await this.client.execute({
      sql: 'INSERT INTO admins (id, username, passwordHash) VALUES (?, ?, ?)',
      args: [id, username, passwordHash]
    });
    return { id, username, passwordHash };
  }

  async updateAdmin(id: string, data: { username?: string; passwordHash?: string }): Promise<void> {
    if (data.username && data.passwordHash) {
      await this.client.execute({
        sql: 'UPDATE admins SET username = ?, passwordHash = ? WHERE id = ?',
        args: [data.username, data.passwordHash, id]
      });
    } else if (data.username) {
      await this.client.execute({
        sql: 'UPDATE admins SET username = ? WHERE id = ?',
        args: [data.username, id]
      });
    } else if (data.passwordHash) {
      await this.client.execute({
        sql: 'UPDATE admins SET passwordHash = ? WHERE id = ?',
        args: [data.passwordHash, id]
      });
    }
  }

  async deleteAdmin(id: string): Promise<void> {
    await this.client.execute({
      sql: 'DELETE FROM admins WHERE id = ?',
      args: [id]
    });
  }

  async getTeams(): Promise<Team[]> {
    const rs = await this.client.execute('SELECT * FROM teams ORDER BY name');
    return rs.rows as unknown as Team[];
  }

  async createTeam(name: string): Promise<Team> {
    const id = crypto.randomUUID();
    await this.client.execute({
      sql: 'INSERT INTO teams (id, name) VALUES (?, ?)',
      args: [id, name]
    });
    return { id, name, points: 0 };
  }

  async updateTeam(id: string, name: string): Promise<void> {
    await this.client.execute({
      sql: 'UPDATE teams SET name = ? WHERE id = ?',
      args: [name, id]
    });
  }

  async deleteTeam(id: string): Promise<void> {
    await this.client.batch([
      { sql: 'DELETE FROM points_history WHERE teamId = ?', args: [id] },
      { sql: 'DELETE FROM participants WHERE teamId = ?', args: [id] },
      { sql: 'DELETE FROM teams WHERE id = ?', args: [id] }
    ], 'write');
  }

  async getParticipants(): Promise<Participant[]> {
    const rs = await this.client.execute('SELECT * FROM participants ORDER BY name');
    return rs.rows as unknown as Participant[];
  }

  async createParticipant(name: string, teamId: string): Promise<Participant> {
    const id = crypto.randomUUID();
    await this.client.execute({
      sql: 'INSERT INTO participants (id, name, teamId) VALUES (?, ?, ?)',
      args: [id, name, teamId]
    });
    return { id, name, teamId, points: 0 };
  }

  async updateParticipant(id: string, name: string, teamId: string): Promise<void> {
    await this.client.execute({
      sql: 'UPDATE participants SET name = ?, teamId = ? WHERE id = ?',
      args: [name, teamId, id]
    });
  }

  async deleteParticipant(id: string): Promise<void> {
    await this.client.batch([
      { sql: 'DELETE FROM points_history WHERE participantId = ?', args: [id] },
      { sql: 'DELETE FROM participants WHERE id = ?', args: [id] }
    ], 'write');
  }

  async getCompetitions(): Promise<Competition[]> {
    const rs = await this.client.execute('SELECT * FROM competitions');
    return rs.rows.map(row => ({
      ...row,
      isCompleted: Boolean(row.isCompleted)
    })) as unknown as Competition[];
  }

  async createCompetition(name: string, description?: string, pointsValue: number = 0): Promise<Competition> {
    const id = crypto.randomUUID();
    await this.client.execute({
      sql: 'INSERT INTO competitions (id, name, description, pointsValue) VALUES (?, ?, ?, ?)',
      args: [id, name, description || null, pointsValue]
    });
    return { id, name, description, pointsValue, isCompleted: false };
  }

  async updateCompetition(id: string, name: string, description?: string, pointsValue?: number, isCompleted?: boolean, winnerTeamId?: string): Promise<void> {
    await this.client.execute({
      sql: `
        UPDATE competitions 
        SET name = ?, 
            description = ?, 
            pointsValue = ?, 
            isCompleted = ?, 
            winnerTeamId = ? 
        WHERE id = ?
      `,
      args: [
        name, 
        description || null, 
        pointsValue ?? 0, 
        isCompleted ? 1 : 0, 
        winnerTeamId || null, 
        id
      ]
    });
  }

  async deleteCompetition(id: string): Promise<void> {
    await this.client.batch([
      { sql: 'DELETE FROM points_history WHERE competitionId = ?', args: [id] },
      { sql: 'DELETE FROM competitions WHERE id = ?', args: [id] }
    ], 'write');
  }

  async addPoints(data: {
    teamId?: string;
    participantId?: string;
    competitionId?: string;
    points: number;
    description: string;
  }): Promise<void> {
    const id = crypto.randomUUID();
    const batch: any[] = [
      {
        sql: 'INSERT INTO points_history (id, teamId, participantId, competitionId, points, description) VALUES (?, ?, ?, ?, ?, ?)',
        args: [id, data.teamId || null, data.participantId || null, data.competitionId || null, data.points, data.description]
      }
    ];

    if (data.participantId) {
      batch.push({
        sql: 'UPDATE participants SET points = points + ? WHERE id = ?',
        args: [data.points, data.participantId]
      });
      
      const rs = await this.client.execute({
        sql: 'SELECT teamId FROM participants WHERE id = ?',
        args: [data.participantId]
      });
      const participant = rs.rows[0] as unknown as { teamId: string };
      if (participant) {
        batch.push({
          sql: 'UPDATE teams SET points = points + ? WHERE id = ?',
          args: [data.points, participant.teamId]
        });
      }
    } else if (data.teamId) {
      batch.push({
        sql: 'UPDATE teams SET points = points + ? WHERE id = ?',
        args: [data.points, data.teamId]
      });
    }

    await this.client.batch(batch, 'write');
  }

  async getTeamRanking(): Promise<Team[]> {
    const rs = await this.client.execute('SELECT * FROM teams ORDER BY points DESC, name ASC');
    return rs.rows as unknown as Team[];
  }

  async getParticipantRanking(): Promise<Participant[]> {
    const rs = await this.client.execute('SELECT * FROM participants ORDER BY points DESC, name ASC');
    return rs.rows as unknown as Participant[];
  }

  async getPointsHistory(filters: { teamId?: string; participantId?: string }): Promise<PointRecord[]> {
    let sql = 'SELECT * FROM points_history WHERE 1=1';
    const args: any[] = [];

    if (filters.teamId && filters.participantId) {
       sql += ' AND (teamId = ? OR participantId = ?)';
       args.push(filters.teamId, filters.participantId);
    } else if (filters.teamId) {
      sql += ` AND (teamId = ? OR participantId IN (SELECT id FROM participants WHERE teamId = ?))`;
      args.push(filters.teamId, filters.teamId);
    } else if (filters.participantId) {
      sql += ' AND participantId = ?';
      args.push(filters.participantId);
    }

    sql += ' ORDER BY createdAt DESC';
    const rs = await this.client.execute({ sql, args });
    return rs.rows as unknown as PointRecord[];
  }

  async updatePoints(id: string, points: number, description: string): Promise<void> {
    const rs = await this.client.execute({
      sql: 'SELECT * FROM points_history WHERE id = ?',
      args: [id]
    });
    const oldRecord = rs.rows[0] as unknown as PointRecord;
    if (!oldRecord) return;

    const diff = points - oldRecord.points;
    const batch: any[] = [];

    if (oldRecord.teamId) {
      batch.push({
        sql: 'UPDATE teams SET points = points + ? WHERE id = ?',
        args: [diff, oldRecord.teamId]
      });
    }
    
    if (oldRecord.participantId) {
      batch.push({
        sql: 'UPDATE participants SET points = points + ? WHERE id = ?',
        args: [diff, oldRecord.participantId]
      });
      
      if (!oldRecord.teamId) {
          const prs = await this.client.execute({
            sql: 'SELECT teamId FROM participants WHERE id = ?',
            args: [oldRecord.participantId]
          });
          const p = prs.rows[0] as unknown as { teamId: string };
          if (p) {
            batch.push({
              sql: 'UPDATE teams SET points = points + ? WHERE id = ?',
              args: [diff, p.teamId]
            });
          }
      }
    }

    batch.push({
      sql: 'UPDATE points_history SET points = ?, description = ? WHERE id = ?',
      args: [points, description, id]
    });

    await this.client.batch(batch, 'write');
  }

  async deletePoints(id: string): Promise<void> {
    const rs = await this.client.execute({
      sql: 'SELECT * FROM points_history WHERE id = ?',
      args: [id]
    });
    const oldRecord = rs.rows[0] as unknown as PointRecord;
    if (!oldRecord) return;

    const pointsToSubtract = oldRecord.points;
    const batch: any[] = [];

    if (oldRecord.teamId) {
      batch.push({
        sql: 'UPDATE teams SET points = points - ? WHERE id = ?',
        args: [pointsToSubtract, oldRecord.teamId]
      });
    }
    
    if (oldRecord.participantId) {
      batch.push({
        sql: 'UPDATE participants SET points = points - ? WHERE id = ?',
        args: [pointsToSubtract, oldRecord.participantId]
      });
      
      if (!oldRecord.teamId) {
          const prs = await this.client.execute({
            sql: 'SELECT teamId FROM participants WHERE id = ?',
            args: [oldRecord.participantId]
          });
          const p = prs.rows[0] as unknown as { teamId: string };
          if (p) {
            batch.push({
              sql: 'UPDATE teams SET points = points - ? WHERE id = ?',
              args: [pointsToSubtract, p.teamId]
            });
          }
      }
    }

    batch.push({
      sql: 'DELETE FROM points_history WHERE id = ?',
      args: [id]
    });

    await this.client.batch(batch, 'write');
  }
}

let dbInstance: IDatabase | null = null;

export function getDatabase(): IDatabase {
  if (!dbInstance) {
    dbInstance = new TursoDatabase();
  }
  return dbInstance;
}
