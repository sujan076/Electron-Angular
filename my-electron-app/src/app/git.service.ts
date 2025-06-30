import { Injectable, signal } from '@angular/core';

declare global {
  interface Window {
    electronAPI: {
      gitStatus: () => Promise<{ staged: string[], unstaged: string[] }>;
      gitStage: (file: string) => Promise<{ staged: string[], unstaged: string[] }>;
      gitUnstage: (file: string) => Promise<{ staged: string[], unstaged: string[] }>;
      gitOpenRepo: () => Promise<{ repoPath: string | null }>;
      gitGetRepoPath: () => Promise<{ repoPath: string }>;
      gitGetAuthor: () => Promise<{ name: string, email: string }>;
      gitCommit: (message: string) => Promise<{ success: boolean, error?: string, commit?: any, staged?: string[], unstaged?: string[] }>;
      gitGetBranches: () => Promise<{ branches: string[], current: string }>;
      gitCheckoutBranch: (branch: string) => Promise<{ success: boolean, error?: string }>;
      gitGetLogs: () => Promise<{ all: any[] }>;
      gitPull: () => Promise<{ success: boolean, error?: string }>;
      gitPush: () => Promise<{ success: boolean, error?: string }>;
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class GitService {
  private electronAPI = window.electronAPI;

  stagedChanges = signal<{ icon: string, name: string }[]>([]);
  unstagedChanges = signal<{ icon: string, name: string }[]>([]);
  repoPath = signal<string>('');
  author = signal<{ name: string, email: string }>({ name: '', email: '' });
  branches = signal<{ branches: string[], current: string }>({ branches: [], current: '' });
  logs = signal<any[]>([]);

  constructor() {
    this.refresh();
  }

  async refresh() {
    if (!this.electronAPI) {
      console.warn('Not running in Electron environment. Using mock data.');
      this.stagedChanges.set([{ icon: 'edit', name: 'sample-staged.txt' }]);
      this.unstagedChanges.set([{ icon: 'note', name: 'sample-unstaged.txt' }]);
      this.repoPath.set('/fake/path/for/browser/testing');
      this.author.set({ name: 'Test User', email: 'test@example.com' });
      this.branches.set({ branches: ['master', 'develop'], current: 'master' });
      this.logs.set([
        { hash: '1234567', date: '2023-01-01', message: 'Initial commit', author_name: 'Test User' },
        { hash: '890abcde', date: '2023-01-02', message: 'Added new feature', author_name: 'Test User' },
      ]);
      return;
    }
    const status = await this.electronAPI.gitStatus();
    this.stagedChanges.set(status.staged.map(name => ({ icon: 'edit', name })));
    this.unstagedChanges.set(status.unstaged.map(name => ({ icon: 'note', name })));
    const repoPathResult = await this.electronAPI.gitGetRepoPath();
    this.repoPath.set(repoPathResult.repoPath);
    const authorResult = await this.electronAPI.gitGetAuthor();
    this.author.set(authorResult);
    const branchesResult = await this.electronAPI.gitGetBranches();
    this.branches.set(branchesResult);
    const logsResult = await this.electronAPI.gitGetLogs();
    this.logs.set(logsResult.all);
  }

  async stageFileOptimistic(staged: any[], unstaged: any[], file: {name: string}) {
    const originalStaged = this.stagedChanges();
    const originalUnstaged = this.unstagedChanges();

    this.stagedChanges.set(staged);
    this.unstagedChanges.set(unstaged);

    try {
        const status = await this.electronAPI.gitStage(file.name);
        this.stagedChanges.set(status.staged.map(name => ({ icon: 'edit', name })));
        this.unstagedChanges.set(status.unstaged.map(name => ({ icon: 'note', name })));
    } catch (e) {
        console.error('Staging failed, reverting', e);
        this.stagedChanges.set(originalStaged);
        this.unstagedChanges.set(originalUnstaged);
        throw e;
    }
  }

  async unstageFileOptimistic(staged: any[], unstaged: any[], file: {name: string}) {
    const originalStaged = this.stagedChanges();
    const originalUnstaged = this.unstagedChanges();

    this.stagedChanges.set(staged);
    this.unstagedChanges.set(unstaged);

    try {
        const status = await this.electronAPI.gitUnstage(file.name);
        this.stagedChanges.set(status.staged.map(name => ({ icon: 'edit', name })));
        this.unstagedChanges.set(status.unstaged.map(name => ({ icon: 'note', name })));
    } catch (e) {
        console.error('Unstaging failed, reverting', e);
        this.stagedChanges.set(originalStaged);
        this.unstagedChanges.set(originalUnstaged);
        throw e;
    }
  }

  async openRepo() {
    if (!this.electronAPI) {
      console.warn('Not running in Electron environment');
      return;
    }
    const result = await this.electronAPI.gitOpenRepo();
    if (result.repoPath) {
      await this.refresh();
    }
  }

  async commit(message: string): Promise<{ success: boolean, error?: string }> {
    if (!this.electronAPI) {
      console.warn('Not running in Electron environment');
      return { success: false, error: 'Not running in Electron environment' };
    }
    const result = await this.electronAPI.gitCommit(message);
    if (result.success) {
      await this.refresh();
    }
    return result;
  }

  async checkoutBranch(branch: string) {
    if (!this.electronAPI) {
      console.warn('Not running in Electron environment');
      return;
    }
    const result = await this.electronAPI.gitCheckoutBranch(branch);
    if (result.success) {
      await this.refresh();
    }
  }

  async pull(): Promise<{ success: boolean, error?: string }> {
    if (!this.electronAPI) {
      console.warn('Not running in Electron environment');
      return { success: false, error: 'Not running in Electron environment' };
    }
    const result = await this.electronAPI.gitPull();
    if (result.success) {
      await this.refresh();
    }
    return result;
  }

  async push(): Promise<{ success: boolean, error?: string }> {
    if (!this.electronAPI) {
      console.warn('Not running in Electron environment');
      return { success: false, error: 'Not running in Electron environment' };
    }
    const result = await this.electronAPI.gitPush();
    if (result.success) {
      await this.refresh();
    }
    return result;
  }
}
