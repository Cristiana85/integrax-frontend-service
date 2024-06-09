import * as joint from 'jointjs';
import * as jQuery from 'jquery';
import * as _ from 'lodash';
import * as $ from 'backbone';
import { MVController } from "src/app/diagram/core/mv-controller";
import { Node } from '../../library/junctions/std-node';
import { retry } from 'rxjs';


enum ORIENTATION {
  H,
  V,
}

export class IntersectionController {

  private mvc: MVController;

  // only device element, no junctions or other
  private lActiveDevice: Map<string, joint.dia.Element>;

  // only wires, both seleted and connected
  private lActiveLink: Map<string, joint.dia.Link[]>;

  // helper calculated port positions from active element
  private lActivePort: Map<string, Map<string, joint.g.Point>>;

  // helper and used step by step: from here is possible the to calculate port positions
  private lPassiveDevice: Map<string, joint.dia.Element>;

  // helper and used step by step: from here is possible the to calculate port positions
  private lPassivePort: Map<string, Map<string, joint.g.Point>>;

  // helper and used step by step
  private lPassiveLink: Map<string, joint.dia.Link>;

  // helper and used step by step: node are always passive -> from here calculate node position
  private lPassiveNode: Map<string, joint.dia.Element>;

  private lInsertedLink: joint.dia.Link[] = [];

  private lInsertedNode: joint.dia.Element[] = [];

  private isModel = function(el: any) { return el.attr('./type') === 'device' };

  private isWire = function(el: any) { return el.attr('./type') === 'wire' };

  private isNode = function(el: any) { return el.attr('./type') === 'node' };

  constructor(mvc: MVController) {
    this.mvc = mvc;
  }

  public mount() {
    this.lActiveDevice = new Map<string, joint.dia.Element>();
    this.lActiveLink = new Map<string, joint.dia.Link[]>();
    this.lActivePort = new Map<string, Map<string, joint.g.Point>>();
    this.lPassiveDevice = new Map<string, joint.dia.Element>();
    this.lPassivePort = new Map<string, Map<string, joint.g.Point>>();
    this.lPassiveLink = new Map<string, joint.dia.Link>();
    this.lPassiveNode = new Map<string, joint.dia.Element>();
  }

  public resolveIntersection(lCell: joint.dia.Cell[], haloenabled: boolean) {
    if (haloenabled) {
      const lSelectedElems = this.mvc.halo.getEmbeddedElements();
      const lSelectedLinks = this.mvc.halo.getEmbeddedLink();

      lSelectedElems.forEach((elem) => {
        if (this.isModel(elem)) {
          this.mvc.graph.getConnectedLinks(elem).forEach((link) => {
            this.addToActiveLink(link);
          });
          this.addToActiveElement(elem);
        }
      });

      lSelectedLinks.forEach((link) => {
        if (this.isWire(link)) {
          this.addToActiveLink(link);
        }
      });
    } else {
      lCell.forEach((cell) => {
        if (cell.isElement() && this.isModel(cell)) {
          this.mvc.graph.getConnectedLinks(cell).forEach((link) => {
            this.addToActiveLink(link);
          });
          this.addToActiveElement(cell);
        } else if (cell.isLink() && this.isWire(cell)) {
          this.addToActiveLink(cell);
        }
      });
    }

    // manage element solving

    if (this.lActiveDevice.size > 0) {

      // first step
      this.findPortFromList(this.lActiveDevice, 'active');

      // Second step
      // corresponding finder
      this.lActiveDevice.forEach((device, key) => {
        const bbox = device.findView(this.mvc.paper).getBBox();
        this.findDeviceInArea(bbox, device.id.toString());
        this.findNodeInArea(bbox);
      });
      // corresponding solver
      this.solvePortOnPort();

      // Third step
      // corresponding finder
      this.lActiveDevice.forEach((device, key) => {
        const bbox = device.findView(this.mvc.paper).getBBox();
        this.findNodeInArea(bbox);
      });
      // corresponding solver
      this.solvePortOnNode();
    }

    if (this.lActiveLink.size > 0) {

      this.mvc.paper.updateViews();

      // fourth step
      // corresponding finder
      this.lActiveLink.forEach((link, key) => {
        this.findLinksOverLink(link[0]);
      });
      // corresponding solver

      // fiveth step
      // corresponding finder
      this.lActiveLink.forEach((link, key) => {
        this.findLinksOverPort(link[0]);
        this.solveLinkOnPort(link[0]);
      });
      // corresponding solver
    }




    console.log([...this.lActiveDevice])
    console.log([...this.lActiveLink])
    console.log([...this.lPassiveLink])
    console.log([...this.lPassiveDevice])
    console.log([...this.lPassivePort])
    console.log([...this.lPassiveNode])



    this.lActiveDevice.clear();
    this.lActiveLink.clear();
    this.lActivePort.clear();
    this.lPassiveDevice.clear();
    this.lPassivePort.clear();
    this.lPassiveNode.clear();
    this.lPassiveLink.clear();

    if (this.lInsertedLink.length > 0) {
      this.mvc.graph.addCell(this.lInsertedLink);
    }

    if (this.lInsertedNode.length > 0) {
      this.mvc.graph.addCell(this.lInsertedNode);
    }

  }

