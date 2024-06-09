import * as joint from 'jointjs';
import * as jQuery from 'jquery';
import * as _ from 'lodash';
import * as $ from 'backbone';
import * as d3 from 'd3';
import { DiagramSettings, ZoomPanSettings } from '../../utils/settings';
import { DiaHelper } from '../../utils/diagram-helper';
import { ZoomRubberBand } from './zoom-rubberband';
import { MVController } from '../../core/mv-controller';
import { IPoint } from '../../utils/types';

export enum BIND {
  ZOOM_ONLY,
  PAN_ONLY,
  ZOOM_AND_PAN,
}

/**
 * TODO:
 * -> fix control of enables for all zoom functions
 */
export class ZoomPan {
  private mvc: MVController;

  private paper: joint.dia.Paper;

  private graph: joint.dia.Graph;

  private start_point: joint.g.Point;

  private rubberbandView: ZoomRubberBand;

  public isMounted: boolean = false;

  private paper_svg: any;

  private d3zoom: any;

  private allowProgramaticZoomPan: boolean = false;

  /**
   * Diagram options
   */
  public opts: {
    zoom: {
      enable: boolean; // dynamic enable zoom
      wheel: boolean;
      ctrl: boolean;
    };
    rubberband: {
      enable: boolean;
      padding: {
        top: number;
        right: number;
        bottom: number;
        left: number;
      };
      tol_width: number;
      tol_height: number;
      interpolation: boolean;
      duration: number;
    };
    pan: {
      enable: boolean;
      step: number;
    };
    zoom_cursor: string;
    pan_cursor: string;
    extent_limit: [[number, number], [number, number]];
    translate_limit: [[number, number], [number, number]];
    scale_limit: [number, number];
    scale_factor: number; // [0 1]
    zoom_fit: {
      enable: boolean;
      padding: {
        top: number;
        right: number;
        bottom: number;
        left: number;
      };
      interpolation: boolean;
      duration: number;
    };
    zoom_inout: {
      enable: boolean;
      step_in: number;
      step_out: number;
      interpolation: boolean;
      duration: number;
    };
  } = {
    zoom: {
      enable: true,
      wheel: true,
      ctrl: false,
    },
    rubberband: {
      enable: true,
      padding: {
        top: 200,
        right: 200,
        bottom: 200,
        left: 200,
      },
      tol_width: 10,
      tol_height: 10,
      interpolation: true,
      duration: 50,
    },
    pan: {
      enable: true,
      step: 0,
    },
    zoom_cursor: 'grabbing',
    pan_cursor: 'grabbing',
    extent_limit: [
      [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
    ],
    translate_limit: [
      [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
    ],
    scale_limit: [
      ZoomPanSettings.ZOOM_MIN_EXTENT,
      ZoomPanSettings.ZOOM_MAX_EXTENT,
    ],
    scale_factor: 0.3,
    zoom_fit: {
      enable: true,
      padding: {
        top: 200,
        right: 200,
        bottom: 200,
        left: 200,
      },
      interpolation: true,
      duration: 50,
    },
    zoom_inout: {
      enable: true,
      step_in: 1.2,
      step_out: 0.8,
      interpolation: true,
      duration: 50,
    },
  };

  constructor(
    mvc: MVController,
    paper: joint.dia.Paper,
    graph: joint.dia.Graph
  ) {
    this.mvc = mvc;
    this.paper = paper;
    this.graph = graph;
    this.paper_svg = d3.select('#' + paper.svg.id);
    this.opts.pan.step = this.mvc.opts.gridline.drag_grid_size;
    this.opts.rubberband.tol_width = this.mvc.opts.gridline.drag_grid_size;
    this.opts.rubberband.tol_height = this.mvc.opts.gridline.drag_grid_size;
  }

  public mount(_zoom: any) {
    this.d3zoom = _zoom;
    // zoom definition
    this.d3zoom
      .filter((evt: any) => {
        return this.zoomFilter(evt);
      })
      .wheelDelta((evt: any) => {
        return this.zoomWheelDelta(evt);
      })
      //.extent([]) // feature
      .scaleExtent(this.opts.scale_limit)
      .translateExtent(this.opts.translate_limit);
    //.constrain((transform, extent, translateExtent) => { return undefined}) // feature
    this.isMounted = true;
    this.setZoomPan();
    this.rubberbandView = new ZoomRubberBand(this.paper, this.graph);
  }

  public setZoomPan() {
    if (this.isMounted) {
      this.paper_svg.on('.zoom', null);
      if (this.opts.zoom.enable) {
        if (this.opts.pan.enable) {
          this.paper_svg.call(this.d3zoom).on('dblclick.zoom', null);
        } else {
          this.paper_svg
            .call(this.d3zoom)
            .on('dblclick.zoom', null)
            .on('mousedown.zoom', null)
            .on('touchstart.zoom', null)
            .on('touchmove.zoom', null)
            .on('touchend.zoom', null);
        }
      } else if (this.opts.pan.enable) {
        this.paper_svg
          .call(this.d3zoom)
          .on('wheel.zoom', null)
          .on('mousewheel.zoom', null)
          .on('MozMousePixelScroll.zoom', null);
      }
    }
  }

  public cell_mouseenter_handler(evt: any) {
    if (this.isMounted) {
      if (this.opts.zoom.enable && this.opts.pan.enable) {
        this.paper_svg.on('.zoom', null);
        this.paper_svg
          .call(this.d3zoom)
          .on('dblclick.zoom', null)
          .on('mousedown.zoom', null)
          .on('touchstart.zoom', null)
          .on('touchmove.zoom', null)
          .on('touchend.zoom', null);
      }
    }
  }

  public cell_mouseleave_handler(evt: any) {
    if (this.isMounted) {
      if (this.opts.zoom.enable && this.opts.pan.enable) {
        this.paper_svg.on('.zoom', null);
        this.paper_svg.call(this.d3zoom);
      }
    }
  }

  private current_cursor: string;

  public d3_zoomstart_handler(evt: any) {
    if (this.isMounted) {
      if (evt.sourceEvent) {
        if (evt.sourceEvent.type === 'mousedown') {
          if (this.paper.el.style.cursor.length > 0 && this.opts.pan.enable) {
            this.current_cursor = this.paper.el.style.cursor;
          } else {
            this.current_cursor = 'default';
          }
          this.paper.el.style.cursor = this.opts.pan_cursor;
        }
      }
    }
  }

  public d3_zoommove_handler(evt: any) {
    if (this.isMounted) {
      if (evt.sourceEvent) {
        if (this.opts.zoom.enable && !this.opts.pan.enable) {
          if (evt.sourceEvent.type === 'wheel') {
            this.paper.scale(evt.transform.k, evt.transform.k, 0, 0);
            this.paper.translate(evt.transform.x, evt.transform.y);
          }
        } else if (!this.opts.zoom.enable && this.opts.pan.enable) {
          if (evt.sourceEvent.type === 'mousemove') {
            this.paper.translate(evt.transform.x, evt.transform.y);
          }
        } else if (this.opts.zoom.enable && this.opts.pan.enable) {
          if (evt.sourceEvent.type === 'wheel') {
            if (this.opts.zoom.wheel) {
              this.paper.scale(evt.transform.k, evt.transform.k, 0, 0);
              this.paper.translate(evt.transform.x, evt.transform.y);
            }
          } else if (evt.sourceEvent.type === 'mousemove') {
            this.paper.scale();
            this.paper.translate(evt.transform.x, evt.transform.y);
          }
        }
      } else {
        this.paper.scale(evt.transform.k, evt.transform.k, 0, 0);
        this.paper.translate(evt.transform.x, evt.transform.y);
      }
    }
  }

  public d3_zoomend_handler(evt: any) {
    if (this.isMounted) {
      if (this.opts.zoom.enable && this.opts.pan.enable) {
        if (evt.sourceEvent) {
          if (evt.sourceEvent.type === 'mouseup') {
            this.paper.el.style.cursor = this.current_cursor;
          }
        }
      }
    }
  }

  public paper_pointerdown_handler(evt: any, x: number, y: number) {
    if (this.isMounted && this.opts.rubberband.enable) {
      if (this.opts.zoom.enable && this.opts.pan.enable) {
        var coord = this.paper.pageToLocalPoint(evt.offsetX, evt.offsetY);
        this.start_point = new joint.g.Point(coord.x, coord.y);
        this.rubberbandView.createRubberBand();
      }
    }
  }

  public paper_pointermove_handler(evt: any, x: number, y: number) {
    if (this.isMounted && this.opts.rubberband.enable) {
      if (this.opts.zoom.enable && this.opts.pan.enable) {
        const windowCoord: IPoint = { x: evt.offsetX, y: evt.offsetY };
        const localCoord: IPoint = this.paper.pageToLocalPoint(
          evt.offsetX,
          evt.offsetY
        );
        var current = localCoord;
        var border_violation = false;
        // border control
        if (windowCoord.x - 5 < 0) {
          current.x = this.paper.pageToLocalPoint(0, 0).x;
          border_violation = true;
        }
        if (windowCoord.x + 5 > window.innerWidth) {
          current.x = this.paper.pageToLocalPoint(window.innerWidth, 0).x;
          border_violation = true;
        }
        if (windowCoord.y - 5 < 0) {
          current.y = this.paper.pageToLocalPoint(0, 0).y;
          border_violation = true;
        }
        if (windowCoord.y + 5 > window.innerHeight) {
          current.y = this.paper.pageToLocalPoint(0, window.innerHeight).y;
          border_violation = true;
        }
        if (this.mvc.client.IS_FIREFOX && border_violation) {
          // firefox workaround: stop rubberband update
        } else {
          this.rubberbandView.drawRubberBand(this.start_point, current);
        }
      }
    }
  }

  public paper_pointerup_handler(evt: any, x: number, y: number) {
    if (this.isMounted && this.opts.rubberband.enable) {
      if (this.opts.zoom.enable && this.opts.pan.enable) {
        const zoomAreaRect = this.rubberbandView.getRubberBandRect();
        const tx0 = this.paper.translate().tx;
        const ty0 = this.paper.translate().ty;
        const sx0 = this.paper.scale().sx;
        const sy0 = this.paper.scale().sy;
        if (zoomAreaRect) {
          const check_dx = zoomAreaRect.width > this.opts.rubberband.tol_width;
          const check_dy =
            zoomAreaRect.height > this.opts.rubberband.tol_height;
          if (check_dx && check_dy) {
            this.paper.transformToFitContent({
              padding: this.opts.rubberband.padding,
              verticalAlign: 'middle',
              horizontalAlign: 'middle',
              contentArea: {
                x: zoomAreaRect.x,
                y: zoomAreaRect.y,
                width: zoomAreaRect.width,
                height: zoomAreaRect.height,
              },
            });
            // store the updated transformation
            const tx1 = this.paper.translate().tx;
            const ty1 = this.paper.translate().ty;
            const sx1 = this.paper.scale().sx;
            const sy1 = this.paper.scale().sy;
            // go back to original transformation
            this.paper.scale(sx0, sy0, 0, 0);
            this.paper.translate(tx0, ty0);
            // use programatic zoom to transform the paper
            this.allowProgramaticZoomPan = true;
            // apply transformation wit animation
            var zoom_with_transition = undefined;
            if (this.opts.rubberband.interpolation) {
              zoom_with_transition = this.paper_svg
                .transition()
                .duration(this.opts.rubberband.duration)
                .ease(d3.easeLinear);
            } else {
              zoom_with_transition = this.d3zoom;
            }
            zoom_with_transition.call(
              this.d3zoom.transform,
              d3.zoomIdentity.translate(tx1, ty1).scale(sx1)
            );
            this.allowProgramaticZoomPan = false;
          }
        }
        // delete stuff
        this.rubberbandView.deleteRubberBand();
      }
      this.start_point = undefined;
    }
  }

  /**
   * programatic zoom: to decorate with transition considering autozoom
   */
  public zoomIn() {
    if (this.isMounted && this.opts.zoom_inout) {
      if (this.opts.zoom.enable && this.opts.pan.enable) {
        // use programatic zoom to transform the paper
        this.allowProgramaticZoomPan = true;
        // apply transformation wit animation
        var zoom_with_transition = undefined;
        if (this.opts.zoom_inout.interpolation) {
          zoom_with_transition = this.paper_svg
            .transition()
            .duration(this.opts.zoom_inout.duration)
            .ease(d3.easeLinear);
        } else {
          zoom_with_transition = this.d3zoom;
        }
        zoom_with_transition.call(
          this.d3zoom.scaleBy,
          this.opts.zoom_inout.step_in
        );
        this.allowProgramaticZoomPan = false;
      }
    }
  }

  public zoomOut() {
    if (this.isMounted && this.opts.zoom_inout) {
      if (this.opts.zoom.enable && this.opts.pan.enable) {
        // use programatic zoom to transform the paper
        this.allowProgramaticZoomPan = true;
        // apply transformation wit animation
        var zoom_with_transition = undefined;
        if (this.opts.zoom_inout.interpolation) {
          zoom_with_transition = this.paper_svg
            .transition()
            .duration(this.opts.zoom_inout.duration)
            .ease(d3.easeLinear);
        } else {
          zoom_with_transition = this.d3zoom;
        }
        zoom_with_transition.call(
          this.d3zoom.scaleBy,
          this.opts.zoom_inout.step_out
        );
        this.allowProgramaticZoomPan = false;
      }
    }
  }

  public zoomFit() {
    if (this.isMounted && this.opts.zoom_fit) {
      if (this.opts.zoom.enable && this.opts.pan.enable) {
        const tx0 = this.paper.translate().tx;
        const ty0 = this.paper.translate().ty;
        const sx0 = this.paper.scale().sx;
        const sy0 = this.paper.scale().sy;
        this.paper.transformToFitContent({
          padding: this.opts.zoom_fit.padding,
          verticalAlign: 'middle',
          horizontalAlign: 'middle',
        });
        // store the updated transformation
        const tx1 = this.paper.translate().tx;
        const ty1 = this.paper.translate().ty;
        const sx1 = this.paper.scale().sx;
        const sy1 = this.paper.scale().sy;
        // go back to original transformation
        this.paper.scale(sx0, sy0, 0, 0);
        this.paper.translate(tx0, ty0);
        // use programatic zoom to transform the paper
        this.allowProgramaticZoomPan = true;
        // apply transformation wit animation
        var zoom_with_transition = undefined;
        if (this.opts.zoom_fit.interpolation) {
          zoom_with_transition = this.paper_svg
            .transition()
            .duration(this.opts.zoom_fit.duration)
            .ease(d3.easeLinear);
        } else {
          zoom_with_transition = this.d3zoom;
        }
        zoom_with_transition.call(
          this.d3zoom.transform,
          d3.zoomIdentity.translate(tx1, ty1).scale(sx1)
        );
        this.allowProgramaticZoomPan = false;
      }
    }
  }

  public zoomReset(delay?: number) {
    if (this.isMounted) {
      if (this.opts.zoom.enable && this.opts.pan.enable) {
        this.allowProgramaticZoomPan = true;
        if (delay) {
          this.paper_svg
            .transition()
            .duration(delay)
            .call(
              this.d3zoom.transform,
              d3.zoomIdentity.translate(0, 0).scale(1)
            );
        } else {
          this.paper_svg.call(
            this.d3zoom.transform,
            d3.zoomIdentity.translate(0, 0).scale(1)
          );
        }
        this.allowProgramaticZoomPan = false;
      }
    }
  }

  public zoomPan(dx: number, dy: number, delay?: number) {
    if (this.isMounted) {
      if (this.opts.pan.enable) {
        this.allowProgramaticZoomPan = true;
        if (delay) {
          this.paper_svg
            .transition()
            .duration(delay)
            .call(this.d3zoom.translateBy, dx, dy);
        } else {
          this.paper_svg.call(this.d3zoom.translateBy, dx, dy);
        }
        this.allowProgramaticZoomPan = false;
      }
    }
  }

  public getZoomTk() {
    //console.log(this.d3zoom)
  }

  private zoomFilter(event: any): boolean {
    switch (event.type) {
      case 'mousedown': {
        return event.which === 3;
      }
      case 'wheel': {
        if (this.opts.zoom.ctrl) {
          return event.ctrlKey;
        } else {
          return event.button === 0;
        }
      }
      default:
        return this.allowProgramaticZoomPan;
    }
  }

  private zoomWheelDelta(event: any): number {
    const deltaY = event.deltaY;
    const norm_delta = event.deltaMode ? 120 : 1;
    return (-deltaY * norm_delta) / (1000 * this.opts.scale_factor);
  }
}
