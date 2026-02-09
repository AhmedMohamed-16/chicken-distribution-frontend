import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePermissions } from './manage-permissions';

describe('ManagePermissions', () => {
  let component: ManagePermissions;
  let fixture: ComponentFixture<ManagePermissions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagePermissions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePermissions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
