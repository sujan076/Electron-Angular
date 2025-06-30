import { Component, inject } from '@angular/core';
import { GitService } from '../git.service';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-branch-management',
  template: `
    <mat-form-field>
      <mat-label>Current Branch</mat-label>
      <mat-select [value]="branches().current" (selectionChange)="checkoutBranch($event.value)">
        @for (branch of branches().branches; track branch) {
          <mat-option [value]="branch">{{ branch }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  styles: [``],
  imports: [CommonModule, MatSelectModule, MatFormFieldModule],
  standalone: true
})
export class BranchManagementComponent {
  private gitService = inject(GitService);
  branches = this.gitService.branches;

  async checkoutBranch(branch: string) {
    await this.gitService.checkoutBranch(branch);
  }
}
