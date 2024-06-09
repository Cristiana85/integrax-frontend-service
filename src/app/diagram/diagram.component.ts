import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ZoomPan } from './features/zoompan/zoompan';
import { DiaHelper } from './utils/diagram-helper';
import { Selections } from './features/selection/selections';
import { IRectangle } from './utils/types';
import { MVController } from './core/mv-controller';
import * as joint from 'jointjs';
import * as jQuery from 'jquery';
import * as _ from 'lodash';
import * as $ from 'backbone';

import { RfAmp } from './library/devices/rfbasic/rfamp';
import { ElementProps } from './core/element-props';
import { Node } from './library/junctions/std-node';
import { LibAvoidWasmService } from '../services/wasm/libavoid/libavoid.wasm.service';

@Component({
  selector: 'i-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss'],
})
export class DiagramComponent implements OnInit, AfterViewInit {
  // Inputs
  @Input()
  diagramId: string;
  @Input()
  container_rect: IRectangle;
  @Input()
  canvas_rect: IRectangle;
  @Input()
  Avoid: any;

  // Emitters
  @Output()
  onDiagramSelection: EventEmitter<undefined> = new EventEmitter();

  @ViewChild('canvas') canvas: ElementRef;

  public mvc: MVController;

  // features
  public zoompan: ZoomPan;
  public selection: Selections;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.mvc = new MVController(this);
    this.mvc.mountDiagram(this.canvas);
    this.mvc.databind();
    this.mvc.mountFeature('zoompan');
    this.mvc.mountFeature('selection');
    this.mvc.mountFeature('hover');
    this.mvc.mountFeature('inherit_halo');
    this.mvc.mountFeature('halo');
    this.mvc.mountFeature('wiring', this.Avoid);
    this.mvc.mountFeature('intersection');
    this.mvc.graph.on('change', (cell: joint.dia.Cell, opt) => {
      //console.log(cell.changed);
    });

    this.mvc.graph.on('add', (cell: joint.dia.Cell, opt) => {
      //console.log('cell');
    });
  }

  // add removing elements/cells
  public import(lib?: string): string {

    //this.mvc.libManager.createElement('RfBasic', 'RfAmp');

    /*var rect = new joint.shapes.standard.Rectangle();
    var custom = {
      devInfo
    };
    rect.prop({custom});
    rect.position(300, 100);
    rect.resize(100, 200);
    //rect.rotate(45);
    rect.attr({
        body: {
            fill: 'lightgray',
            strokeWidth: 0
        },
        /*label: {
            text: 'Hello',
            fill: 'white'
        }
    });
    rect.addTo(this.mvc.graph);*/

    /*var custom = {
      devInfo
    };
    var path = new joint.shapes.standard.Path();
    path.resize(100, 100);
    path.position(300, 200);
    path.attr('root/title', 'joint.shapes.standard.Path');
    path.attr('label/text', 'Path');
    path.attr('body/refD', 'M 0 5 10 0 C 20 0 20 20 10 20 L 0 15 Z');
    path.prop({custom});
    path.addTo(this.mvc.graph);*/

    const a = new RfAmp();
    a.translate(200, 100);
    a.addTo(this.mvc.graph);

    const b = new RfAmp();
    b.translate(400, 300);
    b.addTo(this.mvc.graph);


    /*this.mvc.graph.fromJSON({
      cells: [
        {
          type: 'xtoollib.RfBasic.RfAmp',
          position: { x: 200, y: 100 },
        },
        {
          type: 'xtoollib.RfBasic.RfAmp',
          position: { x: 400, y: 300 },
        },
      ],
    });*/


    /*const link = new joint.shapes.standard.Link();

    link.source(a);
    link.target(b);
    link.set('vertices', [{x: 450, y: 110}]);

    link.addTo(this.mvc.graph);
    var segmentsTool = new joint.linkTools.Segments();

    var toolsView = new joint.dia.ToolsView({
        tools: [segmentsTool]
    });

    var linkView = link.findView(this.mvc.paper);
    linkView.addTools(toolsView);
    linkView.hideTools();*/

    return '';
  }

  public remove(cellId?: string) {
    if (this.mvc.halo.isHaloEnabled()) {
      this.mvc.halo.closeRubberBand();
    }
    this.mvc.selection.getSelectedElements().forEach((elview) => {
     if (elview.model.getEmbeddedCells()) {
        elview.model.getEmbeddedCells().forEach((el) => {
          el.remove();
        });
      }
      elview.model.remove();
    });
  }

  private addHuge() {
    const rect = new joint.shapes.standard.Rectangle();
    const link = new joint.shapes.standard.Link();
    const w = 100;
    const h = 100;
    const len_row = 10;
    const len_col = 10;
    for (var i = 0; i < len_row; i++) {
      for (var j = 0; j < len_col; j++) {
        rect
          .clone()
          .translate(j * w, i * h)
          .resize(w, h)
          .addTo(this.mvc.graph);
      }
    }

    var arr = new Array<joint.shapes.standard.Link>();

    const step_x = 100;
    const step_y = 100;

    for (var i = 0; i < len_row; i++) {
      for (var j = 0; j < len_col; j++) {
        arr.push(
          link
            .clone()
            .source({ x: 0, y: 0 })
            .target({ x: 100, y: 100 })
            .vertices([
              { x: 50, y: 100 },
              { x: 50, y: 0 },
            ])
            .translate(j * step_x, i * step_y)
        );
      }
    }
    this.mvc.graph.addCells(arr);
  }

  private addResistor() {
    const rect1 = new joint.shapes.logic.Gate11({
      size: { width: 150, height: 90 },
      attrs: {
        image: {
          'xlink:href': '../../assets/res.svg',
        },
      },
    });

    const rect2 = new joint.shapes.standard.Rectangle();
    rect2.attr('body/pointer-events', 'none');
    rect2.attr('body/display', 'none');
    rect2.attr('body/stroke', 'blue');
    rect2.attr('body/stroke-width', 8);
    rect2.attr('body/opacity', 0.5);

    rect2.resize(150, 45);
    rect1.translate(250, 250);
    rect2.translate(250, 272.5);

    const textBlock = new joint.shapes.standard.TextBlock();
    textBlock.resize(50, 50);
    textBlock.position(250, 250);
    textBlock.attr('root/pointer-events', 'none');
    textBlock.attr('root/title', 'joint.shapes.standard.TextBlock');
    textBlock.attr('body/fill', 'transparent');
    textBlock.attr('body/stroke', '');
    textBlock.attr('label/text', 'Cid: 101');
    // Styling of the label via `style` presentation attribute (i.e. CSS).
    textBlock.attr('label/style/color', 'red');

    rect1.embed(rect2);
    rect1.embed(textBlock);

    //rect1.resize(100, 50);
    this.mvc.graph.addCells([rect2, textBlock, rect1]);


  }

}