  private addToActiveElement(cell: joint.dia.Cell) {
    if (cell) {
      const id = cell.id.toString();
      if (!this.lActiveDevice.has(id)) {
        this.lActiveDevice.set(id, cell as joint.dia.Element);
      }
    }
  }

  private addToActiveLink(cell: joint.dia.Cell) {
    if (cell) {
      const id = cell.id.toString();
      if (!this.lActiveLink.has(id)) {
        this.lActiveLink.set(id, [cell] as joint.dia.Link[]);
      }
    }
  }

  /**
   * Finder
   */
  private findDeviceInArea(bbox: joint.g.Rect, id?: string, link?: joint.dia.Link) {
    if (bbox) {
      bbox = bbox.inflate(0.1, 0.1);
      const list = this.mvc.graph.findModelsInArea(bbox);
      var devices = list.filter(el => el.attr('./type') === 'device');
      if (id) {
        devices = devices.filter(el => el.id != id);
      }
      if (link) {
        const src = link.source();
        const tgr = link.source();
        if (src && src.id) {
          devices = devices.filter(el => el.id != src.id);
        }
        if (tgr && tgr.id) {
          devices = devices.filter(el => el.id != tgr.id);
        }
      }
      devices.forEach(dev => {
        this.lPassiveDevice.set(dev.id.toString(), dev);
        this.findPortFromDevice(dev, 'passive', bbox);
      });
    }
  }

  private findNodeInArea(bbox: joint.g.Rect, id?: string) {
    if (bbox) {
      bbox = bbox.inflate(0.1, 0.1);
      const list = this.mvc.graph.findModelsInArea(bbox);
      const nodes = list.filter(el => el.attr('./type') === 'node');
      if (id) {
        nodes.filter(el => el.id != id);
      }
      nodes.forEach(node => {
        this.lPassiveNode.set(node.id.toString(), node);
      });
    }
  }

  private findPortFromDevice(device: joint.dia.Element, list: 'active' | 'passive', bbox?: joint.g.Rect, link?: joint.dia.Link) {
    if (device) {
      if (bbox) {
        bbox = bbox.inflate(0.1, 0.1);
      }
      const ports = device.getPorts();
      var ports_map = new Map<string, joint.g.Point>();
      ports.forEach(port => {
        if (link) {
          if (link.source().port && link.source().port === port.id) {
            return;
          }
          if (link.target().port && link.target().port === port.id) {
            return;
          }
        }
        const coords = device.getPortsPositions(port.group)[port.id];
        const x = coords.x + device.position().x;
        const y = coords.y + device.position().y;
        var portPt = new joint.g.Point(x, y);
        portPt = device.getPointRotatedAroundCenter(device.angle(), portPt.x, portPt.y);
        if (bbox) {
          if (bbox.containsPoint(portPt)) {
            ports_map.set(port.id, portPt);
          }
        } else {
          ports_map.set(port.id, portPt);
        }
      });
      if (ports_map.size > 0) {
        if (list === 'active') {
          if (this.lActivePort.has(device.id.toString())) {
            ports_map.forEach((port, key) => {
              this.lActivePort.get(device.id.toString()).set(key, port);
            })
          } else {
            this.lActivePort.set(device.id.toString(), ports_map);
          }
        } else if (list === 'passive') {
          if (this.lPassivePort.has(device.id.toString())) {
            ports_map.forEach((port, key) => {
              this.lPassivePort.get(device.id.toString()).set(key, port);
            })
          } else {
            this.lPassivePort.set(device.id.toString(), ports_map);
          }
        }
      }
    }
  }

