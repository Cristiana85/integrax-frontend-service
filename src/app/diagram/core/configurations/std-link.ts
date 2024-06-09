import { ModelConfig } from '../model-config';

export class StdLink implements ModelConfig {

  ver = '#000#';

  cfgName = 'std-link';

  type = 'diagram';

  class = 'model';

  model = 'wire';

  isComposite = false;

  isParent = false;

  isChild = false;

  hover = {
    isHoverable: true,
    propagateHoverToParent: false,
    propagateHoverToChild: false,
    propagateHoverToAllChilds: false,
  };

  selection = {
    isSelectable: true,
    propagateSelectionToParent: false,
    propagateSelectionToChild: false,
    propagateSelectionToAllChilds: false,
  };

  filters = {};

  halo = {
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
  };

  group = {
    isGroupable: false,
    isIntoGroup: false,
    groupParentId: '',
  };

  area = {};

  clipboard = {};

  wiring = {
    class: 'std-hybrid',
    //router: 'std-hybrid:rewiring',
    //router: 'orthogonal',
    //router: 'rightAngle',
    router: 'manhattan',
    autoscroll: false,
    anchor: 'center',
    padding: 0,
    source_marker: 'none',
    target_marker: 'none',
  };

}
