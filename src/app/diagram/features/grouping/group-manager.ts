import { MVController } from "../../core/mv-controller";

export class GroupManager {
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
    /*if (this.isMounted) {
      const devInfo = cellView.model.prop('custom/devInfo') as ModelInfo;
      if (devInfo.isParent) {
        return this.manageCellParentHover(cellView, devInfo);
      } else if (devInfo.isChild) {
        return this.manageCellChildHover(cellView, devInfo);
      }
    }*/
    return undefined;
  }
}
