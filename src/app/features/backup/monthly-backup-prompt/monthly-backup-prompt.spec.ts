import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyBackupPrompt } from './monthly-backup-prompt';

describe('MonthlyBackupPrompt', () => {
  let component: MonthlyBackupPrompt;
  let fixture: ComponentFixture<MonthlyBackupPrompt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyBackupPrompt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyBackupPrompt);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
