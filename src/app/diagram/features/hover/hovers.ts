import { MVController } from '../../core/mv-controller';
import { ElementProps } from '../../core/element-props';
import { DiaHelper } from '../../utils/diagram-helper';
import { HierarchyManager } from '../hierarchy/Hierarchy-manager';
import { ModelConfig } from '../../core/model-config';
import { ModelInterface } from '../../core/model-interface';

export class Hovers {
  public mvc: MVController;

  private paper: joint.dia.Paper;

  private graph: joint.dia.Graph;

  public isMounted: boolean = false;

  private hierarchyManager: HierarchyManager;

  constructor(mvc: MVController) {
    if (mvc) {
      this.mvc = mvc;
      this.paper = mvc.paper;
      this.graph = mvc.graph;
      this.hierarchyManager = new HierarchyManager(
        this.mvc,
        this.paper,
        this.graph
      );
    }
  }

  public mount() {
    this.isMounted = true;
  }

  /**
   * This method manage element over calling the remote function implemented
   * in the custom element class itself.
   * In addition, this manage hovering composite components.
   *
   * @param cellView
   * @param setting
   */
  public elementHover(cellView: joint.dia.CellView, value: string) {
    if (this.isMounted) {
      if (cellView && !DiaHelper.isSystem(this.mvc, cellView)) {
        // Composite element: Parent/Child management
        const config = DiaHelper.getConfigFromView(this.mvc, cellView);
        if (config.hover.isHoverable) {
          const composite = config.isComposite;
          const group = config.group.isIntoGroup;
          if (composite && group) {
            // composite element and group
          } else if (composite && !group) {
            // composite element no group
            const list = this.hierarchyManager.manageCellHover(cellView);
            if (list) {
              list.forEach((el) => {
                DiaHelper.setProp(cellView, 'hover', value);
              });
            }
          } else if (!composite && group) {
            // No composite element, only group
          } else if (!composite && !group) {
            // No composite element, No group
            DiaHelper.setProp(cellView, 'hover', value);
          }
        }
      }
    }
  }

  /**
   * This method manage hover of links.
   *
   * @param cellView
   * @param setting
   */
  public linkHover(cellView: joint.dia.CellView, value: string) {
    if (this.isMounted) {
      if (cellView && !DiaHelper.isSystem(this.mvc, cellView)) {
        DiaHelper.setProp(cellView, 'hover', value);
      }
    }
  }

}
