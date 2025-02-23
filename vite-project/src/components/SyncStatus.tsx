import React from 'react';
import { RefreshCw } from 'lucide-react';

export function SyncStatus() {
  // This would be connected to your actual sync status logic
  const [syncStatus, setSyncStatus] = React.useState({
    status: 'syncing', // 'syncing' | 'synced' | 'error'
    progress: 85,
    blockHeight: 1234567,
    networkHeight: 1234570
  });

  return (
    <div className="w-full p-4 bg-black/30 backdrop-blur-sm border border-[#ffa500] rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${syncStatus.status === 'syncing' ? 'animate-spin' : ''} text-[#ffa500]`} />
          <span className="text-white font-medium">
            {syncStatus.status === 'syncing' ? 'Synchronizing...' : 'Synchronized'}
          </span>
        </div>
        <span className="text-sm text-white/70">
          {syncStatus.progress}%
        </span>
      </div>
      <div className="w-full bg-black/20 rounded-full h-1.5">
        <div
          className="bg-[#ffa500] h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${syncStatus.progress}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-white/70 flex justify-between">
        <span>Block Height: {syncStatus.blockHeight}</span>
        <span>Network Height: {syncStatus.networkHeight}</span>
      </div>
    </div>
  );
}