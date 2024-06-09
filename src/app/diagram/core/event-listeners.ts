import * as joint from 'jointjs';
import * as jQuery from 'jquery';
import * as _ from 'lodash';
import * as $ from 'backbone';
import { MVController } from './mv-controller';
import * as d3 from 'd3';

export class D3ZoomEvent {
  private mvc: MVController;
  private graph: joint.dia.Graph;
  private paper: joint.dia.Paper;
  private zoom: any;
  constructor(mvc: MVController) {
    this.mvc = mvc;
    this.zoom = d3.zoom();
  }
  public startListening() {
    this.zoom
      .on('start', (evt: any) => {
        this.mvc.d3_zoomstart(evt);
      })
      .on('zoom', (evt: any) => {
        this.mvc.d3_zoommove(evt);
      })
      .on('end', (evt: any) => {
        this.mvc.d3_zoomend(evt);
      });
  }
  public stopListening() {
    this.zoom.on('start', null)
    .on('zoom', null)
    .on('end', null);
  }
  public getZoom(): any {
    return this.zoom;
  }
}

export class CellMouseEnterLeaveEvent extends joint.mvc.Listener<any[]> {
  public startListening() {
    const [{ mvc, paper, graph }] = this.callbackArguments;
    this.listenTo(paper, 'cell:mouseenter', (ctx, cellView) => {
      mvc.cell_mouseenter(cellView);
    });
    this.listenTo(paper, 'cell:mouseleave', (ctx, cellView) => {
      mvc.cell_mouseleave(cellView);
    });
  }
}

export class PaperMouseMoveEvent extends joint.mvc.Listener<any[]> {
  private enableFiring: boolean = false;
  public startListening() {
    this.enableFiring = true;
    const [{ mvc, paper, graph }] = this.callbackArguments;
    paper.$el.on("mousemove", "svg", (evt: MouseEvent) => {
      if (this.enableFiring) {
        //evt.stopPropagation(); // interrupt dragging
        mvc.paper_mouseover(evt);
      }
    });
  }
  public override stopListening(): void {
    this.enableFiring = false;
  }
}

export class PaperPointerDragEvent extends joint.mvc.Listener<any[]> {
  public startListening() {
    const [{ mvc, paper, graph }] = this.callbackArguments;
    this.listenTo(paper, 'blank:pointerdown', (ctx, evt, x, y) => {
      mvc.paper_pointerdown(evt, x, y);
    });
    this.listenTo(paper, 'blank:pointermove', (ctx, evt, x, y) => {
      mvc.paper_pointermove(evt, x, y);
    });
    this.listenTo(paper, 'blank:pointerup', (ctx, evt, x, y) => {
      mvc.paper_pointerup(evt, x, y);
    });
  }
}

export class PaperPointerClickEvent extends joint.mvc.Listener<any[]> {
  public startListening() {
    const [{ mvc, paper, graph }] = this.callbackArguments;
    this.listenTo(paper, 'blank:pointerclick', (ctx, evt, x, y) => {
      mvc.paper_pointerclick(evt, x, y);
    });
    this.listenTo(paper, 'blank:pointerdblclick', (ctx, evt, x, y) => {
      mvc.paper_pointerdblclick(evt, x, y);
    });
  }
}

export class CellPointerClickEvent extends joint.mvc.Listener<any[]> {
  public startListening() {
    const [{ mvc, paper, graph }] = this.callbackArguments;
    this.listenTo(paper, 'cell:pointerclick', (ctx, view, evt, x, y) => {
      mvc.cell_pointerclick(view, evt, x, y);
    });
    this.listenTo(paper, 'cell:pointerdblclick', (ctx, view, evt, x, y) => {
      mvc.cell_pointerdblclick(view, evt, x, y);
    });
  }
}

