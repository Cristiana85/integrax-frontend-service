import * as joint from 'jointjs';
import * as jQuery from 'jquery';
import * as _ from 'lodash';
import * as $ from 'backbone';
import { IPoint } from '../../utils/types';
import { MVController } from '../../core/mv-controller';
import { ThisReceiver } from '@angular/compiler';
import { mode } from 'd3';
import { HaloLite } from './halolite';

/**
 * LIMITATIONS:
 *  -> snapping multi-object not working properly
 *    -> off grid
 *    -> jump effect
 *    -> Sync Snapping Ooperation for all Childs??
 *  -> drag and drop with snapping make elements off grid!

 *  -> NW proportion get strange effects during transition from First and Fourth quadrant
 * WORKAROUND:
 *  -> with multi-object disable resize
 *    -> in any case is quite impossible guarantee that elements are on grid during multi-object resize!!!!!
 *    -> This is a obvious things!
 *    -> also rotation to be on grid must be limited to 90° otherwise you go off grid
 * TODO:
 *  ->
 */
export class HaloLiteHandles extends joint.elementTools.Control {
  private mvc: MVController;

  private halo: HaloLite;

  private _rubberbandBBox: joint.g.Rect; // initial value

  private _handlePosition: joint.g.PlainPoint; // initial value

  private _cellsBBox = new Map<string, joint.g.Rect>(); // initial value

  private _cellsAngle = new Map<string, number>(); // initial value

  private handlePosition: joint.g.PlainPoint; // initial value

  private isHandleDragging: boolean = false;

  private currentAngle: number = 0;

  private tk: number = 1;

  public opts: {
    type: 'rotate' | 'resize';
    enable: boolean;
    axis: 'x' | 'y' | 'xy';
    minRubberWidth: number;
    minRubberHeight: number;
    minRubberRotation: number;
    proportions: boolean;
    handleAnchor: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
    resizeDrawing: {
      shape: 'circle' | 'rect';
      width: number,
      height: number,
      rx: number,
      ry: number,
      strokeWidth: number,
      stroke: string,
      fill: string,
    }
    rotateDrawing: {
      size: number;
      padding: {
        left: number,
        top: number,
        right: number,
        bottom: number,
      }
    }
  } = {
    type: 'resize',
    enable: true,
    axis: 'xy',
    minRubberWidth: 25,
    minRubberHeight: 25,
    minRubberRotation: 5,
    proportions: false,
    handleAnchor: 'ne',
    resizeDrawing: {
      shape: 'circle',
      width: 5,
      height: 5,
      rx: 0,
      ry: 0,
      strokeWidth: 1,
      stroke: 'black',
      fill: 'white',
    },
    rotateDrawing: {
      size: 30,
      padding: {
        left: -25,
        top: 25,
        right: 25,
        bottom: 25,
      }
    }
  };

  constructor(
    mvc: MVController,
    halo: HaloLite,
    type: 'rotate' | 'resize',
    handleAnchor: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'
  ) {
    super();
    this.mvc = mvc;
    this.halo = halo;
    this.opts.type = type;
    this.opts.handleAnchor = handleAnchor;
    this.opts.minRubberRotation = this.mvc.opts.gridline.rotation_grid_size;
    this.tk = this.halo.tk;
    this.setHandleAttribute('default');
  }

