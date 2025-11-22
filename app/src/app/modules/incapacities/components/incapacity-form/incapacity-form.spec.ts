import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncapacityForm } from './incapacity-form';

describe('IncapacityForm', () => {
  let component: IncapacityForm;
  let fixture: ComponentFixture<IncapacityForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncapacityForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncapacityForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
