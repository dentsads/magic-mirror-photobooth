import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Anim1Component } from './anim1.component';

describe('Anim1Component', () => {
  let component: Anim1Component;
  let fixture: ComponentFixture<Anim1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Anim1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Anim1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
