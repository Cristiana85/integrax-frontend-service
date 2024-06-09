import * as joint from 'jointjs';
import * as jQuery from 'jquery';
import * as _ from 'lodash';
import * as $ from 'backbone';
import { MVController } from 'src/app/diagram/core/mv-controller';
import { WiringLink } from 'src/app/diagram/library/connectors/wiring-link';
import { ModelInterface } from 'src/app/diagram/core/model-interface';
import { LOCK_PORT_SIZE } from 'src/app/diagram/utils/constants';
import { HybridRouter } from './hybrid-router';

enum ORIENTATION {
  H,
  V,
}

export class HybridController {
  private mvc: MVController;

  private graph: joint.dia.Graph;

  private paper: joint.dia.Paper;

  private drawinglink: joint.dia.Link;

  private drawnlink: joint.dia.Link = undefined;

  private drawingRouter: HybridRouter;

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
      this.drawingRouter = new HybridRouter(mvc);
    }
  }

  public initLinkDrawing(cellView: joint.dia.CellView, magnet: any) {
    this.paper.options.linkPinning = this.data.pinnable;
    this.paper.options.snapLinks = this.data.snappable
      ? { radius: this.data.snap_size }
      : this.data.snappable;
    this.paper.options.snapLinksSelf = this.data.snappable_self;
    this.paper.options.defaultConnectionPoint = {
      name: 'anchor',
      args: {
        offset: LOCK_PORT_SIZE,
      },
    };
    if (magnet) {
      // future features
      const unrotatePortDirection = magnet.getAttribute('direction');
    }
    this.drawinglink = this.createLink();
    this.drawnlink = undefined;
    this.setLinkDrawingRouter(this.drawinglink);
    this.setStyle(this.drawinglink, 'drawing');
    this.validateConnection();
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
          break;
        }
        case 'move': {
          break;
        }
        case 'end': {
          if (!this.data.multi_point) {
            // manage single point
            this.connectLink('Port');
          }
          break;
        }
      }
    }
  }

  public createLink(): joint.dia.Link {
    const link = new WiringLink();
    return link;
  }

  public getLinkReference(): joint.dia.Link {
    return this.drawinglink;
  }

  public insertVertexToLink(evt: MouseEvent) {
    this.mvc.paper.updateViews(); // update views for correct "d" path calculation
    const vertexPoint = this.drawinglink.target() as joint.g.Point; // reference
    if (this.data.multi_point) {
      // update drawn segment list
      if (!this.drawnlink) {
        this.drawnlink = this.drawinglink.clone();
        this.drawnlink.addTo(this.graph);
        if (this.data.multi_style) {
          this.setStyle(this.drawnlink, 'drawn');
        }
      } else {
        this.pathRefactoring(
          undefined,
          this.drawnlink,
          this.drawinglink,
          true,
          true
        );
      }
      // reset drawing link
      this.drawinglink.set('source', vertexPoint);
    }
  }

  /**
   * Last step to connect link to a component
   */
  public connectLink(connectType: string, id?: any): joint.dia.Link {

    let vertices: joint.g.Point[] = [];
    let source = undefined;
    let target = undefined;

    let path = undefined;

    if (this.data.multi_point && this.drawinglink && this.drawnlink) {

      if (connectType === 'Float') {
        // get path list from drawn sements
        source = this.drawnlink.source();
        target = this.drawnlink.target();

        const drawnlinkView = this.drawnlink.findView(this.paper);

        path = joint.g.Path.parse(drawnlinkView.$el.children().attr('d'));

        // update vertices
        const n_segments = path.getSegmentSubdivisions().length;

        for (var i = 1; i < n_segments - 1; i++) {
          vertices.push(path.getSegment(i).end);
        }

        this.drawnlink.remove();
        this.drawnlink = undefined;

      } else if (connectType === 'Port') {

        this.pathRefactoring(
          undefined,
          this.drawnlink,
          this.drawinglink,
          true,
          true
        );

        this.mvc.paper.updateViews(); // update views for correct "d" path calculation

        // get path list from drawn sements
        source = this.drawnlink.source();
        target = this.drawnlink.target();

        const drawnlinkView = this.drawnlink.findView(this.paper);
        path = joint.g.Path.parse(drawnlinkView.$el.children().attr('d'));

        // update vertices
        const n_segments = path.getSegmentSubdivisions().length;
        for (var i = 1; i < n_segments - 1; i++) {
          vertices.push(path.getSegment(i).end);
        }

        this.drawnlink.remove();
        this.drawnlink = undefined;

        target = this.drawinglink.target();

      } else if (connectType === 'Junction') {

        this.pathRefactoring(
          undefined,
          this.drawnlink,
          this.drawinglink,
          true,
          true
        );

        this.mvc.paper.updateViews(); // update views for correct "d" path calculation

        // get path list from drawn sements
        source = this.drawnlink.source();
        target = this.drawnlink.target();

        const drawnlinkView = this.drawnlink.findView(this.paper);
        path = joint.g.Path.parse(drawnlinkView.$el.children().attr('d'));

        // update vertices
        const n_segments = path.getSegmentSubdivisions().length;
        for (var i = 1; i < n_segments - 1; i++) {
          vertices.push(path.getSegment(i).end);
        }

        this.drawnlink.remove();
        this.drawnlink = undefined;

        target = {id: id};

      }

      // remove original link
      this.drawinglink.remove();
      this.drawinglink = undefined;

    } else if (!this.data.multi_point || (this.data.multi_point && this.drawinglink)) {

      // if wiring is not stopped
      if (connectType === 'Port') {

        // get source target info from link
        source = this.drawinglink.source();
        target = this.drawinglink.target();

        const drawinglinkView = this.drawinglink.findView(this.paper);
        // get vertices from path
        const path = joint.g.Path.parse(
          drawinglinkView.$el.children().attr('d')
        );

        // update vertices
        const n_segments = path.getSegmentSubdivisions().length;
        for (var i = 0; i < n_segments; i++) {
          if (i > 0 && i < n_segments - 1) {
            vertices.push(path.getSegment(i).end);
          }
        }

      } else if (connectType === 'Junction') {

        // get source target info from link
        source = this.drawinglink.source();
        target = this.drawinglink.target();

        this.mvc.paper.updateViews(); // update views for correct "d" path calculation

        const drawinglinkView = this.drawinglink.findView(this.paper);
        // get vertices from path
        const path = joint.g.Path.parse(
          drawinglinkView.$el.children().attr('d')
        );

        // update vertices
        const n_segments = path.getSegmentSubdivisions().length;
        for (var i = 0; i < n_segments; i++) {
          if (i > 0 && i < n_segments - 1) {
            vertices.push(path.getSegment(i).end);
          }
        }

        target = {id: id};

      }

      // remove original link
      this.drawinglink.remove();
      this.drawinglink = undefined;
    }

    // this calculation is shared to all wiring methods
    var normalLink = undefined;
    if (source && target) {
      normalLink = this.createLink();

      normalLink.source(source);
      normalLink.target(target);

      if (vertices.length > 0) {
        normalLink.set('vertices', vertices);
      }

      normalLink.router('normal');

      //normalLink.connector('normal');

      normalLink.connector('jumpover', {
        type: 'gap'
      });

      this.setStyle(normalLink, 'normal');

      normalLink.addTo(this.graph);

      this.lockSourcePort(normalLink);
    }
    return normalLink;
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
    link.router('manhattan', {
      isPointObstacle: (point: joint.dia.Point) => {
        const links = this.mvc.graph.getLinks();
        var test = false;
        links.forEach(link => {
          if (this.getLinkReference().id.toString() != link.id.toString()) {
            const path = (link.findView(this.mvc.paper) as joint.dia.LinkView).getConnection();
            if (path) {
              const n_segments = path.getSegmentSubdivisions();
              for (var i = 0; i < n_segments.length; i++) {
                if (!path.getSegment(i).isSubpathStart) {
                  const start = path.getSegment(i).start;
                  const stop = path.getSegment(i).end;
                  const line = new joint.g.Line(start, stop);
                  const point_grid = this.mvc.paper.snapToGrid(point);
                  test = line.containsPoint(point_grid);
                  if (test) {
                    return;
                  }
                }
              }
            }
          }
        });
        return test;
      }
    });
    //link.router('rightAngle');
    link.router((vertices, args, linkView: joint.dia.LinkView) => {
      const computedVertices = this.drawingRouter.computeWiringVertices(
        linkView.sourceAnchor,
        linkView.targetAnchor
      );
      if (computedVertices) {
        return [computedVertices];
      } else {
        return vertices;
      }
    });
  }

  public setRewiringRouter(link: joint.dia.Link) {
    link.router('manhattan');
    /*link.router((vertices, args, linkView: joint.dia.LinkView) => {
      const computedVertices = this.drawingRouter.computeRewiringVertices(
        linkView.sourceAnchor,
        linkView.targetAnchor,
        vertices
      );
      if (computedVertices) {
        return computedVertices;
      } else {
        return vertices;
      }
    });*/
  }

  /**
   * TBD: create a dedicated class!!!
   */
  public setTool(link: joint.dia.Link, enable: boolean) {
    if (enable) {
      const segmentsTool = new joint.linkTools.Segments({
        handleClass: joint.linkTools.Segments.SegmentHandle.extend({
          referenceLink: link,
          drawingRouter: this,
          tagName: 'g',
          children: [
            {
              tagName: 'line',
              selector: 'line',
              attributes: {
                stroke: '#33334F',
                'stroke-width': 2,
                fill: 'none',
                'pointer-events': 'none',
              },
            },
            {
              tagName: 'circle',
              selector: 'handle',
              attributes: {
                r: 5,
                fill: '#ffffff',
                stroke: '#000',
                'stroke-width': 1,
              },
            },
          ],
          onPointerDown(evt: joint.dia.Event) {
            if (this.options.guard(evt)) return;
            this.trigger('change:start', this, evt);
            evt.stopPropagation();
            evt.preventDefault();
            this.options.paper.undelegateEvents();
            this.delegateDocumentEvents(null, evt.data);
          },
          onPointerMove(evt: joint.dia.Event) {
            this.trigger('changing', this, evt);
          },
          onPointerUp(evt: joint.dia.Event) {
            this.undelegateDocumentEvents();
            this.options.paper.delegateEvents();
            this.trigger('change:end', this, evt);
            this.drawingRouter.pathRefactoring (
              undefined,
              this.referenceLink,
              undefined,
              false,
              false
            );
          },
        }),
      });
      var removeButton = new joint.linkTools.Remove();
      var toolsView = new joint.dia.ToolsView({
        tools: [segmentsTool, removeButton],
      });
      var linkView = link.findView(this.paper);
      linkView.addTools(toolsView);
    } else {
      linkView.removeTools();
    }
  }

  public pathRefactoring(
    userPath: joint.g.Point[],
    drawnlink: joint.dia.Link,
    drawinglink: joint.dia.Link,
    setTarget: boolean,
    setRouter: boolean
  ): joint.g.Point[] {
    let path: joint.g.Point[] = [];
    let d = undefined;
    if (userPath) {
      const orderedPath = this.removeOverlappedSegments(userPath);
      return orderedPath;
    } else {
      // add last drawn segment to the path under evaluation
      if (drawnlink) {
        d = joint.g.Path.parse(
          drawnlink.findView(this.mvc.paper).$el.children().attr('d')
        );
        d.segments.forEach((segment) => {
          path.push(segment.end);
        });
      }
      // add last drawn segment to the path under evaluation
      if (drawinglink) {
        d = joint.g.Path.parse(
          drawinglink.findView(this.mvc.paper).$el.children().attr('d')
        );
        d.segments.forEach((segmet) => {
          path.push(segmet.end);
        });
      }
      // reduce array removing duplicates points
      if (path.length > 0) {
        path = path.filter((item, index) => {
          const prevIndex = index - 1;
          if (prevIndex >= 0 && path.length > prevIndex) {
            return !item.equals(path[index - 1]);
          }
          return true;
        });
        const orderedPath = this.removeOverlappedSegments(path);
        drawnlink.vertices(orderedPath.slice(1, orderedPath.length - 1));
        if (setTarget) {
          drawnlink.target(orderedPath[orderedPath.length - 1]);
        }
        if (setRouter) {
          // drawn link are normal routed
          drawnlink.router('normal');
        }
        return orderedPath;
      }
      return undefined;
    }
  }

  private setDrawingConnector() {
    this.drawinglink.connector('jumpover', {
      type: 'arc',
    });
  }

  private lockSourcePort(link: joint.dia.Link) {
    const sourceElem = this.paper.getModelById(
      link.source().id
    ) as joint.dia.Element;
    if (sourceElem) {
      const sourcePort = sourceElem.getPort(link.source().port);
      if (sourcePort) {
        const sourcePortGroup = sourceElem.getPort(link.source().port).group;
        (sourceElem as unknown as ModelInterface).setModelProp(
          'lock',
          sourcePortGroup
        );
      }
    }
  }

  private removeOverlappedSegments(path: joint.g.Point[]): joint.g.Point[] {
    let resegment: joint.g.Point[] = [];
    let lastsegmentOrientation: ORIENTATION = undefined;
    for (var index = 0; index < path.length - 1; index++) {
      const p0: joint.g.Point = new joint.g.Point({
        x: path[index].x,
        y: path[index].y,
      });
      const p1: joint.g.Point = new joint.g.Point({
        x: path[index + 1].x,
        y: path[index + 1].y,
      });
      if (index === 0) {
        lastsegmentOrientation = this.getPathOrientation(p0, p1);
        resegment.push(new joint.g.Point({ x: p0.x, y: p0.y }));
      } else if (index > 0) {
        const curentOrientation: ORIENTATION = this.getPathOrientation(p0, p1);
        if (lastsegmentOrientation !== curentOrientation) {
          resegment.push(new joint.g.Point({ x: p0.x, y: p0.y }));
          lastsegmentOrientation = curentOrientation;
        }
      }
      if (index === path.length - 2) {
        resegment.push(new joint.g.Point({ x: p1.x, y: p1.y }));
      }
    }
    return resegment;
  }

  private getPathOrientation(
    source: joint.g.Point,
    target: joint.g.Point
  ): ORIENTATION {
    if (source.x === target.x) {
      return ORIENTATION.H;
    } else if (source.y === target.y) {
      return ORIENTATION.V;
    }
    return undefined;
  }

  private setStyle(link: joint.dia.Link, name: string) {
    (link as unknown as ModelInterface).setModelProp('style', name);
  }

  private validateConnection() {
    this.paper.options.validateConnection = (
      cellViewS,
      magnetS,
      cellViewT,
      magnetT,
      end,
      linkView
    ) => {
      if (this.drawinglink) {
        if (this.drawinglink.attr('line/display') === 'none') {
          return false;
        }
      }
      if (magnetS === magnetT) {
        return false;
      }
      return true;
    };
  }
}
