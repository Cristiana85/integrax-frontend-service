import { Component } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-corporate-pricing',
  templateUrl: './corporate-pricing.component.html',
  styleUrls: ['./corporate-pricing.component.css']
})
export class CorporatePricingComponent {
  // Set Topbar
  //Menuoption = 'corporate'
  Menuoption = 'center';

  /***
   * Header button list show
   */
  Settingicon = true;
  footerVariant = 'footer-five';
  navClass = "nav-light";

  /**
 * Clients Slider
 */
  customOptions: OwlOptions = {
    // loop: true,
    mouseDrag: true,
    touchDrag: false,
    pullDrag: false,
    // autoplay: true,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      600: {
        items: 2
      },
      900: {
        items: 3
      }
    },
    nav: false
  };
}
