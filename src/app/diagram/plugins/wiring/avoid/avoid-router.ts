import * as joint from 'jointjs';
import * as jQuery from 'jquery';
import * as _ from 'lodash';
import * as $ from 'backbone';
// AvoidLib WASM Loading
//import '!!file-loader?name=wasm/libavoid.wasm!../../../../../../wasm/libavoid.wasm';
//import * as Module from '../../../../../../wasm/libavoid.js';
//import { Avoid, AvoidLib, Router } from 'libavoid-js';

import { unescape } from 'lodash';
import { MVController } from 'src/app/diagram/core/mv-controller';
import { LibAvoidWasmService } from 'src/app/services/wasm/libavoid/libavoid.wasm.service.js';
import {
  ConnRef,
  PolyLine,
  Rectangle,
  Router,
  ShapeRef,
} from 'src/app/services/wasm/libavoid/libavoid-interface';
import { COMPILER_OPTIONS } from '@angular/core';
import { DiaHelper } from 'src/app/diagram/utils/diagram-helper';

enum RoutingParameter {
  //! @brief  This penalty is applied for each segment in the connector
  //!         path beyond the first.  This should always normally be set
  //!         when doing orthogonal routing to prevent step-like connector
  //!         paths.
  //! @note   This penalty must be set (i.e., be greater than zero) in
  //!         order for orthogonal connector nudging to be performed, since
  //!         this requires reasonable initial routes.
  segmentPenalty = 0,

  //! @brief  This penalty is applied in its full amount to tight acute
  //!         bends in the connector path.  A smaller portion of the penalty
  //!         is applied for slight bends, i.e., where the bend is close to
  //!         180 degrees.  This is useful for polyline routing where there
  //!         is some evidence that tighter corners are worse for
  //!         readability, but that slight bends might not be so bad,
  //!         especially when smoothed by curves.
  anglePenalty,

  //! @brief  This penalty is applied whenever a connector path crosses
  //!         another connector path.  It takes shared paths into
  //!         consideration and the penalty is only applied if there
  //!         is an actual crossing.
  //! @note   This penalty is still experimental!  It is not recommended
  //!         for normal use.
  crossingPenalty,

  //! @brief  This penalty is applied whenever a connector path crosses
  //!         a cluster boundary.
  //! @note   This penalty is still experimental!  It is not recommended
  //!         for normal use.
  //! @note   This penalty is very slow.  You can override the method
  //!         Router::shouldContinueTransactionWithProgress() to check
  //!         progress and possibly cancel overly slow transactions.
  clusterCrossingPenalty,

  //! @brief  This penalty is applied whenever a connector path shares
  //!         some segments with an immovable portion of an existing
  //!         connector route (such as the first or last segment of a
  //!         connector).
  //! @note   This penalty is still experimental!  It is not recommended
  //!         for normal use.
  fixedSharedPathPenalty,

  //! @brief  This penalty is applied to port selection choice when the
  //!         other end of the connector being routed does not appear in
  //!         any of the 90 degree visibility cones centered on the
  //!         visibility directions for the port.
  //! @note   This penalty is still experimental!  It is not recommended
  //!         for normal use.
  //! @note   This penalty is very slow.  You can override the method
  //!         Router::shouldContinueTransactionWithProgress() to check
  //!         progress and possibly cancel overly slow transactions.
  portDirectionPenalty,

  //! @brief This parameter defines the spacing distance that will be added
  //!        to the sides of each shape when determining obstacle sizes for
  //!        routing.  This controls how closely connectors pass shapes, and
  //!        can be used to prevent connectors overlapping with shape
  //!        boundaries. By default, this distance is set to a value of 0.
  shapeBufferDistance,

  //! @brief This parameter defines the spacing distance that will be used
  //!        for nudging apart overlapping corners and line segments of
  //!        connectors.  By default, this distance is set to a value of 4.
  idealNudgingDistance,

  //! @brief  This penalty is applied whenever a connector path travels
  //!         in the direction opposite of the destination from the source
  //!         endpoint.  By default this penalty is set to zero.  This
  //!         shouldn't be needed in most cases but can be useful if you
  //!         use penalties such as ::crossingPenalty which cause connectors
  //!         to loop around obstacles.
  reverseDirectionPenalty,

  // Used for determining the size of the routing parameter array.
  // This should always we the last value in the enum.
  lastRoutingParameterMarker,
}

