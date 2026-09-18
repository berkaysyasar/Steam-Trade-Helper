const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  fetchGroups: (input) => ipcRenderer.invoke('fetch-groups', input),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  copy: (text) => ipcRenderer.invoke('copy', text),
  groupAnchor: (url) => ipcRenderer.invoke('group-anchor', url),
  fetchPage: (url) => ipcRenderer.invoke('fetch-page', url)
});
