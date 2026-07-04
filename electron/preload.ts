import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  onTypingStats: (callback: (data: any) => void) => {
    ipcRenderer.on('typing-stats', (_event, data) => callback(data));
  },
  getHistoricalData: () => ipcRenderer.invoke('get-historical-data'),
  saveHistoricalData: (data: any) => ipcRenderer.send('save-historical-data', data),
});
