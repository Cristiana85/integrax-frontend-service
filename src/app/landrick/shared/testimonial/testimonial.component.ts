import { Component, OnInit, Input } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-testimonial',
  templateUrl: './testimonial.component.html',
  styleUrls: ['./testimonial.component.css']
})
export class TestimonialComponent implements OnInit {

  @Input() testimonialData: Array<{
    profile: string;
    message: number,
    name: string,
    designation: string
  }>;

  /***
   * Client Owl Slider
   */
  customOptions: OwlOptions = {
    // loop: true,
    mouseDrag: true,
    touchDrag: false,
    pullDrag: false,
    // autoplay: true,
    margin: 15,
    navSpeed: 200,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      600: {
        items: 1
      },
      900: {
        items: 3
      }
    },
    nav: false
  };

  constructor() { }

  ngOnInit(): void {
  }

}
