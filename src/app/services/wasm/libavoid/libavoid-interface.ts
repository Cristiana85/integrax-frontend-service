export interface Point {
  new (x: number, y: number): Point;
  x: number;
  y: number;
}

export interface Router {
  new (flags: number): Router;

  processTransaction(): void;

  printInfo(): void;

  moveShape(shape: ShapeRef, newPolygon: Polygon): void;
  moveShape(shape: ShapeRef, xDiff: number, yDiff: number): void;
  moveJunction(shape: JunctionRef, newPoint: Point): void;
  moveJunction(shape: JunctionRef, xDiff: number, yDiff: number): void;

  deleteShape(shape: ShapeRef): void;
  deleteConnector(connRef: ConnRef): void;
  deleteJunction(junction: JunctionRef): void;

  setRoutingParameter(parameter: number, value: number): void;
  setRoutingOption(option: number, value: boolean): void;
  setRoutingPenalty(parameter: number, value: number): void;
  routingParameter(parameter: number): number;
  routingOption(parameter: number): number;

  setTransactionUse(value: boolean): void;

  outputInstanceToSVG(filename: String): void;

  hyperedgeRerouter(): HyperedgeRerouter;
}

export interface HyperedgeRerouter {
  new (): HyperedgeRerouter;
  registerHyperedgeForRerouting(junction: JunctionRef): number;
}

export interface PolyLine {
  size(): number;
  get_ps(index: number): Point;
}

export interface ConnEnd {
  new (): ConnEnd;
  new (point: Point): ConnEnd;
  new (shapeRef: ShapeRef, classId: number): ConnEnd;
  createConnEndFromJunctionRef(JunctionRef: JunctionRef): ConnEnd;
}

export interface ConnRef {
  new (router: Router): ConnRef;
  new (router: Router, srcConnEnd: ConnEnd, dstConnEnd: ConnEnd): ConnRef;
  id(): number;
  setCallback(callback: (connRef: ConnRef) => void, connRef: ConnRef): void;
  setSourceEndpoint(srcPoint: ConnEnd, dstPoint: ConnEnd): void;
  setSourceEndpoint(srcPoint: ConnEnd): void;
  setDestEndpoint(dstPoint: ConnEnd): void;
  needsRepaint(): boolean;
  routingType(): number;
  setRoutingType(type: number): void;
  displayRoute(): PolyLine;
  setHateCrossings(value: boolean): void;
  doesHateCrossings(): boolean;
  setFixedRoute (route: PolyLine): void;
  setFixedExistingRoute(): void;
  hasFixedRoute(): boolean;
  clearFixedRoute(): void;
}

export enum ConnDirFlags {
  ConnDirNone,
  ConnDirUp,
  ConnDirDown,
  ConnDirLeft,
  ConnDirRight,
  ConnDirAll
}

export enum ConnEndType {
  ConnEndPoint,
  ConnEndShapePin,
  ConnEndJunction,
  ConnEndEmpty,
}

export enum ConnType {
  ConnType_PolyLine,
  ConnType_Orthogonal
}

export interface ShapeConnectionPin {
  new(shape: ShapeRef, classId: number, xOffset: number, yOffset: number, proportional: boolean, insideOffset: number, visDirs: ConnDirFlags): ShapeConnectionPin;
  new(junction: JunctionRef, classId: number, visDirs?: ConnDirFlags): ShapeConnectionPin;
  setConnectionCost(cost: number): void;
  setExclusive(exclusive: boolean): void;
  isExclusive(): boolean;
  directions(): ConnDirFlags;
  position(): Point;
  updatePosition(newPosition: Point): void;
}


export interface JunctionRef {
  new (router: Router, point: Point, id?: number): JunctionRef;
  removeJunctionAndMergeConnectors(): ConnRef;
  position(): Point;
  setPositionFixed(fixed: boolean): void;
  positionFixed(): boolean;
  recommendedPosition(): Point;
}

export interface Polygon {
  new (n: number): void;
}

export interface Rectangle extends Polygon {
  new (centre: Point, width: number, height: number): Rectangle;
  new (topLeft: Point, bottomRight: Point): Rectangle;
}

export interface Obstacle {
  id(): number;
  polygon(): Polygon;
  router(): Router;
  position(): Point;

  setNewPoly(polygon: Polygon): void;
}

export interface ShapeRef extends Obstacle {
  new (router: Router, shapePoly: Polygon): ShapeRef;
}

export interface Avoid {
  [x: string]: any;
  PolyLineRouting: number;
  OrthogonalRouting: number;

  ConnEnd: ConnEnd;
  ConnRef: ConnRef;
  Point: Point;
  Rectangle: Rectangle;
  Router: Router;
  Obstacle: Obstacle;
  ShapeRef: ShapeRef;
  JunctionRef: JunctionRef;

  destroy(obj: any): void;
}




