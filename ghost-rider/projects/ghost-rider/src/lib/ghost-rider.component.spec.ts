import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GhostRiderComponent } from './ghost-rider.component';

describe('GhostRiderComponent', () => {
  let component: GhostRiderComponent;
  let fixture: ComponentFixture<GhostRiderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GhostRiderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GhostRiderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
