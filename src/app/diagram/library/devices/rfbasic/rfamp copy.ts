import joint = require('jointjs');
import { ElementProps, ElementMethod } from '../../../core/element-props';
import { RfAmpLabel } from './rf_amp/rfamp-label';

/**
 * Component body attributes definition
 */
const bodyAttr = {
  '.': {
    magnet: false
  },
  hitBox: {
    x: 'calc(x + 5)',
    y: 'calc(y)',
    width: 'calc(w - 10)',
    height: 'calc(h)',
    rx: 0,
    ry: 0,
    strokeWidth: 0,
    cursor: 'move',
    opacity: 0,
    fill: 'transparent',
  },
  hoverBox: {
    width: 'calc(w)',
    height: 'calc(h)',
    rx: 0,
    ry: 0,
    strokeWidth: 1,
    stroke: 'blue',
    fill: 'transparent',
    strokeDasharray: '5,2.5',
    strokeDashoffset: 1.25,
    display: 'none',
    'class': "shape-correction",
    'vector-effect': 'non-scaling-stroke',
    'pointer-events': 'none',
  },
  selectBox: {
    width: 'calc(w)',
    height: 'calc(h)',
    rx: 0,
    ry: 0,
    strokeWidth: 4,
    opacity: 0.5,
    stroke: '#333333',
    fill: 'transparent',
    display: 'none',
    'pointer-events': 'none',
  },
  pathSrc : {
    width: 'calc(w)',
    height: 'calc(h)',
    fill: 'transparent',
    stroke: 'blue',
    cursor: 'move',
    'stroke-width': 1.5,
    'stroke-linejoin': 'bevel',
    d: '',
  },
};

/**
 * Component body markup definition
 */
const bodyMarkup = [
  {
    tagName: 'rect',
    selector: 'hitBox',
  },
  {
    tagName: 'rect',
    selector: 'hoverBox',
  },
  {
    tagName: 'rect',
    selector: 'selectBox',
  },
  {
    tagName: 'path',
    selector: 'pathSrc',
  },
];

/**
 * Component left port definition
 */
const LeftPort = {
  position: {
    name: 'left', // manual
    args: {
      y: 'calc(0.5 * h)'
    }
  },
  size: {
    width: 5,
    height: 5,
  },
  label: {
    position: {
        name: 'top',
    },
    markup: [{
        tagName: 'text',
        selector: 'label'
    }]
  },
  attrs: {
    portRect: {
      width: 'calc(w)',
      height: 'calc(h)',
      x: 'calc(-0.5 * w)',
      y: 'calc(-0.5 * h)', // offset with respect to position
      fill: 'red',
      stroke: 'red',
      strokeWidth: 0,
      'stroke-linejoin': "round",
      'class': "shape-correction",
      'pointer-events': 'none',
      display: 'block',
    },
    portBorder: {
      direction: 'left',
      magnet: 'active',
      d: 'M -5 0 0 -5, L 5 0, L 0 5, L -5 0, Z',
      stroke: 'red',
      fill: 'transparent',
      strokeWidth: 0.5,
      'stroke-linejoin': "round",
      'class': "shape-correction",
      cursor: 'crosshair',
      display: 'block',
    },
    label: {
      text: 'P1',
      display: 'none',
    }
  },
  markup: [
    {
      tagName: 'rect',
      selector: 'portRect',
    },
    {
      tagName: 'path',
      selector: 'portBorder',
    },
  ],
}

/**
 * Component right port definition
 */
const RightPort = {
  position: {
    name: 'right', // manual
    args: {
      y: 'calc(0.5 * h)'
    }
  },
  size: {
    width: 5,
    height: 5,
  },
  label: {
    position: {
        name: 'top',
    },
    markup: [{
        tagName: 'text',
        selector: 'label'
    }]
  },
  attrs: {
    portRect: {
      width: 'calc(w)',
      height: 'calc(h)',
      x: 'calc(-0.5 * w)',
      y: 'calc(-0.5 * h)', // offset with respect to position
      fill: 'red',
      stroke: 'red',
      strokeWidth: 0,
      'stroke-linejoin': "round",
      'class': "shape-correction",
      'pointer-events': 'none',
      display: 'block',
    },
    portBorder: {
      direction: 'right',
      magnet: 'active',
      d: 'M -5 0 0 -5, L 5 0, L 0 5, L -5 0, Z',
      stroke: 'red',
      fill: 'transparent',
      strokeWidth: 0.5,
      cursor: 'crosshair',
      'stroke-linejoin': "round",
      'class': "shape-correction",
      display: 'block',
    },
    label: {
      text: 'P2',
      display: 'none',
    }
  },
  markup: [
    {
      tagName: 'rect',
      selector: 'portRect',
    },
    {
      tagName: 'path',
      selector: 'portBorder',
    },
  ],
}

