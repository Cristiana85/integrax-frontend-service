import { Injectable } from "@angular/core";
import { filter, map } from "rxjs/operators";

import * as Module from '../../../wasm/libavoid.js';
import '!!file-loader?name=wasm/test.wasm!../../../wasm/libavoid.wasm';
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class WasmService {
  module: any;

  wasmReady = new BehaviorSubject<boolean>(false);

  constructor() {
    this.instantiateWasm("wasm/test.wasm");
  }

  private async instantiateWasm(url: string) {
    // fetch the wasm file
    const wasmFile = await fetch(url);

    // convert it into a binary array
    const buffer = await wasmFile.arrayBuffer();
    const binary = new Uint8Array(buffer);

    // create module arguments
    // including the wasm-file
    const moduleArgs = {
      wasmBinary: binary,
      onRuntimeInitialized: () => {
        this.wasmReady.next(true);
      }
    };

    // instantiate the module
    this.module = Module(moduleArgs);

    //Check if WebAssembly is supported
    const supported = (() => {
      try {
        if (typeof WebAssembly === "object"
          && typeof WebAssembly.instantiate === "function") {
          const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
          if (module instanceof WebAssembly.Module)
            return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
        }
      } catch (e) {
      }
      return false;
    })();

    console.log(supported ? "WebAssembly is supported" : "WebAssembly is not supported");
  }

  public multiply(n: number, m: number): Observable<number> {
    return this.wasmReady.pipe(filter(value => value === true)).pipe(
      map(() => {
        return this.module.__zone_symbol__value._multply(n, m);
      })
    );
  }

  public sum(n: number, m: number): Observable<number> {
    return this.wasmReady.pipe(filter(value => value === true)).pipe(
      map(() => {
        return this.module.__zone_symbol__value._sum(n, m);
      })
    );
  }
}
