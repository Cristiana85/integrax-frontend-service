import * as joint from 'jointjs';
import { RfAmp } from './devices/rfbasic/rfamp';
import { MVController } from '../core/mv-controller';

export class LibraryManager {

  private mvc: MVController;

  private graph: joint.dia.Graph;

  private paper: joint.dia.Paper;

  constructor(
    mvc: MVController,
    paper: joint.dia.Paper,
    graph: joint.dia.Graph
  ) {
    this.mvc = mvc;
    this.paper = paper;
    this.graph = graph;
  }

  /**
   * Responsible to create composite elements
   */
  public createElement(lib: string, cell: string) {
    switch (lib) {
      case 'RfBasic': {
        this.createFromRFBasic(cell);
        break;
      }
      case '': {
        break;
      }
    }
  }

  private createFromRFBasic(cell: string) {
    switch (cell) {
      case 'RfAmp': {
        const el_rfamp = new RfAmp();
        el_rfamp.translate(200, 100);
        //el_rfamp.embed(el_rfamp_label);
        //el_rfamp.embed(el_rfamp_label1);
        el_rfamp.addTo(this.graph);
        //el_rfamp_label.addTo(this.graph);
        //el_rfamp_label1.addTo(this.graph);
        break;
      }
      case '': {
        break;
      }
    }

  }


}