  private findPortFromList(map: Map<string, joint.dia.Element>, list: 'active' | 'passive', bbox?: joint.g.Rect) {
    if (map) {
      if (bbox) {
        bbox = bbox.inflate(0.1, 0.1);
      }
      map.forEach((el) => {
        const ports = el.getPorts();
        var ports_map = new Map<string, joint.g.Point>();
        ports.forEach((port, key) => {
          const coords = el.getPortsPositions(port.group)[port.id];
          const x = coords.x + el.position().x;
          const y = coords.y + el.position().y;
          var portPt = new joint.g.Point(x, y);
          portPt = el.getPointRotatedAroundCenter(el.angle(), portPt.x, portPt.y);
          if (bbox) {
            if (bbox.containsPoint(portPt)) {
              ports_map.set(port.id, portPt);
            }
          } else {
            ports_map.set(port.id, portPt);
          }
        });
        if (ports_map.size > 0) {
          if (list === 'active') {
            this.lActivePort.set(el.id.toString(), ports_map);
          } else if (list === 'passive') {
            this.lPassivePort.set(el.id.toString(), ports_map);
          }
        }
      });
    }
  }

  private findLinksOverPort(link: joint.dia.Link) {
    const linkView = link.findView(this.mvc.paper);
    const path = joint.g.Path.parse(linkView.$el.children().attr('d'));
    const n_segments = path.getSegmentSubdivisions();
    for (var i = 0; i < n_segments.length; i++) {
      const moveto = !path.getSegment(i).isSubpathStart;
      if (moveto) {
        const bbox = path.getSegment(i).bbox();
        this.findDeviceInArea(bbox, '', link);
        this.findNodeInArea(bbox);
      }
    }
  }

  private findLinksOverLink(link: joint.dia.Link) {
    const linkView = link.findView(this.mvc.paper);
    const path = joint.g.Path.parse(linkView.$el.children().attr('d'));
    const n_segments = path.getSegmentSubdivisions();
    for (var i = 0; i < n_segments.length; i++) {
      const moveto = !path.getSegment(i).isSubpathStart;
      if (moveto) {
        this.findLinksInSegmentArea(path.getSegment(i).bbox(), linkView.id.toString());
      }
    }
  }

  private findLinksInSegmentArea(bbox: joint.g.Rect, id?: string) {
    if (bbox) {
      const inLinkArea = bbox.inflate(1, 1);
      const lLinkViews = this.mvc.graph.getLinks().map((link) => {
        return link.findView(this.mvc.paper);
      });
      lLinkViews.filter((linkView) => {
        var isIntersected = false;
        if (id && id === linkView.id) {
          return false;
        }
        const path = joint.g.Path.parse(linkView.$el.children().attr('d'));
        const n_segments = path.getSegmentSubdivisions();
        for (var i = 0; i < n_segments.length; i++) {
          const moveto = !path.getSegment(i).isSubpathStart;
          const segment_bbox = path.getSegment(i).bbox();
          if (moveto) {
            if (segment_bbox.intersect(inLinkArea)) {
              isIntersected = true;
              break;
            }
          }
        }
        if (isIntersected) {
          this.lPassiveLink.set(linkView.model.id.toString(), linkView.model as joint.dia.Link);
        }
        return false;
      });
    }
  }


  /**
   * Solvers
   */
  private solvePortOnPort() {
    this.lPassivePort.forEach((pports, pkeys) => {
      this.lActivePort.forEach((aports, akeys) => {
        pports.forEach((pport, pkey) => {
          aports.forEach((aport, akey) => {
            if (pport.equals(aport)) {
              const linkinfo = new LinkInfo();
              linkinfo.source = { id: pkeys, port: pkey }
              linkinfo.target = { id: akeys, port: akey }
              this.insertLink(linkinfo);
              /**
               * check for already connected port -> insert node and reconnect
               */
            }
          });
        });
      });
    });
  }

  private solvePortOnNode() {
    this.lPassiveNode.forEach((pnode, pkeys) => {
      this.lActivePort.forEach((aports, akeys) => {
        aports.forEach((aport, akey) => {
          const nodePoint = pnode.position();
          if (nodePoint.equals(aport)) {
            const linkinfo = new LinkInfo();
            linkinfo.source = { id: pkeys }
            linkinfo.target = { id: akeys, port: akey }
            this.insertLink(linkinfo);
            /**
             * check for already connected port -> insert node and reconnect
             */
          }
        });
      });
    });
  }


