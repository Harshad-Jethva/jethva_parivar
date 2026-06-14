import { useState, useEffect } from 'react';
import { supabase, AuditLogEntry } from '../../lib/supabase';
import { History, Search, RotateCcw, AlertTriangle, X } from 'lucide-react';

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    }
  };

  const handleRollback = async (log: AuditLogEntry) => {
    if (!confirm(`Are you sure you want to restore this ${log.target_table} record to its previous state?`)) return;
    
    try {
      if (log.action === 'update') {
        // Restore old_value using PUT
        if (!log.old_value) throw new Error('No old value stored in this log to restore from.');
        const { error } = await supabase.from(log.target_table).update(log.old_value, log.target_id!);
        if (error) throw error;
      } else if (log.action === 'create') {
        // Rollback creation by deleting the created record
        const { error } = await supabase.from(log.target_table).delete(log.target_id!);
        if (error) throw error;
      } else if (log.action === 'delete') {
        // Rollback deletion by inserting back the old_value
        if (!log.old_value) throw new Error('No deleted record content to restore.');
        const { error } = await supabase.from(log.target_table).insert(log.old_value);
        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Rollback operation executed successfully!' });
      setSelectedLog(null);
      loadLogs();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Rollback failed.' });
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const filteredLogs = logs.filter((log) => {
    return (
      log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target_table.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Audit Log System & Rollbacks</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track and review all changes made inside the admin panel, with rollback capabilities.</p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs w-60"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Audit logs table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-semibold uppercase border-b dark:border-gray-700">
                <th className="px-6 py-3">Operator</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Target Table</th>
                <th className="px-6 py-3">Record ID</th>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-semibold text-gray-800 dark:text-white">{log.user_email || 'System'}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded font-semibold ${
                      log.action === 'create' ? 'bg-green-50 text-green-700' :
                      log.action === 'update' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-mono">{log.target_table}</td>
                  <td className="px-6 py-3 font-mono text-gray-400">{log.target_id?.substring(0, 8) || 'N/A'}</td>
                  <td className="px-6 py-3">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2.5 py-1 border dark:border-gray-700 rounded text-primary-500 hover:bg-gray-50 transition-colors"
                    >
                      Compare
                    </button>
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No matching audit logs recorded in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compare Difference Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                <History className="w-5 h-5 text-primary-500" />
                Change Comparison Details
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Old Value */}
                <div className="space-y-1">
                  <span className="block font-semibold text-gray-500 uppercase">Old State / Pre-Change</span>
                  <pre className="p-3 bg-gray-50 dark:bg-gray-950 border dark:border-gray-900 rounded-lg overflow-x-auto text-[10px] text-gray-400 font-mono h-60">
                    {selectedLog.old_value ? JSON.stringify(selectedLog.old_value, null, 2) : 'Null (Created)'}
                  </pre>
                </div>

                {/* New Value */}
                <div className="space-y-1">
                  <span className="block font-semibold text-gray-500 uppercase text-green-600">New State / Current</span>
                  <pre className="p-3 bg-gray-50 dark:bg-gray-950 border dark:border-gray-900 rounded-lg overflow-x-auto text-[10px] text-gray-400 font-mono h-60">
                    {selectedLog.new_value ? JSON.stringify(selectedLog.new_value, null, 2) : 'Null (Deleted)'}
                  </pre>
                </div>

              </div>

              {/* Alert Message for Rollback danger */}
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-[11px]">
                  <strong>Warning:</strong> Restoring this change will overwrite the active records currently deployed in database table: <span className="font-mono">{selectedLog.target_table}</span>.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 flex justify-end gap-2">
              <button 
                onClick={() => setSelectedLog(null)} 
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50"
              >
                Close Comparison
              </button>
              <button
                onClick={() => handleRollback(selectedLog)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs font-bold shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Execute Rollback Restore
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
