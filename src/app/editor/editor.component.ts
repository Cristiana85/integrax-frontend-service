import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Selector } from './components/integra-editor-selector';
import { LibAvoidWasmService } from '../services/wasm/libavoid/libavoid.wasm.service';
import { filter } from 'rxjs';

@Component({
  selector: 'i-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})

export class EditorComponent implements OnInit, AfterViewInit, OnDestroy {
  // general diagram
  @ViewChild('diacontainer', { read: ViewContainerRef })
  diagramsContainerView!: ViewContainerRef;

  constructor(
    private sel: Selector,
    private avoidWasmService: LibAvoidWasmService
  ) {}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.sel.setContainerView(this.diagramsContainerView);
    this.createDiagram();
  }

  ngOnDestroy(): void {
  }

  createDiagram() {
    this.avoidWasmService.wasmReady.pipe(filter((value) => value === true)).subscribe((ret) => {
      const Avoid = this.avoidWasmService.module.__zone_symbol__value;
      const diagram = this.sel.createDiagram('test', window.innerWidth, window.innerHeight, 0, 0, Avoid);
    });
  }

  removeDiagram() {
    if (this.sel.isDiagramListempty()) {
      this.sel.destroyDiagram('test');
    }
  }

  /*// INPUT from Window
  @HostListener('window:focus', ['$event'])
  onFocused(event: any) {
    event.preventDefault();
  }

  @HostListener('window:blur', ['$event'])
  onBlurred(event: any) {
    event.preventDefault();
  }*/

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    event.preventDefault();
    this.sel.getDiagramFromList('test').container_rect.w = window.innerWidth;
    this.sel.getDiagramFromList('test').container_rect.h = window.innerHeight;
  }

}
