const { ipcMain, dialog } = require('electron');
const simpleGit = require('simple-git');

let git;

function initializeGit(win) {
  ipcMain.handle('git-open-repo', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    });
    if (!result.canceled && result.filePaths.length > 0) {
      const repoPath = result.filePaths[0];
      git = simpleGit(repoPath);
      return { repoPath };
    }
    return { repoPath: null };
  });

  ipcMain.handle('git-get-repo-path', async () => {
    if (!git) return { repoPath: null };
    return { repoPath: await git.revparse(['--show-toplevel']) };
  });

  ipcMain.handle('git-status', async () => {
    if (!git) return { staged: [], unstaged: [] };
    try {
      const status = await git.status();
      return {
        staged: status.staged,
        unstaged: status.not_added.concat(status.modified, status.deleted, status.renamed.map(r => r.to))
      };
    } catch (error) {
      console.error('Git status error:', error);
      return { staged: [], unstaged: [] };
    }
  });

  ipcMain.handle('git-stage', async (event, file) => {
    if (!git) return { staged: [], unstaged: [] };
    try {
      await git.add(file);
      const status = await git.status();
      return {
        staged: status.staged,
        unstaged: status.not_added.concat(status.modified, status.deleted, status.renamed.map(r => r.to))
      };
    } catch (error) {
      console.error('Git stage error:', error);
      return { staged: [], unstaged: [] };
    }
  });

  ipcMain.handle('git-unstage', async (event, file) => {
    if (!git) return { staged: [], unstaged: [] };
    try {
      await git.reset(['--', file]);
      const status = await git.status();
      return {
        staged: status.staged,
        unstaged: status.not_added.concat(status.modified, status.deleted, status.renamed.map(r => r.to))
      };
    } catch (error) {
      console.error('Git unstage error:', error);
      return { staged: [], unstaged: [] };
    }
  });

  ipcMain.handle('git-get-author', async () => {
    if (!git) return { name: '', email: '' };
    try {
      const name = await git.raw(['config', 'user.name']);
      const email = await git.raw(['config', 'user.email']);
      return { name: name.trim(), email: email.trim() };
    } catch (error) {
      console.error('Git get author error:', error);
      return { name: '', email: '' };
    }
  });

  ipcMain.handle('git-commit', async (event, message) => {
    if (!git) return { success: false, error: 'Git not initialized' };
    try {
      if (!message || !message.trim()) {
        throw new Error('Commit message is required');
      }
      const commitResult = await git.commit(message);
      const status = await git.status();
      return {
        success: true,
        commit: commitResult,
        staged: status.staged,
        unstaged: status.not_added.concat(status.modified, status.deleted, status.renamed.map(r => r.to))
      };
    } catch (error) {
      console.error('Git commit error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('git-get-branches', async () => {
    if (!git) return { branches: [], current: '' };
    try {
      const branches = await git.branchLocal();
      return { branches: branches.all, current: branches.current };
    } catch (error) {
      console.error('Git get branches error:', error);
      return { branches: [], current: '' };
    }
  });

  ipcMain.handle('git-checkout-branch', async (event, branch) => {
    if (!git) return { success: false, error: 'Git not initialized' };
    try {
      await git.checkout(branch);
      return { success: true };
    } catch (error) {
      console.error('Git checkout error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('git-get-logs', async () => {
    if (!git) return { all: [] };
    try {
      const log = await git.log();
      return log;
    } catch (error) {
      console.error('Git get logs error:', error);
      return { all: [] };
    }
  });
}

module.exports = { initializeGit };
