import { InjectionToken } from '@angular/core';
import { GhostRiderRootPopoverContainer } from '../providers/popover-container.service';

export interface GhostRiderPopoverContainer {
	getBoundingClientRect(): DOMRect;
}

export const GHOST_RIDER_POPOVER_CONTAINER = new InjectionToken<GhostRiderPopoverContainer>('GhostRiderPopoverContainer');

export const GHOST_RIDER_POPOVER_CONTAINER_FACTORY_PROVIDER = {
	provide: GHOST_RIDER_POPOVER_CONTAINER,
	useExisting: GhostRiderRootPopoverContainer,
};
