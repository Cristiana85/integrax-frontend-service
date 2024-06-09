import * as joint from 'jointjs';
import * as jQuery from 'jquery';
import * as _ from 'lodash';
import * as $ from 'backbone';
import { IPoint } from '../../utils/types';
import { MVController } from '../../core/mv-controller';

export class HaloLiteRubberBand {
  private mvc: MVController;

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
      strokeLinecap: string,
      strokeLinejoin: string,
      fill: string,
      opacity: number
    }
  } = {
    start_tol: 5,
    style: {
      strokeWidth: 2,
      strokeColor: '#1a12ff',
      strokeDashArray: '',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      fill: 'transparent',
      opacity: 0.3
    }
  };

  constructor(mvc: MVController) {
    this.mvc = mvc;
    this.paper = mvc.paper;
    this.graph = mvc.graph;
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
        fill: this.opts.style.fill,
        opacity: this.opts.style.opacity,
        visibility: false,
        'vector-effect': "non-scaling-stroke",
      },
    });
    this.rubberbandShape.attr('body/display', 'none');
    this.rubberbandShape.attr('body/category', 'halo');
    this.rubberbandShape.prop('custom/devInfo/type', 'system');
    this.rubberbandShape.prop('custom/devInfo/category', 'halo');
    this.rubberbandShape.addTo(this.graph);
  }

  public updateTools(tools: joint.elementTools.Control[]) {
    if (this.rubberbandShape) {
      if (this.rubberbandShape.findView(this.paper).hasTools()) {
        this.rubberbandShape.findView(this.paper).removeTools();
      }
      if (tools) {
        this.rubberbandShape.findView(this.paper).addTools(
          new joint.dia.ToolsView({
            tools: tools
          })
        );
      }
    }
  }

  public showWithHandle(list: Map<string, joint.dia.ElementView>, visibility: boolean) {
    if (list) {
      this.resetEmbeddedCells();
      this.setEmbeddedElements(list);
      // setup rubberband to fit child
      const child = this.rubberbandShape.getEmbeddedCells()[0] as joint.dia.Element;
      const childBBox = child.getBBox({ rotate: false });
      this.rubberbandShape.position(child.position().x, child.position().y);
      this.rubberbandShape.resize(childBBox.width, childBBox.height);
      this.rubberbandShape.rotate(child.angle(), true);
      // display both rubberband and tools
      if (visibility) {
        this.rubberbandShape.attr('body/display', 'block');
      } else {
        this.rubberbandShape.attr('body/display', 'none');
      }
      this.rubberbandShape.findView(this.paper).showTools();
      // stop delegation for dragging
      this.mvc.setPaperDelegation(false);
    }
  }

  public showWithoutHandle(lElems: Map<string, joint.dia.ElementView>, lLinks: Map<string, joint.dia.LinkView>, visibility: boolean) {
    this.resetEmbeddedCells();
    if (lElems) {
      this.setEmbeddedElements(lElems);
    }
    if(lLinks) {
      this.setEmbeddedLinks(lLinks);
    }
    // display rubberband only (no tools with multi obj)
    if (visibility) {
      // reset rotation (with multi obj, rubber is always rectangular)
      this.rubberbandShape.rotate(0, true);
      // resize rubberband to fit childs
      this.rubberbandShape.fitToChildren(
        {
        deep: false,
        padding: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        },
        shrinkOnly: false,
        expandOnly: false
      });
      this.rubberbandShape.attr('body/display', 'block');
    } else {
      this.rubberbandShape.attr('body/display', 'none');
    }
    // stop delegation for dragging
    this.mvc.setPaperDelegation(false);
  }

  public hide() {
    if (this.rubberbandShape.findView(this.paper).hasTools()) {
      this.rubberbandShape.findView(this.paper).hideTools();
    }
    this.rubberbandShape.attr('body/display', 'none');
    this.mvc.setPaperDelegation(true);
    this.resetEmbeddedCells();
  }

  public add(elem: joint.dia.Element, link: joint.dia.Link) {
    if (elem && elem.isElement()) {
      if (!elem.getParentCell()) {
        this.rubberbandShape.embed(elem);
      }
    }
    if (link && link.isLink()) {
      if (!link.getParentCell()) {
        this.rubberbandShape.embed(link);
      }
    }
  }

  public remove(elem: joint.dia.Element, link: joint.dia.Link) {
    if (elem && elem.isElement()) {
      if (!elem.getParentCell()) {
        this.rubberbandShape.unembed(elem);
      }
    }
    if (link && link.isLink()) {
      if (!link.getParentCell()) {
        this.rubberbandShape.unembed(link);
      }
    }
  }

  private setEmbeddedElements(list: Map<string, joint.dia.ElementView>) {
    if (list) {
      list.forEach((elementView: joint.dia.ElementView) => {
        if (!elementView.model.getParentCell()) {
          this.rubberbandShape.embed(elementView.model);
        }
      });
    }
  }

  private setEmbeddedLinks(list: Map<string, joint.dia.LinkView>) {
    if (list) {
      list.forEach((linkView: joint.dia.LinkView) => {
        if (!linkView.model.getParentCell()) {
          this.rubberbandShape.embed(linkView.model);
        }
      });
    }
  }

  public resetEmbeddedCells() {
    if (this.rubberbandShape) {
      this.rubberbandShape.getEmbeddedCells().forEach((child) => {
        this.rubberbandShape.unembed(child);
      });
    }
  }

  public destroy() {
    if (this.rubberbandShape) {
      this.rubberbandShape.remove();
      this.rubberbandRect = undefined;
      this.rubberbandShape = undefined;
    }
  }

  public getRubberbandRect(): joint.g.Rect {
    return this.rubberbandRect;
  }

  public getRubberband(): joint.dia.Element {
    return this.rubberbandShape;
  }

  public translateRubberBand(dx: number, dy:number) {
    this.rubberbandShape.translate(dx, dy);
  }

  public positionRubberBand(x: number, y:number) {
    this.rubberbandShape.translate(x, y);
  }

}
