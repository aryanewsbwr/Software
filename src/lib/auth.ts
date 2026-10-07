import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { supabase } from './supabaseClient';

export interface UserPermissions {
  can_collect: boolean;          // Receipt / Payment collection
  can_view_delivery: boolean;    // Daily customer delivery sheet & counts
  can_mark_discontinue: boolean; // Vacation hold / discontinue
  can_retail_sale: boolean;      // Retail sales
  can_access_master: boolean;    // Masters (Publication, Rates, Customer, Hawker, Area)
  can_billing: boolean;          // Monthly bill generation
  can_reports: boolean;          // Financial & billing reports
  can_manage_users: boolean;     // User & role permissions
}

export interface AppUser {
  id: string;
  username: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'hawker' | 'operator' | 'billing';
  hawker_id?: number; // Linked hawker ID if role is hawker
  phone?: string;
  is_active: boolean;
  permissions: UserPermissions;
  created_at: string;
  updated_at: string;
}

const AUTH_SALT = process.env.AUTH_SECRET_SALT || 'aryan_news_secure_salt_2026_!@#$';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(AUTH_SALT + password.trim()).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export const DEFAULT_ADMIN_PERMISSIONS: UserPermissions = {
  can_collect: true,
  can_view_delivery: true,
  can_mark_discontinue: true,
  can_retail_sale: true,
  can_access_master: true,
  can_billing: true,
  can_reports: true,
  can_manage_users: true
};

export const DEFAULT_HAWKER_PERMISSIONS: UserPermissions = {
  can_collect: true,
  can_view_delivery: true,
  can_mark_discontinue: true,
  can_retail_sale: true,
  can_access_master: false,
  can_billing: false,
  can_reports: false,
  can_manage_users: false
};

export const DEFAULT_OPERATOR_PERMISSIONS: UserPermissions = {
  can_collect: true,
  can_view_delivery: true,
  can_mark_discontinue: true,
  can_retail_sale: true,
  can_access_master: true,
  can_billing: false,
  can_reports: true,
  can_manage_users: false
};

const DEFAULT_USERS: AppUser[] = [
  {
    id: 'user_admin_001',
    username: 'ananews',
    password_hash: 'cf30f21542c8c5e293074eba4401e2dde57b9f0975c368dcef5f21268ae2c23b', // Salted hash for Himanshu@321
    name: 'Main Administrator',
    role: 'admin',
    is_active: true,
    permissions: DEFAULT_ADMIN_PERMISSIONS,
    created_at: '2026-10-07T00:00:00.000Z',
    updated_at: '2026-10-07T00:00:00.000Z'
  }
];

const USERS_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'users.json');

export function getLocalUsers(): AppUser[] {
  try {
    if (fs.existsSync(USERS_FILE_PATH)) {
      const content = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure admin account always exists
        const adminExists = parsed.some(u => u.username?.toLowerCase() === 'ananews');
        if (!adminExists) {
          parsed.unshift(DEFAULT_USERS[0]);
          saveLocalUsers(parsed);
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading users.json:', err);
  }
  saveLocalUsers(DEFAULT_USERS);
  return DEFAULT_USERS;
}

export function saveLocalUsers(users: AppUser[]): void {
  try {
    const dir = path.dirname(USERS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing users.json:', err);
  }
}

export async function getAllUsers(): Promise<AppUser[]> {
  // Try fetching from Supabase first
  try {
    const { data, error } = await supabase.from('app_users').select('*');
    if (!error && data && data.length > 0) {
      return data.map(u => ({
        ...u,
        permissions: typeof u.permissions === 'string' ? JSON.parse(u.permissions) : (u.permissions || DEFAULT_HAWKER_PERMISSIONS)
      }));
    }
  } catch (_) {}

  return getLocalUsers();
}

export async function authenticateUser(username: string, password: string): Promise<AppUser | null> {
  const cleanUsername = username.trim().toLowerCase();
  const users = await getAllUsers();
  
  const user = users.find(u => u.username.toLowerCase() === cleanUsername && u.is_active !== false);
  if (!user) return null;

  if (verifyPassword(password, user.password_hash)) {
    return user;
  }
  return null;
}
