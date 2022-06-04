/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Adapter from @angular/material "MatTooltip"
import {
	ConstructorProvider,
	Directive,
	ElementRef,
	Inject,
	InjectionToken,
	NgZone,
	OnDestroy,
	OnInit,
	Optional,
	Type,
	ViewContainerRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HAMMER_LOADER, HammerLoader } from '@angular/platform-browser';
import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import {
	ConnectedPosition,
	HorizontalConnectionPos,
	OriginConnectionPosition,
	Overlay,
	OverlayConnectionPosition,
	OverlayRef,
	ScrollStrategy,
	VerticalConnectionPos,
} from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { ScrollDispatcher } from '@angular/cdk/scrolling';

import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { PopoverComponent } from '../components/popover.component';

import { GHOST_RIDER_POPOVER_SCROLL_STRATEGY } from '../tokens/popover-scroll-strategy.token';
import { GhostRiderPopoverContainer, GHOST_RIDER_POPOVER_CONTAINER } from '../tokens/popover-container.token';
import {
	PopoverPositionStrategy,
	PopoverPositionStrategyFactory,
	GHOST_RIDER_POPOVER_POSITION_STRATEGY,
} from '../providers/popover-position-strategy.service';

export type PopoverPosition = 'left' | 'right' | 'above' | 'below' | 'before' | 'after';
export type PopoverNubbinPosition = 'start' | 'center' | 'end' | 'auto' | 'none';

/** CSS class that will be attached to the overlay panel. */
export const POPOVER_PANEL_CLASS = 'ghost-rider-popover-container';

export type PopoverContent<T> = T extends string ? string : ComponentPortal<T> | TemplatePortal<T>;

/**
 * Creates an error to be thrown if the user supplied an invalid popover position.
 * @docs-private
 */
export function getPopoverInvalidPositionError(position: string) {
	return Error(`Popover position "${position}" is invalid.`);
}

/** Default `Popover` options that can be overridden. */
export interface PopoverDefaultOptions {
	showDelay: number;
	hideDelay: number;
	touchendHideDelay: number;
	position?: PopoverPosition;
}

/** Injection token to be used to override the default options for `Popover`. */
export const GHOST_RIDER_POPOVER_DEFAULT_OPTIONS = new InjectionToken<PopoverDefaultOptions>(
	'PopoverDefaultOptions',
	{ providedIn: 'root', factory: GHOST_RIDER_POPOVER_DEFAULT_OPTIONS_FACTORY },
);

/** @docs-private */
export function GHOST_RIDER_POPOVER_DEFAULT_OPTIONS_FACTORY(): PopoverDefaultOptions {
	return {
		showDelay: 0,
		hideDelay: 0,
		touchendHideDelay: 1500,
	};
}

interface PopoverNubbinOffsets {
	perpendicular: number;
	parallel: number;
}

@Directive()
export class Popover<T = any> implements OnInit, OnDestroy {
	public _overlayRef: OverlayRef | null;
	private _popoverInstance: PopoverComponent | null;

	protected _portal: ComponentPortal<PopoverComponent>;
	protected _position: PopoverPosition = 'below';
	protected _nubbinPosition: PopoverNubbinPosition = 'none';
	protected _disabled: boolean = false;
	protected _scrollStrategy: () => ScrollStrategy;
	protected _positionStrategy: PopoverPositionStrategyFactory;
	public isTooltip: boolean;
	public popoverType: Type<PopoverComponent> = PopoverComponent;

	public get popoverInstance(): PopoverComponent | null { return this._popoverInstance; }

	/** Allows the user to define the position of the popover relative to the parent element */
	get position(): PopoverPosition { return this._position; }
	set position(value: PopoverPosition) {
		if (value !== this._position) {
			this._position = value;

			if (this._overlayRef) {
				this._updatePosition();

				if (this._popoverInstance) {
					this._popoverInstance.show(0);
				}

				this._overlayRef.updatePosition();
			}
		}
	}

	/** Allows the user to define the nubbin position of the popover relative to the parent element */
	get nubbinPosition(): PopoverNubbinPosition { return this._nubbinPosition; }
	set nubbinPosition(value: PopoverNubbinPosition) {
		if (value !== this._nubbinPosition) {
			this._nubbinPosition = value;

			if (this._overlayRef) {
				this._updatePosition();

				if (this._popoverInstance) {
					this._popoverInstance.show(0);
				}

				this._overlayRef.updatePosition();
			}
		}
	}

