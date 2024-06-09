import { ElementRef } from '@angular/core';
import * as joint from 'jointjs';
import { DiagramComponent } from '../diagram.component';
import { HaloLite } from '../features/halo/halolite';
import { Hovers } from '../features/hover/hovers';
import { InheritGroupingParent } from '../features/inherit_halo/inherit-grouping-parent';
import { IntersectionController } from '../features/intersection/intersection-controller';
import { Selections } from '../features/selection/selections';
import { ZoomPan } from '../features/zoompan/zoompan';
import { WiringLink } from '../library/connectors/wiring-link';
import { RfAmp } from '../library/devices/rfbasic/rfamp';
import { Node } from '../library/junctions/std-node';
import { LibraryManager } from '../library/lib-manager';
import { WiringController } from '../plugins/wiring/wiring-controller';
import { DiaHelper } from '../utils/diagram-helper';
import { ClientProfile } from './client-profile';
import { StdDevice } from './configurations/std-device';
import { StdLink } from './configurations/std-link';
import { StdShape } from './configurations/std-shape';
import {
  CellMouseEnterLeaveEvent,
  CellPointerClickEvent,
  CellPointerDragEvent,
  D3ZoomEvent,
  GraphAddRemoveEvent,
  KeyBoardEvent,
  LinkConnectEvent,
  PaperMouseMoveEvent,
  PaperPointerClickEvent,
  PaperPointerDragEvent,
  PortMouseOverEvent,
  WindowFocusEvent,
} from './event-listeners';
import { ModelConfig } from './model-config';
import { ModelInterface } from './model-interface';

export enum MVC_STATE {
  NONE,
  SELECTION,
  DRAG,
  ZOOM,
  PAN,
  HALO_DRAG,
  LINKDRAWING,
}

export class MVController {
  public client: ClientProfile;

  public diagram: DiagramComponent;

  public lModelConfig: ModelConfig[] = [];

  public libManager: LibraryManager;

  public Avoid: any;

  private isMounted: boolean = false;

  private state: MVC_STATE = MVC_STATE.SELECTION;

  private autoscrolltimer: any;

  /**
   * Events listeners
   */
  public zoompan_listener: D3ZoomEvent;

  public cell_mouseover_listener: CellMouseEnterLeaveEvent;

  public paper_pointerdrag_listener: PaperPointerDragEvent;

  public paper_mousemove_listener: PaperMouseMoveEvent;

  public cell_pointerdrag_listener: CellPointerDragEvent;

  public paper_pointerclick_listener: PaperPointerClickEvent;

  public cell_pointerclick_listener: CellPointerClickEvent;

  public link_connect_listener: LinkConnectEvent;

  public port_mouseover_listener: PortMouseOverEvent;

  public keyboard_listener: KeyBoardEvent;

  public window_focus_listener: WindowFocusEvent;

  public graph_addremove_listener: GraphAddRemoveEvent;

  /**
   * Features
   */
  public graph: joint.dia.Graph;

  public paper: joint.dia.Paper;

  public importer: Selections;

  public zoompan: ZoomPan;

  public scroller: ZoomPan;

  public selection: Selections;

  public hover: Hovers;

  public halo: HaloLite;

  public inherit_halo: InheritGroupingParent;

  public wiring: WiringController;

  public intersection: IntersectionController;

  private firstCycleCellPointermove: boolean = true;

  /**
   * Plugins
   */

