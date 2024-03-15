import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {

  @Input() service_class: string | undefined;

  @Input() servicesData: Array<{
    icon: string;
    title: number,
    description: string
  }>;

  constructor() { }

  ngOnInit(): void {
  }

}
