'use client';

import React, { useState } from 'react';
import { Shield, Plus, Save, Trash2, X, Lock, Key, CheckSquare, Square } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface UserAccount {
  user: string;
  access: '1' | '0'; // 1 = Admin, 0 = Operator
  description: string;
  permissions: boolean[];
}

const MENU_PERMISSIONS = [
  '1. Master - Publisher Entry',
  '2. Master - Publication & Rates Entry',
  '3. Master - Region / Area Entry',
  '4. Master - Hawker / Line Entry',
  '5. Master - Customer & Subscriptions',
  '6. Master - Rate Change Revisions',
  '7. Master - Holiday Calendar',
  '8. Master - Collection Agents',
  '9. Master - Company Profile',
  '10. Trans - Daily Morning Dispatch Process',
  '11. Trans - Vacation Holds / Stops',
  '12. Trans - Counter / Retail Sales',
  '13. Trans - Payment Receipts Entry',
  '14. Trans - Monthly Billing Engine',
  '15. Trans - Receipt Book Allotment',
  '16. Report - Customer Monthly Bills Print',
  '17. Report - Hawker Delivery Dispatch Sheet',
  '18. Report - Customer Outstanding Dues Ledger',
  '19. Report - Sales Consolidated Report',
  '20. Utility - User & Permissions Control',
  '21. Utility - Database Backup',
  '22. Utility - Database Restore',
  '23. Utility - Year-End Balance Forward'
];

