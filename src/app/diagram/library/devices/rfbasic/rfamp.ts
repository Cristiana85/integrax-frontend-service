import * as joint from 'jointjs';
import { ModelInterface } from 'src/app/diagram/core/model-interface';
import { LOCK_PORT_SIZE } from 'src/app/diagram/utils/constants';
import { ElementProps } from '../../../core/element-props';
import { DiaHelper } from '../../../utils/diagram-helper';

/**
 * Component body attributes definition
 */
const bodyAttr = {
  '.': {
    magnet: false,
    type: 'device',
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
    width: 2 * LOCK_PORT_SIZE,
    height: 2 * LOCK_PORT_SIZE,
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
      group: 'left',
      magnet: 'active',
      d: 'M -5 0 0 -5 L 5 0 L 0 5 L -5 0 Z',
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
    width: 2 * LOCK_PORT_SIZE,
    height: 2 * LOCK_PORT_SIZE,
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
      group: 'right',
      magnet: 'active',
      d: 'M -5 0 0 -5 L 5 0 L 0 5 L -5 0 Z',
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
  ver: '#000#',
  cfgName: 'std-device',
  nameId: 'rfamp',
  isEnabled: false,
  isSelected: false,
  isHovered: false,
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
export class RfAmp extends joint.dia.Element implements ModelInterface {

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

  /**
   * Used to set properties of the model
   * @param prop
   * @param value
   */
  setModelProp(prop: string, value: string): void {
    var property = DiaHelper.getElemPropertyFromModel(this);
    switch (prop) {
      case 'rotate': {
        break;
      }
      case 'hover': {
        if (!property.isSelected) {
          if (value === 'true') {
            this.attr('hoverBox/display', 'block');
            property.isHovered = true;
          } else if (value === 'false')  {
            this.attr('hoverBox/display', 'none');
            property.isHovered = false;
          }
        }
        break;
      }
      case 'selection': {
        if (value === 'true') {
          this.attr('hoverBox/display', 'none');
          this.attr('selectBox/display', 'block');
          property.isSelected = true;
        } else if (value === 'false')  {
          this.attr('selectBox/display', 'none');
          property.isSelected = false;
        }
        break;
      }
      case 'lock': {
        switch (value) {
          case LeftPort.attrs.portBorder.group: {
            const portId = this.getGroupPorts(LeftPort.attrs.portBorder.group)[0].id;
            this.portProp(portId, 'attrs/portRect/fill', 'blue');
            this.portProp(portId, 'attrs/portBorder/display', 'none');
            break;
          }
          case RightPort.attrs.portBorder.group: {
            const portId = this.getGroupPorts(RightPort.attrs.portBorder.group)[0].id;
            this.portProp(portId, 'attrs/portRect/fill', 'blue');
            this.portProp(portId, 'attrs/portBorder/display', 'none');
            break;
          }
        }
        break;
      }
      case 'unlock': {
        switch (value) {
          case LeftPort.attrs.portBorder.group: {
            const portId = this.getGroupPorts(LeftPort.attrs.portBorder.group)[0].id;
            this.portProp(portId, 'attrs/portRect/fill', 'red');
            this.portProp(portId, 'attrs/portBorder/display', 'block');
            break;
          }
          case RightPort.attrs.portBorder.group: {
            const portId = this.getGroupPorts(RightPort.attrs.portBorder.group)[0].id;
            this.portProp(portId, 'attrs/portRect/fill', 'red');
            this.portProp(portId, 'attrs/portBorder/display', 'block');
            break;
          }
        }
        break;
      }
    }
  }

  /**
   * Useful for Undo Redo Stuff (drag, other)
   * --->> TBD
   *
   * @param prop
   * @param value
   */
  syncModelProp(prop: string, value: string): void {
    //var property = DiagramHelper.getElementModelProp(this);
    switch (prop) {
      case 'rotate': {
        break;
      }
      case 'hover': {
        break;
      }
    }
  }

}
