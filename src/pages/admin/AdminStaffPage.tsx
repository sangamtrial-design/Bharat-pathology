import React, { useState, useEffect } from 'react';
import { AdminUser, AdminRole } from '../../types/admin';
import { subscribeToStaff, updateStaffMember } from '../../lib/adminFirestore';
import { useAdminAuth } from '../../lib/adminAuth';
import { formatDate } from '../../lib/exportUtils';
import {
  ShieldAlert,
  UserCheck,
  UserX,
  Plus,
  Shield,
  KeyRound,
  Info,
  CheckCircle2,
  Trash2,
  Search
} from 'lucide-react';

export const AdminStaffPage: React.FC = () => {
  const { adminData, isOwner } = useAdminAuth();

  const [staffList, setStaffList] = useState<AdminUser[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New staff form fields
  const [newUid, setNewUid] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('staff');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    const unsub = subscribeToStaff((list) => {
      setStaffList(list);
    });
    return () => unsub();
  }, []);

  const handleToggleActive = async (user: AdminUser) => {
    if (!adminData || !isOwner) return;
    if (user.uid === adminData.uid) {
      alert('You cannot deactivate your own owner account.');
      return;
    }

    const nextActive = !user.active;
    await updateStaffMember(user.uid, { active: nextActive }, {
      name: adminData.name,
      email: adminData.email
    });
  };

  const handleRoleChange = async (user: AdminUser, role: AdminRole) => {
    if (!adminData || !isOwner) return;
    if (user.uid === adminData.uid && role !== 'owner') {
      alert('You cannot demote yourself from the owner role.');
      return;
    }

    await updateStaffMember(user.uid, { role }, {
      name: adminData.name,
      email: adminData.email
    });
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminData || !isOwner) return;
    if (!newUid.trim() || !newEmail.trim() || !newName.trim()) {
      alert('Please fill in UID, Email, and Staff Name.');
      return;
    }

    await updateStaffMember(
      newUid.trim(),
      {
        uid: newUid.trim(),
        email: newEmail.trim().toLowerCase(),
        name: newName.trim(),
        role: newRole,
        active: true,
        createdAt: new Date().toISOString(),
        phone: newPhone.trim()
      },
      { name: adminData.name, email: adminData.email }
    );

    setShowAddModal(false);
    setNewUid('');
    setNewEmail('');
    setNewName('');
    setNewPhone('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Staff & Administrator Access</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Control role-based permissions, authorize phlebotomists, and manage console users.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs cursor-pointer min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Authorize New Staff</span>
          </button>
        )}
      </div>

      {/* Guide Callout for Adding Staff */}
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
          <Info className="w-4 h-4 text-teal-600" />
          <span>Two-Step Security Process for Adding Staff Members:</span>
        </div>
        <p>
          1. <strong>Create User in Firebase Auth</strong>: In the Firebase Console, go to Authentication &gt; Users &gt; "Add user" with the staff member's email & temporary password.
        </p>
        <p>
          2. <strong>Authorize via Form</strong>: Copy their generated <code>User UID</code>, enter it below with their designated role (<strong>Staff</strong> or <strong>Owner</strong>), and click Authorize.
        </p>
      </div>

      {/* Staff Accounts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Added Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
            {staffList.map((user) => (
              <tr key={user.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{user.name}</div>
                  <div className="text-slate-500">{user.email}</div>
                  <div className="text-[10px] font-mono text-slate-400">UID: {user.uid}</div>
                </td>

                <td className="py-3.5 px-3">
                  {isOwner && user.uid !== adminData?.uid ? (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user, e.target.value as AdminRole)}
                      className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                    >
                      <option value="staff">Staff</option>
                      <option value="owner">Owner</option>
                    </select>
                  ) : (
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      user.role === 'owner' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {user.role}
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    user.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <span>{user.active ? 'Active' : 'Deactivated'}</span>
                  </span>
                </td>

                <td className="py-3.5 px-3 text-slate-500">
                  {formatDate(user.createdAt)}
                </td>

                <td className="py-3.5 px-4 text-right">
                  {isOwner && user.uid !== adminData?.uid && (
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        user.active
                          ? 'border border-rose-300 text-rose-600 hover:bg-rose-50'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {user.active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Authorize Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-base">Authorize Staff Member</h3>
            <p className="text-slate-500 text-[11px]">
              Provide user UID generated in Firebase Authentication to grant access to Bharat Pathology console.
            </p>

            <form onSubmit={handleAddStaff} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Firebase Auth User UID *</label>
                <input
                  type="text"
                  required
                  value={newUid}
                  onChange={(e) => setNewUid(e.target.value)}
                  placeholder="e.g. 7qX89yZ1..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Staff Member Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Registered Email *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="staff@bharatpathology.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as AdminRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="staff">Staff Member</option>
                    <option value="owner">Lab Owner</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Mobile (Optional)</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Mobile number"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 cursor-pointer shadow-xs"
                >
                  Save & Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