  /**
   * Diagram options
   */
  public opts: {
    gridline: {
      name: string;
      drag_grid_size: number;
      resize_grid_size: number;
      rotation_grid_size: number;
      draw_grid_size: number;
      color: string;
      thickness: number;
      opacity: number;
      blur: number;
      min_scale_show: number;
      max_scale_show: number;
    };
    background: {
      color: string;
      opacity: number;
    };
    autoscroll: {
      enable: boolean;
      timer: boolean;
      step_x: number;
      step_y: number;
      timer_setting_ms: number;
      border: {
        top: number;
        right: number;
        bottom: number;
        left: number;
      };
    };
    interactive: {
      element_move: boolean;
      link_move: boolean;
      label_move: boolean;
      arrowhead_move: boolean;
      vertex_move: boolean;
      vertex_add: boolean;
      vertex_remove: boolean;
      useLink_tools: boolean;
    };
    halo: {
      enable: boolean;
      isInherit: boolean;
    };
    wiring: {
      enable: boolean;
    };
  } = {
    gridline: {
      name: 'mesh',
      drag_grid_size: 10,
      resize_grid_size: 25,
      rotation_grid_size: 5,
      draw_grid_size: 100,
      color: 'black',
      thickness: 2,
      opacity: 0.1,
      blur: 0.5,
      min_scale_show: 0.2,
      max_scale_show: 4,
    },
    background: {
      color: 'white',
      opacity: 1,
    },
    autoscroll: {
      enable: true,
      timer: true,
      step_x: 10,
      step_y: 10,
      timer_setting_ms: 10,
      border: {
        top: 25,
        right: 25,
        bottom: 25,
        left: 25,
      },
    },
    interactive: {
      element_move: true,
      link_move: false,
      label_move: false,
      arrowhead_move: false,
      vertex_move: false,
      vertex_add: false,
      vertex_remove: false,
      useLink_tools: false,
    },
    halo: {
      enable: true,
      isInherit: false,
    },
    wiring: {
      enable: true,
    },
  };

  constructor(diagram: DiagramComponent) {
    this.diagram = diagram;
    this.client = new ClientProfile();
    // add all useful configurations
    this.lModelConfig.push(new StdDevice());
    this.lModelConfig.push(new StdLink());
    this.lModelConfig.push(new StdShape());
  }

  public loadLibrary(lib: any) {
    //this.diagram.onDiagramSelection.emit();
  }

  public running: boolean = false;

  public mountDiagram(canvas: ElementRef) {
    const lib = joint.shapes;
    // initilize graph
    this.graph = this.graph = new joint.dia.Graph({}, { cellNamespace: lib });
    // initilize paper
    this.paper = new joint.dia.Paper({
      el: canvas.nativeElement,
      model: this.graph,
      width: '100%',
      height: '100%',
      freeze: true,
      async: true,
      drawGrid: true,
      markAvailable: true,
      sorting: joint.dia.Paper.sorting.APPROX,
      cellViewNamespace: lib,
    } as any);

    this.setPaperDelegation(true);

    this.libManager = new LibraryManager(this, this.paper, this.graph);

    const ctx = { mvc: this, paper: this.paper, graph: this.graph };

    this.keyboard_listener = new KeyBoardEvent(ctx); //.startListening();
    this.window_focus_listener = new WindowFocusEvent(ctx);

    this.zoompan_listener = new D3ZoomEvent(this);
    this.paper_pointerdrag_listener = new PaperPointerDragEvent(ctx);
    this.paper_mousemove_listener = new PaperMouseMoveEvent(ctx);
    this.cell_mouseover_listener = new CellMouseEnterLeaveEvent(ctx);
    this.cell_pointerdrag_listener = new CellPointerDragEvent(ctx);
    this.paper_pointerclick_listener = new PaperPointerClickEvent(ctx);
    this.cell_pointerclick_listener = new CellPointerClickEvent(ctx);
    this.port_mouseover_listener = new PortMouseOverEvent(ctx);
    this.link_connect_listener = new LinkConnectEvent(ctx);
    this.graph_addremove_listener = new GraphAddRemoveEvent(ctx);

    this.keyboard_listener.startListening();
    this.window_focus_listener.startListening();
    this.zoompan_listener.startListening();
    this.cell_mouseover_listener.startListening();
    this.paper_pointerdrag_listener.startListening();
    this.paper_mousemove_listener.stopListening();
    this.cell_pointerdrag_listener.startListening();
    this.paper_pointerclick_listener.startListening();
    this.cell_pointerclick_listener.startListening();
    this.port_mouseover_listener.startListening();
    this.link_connect_listener.startListening();
    this.graph_addremove_listener.startListening();
    this.paper.unfreeze();
    this.isMounted = true;
  }

