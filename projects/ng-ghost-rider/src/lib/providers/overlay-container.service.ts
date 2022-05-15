import { Inject, Injectable, ExistingProvider } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';

@Injectable({ providedIn: 'root' })
export class GhostRiderOverlayContainer extends OverlayContainer {
	constructor(
		@Inject(DOCUMENT) document: any,
		platform: Platform,
	) {
		super(document, platform);
	}

	protected _createContainer(): void {
		super._createContainer();
		this._containerElement.classList.add('ghost-rider'); // TODO: Make configurable
	}
}

export const GHOST_RIDER_OVERLAY_CONTAINER_PROVIDER: ExistingProvider = {
	provide: OverlayContainer,
	useExisting: GhostRiderOverlayContainer,
};
