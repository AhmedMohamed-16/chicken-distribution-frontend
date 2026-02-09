import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueBreakdown } from './revenue-breakdown';

describe('RevenueBreakdown', () => {
  let component: RevenueBreakdown;
  let fixture: ComponentFixture<RevenueBreakdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueBreakdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenueBreakdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