  private solveLinkOnPort(originalLink: joint.dia.Link) {
    this.lPassivePort.forEach((ports, elemId) => {
      ports.forEach((port, portId) => {
        var refnode = undefined;
        this.lPassiveNode.forEach(node => {
          const nodePoint = node.position();
          if (port.equals(nodePoint)) {
            refnode = node;
          }
        });
        if (refnode) { // se c'è già il nodo è easy -> splitta e attacca
          const elemNode = this.mvc.graph.getCell(refnode) as joint.dia.Element;
        } else { // se non c'è il nodo -> in serisci node, splitta e attacca tutti i link
          // create node
          const newnode = this.insertNode(port);
          // split link
          this.splitLink(originalLink, newnode);
          // attach pevious links
          const elem = this.mvc.graph.getCell(elemId) as joint.dia.Element;
          const links = this.mvc.graph.getConnectedLinks(elem);
          if (links && links.length > 0) {
            links.forEach(link => {
              if (link.source().port && link.source().port === portId) {

              } else if (link.target().port && link.target().port === portId) {

              }
            });
          } else {
            const linkinfo = new LinkInfo();
            linkinfo.source = { id: elemId, port: portId }
            linkinfo.target = { id: newnode.id }
            this.insertLink(linkinfo);
          }
        }
      });
    })
  }




  /**
   * Inferer
   */
  private insertLink(linkinfo: LinkInfo) {
    const wire = this.mvc.wiring.createWire();
    if (wire) {
      wire.source(linkinfo.source);
      wire.vertices(linkinfo.vertices);
      wire.target(linkinfo.target);
      this.lInsertedLink.push(wire);
    }
  }

  private insertNode(position: joint.g.Point): joint.dia.Element {
    const node = new Node();
    node.position(position.x, position.y);
    this.lInsertedNode.push(node);
    return node;
  }

  private splitLink(link: joint.dia.Link, node: joint.dia.Element) {
    const nodePoint = node.position();
    const linkView = link.findView(this.mvc.paper) as joint.dia.LinkView;
    const idx = linkView.getVertexIndex(nodePoint.x, nodePoint.y);
    const vertices = link.get('vertices');

    const clone = link.clone();
    clone.set('target', { id: node.id });
    clone.set('source', link.target());

    link.set('target', { id: node.id });

    if (vertices) {
      const preIdxVertices = vertices.slice(0, idx);
      const postIdxVertices = vertices.slice(idx, vertices.length);
      link.set('vertices', preIdxVertices);
      clone.set('vertices', postIdxVertices.reverse());
    }

    this.lInsertedLink.push(clone);
    this.lActiveLink.get(link.id.toString()).push(clone);

  }












  public getSelectedJunctions(activeLink: joint.dia.Link): joint.dia.Element[] {
    if (activeLink && activeLink.isLink()) {
      const activeLinkArea = activeLink.getBBox().inflate(0.1, 0.1);
      return this.mvc.graph.findModelsInArea(activeLinkArea).filter(el => el.attr('./type') === 'junction');
    }
    return undefined;
  }

  public getSelectedElements(activeLink: joint.dia.Link): joint.dia.Element[] {
    if (activeLink && activeLink.isLink()) {
      const activeLinkArea = activeLink.getBBox().inflate(0.1, 0.1);
      return this.mvc.graph.findModelsInArea(activeLinkArea).filter(el => el.attr('./type') === 'device');
    }
    return undefined;
  }

