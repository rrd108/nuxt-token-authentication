import type { Database } from 'db0'
import type { PasswordResetToken, PersonalAccessToken, User } from './schema'
import { TABLES } from './schema'

export class UserRepository {
  constructor(private db: Database, private tableName: string = TABLES.USERS) { }

  async findById(id: number): Promise<User | null> {
    const result = await this.db.sql`SELECT * FROM ${this.tableName} WHERE id = ${id} LIMIT 1`
    return result.rows?.[0] as User || null
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.sql`SELECT * FROM ${this.tableName} WHERE email = ${email} LIMIT 1`
    return result.rows?.[0] as User || null
  }

  async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const result = await this.db.sql`
      INSERT INTO ${this.tableName} (name, email, password, email_verified_at, created_at, updated_at)
      VALUES (${userData.name}, ${userData.email}, ${userData.password}, ${userData.email_verified_at}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `

    const id = result.lastInsertRowid
    return await this.findById(id) as User
  }

  async update(id: number, userData: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User | null> {
    const updates: string[] = []
    const values: any[] = []

    if (userData.name !== undefined) {
      updates.push('name = ?')
      values.push(userData.name)
    }
    if (userData.email !== undefined) {
      updates.push('email = ?')
      values.push(userData.email)
    }
    if (userData.password !== undefined) {
      updates.push('password = ?')
      values.push(userData.password)
    }
    if (userData.email_verified_at !== undefined) {
      updates.push('email_verified_at = ?')
      values.push(userData.email_verified_at)
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')

    if (updates.length === 0) {
      return await this.findById(id)
    }

    const query = `UPDATE ${this.tableName} SET ${updates.join(', ')} WHERE id = ?`
    values.push(id)

    await this.db.sql`${query} ${values}`
    return await this.findById(id)
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.sql`DELETE FROM ${this.tableName} WHERE id = ${id}`
    return result.affectedRows > 0
  }
}

export class PersonalAccessTokenRepository {
  constructor(private db: Database) { }

  async findById(id: number): Promise<PersonalAccessToken | null> {
    const result = await this.db.sql`SELECT * FROM ${TABLES.PERSONAL_ACCESS_TOKENS} WHERE id = ${id} LIMIT 1`
    return result.rows?.[0] as PersonalAccessToken || null
  }

  async findByToken(token: string): Promise<PersonalAccessToken | null> {
    const result = await this.db.sql`SELECT * FROM ${TABLES.PERSONAL_ACCESS_TOKENS} WHERE token = ${token} LIMIT 1`
    return result.rows?.[0] as PersonalAccessToken || null
  }

  async findByTokenable(tokenableType: string, tokenableId: number): Promise<PersonalAccessToken[]> {
    const result = await this.db.sql`
      SELECT * FROM ${TABLES.PERSONAL_ACCESS_TOKENS} 
      WHERE tokenable_type = ${tokenableType} AND tokenable_id = ${tokenableId}
      ORDER BY created_at DESC
    `
    return result.rows as PersonalAccessToken[]
  }

  async create(tokenData: Omit<PersonalAccessToken, 'id' | 'created_at' | 'updated_at'>): Promise<PersonalAccessToken> {
    const result = await this.db.sql`
      INSERT INTO ${TABLES.PERSONAL_ACCESS_TOKENS} 
      (tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at)
      VALUES (
        ${tokenData.tokenable_type}, 
        ${tokenData.tokenable_id}, 
        ${tokenData.name}, 
        ${tokenData.token}, 
        ${tokenData.abilities}, 
        ${tokenData.last_used_at}, 
        ${tokenData.expires_at}, 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP
      )
    `

    const id = result.lastInsertRowid
    return await this.findById(id) as PersonalAccessToken
  }

  async updateLastUsedAt(id: number): Promise<void> {
    await this.db.sql`
      UPDATE ${TABLES.PERSONAL_ACCESS_TOKENS} 
      SET last_used_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id}
    `
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.sql`DELETE FROM ${TABLES.PERSONAL_ACCESS_TOKENS} WHERE id = ${id}`
    return result.affectedRows > 0
  }

  async deleteByTokenable(tokenableType: string, tokenableId: number): Promise<number> {
    const result = await this.db.sql`
      DELETE FROM ${TABLES.PERSONAL_ACCESS_TOKENS} 
      WHERE tokenable_type = ${tokenableType} AND tokenable_id = ${tokenableId}
    `
    return result.affectedRows
  }

  async deleteExpired(): Promise<number> {
    const result = await this.db.sql`
      DELETE FROM ${TABLES.PERSONAL_ACCESS_TOKENS} 
      WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP
    `
    return result.affectedRows
  }

  async findValidToken(token: string): Promise<PersonalAccessToken | null> {
    const result = await this.db.sql`
      SELECT * FROM ${TABLES.PERSONAL_ACCESS_TOKENS} 
      WHERE token = ${token} 
      AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      LIMIT 1
    `
    return result.rows?.[0] as PersonalAccessToken || null
  }
}

export class PasswordResetTokenRepository {
  constructor(private db: Database) { }

  async findByEmail(email: string): Promise<PasswordResetToken | null> {
    const result = await this.db.sql`SELECT * FROM ${TABLES.PASSWORD_RESET_TOKENS} WHERE email = ${email} LIMIT 1`
    return result.rows?.[0] as PasswordResetToken || null
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    const result = await this.db.sql`SELECT * FROM ${TABLES.PASSWORD_RESET_TOKENS} WHERE token = ${token} LIMIT 1`
    return result.rows?.[0] as PasswordResetToken || null
  }

  async create(tokenData: Omit<PasswordResetToken, 'id' | 'created_at'>): Promise<PasswordResetToken> {
    // Delete any existing tokens for this email
    await this.deleteByEmail(tokenData.email)

    const result = await this.db.sql`
      INSERT INTO ${TABLES.PASSWORD_RESET_TOKENS} (email, token, created_at)
      VALUES (${tokenData.email}, ${tokenData.token}, CURRENT_TIMESTAMP)
    `

    const id = result.lastInsertRowid
    const result2 = await this.db.sql`SELECT * FROM ${TABLES.PASSWORD_RESET_TOKENS} WHERE id = ${id} LIMIT 1`
    return result2.rows?.[0] as PasswordResetToken
  }

  async deleteByEmail(email: string): Promise<boolean> {
    const result = await this.db.sql`DELETE FROM ${TABLES.PASSWORD_RESET_TOKENS} WHERE email = ${email}`
    return result.affectedRows > 0
  }

  async deleteByToken(token: string): Promise<boolean> {
    const result = await this.db.sql`DELETE FROM ${TABLES.PASSWORD_RESET_TOKENS} WHERE token = ${token}`
    return result.affectedRows > 0
  }

  async deleteExpired(hoursOld: number = 24): Promise<number> {
    const result = await this.db.sql`
      DELETE FROM ${TABLES.PASSWORD_RESET_TOKENS} 
      WHERE created_at < datetime('now', '-${hoursOld} hours')
    `
    return result.affectedRows
  }
}