enum RoutingOption {
  //! This option causes the final segments of connectors, which are
  //! attached to shapes, to be nudged apart.  Usually these segments
  //! are fixed, since they are considered to be attached to ports.
  //!
  //! Defaults to false.
  //!
  //! This option also causes routes running through the same checkpoint
  //! to be nudged apart.
  //!
  //! This option has no effect if ::nudgeSharedPathsWithCommonEndPoint is
  //! set to false,
  //!
  //! @note   This will allow routes to be nudged up to the bounds of shapes.
  //!
  nudgeOrthogonalSegmentsConnectedToShapes = 0,

  //! This option causes hyperedge routes to be locally improved fixing
  //! obviously bad paths.  As part of this process libavoid will
  //! effectively move junctions, setting new ideal positions which can be
  //! accessed via JunctionRef::recommendedPosition() for each junction.
  //!
  //! Defaults to true.
  //!
  //! This will not add or remove junctions, so will keep the hyperedge
  //! topology the same.  Better routes can be achieved by enabling the
  //! ::improveHyperedgeRoutesMovingAddingAndDeletingJunctions option.
  //!
  //! If initial sensible positions for junctions in hyperedges are not
  //! known you can register those hyperedges with the HyperedgeRerouter
  //! class for complete rerouting.
  //!
  //! @sa   improveHyperedgeRoutesMovingAddingAndDeletingJunctions
  //! @sa   Router::hyperedgeRerouter()
  //!
  improveHyperedgeRoutesMovingJunctions,

  //! This option penalises and attempts to reroute orthogonal shared
  //! connector paths terminating at a common junction or shape
  //! connection pin.  When multiple connector paths enter or leave
  //! the same side of a junction (or shape pin), the router will
  //! attempt to reroute these to different sides of the junction or
  //! different shape pins.
  //!
  //! Defaults to false.
  //!
  //! This option depends on the ::fixedSharedPathPenalty penalty having
  //! been set.
  //!
  //! @sa     fixedSharedPathPenalty
  //! @note   This option is still experimental!  It is not recommended
  //!         for normal use.
  //!
  penaliseOrthogonalSharedPathsAtConnEnds,

  //! This option can be used to control whether collinear line
  //! segments that touch just at their ends will be nudged apart.
  //! The overlap will usually be resolved in the other dimension,
  //! so this is not usually required.
  //!
  //! Defaults to false.
  //!
  nudgeOrthogonalTouchingColinearSegments,

  //! This option can be used to control whether the router performs
  //! a preprocessing step before orthogonal nudging where is tries
  //! to unify segments and centre them in free space.  This
  //! generally results in better quality ordering and nudging.
  //!
  //! Defaults to true.
  //!
  //! You may wish to turn this off for large examples where it
  //! can be very slow and will make little difference.
  //!
  performUnifyingNudgingPreprocessingStep,

  //! This option causes hyperedge routes to be locally improved fixing
  //! obviously bad paths.
  //!
  //! It can cause junctions and connectors to be added or removed from
  //! hyperedges.  To get details of these changes for each connector you can
  //! call Router::newAndDeletedObjectListsFromHyperedgeImprovement().
  //!
  //! As part of this process libavoid will effectively move junctions by
  //! setting new ideal positions for each remaining or added junction,
  //! which can be read from JunctionRef::recommendedPosition() for each
  //! junction.
  //!
  //! Defaults to false.
  //!
  //! If set, this option overrides the ::improveHyperedgeRoutesMovingJunctions
  //! option.
  //!
  //! If initial sensible positions for junctions in hyperedges are not
  //! known you can register those hyperedges with the HyperedgeRerouter
  //! class for complete rerouting.
  //!
  //! @sa   improveHyperedgeRoutesMovingJunctions
  //! @sa   Router::hyperedgeRerouter()
  //!
  improveHyperedgeRoutesMovingAddingAndDeletingJunctions,

  //! This option determines whether intermediate segments of connectors that
  //! are attached to common endpoints will be nudged apart.  Usually these
  //! segments get nudged apart, but you may want to turn this off if you would
  //! prefer that entire shared paths terminating at a common end point should
  //! overlap.
  //!
  //! Defaults to true.
  //!
  nudgeSharedPathsWithCommonEndPoint,

  // Used for determining the size of the routing options array.
  // This should always we the last value in the enum.
  lastRoutingOptionMarker,
}

export class AvoidRouter {
  private mvc: MVController;

  private graph: joint.dia.Graph;

  private paper: joint.dia.Paper;

  private graphListener: any;

  public Avoid: any;

