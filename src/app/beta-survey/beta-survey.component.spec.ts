import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetaSurveyComponent } from './beta-survey.component';

describe('BetaSurveyComponent', () => {
  let component: BetaSurveyComponent;
  let fixture: ComponentFixture<BetaSurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BetaSurveyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BetaSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
