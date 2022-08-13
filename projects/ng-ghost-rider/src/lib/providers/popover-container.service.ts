import { ViewportRuler } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import { Injectable, Inject } from '@angular/core';
import { GhostRiderPopoverContainer } from '../tokens/popover-container.token';

@Injectable({ providedIn: 'root' })
export class GhostRiderRootPopoverContainer implements GhostRiderPopoverContainer {
	private _document: Document;

	constructor(
		@Inject(DOCUMENT) document: any,
		private _viewportRuler: ViewportRuler,
	) {
		this._document = document;
	}

	/**
	 * [ Implement me... ]
	 */
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
