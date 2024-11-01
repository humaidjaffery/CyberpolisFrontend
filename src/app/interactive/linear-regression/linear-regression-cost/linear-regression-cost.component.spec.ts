import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinearRegressionCostComponent } from './linear-regression-cost.component';

describe('LinearRegressionCostComponent', () => {
  let component: LinearRegressionCostComponent;
  let fixture: ComponentFixture<LinearRegressionCostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LinearRegressionCostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinearRegressionCostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
