import * as joint from 'jointjs';
import * as _ from 'lodash';
import { SelectionRubberBand } from './selection-rubberband';
import { MVController } from '../../core/mv-controller';
import { IPoint } from '../../utils/types';
import { HierarchyManager } from '../hierarchy/Hierarchy-manager';
import { DiaHelper } from '../../utils/diagram-helper';

/**
 * TODO:
 *  -> LIMITATION:
 *    -> with mouseup the call to selectioncompletition is doubled
 * -> groups management
 *  -> also with simple selection! ---> managed by component/selection?
 *  -> child selection? ---> managed by component/selection?
 *  -> parent strict selection? whene select a child select automatically the parent as well ---> managed by component/selection?
 * -> embeed (child selectable)
 * -> define selection filter
 */
export class Selections {
  public mvc: MVController;

  private paper: joint.dia.Paper;

  private graph: joint.dia.Graph;

  private hierarchyManager: HierarchyManager;

  private isMounted: boolean = false;

  public lSelectedElements: Map<string, joint.dia.ElementView>;

  public lSelectedLinks: Map<string, joint.dia.LinkView>;

  private rubberbandView: SelectionRubberBand;

  private start_point: joint.g.Point;

  public innerFilterList: Map<string, string>;

  public customFilterList: Map<string, string>;

  public opts: {
    enable_selection: boolean;
    ctrl_enable: boolean;
    filter_enable: boolean;
    rubberband: {
      enable: boolean;
      element: {
        bbox_strict: boolean; // false: partial, true: full
      };
      link: {
        type: 'bbox' | 'segment';
        bbox_strict: boolean; // false: partial, true: full
        segment_strict: boolean; // false: partial, true: full
      };
      tol_width: number;
      tol_height: number;
    };
  } = {
    enable_selection: true,
    ctrl_enable: true,
    filter_enable: false,
    rubberband: {
      enable: true,
      element: {
        bbox_strict: true, // false: partial, true: full
      },
      link: {
        type: 'bbox',
        bbox_strict: true,
        segment_strict: false,
      },
      tol_width: 5,
      tol_height: 5,
    },
  };

  constructor(
    mvc: MVController
  ) {
    this.mvc = mvc;
    this.paper = mvc.paper;
    this.graph = mvc.graph;
  }

  public mount() {
    this.lSelectedElements = new Map<string, joint.dia.ElementView>();
    this.lSelectedLinks = new Map<string, joint.dia.LinkView>();
    this.innerFilterList = new Map<string, string>([
      ['rubber-band-tool', 'rubber-band-tool'],
      ['inherent-multi-drag-tool', 'inherent-multi-drag-tool'],
    ]);
    this.customFilterList = new Map<string, string>();
    this.rubberbandView = new SelectionRubberBand(this.paper, this.graph);
    this.hierarchyManager = new HierarchyManager(
      this.mvc,
      this.paper,
      this.graph
    );
    this.isMounted = true;
  }

  /**
   * EVENT HANDLERS FROM CELL (element or link)
   *
   */
  public cell_pointerclick_handler(cellView: joint.dia.CellView, evt: any) {}

  private halo_translate_coords: joint.g.Point;

  public cell_pointerdown_handler(cellView: joint.dia.CellView, evt: any) {
    if (this.isMounted && this.opts.enable_selection) {
      if (cellView && evt && evt.originalEvent) {
        if (!DiaHelper.isSystem(this.mvc, cellView)) {
          const config = DiaHelper.getConfigFromView(this.mvc, cellView);
          const id = cellView.model.id.toString();
          // manage link drag with halo!
          if (cellView.model.isLink() && this.lSelectedLinks.get(id) && this.mvc.halo.isHaloEnabled()) {
            // cancel move for the child (currently dragged element)
            const org_evt = evt.originalEvent as MouseEvent;
            let currentCoord = new joint.g.Point(org_evt.offsetX, org_evt.offsetY);
            currentCoord = this.paper.snapToGrid(currentCoord.x, currentCoord.y);
            this.halo_translate_coords = currentCoord;
            (cellView as joint.dia.LinkView).setInteractivity({
              linkMove: false
            })
          }
        } else {
          // TODO: SYSTEM
        }
      }
    }
  }

