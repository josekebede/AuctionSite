import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMultipleItemsComponent } from './add-multiple-items.component';

describe('AddMultipleItemsComponent', () => {
  let component: AddMultipleItemsComponent;
  let fixture: ComponentFixture<AddMultipleItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMultipleItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMultipleItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
