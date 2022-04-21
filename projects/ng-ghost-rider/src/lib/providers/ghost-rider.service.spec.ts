import { TestBed } from '@angular/core/testing';

import { GhostRiderService } from './ghost-rider.service';

describe('NgGhostRiderService', () => {
  let service: GhostRiderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GhostRiderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
