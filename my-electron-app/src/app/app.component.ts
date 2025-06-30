import { Component } from '@angular/core';
import { ChangesBoardComponent } from './changes-board/changes-board.component';
import { BranchManagementComponent } from './branch-management/branch-management.component';
import { CommitHistoryComponent } from './commit-history/commit-history.component';

@Component({
  selector: 'app-root',
  imports: [ChangesBoardComponent, BranchManagementComponent, CommitHistoryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
})
export class AppComponent {
  protected title = 'my-electron-app';
}
