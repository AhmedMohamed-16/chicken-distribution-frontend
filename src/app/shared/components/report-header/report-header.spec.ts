import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportHeader } from './report-header';

describe('ReportHeader', () => {
  let component: ReportHeader;
  let fixture: ComponentFixture<ReportHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
