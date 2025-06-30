import { Component, inject } from '@angular/core';
import { GitService } from '../git.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-commit-history',
  template: `
    <div class="commit-history-container">
      <h2>Commit History</h2>
      @if (logs().length > 0) {
        <table mat-table [dataSource]="logs()" class="mat-elevation-z8">

          <!-- Hash Column -->
          <ng-container matColumnDef="hash">
            <th mat-header-cell *matHeaderCellDef> Hash </th>
            <td mat-cell *matCellDef="let element"> {{element.hash.substring(0, 7)}} </td>
          </ng-container>

          <!-- Author Column -->
          <ng-container matColumnDef="author">
            <th mat-header-cell *matHeaderCellDef> Author </th>
            <td mat-cell *matCellDef="let element"> {{element.author_name}} </td>
          </ng-container>

          <!-- Date Column -->
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef> Date </th>
            <td mat-cell *matCellDef="let element"> {{element.date | date:'short'}} </td>
          </ng-container>

          <!-- Message Column -->
          <ng-container matColumnDef="message">
            <th mat-header-cell *matHeaderCellDef> Message </th>
            <td mat-cell *matCellDef="let element"> {{element.message}} </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      } @else {
        <p>No commit history available.</p>
      }
    </div>
  `,
  styles: [`
    .commit-history-container {
      margin: 20px;
    }

    table {
      width: 100%;
    }
  `],
  imports: [CommonModule, MatTableModule],
  standalone: true
})
export class CommitHistoryComponent {
  private gitService = inject(GitService);
  logs = this.gitService.logs;
  displayedColumns: string[] = ['hash', 'author', 'date', 'message'];
}