  public cell_pointermove_handler(cellView: joint.dia.CellView, evt: any) {
    if (this.isMounted && this.opts.enable_selection) {
      if (cellView && evt && evt.originalEvent) {
        if (!DiaHelper.isSystem(this.mvc, cellView)) {
          const config = DiaHelper.getConfigFromView(this.mvc, cellView);
          const id = cellView.model.id.toString();
          if (this.opts.enable_selection && !this.lSelectedElements.get(id) && !this.lSelectedLinks.get(id)) {
            // unselect all
            this.applyGestureUnselection('mousemove', evt);
            // apply selection
            this.applySelectionProcess(cellView, evt.originalEvent.ctrlKey);
            // manage link drag with halo!
          } else if (cellView.model.isLink() && this.mvc.halo.isHaloEnabled()) {
            const org_evt = evt.originalEvent as MouseEvent;
            let currentCoord = new joint.g.Point(org_evt.offsetX, org_evt.offsetY);
            currentCoord = this.paper.snapToGrid(currentCoord.x, currentCoord.y);
            const dx = this.halo_translate_coords.x - currentCoord.x;
            const dy = this.halo_translate_coords.y - currentCoord.y;
            this.mvc.halo.translateRubberBand(-dx, -dy);
            this.halo_translate_coords = currentCoord;
          }
        } else {
          // TODO: SYSTEM
        }
      }
    }
  }

  public cell_pointerup_handler(cellView: joint.dia.CellView, evt: any) {
    if (this.isMounted && this.opts.enable_selection) {
      if (evt && evt.originalEvent) {
        if (!DiaHelper.isSystem(this.mvc, cellView)) {
          const config = DiaHelper.getConfigFromView(this.mvc, cellView);
          const id = cellView.model.id.toString();
          if (!this.lSelectedElements.get(id) && !this.lSelectedLinks.get(id)) {
            // apply selection
            this.applySelectionProcess(cellView, evt.originalEvent.ctrlKey);
            // fire process completition
            this.onCellsSelectionCompletion();
          } else {
            // manage link drag with halo!
            if (cellView.model.isLink() && this.mvc.halo.isHaloEnabled()) {
              (cellView as joint.dia.LinkView).setInteractivity({
                linkMove: true
              })
            }
            // fire process completition
            this.onCellsSelectionCompletion();
          }
        } else {
          // TODO: SYSTEM
        }
      }
    }
  }

  /**
   * EVENT HANDLERS FROM PAPER (blank)
   *
   */
  public paper_pointerclick_handler(evt: any, x: number, y: number) {}

  public paper_pointerdown_handler(evt: any, x: number, y: number) {
    if (this.isMounted && this.opts.enable_selection) {
      if (this.opts.rubberband.enable) {
        var coord = this.paper.pageToLocalPoint(evt.offsetX, evt.offsetY);
        this.start_point = new joint.g.Point(coord.x, coord.y);
        this.rubberbandView.create();
      }
    }
  }

