import { ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { DiagramComponent } from 'src/app/diagram/diagram.component';
import { LibAvoidWasmService } from 'src/app/services/wasm/libavoid/libavoid.wasm.service';

@Injectable({
  providedIn: 'root',
})
export class Selector {
  public editor: undefined;

  private diagramsContainerView: ViewContainerRef;

  public iDiagramList: Map<
    string,
    [DiagramComponent, ComponentRef<DiagramComponent>]
  > = new Map<string, [DiagramComponent, ComponentRef<DiagramComponent>]>();

  public setContainerView(_diagramsContainerView: ViewContainerRef) {
    this.diagramsContainerView = _diagramsContainerView;
  }

  public setEditor(editor: undefined) {
    this.editor = editor;
  }

  public createDiagram(
    id: string,
    width?: number,
    height?: number,
    left?: number,
    top?: number,
    Avoid?: any,
  ): DiagramComponent {
    let diagram = this.diagramsContainerView.createComponent(DiagramComponent);
    // Set instance properties
    diagram.instance.diagramId = id;
    diagram.instance.container_rect = {x: left || 0, y: top || 0, w: width || 0, h: height || 0};
    diagram.instance.canvas_rect = {x: left || 0, y: top || 0, w: width || 0, h: height || 0};
    diagram.instance.Avoid = Avoid;
    // Ensure that change detection happens once
    diagram.changeDetectorRef.detectChanges();
    this.iDiagramList.set(id, [diagram.instance, diagram]);
    return diagram.instance;
  }

  public destroyDiagram(id: string) {
    let diagram = this.iDiagramList.get(id);
    if (diagram) {
      diagram[1].destroy();
      this.iDiagramList.delete(id);
    }
  }

  public getDiagramFromList(id: string): DiagramComponent {
    let diagram = this.iDiagramList.get(id);
    if (diagram) {
      return diagram[0];
    }
    return new DiagramComponent;
  }

  public isDiagramListempty(): boolean {
    return this.iDiagramList.size > 0;
  }
}
