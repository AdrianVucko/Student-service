import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogiranjeComponent } from './logiranje.component';

describe('LogiranjeComponent', () => {
  let component: LogiranjeComponent;
  let fixture: ComponentFixture<LogiranjeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogiranjeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogiranjeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
