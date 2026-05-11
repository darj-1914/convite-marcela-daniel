import bcrypt from 'bcryptjs';
import { query } from '../../db/pool.js';

export async function findUserByUsername(username) {
  const result = await query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username]);
  return result.rows[0] || null;
}

export async function validateUserCredentials(username, password) {
  const user = await findUserByUsername(username);

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name
  };
}
