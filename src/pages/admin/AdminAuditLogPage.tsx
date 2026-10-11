import React, { useState, useEffect, useMemo } from 'react';
import { AuditLogEntry } from '../../types/admin';
import { subscribeToAuditLogs } from '../../lib/adminFirestore';
import { formatDate } from '../../lib/exportUtils';
import {
  Activity,
  Search,
  Filter,
  User,
  Clock,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export const AdminAuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    const unsub = subscribeToAuditLogs((entries) => {
      setLogs(entries);
    });
    return () => unsub();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (filterAction !== 'all' && !l.action.toLowerCase().includes(filterAction.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          l.action.toLowerCase().includes(q) ||
          l.by.toLowerCase().includes(q) ||
          l.byEmail.toLowerCase().includes(q) ||
          l.entityId.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, filterAction, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Immutable Audit Log</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Cryptographically recorded trail of all booking status updates, payment verifications, and staff operations.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by user, action, booking ID, or description..."
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
          >
            <option value="all">All Actions</option>
            <option value="status">Status Changes</option>
            <option value="payment">Payments</option>
            <option value="delete">Deletions</option>
            <option value="settings">Settings</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      {filteredLogs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
          <Activity className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <div className="font-semibold text-sm">No audit records found.</div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Actor / Staff</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Target Entity</th>
                <th className="py-3 px-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">
                    <div>{formatDate(log.at)}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(log.at).toLocaleTimeString('en-IN')}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{log.by}</div>
                    <div className="text-[10px] text-slate-400">{log.byEmail}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-bold">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {log.entityId}
                  </td>

                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    <div className="line-clamp-2">{log.details}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