  /**
   * Define position of the specific handle
   *
   * @param view
   * @returns
   */
  override getPosition(view: joint.dia.ElementView) {
    const rubberband = view.model;
    if (!this.isHandleDragging) {
      // store rubber band bbox
      this._rubberbandBBox = rubberband.getBBox({ rotate: false });
      // store handle position
      const relHandlePosition = this.getResizeHandlePosition(
        this._rubberbandBBox
      );
      this._handlePosition = {
        x: this._rubberbandBBox.x + relHandlePosition.x,
        y: this._rubberbandBBox.y + relHandlePosition.y,
      };
      // Store all childs bbox
      const childList = rubberband.getEmbeddedCells() as joint.dia.Cell[];
      if (childList) {
        childList.forEach((child) => {
          if (child.isElement()) {
            const childEl = child as joint.dia.Element;
            const childElId = childEl.id.toString();
            this._cellsBBox.set(childElId, childEl.getBBox({ rotate: false }));
            this._cellsAngle.set(childElId, childEl.angle());
          }
        });
      }
      if (this.opts.type === 'resize') {
        this.rubberFitToChildren(rubberband);
        return this.getResizeHandlePosition(rubberband.getBBox());
      } else if (this.opts.type === 'rotate') {
        return this.getRotateHandlePosition(rubberband.getBBox());
      }
    } else {
      if (this.opts.type === 'resize') {
        return this.handlePosition;
      } else if (this.opts.type === 'rotate') {
        return this.getRotateHandlePosition(rubberband.getBBox());
      }
    }
    return undefined;
  }

  /**
   * Define
   *
   * @param view
   * @param relativeCoords
   */
  override setPosition(view: joint.dia.ElementView, relativeCoords: joint.g.PlainPoint) {
    const rubberbandModel = view.model;
    if (this.opts.type === 'resize') {
      this.resize(rubberbandModel, relativeCoords);
    } else if (this.opts.type === 'rotate') {
      this.rotate(rubberbandModel, relativeCoords);
    }
  }

  override onPointerDown(evt: joint.dia.Event) {
    super.onPointerDown(evt);
    this.halo.onHandleDragStart(evt, this);
  }

  override onPointerMove(evt: joint.dia.Event) {
    super.onPointerMove(evt);
    if (!this.isHandleDragging) {
      this.setHandleAttribute('drag');
      super.renderChildren();
      super.update();
    }
    this.isHandleDragging = true;
    this.halo.onHandleDragMove(evt, this);
  }

  override onPointerUp(evt: joint.dia.Event) {
    super.onPointerUp(evt);
    this.isHandleDragging = false;
    this.halo.onHandleDragEnd(evt, this);
    this.setHandleAttribute('default');
    super.renderChildren();
    super.update();
  }

  private rubberFitToChildren(rubberband: joint.dia.Element) {
    const child = rubberband.getEmbeddedCells()[0];
    if (child) {
      const childBBox = child.getBBox();
      rubberband.position(child.position().x, child.position().y);
      rubberband.resize(childBBox.width, childBBox.height);
      rubberband.rotate(child.angle(), true);
      rubberband.attr('body/display', 'block');
    }
  }

  private getRotateHandlePosition(bbox: joint.g.Rect): joint.g.PlainPoint {
    var position = new joint.g.Point();
    switch (this.opts.handleAnchor) {
      case 'n': {
        break;
      }
      case 'e': {
        break;
      }
      case 's': {
        break;
      }
      case 'w': {
        break;
      }
      case 'nw': {
        break;
      }
      case 'ne': {
        break;
      }
      case 'se': {
        break;
      }
      case 'sw': {
        position.x = this.opts.rotateDrawing.padding.left / this.tk;
        position.y = bbox.height + this.opts.rotateDrawing.padding.top / this.tk;
        break;
      }
    }
    return position;
  }

  private getResizeHandlePosition(
    bbox: joint.g.Rect
  ): joint.g.PlainPoint {
    var position = { x: 0, y: 0 };
    switch (this.opts.handleAnchor) {
      case 'n': {
        position = { x: bbox.width / 2, y: 0 };
        break;
      }
      case 'e': {
        position = { x: bbox.width, y: bbox.height / 2 };
        break;
      }
      case 's': {
        position = { x: bbox.width / 2, y: bbox.height };
        break;
      }
      case 'w': {
        position = { x: 0, y: bbox.height / 2 };
        break;
      }
      case 'nw': {
        position = { x: 0, y: 0 };
        break;
      }
      case 'ne': {
        position = { x: bbox.width, y: 0 };
        break;
      }
      case 'se': {
        position = { x: bbox.width, y: bbox.height };
        break;
      }
      case 'sw': {
        position = { x: 0, y: bbox.height };
        break;
      }
    }
    return position;
  }

