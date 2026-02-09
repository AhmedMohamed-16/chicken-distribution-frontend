import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtPosition } from './debt-position';

describe('DebtPosition', () => {
  let component: DebtPosition;
  let fixture: ComponentFixture<DebtPosition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtPosition]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebtPosition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
