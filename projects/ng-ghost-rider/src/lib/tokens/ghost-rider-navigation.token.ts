import { InjectionToken } from '@angular/core';
import { GhostRiderNavigation } from '../models/ghost-rider-navigation.model';

export const GHOST_RIDER_NAVIGATION = new InjectionToken<GhostRiderNavigation>(
	'GhostRiderNavigation',
);
