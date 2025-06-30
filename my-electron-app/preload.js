const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  gitStatus: () => ipcRenderer.invoke('git-status'),
  gitStage: (file) => ipcRenderer.invoke('git-stage', file),
  gitUnstage: (file) => ipcRenderer.invoke('git-unstage', file),
  gitOpenRepo: () => ipcRenderer.invoke('git-open-repo'),
  gitGetRepoPath: () => ipcRenderer.invoke('git-get-repo-path'),
  gitGetAuthor: () => ipcRenderer.invoke('git-get-author'),
  gitCommit: (message) => ipcRenderer.invoke('git-commit', message),
  gitGetBranches: () => ipcRenderer.invoke('git-get-branches'),
  gitCheckoutBranch: (branch) => ipcRenderer.invoke('git-checkout-branch', branch),
  gitGetLogs: () => ipcRenderer.invoke('git-get-logs')
});
 