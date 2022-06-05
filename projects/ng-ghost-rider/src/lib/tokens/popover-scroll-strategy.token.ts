import { InjectionToken } from '@angular/core';
import { Overlay, ScrollStrategy } from '@angular/cdk/overlay';

/** Time in ms to throttle repositioning after scroll events. */
export const SCROLL_THROTTLE_MS = 20;

/** Injection token that determines the scroll handling while a popover is visible. */
export const GHOST_RIDER_POPOVER_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
	'GhostRiderPopoverScrollStrategy'
);

/** @docs-private */
export function GHOST_RIDER_POPOVER_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy {
	return () => overlay.scrollStrategies.reposition(
		{
			scrollThrottle: SCROLL_THROTTLE_MS
		}
	);
}

/** @docs-private */
export const GHOST_RIDER_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER = {
	provide: GHOST_RIDER_POPOVER_SCROLL_STRATEGY,
	deps: [Overlay],
	useFactory: GHOST_RIDER_POPOVER_SCROLL_STRATEGY_FACTORY,
};
