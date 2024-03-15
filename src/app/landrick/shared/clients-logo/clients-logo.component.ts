import { Component, OnInit, Input } from '@angular/core';

interface client {
  image: string;
};

@Component({
  selector: 'app-clients-logo',
  templateUrl: './clients-logo.component.html',
  styleUrls: ['./clients-logo.component.css']
})
export class ClientsLogoComponent implements OnInit {

  @Input() brand_class: string | undefined;
  /**
   * Clients Logo
   */
   clients_logo: client[] = [
    {
      image: "assets/bootstrap/images/client/amazon.svg"
    },
    {
      image: "assets/bootstrap/images/client/google.svg"
    },
    {
      image: "assets/bootstrap/images/client/lenovo.svg"
    },
    {
      image: "assets/bootstrap/images/client/paypal.svg"
    },
    {
      image: "assets/bootstrap/images/client/shopify.svg"
    },
    {
      image: "assets/bootstrap/images/client/spotify.svg"
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
