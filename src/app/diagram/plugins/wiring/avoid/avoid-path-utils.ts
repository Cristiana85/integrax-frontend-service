import * as joint from 'jointjs';
import * as jQuery from 'jquery';
import * as _ from 'lodash';
import * as $ from 'backbone';
import { MVController } from '../../../core/mv-controller';

export enum ORIENTATION {
  H,
  V,
}

export class AvoidPathUtils {

  static pathRefactoring(
    userPath: joint.g.Point[],
    drawnlink: joint.dia.Link,
    drawinglink: joint.dia.Link,
    setTarget: boolean,
    setRouter: boolean,
    mvc: MVController
  ): joint.g.Point[] {
    let path: joint.g.Point[] = [];
    let d = undefined;
    if (userPath) {
      const orderedPath = AvoidPathUtils.removeOverlappedSegments(userPath);
      return orderedPath;
    } else {
      // add last drawn segment to the path under evaluation
      if (drawnlink) {
        d = joint.g.Path.parse(
          drawnlink.findView(mvc.paper).$el.children().attr('d')
        );
        d.segments.forEach((segment) => {
          path.push(segment.end);
        });
      }
      // add last drawn segment to the path under evaluation
      if (drawinglink) {
        d = joint.g.Path.parse(
          drawinglink.findView(mvc.paper).$el.children().attr('d')
        );
        d.segments.forEach((segmet) => {
          path.push(segmet.end);
        });
      }
      // reduce array removing duplicates points
      if (path.length > 0) {
        path = path.filter((item, index) => {
          const prevIndex = index - 1;
          if (prevIndex >= 0 && path.length > prevIndex) {
            return !item.equals(path[index - 1]);
          }
          return true;
        });
        const orderedPath = AvoidPathUtils.removeOverlappedSegments(path);
        drawnlink.vertices(orderedPath.slice(1, orderedPath.length - 1));
        if (setTarget) {
          drawnlink.target(orderedPath[orderedPath.length - 1]);
        }
        if (setRouter) {
          // drawn link are normal routed
          drawnlink.router('normal');
        }
        return orderedPath;
      }
      return undefined;
    }
  }

  static removeOverlappedSegments(path: joint.g.Point[]): joint.g.Point[] {
    let resegment: joint.g.Point[] = [];
    let lastsegmentOrientation: ORIENTATION = undefined;
    for (var index = 0; index < path.length - 1; index++) {
      const p0: joint.g.Point = new joint.g.Point({
        x: path[index].x,
        y: path[index].y,
      });
      const p1: joint.g.Point = new joint.g.Point({
        x: path[index + 1].x,
        y: path[index + 1].y,
      });
      if (index === 0) {
        lastsegmentOrientation = AvoidPathUtils.getPathOrientation(p0, p1);
        resegment.push(new joint.g.Point({ x: p0.x, y: p0.y }));
      } else if (index > 0) {
        const curentOrientation: ORIENTATION = AvoidPathUtils.getPathOrientation(p0, p1);
        if (lastsegmentOrientation !== curentOrientation) {
          resegment.push(new joint.g.Point({ x: p0.x, y: p0.y }));
          lastsegmentOrientation = curentOrientation;
        }
      }
      if (index === path.length - 2) {
        resegment.push(new joint.g.Point({ x: p1.x, y: p1.y }));
      }
    }
    return resegment;
  }

  static getPathOrientation(
    source: joint.g.Point,
    target: joint.g.Point
  ): ORIENTATION {
    if (source.x === target.x) {
      return ORIENTATION.H;
    } else if (source.y === target.y) {
      return ORIENTATION.V;
    }
    return undefined;
  }

}
