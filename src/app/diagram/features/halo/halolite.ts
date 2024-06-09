import * as joint from 'jointjs';
import { MVController } from '../../core/mv-controller';
import { HaloLiteRubberBand } from './halolite-rubberband';
import { HaloLiteHandles } from './halolite-handles';
import { DiaHelper } from '../../utils/diagram-helper';

export class HaloLite {
  public mvc: MVController;

  private paper: joint.dia.Paper;

  private graph: joint.dia.Graph;

  private rubberband: HaloLiteRubberBand;

  private rubberbandTools: HaloLiteHandles[] = [];

  private isMounted: boolean = false;

  private isHaloSet: boolean = false;

  public tk: number = 1;

  constructor(mvc: MVController) {
    if (mvc) {
      this.mvc = mvc;
      this.paper = mvc.paper;
      this.graph = mvc.graph;
    }
  }

  public mount() {
    if (this.mvc && this.paper && this.graph) {
      this.isMounted = true;
    }
  }

  public update() {
    /**
     * Rule:
     *  -> if multi-selection then invisible halo with no tools
     *  -> if single-selection then check if it is an element and if it is then apply halo based on its configurations
     *  -> if single link is selected then enable its tool
     *  -> if multi-selection, disable tool if needed
     */
    if (this.isMounted) {
      const lElems = this.mvc.selection.lSelectedElements; // Elements
      const lLinks = this.mvc.selection.lSelectedLinks; // Links
      var side: boolean = false;
      var corner: boolean = false;
      var rotation: boolean = false;
      var visibility: boolean = false;
      var minAngle: number = 0;
      var minWidth: number = 0;
      var minHeight: number = 0;
      var proportion: boolean = false;
      if (this.mvc.selection.isMultiSelection()) {
        lLinks.forEach(linkview => {
          if (linkview.hasTools()) {
            linkview.removeTools();
          }
        });
        if (this.rubberband) {
          this.createHandles(
            corner,
            side,
            rotation,
            minAngle,
            minWidth,
            minHeight,
            proportion
          );
          this.rubberband.updateTools(this.rubberbandTools);
          this.rubberband.showWithoutHandle(lElems, lLinks, visibility);
        } else {
          this.rubberband = new HaloLiteRubberBand(this.mvc);
          this.createHandles(
            corner,
            side,
            rotation,
            minAngle,
            minWidth,
            minHeight,
            proportion
          );
          this.rubberband.create();
          this.rubberband.updateTools(this.rubberbandTools);
          this.rubberband.showWithoutHandle(lElems, lLinks, visibility);
        }
        this.isHaloSet = true;
      } else {
        // does not exist tool for link, only for elements
        if (lElems.size === 0 && lLinks.size === 1) {
          const cellView = lLinks.entries().next().value[1];
          this.mvc.wiring.setTool(cellView, true);
        } else if (lElems.size === 1 && lLinks.size === 0) {
          const child = lElems.entries().next().value[1];
          const config = DiaHelper.getConfigFromView(this.mvc, child);
          if (config) {
            // get child info and set halo accordingly
            if (config.type === 'diagram') {
              if (config.halo.isHaloable) {
                side = config.halo.isSideResizable;
                corner = config.halo.isCornerResizable;
                rotation = config.halo.isRotatable;
                visibility = config.halo.isRubberbandVisible;
                minAngle = config.halo.minAngle;
                minWidth = config.halo.minWidth;
                minHeight = config.halo.minHeight;
                proportion = config.halo.isProportional;
                if (this.rubberband) {
                  this.createHandles(
                    corner,
                    side,
                    rotation,
                    minAngle,
                    minWidth,
                    minHeight,
                    proportion
                  );
                  this.rubberband.updateTools(this.rubberbandTools);
                  this.rubberband.showWithHandle(lElems, visibility);
                } else {
                  this.rubberband = new HaloLiteRubberBand(this.mvc);
                  this.createHandles(
                    corner,
                    side,
                    rotation,
                    minAngle,
                    minWidth,
                    minHeight,
                    proportion
                  );
                  this.rubberband.create();
                  this.rubberband.updateTools(this.rubberbandTools);
                  this.rubberband.showWithHandle(lElems, visibility);
                }
              } else {
                this.destroyRubberband();
                this.isHaloSet = false;
              }
            }
          }
          this.isHaloSet = true;
        } else {
          this.destroyRubberband();
          this.isHaloSet = false;
        }
      }
    }
  }

  public closeRubberBand() {
    this.rubberband.resetEmbeddedCells();
    this.destroyRubberband();
    this.isHaloSet = false;
  }

  public setLinkToHalo(link: joint.dia.Link, addRemove: boolean) {
    if (this.mvc.selection.isMultiSelection()) {
      if(link) {
        if (addRemove) {
          this.rubberband.add(undefined, link);
        } else {
          this.rubberband.remove(undefined, link);
        }
      }
    }
  }

  public setElementToHalo(elem: joint.dia.Element, addRemove: boolean) {
    if (this.mvc.selection.isMultiSelection()) {
      if(elem) {
        if (addRemove) {
          this.rubberband.add(elem, undefined);
        } else {
          this.rubberband.remove(elem, undefined);
        }
      }
    }
  }

