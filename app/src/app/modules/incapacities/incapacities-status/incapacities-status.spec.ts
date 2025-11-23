import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncapacitiesStatus } from './incapacities-status';

describe('IncapacitiesStatus', () => {
  let component: IncapacitiesStatus;
  let fixture: ComponentFixture<IncapacitiesStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncapacitiesStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncapacitiesStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
