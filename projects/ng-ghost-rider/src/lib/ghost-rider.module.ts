import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GhostRiderStepComponent } from './components/ghost-rider-step.component';
import { GhostRiderStepAdvanceDirective } from './directives/ghost-rider-step-advance.directive';
import { GhostRiderStepDirective } from './directives/ghost-rider-step.directive';
import { GhostRiderBackdropService } from './providers/ghost-rider-backdrop.service';

const DIRECTIVES = [
  GhostRiderStepDirective,
  GhostRiderStepAdvanceDirective,
];

const COMPONENTS = [
  GhostRiderStepComponent,
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
  ],
  providers: [
    GhostRiderBackdropService
  ],
})
export class GhostRiderModule { }
