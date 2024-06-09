import * as joint from 'jointjs';
import * as jQuery from 'jquery';
import * as _ from 'lodash';
import * as $ from 'backbone';
import { Injectable } from "@angular/core";
import { filter, map } from "rxjs/operators";
import * as initAvoidModule from '../../../../../wasm/libavoid/libavoid.js';
import '!!file-loader?name=wasm/libavoid.wasm!../../../../../wasm/libavoid/libavoid.wasm';
import { BehaviorSubject, Observable } from "rxjs";
import { ConnEnd, ConnRef, HyperedgeRerouter, JunctionRef, Point, PolyLine, Router, ShapeConnectionPin, ShapeRef } from "./libavoid-interface.js";

@Injectable()
export class LibAvoidWasmService {

  public module: any;

  public wasmReady = new BehaviorSubject<boolean>(false);

  private avoidConnectorCallback: any;

  private Avoid: any = undefined;

  constructor() {
    // start libavoid wasm loading
    this.instantiateWasm('wasm/libavoid.wasm');
  }

    public isWasmReady(): boolean {
    return this.wasmReady.value;
  }

  public getAvoidRef(): any {
    return this.Avoid;
  }

  private async instantiateWasm(url: string) {
    // fetch the wasm file
    const wasmFile = await fetch(url);

    // convert it into a binary array
    const buffer = await wasmFile.arrayBuffer();
    const binary = new Uint8Array(buffer);

    // create module arguments
    // including the wasm-file
    const moduleArgs = {
      wasmBinary: binary,
      onRuntimeInitialized: () => {
        this.wasmReady.next(true);
      },
    };

    // instantiate the module
    this.module = initAvoidModule(moduleArgs);

    //Check if WebAssembly is supported
    const supported = (() => {
      try {
        if (
          typeof WebAssembly === 'object' &&
          typeof WebAssembly.instantiate === 'function'
        ) {
          const module = new WebAssembly.Module(
            Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
          );
          if (module instanceof WebAssembly.Module)
            return (
              new WebAssembly.Instance(module) instanceof WebAssembly.Instance
            );
        }
      } catch (e) {}
      return false;
    })();

    console.log(
      supported ? 'WebAssembly is supported' : 'WebAssembly is not supported'
    );

  }

