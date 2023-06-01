import { TestBed } from '@angular/core/testing';

import { ArchivesOflineService } from './archives-ofline.service';

describe('ArchivesOflineService', () => {
  let service: ArchivesOflineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArchivesOflineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
