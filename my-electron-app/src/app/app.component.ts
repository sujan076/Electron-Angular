import { Component } from '@angular/core';
import { ChangesBoardComponent } from './changes-board/changes-board.component';

@Component({
  selector: 'app-root',
  imports: [ChangesBoardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
})
export class AppComponent {
  protected title = 'my-electron-app';
}