  public resolveIntersections(activeLink: joint.dia.Link, lPassiveLink: joint.dia.Link[], lPassiveElement: joint.dia.Element[], lPassiveJunction: joint.dia.Element[]) {

    if (activeLink && lPassiveElement && lPassiveElement.length > 0) {

      const activeArea = activeLink.getBBox().inflate(0.1, 0.1);

      var portsMatrix: Array<ConnectionInfo> = [];

      var junctionsMatrix: Array<ConnectionInfo> = [];


      lPassiveElement.forEach(el => {

        const ports = el.getPorts();

        ports.forEach(port => {

           const coords = el.getPortsPositions(port.group)[port.id];
           const x = coords.x + el.position().x;
           const y = coords.y + el.position().y;

           const port_position = new joint.g.Point(x, y)

           if (activeArea.containsPoint(port_position)) {

             var conninfo = new ConnectionInfo();
             conninfo.node_coord = new joint.g.Point(x, y);
             conninfo.element = el;
             conninfo.type = 'port';

             portsMatrix.push(conninfo);

           }

        });

      });

    }


    if (activeLink && lPassiveJunction && lPassiveJunction.length > 0) {
      var junctionsMatrix: Array<ConnectionInfo> = [];
    }



    /**
     *
     *
     *
     *
     *
     *
     */

    if (activeLink && lPassiveLink && lPassiveLink.length > 0) {
      var linksMatrix: Array<Array<ConnectionInfo>> = [];

      const activePath = joint.g.Path.parse(
        activeLink.findView(this.mvc.paper).$el.children().attr('d')
      );
      const n_aSegment = activePath.getSegmentSubdivisions();

      // Outer loop
      for (var i = 0; i < n_aSegment.length; i++) {
        if (i > 0) {
          const aSeg = activePath.getSegment(i); // root segment!

          const linksList: Array<ConnectionInfo> = [];

          // Mid loop
          lPassiveLink.forEach((passiveLink, j) => {
            const passivePath = joint.g.Path.parse(
              passiveLink.findView(this.mvc.paper).$el.children().attr('d')
            );
            const n_pSegment = passivePath.getSegmentSubdivisions();

            // Inner loop
            for (var k = 0; k < n_pSegment.length; k++) {
              const connInfo = new ConnectionInfo();
              if (k > 0) {
                const pSeg = passivePath.getSegment(k);

                if (this.isVertical(aSeg) && this.isVertical(pSeg)) {
                  // Vert
                  if (this.verticalOverlap(aSeg, pSeg)) {
                    //console.log('VERT')
                    const pts = this.getVerticalConnections(aSeg, pSeg);
                    if (pts && pts.length === 2) {
                      connInfo.type = 'intersection';
                      connInfo.start = pts[0];
                      connInfo.end = pts[1];
                      connInfo.start_dist = aSeg.start.distance(pts[0]);
                      connInfo.end_dist = aSeg.end.distance(pts[1]);
                      connInfo.orientation = 'V';
                    }
                  }
                } else if (this.isHorizontal(aSeg) && this.isHorizontal(pSeg)) {
                  // Horz
                  if (this.horizontalOverlap(aSeg, pSeg)) {
                    //console.log('HORZ')
                    const pts = this.getHorizontalConnections(aSeg, pSeg);
                    if (pts && pts.length === 2) {
                      connInfo.type = 'intersection';
                      connInfo.start = pts[0];
                      connInfo.end = pts[1];
                      connInfo.start_dist = aSeg.start.distance(pts[0]);
                      connInfo.end_dist = aSeg.end.distance(pts[1]);
                      connInfo.orientation = 'H';
                    }
                  }
                }
              }
              if (connInfo.type === 'intersection') {
                connInfo.link = passiveLink;
                linksList.push(connInfo);
              }
            }
          });

          if (linksList.length > 0) {
            linksList.sort((o1, o2) => {
              return o1.start_dist - o2.start_dist;
            });
          }

          // here store the path
          linksMatrix.push(linksList);
        }
      }
    }

    console.log(linksMatrix);

    console.log(portsMatrix);

    this.solveMatrix(activeLink, linksMatrix);
  }

  private isHorizontal(seg: joint.g.Segment): boolean {
    if (seg.start.y === seg.end.y) {
      return true;
    }
    return false;
  }

  private isVertical(seg: joint.g.Segment): boolean {
    if (seg.start.x === seg.end.x) {
      return true;
    }
    return false;
  }

  private verticalOverlap(aSeg: joint.g.Segment, bSeg: joint.g.Segment): boolean {
    if (aSeg.start.x === bSeg.start.x) {
      const l1start = Math.min(aSeg.start.y, aSeg.end.y);
      const l1end = Math.max(aSeg.start.y, aSeg.end.y);
      const l2start = Math.min(bSeg.start.y, bSeg.end.y);
      const l2end = Math.max(bSeg.start.y, bSeg.end.y);
      return l1start <= l2end && l2start <= l1end;
    }
    return undefined;
  }

  private horizontalOverlap(aSeg: joint.g.Segment, bSeg: joint.g.Segment): boolean {
    if (aSeg.start.y === bSeg.start.y) {
      const l1start = Math.min(aSeg.start.x, aSeg.end.x);
      const l1end = Math.max(aSeg.start.x, aSeg.end.x);
      const l2start = Math.min(bSeg.start.x, bSeg.end.x);
      const l2end = Math.max(bSeg.start.x, bSeg.end.x);
      return l1start <= l2end && l2start <= l1end;
    }
    return undefined;
  }