  public paper_pointermove_handler(evt: any, x: number, y: number) {
    if (this.isMounted && this.opts.enable_selection) {
      // unselect all
      this.applyGestureUnselection('mousemove', evt);
      // apply rubberband selection
      if (this.opts.rubberband.enable) {
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
          if (this.start_point && current) {
            this.rubberbandView.draw(this.start_point, current);
          }
        }
      }
    }
  }

  public paper_pointerup_handler(evt: any, x: number, y: number) {
    if (this.isMounted && this.opts.enable_selection) {
      this.applyGestureUnselection('mouseup', evt);
      if (this.opts.rubberband.enable) {
        const selectionRect = this.rubberbandView.getRect();
        if (selectionRect) {
          const rectx = selectionRect.x;
          const recty = selectionRect.y;
          const rectw = selectionRect.width;
          const recth = selectionRect.height;
          const rect = new joint.g.Rect(rectx, recty, rectw, recth);
          const check_dx = selectionRect.width > this.opts.rubberband.tol_width;
          const check_dy =
            selectionRect.height > this.opts.rubberband.tol_height;
          if (check_dx && check_dy) {
            this.selectCellViewsInArea(rect);
            this.start_point = undefined;
          }
          // fire process completition
          this.onCellsSelectionCompletion();
        } else {
          // fire process completition
          this.onCellsSelectionCompletion();
        }
        this.rubberbandView.destroy();
      } else {
        // fire process completition
        this.onCellsSelectionCompletion();
      }
    }
  }

  /**
   * PROGRAMATIC
   *
   */

  public addToFilterList(item: string) {
    this.customFilterList.set(item, item);
  }

  public removeFromFilterList(item: string) {
    this.customFilterList.delete(item);
  }

  public cleanFilterList() {
    this.customFilterList.clear();
  }

  public selectAll() {
    if (this.isMounted && this.opts.rubberband.enable) {
      this.lSelectedElements.clear();
      this.lSelectedLinks.clear();
      this.graph.getCells().map((cell) => {
        if (cell.isElement()) {
          const cellView = cell.findView(this.paper);
          this.applySelectElement(cellView);
        } else if (cell.isLink()) {
          const cellView = cell.findView(this.paper);
          this.applySelectLink(cellView);
        }
      });
      this.onCellsSelectionCompletion();
    }
  }

  public unselectAll(inheritCall?: boolean) {
    if (this.isMounted && this.opts.rubberband.enable) {
      this.lSelectedElements.forEach((elementView) => {
        this.applyUnselectElement(elementView);
      });
      this.lSelectedLinks.forEach((linkView) => {
        this.applyUnselectLink(linkView);
      });
      this.lSelectedElements.clear();
      if (!inheritCall) {
        this.onCellsSelectionCompletion();
      }
    }
  }

  public selectCell(cellView: joint.dia.CellView, addTo?: boolean) {
    if (this.isMounted && this.opts.enable_selection) {
      var addTo = addTo ? addTo : false;
      if (!addTo) {
        this.unselectAll(true);
      }
      if (cellView) {
        if (cellView.model.isElement()) {
          this.applySelectElement(cellView);
        } else if (cellView.model.isLink()) {
          this.applySelectLink(cellView);
        }
      }
    }
  }

  public unselectCell(cellView: joint.dia.CellView) {
    if (this.isMounted && this.opts.rubberband.enable) {
      if (cellView) {
        if (cellView.model.isElement()) {
          this.applyUnselectElement(cellView);
        } else if (cellView.model.isLink()) {
          this.applyUnselectLink(cellView);
        }
      }
    }
  }

  public getSelectedElements(): Map<string, joint.dia.ElementView> {
    return this.lSelectedElements;
  }

  public getSelectedLinks() {
    return this.lSelectedLinks;
  }

  public isMultiSelection(): boolean {
    return this.lSelectedElements.size + this.lSelectedLinks.size > 1;
  }

  public getSelectedCellsBBox(inflate: number): joint.g.Rect {
    var ox = Number.POSITIVE_INFINITY;
    var oy = Number.POSITIVE_INFINITY;
    var cx = Number.NEGATIVE_INFINITY;
    var cy = Number.NEGATIVE_INFINITY;
    this.lSelectedElements.forEach((elementView) => {
      const childBbox = this.paper.pageToLocalRect(elementView.getBBox());
      if (childBbox.x < ox) {
        ox = childBbox.x;
      }
      if (childBbox.y < oy) {
        oy = childBbox.y;
      }
      if (childBbox.corner().x > cx) {
        cx = childBbox.corner().x;
      }
      if (childBbox.corner().y > cy) {
        cy = childBbox.corner().y;
      }
    });
    this.lSelectedLinks.forEach((linkView) => {
      const childBbox = this.paper.localToPageRect(linkView.getBBox());
      if (childBbox.x < ox) {
        ox = childBbox.x;
      }
      if (childBbox.y < oy) {
        oy = childBbox.y;
      }
      if (childBbox.corner().x > cx) {
        cx = childBbox.corner().x;
      }
      if (childBbox.corner().y > cy) {
        cy = childBbox.corner().y;
      }
    });
    if (
      ox === Number.POSITIVE_INFINITY ||
      oy === Number.POSITIVE_INFINITY ||
      cx === Number.NEGATIVE_INFINITY ||
      cy === Number.NEGATIVE_INFINITY
    ) {
      return null;
    } else {
      return new joint.g.Rect(ox, oy, cx - ox, cy - oy).inflate(inflate);
    }
  }

  /**
   * SELECTION SEARCH ALGORITHM
   *
   */
  private selectCellViewsInArea(rect: joint.g.Rect) {
    // get all cells available in the paper
    const cells = this.graph.getCells().map((cell) => {
      return cell.findView(this.paper);
    });
    // apply search using filter
    cells.filter((cellView) => {
      if (cellView.model.isElement()) {
        // Element
        const bbox = cellView.getBBox();
        if (this.findElementViewsInArea(rect, bbox)) {
          // finally select cell
          this.applySelectElement(cellView);
        }
      } else if (cellView.model.isLink()) {
        // Link
        const path = joint.g.Path.parse(cellView.$el.children().attr('d'));
        if (this.findLinkViewsInArea(rect, path)) {
          // finally select cell
          this.applySelectLink(cellView);
        }
      }
      return cellView;
    });
  }

  private findElementViewsInArea(
    rect: joint.g.Rect,
    bbox: joint.g.Rect
  ): boolean {
    if (this.opts.rubberband.element.bbox_strict) {
      var isIntersected = false;
      const localRect = this.paper.localToClientRect(rect);
      const intersectedRect = localRect.intersect(bbox);
      if (intersectedRect) {
        if (
          intersectedRect.width === bbox.width &&
          intersectedRect.height === bbox.height
        ) {
          isIntersected = true;
        }
      }
    } else {
      const localRect = this.paper.localToClientRect(rect);
      const intersectedRect = localRect.intersect(bbox);
      if (intersectedRect) {
        isIntersected = true;
      }
    }
    return isIntersected;
  }

  /**
   * TODO: To redefine with final wiring definition!!!
   */
  private findLinkViewsInArea(rect: joint.g.Rect, path: joint.g.Path): boolean {
    if (this.opts.rubberband.link.type === 'segment') {
      if (this.opts.rubberband.link.segment_strict) {
        const n_segments = path.getSegmentSubdivisions();
        var isIntersected = true;
        for (var i = 0; i < n_segments.length; i++) {
          const moveto = !path.getSegment(i).isSubpathStart;
          const segment_bbox = path.getSegment(i).bbox();
          if (moveto) {
            if (segment_bbox.intersect(rect)) {
              isIntersected = isIntersected && true;
            } else {
              isIntersected = isIntersected && false;
            }
          }
        }
      } else {
        const n_segments = path.getSegmentSubdivisions();
        var isIntersected = false;
        for (var i = 0; i < n_segments.length; i++) {
          const moveto = !path.getSegment(i).isSubpathStart;
          const segment_bbox = path.getSegment(i).bbox();
          if (moveto) {
            if (segment_bbox.intersect(rect)) {
              isIntersected = true;
              break;
            }
          }
        }
      }
    } else {
      if (this.opts.rubberband.link.bbox_strict) {
        var isIntersected = false;
        const bbox = this.paper.localToClientRect(path.bbox());
        const localRect = this.paper.localToClientRect(rect);
        const intersectedRect = localRect.intersect(bbox);
        if (intersectedRect) {
          if (
            intersectedRect.width === bbox.width &&
            intersectedRect.height === bbox.height
          ) {
            isIntersected = true;
          }
        }
      } else {
        const bbox = this.paper.localToClientRect(path.bbox());
        const localRect = this.paper.localToClientRect(rect);
        const intersectedRect = localRect.intersect(bbox);
        if (intersectedRect) {
          isIntersected = true;
        }
      }
    }
    return isIntersected;
  }

  // manage selection process
  private applySelectionProcess(
    cellView: joint.dia.CellView,
    ctrlKey: boolean
  ) {
    const id = cellView.model.id.toString();
    if (this.opts.ctrl_enable && ctrlKey) {
      if (cellView.model.isElement()) {
        if (!this.lSelectedElements.get(id)) {
          this.applySelectElement(cellView);
        } else {
          this.applyUnselectElement(cellView);
        }
      } else if (cellView.model.isLink()) {
        if (!this.lSelectedLinks.get(id)) {
          this.applySelectLink(cellView);
        } else {
          this.applyUnselectLink(cellView);
        }
      }
    } else {
      // allow consistency with multi-drag selection
      // enter only if it is not selected
      if (!this.lSelectedElements.get(id)) {
        this.unselectAll(true);
        if (cellView.model.isElement()) {
          this.applySelectElement(cellView);
        } else if (cellView.model.isLink()) {
          this.applySelectLink(cellView);
        }
      }
    }
  }

  // manage unselection based on user gesture and user options
  private applyGestureUnselection(eventType: string, evt: any) {
    if (this.opts.ctrl_enable) {
      if (!evt.originalEvent.ctrlKey) {
        this.unselectAll(true);
        if (this.mvc.opts.halo.enable) {
          if (this.mvc.opts.halo.isInherit) {
            this.mvc.inherit_halo.reset();
          } else {
            this.mvc.halo.reset();
          }
        }
      }
    } else {
      this.unselectAll(true);
      if (this.mvc.opts.halo.enable) {
        if (this.mvc.opts.halo.isInherit) {
          this.mvc.inherit_halo.reset();
        } else {
          this.mvc.halo.reset();
        }
      }
    }
  }

  private applySelectElement(cellView: joint.dia.CellView) {
    // Filter tool, selectable and cell filters
    if (!DiaHelper.isSystem(this.mvc, cellView) && !this.isIntoFilterList(cellView)) {
      // Composite element: Parent/Child management
      const config = DiaHelper.getConfigFromView(this.mvc, cellView);
      const composite = config.isComposite;
      const group = config.group.isIntoGroup;
      if (composite && group) {
        // composite element and group
      } else if (composite && !group) {
        // composite element no group
        const list = this.hierarchyManager.manageElementSelection(cellView);
        if (list) {
          list.forEach(elview => {
            const id = elview.model.id.toString();
            this.lSelectedElements.set(id, elview);
          });
          this.mvc.onSingleCellSelection('selection', 'element', list);
        }
      } else if (!composite && group) {
        // No composite element, only group
      } else if (!composite && !group) {
        // No composite element, No group
        const elementViewId = cellView.model.id.toString();
        const elementView = cellView as joint.dia.ElementView;
        this.lSelectedElements.set(elementViewId, elementView);
        this.mvc.onSingleCellSelection('selection', 'element', [cellView]);
      }
    }
  }

  private applyUnselectElement(cellView: joint.dia.CellView) {
    this.lSelectedElements.delete(cellView.model.id.toString());
    this.mvc.onSingleCellSelection('unselection', 'element', [cellView]);
  }

  private applySelectLink(cellView: joint.dia.CellView) {
    if (!this.isIntoSystemList(cellView) && !this.isIntoFilterList(cellView)) {
      // FILTERING!!!
      this.lSelectedLinks.set(
        cellView.model.id.toString(),
        cellView as joint.dia.LinkView
      );
      this.mvc.onSingleCellSelection('selection', 'link', [cellView]);
    }
  }

  private applyUnselectLink(cellView: joint.dia.CellView) {
    this.lSelectedLinks.delete(cellView.model.id.toString());
    this.mvc.onSingleCellSelection('unselection', 'link', [cellView]);
  }

  /**
   * called when the selection operation is completed
   * important method for stable behaviour of selection/multidrag/halo/etc
   */
  private onCellsSelectionCompletion() {
    this.mvc.onCellsSelectionCompletition();
  }

  /**
   *
   * FILTERING METHODS
   */
  private isIntoSystemList(cellView: joint.dia.CellView): boolean {
    const type = cellView.model.prop('custom/devInfo/type');
    if (type) {
      if (type === 'system') {
        // additional filtering per sub tool!
        /*if (this.innerFilterList.get(type)) {
          return xxx;
        }*/
        return true;
      }
    }
    return false;
  }

  private isIntoFilterList(cellView: joint.dia.CellView): boolean {
    /**
     * define on which basis the filtering must be done
     * i.e.: model type, other param?
     * single-attribute/multi-attribute
     */
    return false;
  }
}