  /*public test(): Observable<any> {
    this.wasmReady.pipe(filter((value) => value === true)).subscribe((ret) => {
      //this.Avoid = this.module.__zone_symbol__value;
      console.log('------------kodmskf')
      const router: Router = new this.Avoid.Router(this.Avoid.OrthogonalRouting);
      router.setRoutingOption(
        RoutingOption.nudgeOrthogonalSegmentsConnectedToShapes as number,
        false
      );
      router.setRoutingParameter(
        RoutingParameter.shapeBufferDistance as number,
        0
      );
      router.setRoutingPenalty(RoutingParameter.segmentPenalty as number, 50);

      this.avoidConnectorCallback = this.onAvoidConnectorChange.bind(this);

      const upper1 = new this.Avoid.Point(1, 1);
      const lower1 = new this.Avoid.Point(10, 10);
      const rect1 = new this.Avoid.Rectangle(upper1, lower1);

      const upper2 = new this.Avoid.Point(50, 50);
      const lower2 = new this.Avoid.Point(60, 60);
      const rect2 = new this.Avoid.Rectangle(upper2, lower2);

      const upper3 = new this.Avoid.Point(100, 1);
      const lower3 = new this.Avoid.Point(110, 10);
      const rect3 = new this.Avoid.Rectangle(upper3, lower3);

      const shape1: ShapeRef = new this.Avoid.ShapeRef(router, rect1);
      const shape2: ShapeRef = new this.Avoid.ShapeRef(router, rect2);
      const shape3: ShapeRef = new this.Avoid.ShapeRef(router, rect3);

      const shape1Pin: ShapeConnectionPin = new this.Avoid.ShapeConnectionPin(
        shape1,
        1,
        1,
        0.5,
        true,
        0,
        this.Avoid.ConnDirRight
      );

      const shape2Pin: ShapeConnectionPin = new this.Avoid.ShapeConnectionPin(
        shape2,
        2,
        0.5,
        0,
        true,
        0,
        this.Avoid.ConnDirUp
      );

      const shape3Pin: ShapeConnectionPin = new this.Avoid.ShapeConnectionPin(
        shape3,
        3,
        0,
        0.5,
        true,
        0,
        this.Avoid.ConnDirLeft
      );

      shape1Pin.setExclusive(false);
      shape2Pin.setExclusive(false);
      shape3Pin.setExclusive(false);

      const end1: ConnEnd = new this.Avoid.ConnEnd(shape1, 1);
      const end2: ConnEnd = new this.Avoid.ConnEnd(shape2, 2);
      const end3: ConnEnd = new this.Avoid.ConnEnd(shape3, 3);

      /**
       * Junction
       * ->

      const p1: Point = new this.Avoid.Point(50, 10);
      const jun1: JunctionRef = new this.Avoid.JunctionRef(router, p1);
      const end: ConnEnd = new this.Avoid.ConnEnd();
      const endjun: ConnEnd = end.createConnEndFromJunctionRef(jun1);

      //const p1: Point = new Avoid.Point(10, 10);
      //const p2: Point = new Avoid.Point(50, 50);
      //const end1: ConnEnd = new Avoid.ConnEnd(p1);
      //const end2: ConnEnd = new Avoid.ConnEnd(p2);

      const connection1: ConnRef = new this.Avoid.ConnRef(router, end1, endjun);
      const connection2: ConnRef = new this.Avoid.ConnRef(router, end2, endjun);
      const connection3: ConnRef = new this.Avoid.ConnRef(router, endjun, end3);

      console.log((shape1 as any).ptr);

      connection3.setCallback(this.avoidConnectorCallback, connection3);

      //connection.setSourceEndpoint(end1);
      //connection.setDestEndpoint(end2);

      router.processTransaction();

      router.moveShape(shape3, -50, -30);

      //const hyperedge: HyperedgeRerouter = router.hyperedgeRerouter();
      //hyperedge.registerHyperedgeForRerouting(jun1);

      router.processTransaction();

      //router.deleteJunction(jun1);

      //router.processTransaction();

      //console.log(jun1.recommendedPosition());

      // convert route to vertices
      //const route = connection1.displayRoute();
      //console.log(this.getSourceFromAvoidRoute(route));
      //console.log(this.getTargetFromAvoidRoute(route));
      //console.log(this.getVerticesFromAvoidRoute(route));

      //router.outputInstanceToSVG('');

      // set fixed route in the scene
      //console.log(connection.hasFixedRoute());
      //connection.setFixedExistingRoute();
      //console.log(connection.hasFixedRoute());

      //console.log(router.printInfo());
    });
    return null;
  }*/

  private onAvoidConnectorChange(connRefPtr: ConnRef) {
    console.log('callback');
    console.log(connRefPtr);
}

  private getSourceFromAvoidRoute(route: PolyLine): joint.g.Point {
    const { x, y } = route.get_ps(0);
    return new joint.g.Point(x, y);
  }

  private getTargetFromAvoidRoute(route: PolyLine): joint.g.Point {
    const { x, y } = route.get_ps(route.size());
    return new joint.g.Point(x, y);
  }

  private getVerticesFromAvoidRoute(route: PolyLine): joint.g.Point[] {
    const vertices: joint.g.Point[] = [];
    for (let i = 1; i < route.size() - 1; i++) {
      const { x, y } = route.get_ps(i);
      vertices.push(new joint.g.Point(x, y));
    }
    return vertices;
  }

}

enum RoutingParameter
{
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
    lastRoutingParameterMarker
};

enum RoutingOption
{
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
    lastRoutingOptionMarker
};