  public avoidRouter: Router;

  public shapeRefByID: Map<string, ShapeRef>;

  public edgeRefByID: Map<number, number>;

  public pinIDByID: Map<number, number>;

  public linksByPointer: Map<number, ConnRef>;

  public pointerByID: Map<string, number>;

  private avoidConnectorCallback: any;

  public opts: {
    router: {
      parameters: {
        shapeBufferDistance: number;
        portOverflow: number;
        idealNudgingDistance: number;
      };
      options: {};
    };
  } = {
    router: {
      parameters: {
        shapeBufferDistance: 0,
        portOverflow: 0,
        idealNudgingDistance: 10,
      },
      options: {},
    },
  };

  constructor(mvc: MVController) {
    if (mvc) {
      this.mvc = mvc;
      this.paper = mvc.paper;
      this.graph = mvc.graph;
      this.Avoid = mvc.Avoid;
    }
  }

  /**
   *
   */
  public createAvoidRouter() {
    this.shapeRefByID = new Map<string, ShapeRef>();
    this.edgeRefByID = new Map<number, number>();
    this.pinIDByID = new Map<number, number>();
    this.linksByPointer = new Map<number, ConnRef>();
    this.pointerByID = new Map<string, number>();
    this.avoidConnectorCallback = this.onAvoidConnectorChange.bind(this);
    this.initAvoidRouter();
  }

  /**
   * TODO: update with zoom to be efficient
   */
  private updateAvoidRouter() {
    // TODO
  }

  /**
   * TODO: update with zoom to be efficient
   */
  private removeAvoidRouter() {
    // TODO
  }

  /**
   *
   */
  private initAvoidRouter() {
    // create router reference from Avoid interface
    this.avoidRouter = new this.Avoid.Router(this.Avoid.OrthogonalRouting);

    // set routing options
    this.avoidRouter.setRoutingOption(
      RoutingOption.nudgeOrthogonalSegmentsConnectedToShapes as number,
      false
    );

    // set routing parameters
    this.avoidRouter.setRoutingParameter(
      RoutingParameter.shapeBufferDistance as number,
      this.opts.router.parameters.shapeBufferDistance
    );

    // set routing penalities
    this.avoidRouter.setRoutingPenalty(
      RoutingParameter.segmentPenalty as number,
      50
    );

    // create callback method to update links
    this.avoidConnectorCallback = this.onAvoidConnectorChange.bind(this);

    // start listener
    this.addGraphListenersToAvoidRouter();
  }

  /**
   *
   */
  private addGraphListenersToAvoidRouter() {
    this.removeGraphListenersFromAvoidRouter();
    const listener = new joint.mvc.Listener();
    listener.listenTo(this.graph, {
      add: (cell) => this.onCellAdded(cell),
      change: (cell, opt) => this.onCellChanged(cell, opt),
      remove: (cell) => this.onCellRemoved(cell),
    });
    this.graphListener = listener;
  }

  /**
   *
   */
  private removeGraphListenersFromAvoidRouter() {
    this.graphListener?.stopListening();
    delete this.graphListener;
  }

  /**
   *
   * @param cell
   */
  private onCellAdded(cell: joint.dia.Cell) {
    const cellView = cell.findView(this.mvc.paper);
    if (DiaHelper.isDiagram(this.mvc, cellView)) {
      if (DiaHelper.isModel(this.mvc, cellView)) {
        if (cell.isElement()) {
          if (!this.shapeRefByID.has(cell.id.toString())) {
            this.addShape(cell as joint.dia.Element);
            this.avoidRouter.processTransaction();
          }
        } else {
          // TBD: define if this is really needed
          //this.updateConnector(cell as joint.dia.Link);
        }
      }
    }
  }

  /**
   *
   * @param cell
   * @param opt
   */
  private onCellChanged(cell: joint.dia.Cell, opt: any) {
    const cellView = cell.findView(this.mvc.paper);
    if (cellView && DiaHelper.isDiagram(this.mvc, cellView)) {
      if (DiaHelper.isModel(this.mvc, cellView)) {
        if (cell && cell.isElement()) {
          // TODO: Manage embedding effect
          if (
            'position' in cell.changed ||
            'angle' in cell.changed ||
            'size' in cell.changed
          ) {
            // param changed is -> cell.changed.position/angle/size;
            if (this.shapeRefByID.has(cell.id.toString())) {
              this.updateShape(cell);
              this.avoidRouter.processTransaction();
            }
          }
        } else if (cell && cell.isLink()) {
          // TODO
          if ('source' in cell.changed || 'target' in cell.changed) {
          }
        }
      }
    }
  }