  private getVerticalConnections(aSeg: joint.g.Segment, bSeg: joint.g.Segment): joint.g.Point[] {
    const aLine = new joint.g.Line(aSeg.start, aSeg.end);
    const bLine = new joint.g.Line(bSeg.start, bSeg.end);
    var twoPoint: joint.g.Point[] = [];
    if (aLine.containsPoint(bSeg.start) && aLine.containsPoint(bSeg.end)) {
      console.log('INNER ASEG')
      // orientation following active line flow
      if (aSeg.start.y <= bSeg.start.y) {
        if (bSeg.start.y < bSeg.end.y) {
          twoPoint.push(bSeg.start);
          twoPoint.push(bSeg.end);
        } else {
          twoPoint.push(bSeg.end);
          twoPoint.push(bSeg.start);
        }
      } else {
        if (bSeg.start.y > bSeg.end.y) {
          twoPoint.push(bSeg.start);
          twoPoint.push(bSeg.end);
        } else {
          twoPoint.push(bSeg.end);
          twoPoint.push(bSeg.start);
        }
      }
    } else if (bLine.containsPoint(aSeg.start) && bLine.containsPoint(aSeg.end)) {
      console.log('INNER BSEG')
      twoPoint.push(aSeg.start);
      twoPoint.push(aSeg.end);
    } else if (aLine.containsPoint(bSeg.start)) {
      console.log('START')
      if (aSeg.start.y < bSeg.start.y) {
        if (bSeg.start.y < bSeg.end.y) {
          twoPoint.push(bSeg.start);
          twoPoint.push(aSeg.end);
        } else {
          twoPoint.push(aSeg.start);
          twoPoint.push(bSeg.start);
        }
      } else {
        if (bSeg.start.y < bSeg.end.y) {
          twoPoint.push(aSeg.start);
          twoPoint.push(bSeg.start);
        } else {
          twoPoint.push(bSeg.start);
          twoPoint.push(aSeg.end);
        }
      }
    } else if (aLine.containsPoint(bSeg.end)) {
      console.log('END')
      if (aSeg.start.y < bSeg.end.y) {
        if (bSeg.end.y < bSeg.start.y) {
          twoPoint.push(bSeg.end);
          twoPoint.push(aSeg.end);
        } else {
          twoPoint.push(aSeg.start);
          twoPoint.push(bSeg.end);
        }
      } else {
        if (bSeg.end.y < bSeg.start.y) {
          twoPoint.push(aSeg.start);
          twoPoint.push(bSeg.end);
        } else {
          twoPoint.push(bSeg.end);
          twoPoint.push(aSeg.end);
        }
      }
    }
    return  twoPoint;
  }


  private getHorizontalConnections(aSeg: joint.g.Segment, bSeg: joint.g.Segment): joint.g.Point[] {
    const aLine = new joint.g.Line(aSeg.start, aSeg.end);
    const bLine = new joint.g.Line(bSeg.start, bSeg.end);
    var twoPoint: joint.g.Point[] = [];
    if (aLine.containsPoint(bSeg.start) && aLine.containsPoint(bSeg.end)) {
      console.log('INNER ASEG')
      // orientation following active line flow
      if (aSeg.start.x <= bSeg.start.x) {
        if (bSeg.start.x < bSeg.end.x) {
          twoPoint.push(bSeg.start);
          twoPoint.push(bSeg.end);
        } else {
          twoPoint.push(bSeg.end);
          twoPoint.push(bSeg.start);
        }
      } else {
        if (bSeg.start.x > bSeg.end.x) {
          twoPoint.push(bSeg.start);
          twoPoint.push(bSeg.end);
        } else {
          twoPoint.push(bSeg.end);
          twoPoint.push(bSeg.start);
        }
      }
    } else if (bLine.containsPoint(aSeg.start) && bLine.containsPoint(aSeg.end)) {
      console.log('INNER BSEG')
      twoPoint.push(aSeg.start);
      twoPoint.push(aSeg.end);
    } else if (aLine.containsPoint(bSeg.start)) {
      console.log('START')
      if (aSeg.start.x < bSeg.start.x) {
        if (bSeg.start.x < bSeg.end.x) {
          twoPoint.push(bSeg.start);
          twoPoint.push(aSeg.end);
        } else {
          twoPoint.push(aSeg.start);
          twoPoint.push(bSeg.start);
        }
      } else {
        if (bSeg.start.x < bSeg.end.x) {
          twoPoint.push(aSeg.start);
          twoPoint.push(bSeg.start);
        } else {
          twoPoint.push(bSeg.start);
          twoPoint.push(aSeg.end);
        }
      }
    } else if (aLine.containsPoint(bSeg.end)) {
      console.log('END')
      if (aSeg.start.x < bSeg.end.x) {
        if (bSeg.end.x < bSeg.start.x) {
          twoPoint.push(bSeg.end);
          twoPoint.push(aSeg.end);
        } else {
          twoPoint.push(aSeg.start);
          twoPoint.push(bSeg.end);
        }
      } else {
        if (bSeg.end.x < bSeg.start.x) {
          twoPoint.push(aSeg.start);
          twoPoint.push(bSeg.end);
        } else {
          twoPoint.push(bSeg.end);
          twoPoint.push(aSeg.end);
        }
      }
    }
    return  twoPoint;
  }

