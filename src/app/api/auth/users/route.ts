import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllUsers, 
  saveLocalUsers, 
  getLocalUsers, 
  hashPassword, 
  AppUser, 
  DEFAULT_ADMIN_PERMISSIONS, 
  DEFAULT_HAWKER_PERMISSIONS, 
  DEFAULT_OPERATOR_PERMISSIONS 
} from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const users = await getAllUsers();
    // Return users without exposing password hashes
    const safeUsers = users.map(({ password_hash, ...u }) => u);
    return NextResponse.json({ users: safeUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      id, 
      username, 
      password, 
      name, 
      role = 'hawker', 
      hawker_id, 
      phone, 
      is_active = true, 
      permissions 
    } = body;

    if (!username || !username.trim()) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    const users = getLocalUsers();
    const now = new Date().toISOString();

    let targetPermissions = permissions;
    if (!targetPermissions) {
      if (role === 'admin') targetPermissions = DEFAULT_ADMIN_PERMISSIONS;
      else if (role === 'operator') targetPermissions = DEFAULT_OPERATOR_PERMISSIONS;
      else targetPermissions = DEFAULT_HAWKER_PERMISSIONS;
    }

    const existingIndex = users.findIndex(u => u.id === id || u.username.toLowerCase() === cleanUsername);

    if (existingIndex >= 0) {
      // Update existing user
      const existing = users[existingIndex];
      const updatedUser: AppUser = {
        ...existing,
        name: name || existing.name,
        role: role || existing.role,
        hawker_id: hawker_id !== undefined ? Number(hawker_id) : existing.hawker_id,
        phone: phone !== undefined ? phone : existing.phone,
        is_active: is_active !== undefined ? is_active : existing.is_active,
        permissions: targetPermissions,
        password_hash: password && password.trim() ? hashPassword(password) : existing.password_hash,
        updated_at: now
      };

      users[existingIndex] = updatedUser;
      saveLocalUsers(users);

      try {
        await supabase.from('app_users').upsert({
          ...updatedUser,
          permissions: JSON.stringify(updatedUser.permissions)
        });
      } catch (_) {}

      const { password_hash, ...safe } = updatedUser;
      return NextResponse.json({ success: true, user: safe, message: 'User updated successfully' });
    } else {
      // Create new user
      if (!password || !password.trim()) {
        return NextResponse.json({ error: 'Password is required for new user' }, { status: 400 });
      }

      const newUser: AppUser = {
        id: id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        username: cleanUsername,
        password_hash: hashPassword(password),
        name: name || cleanUsername,
        role: role,
        hawker_id: hawker_id ? Number(hawker_id) : undefined,
        phone: phone || '',
        is_active: true,
        permissions: targetPermissions,
        created_at: now,
        updated_at: now
      };

      users.push(newUser);
      saveLocalUsers(users);

      try {
        await supabase.from('app_users').insert({
          ...newUser,
          permissions: JSON.stringify(newUser.permissions)
        });
      } catch (_) {}

      const { password_hash, ...safe } = newUser;
      return NextResponse.json({ success: true, user: safe, message: 'User created successfully' });
    }
  } catch (error: any) {
    console.error('Error managing users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const username = searchParams.get('username');

    if (!id && !username) {
      return NextResponse.json({ error: 'User ID or username is required' }, { status: 400 });
    }

    if (username?.toLowerCase() === 'ananews' || id === 'user_admin_001') {
      return NextResponse.json({ error: 'Main administrator account cannot be deleted' }, { status: 403 });
    }

    let users = getLocalUsers();
    users = users.filter(u => u.id !== id && u.username.toLowerCase() !== username?.toLowerCase());
    saveLocalUsers(users);

    try {
      if (id) await supabase.from('app_users').delete().eq('id', id);
      if (username) await supabase.from('app_users').delete().eq('username', username.toLowerCase());
    } catch (_) {}

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
