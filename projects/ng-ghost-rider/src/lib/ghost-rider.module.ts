import { PortalModule } from '@angular/cdk/portal';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// Components
import { GhostRiderStepComponent } from './components/ghost-rider-step.component';
import { PopoverComponent } from './components/popover.component';

// Direcctives
import { GhostRiderStepAdvanceDirective } from './directives/ghost-rider-step-advance.directive';
import { GhostRiderStepDirective } from './directives/ghost-rider-step.directive';
import { GhostRiderStepCompleteDirective } from './directives/ghost-rider-step-complete.directive';
import { GhostRiderStepHideDirective } from './directives/ghost-rider-step-hide.directive';
import { GhostRiderStepPreviousDirective } from './directives/ghost-rider-step-previous.directive';

// Providers
import { GHOST_RIDER_POPOVER_POSITION_STRATEGY_FACTORY_PROVIDER } from './providers/popover-position-strategy.service';
import { GHOST_RIDER_OVERLAY_CONTAINER_PROVIDER } from './providers/overlay-container.service';
import { GhostRiderService } from './providers/ghost-rider.service';
import { GHOST_RIDER_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER } from './providers/popover-scroll-strategy.token';
import { GHOST_RIDER_POPOVER_CONTAINER_FACTORY_PROVIDER } from './providers/popover-container.token';
import { GHOST_RIDER_NAVIGATION } from './tokens/ghost-rider-navigation.token';

const DIRECTIVES = [
  GhostRiderStepDirective,
  GhostRiderStepAdvanceDirective,
  GhostRiderStepCompleteDirective,
  GhostRiderStepHideDirective,
  GhostRiderStepPreviousDirective,
];

const COMPONENTS = [
  GhostRiderStepComponent,
  PopoverComponent
];

@NgModule({
  imports: [
    CommonModule,
    PortalModule,
    OverlayModule,
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
    {
      provide: GHOST_RIDER_NAVIGATION,
      useExisting: GhostRiderService,
    },
    GHOST_RIDER_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER,
    GHOST_RIDER_POPOVER_POSITION_STRATEGY_FACTORY_PROVIDER,
    GHOST_RIDER_POPOVER_CONTAINER_FACTORY_PROVIDER,
    GHOST_RIDER_OVERLAY_CONTAINER_PROVIDER,
  ],
})
export class GhostRiderModule { }
