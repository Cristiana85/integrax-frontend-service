import * as joint from 'jointjs';
import * as jQuery from 'jquery';
import * as _ from 'lodash';
import * as $ from 'backbone';
import { ElementProps } from '../../core/element-props';
import { ModelInterface } from '../../core/model-interface';
import { LinkProps } from '../../core/link-props';
import { DiaHelper } from '../../utils/diagram-helper';

const attrs = {
  '.': {
    type: 'wire',
  },
  line: {
    connection: true,
  },
  highlight: {
    connection: true,
  },
  wrapper: {
    connection: true,
  },
};

const markup = [
  {
    tagName: 'path',
    selector: 'wrapper',
    attributes: {
      fill: 'none',
      cursor: 'default',
      stroke: 'transparent',
      'stroke-width': '10',
      'pointer-events': 'none',
    },
  },
  {
    tagName: 'path',
    selector: 'line',
    attributes: {
      fill: 'none',
      'pointer-events': 'none',
    },
  },
  {
    tagName: 'path',
    selector: 'highlight',
    attributes: {
      fill: 'none',
      cursor: 'default',
      'pointer-events': 'none',
      'display': 'none'
    },
  },
];

const style = {
  drawing: {
    width: 1,
    dasharray: '5,2.5',
    color: 'black',
    join: 'round',
    opacity: '1',
  },
  drawn: {
    width: 2,
    dasharray: '',
    color: 'red',
    join: 'round',
    opacity: '1',
  },
  normal: {
    width: 2,
    dasharray: '',
    color: 'black',
    join: 'round',
    opacity: '1',
  },
  hover: {
    width: 5,
    dasharray: '20, 4',
    color: 'black',
    join: 'round',
    opacity: '0.4',
  },
  select: {
    width: 6,
    dasharray: '',
    color: 'black',
    join: 'round',
    opacity: '0.5',
  },
};

/**
 * Component custom device info definition
 */
var devInfo: LinkProps = {
  ver: '#000#',
  cfgName: 'std-link',
  model: 'wire',
  isEnabled: true,
  isSelected: false,
  isHovered: false,
  router: {
    state: 'wiring',
    routerName: 'TBD',
    orientation: undefined,
    padding: 0,
    endMarker: 'TBD',
    sourceMarker: 'TBD',
  }
};

export class WiringLink extends joint.shapes.standard.Link implements ModelInterface {

  override defaults() {
    return {
      ...super.defaults,
      type: 'xtoollib.Connector.WiringLink',
      attrs: attrs,
    };
  }

  override preinitialize(): void {
    this.markup = markup;
  }

  override initialize(...args: any[]) {
    super.initialize(...args);
    // add default props
    var custom = {
      custom: {
        devInfo
      }
    };
    this.prop(custom);
    this.setModelProp('style', 'normal');
  }

  setModelProp(prop: string, value: string): void {
    var property = DiaHelper.getLinkPropertyFromModel(this);
    switch (prop) {
      case 'style': {
        switch (value) {
          case 'normal': {
            this.attr('wrapper/pointer-events', 'auto');
            this.setLineAttributes(style.normal);
            this.attr('line/class', 'shape-correction');
            //this.attr('line/vector-effect', 'non-scaling-stroke');
            break;
          }
          case 'drawing': {
            this.setLineAttributes(style.drawing);
            this.attr('wrapper/pointer-events', 'none');
            this.attr('line/class', 'shape-correction');
            this.attr('line/vector-effect', 'non-scaling-stroke');
            break;
          }
          case 'drawn': {
            this.setLineAttributes(style.drawn);
            this.attr('wrapper/pointer-events', 'none');
            this.attr('line/class', 'shape-correction');
            this.attr('line/vector-effect', 'non-scaling-stroke');
            break;
          }
        }
        break;
      }
      case 'hover': {
        if (!property.isSelected) {
          if (value === 'true') {
            this.setHighlightAttributes(style.hover);
            this.attr('highlight/display', 'block');
            property.isHovered = true;
          } else if (value === 'false')  {
            this.attr('highlight/display', 'none');
            property.isHovered = false;
          }
        }
        break;
      }
      case 'selection': {
        if (value === 'true') {
          this.setHighlightAttributes(style.select);
          this.attr('highlight/display', 'block');
          property.isSelected = true;
        } else if (value === 'false')  {
          this.attr('highlight/display', 'none');
          property.isSelected = false;
        }
        break;
      }
      case 'lockport': {
        break;
      }
    }
  }

  syncModelProp(prop: string, value: string): void {
  }

  private setLineAttributes(data: any) {
    this.attr('line/stroke', data.color);
    this.attr('line/strokeLinejoin', data.join);
    this.attr('line/stroke-width', data.width);
    this.attr('line/stroke-dasharray', data.dasharray);
    this.attr('line/opacity', data.opacity);
  }

  private setHighlightAttributes(data: any) {
    this.attr('highlight/stroke', data.color);
    this.attr('highlight/strokeLinejoin', data.join);
    this.attr('highlight/stroke-width', data.width);
    this.attr('highlight/stroke-dasharray', data.dasharray);
    this.attr('highlight/opacity', data.opacity);
  }

}
