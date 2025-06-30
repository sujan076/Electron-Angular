import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangesBoardComponent } from './changes-board.component';

describe('ChangesBoardComponent', () => {
  let component: ChangesBoardComponent;
  let fixture: ComponentFixture<ChangesBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangesBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangesBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
