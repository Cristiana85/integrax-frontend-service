import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ScrollspyDirective } from './scrollspy.directive';

import { BlogComponent } from './blog/blog.component';
import { ClientsLogoComponent } from './clients-logo/clients-logo.component';
import { ComponentSidebarComponent } from './component-sidebar/component-sidebar.component';
import { CustomerTestmonialComponent } from './customer-testmonial/customer-testmonial.component';
import { FeaturesComponent } from './features/features.component';
import { MemberComponent } from './member/member.component';
import { ReviewTestmonialComponent } from './review-testmonial/review-testmonial.component';
import { ServicesComponent } from './services/services.component';
import { SimplePricingComponent } from './simple-pricing/simple-pricing.component';
import { TestimonialComponent } from './testimonial/testimonial.component';

@NgModule({
  declarations: [
    ScrollspyDirective,
    TestimonialComponent,
    ClientsLogoComponent,
    ServicesComponent,
    FeaturesComponent,
    BlogComponent,
    CustomerTestmonialComponent,
    ReviewTestmonialComponent,
    SimplePricingComponent,
    MemberComponent,
    ComponentSidebarComponent,
  ],
  imports: [
    CommonModule,
    //CarouselModule,
    //FeatherModule,
    RouterModule,
  ],
  exports: [TestimonialComponent,
    ScrollspyDirective,
    ClientsLogoComponent,
    ServicesComponent,
    FeaturesComponent,
    BlogComponent,
    CustomerTestmonialComponent,
    ReviewTestmonialComponent,
    SimplePricingComponent,
    MemberComponent,
    ComponentSidebarComponent
  ]
})

export class SharedModule { }