  private solveMatrix(link: joint.dia.Link, matrix: Array<Array<ConnectionInfo>>) {

    if (link && matrix && matrix.length > 0) {

      var links: Array<LinkInfo> = [];

      var lastEnd: joint.g.Point = undefined;

      var currentLink: LinkInfo = undefined;


      matrix.forEach((lConninfo, index) => {

        if (index === 0) {

          currentLink = new LinkInfo();
          currentLink.source = link.source();

        } else if (index === (matrix.length - 1)) {

          currentLink.target = link.target();
          links.push(currentLink);

        }

        if (lConninfo.length > 0) {

          lConninfo.forEach(conninfo => {

            if (lastEnd) {
              if (lastEnd.equals(conninfo.start)) {
                currentLink.source = conninfo.end;
                lastEnd = conninfo.end;
                return;
              }
            }
            currentLink.target = conninfo.start;
            links.push(currentLink);
            currentLink = new LinkInfo();
            currentLink.source = conninfo.end;
            lastEnd = conninfo.end;

          });

          const vertex = link.vertex(index) as joint.g.Point;
          if (vertex && lastEnd && !lastEnd.equals(vertex)) {
            currentLink.vertices.push(link.vertex(index) as joint.g.Point);
          }

        } else {

          const vertex = link.vertex(index) as joint.g.Point;
          if (vertex) {
            currentLink.vertices.push(link.vertex(index) as joint.g.Point);
          }

        }

      });

      console.log(links)

    }
  }

  private mergeIntersection() {
    // ordered the point on active link
    // check for overlap with vetices
    // recursevely vreate new link
    // - - - - -

  }





















