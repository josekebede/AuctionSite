import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialBidsComponent } from './special-bids.component';

describe('SpecialBidsComponent', () => {
  let component: SpecialBidsComponent;
  let fixture: ComponentFixture<SpecialBidsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpecialBidsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialBidsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
