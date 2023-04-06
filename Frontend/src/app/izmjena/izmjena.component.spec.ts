import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IzmjenaComponent } from './izmjena.component';

describe('IzmjenaComponent', () => {
  let component: IzmjenaComponent;
  let fixture: ComponentFixture<IzmjenaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IzmjenaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IzmjenaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
