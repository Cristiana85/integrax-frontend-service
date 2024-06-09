// AvoidLib Importing
import { MVController } from 'src/app/diagram/core/mv-controller';
import { WiringLink } from 'src/app/diagram/library/connectors/wiring-link';
import { LOCK_PORT_SIZE } from 'src/app/diagram/utils/constants';
import { AvoidRouter } from './avoid-router';

export class AvoidController {
  private mvc: MVController;

  private graph: joint.dia.Graph;

  private paper: joint.dia.Paper;

  private drawinglink: joint.dia.Link;

  private drawnlink: joint.dia.Link = undefined;

  public router: AvoidRouter;

  public data = {
    pinnable: false,
    snappable: true,
    snap_size: 2,
    snappable_self: false,
    multi_point: false,
    multi_style: false,
    drag_update: true,
    ztoll: 0.1,
    router: {
      drawing: 'manhattan',
      drawing_step: 5,
      drawing_padding: 0,
      obstacle: [''],
      excludeEnds: ['source'],
      startDirections: ['right'],
      redrawing: 'right-angle',
      redrawing_margin: 0,
    },
    connector: {
      type: 'normal',
    },
    jumpover: {
      type: 'none',
      size: 0,
      rad: 0,
    },
  };

  constructor(mvc: MVController) {
    if (mvc) {
      this.mvc = mvc;
      this.paper = mvc.paper;
      this.graph = mvc.graph;
      this.router = new AvoidRouter(mvc);
      this.router.createAvoidRouter();
    }
  }

  public initLinkDrawing(cellView: joint.dia.CellView, magnet: any) {
    console.log('wire::init')
    //
    this.paper.options.linkPinning = this.data.pinnable;
    //
    this.paper.options.snapLinks = this.data.snappable
      ? { radius: this.data.snap_size }
      : this.data.snappable;
    //
    this.paper.options.snapLinksSelf = this.data.snappable_self;
    //
    //
    this.paper.options.defaultConnectionPoint = {
      name: 'anchor',
      args: {
        offset: LOCK_PORT_SIZE,
      },
    };
    //
    //
    if (magnet) {
      // future features
      const unrotatePortDirection = magnet.getAttribute('direction');
    }
    this.drawinglink = new WiringLink();
    this.setLinkDrawingRouter(this.drawinglink);
  }

  public updateLinkDrawing(
    state: 'start' | 'move' | 'end',
    cellView: joint.dia.CellView,
    evt: any
  ) {
    if (this.data.drag_update) {
      const linkView = cellView as joint.dia.LinkView;
      switch (state) {
        case 'start': {
          console.log('wire::start')
          break;
        }
        case 'move': {
          console.log('wire::move')
          break;
        }
        case 'end': {
          console.log('wire::end')
          if (!this.data.multi_point) {
          }
          break;
        }
      }
    }
  }

  public getLinkReference(): joint.dia.Link {
    return this.drawinglink;
  }

  public insertVertexToLink(evt: MouseEvent) {}

  /**
   * Last step to connect link to a component
   */
  public connectLink(connectType: string, id?: any): joint.dia.Link {
    return null;
  }

  public stopLinkDrawing(source: string) {
    if (this.data.multi_point) {
      if (this.data.pinnable) {
        this.connectLink('Float');
      } else {
        this.drawinglink.remove();
        this.drawinglink = undefined;
        if (this.drawnlink) {
          this.drawnlink.remove();
          this.drawnlink = undefined;
        }
      }
    }
  }

  public setLinkDrawingRouter(link: joint.dia.Link) {
    link.router((vertices, args, linkView: joint.dia.LinkView) => {
      let computedVertices = undefined; //this.avoidRouter;
      /*.computeWiringVertices(
        linkView.sourceAnchor,
        linkView.targetAnchor
      );*/
      if (computedVertices) {
        return [computedVertices];
      } else {
        return vertices;
      }
    });
  }

  public setTool(link: joint.dia.Link, enable: boolean) {}
}