  public mountFeature(feature: string, param?: any) {
    if (this.isMounted) {
      switch (feature) {
        case 'import': {
          break;
        }
        case 'zoompan': {
          if (!this.zoompan) {
            this.zoompan = new ZoomPan(this, this.paper, this.graph);
            this.zoompan.mount(this.zoompan_listener.getZoom());
          }
          break;
        }
        case 'selection': {
          if (!this.selection) {
            this.selection = new Selections(this);
            this.selection.mount();
          }
          break;
        }
        case 'hover': {
          if (!this.hover) {
            this.hover = new Hovers(this);
            this.hover.mount();
          }
          break;
        }
        case 'inherit_halo': {
          if (this.opts.halo.enable && !this.halo) {
            if (this.selection) {
              this.inherit_halo = new InheritGroupingParent(
                this.selection,
                this
              );
              this.inherit_halo.mount();
            }
          }
          break;
        }
        case 'halo': {
          if (this.opts.halo.enable && !this.halo) {
            if (this.selection) {
              this.halo = new HaloLite(this);
              this.halo.mount();
            }
          }
          break;
        }
        case 'wiring': {
          if (this.opts.wiring.enable) {
            if (param) {
              this.Avoid = param;
              this.wiring = new WiringController(this);
              this.wiring.mount();
            }
          }
          break;
        }
        case 'intersection': {
          if (this.opts.wiring.enable) {
            this.intersection = new IntersectionController(this);
            this.intersection.mount();
          }
          break;
        }
      }
    }
  }

  public mountPlugin(plugin: string) {
    switch (plugin) {
      case '': {
        break;
      }
    }
  }

  public databind() {
    if (this.isMounted) {
      // grid update
      this.paper.setGrid({
        color: this.opts.gridline.color,
        thickness: this.opts.gridline.thickness,
        name: this.opts.gridline.name as
          | 'dot'
          | 'fixedDot'
          | 'mesh'
          | 'doubleMesh',
      });
      this.paper.options.drawGridSize = this.opts.gridline.draw_grid_size;
      this.paper.options.gridSize = this.opts.gridline.drag_grid_size;
      // grid css update
      this.paper.$grid.css('opacity', this.opts.gridline.opacity);
      this.paper.$grid.css('filter', 'blur(' + this.opts.gridline.blur + 'px)');
      // background update
      this.paper.drawBackground({
        color: this.opts.background.color,
        opacity: this.opts.background.opacity,
      });
      // redraw grid to update
      this.paper.drawGrid();
    }
  }

  public setState(state: MVC_STATE) {
    switch (state) {
      case MVC_STATE.NONE: {
        this.state = state;
        break;
      }
      case MVC_STATE.SELECTION: {
        this.state = state;
        break;
      }
      case MVC_STATE.ZOOM: {
        this.state = state;
        break;
      }
      case MVC_STATE.DRAG: {
        this.state = state;
        break;
      }
      case MVC_STATE.HALO_DRAG: {
        this.state = state;
        break;
      }
      case MVC_STATE.LINKDRAWING: {
        this.state = state;
        break;
      }
    }
  }

  /**
   * Geometric programatic operations
   * Note: interact with HALO when applied
   */
  public setPaperDelegation(delegation: boolean) {
    this.paper.setInteractivity(() => {
      return {
        elementMove: this.opts.interactive.element_move && true,
        linkMove: true, // allow link drag
        arrowheadMove: false,
        stopDelegation: delegation,
      };
    });
  }

  public rotate() {}

  public resize() {}

  public flipX() {}

  public flipY() {}

  /***
   * CALLBACK
   *
   *
   */
  // callback top manage cell adorners during selection
  // extended to manage hierachy and group
  public onSingleCellSelection(
    type: string,
    cellType: string,
    cellViewList: joint.dia.CellView[] // list since a element can be composed by multi-elements
  ) {
    if (this.isMounted) {
      if (type === 'selection') {
        if (cellType === 'element') {
          //
          cellViewList.forEach((cellView) => {
            DiaHelper.setProp(cellView, 'selection', 'true');
          });
        } else if (cellType === 'link') {
          //
          cellViewList.forEach((cellView) => {
            DiaHelper.setProp(cellView, 'selection', 'true');
          });
        }
      } else if (type === 'unselection') {
        if (cellType === 'element') {
          //
          cellViewList.forEach((cellView) => {
            DiaHelper.setProp(cellView, 'selection', 'false');
          });
        } else if (cellType === 'link') {
          cellViewList.forEach((cellView) => {
            //
            DiaHelper.setProp(cellView, 'selection', 'false');
            //
            const linkview = cellView as joint.dia.LinkView;
            if (linkview.hasTools()) {
              linkview.removeTools();
            }
          });
        }
      }
    }
  }

