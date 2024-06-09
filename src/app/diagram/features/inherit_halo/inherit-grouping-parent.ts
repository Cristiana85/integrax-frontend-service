import * as joint from 'jointjs';
import * as _ from 'lodash';
import { Selections } from '../selection/selections';
import { MVController } from '../../core/mv-controller';

export class InheritGroupingParent {

  public helper_parent_rect: joint.shapes.standard.Rectangle;

  private selection: Selections;

  private mvc: MVController;

  private paper: joint.dia.Paper;

  private graph: joint.dia.Graph;

  private isMount: boolean = false;

  constructor(
    selection: Selections,
    mvc: MVController
  ) {
    this.selection = selection;
    this.paper = mvc.paper;
    this.mvc = mvc;
    this.graph = mvc.graph;
    this.helper_parent_rect = undefined;
  }

  public mount() {
    this.isMount = true;
  }

  public destroy() {
    if (this.isMount) {
      if (this.helper_parent_rect) {
        this.helper_parent_rect.remove();
        this.helper_parent_rect = undefined;
      }
    }
  }

  public update() {
    if (this.isMount) {
      if (this.selection.isMultiSelection()) {
        if (this.helper_parent_rect) {
          this.reset();
        } else {
          this.create();
        }
        this.selection.lSelectedElements.forEach((elementView) => {
          if (!elementView.model.getParentCell()) {
            this.helper_parent_rect.embed(elementView.model);
          }
        });
        // TBD WIRING
        this.selection.lSelectedLinks.forEach((linkView) => {
          if (!linkView.model.getParentCell()) {
            this.helper_parent_rect.embed(linkView.model);
          }
        });
        this.mvc.setPaperDelegation(false);
      } else {
        this.reset();
        this.destroy();
      }
    }
  }

  public create() {
    if (this.isMount) {
      this.helper_parent_rect = new joint.shapes.standard.Rectangle();
      this.helper_parent_rect.attr('body/display', 'none');
      this.helper_parent_rect.attr('body/fill', 'transparent');
      this.helper_parent_rect.prop('custom/devInfo/type', 'system');
      this.helper_parent_rect.prop('custom/devInfo/categoty', 'inherit-halo');
      this.helper_parent_rect.resize(1, 1);
      this.helper_parent_rect.addTo(this.graph);
    }
  }

  public reset() {
    if (this.isMount) {
      if (this.helper_parent_rect) {
        this.helper_parent_rect.getEmbeddedCells().forEach((child) => {
          this.helper_parent_rect.unembed(child);
        });
        //this.paper.setInteractivity({ stopDelegation: true });
        this.mvc.setPaperDelegation(true);
      }
    }
  }

  public translate(dx: number, dy: number) {
    if (this.isMount) {
      this.helper_parent_rect.translate(dx, dy);
    }
  }

  public getEmbeddedCells(): joint.dia.Cell[] {
    return this.helper_parent_rect.getEmbeddedCells();
  }

  public getEmbeddedElements(): joint.dia.Cell[] {
    let elementList: joint.dia.Cell[] = [];
    this.helper_parent_rect.getEmbeddedCells().forEach((child) => {
      if(child.isElement()) {
        elementList.push(child);
      }
    });
    return elementList;
  }

  public getEmbeddedLink() {
    let linkList: joint.dia.Cell[] = [];
    this.helper_parent_rect.getEmbeddedCells().forEach((child) => {
      if(child.isLink()) {
        linkList.push(child);
      }
    });
    return linkList;
  }

}
