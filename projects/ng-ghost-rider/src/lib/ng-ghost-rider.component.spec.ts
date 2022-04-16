import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgGhostRiderComponent } from './ng-ghost-rider.component';

describe('NgGhostRiderComponent', () => {
  let component: NgGhostRiderComponent;
  let fixture: ComponentFixture<NgGhostRiderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgGhostRiderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgGhostRiderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