  public onCellsSelectionCompletition() {
    console.log('SelectionCompletition');
    // apply halo
    if (this.opts.halo.enable) {
      if (this.opts.halo.isInherit) {
        if (this.inherit_halo) {
          this.inherit_halo.update();
        }
      } else {
        if (this.halo) {
          this.halo.update();
        }
      }
    }
    // emit event
    this.diagram.onDiagramSelection.emit();
  }

  public onHaloHandleDrag(state: 'start' | 'move' | 'end') {
    switch (state) {
      case 'start': {
        this.setState(MVC_STATE.HALO_DRAG);
        this.zoompan_listener.stopListening();
        break;
      }
      case 'move': {
        break;
      }
      case 'end': {
        this.setState(MVC_STATE.SELECTION);
        this.zoompan_listener.startListening();
        break;
      }
    }
  }

  /**
   * ZOOM EVENT
   *
   *
   *
   */
  public d3_zoomstart(evt: any) {
    //console.log('ZOOM START');
    this.zoompan.d3_zoomstart_handler(evt);
  }

  public d3_zoommove(evt: any) {
    //console.log('ZOOM MOVE');
    this.updateGridVisibility();
    if (this.zoompan) {
      this.zoompan.d3_zoommove_handler(evt);
      if (this.zoompan.opts.zoom.enable) {
        if (this.opts.halo.enable && !this.opts.halo.isInherit) {
          this.halo.updateWithZoom(evt.transform.k);
        }
      }
    }
  }

  public d3_zoomend(evt: any) {
    //console.log('ZOOM END');
    if (this.zoompan) {
      this.zoompan.d3_zoomend_handler(evt);
    }
  }

  /**
   * PAPER MOVE
   *
   *
   *
   */
  public paper_mouseover(evt: MouseEvent) {}

  /**
   * HOVER EVENT
   *
   *
   *
   */
  public cell_mouseenter(cellView: joint.dia.CellView) {
    if (this.isMounted) {
      switch (this.state) {
        case MVC_STATE.SELECTION: {
          // manage zoom and mouse enter togheter
          if (this.zoompan.isMounted) {
            this.zoompan.cell_mouseenter_handler(cellView);
          }
          // manage hover of elements
          if (this.hover.isMounted) {
            if (!DiaHelper.isSystem(this, cellView)) {
              if (cellView.model.isElement()) {
                this.hover.elementHover(cellView, 'true');
              } else if (cellView.model.isLink()) {
                this.hover.linkHover(cellView, 'true');
              }
            }
          }
          break;
        }
        case MVC_STATE.LINKDRAWING: {
        }
      }
    }
  }

  public cell_mouseleave(cellView: joint.dia.CellView) {
    if (this.isMounted) {
      if (this.zoompan.isMounted) {
        this.zoompan.cell_mouseleave_handler(cellView);
      }
      if (this.hover.isMounted) {
        // manage hover of elements
        if (!DiaHelper.isSystem(this, cellView)) {
          if (cellView.model.isElement()) {
            this.hover.elementHover(cellView, 'false');
          } else if (cellView.model.isLink()) {
            this.hover.linkHover(cellView, 'false');
          }
        }
      }
    }
  }

  public port_mouseenter(
    evt: MouseEvent,
    cellView: joint.dia.CellView,
    portId: string
  ) {}

  public port_mouseleave(
    evt: MouseEvent,
    cellView: joint.dia.CellView,
    portId: string
  ) {}

  /**
   * CLICK EVENT
   *
   *
   *
   */
  public paper_pointerclick(evt: any, x: number, y: number) {
    //console.log('PAPER CLICK');
    this.selection.paper_pointerclick_handler(evt, x, y);
  }

  public paper_pointerdblclick(evt: any, x: number, y: number) {
    //console.log('PAPER DBLCLICK');
  }

  public cell_pointerclick(
    cellView: joint.dia.CellView,
    evt: any,
    x: number,
    y: number
  ) {
    //console.log('CELL CLICK');
    this.selection.cell_pointerclick_handler(cellView, evt);
  }

  public cell_pointerdblclick(
    view: joint.dia.CellView,
    evt: any,
    x: number,
    y: number
  ) {
    //console.log('CELL DBLCLICK');
  }