  /**
   *
   * @param cell
   */
  private onCellRemoved(cell: joint.dia.Cell) {
    const cellView = cell.findView(this.mvc.paper);
    if (DiaHelper.isDiagram(this.mvc, cellView)) {
      if (DiaHelper.isModel(this.mvc, cellView)) {
        if (cell.isElement()) {
          console.log('REMOVE ELEMENT');
        } else if (cell.isLink()) {
          console.log('REMOVE LINK');
        }
      }
    }
  }

  /**
   *
   * @param link
   */
  private routeLink(link: joint.dia.Link) {
    /*const connRef = this.edgeRefs[link.id];
    if (!connRef) return;

    const route = connRef.displayRoute();*/
    const route: any = [];
    const sourcePoint = new joint.g.Point(route.get_ps(0));
    const targetPoint = new joint.g.Point(route.get_ps(route.size() - 1));

    const { id: sourceId, port: sourcePortId = null } = link.source();
    const { id: targetId, port: targetPortId = null } = link.target();

    const sourceElement = link.getSourceElement();
    const targetElement = link.getTargetElement();
    const sourceAnchorDelta = this.getLinkAnchorDelta(
      sourceElement,
      sourcePortId,
      sourcePoint
    );
    const targetAnchorDelta = this.getLinkAnchorDelta(
      targetElement,
      targetPortId,
      targetPoint
    );

    const linkAttributes = {
      source: {
        id: sourceId,
        port: sourcePortId || null,
        anchor: {
          name: 'modelCenter',
          args: {
            dx: 0,
            dy: 0,
          },
        },
      },
      target: {
        id: targetId,
        port: targetPortId || null,
        anchor: {
          name: 'modelCenter',
          args: {
            dx: 0,
            dy: 0,
          },
        },
      },
    };

    /*if (
      this.isRouteValid(
        route,
        sourceElement,
        targetElement,
        sourcePortId,
        targetPortId
      )
    ) {
      // We have a valid route.
      // We update the link with the route.
      linkAttributes.source.anchor.args = {
        dx: sourceAnchorDelta.x,
        dy: sourceAnchorDelta.y,
      };
      linkAttributes.target.anchor.args = {
        dx: targetAnchorDelta.x,
        dy: targetAnchorDelta.y,
      };
      linkAttributes.vertices = this.getVerticesFromAvoidRoute(route);
      linkAttributes.router = null;
    } else {
      // Fallback route (we use the `rightAngle` router for the fallback route)
      // The right angle automatic directions works the same way as in this example.
      linkAttributes.vertices = [];
      linkAttributes.router = {
        name: 'rightAngle',
        args: {
          // The margin is computed from the border of the port in case
          // of the `rightAngle` router.
          // In the case of libavoid, it is computed from the center
          // of the port.
          // Note: it depends on what portion of the port is overlapping
          // the element. In this example, it is exactly the half of the port.
          margin: this.margin - this.portOverflow,
        },
      };
    }

    link.set(linkAttributes, { avoidRouter: true });*/
  }

  /**
   * This method is used to reset the link to a straight line
   * @param link
   */
  resetLink(link: joint.dia.Link) {
    const newAttributes = joint.util.cloneDeep(link.attributes);
    newAttributes['vertices'] = [];
    newAttributes['router'] = null;
    delete newAttributes['source'].anchor;
    delete newAttributes['target'].anchor;
    link.set(newAttributes, { avoidRouter: true });
  }

  /**
   *
   */
  private routeAll() {
    const { graph, avoidRouter } = this;
    graph.getElements().forEach((element) => this.updateShape(element));
    graph.getLinks().forEach((link) => this.updateConnector(link));
    avoidRouter.processTransaction();
  }

  /**
   *
   * @param element
   */
  private addShape(element: joint.dia.Element) {
    const rect = this.getAvoidRectFromElement(element);
    const shape = new this.Avoid.ShapeRef(this.avoidRouter, rect);

    // TODO TOFIX
    //console.log(shape.router())


    // add to ref list
    this.shapeRefByID.set(element.id.toString(), shape);
    // Add pins to each port of the element.
    const portGroups = Object.keys(element.prop('ports/groups'));
    if (portGroups) {
      portGroups.forEach((group) => {
        const portsPositions = element.getPortsPositions(group);
        const { width, height } = element.size();
        const rect = new joint.g.Rect(0, 0, width, height);
        Object.keys(portsPositions).forEach((portId) => {
          const { x, y } = portsPositions[portId];
          const side = rect.sideNearestToPoint({ x, y });
          const pin = new this.Avoid.ShapeConnectionPin(
            shape,
            shape.id(), // TODO TOFIX
            x / width,
            y / height,
            true,
            // x, y, false, (support offset on ports)
            0,
            this.Avoid.ConnDirLeft // TODO TOFIX
          );
          pin.setExclusive(false);
        });
      });
    }
  }

