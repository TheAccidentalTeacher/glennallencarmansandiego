import { query } from './database';
import type { User, CreateUserData } from '../types';
import bcrypt from 'bcryptjs';

export class UserService {
  static async createUser(userData: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const result = await query(
      `INSERT INTO users (email, password_hash, display_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, display_name, role, created_at, updated_at`,
      [userData.email, hashedPassword, userData.displayName, userData.role]
    );
    
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT id, email, display_name, role, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT id, email, display_name, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }

  static async validatePassword(email: string, password: string): Promise<User | null> {
    const result = await query(
      'SELECT id, email, password_hash, display_name, role, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    
    if (!result.rows[0]) return null;
    
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) return null;
    
    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async updateUser(id: string, updates: Partial<CreateUserData>): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.email) {
      fields.push(`email = $${paramCount++}`);
      values.push(updates.email);
    }

    if (updates.displayName) {
      fields.push(`display_name = $${paramCount++}`);
      values.push(updates.displayName);
    }

    if (updates.role) {
      fields.push(`role = $${paramCount++}`);
      values.push(updates.role);
    }

    if (updates.password) {
      const hashedPassword = await bcrypt.hash(updates.password, 10);
      fields.push(`password_hash = $${paramCount++}`);
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    
    const result = await query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING id, email, display_name, role, created_at, updated_at`,
      values
    );
    
    return result.rows[0] || null;
  }

  static async deleteUser(id: string): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  static async listUsers(limit = 50, offset = 0): Promise<User[]> {
    const result = await query(
      `SELECT id, email, display_name, role, created_at, updated_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return result.rows;
  }
}