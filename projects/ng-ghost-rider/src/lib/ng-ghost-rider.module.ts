import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PortalModule } from '@angular/cdk/portal';
import { NgGhostRiderComponent } from './ng-ghost-rider.component';
import { GhostRiderStepDirective } from './directives/ghost-rider-step.directive';

const DIRECTIVES = [
  GhostRiderStepDirective,
];

const COMPONENTS = [
  NgGhostRiderComponent,
];

@NgModule({
  imports: [
    CommonModule,
    PortalModule,
  ],
  declarations: [
    ...COMPONENTS,
    ...DIRECTIVES
  ],
  exports: [
    ...COMPONENTS,
    ...DIRECTIVES,
  ]
})
export class NgGhostRiderModule { }
