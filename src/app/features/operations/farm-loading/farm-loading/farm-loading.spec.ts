import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmLoading } from './farm-loading';

describe('FarmLoading', () => {
  let component: FarmLoading;
  let fixture: ComponentFixture<FarmLoading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmLoading]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarmLoading);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
