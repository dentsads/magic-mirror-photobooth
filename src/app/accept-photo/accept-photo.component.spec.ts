import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptPhotoComponent } from './accept-photo.component';

describe('AcceptPhotoComponent', () => {
  let component: AcceptPhotoComponent;
  let fixture: ComponentFixture<AcceptPhotoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcceptPhotoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptPhotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