  private resize(
    rubberband: joint.dia.Element,
    relativeCoords: joint.g.PlainPoint
  ) {
    var scaler = this.scalingXY(relativeCoords);
    // Resize childs and rubberband
    const childList = rubberband.getEmbeddedCells() as joint.dia.Cell[];
    if (childList.length === 1) {
      const child = childList[0];
      if (child.isElement()) { // Element only
        const orCellBBox = this._cellsBBox.get(child.id.toString());
        // calculate updated size
        var w = scaler.x * orCellBBox.width;
        var h = scaler.y * orCellBBox.height;
        // apply mirroring with respsect to rubber band origin
        this.transform(child, w, h, relativeCoords);
      }
    }
    rubberband.attr('body/display', 'none');
  }

  private rotate(
    rubberband: joint.dia.Element,
    relativeCoords: joint.g.PlainPoint
  ) {
    const rubberbandBBox = rubberband.getBBox() as joint.g.Rect;
    const handlePosition = {
      x: rubberbandBBox.x + relativeCoords.x,
      y: rubberbandBBox.y + relativeCoords.y,
    };
    const origin = new joint.g.Point();
    origin.x = this._rubberbandBBox.x + this._rubberbandBBox.width / 2;
    origin.y = this._rubberbandBBox.y + this._rubberbandBBox.height / 2;
    rubberband.rotate(
      this.rotateSnap(
        origin.angleBetween(handlePosition, this._handlePosition)
      ),
      false,
      origin
    );
    const childList = rubberband.getEmbeddedCells() as joint.dia.Cell[];
    childList.forEach((child) => {
      if (child.isElement()) {
        child.rotate(
          rubberband.angle(),
          true,
          origin
        );
      }
    });
    this.currentAngle = rubberband.angle();
  }

  private scalingXY(relativeCoords: joint.g.PlainPoint): joint.g.PlainPoint {
    var delta_sX = 0;
    var delta_sY = 0;
    switch (this.opts.handleAnchor) {
      case 'n': {
        delta_sY = - relativeCoords.y;
        break;
      }
      case 'e': {
        delta_sX = relativeCoords.x - this._rubberbandBBox.width;
        break;
      }
      case 's': {
        delta_sY = relativeCoords.y - this._rubberbandBBox.height;
        break;
      }
      case 'w': {
        delta_sX = - relativeCoords.x;
        break;
      }
      case 'nw': {
        delta_sX = - relativeCoords.x;
        delta_sY = - relativeCoords.y;
        break;
      }
      case 'ne': {
        delta_sX = relativeCoords.x - this._rubberbandBBox.width;
        delta_sY = - relativeCoords.y;
        break;
      }
      case 'se': {
        delta_sX = relativeCoords.x - this._rubberbandBBox.width;
        delta_sY = relativeCoords.y - this._rubberbandBBox.height;
        break;
      }
      case 'sw': {
        delta_sX = - relativeCoords.x;
        delta_sY = relativeCoords.y - this._rubberbandBBox.height;
        break;
      }
    }
    // calculate scaling
    var sX = 1 + delta_sX / this._rubberbandBBox.width;
    var sY = 1 + delta_sY / this._rubberbandBBox.height;
    // set proportions
    if (this.opts.proportions) {
      if (Math.abs(sX) > Math.abs(sY)) {
        sX = sY;
      } else {
        sY = sX;
      }
    }
    return {
      x: sX,
      y: sY
    }
  }

