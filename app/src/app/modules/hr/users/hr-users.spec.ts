import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrUsersComponent } from './hr-users';

describe('HrUsers', () => {
  let component: HrUsersComponent;
  let fixture: ComponentFixture<HrUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
