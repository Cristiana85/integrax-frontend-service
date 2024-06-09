import * as joint from 'jointjs';
import * as jQuery from 'jquery';
import * as _ from 'lodash';
import * as $ from 'backbone';
import { ElementProps } from '../core/element-props';
import { MVController } from '../core/mv-controller';
import { ModelConfig } from '../core/model-config';
import { LinkProps } from '../core/link-props';
import { ModelInterface } from '../core/model-interface';

export class DiaHelper {

  public static transformToSVG(paper: joint.dia.Paper, x: number, y: number): [number, number] {
    var p = paper.svg.createSVGPoint();
    p.x = x;
    p.y = y;
    var p_transformed = p.matrixTransform(paper.viewport.getCTM().inverse());
    return [p_transformed.x, p_transformed.y];
  }

  public static isSystem(mvc: MVController, cellView: joint.dia.CellView): boolean {
    let props = undefined;
    if (cellView.model.isElement()) {
      props = DiaHelper.getElemPropertyFromView(cellView);
    } else if (cellView.model.isElement()) {
      props = DiaHelper.getLinkPropertyFromView(cellView);
    }
    let cfg: ModelConfig = undefined
    if (props) {
      cfg = DiaHelper.getModelConfig(
        mvc,
        props.cfgName
      );
    }
    return cfg ? cfg.type === 'system' : true;
  }

  public static isDiagram(mvc: MVController, cellView: joint.dia.CellView): boolean {
    let props = undefined;
    if (cellView.model.isElement()) {
      props = DiaHelper.getElemPropertyFromView(cellView);
    } else if (cellView.model.isElement()) {
      props = DiaHelper.getLinkPropertyFromView(cellView);
    }
    let cfg: ModelConfig = undefined
    if (props) {
      cfg = DiaHelper.getModelConfig(
        mvc,
        props.cfgName
      );
    }
    return cfg ? cfg.type === 'diagram' : false;
  }

  public static isModel(mvc: MVController, cellView: joint.dia.CellView): boolean {
    let props = undefined;
    if (cellView.model.isElement()) {
      props = DiaHelper.getElemPropertyFromView(cellView);
    } else if (cellView.model.isElement()) {
      props = DiaHelper.getLinkPropertyFromView(cellView);
    }
    let cfg: ModelConfig = undefined
    if (props) {
      cfg = DiaHelper.getModelConfig(
        mvc,
        props.cfgName
      );
    }
    return cfg ? cfg.type === 'diagram' : false;
  }

  public static isShape(mvc: MVController, cellView: joint.dia.CellView): boolean {
    let props = undefined;
    if (cellView.model.isElement()) {
      props = DiaHelper.getElemPropertyFromView(cellView);
    } else if (cellView.model.isElement()) {
      props = DiaHelper.getLinkPropertyFromView(cellView);
    }
    let cfg: ModelConfig = undefined
    if (props) {
      cfg = DiaHelper.getModelConfig(
        mvc,
        props.cfgName
      );
    }
    return cfg ? cfg.cfgName === 'shape' : false;
  }

  public static getConfigFromView(mvc: MVController, cellView: joint.dia.CellView): ModelConfig {
    let props = undefined;
    if (cellView.model.isElement()) {
      props = DiaHelper.getElemPropertyFromView(cellView);
    } else if (cellView.model.isElement()) {
      props = DiaHelper.getLinkPropertyFromView(cellView);
    }
    let cfg: ModelConfig = undefined
    if (props) {
      cfg = DiaHelper.getModelConfig(
        mvc,
        props.cfgName
      );
    }
    return cfg;
  }

  public static getConfigFromModel(mvc: MVController, cell: joint.dia.Cell): ModelConfig {
    let props = undefined;
    if (cell.isElement()) {
      props = DiaHelper.getElemPropertyFromModel(cell);
    } else if (cell.isElement()) {
      props = DiaHelper.getElemPropertyFromModel(cell);
    }
    let cfg: ModelConfig = undefined
    if (props) {
      cfg = DiaHelper.getModelConfig(
        mvc,
        props.cfgName
      );
    }
    return cfg;
  }

  public static getElemPropertyFromModel(cell: joint.dia.Cell): ElementProps {
    return cell.prop('custom/devInfo') as ElementProps;
  }

  public static getElemPropertyFromView(cellView: joint.dia.CellView): ElementProps {
    return cellView.model.prop('custom/devInfo') as ElementProps;
  }

  public static getLinkPropertyFromModel(cell: joint.dia.Cell): LinkProps {
    return cell.prop('custom/devInfo') as LinkProps;
  }

  public static getLinkPropertyFromView(cellView: joint.dia.CellView): LinkProps {
    return cellView.model.prop('custom/devInfo') as LinkProps;
  }

  public static setProp(cellView: joint.dia.CellView, param: string, value: string) {
    (cellView.model as unknown as ModelInterface).setModelProp(
      param,
      value
    );
  }

  public static getProp(cellView: joint.dia.CellView, param: string, value: string): any {
    // TODO
    //return cellView.model.prop('custom/devInfo') as ElementProps;
  }

  private static getModelConfig(mvc: MVController, modelName: string): ModelConfig {
    return mvc.lModelConfig.find(el => el.cfgName === modelName)
  }

}
