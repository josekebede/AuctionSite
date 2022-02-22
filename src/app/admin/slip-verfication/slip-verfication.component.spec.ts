import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlipVerficationComponent } from './slip-verfication.component';

describe('SlipVerficationComponent', () => {
  let component: SlipVerficationComponent;
  let fixture: ComponentFixture<SlipVerficationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SlipVerficationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SlipVerficationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