  /**
   *
   * @param link
   */
  private addLink(link: joint.dia.Link) {}

  /**
   *
   * @param element
   */
  private updateShape(element: joint.dia.Element) {
    const rect = this.getAvoidRectFromElement(element);
    const shape: ShapeRef = this.shapeRefByID.get(element.id.toString());
    this.avoidRouter.moveShape(shape, rect);
  }

  /**
   *
   * @param element
   */
  private updateConnector(link: joint.dia.Link) {}

  private deleteConnector(link: joint.dia.Link) {
    /*const connRef = this.edgeRefs[link.id];
    if (!connRef) return;
    this.avoidRouter.deleteConnector(connRef);
    delete this.linksByPointer[connRef.g];
    delete this.edgeRefs[link.id];*/
  }

  private deleteShape(element: joint.dia.Element) {
    /*const shapeRef = this.shapeRefs[element.id];
    if (!shapeRef) return;
    this.avoidRouter.deleteShape(shapeRef);
    delete this.shapeRefs[element.id];*/
  }

  /**
   *
   * @param connRefPtr
   */
  private onAvoidConnectorChange(connRefPtr: ConnRef) {
    console.log('callback');
    console.log(connRefPtr);
  }

  /**
   *
   * @param element
   * @param portId
   * @param point
   */
  private getLinkAnchorDelta(
    element: joint.dia.Element,
    portId: string,
    point: joint.g.Point
  ) {
    /*let anchorPosition;
    const bbox = element.getBBox();
    if (portId) {
        const port = element.getPort(portId);
        const portPosition = element.getPortsPositions(port.group)[portId];
        anchorPosition = element.position().offset(portPosition);
    } else {
        anchorPosition = bbox.center();
    }
    return point.difference(anchorPosition);*/
  }

  /**
   *
   * @param element
   * @returns
   */
  private getAvoidRectFromElement(element: joint.dia.Element): Rectangle {
    const { x, y, width, height } = element.getBBox();
    return new this.Avoid.Rectangle(
      new this.Avoid.Point(x, y),
      new this.Avoid.Point(x + width, y + height)
    );
  }

  /**
   * This method is used to map the JointJS port id to the libavoid pin id.
   * @param elementId
   * @param portId
   * @returns
   */
  getConnectionPinId(elementId: string, portId: string): number {
    // `libavoid-js` requires the pin id to be a number.
    // Note: It does not have to be unique across the whole diagram, just
    // unique for the shape (but we use unique id across the whole diagram).
    /*const pinKey = `${elementId}:${portId}`;
    if (pinKey in this.pinIds) return this.pinIds[pinKey];
    const pinId = this.id++;
    this.pinIds[pinKey] = pinId;
    return pinId;*/
    return 0;
  }

  /**
   *
   * @param route
   * @param sourceElement
   * @param targetElement
   * @param sourcePortId
   * @param targetPortId
   */
  private isRouteValid(
    route: any,
    sourceElement: any,
    targetElement: any,
    sourcePortId: any,
    targetPortId: any
  ): boolean {
    return false;
  }

  /**
   *
   * @param route
   * @returns
   */
  private getSourceFromAvoidRoute(route: PolyLine): joint.g.Point {
    const { x, y } = route.get_ps(0);
    return new joint.g.Point(x, y);
  }

  /**
   *
   * @param route
   * @returns
   */
  private getTargetFromAvoidRoute(route: PolyLine): joint.g.Point {
    const { x, y } = route.get_ps(route.size());
    return new joint.g.Point(x, y);
  }

  /**
   *
   * @param route
   * @returns
   */
  private getVerticesFromAvoidRoute(route: PolyLine): joint.g.Point[] {
    const vertices: joint.g.Point[] = [];
    for (let i = 1; i < route.size() - 1; i++) {
      const { x, y } = route.get_ps(i);
      vertices.push(new joint.g.Point(x, y));
    }
    return vertices;
  }
}
