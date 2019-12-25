import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPrintPhotosComponent } from './select-print-photos.component';

describe('PrintPhotosComponent', () => {
  let component: SelectPrintPhotosComponent;
  let fixture: ComponentFixture<SelectPrintPhotosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectPrintPhotosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectPrintPhotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
