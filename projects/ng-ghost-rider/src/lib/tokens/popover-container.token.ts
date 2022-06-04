import { Inject, Injectable, InjectionToken } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ViewportRuler } from '@angular/cdk/scrolling';

export interface GhostRiderPopoverContainer {
	getBoundingClientRect(): DOMRect;
}

@Injectable({ providedIn: 'root' })
export class GhostRiderRootPopoverContainer implements GhostRiderPopoverContainer {
	private _document: Document;

	constructor(
		@Inject(DOCUMENT) document: any,
		private _viewportRuler: ViewportRuler,
	) {
		this._document = document;
	}

	public getBoundingClientRect(): DOMRect {
		const width = this._document.documentElement.clientWidth;
		const height = this._document.documentElement.clientHeight;
		const scrollPosition = this._viewportRuler.getViewportScrollPosition();

		return {
			top: scrollPosition.top,
			left: scrollPosition.left,
			right: scrollPosition.left + width,
			bottom: scrollPosition.top + height,
			width,
			height,
		} as DOMRect;
	}
}

export const GHOST_RIDER_POPOVER_CONTAINER = new InjectionToken<GhostRiderPopoverContainer>('GhostRiderPopoverContainer');

export const GHOST_RIDER_POPOVER_CONTAINER_FACTORY_PROVIDER = {
	provide: GHOST_RIDER_POPOVER_CONTAINER,
	useExisting: GhostRiderRootPopoverContainer,
};
