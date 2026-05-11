import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedReportHeaderComponent } from './report-header';

describe('ReportHeader', () => {
  let component: SharedReportHeaderComponent;
  let fixture: ComponentFixture<SharedReportHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedReportHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedReportHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
