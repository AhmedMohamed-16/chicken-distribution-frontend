import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDetailsDialog } from './user-details-dialog';

describe('UserDetailsDialog', () => {
  let component: UserDetailsDialog;
  let fixture: ComponentFixture<UserDetailsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDetailsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
