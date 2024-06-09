import * as joint from 'jointjs';
import * as jQuery from 'jquery';
import * as _ from 'lodash';
import * as $ from 'backbone';
import { IPoint } from '../../utils/types';

export class SelectionRubberBand {

  private paper: joint.dia.Paper;

  private graph: joint.dia.Graph;

  private rubberbandShape: joint.shapes.standard.Rectangle;

  private rubberbandRect: joint.g.Rect;

  public opts: {
    start_tol: number;
    style: {
      strokeWidth: number,
      strokeColor: string,
      strokeDashArray: string,
      strokeOpacity: number,
      strokeLinecap: string,
      strokeLinejoin: string,
      fill: string,
      opacity: number
    }
  } = {
    start_tol: 5,
    style: {
      strokeWidth: 1,
      strokeColor: 'red',
      strokeDashArray: '',
      strokeOpacity: 0.5,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      fill: 'lightblue',
      opacity: 0.7
    }
  };

  constructor(paper: joint.dia.Paper, graph: joint.dia.Graph) {
    this.paper = paper;
    this.graph = graph;
  }

  public create() {
    this.rubberbandShape = new joint.shapes.standard.Rectangle();
    this.rubberbandShape.attr({
      body: {
        strokeLinecap: this.opts.style.strokeLinecap,
        strokeLinejoin: this.opts.style.strokeLinejoin,
        strokeWidth: this.opts.style.strokeWidth,
        stroke: this.opts.style.strokeColor,
        strokeDasharray: this.opts.style.strokeDashArray,
        strokeOpacity: this.opts.style.strokeOpacity,
        fill: this.opts.style.fill,
        opacity: this.opts.style.opacity,
        visibility: false,
        pointerEvents: 'none'
      },
    });
    this.rubberbandShape.attr('body/display', 'none');
    this.rubberbandShape.prop('custom/devInfo/type', 'system');
    this.rubberbandShape.addTo(this.graph);
  }

  public draw(start: IPoint, current: IPoint) {
    var dx = start.x - current.x;
    var dy = start.y - current.y;
    var tol = this.opts.start_tol;
    if (Math.abs(dx) > tol || Math.abs(dy) > tol) {
      if (this.rubberbandShape) {
        const x = Math.min(start.x, current.x);
        const y = Math.min(start.y, current.y);
        const width = Math.max(start.x, current.x) - x;
        const height = Math.max(start.y, current.y) - y;
        this.rubberbandShape.position(x, y);
        this.rubberbandShape.resize(width, height);
        this.rubberbandShape.attr('body/display', 'block');
        this.rubberbandRect = new joint.g.Rect(x, y, width, height);
      }
    }
  }

  public destroy() {
    if (this.rubberbandShape) {
      this.rubberbandShape.remove();
      this.rubberbandRect = undefined;
      this.rubberbandShape = undefined;
    }
  }

  public getRect(): joint.g.Rect {
    return this.rubberbandRect;
  }

}