  /**
   * DRAG EVENT
   *
   *
   *
   */
  public paper_pointerdown(evt: any, x: number, y: number) {
    switch (this.state) {
      case MVC_STATE.SELECTION: {
        if (this.selection) {
          this.selection.paper_pointerdown_handler(evt, x, y);
        }
        break;
      }
      case MVC_STATE.ZOOM: {
        if (this.zoompan) {
          this.zoompan.paper_pointerdown_handler(evt, x, y);
        }
        break;
      }
      case MVC_STATE.LINKDRAWING: {
      }
    }
  }

  public paper_pointermove(evt: any, x: number, y: number) {
    //console.log('PAPER MOVE');
    switch (this.state) {
      case MVC_STATE.SELECTION: {
        this.borderAutoScroll(undefined, evt, x, y);
        if (this.selection) {
          this.selection.paper_pointermove_handler(evt, 0, 0);
        }
        break;
      }
      case MVC_STATE.ZOOM: {
        if (this.zoompan) {
          this.zoompan.paper_pointermove_handler(evt, x, y);
        }
        break;
      }
    }
  }

  public paper_pointerup(evt: any, x: number, y: number) {
    //console.log('PAPER UP');
    this.resetAutoScroll();
    switch (this.state) {
      case MVC_STATE.SELECTION: {
        if (this.selection) {
          this.selection.paper_pointerup_handler(evt, x, y);
        }
        break;
      }
      case MVC_STATE.ZOOM: {
        if (this.zoompan) {
          this.zoompan.paper_pointerup_handler(evt, x, y);
        }
        break;
      }
    }
  }

  public cell_pointerdown(
    cellView: joint.dia.CellView,
    evt: any,
    x: number,
    y: number
  ) {
    switch (this.state) {
      case MVC_STATE.SELECTION: {
        if (evt.originalEvent.ctrlKey) {
          this.opts.interactive.element_move = false;
        }
        this.setState(MVC_STATE.DRAG);
        if (this.selection) {
          this.selection.cell_pointerdown_handler(cellView, evt);
        }
        if (this.wiring) {
          this.wiring.redrawingDragStart(cellView, this.halo.isHaloEnabled());
        }
        break;
      }
      case MVC_STATE.LINKDRAWING: {
        if (this.wiring) {
          this.wiring.drawingDragStart(cellView, evt);
        }
        break;
      }
    }
  }

  public cell_pointermove(
    cellView: joint.dia.CellView,
    evt: any,
    x: number,
    y: number
  ) {
    switch (this.state) {
      case MVC_STATE.DRAG: {
        if (this.selection) {
          // apply justo to first cycle
          this.selection.cell_pointermove_handler(cellView, evt);
          //if (this.firstCycleCellPointermove) {}
        }
        if (this.wiring) {
          if (this.firstCycleCellPointermove) {
            //console.log('fnsdkjnfdjksfns')
            this.wiring.redrawingDragMove(cellView, this.halo.isHaloEnabled());
          }
        }
        this.borderAutoScroll(cellView, evt, x, y);
        break;
      }
      case MVC_STATE.LINKDRAWING: {
        if (this.wiring) {
          this.wiring.drawingDragMove(cellView, evt);
          //this.borderAutoScroll(cellView, evt, x, y);
        }
        break;
      }
    }
    this.firstCycleCellPointermove = false;
  }

  public cell_pointerup(
    cellView: joint.dia.CellView,
    evt: any,
    x: number,
    y: number
  ) {
    this.resetAutoScroll();

    switch (this.state) {
      case MVC_STATE.DRAG: {
        if (this.selection) {
          this.selection.cell_pointerup_handler(cellView, evt);
        }
        if (this.wiring) {
          this.wiring.redrawingDragEnd(cellView, this.halo.isHaloEnabled());
        }
        this.opts.interactive.element_move = true;

        //this.intersection.resolveIntersection([cellView.model], this.halo.isHaloEnabled());

        this.setState(MVC_STATE.SELECTION);
        break;
      }
      case MVC_STATE.LINKDRAWING: {
        if (this.wiring) {
          this.wiring.drawingDragEnd(cellView, evt);
        }
        break;
      }
    }

    this.firstCycleCellPointermove = true;
  }

  /**
   * GENERAL
   */

