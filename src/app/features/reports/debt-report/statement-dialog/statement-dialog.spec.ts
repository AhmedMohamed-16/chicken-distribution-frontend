import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatementDialog } from './statement-dialog';

describe('StatementDialog', () => {
  let component: StatementDialog;
  let fixture: ComponentFixture<StatementDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatementDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatementDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
