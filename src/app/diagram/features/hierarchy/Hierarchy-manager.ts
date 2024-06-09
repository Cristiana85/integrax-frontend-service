import { MVController } from '../../core/mv-controller';
import { ElementProps } from '../../core/element-props';
import { DiaHelper } from '../../utils/diagram-helper';
import { ModelConfig } from '../../core/model-config';

export class HierarchyManager {
  public mvc: MVController;

  private paper: joint.dia.Paper;

  private graph: joint.dia.Graph;

  private isMounted: boolean = false;

  constructor(
    mvc: MVController,
    paper: joint.dia.Paper,
    graph: joint.dia.Graph
  ) {
    if (mvc && paper && graph) {
      this.mvc = mvc;
      this.paper = paper;
      this.graph = graph;
      this.isMounted = true;
    }
  }

  public manageCellHover(
    cellView: joint.dia.CellView
  ): Array<joint.dia.CellView> {
    if (this.isMounted) {
      const prop = DiaHelper.getElemPropertyFromView(cellView);
      const config = DiaHelper.getConfigFromView(this.mvc, cellView);
      if (config) {
        if (config.isParent) {
          return this.manageCellParentHover(cellView, config, prop);
        } else if (config.isChild) {
          return this.manageCellChildHover(cellView, config, prop);
        }
      }
    }
    return undefined;
  }

  private manageCellParentHover(
    cellView: joint.dia.CellView,
    config: ModelConfig,
    prop: ElementProps
  ): Array<joint.dia.CellView> {
    var hoverList = new Array<joint.dia.CellView>();
    hoverList.push(cellView);
    const propagate = config.hover.propagateHoverToChild;
    if (propagate) {
      const childModelList = cellView.model.getEmbeddedCells();
      childModelList.forEach((child) => {
        hoverList.push(child.findView(this.paper));
      });
    }
    return hoverList;
  }

  private manageCellChildHover(
    cellView: joint.dia.CellView,
    config: ModelConfig,
    prop: ElementProps
  ): Array<joint.dia.CellView> {
    var hoverList = new Array<joint.dia.CellView>();
    hoverList.push(cellView);
    const parentModel = cellView.model.getParentCell();
    const propagateParent = config.hover.propagateHoverToParent;
    const propagateAllChilds = config.hover.propagateHoverToAllChilds;
    // propagate to parent only
    if (propagateParent && !propagateAllChilds) {
      hoverList.push(parentModel.findView(this.paper));
    } else if (!propagateParent && propagateAllChilds) {
      const childModelList = parentModel.getEmbeddedCells();
      childModelList.forEach((child) => {
        hoverList.push(child.findView(this.paper));
      });
    } else if (propagateParent && propagateAllChilds) {
      hoverList.push(parentModel.findView(this.paper));
      const childModelList = parentModel.getEmbeddedCells();
      childModelList.forEach((child) => {
        hoverList.push(child.findView(this.paper));
      });
    }
    return hoverList;
  }

  /**
   * Manage the parent child selection
   * Based on parent/child settings and propagations settings
   * NOTE: any selected element must be in the selection listfor adorner management
   *  -> THEN: as a conseguence the module that will use selected element must be
   *           consider that childs are selceted as well and so filtering is needed
   *  -> The ineherent grouping iomplemented for multi-drag already filters for child
   *     since there is not way for joinjs to embed already embedded childs!
   */
  public manageElementSelection(
    cellView: joint.dia.CellView
  ): Array<joint.dia.ElementView> {
    if (this.isMounted) {
      const prop = DiaHelper.getElemPropertyFromView(cellView);
      const config = DiaHelper.getConfigFromView(this.mvc, cellView);
      if (config) {
        if (config.isParent) {
          return this.manageElementParentSelection(cellView, config, prop);
        } else if (config.isChild) {
          return this.manageElementChildSelection(cellView, config, prop);
        }
      }
    }
    return undefined;
  }

  private manageElementParentSelection(
    cellView: joint.dia.CellView,
    config: ModelConfig,
    prop: ElementProps
  ): Array<joint.dia.ElementView> {
    var selectionList = new Array<joint.dia.ElementView>();
    selectionList.push(cellView as joint.dia.ElementView);
    const propagate = config.selection.propagateSelectionToChild;
    if (propagate) {
      const childModelList = cellView.model.getEmbeddedCells();
      childModelList.forEach((child) => {
        const childView = child.findView(this.paper) as joint.dia.ElementView;
        selectionList.push(childView);
      });
    }
    return selectionList;
  }

  private manageElementChildSelection(
    cellView: joint.dia.CellView,
    config: ModelConfig,
    prop: ElementProps
  ): Array<joint.dia.ElementView> {
    // CHILD
    var selectionList = new Array<joint.dia.ElementView>();
    selectionList.push(cellView as joint.dia.ElementView);
    const parentModel = cellView.model.getParentCell();
    const propagateParent = config.selection.propagateSelectionToParent;
    const propagateAllChilds = config.selection.propagateSelectionToAllChilds;
    // propagate to parent only
    if (propagateParent && !propagateAllChilds) {
      selectionList.push(parentModel.findView(this.paper) as joint.dia.ElementView);
    } else if (!propagateParent && propagateAllChilds) {
      const childModelList = parentModel.getEmbeddedCells();
      childModelList.forEach((child) => {
        selectionList.push(child.findView(this.paper) as joint.dia.ElementView);
      });
    } else if (propagateParent && propagateAllChilds) {
      selectionList.push(parentModel.findView(this.paper) as joint.dia.ElementView);
      const childModelList = parentModel.getEmbeddedCells();
      childModelList.forEach((child) => {
        selectionList.push(child.findView(this.paper) as joint.dia.ElementView);
      });
    }
    return selectionList;
  }
}
