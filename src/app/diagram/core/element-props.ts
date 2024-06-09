export interface ElementProps {

  ver: string;

  cfgName: string;

  nameId: string;

  isEnabled: boolean;

  isSelected: boolean;

  isHovered: boolean;

  device: {
    lib: string;
    modelName: string;
    modelPrefix: string;
    nPort: number;
  };

  symbol: {
    name: string;
    nNodes: number;
  };

  property: {
    items?: ModelVariable[];
  };
}

export interface ModelVariable {
  name: string,
  valueType: string,
  value: string,
  unit: string,
  hide: boolean,
  description: string,
  style: string,
}