/**
 * Component custom device info definition
 */
var devInfo: ElementProps = {
  ver: '#001#',
  cfgName: '',
  type: 'diagram',
  category: 'model',
  isComposite: false,
  isParent: false,
  isChild: false,
  isEnabled: true, // not used yet
  isFreezable: false, // not used yet
  hover: {
    isHoverable: true,
    isHovered: false,
    propagateHoverToParent: false,
    propagateHoverToChild: false,
    propagateHoverToAllChilds: false,
  },
  selection: {
    isSelectable: true,
    isSelected: false,
    propagateSelectionToParent: true,
    propagateSelectionToChild: true,
    propagateSelectionToAllChilds: true,
  },
  halo: {
    isHaloable: true,
    isRubberbandVisible: true,
    isSideResizable: false,
    isCornerResizable: false,
    isRotatable: true,
    isProportional: true,
    isSnappable: true,
    minAngle: 90,
    minWidth: 25,
    minHeight: 25,
  },
  group: {
    isGroupable: false,
    isIntoGroup: false,
    groupParentId: '',
  },
  wiring: {
    class: 'hybrid',
    autoscroll: false,
    anchor: 'center',
    padding: 0,
    source_marker: 'none',
    target_marker: 'none',
  },
  device: {
    lib: 'lumped',
    modelName: 'cap',
    modelPrefix: 'C',
    nPort: 2,
  },
  symbol: {
    name: 'res',
    nNodes: 2,
  },
  property: {
    items: [
      {
        name: 'ID',
        valueType: 'string',
        value: '',
        unit: 'none',
        hide: false,
        description: 'none',
        style: 'font-family:verdana',
      },
      {
        name: 'GAIN',
        valueType: 'number',
        value: '10',
        unit: 'dB',
        hide: false,
        description: 'Capacitance',
        style: 'font-family:verdana',
      },
      {
        name: 'P1dB',
        valueType: 'number',
        value: '10',
        unit: 'dBm',
        hide: false,
        description: 'Capacitance',
        style: 'font-family:verdana',
      },
      {
        name: 'IP3',
        valueType: 'number',
        value: '',
        unit: 'dBm',
        hide: false,
        description: 'Capacitance',
        style: 'font-family:verdana',
      },
    ],
  },
};

/**
 * Component JJ object definition
 */
export class RfAmp extends joint.dia.Element implements ElementMethod {

  override defaults() {
    return {
      ...super.defaults,
      type: 'xtoollib.RfBasic.RfAmp',
      size: {
        width: 100,
        height: 20,
      },
      ports: {
        groups: {
          'left': LeftPort,
          'right': RightPort,
        }
      },
      attrs: bodyAttr,
    };
  }

  override preinitialize(): void {
    this.markup = bodyMarkup;
  }

  override initialize(...args: any[]) {
    super.initialize(...args);
    // add default ports
    this.addPorts([
      {
        group: 'left',
      },
      {
        group: 'right',
      },
    ]);
    // add default props
    var custom = {
      custom: {
        devInfo
      }
    };
    this.prop(custom);
    this.attr('pathSrc/refD', 'M0 15 l25 0 l2.5 -5 l5 10 l5 -10 l5 10 l5 -10 l5 10 l2.5 -5 l25 0');
  }

  public hover(opt: boolean): void {
    if (!(this.prop('custom/devInfo') as ElementProps).selection.isSelected) {
      if (opt) {
        (this.prop('custom/devInfo') as ElementProps).hover.isHovered = true;
        this.attr('hoverBox/display', 'block');
      } else {
        (this.prop('custom/devInfo') as ElementProps).hover.isHovered = false;
        this.attr('hoverBox/display', 'none');
      }
    }
  }

  public select(opt: boolean): void {
    if (opt) {
      (this.prop('custom/devInfo') as ElementProps).selection.isSelected = true;
      this.attr('selectBox/display', 'block');
    } else {
      (this.prop('custom/devInfo') as ElementProps).selection.isSelected = false;
      this.attr('selectBox/display', 'none');
    }
  }


  public lockPort(portId: number, opt: boolean): void {
    if (opt) {
      this.portProp(this.getPorts()[1].id, 'attrs/portBorder/display', 'none');
      this.portProp(this.getPorts()[1].id, 'attrs/portRect/fill', 'blue');
    } else {

    }
  }
}