export class LinkConnectEvent extends joint.mvc.Listener<any[]> {
  public startListening() {
    const [{ mvc, paper, graph }] = this.callbackArguments;
    this.listenTo(paper, 'link:connect', (ctx, view, evt, elementViewConnected, magnet, arrowhead) => {
      mvc.link_connect(view, evt, elementViewConnected, magnet, arrowhead);
    });
    this.listenTo(paper, 'link:disconnect', (ctx, view, evt, elementViewConnected, magnet, arrowhead) => {
      mvc.link_disconnect(view, evt, elementViewConnected, magnet, arrowhead);
    });
  }
}

export class CellPointerDragEvent extends joint.mvc.Listener<any[]> {
  public startListening() {
    const [{ mvc, paper, graph }] = this.callbackArguments;
    this.listenTo(paper, 'cell:pointerdown', (ctx, view, evt, x, y) => {
      mvc.cell_pointerdown(view, evt, x, y);
    });
    this.listenTo(paper, 'cell:pointermove', (ctx, view, evt, x, y) => {
      mvc.cell_pointermove(view, evt, x, y);
    });
    this.listenTo(paper, 'cell:pointerup', (ctx, view, evt, x, y) => {
      mvc.cell_pointerup(view, evt, x, y);
    });
  }
}

export class GraphAddRemoveEvent extends joint.mvc.Listener<any[]> {
  public startListening() {
    const [{ mvc, paper, graph }] = this.callbackArguments;
    this.listenTo(graph, 'add', (ctx, cell) => {
      mvc.graph_add(cell);
    });
    this.listenTo(graph, 'remove ', (ctx, cell) => {
      mvc.graph_remove(cell);
    });
  }
}

/*export class ElemPointerDragEvent extends joint.mvc.Listener<any[]> {
  public startListening() {
    const [{ mvc, paper, graph }] = this.callbackArguments;
    this.listenTo(paper, 'element:pointerdown', (ctx, view, evt, x, y) => {
      mvc.elem_pointerdown(view, evt, x, y);
    });
    this.listenTo(paper, 'element:pointermove', (ctx, view, evt, x, y) => {
      mvc.elem_pointermove(view, evt, x, y);
    });
    this.listenTo(paper, 'element:pointerup', (ctx, view, evt, x, y) => {
      mvc.elem_pointerup(view, evt, x, y);
    });
  }
}*/

export class PortMouseOverEvent extends joint.mvc.Listener<any[]> {
  private paper: any = undefined;
  public startListening() {
    const [{ mvc, paper, graph }] = this.callbackArguments;
    this.paper = paper;
    paper.$el.on('mouseenter', '.joint-port', (evt: any) => {
      const cellView = paper.findView(evt.target);
      const portId = cellView.findAttribute('port', evt.target);
      mvc.port_mouseenter(evt, cellView, portId);
    });
    paper.$el.on('mouseleave', '.joint-port', (evt: any) => {
      const cellView = paper.findView(evt.target);
      const portId = cellView.findAttribute('port', evt.target);
      mvc.port_mouseleave(evt, cellView, portId);
    });
  }
  public override stopListening(): void {
    if (this.paper) {
      this.paper.$el.off('mouseenter', '.joint-port', null);
      this.paper.$el.off('mouseleave', '.joint-port', null);
    }
  }
}

export class KeyBoardEvent extends joint.mvc.Listener<any[]> {
  public startListening() {
    const [{ mvc, paper, graph }] = this.callbackArguments;
    d3.select(window)
      .on("keydown", (evt: KeyboardEvent) => {
        mvc.keyboard_keydown(evt);
      })
      .on("keyup", (evt: KeyboardEvent) => {
        mvc.keyboard_keyup(evt);
      });
  }
  public override stopListening(): void {
    d3.select(window)
      .on("keydown", null)
      .on("keyup", null);
  }
}

export class WindowFocusEvent extends joint.mvc.Listener<any[]> {
  public startListening() {
    const [{ mvc, paper, graph }] = this.callbackArguments;
    d3.select(window)
      .on("focus", (evt: FocusEvent) => {
        mvc.window_focus(evt);
      })
      .on("blur", (evt: FocusEvent) => {
        mvc.window_blur(evt);
      });
  }
  public override stopListening(): void {
    d3.select(window)
      .on("focus", null)
      .on("blur", null);
  }
}