	/** Disables the display of the popover. */
	get disabled(): boolean { return this._disabled; }
	set disabled(value) {
		this._disabled = coerceBooleanProperty(value);

		// If popover is disabled, hide immediately.
		if (this._disabled) {
			this.hide(0);
		}
	}

	/** The default delay in ms before showing the popover after show is called */
	showDelay = this._defaultOptions.showDelay;

	/** The default delay in ms before hiding the popover after hide is called */
	hideDelay = this._defaultOptions.hideDelay;

	protected _content!: PopoverContent<T>;

	/** The message to be displayed in the popover */
	get content(): PopoverContent<T> { return this._content; }
	set content(value: PopoverContent<T>) {
		if (typeof this._content === 'string') {
			this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this._content);
		}

		this._content = value;

		if (!this._content && this.isPopoverVisible()) {
			this.hide(0);
		} else {
			this._updateContent();
			if (typeof this._content === 'string') {
				this._ngZone.runOutsideAngular(() => {
					// The `AriaDescriber` has some functionality that avoids adding a description if it's the
					// same as the `aria-label` of an element, however we can't know whether the popover trigger
					// has a data-bound `aria-label` or when it'll be set for the first time. We can avoid the
					// issue by deferring the description by a tick so Angular has time to set the `aria-label`.
					Promise.resolve().then(() => {
						this._ariaDescriber.describe(this._elementRef.nativeElement, this._content as string);
					});
				});
			}
		}
	}

	protected _manualListeners = new Map<string, EventListenerOrEventListenerObject>();

	/** Emits when the component is destroyed. */
	protected readonly _destroyed = new Subject<void>();

	protected _document: Document;

	constructor(
		protected _overlay: Overlay,
		protected _elementRef: ElementRef<HTMLElement>,
		protected _scrollDispatcher: ScrollDispatcher,
		protected _viewContainerRef: ViewContainerRef,
		protected _ngZone: NgZone,
		platform: Platform,
		protected _ariaDescriber: AriaDescriber,
		protected _focusMonitor: FocusMonitor,
		@Inject(DOCUMENT) document: any,
		@Inject(GHOST_RIDER_POPOVER_SCROLL_STRATEGY) scrollStrategy: any,
		@Inject(GHOST_RIDER_POPOVER_POSITION_STRATEGY) positionStrategy: any,
		@Inject(GHOST_RIDER_POPOVER_CONTAINER) private _container: GhostRiderPopoverContainer,
		@Optional() protected _dir: Directionality,
		@Optional() @Inject(GHOST_RIDER_POPOVER_DEFAULT_OPTIONS)
		protected _defaultOptions: PopoverDefaultOptions,
		@Optional() @Inject(HAMMER_LOADER) hammerLoader?: HammerLoader,
	) {
		this._document = document;
		this._scrollStrategy = scrollStrategy;
		this._positionStrategy = positionStrategy;
		this._bindEvents(platform, hammerLoader as HammerLoader);

		if (_defaultOptions && _defaultOptions.position) {
			this.position = _defaultOptions.position;
		}
	}

	/**
	 * Setup styling-specific things
	 */
	ngOnInit() {
		const element = this._elementRef.nativeElement;
		const elementStyle = element.style as CSSStyleDeclaration & { webkitUserDrag: string };

		if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
			// When we bind a gesture event on an element (in this case `longpress`), HammerJS
			// will add some inline styles by default, including `user-select: none`. This is
			// problematic on iOS and in Safari, because it will prevent users from typing in inputs.
			// Since `user-select: none` is not needed for the `longpress` event and can cause unexpected
			// behavior for text fields, we always clear the `user-select` to avoid such issues.

			// elementStyle.webkitUserSelect = elementStyle.userSelect = elementStyle.msUserSelect = '';
			elementStyle.webkitUserSelect = elementStyle.userSelect;
		}

		// Hammer applies `-webkit-user-drag: none` on all elements by default,
		// which breaks the native drag&drop. If the consumer explicitly made
		// the element draggable, clear the `-webkit-user-drag`.
		if (element.draggable && elementStyle.webkitUserDrag === 'none') {
			elementStyle.webkitUserDrag = '';
		}
	}

	/**
	 * Dispose the popover when destroyed.
	 */
	ngOnDestroy() {
		if (this._overlayRef) {
			this._overlayRef.dispose();
			this._popoverInstance = null;
		}

		// Clean up the event listeners set in the constructor
		this._manualListeners.forEach((listener, event) => {
			this._elementRef.nativeElement.removeEventListener(event, listener);
		});
		this._manualListeners.clear();

		this._destroyed.next();
		this._destroyed.complete();

		if (typeof this.content === 'string') {
			this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this.content);
		}
		this._focusMonitor.stopMonitoring(this._elementRef);
	}

	/** Shows the popover after the delay in ms, defaults to popover-delay-show or 0ms if no input */
	public show(delay: number = this.showDelay): void {
		if (this.disabled || !this.content || (this.isPopoverVisible() && !this._popoverInstance?.hasTimeout)) {
			return;
		}

		const overlayRef = this._createOverlay();

		this._detach();
		this._portal = this._portal || new ComponentPortal(this.popoverType, this._viewContainerRef);
		this._popoverInstance = overlayRef.attach(this._portal).instance;
		this._popoverInstance.isTooltip = this.isTooltip;
		this._popoverInstance.afterHidden()
			.pipe(takeUntil(this._destroyed))
			.subscribe(() => this._detach());
		this._updateContent();
		this._popoverInstance.show(delay);
	}

	/** Hides the popover after the delay in ms, defaults to popover-delay-hide or 0ms if no input */
	public hide(delay: number = this.hideDelay): void {
		if (this._popoverInstance) {
			this._popoverInstance.hide(delay);
		}
	}

	/** Shows/hides the popover */
	public toggle(): void {
		this.isPopoverVisible() ? this.hide() : this.show();
	}

	/** Returns true if the popover is currently visible to the user */
	public isPopoverVisible(): boolean {
		return !!this._popoverInstance && this._popoverInstance.isVisible();
	}

	/** Handles the keydown events on the host element. */
	public handleKeydown(e: KeyboardEvent) {
		if (this.isPopoverVisible() && e.keyCode === ESCAPE && !hasModifierKey(e)) {
			e.preventDefault();
			e.stopPropagation();
			this.hide(0);
		}
	}

	/** Handles the touchend events on the host element. */
	public handleTouchend() {
		this.hide(this._defaultOptions.touchendHideDelay);
	}

	/** Create the overlay config and position strategy */
	protected _createOverlay(): OverlayRef {
		if (this._overlayRef) {
			return this._overlayRef;
		}

		const scrollableAncestors =
			this._scrollDispatcher.getAncestorScrollContainers(this._elementRef);

		// Create connected position strategy that listens for scroll events to reposition.
		const strategy = this._positionStrategy(this._elementRef)
			.withContainer(this._container)
			.withScrollableContainers(scrollableAncestors);

		strategy.positionChanges.pipe(takeUntil(this._destroyed)).subscribe((change) => {
			if (this._popoverInstance) {
				if (change.scrollableViewProperties.isOverlayClipped && this._popoverInstance.isVisible()) {
					// After position changes occur and the overlay is clipped by
					// a parent scrollable then close the popover.
					this._ngZone.run(() => this.hide(0));
				} else if (this._nubbinPosition !== 'none') {
					// TODO: Check tooltip position to see if nubbin exceeds bounds of origin (hide if so)
					if (change.connectionPair !== this._popoverInstance.position) {
						this._ngZone.run(() => this._popoverInstance!.position = change.connectionPair);
					}
				}
			}
		});

		const hasBackdrop: boolean = this.popoverType !== PopoverComponent;

		this._overlayRef = this._overlay.create({
			direction: this._dir,
			positionStrategy: strategy,
			panelClass: POPOVER_PANEL_CLASS,
			scrollStrategy: this._scrollStrategy(),
			hasBackdrop,
			backdropClass: ['ghost-rider-backdrop', 'ghost-rider-backdrop_open'],
		});

		this._updatePosition();

		this._overlayRef.detachments()
			.pipe(takeUntil(this._destroyed))
			.subscribe(() => this._detach());

		return this._overlayRef;
	}

	/** Detaches the currently-attached popover. */
	protected _detach() {
		if (this._overlayRef && this._overlayRef.hasAttached()) {
			this._overlayRef.detach();
		}

		this._popoverInstance = null;
	}

	/** Updates the position of the current popover. */
	protected _updatePosition() {
		let nubbinOffsets: PopoverNubbinOffsets;

		if (this._nubbinPosition === 'none') {
			nubbinOffsets = { perpendicular: 0, parallel: 0 };
		} else {
			const REM: number = parseFloat(getComputedStyle(this._document.documentElement).fontSize);
			nubbinOffsets = { perpendicular: REM * 0.875, parallel: REM * 1.5 };
		}

		const positions: ConnectedPosition[] = buildConnectedPositions(
			this._getOrigin(),
			this._getOverlayPosition(),
			this._nubbinPosition,
			nubbinOffsets,
		);

		(this._overlayRef!.getConfig().positionStrategy as PopoverPositionStrategy).withPositions(positions);
	}

	/** Forces tooltip position to be recalculated. Necessary for manually triggered tooltip instances */
	public updateOverlayPosition(): void {
		if (this._overlayRef) {
			this._overlayRef.updatePosition();
		}
	}

	/**
	 * Returns the origin position and a fallback position based on the user's position preference.
	 * The fallback position is the inverse of the origin (e.g. `'below' -> 'above'`).
	 */
	protected _getOrigin(): ConnectionPositions<OriginConnectionPosition> {
		const isLtr = !this._dir || this._dir.value === 'ltr';
		const position = this.position;
		let originPosition: OriginConnectionPosition;

		if (position === 'above' || position === 'below') {
			originPosition = { originX: 'center', originY: position === 'above' ? 'top' : 'bottom' };
		} else if (
			position === 'before' ||
			(position === 'left' && isLtr) ||
			(position === 'right' && !isLtr)) {
			originPosition = { originX: 'start', originY: 'center' };
		} else if (
			position === 'after' ||
			(position === 'right' && isLtr) ||
			(position === 'left' && !isLtr)) {
			originPosition = { originX: 'end', originY: 'center' };
		} else {
			throw getPopoverInvalidPositionError(position);
		}

		const { x, y } = this._invertPosition(originPosition.originX, originPosition.originY);

		return {
			main: originPosition,
			fallback: { originX: x, originY: y },
		};
	}

	/** Returns the overlay position and a fallback position based on the user's preference */
	protected _getOverlayPosition(): ConnectionPositions<OverlayConnectionPosition> {
		const isLtr = !this._dir || this._dir.value === 'ltr';
		const position = this.position;
		let overlayPosition: OverlayConnectionPosition;

		if (position === 'above') {
			overlayPosition = { overlayX: 'center', overlayY: 'bottom' };
		} else if (position === 'below') {
			overlayPosition = { overlayX: 'center', overlayY: 'top' };
		} else if (
			position === 'before' ||
			(position === 'left' && isLtr) ||
			(position === 'right' && !isLtr)) {
			overlayPosition = { overlayX: 'end', overlayY: 'center' };
		} else if (
			position === 'after' ||
			(position === 'right' && isLtr) ||
			(position === 'left' && !isLtr)) {
			overlayPosition = { overlayX: 'start', overlayY: 'center' };
		} else {
			throw getPopoverInvalidPositionError(position);
		}

		const { x, y } = this._invertPosition(overlayPosition.overlayX, overlayPosition.overlayY);

		return {
			main: overlayPosition,
			fallback: { overlayX: x, overlayY: y },
		};
	}

	/** Updates the popover message and repositions the overlay according to the new message length */
	protected _updateContent() {
		// Must wait for the message to be painted to the popover so that the overlay can properly
		// calculate the correct positioning based on the size of the text.
		if (this._popoverInstance) {
			this._popoverInstance.content = this.content;
			this._popoverInstance.markForCheck();

			this._ngZone.onMicrotaskEmpty.asObservable().pipe(
				take(1),
				takeUntil(this._destroyed),
			).subscribe(() => {
				if (this._popoverInstance) {
					this._overlayRef!.updatePosition();
				}
			});
		}
	}

	/** Inverts an overlay position. */
	private _invertPosition(x: HorizontalConnectionPos, y: VerticalConnectionPos) {
		if (this.position === 'above' || this.position === 'below') {
			if (y === 'top') {
				y = 'bottom';
			} else if (y === 'bottom') {
				y = 'top';
			}
		} else {
			if (x === 'end') {
				x = 'start';
			} else if (x === 'start') {
				x = 'end';
			}
		}

		return { x, y };
	}

	// tslint:disable-next-line:no-empty
	protected _bindEvents(platform: Platform, hammerLoader: HammerLoader): void { }
}

