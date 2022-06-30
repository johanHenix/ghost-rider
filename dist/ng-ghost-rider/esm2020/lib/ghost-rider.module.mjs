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
import { GHOST_RIDER_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER } from './tokens/popover-scroll-strategy.token';
import { GHOST_RIDER_POPOVER_CONTAINER_FACTORY_PROVIDER } from './tokens/popover-container.token';
import { GHOST_RIDER_NAVIGATION } from './tokens/ghost-rider-navigation.token';
import * as i0 from "@angular/core";
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
export class GhostRiderModule {
}
GhostRiderModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
GhostRiderModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderModule, declarations: [GhostRiderStepComponent,
        PopoverComponent, GhostRiderStepDirective,
        GhostRiderStepAdvanceDirective,
        GhostRiderStepCompleteDirective,
        GhostRiderStepHideDirective,
        GhostRiderStepPreviousDirective], imports: [CommonModule,
        PortalModule,
        OverlayModule], exports: [GhostRiderStepComponent,
        PopoverComponent, GhostRiderStepDirective,
        GhostRiderStepAdvanceDirective,
        GhostRiderStepCompleteDirective,
        GhostRiderStepHideDirective,
        GhostRiderStepPreviousDirective] });
GhostRiderModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderModule, providers: [
        {
            provide: GHOST_RIDER_NAVIGATION,
            useExisting: GhostRiderService,
        },
        GHOST_RIDER_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER,
        GHOST_RIDER_POPOVER_POSITION_STRATEGY_FACTORY_PROVIDER,
        GHOST_RIDER_POPOVER_CONTAINER_FACTORY_PROVIDER,
        GHOST_RIDER_OVERLAY_CONTAINER_PROVIDER,
    ], imports: [CommonModule,
        PortalModule,
        OverlayModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderModule, decorators: [{
            type: NgModule,
            args: [{
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
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hvc3QtcmlkZXIubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmctZ2hvc3QtcmlkZXIvc3JjL2xpYi9naG9zdC1yaWRlci5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUV6QyxhQUFhO0FBQ2IsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDbEYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFFbEUsY0FBYztBQUNkLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxNQUFNLGlEQUFpRCxDQUFDO0FBQ2pHLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ2xGLE9BQU8sRUFBRSwrQkFBK0IsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ25HLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBQzNGLE9BQU8sRUFBRSwrQkFBK0IsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBRW5HLFlBQVk7QUFDWixPQUFPLEVBQUUsc0RBQXNELEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUN2SCxPQUFPLEVBQUUsc0NBQXNDLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUMvRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUNwRSxPQUFPLEVBQUUsb0RBQW9ELEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUM5RyxPQUFPLEVBQUUsOENBQThDLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUNsRyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQzs7QUFFL0UsTUFBTSxVQUFVLEdBQUc7SUFDakIsdUJBQXVCO0lBQ3ZCLDhCQUE4QjtJQUM5QiwrQkFBK0I7SUFDL0IsMkJBQTJCO0lBQzNCLCtCQUErQjtDQUNoQyxDQUFDO0FBRUYsTUFBTSxVQUFVLEdBQUc7SUFDakIsdUJBQXVCO0lBQ3ZCLGdCQUFnQjtDQUNqQixDQUFDO0FBMkJGLE1BQU0sT0FBTyxnQkFBZ0I7OzZHQUFoQixnQkFBZ0I7OEdBQWhCLGdCQUFnQixpQkE3QjNCLHVCQUF1QjtRQUN2QixnQkFBZ0IsRUFUaEIsdUJBQXVCO1FBQ3ZCLDhCQUE4QjtRQUM5QiwrQkFBK0I7UUFDL0IsMkJBQTJCO1FBQzNCLCtCQUErQixhQVU3QixZQUFZO1FBQ1osWUFBWTtRQUNaLGFBQWEsYUFSZix1QkFBdUI7UUFDdkIsZ0JBQWdCLEVBVGhCLHVCQUF1QjtRQUN2Qiw4QkFBOEI7UUFDOUIsK0JBQStCO1FBQy9CLDJCQUEyQjtRQUMzQiwrQkFBK0I7OEdBaUNwQixnQkFBZ0IsYUFYaEI7UUFDVDtZQUNFLE9BQU8sRUFBRSxzQkFBc0I7WUFDL0IsV0FBVyxFQUFFLGlCQUFpQjtTQUMvQjtRQUNELG9EQUFvRDtRQUNwRCxzREFBc0Q7UUFDdEQsOENBQThDO1FBQzlDLHNDQUFzQztLQUN2QyxZQXJCQyxZQUFZO1FBQ1osWUFBWTtRQUNaLGFBQWE7MkZBcUJKLGdCQUFnQjtrQkF6QjVCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFO3dCQUNQLFlBQVk7d0JBQ1osWUFBWTt3QkFDWixhQUFhO3FCQUNkO29CQUNELFlBQVksRUFBRTt3QkFDWixHQUFHLFVBQVU7d0JBQ2IsR0FBRyxVQUFVO3FCQUNkO29CQUNELE9BQU8sRUFBRTt3QkFDUCxHQUFHLFVBQVU7d0JBQ2IsR0FBRyxVQUFVO3FCQUNkO29CQUNELFNBQVMsRUFBRTt3QkFDVDs0QkFDRSxPQUFPLEVBQUUsc0JBQXNCOzRCQUMvQixXQUFXLEVBQUUsaUJBQWlCO3lCQUMvQjt3QkFDRCxvREFBb0Q7d0JBQ3BELHNEQUFzRDt3QkFDdEQsOENBQThDO3dCQUM5QyxzQ0FBc0M7cUJBQ3ZDO2lCQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUG9ydGFsTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQgeyBPdmVybGF5TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCB7IEdob3N0UmlkZXJTdGVwQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL2dob3N0LXJpZGVyLXN0ZXAuY29tcG9uZW50JztcbmltcG9ydCB7IFBvcG92ZXJDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudHMvcG9wb3Zlci5jb21wb25lbnQnO1xuXG4vLyBEaXJlY2N0aXZlc1xuaW1wb3J0IHsgR2hvc3RSaWRlclN0ZXBBZHZhbmNlRGlyZWN0aXZlIH0gZnJvbSAnLi9kaXJlY3RpdmVzL2dob3N0LXJpZGVyLXN0ZXAtYWR2YW5jZS5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgR2hvc3RSaWRlclN0ZXBEaXJlY3RpdmUgfSBmcm9tICcuL2RpcmVjdGl2ZXMvZ2hvc3QtcmlkZXItc3RlcC5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgR2hvc3RSaWRlclN0ZXBDb21wbGV0ZURpcmVjdGl2ZSB9IGZyb20gJy4vZGlyZWN0aXZlcy9naG9zdC1yaWRlci1zdGVwLWNvbXBsZXRlLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBHaG9zdFJpZGVyU3RlcEhpZGVEaXJlY3RpdmUgfSBmcm9tICcuL2RpcmVjdGl2ZXMvZ2hvc3QtcmlkZXItc3RlcC1oaWRlLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBHaG9zdFJpZGVyU3RlcFByZXZpb3VzRGlyZWN0aXZlIH0gZnJvbSAnLi9kaXJlY3RpdmVzL2dob3N0LXJpZGVyLXN0ZXAtcHJldmlvdXMuZGlyZWN0aXZlJztcblxuLy8gUHJvdmlkZXJzXG5pbXBvcnQgeyBHSE9TVF9SSURFUl9QT1BPVkVSX1BPU0lUSU9OX1NUUkFURUdZX0ZBQ1RPUllfUFJPVklERVIgfSBmcm9tICcuL3Byb3ZpZGVycy9wb3BvdmVyLXBvc2l0aW9uLXN0cmF0ZWd5LnNlcnZpY2UnO1xuaW1wb3J0IHsgR0hPU1RfUklERVJfT1ZFUkxBWV9DT05UQUlORVJfUFJPVklERVIgfSBmcm9tICcuL3Byb3ZpZGVycy9vdmVybGF5LWNvbnRhaW5lci5zZXJ2aWNlJztcbmltcG9ydCB7IEdob3N0UmlkZXJTZXJ2aWNlIH0gZnJvbSAnLi9wcm92aWRlcnMvZ2hvc3QtcmlkZXIuc2VydmljZSc7XG5pbXBvcnQgeyBHSE9TVF9SSURFUl9QT1BPVkVSX1NDUk9MTF9TVFJBVEVHWV9GQUNUT1JZX1BST1ZJREVSIH0gZnJvbSAnLi90b2tlbnMvcG9wb3Zlci1zY3JvbGwtc3RyYXRlZ3kudG9rZW4nO1xuaW1wb3J0IHsgR0hPU1RfUklERVJfUE9QT1ZFUl9DT05UQUlORVJfRkFDVE9SWV9QUk9WSURFUiB9IGZyb20gJy4vdG9rZW5zL3BvcG92ZXItY29udGFpbmVyLnRva2VuJztcbmltcG9ydCB7IEdIT1NUX1JJREVSX05BVklHQVRJT04gfSBmcm9tICcuL3Rva2Vucy9naG9zdC1yaWRlci1uYXZpZ2F0aW9uLnRva2VuJztcblxuY29uc3QgRElSRUNUSVZFUyA9IFtcbiAgR2hvc3RSaWRlclN0ZXBEaXJlY3RpdmUsXG4gIEdob3N0UmlkZXJTdGVwQWR2YW5jZURpcmVjdGl2ZSxcbiAgR2hvc3RSaWRlclN0ZXBDb21wbGV0ZURpcmVjdGl2ZSxcbiAgR2hvc3RSaWRlclN0ZXBIaWRlRGlyZWN0aXZlLFxuICBHaG9zdFJpZGVyU3RlcFByZXZpb3VzRGlyZWN0aXZlLFxuXTtcblxuY29uc3QgQ09NUE9ORU5UUyA9IFtcbiAgR2hvc3RSaWRlclN0ZXBDb21wb25lbnQsXG4gIFBvcG92ZXJDb21wb25lbnRcbl07XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBDb21tb25Nb2R1bGUsXG4gICAgUG9ydGFsTW9kdWxlLFxuICAgIE92ZXJsYXlNb2R1bGUsXG4gIF0sXG4gIGRlY2xhcmF0aW9uczogW1xuICAgIC4uLkNPTVBPTkVOVFMsXG4gICAgLi4uRElSRUNUSVZFU1xuICBdLFxuICBleHBvcnRzOiBbXG4gICAgLi4uQ09NUE9ORU5UUyxcbiAgICAuLi5ESVJFQ1RJVkVTLFxuICBdLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBHSE9TVF9SSURFUl9OQVZJR0FUSU9OLFxuICAgICAgdXNlRXhpc3Rpbmc6IEdob3N0UmlkZXJTZXJ2aWNlLFxuICAgIH0sXG4gICAgR0hPU1RfUklERVJfUE9QT1ZFUl9TQ1JPTExfU1RSQVRFR1lfRkFDVE9SWV9QUk9WSURFUixcbiAgICBHSE9TVF9SSURFUl9QT1BPVkVSX1BPU0lUSU9OX1NUUkFURUdZX0ZBQ1RPUllfUFJPVklERVIsXG4gICAgR0hPU1RfUklERVJfUE9QT1ZFUl9DT05UQUlORVJfRkFDVE9SWV9QUk9WSURFUixcbiAgICBHSE9TVF9SSURFUl9PVkVSTEFZX0NPTlRBSU5FUl9QUk9WSURFUixcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgR2hvc3RSaWRlck1vZHVsZSB7IH1cbiJdfQ==