  /*public createJunction(junctionInfo: JunctionInfo, evt: any): Node {
    this.getJunctionInfo(junctionInfo, junctionInfo.targetLink, evt);
    const junction = new Node();
    junction.translate(junctionInfo.hitPoint.x, junctionInfo.hitPoint.y);
    junction.addTo(this.mvc.graph);
    return junction;
  }

  private getJunctionInfo(junctionInfo: JunctionInfo, link: joint.dia.Link, evt: any) {
    const linkView = (link.findView(this.mvc.paper) as joint.dia.LinkView);
    const hitPoint = linkView.getClosestPoint({x: evt.offsetX, y: evt.offsetY});
    const idx = linkView.getVertexIndex(hitPoint.x, hitPoint.y);
    const vertices = link.get('vertices');

    junctionInfo.hitPoint = this.mvc.paper.snapToGrid(hitPoint.x, hitPoint.y); //hitPoint
    junctionInfo.source = link.source();
    junctionInfo.target = link.target();

    if (vertices) {
      junctionInfo.preIdxVertices = vertices.slice(0, idx);
      junctionInfo.postIdxVertices = vertices.slice(idx, vertices.length);
    }
  }

  public splitLink(junctionInfo: JunctionInfo, targetLink: joint.dia.Link, junction: Node) {
    targetLink.set('vertices', junctionInfo.preIdxVertices);
    targetLink.set('target', { id: junction.id });
    const clone = targetLink.clone();
    clone.set('target', { id: junction.id });
    clone.set('source', junctionInfo.target);
    clone.set('vertices', junctionInfo.postIdxVertices.reverse());
    clone.addTo(this.mvc.graph);
  }

  public connectoToJunction(drawingLink: joint.dia.Link, junctionInfo: JunctionInfo) {
    drawingLink.set('target', { x: junctionInfo.hitPoint.x, y: junctionInfo.hitPoint.y });
    this.mvc.paper.findViewByModel(drawingLink.id).render();
  }

  public validateJunctionConnections(junction: Node, junctionInfo: JunctionInfo): joint.dia.Link [] {
    var links = this.mvc.graph.getConnectedLinks(junction);
    if (links) {
      if (links.length === 3) { // how to manage connection on junction?????
        var lVertex: joint.g.Point[] = [];
        links.forEach(link => {
          var a = this.getLastVertex(link, junction);
          if (a) {
            lVertex.push(a);
          }
        });
        if (lVertex.length === 3) {
          const newHitPoint = this.searchForOverlap(lVertex, junctionInfo.hitPoint);
          if (newHitPoint) {
            junction.position(newHitPoint.x, newHitPoint.y);
          }
        }
      }
    }
    return links;
  }

  private searchForOverlap(lVertex: joint.g.Point[], hitPoint: joint.g.Point): joint.g.Point {
    const a = lVertex[0].bearing(hitPoint);
    const b = lVertex[1].bearing(hitPoint);
    const c = lVertex[2].bearing(hitPoint);
    if (a === b && b != c) {
      return hitPoint.chooseClosest([lVertex[0], lVertex[1]]);
    } else if (b === c && a != c) {
      return hitPoint.chooseClosest([lVertex[1], lVertex[2]]);
    } else if (c === a && a != b) {
      return hitPoint.chooseClosest([lVertex[2], lVertex[0]]);
    } else if (a === b && b === c) {
      // TBD
    }
    return undefined;
  }

  private getLastVertex(link: joint.dia.Link, junction: Node): joint.g.Point {
    const vertices = link.get('vertices');
    var lastVertex = undefined;
    if (vertices.length > 0) {
      lastVertex = vertices[vertices.length - 1];
    } else {
      // port
      // junction
      // element
      // pinning
      if (link.source().id && link.source().id === junction.id) {// source junction position
        if (link.target().x && link.target().y) { // pinning

        } else if (link.target().port) { // port
          //lastVertex = this.getPortPosition(link.target());
        } else if (link.target().id) { // element (JUNCTION!!!)
          console.log('target element');
          console.log(link.getSourceCell);
        }
      } else if (link.target().id && link.target().id === junction.id) {// target junction position
        if (link.source().x && link.source().y) { // pinning

        } else if (link.source().port) { // port
          //lastVertex = this.getPortPosition(link.source());
        } else if (link.source().id) { // element (JUNCTION!!!)
          console.log('source element');
          console.log(link.getSourcePoint());
        }
      }
    }
    return lastVertex;
  }

  private getLinkOrientation(junctionInfo: JunctionInfo): ORIENTATION {
    var start = undefined;
    var stop = undefined;
    if (junctionInfo.preIdxVertices.length){
      start = junctionInfo.preIdxVertices[junctionInfo.preIdxVertices.length-1];
    } else {
      start = this.getPortPosition(junctionInfo.source);
    }
    if (junctionInfo.postIdxVertices.length){
      stop = junctionInfo.postIdxVertices[0];
    } else {
      stop = this.getPortPosition(junctionInfo.target);
    }
    if (start && stop) {
      if (start.x === stop.x) {
        return ORIENTATION.V;
      } else if (start.y === stop.y) {
        return ORIENTATION.H;
      }
    }
    return undefined;
  }

  private getDrawingLinkOrientation(junctionInfo: JunctionInfo): ORIENTATION {
    var start = undefined;
    var stop = undefined;
    if (junctionInfo.preIdxVertices.length){
      start = junctionInfo.preIdxVertices[junctionInfo.preIdxVertices.length-1];
    } else {
      start = this.getPortPosition(junctionInfo.source);
    }

    if (junctionInfo.postIdxVertices.length){
      stop = junctionInfo.postIdxVertices[0];
    } else {
      stop = this.getPortPosition(junctionInfo.target);
    }
    if (start && stop) {
      if (start.x === stop.x) {
        return ORIENTATION.V;
      } else if (start.y === stop.y) {
        return ORIENTATION.H;
      }
    }
    return undefined;
  }

  private getPortPosition(ref: any): joint.g.Point {
    const elem = this.mvc.graph.getCell(ref.id) as joint.dia.Element;
    const portId = elem.getPort(ref.port).id;
    const portGroup = elem.getPort(ref.port).group;
    let portPosition = elem.getPortsPositions(portGroup)[portId];
    let elemPosition = elem.position();
    portPosition.x = portPosition.x + elemPosition.x;
    portPosition.y = portPosition.y + elemPosition.y;
    return new joint.g.Point({
      x: portPosition.x,
      y: portPosition.y
    });
  }*/

}

class ConnectionInfo {
  type: 'none' | 'intersection' | 'port' | 'junction' = 'none';

  start_dist: number;

  end_dist: number;

  orientation: 'none' | 'H' | 'V' = 'none';

  start: joint.g.Point; // ordered with respect to active link orientation

  end: joint.g.Point; // ordered with respect to active link orientation

  node_coord: joint.g.Point;

  link: joint.dia.Link = undefined;

  element: joint.dia.Element;
}

class LinkInfo {
  source: any;

  vertices: joint.g.Point[] = [];

  target: any;

}

class NodeInfo {

  position: joint.g.Point;

}
