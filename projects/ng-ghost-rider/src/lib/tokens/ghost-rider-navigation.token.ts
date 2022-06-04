import { InjectionToken } from '@angular/core';
import { GhostRiderNavigation } from 'dist/ng-ghost-rider/lib/providers/ghost-rider-navigation.token';

export const GHOST_RIDER_NAVIGATION = new InjectionToken<GhostRiderNavigation>(
	'GhostRiderNavigation'
);
