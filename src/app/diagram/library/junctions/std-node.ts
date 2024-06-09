import * as joint from 'jointjs';

/**
 * Component body attributes definition
 */
const bodyAttr = {
  '.': {
    magnet: false,
    type: 'node',
  },
  junction: {
    r: 'calc(w)',
    width: 'calc(w)',
    height: 'calc(h)',
    x: 'calc(-0.5 * w)',
    y: 'calc(-0.5 * h)',
    strokeWidth: 1,
    stroke: 'black',
    fill: 'white',
    'pointer-events': 'none',
  },
};

/**
 * Component body markup definition
 */
const bodyMarkup = [
  {
    tagName: 'rect',
    selector: 'junction',
  },
];

var port = {
  position: {
  },
  attrs: {
      portBody: {
          magnet: false,
          width: 10,
          height: 10,
          x: -10, y: -7.5
      },
  },
  markup: [{
      tagName: 'rect',
      selector: 'portBody'
  }]
};

/**
 * Component JJ object definition
 */
export class Node extends joint.dia.Element {

  override defaults() {
    return {
      ...super.defaults,
      type: 'xtoollib.RfBasic.Junction',
      size: {
        width: 10,
        height: 10,
      },
      /*ports: {
        items: [ port ] // add a port in constructor
      },*/
      attrs: bodyAttr,
    };
  }

  override preinitialize(): void {
    this.markup = bodyMarkup;
  }

  override initialize(...args: any[]) {
    super.initialize(...args);
  }

}