  public isHaloEnabled(): boolean {
    return this.isHaloSet;
  }

  public postionRubberband(x: number, y: number) {
    this.rubberband.positionRubberBand(x, y);
  }

  public translateRubberBand(dx: number, dy: number) {
    this.rubberband.translateRubberBand(dx, dy);
  }

  public getEmbeddedCells(): joint.dia.Cell[] {
    return this.rubberband.getRubberband().getEmbeddedCells();
  }

  public getEmbeddedElements(): joint.dia.Element[] {
    let elementList: joint.dia.Element[] = [];
    this.rubberband
      .getRubberband()
      .getEmbeddedCells()
      .forEach((child) => {
        if (child.isElement()) {
          elementList.push(child);
        }
      });
    return elementList;
  }

  public getEmbeddedLink(): joint.dia.Link[] {
    let linkList: joint.dia.Link[] = [];
    this.rubberband
      .getRubberband()
      .getEmbeddedCells()
      .forEach((child) => {
        if (child.isLink()) {
          linkList.push(child);
        }
      });
    return linkList;
  }

  public updateWithZoom(k: number) {
    if (this.isHaloEnabled()) {
      this.rubberbandTools.forEach((handle) => {
        if (k > 1) {
          handle.setHandleAttribute('zoom', 1 * k);
          handle.renderChildren();
          handle.update();
          this.tk = 1 * k;
        } else {
          handle.setHandleAttribute('zoom', 1.5 * k);
          handle.renderChildren();
          handle.update();
          this.tk = 1.5 * k;
        }
      });
    } else {
      if (k > 1) {
        this.tk = 1 * k;
      } else {
        this.tk = 1.5 * k;
      }
    }
  }

  public onHandleDragStart(evt: joint.dia.Event, handle: HaloLiteHandles) {
    this.mvc.onHaloHandleDrag('start');
  }

  public onHandleDragMove(evt: joint.dia.Event, handle: HaloLiteHandles) {
    this.mvc.onHaloHandleDrag('move');
  }

  public onHandleDragEnd(evt: joint.dia.Event, handle: HaloLiteHandles) {
    this.mvc.onHaloHandleDrag('end');
    // update cursor of all handles
    if (handle.opts.type === 'rotate') {
      this.rubberbandTools.forEach((handle_item) => {
        handle_item.setAngle(handle.getAngle());
        handle_item.setHandleAttribute('rotate');
        handle_item.renderChildren();
        handle_item.update();
      });
    }
  }

  public reset() {
    this.destroyRubberband();
    this.isHaloSet = false;
  }

  private createHandles(
    corner: boolean,
    side: boolean,
    rotate: boolean,
    angle: number,
    width: number,
    height: number,
    proportion: boolean
  ) {
    this.rubberbandTools = [];
    if (corner) {
      var handle = undefined;
      handle = new HaloLiteHandles(this.mvc, this, 'resize', 'nw');
      handle.opts.minRubberWidth = width;
      handle.opts.minRubberHeight = height;
      handle.opts.proportions = proportion;
      this.rubberbandTools.push(handle);
      handle = new HaloLiteHandles(this.mvc, this, 'resize', 'ne');
      handle.opts.minRubberWidth = width;
      handle.opts.minRubberHeight = height;
      handle.opts.proportions = proportion;
      this.rubberbandTools.push(handle);
      handle = new HaloLiteHandles(this.mvc, this, 'resize', 'se');
      handle.opts.minRubberWidth = width;
      handle.opts.minRubberHeight = height;
      handle.opts.proportions = proportion;
      this.rubberbandTools.push(handle);
      handle = new HaloLiteHandles(this.mvc, this, 'resize', 'sw');
      handle.opts.minRubberWidth = width;
      handle.opts.minRubberHeight = height;
      handle.opts.proportions = proportion;
      this.rubberbandTools.push(handle);
    }
    if (side) {
      var handle = undefined;
      handle = new HaloLiteHandles(this.mvc, this, 'resize', 'n');
      handle.opts.minRubberWidth = width;
      handle.opts.minRubberHeight = height;
      this.rubberbandTools.push(handle);
      handle = new HaloLiteHandles(this.mvc, this, 'resize', 's');
      handle.opts.minRubberWidth = width;
      handle.opts.minRubberHeight = height;
      this.rubberbandTools.push(handle);
      handle = new HaloLiteHandles(this.mvc, this, 'resize', 'w');
      handle.opts.minRubberWidth = width;
      handle.opts.minRubberHeight = height;
      this.rubberbandTools.push(handle);
      handle = new HaloLiteHandles(this.mvc, this, 'resize', 'e');
      handle.opts.minRubberWidth = width;
      handle.opts.minRubberHeight = height;
      this.rubberbandTools.push(handle);
    }
    if (rotate) {
      const handle = new HaloLiteHandles(this.mvc, this, 'rotate', 'sw');
      handle.opts.minRubberRotation = angle;
      this.rubberbandTools.push(handle);
    }
  }

  private destroyRubberband() {
    if (this.rubberband) {
      this.rubberband.hide();
      this.rubberband.destroy();
      this.rubberband = undefined;
    }
    this.rubberbandTools = [];
  }
}
