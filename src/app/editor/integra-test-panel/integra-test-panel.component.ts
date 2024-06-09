import { Component, ElementRef, ViewChild } from '@angular/core';
import { Selector } from '../components/integra-editor-selector';
import { MVC_STATE } from 'src/app/diagram/core/mv-controller';

@Component({
  selector: 'i-testpanel',
  templateUrl: './integra-test-panel.component.html',
  styleUrls: ['./integra-test-panel.component.scss']
})
export class IntegraTestPanelComponent {

  constructor(private sel: Selector) {
  }

  @ViewChild('container')
  public container: ElementRef;

  posX: number = 0;
  posY: number = 40;

  private drag: boolean = false;
  private dX: number = 0;
  private dY: number = 0;

  down(args: MouseEvent) {
    this.drag = true;
    this.dX = this.posX - args.clientX;
    this.dY = this.posY - args.clientY;
  }

  move(args: MouseEvent) {
    if (this.drag) {
      this.posX = this.dX + args.clientX;
      this.posY = this.dY + args.clientY;
    }
  }

  up(args: MouseEvent) {
    this.drag = false;
  }

  click(args: string) {
    switch (args) {
      case 'Navigating': {
        this.sel.getDiagramFromList('test').mvc.cell_mouseover_listener.stopListening();
        break;
      }
      case 'Panning': {
        this.sel.getDiagramFromList('test').mvc.cell_mouseover_listener.startListening();
        break;
      }
      case 'Copy': {
        this.sel.getDiagramFromList('test').mvc.zoompan.zoomIn();
        break;
      }
      case 'Paste': {
        this.sel.getDiagramFromList('test').mvc.zoompan.zoomOut();
        break;
      }
      case 'Cut': {
        this.sel.getDiagramFromList('test').mvc.zoompan.zoomFit();
        break;
      }
      case 'Import Model': {
        this.sel.getDiagramFromList('test').import();
        break;
      }
      case 'Print Nodes': {
        //this.sel.getDiagramFromList('test').mvc.setState(MVC_STATE.ZOOM);
        this.sel.getDiagramFromList('test').mvc.wiring.avoid_ctrl.router.avoidRouter.outputInstanceToSVG('');
        break;
      }
      case 'Print Connectors': {
        break;
      }
      case 'Rotate': {
        this.sel.getDiagramFromList('test').mvc.zoompan.zoomReset(10);
        break;
      }
      case 'FlipX': {
        break;
      }
      case 'FlipY': {
        break;
      }
      case 'Undo': {
        break;
      }
      case 'Redo': {
        break;
      }
      case 'Delete': {
        this.sel.getDiagramFromList('test').remove();
        break;
      }
    }
  }

}