  public link_connect(
    view: joint.dia.LinkView,
    evt: any,
    elementViewConnected: joint.dia.ElementView,
    magnet: any,
    arrowhead: any
  ) {
    const props = DiaHelper.getLinkPropertyFromView(view);
    if (props && props.model === 'wire') {
      const targetElem = this.paper.getModelById(
        view.model.target().id
      ) as joint.dia.Element;
      if (targetElem) {
        const targertPort = targetElem.getPort(view.model.target().port);
        if (targertPort) {
          const targetPortGroup = targetElem.getPort(
            view.model.target().port
          ).group;
          (targetElem as unknown as ModelInterface).setModelProp(
            'lock',
            targetPortGroup
          );
        }
      }
    }
  }

  public link_disconnect(
    view: joint.dia.LinkView,
    evt: any,
    elementViewConnected: joint.dia.ElementView,
    magnet: any,
    arrowhead: any
  ) {}

  public graph_add(cell: joint.dia.Cell) {
    switch (this.state) {
      case MVC_STATE.SELECTION: {
        break;
      }
      case MVC_STATE.LINKDRAWING: {
        break;
      }
    }
  }

  public graph_remove(cell: joint.dia.Cell) {
    switch (this.state) {
      case MVC_STATE.SELECTION: {
        if (cell.isLink()) {
          const link = cell as joint.dia.Link;
          const props = DiaHelper.getLinkPropertyFromModel(link);
          if (props && props.model === 'wire') {
            const sourceElem = this.paper.getModelById(
              link.source().id
            ) as joint.dia.Element;
            if (sourceElem) {
              const sourcePortGroup = sourceElem.getPort(
                link.source().port
              ).group;
              (sourceElem as unknown as ModelInterface).setModelProp(
                'unlock',
                sourcePortGroup
              );
            }
            const targetElem = this.paper.getModelById(
              link.target().id
            ) as joint.dia.Element;
            if (targetElem) {
              const targetPortGroup = targetElem.getPort(
                link.target().port
              ).group;
              (targetElem as unknown as ModelInterface).setModelProp(
                'unlock',
                targetPortGroup
              );
            }
          }
        }
        break;
      }
      case MVC_STATE.LINKDRAWING: {
        break;
      }
    }
  }

  /**
   * Keyboard
   *
   *
   */
  public keyboard_keydown(evt: KeyboardEvent) {
    if (evt.ctrlKey || evt.metaKey) {
      if (evt.key === 'c' || evt.key === 'C') {
        console.log('CTRL+C');
      } else if (evt.key === 'v' || evt.key === 'V') {
        console.log('CTRL+V');
      } else if (evt.key === 'x' || evt.key === 'X') {
        console.log('CTRL+X');
      } else if (evt.key === 'z' || evt.key === 'Z') {
        console.log('CTRL+Z');
      } else if (evt.key === 'y' || evt.key === 'Y') {
        console.log('CTRL+Y');
      } else if (evt.key === 'a' || evt.key === 'A') {
        console.log('CTRL+A');
      } else {
      }
    } else if (evt.key === 'Escape') {
      switch (this.state) {
        case MVC_STATE.LINKDRAWING: {
          if (this.wiring) {
            this.wiring.keyboardEsc();
          }
          break;
        }
      }
    } else if (evt.key === 'Delete') {
      switch (this.state) {
        case MVC_STATE.SELECTION: {
          break;
        }
      }
    }
  }

  public keyboard_keyup(evt: KeyboardEvent) {}

  /**
   * Window focus
   *
   *
   */
  public window_focus(evt: FocusEvent) {
    //console.log(evt);
  }

  public window_blur(evt: FocusEvent) {
    //console.log(evt);
  }

