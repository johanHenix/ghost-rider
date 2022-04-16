import { TestBed } from '@angular/core/testing';

import { NgGhostRiderService } from './ng-ghost-rider.service';

describe('NgGhostRiderService', () => {
  let service: NgGhostRiderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgGhostRiderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
