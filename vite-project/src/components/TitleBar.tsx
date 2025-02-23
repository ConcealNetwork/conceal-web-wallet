import React from 'react';
import { Minus, Square, X } from 'lucide-react';

const { ipcRenderer } = window.require('electron');

export function TitleBar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-8 bg-black/50 backdrop-blur-sm flex items-center justify-between z-50 draggable">
      <div className="flex items-center px-4">
        <img src="/logo-256x256.png" alt="Conceal Logo" className="h-5 w-5" />
        <span className="ml-2 text-sm text-white">Conceal Wallet</span>
      </div>
      <div className="flex items-center h-full">
        <button
          onClick={() => ipcRenderer.send('minimize-window')}
          className="h-full px-4 hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <Minus className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => ipcRenderer.send('maximize-window')}
          className="h-full px-4 hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <Square className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => ipcRenderer.send('close-window')}
          className="h-full px-4 hover:bg-red-500 transition-colors flex items-center justify-center"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}