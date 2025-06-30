import { Component, inject } from '@angular/core';
import { GitService } from '../git.service';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-changes-board',
  templateUrl: './changes-board.component.html',
  styleUrls: ['./changes-board.component.css'],
  imports: [DragDropModule, MatIconModule, MatDividerModule, CommonModule, FormsModule, MatProgressSpinnerModule],
  standalone: true
})
export class ChangesBoardComponent {
  private gitService = inject(GitService);

  stagedChanges = this.gitService.stagedChanges;
  unstagedChanges = this.gitService.unstagedChanges;
  repoPath = this.gitService.repoPath;
  author = this.gitService.author;

  commitMessage = '';
  commitError = '';
  commitSuccess = '';
  dragLoading = false;

  async openRepo() {
    await this.gitService.openRepo();
  }

  async commit() {
    this.commitError = '';
    this.commitSuccess = '';
    if (!this.commitMessage.trim()) {
      this.commitError = 'Commit message is required.';
      return;
    }
    const result = await this.gitService.commit(this.commitMessage);
    if (result.success) {
      this.commitSuccess = 'Commit successful!';
      this.commitMessage = '';
    } else {
      this.commitError = result.error || 'Commit failed.';
    }
  }

  async drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const item = event.previousContainer.data[event.previousIndex];
      const targetListId = event.container.id;

      // Create new arrays for the optimistic update
      const currentStaged = [...this.stagedChanges()];
      const currentUnstaged = [...this.unstagedChanges()];

      let optimisticStaged, optimisticUnstaged;

      if (targetListId === 'stagedList') {
        transferArrayItem(currentUnstaged, currentStaged, event.previousIndex, event.currentIndex);
        optimisticStaged = currentStaged;
        optimisticUnstaged = currentUnstaged;
      } else {
        transferArrayItem(currentStaged, currentUnstaged, event.previousIndex, event.currentIndex);
        optimisticStaged = currentStaged;
        optimisticUnstaged = currentUnstaged;
      }

      this.dragLoading = true;
      try {
        if (targetListId === 'stagedList') {
          await this.gitService.stageFileOptimistic(optimisticStaged, optimisticUnstaged, item);
        } else {
          await this.gitService.unstageFileOptimistic(optimisticStaged, optimisticUnstaged, item);
        }
      } catch (error) {
        console.error('Error during drop operation:', error);
        // The service will revert the state, so no need to do anything here
      } finally {
        this.dragLoading = false;
      }
    }
  }
}
