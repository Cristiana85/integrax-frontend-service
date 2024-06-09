export interface ModelConfig {

  ver: string; // 00

  cfgName: string; // name of this model

  type: string; // System / Diagram

  class: string; // Model / Shape / Area / Group / Subckt

  model: string; // Device

  isComposite: boolean;

  isParent: boolean;

  isChild: boolean;

  /**
   * per feature parameters
   */
  hover: {
    isHoverable: boolean;
    propagateHoverToParent: boolean;
    propagateHoverToChild: boolean;
    propagateHoverToAllChilds: boolean,
  },

  selection: {
    isSelectable: boolean;
    propagateSelectionToParent: boolean;
    propagateSelectionToChild: boolean;
    propagateSelectionToAllChilds: boolean,
  },

  filters: {
  };

  halo: { // implici and expicit HALO??
    isHaloable: boolean;
    isRubberbandVisible: boolean;
    isSideResizable: boolean;
    isCornerResizable: boolean;
    isRotatable: boolean;
    isProportional: boolean;
    isSnappable: boolean;
    minAngle: number;
    minWidth: number;
    minHeight: number;
  };

  group: {
    isGroupable: boolean;
    isIntoGroup: boolean;
    groupParentId: string;
  };

  area: {
  };

  clipboard: {
  };

  wiring: {
    class: string, // wiring router
    router: string, // rewiring router
    autoscroll: boolean,
    anchor: string,
    padding: number,
    source_marker: string,
    target_marker: string,
  }

}
