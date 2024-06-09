import { MVController } from 'src/app/diagram/core/mv-controller';
import * as joint from 'jointjs';
import * as jQuery from 'jquery';
import * as _ from 'lodash';
import * as $ from 'backbone';



export class HybridRouter {

  constructor(mvc: MVController) {
  }

  public computeWiringVertices(
    start: joint.g.Point,
    end: joint.g.Point
  ): joint.g.Point {
    var vertices: joint.g.Point = undefined;

    // calculate delta distances
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;

    // compute orientation
    if (deltaX != 0 && deltaY != 0) {
      vertices = new joint.g.Point();
      vertices.x = end.x;
      vertices.y = start.y;
    }
    return vertices;
  }

  public computeRewiringVertices(
    start: joint.g.Point,
    end: joint.g.Point,
    vertices: joint.g.PlainPoint[],
  ): joint.g.PlainPoint[] {

    var nVertices = -1;

    if (vertices) {
      nVertices = vertices.length;
    }

    if (nVertices != -1) {
      switch (nVertices) {
        case 0: {
          const deltaX = end.x - start.x;
          const deltaY = end.y - start.y;
          if (deltaX != 0 && deltaY != 0) {
            const newVertex = new joint.g.Point();
            newVertex.x = end.x;
            newVertex.y = start.y;
            vertices.push(newVertex);
          }
          break;
        }
        case 1: {
          const deltaX = end.x - start.x;
          const deltaY = end.y - start.y;
          if (deltaX != 0 && deltaY != 0) {
            this.calculateVertex(start, end, vertices, 0);
          } else {
            vertices = [];
          }
          break;
        }
        default: {
          // manage first node
          var deltaX = vertices[0].x - start.x;
          var deltaY = vertices[0].y - start.y;
          if (deltaX != 0 && deltaY != 0) {
            const endPoint = new joint.g.Point({
              x: vertices[1].x,
              y: vertices[1].y,
            });
            this.calculateVertex(start, endPoint, vertices, 0);
          }
          // manage second node
          deltaX = end.x - vertices[nVertices - 1].x;
          deltaY = end.y - vertices[nVertices - 1].y;
          if (deltaX != 0 && deltaY != 0) {
            const startPoint = new joint.g.Point({
              x: vertices[nVertices - 2].x,
              y: vertices[nVertices - 2].y,
            });
            this.calculateVertex(startPoint, end, vertices, nVertices - 1);
          }
          break;
        }
      }
    }

    return vertices;
  }

  private calculateVertex(start: joint.g.Point, end: joint.g.Point, vertices: joint.g.PlainPoint[], index: number) {

    const state = {
      deltaStart: new joint.g.Point({
        x: vertices[index].x - start.x,
        y: vertices[index].y - start.y
      }),
      deltaEnd: new joint.g.Point({
        x: vertices[index].x - end.x,
        y: vertices[index].y - end.y
      }),
    }

    if (state.deltaStart.x === 0) {
      vertices[index].x = start.x;
      vertices[index].y = end.y;
    } else if (state.deltaEnd.x === 0) {
      vertices[index].x = end.x;
      vertices[index].y = start.y;
    }

    if (state.deltaStart.y === 0) {
      vertices[index].x = end.x;
      vertices[index].y = start.y;
    } else if (state.deltaEnd.y === 0) {
      vertices[index].x = start.x;
      vertices[index].y = end.y;
    }
  }
}
