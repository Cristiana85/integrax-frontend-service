/**
 * Diagram settings
 */
export class DiagramSettings {
  public static BACKGRAOUND_COLOR: string = '#F3F7F6';
  public static BORDER_STYLE: string = 'solid';
  public static BORDER_COLOR: string = '#E5E5E5';
  public static BORDER_WIDTH: string = '0px';
}

export class ZoomPanSettings {
  public static ALLOW_ZOOM: boolean = true;
  public static ALLOW_PAN: boolean = true;
  public static CUSTOM_ZOOM: boolean = false;
  public static CUSTOM_PAN: boolean = false;
  public static ZOOM_MIN_EXTENT: number = 0.05;
  public static ZOOM_MAX_EXTENT: number = 10;
  public static ZOOM_FACTOR: number = 500;
  public static ZOOM_WITH_CTRL: boolean = false;
  public static PAN_DEFAULT_CURSOR: string = 'grab';
  public static PAN_MOVE_CURSOR: string = 'grabbing';
}

/**
 * GridLine settings
 */
export class GridLine {
  public static GRID_DRAWING: [{}] = [{color: 'blue'}];
  public static GRID_SIZE: number = 10;
}
