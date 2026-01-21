import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChickenTypes } from './chicken-types';

describe('ChickenTypes', () => {
  let component: ChickenTypes;
  let fixture: ComponentFixture<ChickenTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChickenTypes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChickenTypes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