  private transform(model: joint.dia.Element, w: number, h: number, coords: joint.g.PlainPoint) {
    const snappedWH = this.resizeSnap(w, h);
    const boundedWH = this.resizeBoundary(snappedWH.x, snappedWH.y);
    switch (this.opts.handleAnchor) {
      case 'n': {
        model.resize(boundedWH.x, boundedWH.y, { direction: 'top' });
        const bbox = model.getBBox({ rotate: false});
        this.handlePosition = {
          x: bbox.width / 2,
          y: this._rubberbandBBox.height - bbox.height
        }
        break;
      }
      case 'e': {
        model.resize(boundedWH.x, boundedWH.y, { direction: 'right' });
        const bbox = model.getBBox({ rotate: false});
        this.handlePosition = {
          x: bbox.width,
          y: bbox.height / 2,
        }
        break;
      }
      case 's': {
        model.resize(boundedWH.x, boundedWH.y, { direction: 'bottom' });
        const bbox = model.getBBox({ rotate: false});
        this.handlePosition = {
          x: bbox.width / 2,
          y: bbox.height
        }
        break;
      }
      case 'w': {
        model.resize(boundedWH.x, boundedWH.y, { direction: 'left' });
        const bbox = model.getBBox({ rotate: false});
        this.handlePosition = {
          x: this._rubberbandBBox.width - bbox.width,
          y: bbox.height / 2
        }
        break;
      }
      case 'nw': {
        model.resize(boundedWH.x, boundedWH.y, { direction: 'top-left' });
        const bbox = model.getBBox({ rotate: false});
        if (boundedWH.x > this.opts.minRubberWidth && boundedWH.y > this.opts.minRubberHeight) {
          this.handlePosition = {
            x: this.resizeSnap(coords.x, coords.x).x,
            y: this.resizeSnap(coords.y, coords.y).y
          }
        } else {
          if (boundedWH.x === this.opts.minRubberWidth && boundedWH.y === this.opts.minRubberHeight) {
            this.handlePosition = {
              x: this._rubberbandBBox.width - this.opts.minRubberWidth,
              y: this._rubberbandBBox.height - this.opts.minRubberHeight
            }
            return;
          }
          if (boundedWH.x > this.opts.minRubberWidth) {
            this.handlePosition = {
              x: this.resizeSnap(coords.x, coords.x).x,
              y: this._rubberbandBBox.height - this.opts.minRubberHeight
            }
          }
          if (boundedWH.y > this.opts.minRubberHeight) {
            this.handlePosition = {
              x: this._rubberbandBBox.width - this.opts.minRubberWidth,
              y: this.resizeSnap(coords.y, coords.y).y,
            }
          }
        }
        break;
      }
      case 'ne': {
        model.resize(boundedWH.x, boundedWH.y, { direction: 'top-right' });
        const bbox = model.getBBox({ rotation: false });
        if (boundedWH.y > this.opts.minRubberHeight) {
          this.handlePosition = {
            x: bbox.width,
            y: this.resizeSnap(coords.y, coords.y).y
          }
        } else {
          this.handlePosition = {
            x: bbox.width,
            y: this._rubberbandBBox.height - this.opts.minRubberHeight
          }
        }
        break;
      }
      case 'se': {
        model.resize(boundedWH.x, boundedWH.y, { direction: 'bottom-right' });
        const bbox = model.getBBox({ rotation: false });
        this.handlePosition = {
          x: bbox.width,
          y: bbox.height
        }
        break;
      }
      case 'sw': {
        model.resize(boundedWH.x, boundedWH.y, { direction: 'bottom-left' });
        const bbox = model.getBBox({ rotation: false });
        if (boundedWH.x > this.opts.minRubberWidth) {
          this.handlePosition = {
            x: this.resizeSnap(coords.x, coords.x).x,
            y: bbox.height
          }
        } else {
          this.handlePosition = {
            x: this._rubberbandBBox.width - this.opts.minRubberWidth,
            y: bbox.height
          }
        }
        break;
      }
    }
  }

  private resizeBoundary(w: number, h: number): joint.g.PlainPoint {
    var _w = w;
    var _h = h;
    if (w < this.opts.minRubberWidth) {
      _w = this.opts.minRubberWidth;
    }
    if (h < this.opts.minRubberHeight) {
      _h = this.opts.minRubberHeight;
    }
    return {x: _w, y: _h};
  }

  private resizeSnap(w: number, h: number): joint.g.PlainPoint {
    const gridSize = this.mvc.opts.gridline.resize_grid_size;
    var snapPoint = {
      x: Math.round(w / gridSize) * gridSize,
      y: Math.round(h / gridSize) * gridSize,
    };
    return snapPoint;
  }

