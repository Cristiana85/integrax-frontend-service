import * as joint from 'jointjs';
import * as jQuery from 'jquery';
import * as _ from 'lodash';
import * as $ from 'backbone';
import RBush from 'rbush';
import { MVController } from '../../core/mv-controller';
import { TreeNode } from './treenode';

export class QuadTree {

  private mvc: MVController;

  private tree: RBush<TreeNode> = new RBush();

  private lReference: Map<string, TreeNode> = new Map<string, TreeNode>();

  constructor(mvc: MVController) {
    this.mvc = mvc;
  }

  public mount() {
    this.lReference.clear();
  }

  public insertLink(link: joint.dia.Link) {
    const linkView = link.findView(this.mvc.paper)
    const path = joint.g.Path.parse(linkView.$el.children().attr('d'));
    const n_segments = path.getSegmentSubdivisions();
    for (var i = 0; i < n_segments.length; i++) {
      const moveto = !path.getSegment(i).isSubpathStart;
      if (moveto) {
        const node = new TreeNode();
        node.type = 'link';
        node.bbox = path.getSegment(i).bbox();
        this.tree.insert(node);
        this.lReference.set(node.id, node);
      }
    }
  }

  public insertElement(elem: joint.dia.Element) {
    const node = new TreeNode();
    node.id = elem.id.toString();
    node.type = 'element';
    node.bbox = elem.findView(this.mvc.paper).getBBox();
    this.tree.insert(node);
    this.lReference.set(node.id, node);
  }

  public updateElement(elem: joint.dia.Element) {
    this.remove(elem.id.toString());
    this.insertElement(elem);
  }

  public updateLink(link: joint.dia.Link) {
    this.remove(link.id.toString());
    this.insertLink(link);
  }

  public remove(id: string) {
    this.tree.remove(this.lReference.get(id));
    this.lReference.delete(id);
  }

  public search(x: number, y: number, w: number, h: number): joint.dia.Cell[] {
    const bbox = {
      minX: x,
      minY: y,
      maxX: x + w,
      maxY: y + h,
    };
    const nodes = this.tree.search(bbox);
    const cells: joint.dia.Cell[] = [];
    nodes.forEach(node => {
      const cell = this.mvc.graph.getCell(node.id);
      if (!cells.find(el => el.id != cell.id)) {
        cells.push(cell);
      }
    });
    return cells;
  }

}


