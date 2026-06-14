import { useState } from 'react';
import { Shield, Key, Lock, HardDrive, Download } from 'lucide-react';

export function SecurityCenter() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [ipList, setIpList] = useState<string[]>(['127.0.0.1', '192.168.1.56']);
  const [newIp, setNewIp] = useState('');
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [backupLogs, setBackupLogs] = useState<any[]>([
    { name: 'backup_shree_ram_2026_06_14_daily.sql', size: '2.5 MB', date: '2026-06-14 04:00 AM' },
    { name: 'backup_shree_ram_2026_06_13_weekly.sql', size: '2.4 MB', date: '2026-06-13 04:00 AM' },
  ]);

  const [message, setMessage] = useState<string | null>(null);

  const addIp = () => {
    if (!newIp) return;
    setIpList([...ipList, newIp]);
    setNewIp('');
    setMessage('IP address added to whitelist rules!');
    setTimeout(() => setMessage(null), 3000);
  };

  const deleteIp = (ip: string) => {
    setIpList(ipList.filter(x => x !== ip));
    setMessage('IP whitelist updated.');
    setTimeout(() => setMessage(null), 3000);
  };

  const triggerManualBackup = () => {
    setIsBackupRunning(true);
    setTimeout(() => {
      const newBackup = {
        name: `backup_shree_ram_${new Date().toISOString().slice(0, 10).replace(/-/g, '_')}_manual.sql`,
        size: '2.6 MB',
        date: new Date().toLocaleString()
      };
      setBackupLogs([newBackup, ...backupLogs]);
      setIsBackupRunning(false);
      setMessage('Full SQL database dump backup completed successfully!');
      setTimeout(() => setMessage(null), 3000);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Security Controls & Backups</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Configure administrator access filters, enable 2FA tokens, and initiate database snapshots.</p>
      </div>

      {message && (
        <div className="p-4 rounded-lg text-sm bg-green-100 text-green-800 font-medium">
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Security options left */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 2FA Toggle & Activity */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-500" />
              Access Credentials Security
            </h3>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-xl mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${twoFactor ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400 dark:bg-gray-800'}`}>
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-semibold text-sm text-gray-800 dark:text-white block">Two-Factor Authentication (2FA)</span>
                  <span className="text-xs text-gray-400 block">Requires authentication code from Google Authenticator on login.</span>
                </div>
              </div>

              <button
                onClick={() => setTwoFactor(!twoFactor)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                  twoFactor ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-750 dark:bg-gray-700'
                }`}
              >
                {twoFactor ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>

          {/* IP Whitelist Whitelist */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary-500" />
              IP Address Whitelisting Rules
            </h3>
            <p className="text-xs text-gray-400">Restricts CMS dashboard log-in capabilities to listed networks.</p>

            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                placeholder="e.g. 192.168.1.100"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs font-mono"
              />
              <button
                onClick={addIp}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg text-xs"
              >
                Whitelist IP
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {ipList.map((ip) => (
                <div key={ip} className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-mono text-gray-600 dark:text-gray-300">
                  <span>{ip}</span>
                  <button onClick={() => deleteIp(ip)} className="text-red-500 font-bold hover:text-red-700">×</button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Database backup right */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-fit">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary-500" />
              Automated Snapshots
            </h3>
            
            <button
              onClick={triggerManualBackup}
              disabled={isBackupRunning}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white font-bold rounded-lg text-xs shadow mb-6 flex items-center justify-center gap-2"
            >
              <HardDrive className="w-4 h-4" />
              {isBackupRunning ? 'Compiling Dump File...' : 'Trigger Backup Snapshot'}
            </button>

            <div className="space-y-3">
              <span className="block text-xs font-semibold text-gray-500 uppercase">Available Snapshots</span>
              <div className="space-y-2 text-xs">
                {backupLogs.map((b, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-lg">
                    <div>
                      <span className="font-bold text-gray-800 dark:text-white block truncate w-40">{b.name}</span>
                      <span className="text-[10px] text-gray-400 block">{b.date} • {b.size}</span>
                    </div>
                    <button className="p-1.5 bg-white border dark:bg-gray-800 dark:border-gray-750 text-primary-500 rounded hover:scale-105 transition-transform">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