export default function UserPermissionsForm({ isOpen, onClose }: Props) {
  const [users, setUsers] = useState<UserAccount[]>([
    { user: 'admin', access: '1', description: 'System Administrator (Full Access)', permissions: Array(23).fill(true) },
    { user: 'operator1', access: '0', description: 'Counter Cashier & Receipts Entry', permissions: [true, false, false, false, true, false, false, false, false, true, true, true, true, false, true, true, true, true, false, false, false, false, false] },
    { user: 'billing', access: '0', description: 'Billing & Report Operator', permissions: [false, false, false, false, true, false, false, true, false, true, false, false, true, true, false, true, true, true, true, false, false, false, false] },
  ]);

  const [selectedUser, setSelectedUser] = useState<UserAccount>(users[0]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newAccess, setNewAccess] = useState<'1' | '0'>('0');
  const [status, setStatus] = useState('');

  if (!isOpen) return null;

  const handleTogglePermission = (index: number) => {
    const updated = [...selectedUser.permissions];
    updated[index] = !updated[index];
    const updatedUser = { ...selectedUser, permissions: updated };
    setSelectedUser(updatedUser);
    setUsers(users.map(u => u.user === selectedUser.user ? updatedUser : u));
  };

  const handleSelectAll = (val: boolean) => {
    const updatedUser = { ...selectedUser, permissions: Array(23).fill(val) };
    setSelectedUser(updatedUser);
    setUsers(users.map(u => u.user === selectedUser.user ? updatedUser : u));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    if (users.find(u => u.user.toLowerCase() === newUsername.trim().toLowerCase())) {
      setStatus('Error: User already exists!');
      return;
    }
    const newUser: UserAccount = {
      user: newUsername.trim(),
      access: newAccess,
      description: newAccess === '1' ? 'Administrator' : 'Standard Operator',
      permissions: newAccess === '1' ? Array(23).fill(true) : Array(23).fill(false)
    };
    setUsers([...users, newUser]);
    setSelectedUser(newUser);
    setNewUsername('');
    setNewPassword('');
    setStatus(`User "${newUser.user}" created successfully.`);
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-4xl bg-[#ECE9D8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl font-tahoma flex flex-col max-h-[90vh]">
        {/* Titlebar */}
        <div className="bg-linear-to-r from-[#0A246A] to-[#A6CAF0] text-white px-3 py-1 flex items-center justify-between font-bold text-xs select-none">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-yellow-300" />
            <span>User Management & Menu Permissions Security (यूजर एवं मेनू अनुमति मास्टर)</span>
          </div>
          <button onClick={onClose} className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-red-600 hover:text-white">✕</button>
        </div>

        <div className="p-4 flex-1 overflow-auto space-y-4 text-xs bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Left: Users List */}
            <div className="border border-slate-300 p-2 space-y-3 bg-slate-50">
              <h4 className="font-bold text-slate-800 border-b pb-1">System Users (सिस्टम यूजर सूची):</h4>
              <div className="space-y-1">
                {users.map(u => (
                  <button
                    key={u.user}
                    onClick={() => setSelectedUser(u)}
                    className={`w-full text-left px-2.5 py-1.5 border rounded-xs font-bold text-xs flex items-center justify-between ${selectedUser.user === u.user ? 'bg-blue-800 text-white border-blue-900' : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'}`}
                  >
                    <span>{u.user}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-black/10 rounded-xs">
                      {u.access === '1' ? 'Admin' : 'Operator'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Create User */}
              <form onSubmit={handleAddUser} className="border-t pt-2 space-y-2">
                <h5 className="font-bold text-slate-700 text-[11px]">Add New User:</h5>
                <input 
                  type="text" 
                  required
                  placeholder="Username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-2 py-1 border border-slate-400 bg-white text-xs"
                />
                <input 
                  type="password" 
                  placeholder="Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-2 py-1 border border-slate-400 bg-white text-xs"
                />
                <select 
                  value={newAccess}
                  onChange={(e) => setNewAccess(e.target.value as any)}
                  className="w-full px-2 py-1 border border-slate-400 bg-white text-xs font-bold"
                >
                  <option value="0">Standard Operator</option>
                  <option value="1">Full Administrator</option>
                </select>
                <button type="submit" className="w-full py-1 bg-blue-700 text-white font-bold border border-black shadow-xs hover:bg-blue-800">
                  + Create User
                </button>
              </form>
            </div>

            {/* Right: Menu 1-23 Permission Checkboxes */}
            <div className="md:col-span-2 border border-slate-300 p-3 space-y-3 bg-white">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h4 className="font-bold text-blue-900 text-sm">
                    Permissions for: <span className="underline">{selectedUser.user}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">{selectedUser.description}</p>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => handleSelectAll(true)}
                    className="px-2 py-0.5 bg-slate-100 border border-slate-400 font-bold text-[10px] hover:bg-slate-200"
                  >
                    Select All
                  </button>
                  <button 
                    onClick={() => handleSelectAll(false)}
                    className="px-2 py-0.5 bg-slate-100 border border-slate-400 font-bold text-[10px] hover:bg-slate-200"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* 23 Menu Permission Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-72 overflow-auto p-1 border border-slate-200 bg-slate-50">
                {MENU_PERMISSIONS.map((perm, idx) => {
                  const isChecked = !!selectedUser.permissions[idx];
                  return (
                    <label 
                      key={idx}
                      className={`flex items-center gap-2 p-1.5 border rounded-xs text-[11px] cursor-pointer select-none ${isChecked ? 'bg-amber-50 border-amber-300 font-bold text-slate-900' : 'bg-white border-slate-200 text-slate-500'}`}
                    >
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePermission(idx)}
                        className="rounded-xs text-blue-600 focus:ring-0"
                      />
                      <span>{perm}</span>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  onClick={() => {
                    setStatus(`Permissions for ${selectedUser.user} saved successfully.`);
                    setTimeout(() => setStatus(''), 3000);
                  }}
                  className="px-4 py-1.5 bg-emerald-700 text-white font-bold border border-black shadow-xs hover:bg-emerald-800 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save Permissions (अनुमति सुरक्षित करें)
                </button>
              </div>
            </div>

          </div>

          {status && (
            <div className="bg-emerald-100 text-emerald-800 p-2 border border-emerald-400 rounded-xs font-bold text-center">
              {status}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#ECE9D8] border-t border-[#808080] px-4 py-2 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-1 bg-[#ECE9D8] border border-black shadow-xs hover:bg-slate-200 font-bold text-xs"
          >
            Close (बंद करें)
          </button>
        </div>
      </div>
    </div>
  );
}
