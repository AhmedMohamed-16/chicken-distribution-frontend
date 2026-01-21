import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtHistoryDialog } from './debt-history-dialog';

describe('DebtHistoryDialog', () => {
  let component: DebtHistoryDialog;
  let fixture: ComponentFixture<DebtHistoryDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtHistoryDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebtHistoryDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