  /**
   * MVC Features
   *
   *
   *
   *
   *
   */
  public borderAutoScroll(
    cellView: joint.dia.CellView,
    evt: any,
    x: number,
    y: number
  ) {
    this.resetAutoScroll();
    if (this.opts.autoscroll.enable && this.isAutoscrollable()) {
      var coord = new joint.g.Point(evt.offsetX, evt.offsetY);
      const screenMinX = this.opts.autoscroll.border.left;
      const screenMinY = this.opts.autoscroll.border.top;
      const screenMaxX = window.innerWidth - this.opts.autoscroll.border.right;
      const screenMaxY =
        window.innerHeight - this.opts.autoscroll.border.bottom;
      var current_step_x: number = 0;
      var current_step_y: number = 0;
      if (coord.x < screenMinX) {
        //console.log('LEFT');
        if (this.opts.autoscroll.timer) {
          this.autoscrolltimer = setInterval(() => {
            current_step_x = this.opts.autoscroll.step_x;
            this.zoompan.zoomPan(current_step_x, 0);
            this.autoscrollWith(
              cellView,
              evt,
              x,
              y,
              current_step_x,
              current_step_y
            );
          }, this.opts.autoscroll.timer_setting_ms);
        }
      } else if (coord.x > screenMaxX) {
        //console.log('RIGHT');
        if (this.opts.autoscroll.timer) {
          this.autoscrolltimer = setInterval(() => {
            current_step_x = -this.opts.autoscroll.step_x;
            this.zoompan.zoomPan(current_step_x, 0);
            this.autoscrollWith(
              cellView,
              evt,
              x,
              y,
              current_step_x,
              current_step_y
            );
          }, this.opts.autoscroll.timer_setting_ms);
        }
      } else if (coord.y < screenMinY) {
        //console.log('TOP');
        if (this.opts.autoscroll.timer) {
          this.autoscrolltimer = setInterval(() => {
            current_step_y = this.opts.autoscroll.step_y;
            this.zoompan.zoomPan(0, current_step_y);
            this.autoscrollWith(
              cellView,
              evt,
              x,
              y,
              current_step_x,
              current_step_y
            );
          }, this.opts.autoscroll.timer_setting_ms);
        }
      } else if (coord.y > screenMaxY) {
        //console.log('BOTTOM');
        if (this.opts.autoscroll.timer) {
          this.autoscrolltimer = setInterval(() => {
            current_step_y = -this.opts.autoscroll.step_y;
            this.zoompan.zoomPan(0, current_step_y);
            this.autoscrollWith(
              cellView,
              evt,
              x,
              y,
              current_step_x,
              current_step_y
            );
          }, this.opts.autoscroll.timer_setting_ms);
        }
      }
    }
  }

  public resetAutoScroll() {
    if (this.autoscrolltimer) {
      clearInterval(this.autoscrolltimer);
    }
  }

  /**
   * This
   */
  private autoscrollWith(
    cellView: joint.dia.CellView,
    evt: any,
    x: number,
    y: number,
    step_x: number,
    step_y: number
  ) {
    switch (this.state) {
      case MVC_STATE.SELECTION: {
        this.selection.paper_pointermove_handler(evt, x, y);
        break;
      }
      case MVC_STATE.DRAG: {
        if (this.selection.isMultiSelection()) {
          if (this.opts.halo.enable) {
            if (this.opts.halo.isInherit) {
              if (this.inherit_halo) {
                const gParent = this.inherit_halo;
                if (gParent) {
                  gParent.translate(-step_x, -step_y);
                }
              }
            } else if (this.halo.isHaloEnabled()) {
              if (this.halo) {
                this.halo.translateRubberBand(-step_x, -step_y);
              }
            }
          }
        } else {
          if (cellView.model.isElement()) {
            const elementView = cellView as joint.dia.ElementView;
            if (
              this.opts.halo.enable &&
              !this.opts.halo.isInherit &&
              this.halo.isHaloEnabled()
            ) {
              if (this.halo) {
                this.halo.translateRubberBand(-step_x, -step_y);
              }
            } else {
              elementView.model.translate(-step_x, -step_y);
            }
          } else if (cellView.model.isLink()) {
            const linkView = cellView as joint.dia.LinkView;
            linkView.model.translate(-step_x, -step_y);
          }
        }
        break;
      }
    }
  }

  private isAutoscrollable(): boolean {
    // workaround for firefox: disable feature by default
    return !this.client.IS_FIREFOX;
  }

  private updateGridVisibility() {
    const scale = this.paper.scale().sx;
    if (
      scale < this.opts.gridline.min_scale_show ||
      scale > this.opts.gridline.max_scale_show
    ) {
      this.paper.$grid.css('visibility', 'hidden');
    } else {
      this.paper.$grid.css('visibility', 'visible');
    }
  }
}

/**
 * Important for JointJs namespace consistency!
 * Add custom name space to reflect library
 */
joint.util.assign(joint.shapes, {
  xtoollib: {
    RfBasic: {
      RfAmp,
      Node: Node,
    },
    Connector: {
      WiringLink,
    },
  },
});
