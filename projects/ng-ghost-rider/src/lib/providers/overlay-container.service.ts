import { Inject, Injectable, ExistingProvider } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';

/**
 * Extends this class so we can add classes to our popover.
 * If this doesn't work, we should think of another solution
 */
@Injectable({ providedIn: 'root' })
export class GhostRiderOverlayContainer extends OverlayContainer {
	constructor(
		@Inject(DOCUMENT) document: any,
		platform: Platform,
	) {
		super(document, platform);
	}

	/**
	 * calls 'super()'
	 * adds class to the the element that hosts the the step popover
	 */
	protected _createContainer(): void {
		super._createContainer();
		this._containerElement.classList.add('ghost-rider'); // TODO: Make configurable
	}
}

export const GHOST_RIDER_OVERLAY_CONTAINER_PROVIDER: ExistingProvider = {
	provide: OverlayContainer,
	useExisting: GhostRiderOverlayContainer,
};
