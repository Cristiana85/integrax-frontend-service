export interface LinkProps {

  ver: string; // 00

  cfgName: string;

  model: string; // TBD --> Wire / shape / image / Area / Note

  isEnabled: boolean;

  isSelected: boolean;

  isHovered: boolean;

  router: {
    state: string; // wiring / wired
    routerName: string;
    orientation: string;
    padding: number;
    endMarker: string;
    sourceMarker: string;
  };
}

