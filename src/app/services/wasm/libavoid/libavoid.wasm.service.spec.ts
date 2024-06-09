import { TestBed } from '@angular/core/testing';

import { LibAvoidWasmService } from './libavoid.wasm.service';

describe('WasmService', () => {
  let service: LibAvoidWasmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibAvoidWasmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
