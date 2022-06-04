import { InjectionToken } from '@angular/core';
import { GhostRiderTourGuide } from '../helpers/ghost-rider-tour-guide';
import { GhostRiderEventSource } from '../models/ghost-rider-step-event.model';

export interface GhostRiderNavigation {
	tourGuide: GhostRiderTourGuide;
	next(source?: GhostRiderEventSource): void;
	back(source?: GhostRiderEventSource): void;
	close(source?: GhostRiderEventSource): void;
	goToParent(source?: GhostRiderEventSource): void;
	nextSubStep(source?: GhostRiderEventSource): void;
	previousSubStep(source?: GhostRiderEventSource): void;
	complete(source?: GhostRiderEventSource): void;
	hideStep(): void;
}

export const GHOST_RIDER_NAVIGATION = new InjectionToken<GhostRiderNavigation>(
	'GhostRiderNavigation'
);
