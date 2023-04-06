import { TestBed } from '@angular/core/testing';

import { GlavniService } from './glavni.service';

describe('GlavniService', () => {
  let service: GlavniService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlavniService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
