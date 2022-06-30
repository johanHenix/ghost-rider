import { InjectionToken } from '@angular/core';
import { GhostRiderRootPopoverContainer } from '../providers/popover-container.service';
export interface GhostRiderPopoverContainer {
    getBoundingClientRect(): DOMRect;
}
export declare const GHOST_RIDER_POPOVER_CONTAINER: InjectionToken<GhostRiderPopoverContainer>;
export declare const GHOST_RIDER_POPOVER_CONTAINER_FACTORY_PROVIDER: {
    provide: InjectionToken<GhostRiderPopoverContainer>;
    useExisting: typeof GhostRiderRootPopoverContainer;
};