// Can this be retrieved from compiled code???
export const GHOST_RIDER_POPOVER_STATIC_PROVIDER: ConstructorProvider = {
	provide: Popover,
	deps: [
		Overlay,
		ElementRef,
		ScrollDispatcher,
		ViewContainerRef,
		NgZone,
		Platform,
		AriaDescriber,
		FocusMonitor,
		DOCUMENT,
		GHOST_RIDER_POPOVER_SCROLL_STRATEGY,
		GHOST_RIDER_POPOVER_POSITION_STRATEGY,
		GHOST_RIDER_POPOVER_CONTAINER,
		[new Optional(), Directionality],
		[new Optional(), GHOST_RIDER_POPOVER_DEFAULT_OPTIONS],
		[new Optional(), HAMMER_LOADER],
	],
};

export interface ConnectionPositions<T extends OverlayConnectionPosition | OriginConnectionPosition> {
	main: T;
	fallback: T;
}

function buildConnectedPositions(
	origin: ConnectionPositions<OriginConnectionPosition>,
	overlay: ConnectionPositions<OverlayConnectionPosition>,
	nubbinPosition: PopoverNubbinPosition,
	offsets: PopoverNubbinOffsets,
): ConnectedPosition[] {
	const main: ConnectedPosition = { ...origin.main, ...overlay.main };
	const fallback: ConnectedPosition = { ...origin.fallback, ...overlay.fallback };

	const positions: ConnectedPosition[] = [
		...buildPositionsForNubbin(main, nubbinPosition),
		...buildPositionsForNubbin(fallback, nubbinPosition),
	];

	// Add offsets for each position so that tooltip nubbin is pointing towards origin point
	positions.forEach((position) => {
		if (position.originY !== 'center') { // Top/Bottom
			position.offsetY = offsets.perpendicular * POPOVER_NUBBIN_OFFSET_MULTIPLIERS[position.originY];

			if (position.overlayX !== 'center') {
				position.offsetX = offsets.parallel * POPOVER_NUBBIN_OFFSET_MULTIPLIERS[position.overlayX];
			}
		} else if (position.originX !== 'center') { // Left/Right
			position.offsetX = offsets.perpendicular * POPOVER_NUBBIN_OFFSET_MULTIPLIERS[position.originX];

			if (position.overlayY !== 'center') {
				position.offsetY = offsets.parallel * POPOVER_NUBBIN_OFFSET_MULTIPLIERS[position.overlayY];
			}
		}
	});

	return positions;
}

const POPOVER_NUBBIN_OFFSET_MULTIPLIERS = {
	top: -1,
	bottom: 1,
	start: -1,
	end: 1,
};

// Builds additional positions for "start"/"end" nubbins
// I.E. bottom -> [ bottom-left, bottom-right ]
function buildPositionsForNubbin(
	position: ConnectedPosition,
	nubbinPosition: PopoverNubbinPosition,
): ConnectedPosition[] {
	if (nubbinPosition === 'none') {
		return [position];
	}
	if (position.originX === 'center') { // Top/Bottom
		if (nubbinPosition === 'auto') {
			return [
				position,
				{ ...position, overlayX: 'start' },
				{ ...position, overlayX: 'end' },
			];
		} else {
			return [
				{ ...position, overlayX: nubbinPosition },
			];
		}
	} else { // Left/Right
		if (nubbinPosition === 'auto') {
			return [
				position,
				{ ...position, overlayY: 'bottom' },
				{ ...position, overlayY: 'top' },
			];
		} else {
			return [
				{ ...position, overlayY: nubbinPosition === 'start' ? 'top' : 'bottom' },
			];
		}
	}
}