  private rotateSnap(angle: number): number {
    const rotationSize = this.opts.minRubberRotation;
    var snappedAngle = Math.round(angle / rotationSize) * rotationSize;
    return snappedAngle;
  }

  public setHandleAttribute(state: 'default' | 'drag' | 'rotate' | 'zoom', param?: number) {
    var inflate;

    if (state === 'default' || state === 'rotate') {
      inflate = 0;
    }

    if (state === 'drag') {
      inflate = 1;
    }

    if (state === 'zoom') {
      inflate = 0;
      this.tk = param;
    }

    const _w = this.opts.resizeDrawing.width / this.tk;
    const _h = this.opts.resizeDrawing.height / this.tk;
    const _rx = this.opts.resizeDrawing.rx / this.tk;
    const _ry = this.opts.resizeDrawing.ry / this.tk;
    const _size = this.opts.rotateDrawing.size / this.tk;

    const maxWH = Math.max(_w, _h);
    const maxRxRy = Math.max(_rx, _ry);
    const maxSize = _size + inflate;

    if (this.opts.type === 'resize') {
      const ew_resize =
        this.opts.handleAnchor === 'e' || this.opts.handleAnchor === 'w';
      const ns_resize =
        this.opts.handleAnchor === 'n' || this.opts.handleAnchor === 's';
      const nesw_resize =
        this.opts.handleAnchor === 'ne' || this.opts.handleAnchor === 'sw';
      const nwse_resize =
        this.opts.handleAnchor === 'nw' || this.opts.handleAnchor === 'se';

      if (ew_resize) {
        this.children = [
          {
            tagName: this.opts.resizeDrawing.shape === 'circle' ? 'circle' : 'rect',
            selector: 'handle',
            attributes: {
              r: maxWH + inflate,
              x: this.opts.resizeDrawing.shape === 'circle' ? 0 : -this.opts.resizeDrawing.height / 2,
              y: this.opts.resizeDrawing.shape === 'circle' ? 0 : -this.opts.resizeDrawing.width / 2,
              width: maxWH,
              height: maxWH,
              rx: maxRxRy,
              ry: maxRxRy,
              'stroke-width': this.opts.resizeDrawing.strokeWidth / this.tk,
              stroke: this.opts.resizeDrawing.stroke,
              fill: this.opts.resizeDrawing.fill,
              cursor: this.getCursor(),
            },
          },
        ];
      } else if (ns_resize) {
        this.children = [
          {
            tagName: this.opts.resizeDrawing.shape === 'circle' ? 'circle' : 'rect',
            selector: 'handle',
            attributes: {
              r: maxWH + inflate,
              x: this.opts.resizeDrawing.shape === 'circle' ? 0 : -this.opts.resizeDrawing.width / 2,
              y: this.opts.resizeDrawing.shape === 'circle' ? 0 : -this.opts.resizeDrawing.height / 2,
              width: maxWH,
              height: maxWH,
              rx: maxRxRy,
              ry: maxRxRy,
              'stroke-width': this.opts.resizeDrawing.strokeWidth / this.tk,
              stroke: this.opts.resizeDrawing.stroke,
              fill: this.opts.resizeDrawing.fill,
              cursor: this.getCursor(),
            },
          },
        ];
      } else if (nesw_resize) {
        this.children = [
          {
            tagName: this.opts.resizeDrawing.shape === 'circle' ? 'circle' : 'rect',
            selector: 'handle',
            attributes: {
              r: maxWH + inflate,
              x: this.opts.resizeDrawing.shape === 'circle' ? 0 : -maxWH / 2,
              y: this.opts.resizeDrawing.shape === 'circle' ? 0 : -maxWH / 2,
              width: maxWH,
              height: maxWH,
              rx: maxRxRy,
              ry: maxRxRy,
              'stroke-width': this.opts.resizeDrawing.strokeWidth / this.tk,
              stroke: this.opts.resizeDrawing.stroke,
              fill: this.opts.resizeDrawing.fill,
              cursor: this.getCursor(),
            },
          },
        ];
      } else if (nwse_resize) {
        this.children = [
          {
            tagName: this.opts.resizeDrawing.shape === 'circle' ? 'circle' : 'rect',
            selector: 'handle',
            attributes: {
              r: maxWH + inflate,
              x: this.opts.resizeDrawing.shape === 'circle' ? 0 : -maxWH / 2,
              y: this.opts.resizeDrawing.shape === 'circle' ? 0 : -maxWH / 2,
              width: maxWH,
              height: maxWH,
              rx: maxRxRy,
              ry: maxRxRy,
              'stroke-width': this.opts.resizeDrawing.strokeWidth / this.tk,
              stroke: this.opts.resizeDrawing.stroke,
              fill: this.opts.resizeDrawing.fill,
              cursor: this.getCursor(),
            },
          },
        ];
      }
    } else if (this.opts.type === 'rotate') {
      this.children = [
        {
          tagName: 'image',
          selector: 'handle',
          attributes: {
            x: - maxSize / 2, // due to relative rotation
            y: - maxSize / 2, // due to relative rotation
            width: maxSize,
            height: maxSize,
            "xlink:href":
              "../../../assets/rotate-left.svg"
          },
        },
      ];
    }
  }

