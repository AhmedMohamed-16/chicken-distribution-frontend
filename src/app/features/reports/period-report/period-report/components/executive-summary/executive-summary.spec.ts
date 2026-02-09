import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutiveSummary } from './executive-summary';

describe('ExecutiveSummary', () => {
  let component: ExecutiveSummary;
  let fixture: ComponentFixture<ExecutiveSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecutiveSummary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExecutiveSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
