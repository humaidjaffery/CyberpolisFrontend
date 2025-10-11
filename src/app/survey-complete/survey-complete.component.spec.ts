import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyCompleteComponent } from './survey-complete.component';

describe('SurveyCompleteComponent', () => {
  let component: SurveyCompleteComponent;
  let fixture: ComponentFixture<SurveyCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SurveyCompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
