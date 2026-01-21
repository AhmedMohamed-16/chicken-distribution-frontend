import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodReport } from './period-report';

describe('PeriodReport', () => {
  let component: PeriodReport;
  let fixture: ComponentFixture<PeriodReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeriodReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