  public getAngle(): number {
    return this.currentAngle;
  }

  public setAngle(angle: number) {
    this.currentAngle = angle;
  }

  public getZoom(): number {
    return this.tk;
  }

  public setZoom(tk: number) {
    this.tk = tk;
  }

  private getCursor(): string {
    const cursorList = [
      'ns-resize', // N - 0
      'nesw-resize', // NE - 1
      'ew-resize', // E - 2
      'nwse-resize', // SE - 3
      'ns-resize', // S - 4
      'nesw-resize', // SW - 5
      'ew-resize', // W - 6
      'nwse-resize', // NW - 7
      'ns-resize', // N - 0
      'nesw-resize', // NE - 1
      'ew-resize', // E - 2
      'nwse-resize', // SE - 3
      'ns-resize', // S - 4
      'nesw-resize', // SW - 5
      'ew-resize', // W - 6
      'nwse-resize', // NW - 7
    ];
    var cursor = 'pointer';
    const angle = this.currentAngle;
    switch (this.opts.handleAnchor) {
      case 'n': {
        const index = 0;
        if (angle >= 0 && angle < 30) {
          cursor = cursorList[index + 0];
        } else if (angle >= 30 && angle < 60) {
          cursor = cursorList[index + 1];
        } else if (angle >= 60 && angle < 90) {
          cursor = cursorList[index + 1];
        } else if (angle >= 90 && angle < 120) {
          cursor = cursorList[index + 2];
        } else if (angle >= 120 && angle < 150) {
          cursor = cursorList[index + 3];
        } else if (angle >= 150 && angle < 180) {
          cursor = cursorList[index + 3];
        } else if (angle >= 180 && angle < 210) {
          cursor = cursorList[index + 4];
        } else if (angle >= 210 && angle < 240) {
          cursor = cursorList[index + 5];
        } else if (angle >= 240 && angle < 270) {
          cursor = cursorList[index + 5];
        } else if (angle >= 270 && angle < 300) {
          cursor = cursorList[index + 6];
        } else if (angle >= 300 && angle < 330) {
          cursor = cursorList[index + 7];
        } else if (angle >= 330 && angle < 360) {
          cursor = cursorList[index + 7];
        }
        break;
      }
      case 'e': {
        const index = 2;
        if (angle >= 0 && angle < 30) {
          cursor = cursorList[index + 0];
        } else if (angle >= 30 && angle < 60) {
          cursor = cursorList[index + 1];
        } else if (angle >= 60 && angle < 90) {
          cursor = cursorList[index + 1];
        } else if (angle >= 90 && angle < 120) {
          cursor = cursorList[index + 2];
        } else if (angle >= 120 && angle < 150) {
          cursor = cursorList[index + 3];
        } else if (angle >= 150 && angle < 180) {
          cursor = cursorList[index + 3];
        } else if (angle >= 180 && angle < 210) {
          cursor = cursorList[index + 4];
        } else if (angle >= 210 && angle < 240) {
          cursor = cursorList[index + 5];
        } else if (angle >= 240 && angle < 270) {
          cursor = cursorList[index + 5];
        } else if (angle >= 270 && angle < 300) {
          cursor = cursorList[index + 6];
        } else if (angle >= 300 && angle < 330) {
          cursor = cursorList[index + 7];
        } else if (angle >= 330 && angle < 360) {
          cursor = cursorList[index + 7];
        }
        break;
      }
      case 's': {
        const index = 4;
        if (angle >= 0 && angle < 30) {
          cursor = cursorList[index + 0];
        } else if (angle >= 30 && angle < 60) {
          cursor = cursorList[index + 1];
        } else if (angle >= 60 && angle < 90) {
          cursor = cursorList[index + 1];
        } else if (angle >= 90 && angle < 120) {
          cursor = cursorList[index + 2];
        } else if (angle >= 120 && angle < 150) {
          cursor = cursorList[index + 3];
        } else if (angle >= 150 && angle < 180) {
          cursor = cursorList[index + 3];
        } else if (angle >= 180 && angle < 210) {
          cursor = cursorList[index + 4];
        } else if (angle >= 210 && angle < 240) {
          cursor = cursorList[index + 5];
        } else if (angle >= 240 && angle < 270) {
          cursor = cursorList[index + 5];
        } else if (angle >= 270 && angle < 300) {
          cursor = cursorList[index + 6];
        } else if (angle >= 300 && angle < 330) {
          cursor = cursorList[index + 7];
        } else if (angle >= 330 && angle < 360) {
          cursor = cursorList[index + 7];
        }
        break;
      }
      case 'w': {
        const index = 6;
        if (angle >= 0 && angle < 30) {
          cursor = cursorList[index + 0];
        } else if (angle >= 30 && angle < 60) {
          cursor = cursorList[index + 1];
        } else if (angle >= 60 && angle < 90) {
          cursor = cursorList[index + 1];
        } else if (angle >= 90 && angle < 120) {
          cursor = cursorList[index + 2];
        } else if (angle >= 120 && angle < 150) {
          cursor = cursorList[index + 3];
        } else if (angle >= 150 && angle < 180) {
          cursor = cursorList[index + 3];
        } else if (angle >= 180 && angle < 210) {
          cursor = cursorList[index + 4];
        } else if (angle >= 210 && angle < 240) {
          cursor = cursorList[index + 5];
        } else if (angle >= 240 && angle < 270) {
          cursor = cursorList[index + 5];
        } else if (angle >= 270 && angle < 300) {
          cursor = cursorList[index + 6];
        } else if (angle >= 300 && angle < 330) {
          cursor = cursorList[index + 7];
        } else if (angle >= 330 && angle < 360) {
          cursor = cursorList[index + 7];
        }
        break;
      }
      case 'nw': {
        const index = 7;
        if (angle >= 0 && angle < 30) {
          cursor = cursorList[index + 0];
        } else if (angle >= 30 && angle < 60) {
          cursor = cursorList[index + 1];
        } else if (angle >= 60 && angle < 90) {
          cursor = cursorList[index + 1];
        } else if (angle >= 90 && angle < 120) {
          cursor = cursorList[index + 2];
        } else if (angle >= 120 && angle < 150) {
          cursor = cursorList[index + 3];
        } else if (angle >= 150 && angle < 180) {
          cursor = cursorList[index + 3];
        } else if (angle >= 180 && angle < 210) {
          cursor = cursorList[index + 4];
        } else if (angle >= 210 && angle < 240) {
          cursor = cursorList[index + 5];
        } else if (angle >= 240 && angle < 270) {
          cursor = cursorList[index + 5];
        } else if (angle >= 270 && angle < 300) {
          cursor = cursorList[index + 6];
        } else if (angle >= 300 && angle < 330) {
          cursor = cursorList[index + 7];
        } else if (angle >= 330 && angle < 360) {
          cursor = cursorList[index + 7];
        }
        break;
      }
      case 'ne': {
        const index = 1;
        if (angle >= 0 && angle < 30) {
          cursor = cursorList[index + 0];
        } else if (angle >= 30 && angle < 60) {
          cursor = cursorList[index + 1];
        } else if (angle >= 60 && angle < 90) {
          cursor = cursorList[index + 1];
        } else if (angle >= 90 && angle < 120) {
          cursor = cursorList[index + 2];
        } else if (angle >= 120 && angle < 150) {
          cursor = cursorList[index + 3];
        } else if (angle >= 150 && angle < 180) {
          cursor = cursorList[index + 3];
        } else if (angle >= 180 && angle < 210) {
          cursor = cursorList[index + 4];
        } else if (angle >= 210 && angle < 240) {
          cursor = cursorList[index + 5];
        } else if (angle >= 240 && angle < 270) {
          cursor = cursorList[index + 5];
        } else if (angle >= 270 && angle < 300) {
          cursor = cursorList[index + 6];
        } else if (angle >= 300 && angle < 330) {
          cursor = cursorList[index + 7];
        } else if (angle >= 330 && angle < 360) {
          cursor = cursorList[index + 7];
        }
        break;
      }
      case 'se': {
        const index = 3;
        if (angle >= 0 && angle < 20) {
          cursor = cursorList[index + 0];
        } else if (angle >= 20 && angle < 40) {
          cursor = cursorList[index + 1];
        } else if (angle >= 40 && angle < 60) {
          cursor = cursorList[index + 1];
        } else if (angle >= 60 && angle < 80) {
          cursor = cursorList[index + 1];
        } else if (angle >= 80 && angle < 100) {
          cursor = cursorList[index + 2];
        } else if (angle >= 100 && angle < 120) {
          cursor = cursorList[index + 2];
        } else if (angle >= 120 && angle < 140) {
          cursor = cursorList[index + 3];
        } else if (angle >= 140 && angle < 160) {
          cursor = cursorList[index + 3];
        } else if (angle >= 160 && angle < 180) {
          cursor = cursorList[index + 4];
        } else if (angle >= 180 && angle < 200) {
          cursor = cursorList[index + 4];
        } else if (angle >= 200 && angle < 220) {
          cursor = cursorList[index + 5];
        } else if (angle >= 220 && angle <= 240) {
          cursor = cursorList[index + 5];
        } else if (angle > 240 && angle < 260) {
          cursor = cursorList[index + 6];
        } else if (angle >= 260 && angle < 280) {
          cursor = cursorList[index + 6];
        } else if (angle >= 280 && angle < 300) {
          cursor = cursorList[index + 7];
        } else if (angle >= 300 && angle < 320) {
          cursor = cursorList[index + 7];
        } else if (angle >= 320 && angle < 340) {
          cursor = cursorList[index + 7];
        } else if (angle >= 340 && angle < 360) {
          cursor = cursorList[index + 8];
        }
        break;
      }
      case 'sw': {
        const index = 5;
        if (angle >= 0 && angle < 30) {
          cursor = cursorList[index + 0];
        } else if (angle >= 30 && angle < 60) {
          cursor = cursorList[index + 1];
        } else if (angle >= 60 && angle < 90) {
          cursor = cursorList[index + 1];
        } else if (angle >= 90 && angle < 120) {
          cursor = cursorList[index + 2];
        } else if (angle >= 120 && angle < 150) {
          cursor = cursorList[index + 3];
        } else if (angle >= 150 && angle < 180) {
          cursor = cursorList[index + 3];
        } else if (angle >= 180 && angle < 210) {
          cursor = cursorList[index + 4];
        } else if (angle >= 210 && angle < 240) {
          cursor = cursorList[index + 5];
        } else if (angle >= 240 && angle < 270) {
          cursor = cursorList[index + 5];
        } else if (angle >= 270 && angle < 300) {
          cursor = cursorList[index + 6];
        } else if (angle >= 300 && angle < 330) {
          cursor = cursorList[index + 7];
        } else if (angle >= 330 && angle < 360) {
          cursor = cursorList[index + 7];
        }
        break;
      }
    }
    return cursor;
  }

}
