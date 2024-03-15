import { Component, OnInit, TemplateRef } from '@angular/core';
import {NgbOffcanvas} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-switcher',
  templateUrl: './switcher.component.html',
  styleUrls: ['./switcher.component.css']
})

/**
 * Switcher component
 */
export class SwitcherComponent implements OnInit {

  // set variable
  isVisible: boolean;

  constructor(private offcanvasService: NgbOffcanvas) { }

  ngOnInit(): void {
    // assign value
    this.isVisible = false;
  }

  /**
   * Set dark theme
   */
  setDark() {
    document.getElementById('theme-opt').setAttribute('href', './assets/css/style-dark.min.css');
  }

  /**
   * Set light theme
   */
  setLight() {
    (document.querySelector('.t-rtl-dark') as HTMLElement).style.display = "none";
    (document.querySelector('.t-rtl-light') as HTMLElement).style.display = "inline-block";    
    document.querySelector('.theme-opt').setAttribute('href', './assets/css/bootstrap-rtl.min.css');

  }

  /**
   * Set dark-rtl theme
   */
  darkRtl() {
    document.documentElement.dir = "rtl";
    (document.querySelector('.t-rtl-dark') as HTMLElement).style.display = "none";
    (document.querySelector('.t-ltr-dark') as HTMLElement).style.display = "inline-block";    
    document.querySelector('.theme-opt').setAttribute('href', './assets/css/bootstrap-dark-rtl.min.css');
    document.querySelector('.theme-opt-style').setAttribute('href', './assets/css/style-dark-rtl.min.css');
  }
  /**
   * Set dark-light theme
   */
  darkLtr() {   
    (document.querySelector('.t-dark') as HTMLElement).style.display = "none";
    (document.querySelector('.t-light') as HTMLElement).style.display = "inline-block";
    (document.querySelector('.t-rtl-dark') as HTMLElement).style.display = "inline-block";
    (document.querySelector('.t-rtl-light') as HTMLElement).style.display = "none";
    (document.querySelector('.t-ltr-dark') as HTMLElement).style.display = "none";    
    document.querySelector('.theme-opt').setAttribute('href', './assets/css/bootstrap-dark.min.css');
    document.querySelector('.theme-opt-style').setAttribute('href', './assets/css/style-dark.min.css');
    document.documentElement.dir = "ltr";
  }

  /**
   * Set dark-light theme
   */
  lightLtr() {  
    (document.querySelector('.t-dark') as HTMLElement).style.display = "inline-block";
    (document.querySelector('.t-light') as HTMLElement).style.display = "none";
    (document.querySelector('.t-rtl-dark') as HTMLElement).style.display = "none";
    (document.querySelector('.t-rtl-light') as HTMLElement).style.display = "inline-block";
    (document.querySelector('.t-ltr-dark') as HTMLElement).style.display = "none";  
    document.querySelector('.theme-opt').setAttribute('href', './assets/css/bootstrap.min.css');
    document.querySelector('.theme-opt-style').setAttribute('href', './assets/css/style.min.css');
    document.documentElement.dir = "ltr";
  }
  /**
   * Set rtl theme
   */
  setRtl() {
    document.documentElement.dir = "rtl";
    (document.querySelector('.t-rtl-light') as HTMLElement).style.display = "none";
    (document.querySelector('.t-ltr-light') as HTMLElement).style.display = "inline-block";    
    document.querySelector('.theme-opt').setAttribute('href', './assets/css/bootstrap-rtl.min.css');
    document.querySelector('.theme-opt-style').setAttribute('href', './assets/css/style-rtl.min.css');
  }
  /**
   * Set light theme
   */
  setLtr() {
    document.documentElement.dir = "ltr";
    (document.querySelector('.t-ltr-light') as HTMLElement).style.display = "none";
    (document.querySelector('.t-rtl-light') as HTMLElement).style.display = "inline-block";    
    document.querySelector('.theme-opt').setAttribute('href', './assets/css/bootstrap.min.css');
    document.querySelector('.theme-opt-style').setAttribute('href', './assets/css/style.min.css');
  }

  /**
   * Toggle switcher
   */
  onChangeSwitch() {
    this.isVisible = !this.isVisible;
  }


  // Demo Offcanvas
  openLeft(content: TemplateRef<any>) {    
    this.offcanvasService.open(content, { position: 'start' });
  }

}
