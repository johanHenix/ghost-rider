/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Adapter from @angular/material "MatTooltip"
import { Directive, ElementRef, Inject, InjectionToken, NgZone, Optional, ViewContainerRef, } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HAMMER_LOADER } from '@angular/platform-browser';
import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { Overlay, } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { ComponentPortal } from '@angular/cdk/portal';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { PopoverComponent } from '../components/popover.component';
import { GHOST_RIDER_POPOVER_SCROLL_STRATEGY } from '../tokens/popover-scroll-strategy.token';
import { GHOST_RIDER_POPOVER_CONTAINER } from '../tokens/popover-container.token';
import { GHOST_RIDER_POPOVER_POSITION_STRATEGY, } from '../providers/popover-position-strategy.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
import * as i2 from "@angular/cdk/scrolling";
import * as i3 from "@angular/cdk/platform";
import * as i4 from "@angular/cdk/a11y";
import * as i5 from "@angular/cdk/bidi";
/** CSS class that will be attached to the overlay panel. */
export const POPOVER_PANEL_CLASS = 'ghost-rider-popover-container';
/**
 * Creates an error to be thrown if the user supplied an invalid popover position.
 * @docs-private
 */
export function getPopoverInvalidPositionError(position) {
    return Error(`Popover position "${position}" is invalid.`);
}
/** Injection token to be used to override the default options for `Popover`. */
export const GHOST_RIDER_POPOVER_DEFAULT_OPTIONS = new InjectionToken('PopoverDefaultOptions', { providedIn: 'root', factory: GHOST_RIDER_POPOVER_DEFAULT_OPTIONS_FACTORY });
/** @docs-private */
export function GHOST_RIDER_POPOVER_DEFAULT_OPTIONS_FACTORY() {
    return {
        showDelay: 0,
        hideDelay: 0,
        touchendHideDelay: 1500,
    };
}
export class Popover {
    constructor(_overlay, _elementRef, _scrollDispatcher, _viewContainerRef, _ngZone, platform, _ariaDescriber, _focusMonitor, document, scrollStrategy, positionStrategy, _container, _dir, _defaultOptions, hammerLoader) {
        this._overlay = _overlay;
        this._elementRef = _elementRef;
        this._scrollDispatcher = _scrollDispatcher;
        this._viewContainerRef = _viewContainerRef;
        this._ngZone = _ngZone;
        this._ariaDescriber = _ariaDescriber;
        this._focusMonitor = _focusMonitor;
        this._container = _container;
        this._dir = _dir;
        this._defaultOptions = _defaultOptions;
        this._position = 'below';
        this._nubbinPosition = 'none';
        this._disabled = false;
        this.popoverType = PopoverComponent;
        /** The default delay in ms before showing the popover after show is called */
        this.showDelay = this._defaultOptions.showDelay;
        /** The default delay in ms before hiding the popover after hide is called */
        this.hideDelay = this._defaultOptions.hideDelay;
        this._manualListeners = new Map();
        /** Emits when the component is destroyed. */
        this._destroyed = new Subject();
        this._document = document;
        this._scrollStrategy = scrollStrategy;
        this._positionStrategy = positionStrategy;
        this._bindEvents(platform, hammerLoader);
        if (_defaultOptions && _defaultOptions.position) {
            this.position = _defaultOptions.position;
        }
    }
    get popoverInstance() { return this._popoverInstance; }
    /** Allows the user to define the position of the popover relative to the parent element */
    get position() { return this._position; }
    set position(value) {
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
    get nubbinPosition() { return this._nubbinPosition; }
    set nubbinPosition(value) {
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
    get disabled() { return this._disabled; }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
        // If popover is disabled, hide immediately.
        if (this._disabled) {
            this.hide(0);
        }
    }
    /** The message to be displayed in the popover */
    get content() { return this._content; }
    set content(value) {
        if (typeof this._content === 'string') {
            this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this._content);
        }
        this._content = value;
        if (!this._content && this.isPopoverVisible()) {
            this.hide(0);
        }
        else {
            this._updateContent();
            if (typeof this._content === 'string') {
                this._ngZone.runOutsideAngular(() => {
                    // The `AriaDescriber` has some functionality that avoids adding a description if it's the
                    // same as the `aria-label` of an element, however we can't know whether the popover trigger
                    // has a data-bound `aria-label` or when it'll be set for the first time. We can avoid the
                    // issue by deferring the description by a tick so Angular has time to set the `aria-label`.
                    Promise.resolve().then(() => {
                        this._ariaDescriber.describe(this._elementRef.nativeElement, this._content);
                    });
                });
            }
        }
    }
    /**
     * Setup styling-specific things
     */
    ngOnInit() {
        const element = this._elementRef.nativeElement;
        const elementStyle = element.style;
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
    show(delay = this.showDelay) {
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
    hide(delay = this.hideDelay) {
        if (this._popoverInstance) {
            this._popoverInstance.hide(delay);
        }
    }
    /** Shows/hides the popover */
    toggle() {
        this.isPopoverVisible() ? this.hide() : this.show();
    }
    /** Returns true if the popover is currently visible to the user */
    isPopoverVisible() {
        return !!this._popoverInstance && this._popoverInstance.isVisible();
    }
    /** Handles the keydown events on the host element. */
    handleKeydown(e) {
        if (this.isPopoverVisible() && e.keyCode === ESCAPE && !hasModifierKey(e)) {
            e.preventDefault();
            e.stopPropagation();
            this.hide(0);
        }
    }
    /** Handles the touchend events on the host element. */
    handleTouchend() {
        this.hide(this._defaultOptions.touchendHideDelay);
    }
    /** Create the overlay config and position strategy */
    _createOverlay() {
        if (this._overlayRef) {
            return this._overlayRef;
        }
        const scrollableAncestors = this._scrollDispatcher.getAncestorScrollContainers(this._elementRef);
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
                }
                else if (this._nubbinPosition !== 'none') {
                    // TODO: Check tooltip position to see if nubbin exceeds bounds of origin (hide if so)
                    if (change.connectionPair !== this._popoverInstance.position) {
                        this._ngZone.run(() => this._popoverInstance.position = change.connectionPair);
                    }
                }
            }
        });
        const hasBackdrop = this.popoverType !== PopoverComponent;
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
    _detach() {
        if (this._overlayRef && this._overlayRef.hasAttached()) {
            this._overlayRef.detach();
        }
        this._popoverInstance = null;
    }
    /** Updates the position of the current popover. */
    _updatePosition() {
        let nubbinOffsets;
        if (this._nubbinPosition === 'none') {
            nubbinOffsets = { perpendicular: 0, parallel: 0 };
        }
        else {
            const REM = parseFloat(getComputedStyle(this._document.documentElement).fontSize);
            nubbinOffsets = { perpendicular: REM * 0.875, parallel: REM * 1.5 };
        }
        const positions = buildConnectedPositions(this._getOrigin(), this._getOverlayPosition(), this._nubbinPosition, nubbinOffsets);
        this._overlayRef.getConfig().positionStrategy.withPositions(positions);
    }
    /** Forces tooltip position to be recalculated. Necessary for manually triggered tooltip instances */
    updateOverlayPosition() {
        if (this._overlayRef) {
            this._overlayRef.updatePosition();
        }
    }
    /**
     * Returns the origin position and a fallback position based on the user's position preference.
     * The fallback position is the inverse of the origin (e.g. `'below' -> 'above'`).
     */
    _getOrigin() {
        const isLtr = !this._dir || this._dir.value === 'ltr';
        const position = this.position;
        let originPosition;
        if (position === 'above' || position === 'below') {
            originPosition = { originX: 'center', originY: position === 'above' ? 'top' : 'bottom' };
        }
        else if (position === 'before' ||
            (position === 'left' && isLtr) ||
            (position === 'right' && !isLtr)) {
            originPosition = { originX: 'start', originY: 'center' };
        }
        else if (position === 'after' ||
            (position === 'right' && isLtr) ||
            (position === 'left' && !isLtr)) {
            originPosition = { originX: 'end', originY: 'center' };
        }
        else {
            throw getPopoverInvalidPositionError(position);
        }
        const { x, y } = this._invertPosition(originPosition.originX, originPosition.originY);
        return {
            main: originPosition,
            fallback: { originX: x, originY: y },
        };
    }
    /** Returns the overlay position and a fallback position based on the user's preference */
    _getOverlayPosition() {
        const isLtr = !this._dir || this._dir.value === 'ltr';
        const position = this.position;
        let overlayPosition;
        if (position === 'above') {
            overlayPosition = { overlayX: 'center', overlayY: 'bottom' };
        }
        else if (position === 'below') {
            overlayPosition = { overlayX: 'center', overlayY: 'top' };
        }
        else if (position === 'before' ||
            (position === 'left' && isLtr) ||
            (position === 'right' && !isLtr)) {
            overlayPosition = { overlayX: 'end', overlayY: 'center' };
        }
        else if (position === 'after' ||
            (position === 'right' && isLtr) ||
            (position === 'left' && !isLtr)) {
            overlayPosition = { overlayX: 'start', overlayY: 'center' };
        }
        else {
            throw getPopoverInvalidPositionError(position);
        }
        const { x, y } = this._invertPosition(overlayPosition.overlayX, overlayPosition.overlayY);
        return {
            main: overlayPosition,
            fallback: { overlayX: x, overlayY: y },
        };
    }
    /** Updates the popover message and repositions the overlay according to the new message length */
    _updateContent() {
        // Must wait for the message to be painted to the popover so that the overlay can properly
        // calculate the correct positioning based on the size of the text.
        if (this._popoverInstance) {
            this._popoverInstance.content = this.content;
            this._popoverInstance.markForCheck();
            this._ngZone.onMicrotaskEmpty.asObservable().pipe(take(1), takeUntil(this._destroyed)).subscribe(() => {
                if (this._popoverInstance) {
                    this._overlayRef.updatePosition();
                }
            });
        }
    }
    /** Inverts an overlay position. */
    _invertPosition(x, y) {
        if (this.position === 'above' || this.position === 'below') {
            if (y === 'top') {
                y = 'bottom';
            }
            else if (y === 'bottom') {
                y = 'top';
            }
        }
        else {
            if (x === 'end') {
                x = 'start';
            }
            else if (x === 'start') {
                x = 'end';
            }
        }
        return { x, y };
    }
    // tslint:disable-next-line:no-empty
    _bindEvents(platform, hammerLoader) { }
}
Popover.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: Popover, deps: [{ token: i1.Overlay }, { token: i0.ElementRef }, { token: i2.ScrollDispatcher }, { token: i0.ViewContainerRef }, { token: i0.NgZone }, { token: i3.Platform }, { token: i4.AriaDescriber }, { token: i4.FocusMonitor }, { token: DOCUMENT }, { token: GHOST_RIDER_POPOVER_SCROLL_STRATEGY }, { token: GHOST_RIDER_POPOVER_POSITION_STRATEGY }, { token: GHOST_RIDER_POPOVER_CONTAINER }, { token: i5.Directionality, optional: true }, { token: GHOST_RIDER_POPOVER_DEFAULT_OPTIONS, optional: true }, { token: HAMMER_LOADER, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
Popover.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.4", type: Popover, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: Popover, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: i1.Overlay }, { type: i0.ElementRef }, { type: i2.ScrollDispatcher }, { type: i0.ViewContainerRef }, { type: i0.NgZone }, { type: i3.Platform }, { type: i4.AriaDescriber }, { type: i4.FocusMonitor }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [GHOST_RIDER_POPOVER_SCROLL_STRATEGY]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [GHOST_RIDER_POPOVER_POSITION_STRATEGY]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [GHOST_RIDER_POPOVER_CONTAINER]
                }] }, { type: i5.Directionality, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [GHOST_RIDER_POPOVER_DEFAULT_OPTIONS]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [HAMMER_LOADER]
                }] }]; } });
// Can this be retrieved from compiled code???
export const GHOST_RIDER_POPOVER_STATIC_PROVIDER = {
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
function buildConnectedPositions(origin, overlay, nubbinPosition, offsets) {
    const main = { ...origin.main, ...overlay.main };
    const fallback = { ...origin.fallback, ...overlay.fallback };
    const positions = [
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
        }
        else if (position.originX !== 'center') { // Left/Right
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
function buildPositionsForNubbin(position, nubbinPosition) {
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
        }
        else {
            return [
                { ...position, overlayX: nubbinPosition },
            ];
        }
    }
    else { // Left/Right
        if (nubbinPosition === 'auto') {
            return [
                position,
                { ...position, overlayY: 'bottom' },
                { ...position, overlayY: 'top' },
            ];
        }
        else {
            return [
                { ...position, overlayY: nubbinPosition === 'start' ? 'top' : 'bottom' },
            ];
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hvc3QtcmlkZXItcG9wb3Zlci5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25nLWdob3N0LXJpZGVyL3NyYy9saWIvbW9kZWxzL2dob3N0LXJpZGVyLXBvcG92ZXIubW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsOENBQThDO0FBQzlDLE9BQU8sRUFFTixTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixjQUFjLEVBQ2QsTUFBTSxFQUdOLFFBQVEsRUFFUixnQkFBZ0IsR0FDaEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxhQUFhLEVBQWdCLE1BQU0sMkJBQTJCLENBQUM7QUFDeEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbkQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDOUQsT0FBTyxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMvRCxPQUFPLEVBSU4sT0FBTyxHQUtQLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ2pELE9BQU8sRUFBRSxlQUFlLEVBQWtCLE1BQU0scUJBQXFCLENBQUM7QUFDdEUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFMUQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvQixPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWpELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFN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LFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO2FBQ2hDLENBQUM7U0FDRjthQUFNO1lBQ04sT0FBTztnQkFDTixFQUFFLEdBQUcsUUFBUSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUU7YUFDekMsQ0FBQztTQUNGO0tBQ0Q7U0FBTSxFQUFFLGFBQWE7UUFDckIsSUFBSSxjQUFjLEtBQUssTUFBTSxFQUFFO1lBQzlCLE9BQU87Z0JBQ04sUUFBUTtnQkFDUixFQUFFLEdBQUcsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUU7Z0JBQ25DLEVBQUUsR0FBRyxRQUFRLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRTthQUNoQyxDQUFDO1NBQ0Y7YUFBTTtZQUNOLE9BQU87Z0JBQ04sRUFBRSxHQUFHLFFBQVEsRUFBRSxRQUFRLEVBQUUsY0FBYyxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUU7YUFDeEUsQ0FBQztTQUNGO0tBQ0Q7QUFDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG4vLyBBZGFwdGVyIGZyb20gQGFuZ3VsYXIvbWF0ZXJpYWwgXCJNYXRUb29sdGlwXCJcbmltcG9ydCB7XG5cdENvbnN0cnVjdG9yUHJvdmlkZXIsXG5cdERpcmVjdGl2ZSxcblx0RWxlbWVudFJlZixcblx0SW5qZWN0LFxuXHRJbmplY3Rpb25Ub2tlbixcblx0Tmdab25lLFxuXHRPbkRlc3Ryb3ksXG5cdE9uSW5pdCxcblx0T3B0aW9uYWwsXG5cdFR5cGUsXG5cdFZpZXdDb250YWluZXJSZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRE9DVU1FTlQgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgSEFNTUVSX0xPQURFUiwgSGFtbWVyTG9hZGVyIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5pbXBvcnQgeyBBcmlhRGVzY3JpYmVyLCBGb2N1c01vbml0b3IgfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQgeyBEaXJlY3Rpb25hbGl0eSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQgeyBFU0NBUEUsIGhhc01vZGlmaWVyS2V5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7XG5cdENvbm5lY3RlZFBvc2l0aW9uLFxuXHRIb3Jpem9udGFsQ29ubmVjdGlvblBvcyxcblx0T3JpZ2luQ29ubmVjdGlvblBvc2l0aW9uLFxuXHRPdmVybGF5LFxuXHRPdmVybGF5Q29ubmVjdGlvblBvc2l0aW9uLFxuXHRPdmVybGF5UmVmLFxuXHRTY3JvbGxTdHJhdGVneSxcblx0VmVydGljYWxDb25uZWN0aW9uUG9zLFxufSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQgeyBQbGF0Zm9ybSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQgeyBDb21wb25lbnRQb3J0YWwsIFRlbXBsYXRlUG9ydGFsIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQgeyBTY3JvbGxEaXNwYXRjaGVyIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XG5cbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IHRha2UsIHRha2VVbnRpbCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgUG9wb3ZlckNvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudHMvcG9wb3Zlci5jb21wb25lbnQnO1xuXG5pbXBvcnQgeyBHSE9TVF9SSURFUl9QT1BPVkVSX1NDUk9MTF9TVFJBVEVHWSB9IGZyb20gJy4uL3Rva2Vucy9wb3BvdmVyLXNjcm9sbC1zdHJhdGVneS50b2tlbic7XG5pbXBvcnQgeyBHaG9zdFJpZGVyUG9wb3ZlckNvbnRhaW5lciwgR0hPU1RfUklERVJfUE9QT1ZFUl9DT05UQUlORVIgfSBmcm9tICcuLi90b2tlbnMvcG9wb3Zlci1jb250YWluZXIudG9rZW4nO1xuaW1wb3J0IHtcblx0UG9wb3ZlclBvc2l0aW9uU3RyYXRlZ3ksXG5cdFBvcG92ZXJQb3NpdGlvblN0cmF0ZWd5RmFjdG9yeSxcblx0R0hPU1RfUklERVJfUE9QT1ZFUl9QT1NJVElPTl9TVFJBVEVHWSxcbn0gZnJvbSAnLi4vcHJvdmlkZXJzL3BvcG92ZXItcG9zaXRpb24tc3RyYXRlZ3kuc2VydmljZSc7XG5cbmV4cG9ydCB0eXBlIFBvcG92ZXJQb3NpdGlvbiA9ICdsZWZ0JyB8ICdyaWdodCcgfCAnYWJvdmUnIHwgJ2JlbG93JyB8ICdiZWZvcmUnIHwgJ2FmdGVyJztcbmV4cG9ydCB0eXBlIFBvcG92ZXJOdWJiaW5Qb3NpdGlvbiA9ICdzdGFydCcgfCAnY2VudGVyJyB8ICdlbmQnIHwgJ2F1dG8nIHwgJ25vbmUnO1xuXG4vKiogQ1NTIGNsYXNzIHRoYXQgd2lsbCBiZSBhdHRhY2hlZCB0byB0aGUgb3ZlcmxheSBwYW5lbC4gKi9cbmV4cG9ydCBjb25zdCBQT1BPVkVSX1BBTkVMX0NMQVNTID0gJ2dob3N0LXJpZGVyLXBvcG92ZXItY29udGFpbmVyJztcblxuZXhwb3J0IHR5cGUgUG9wb3ZlckNvbnRlbnQ8VD4gPSBUIGV4dGVuZHMgc3RyaW5nID8gc3RyaW5nIDogQ29tcG9uZW50UG9ydGFsPFQ+IHwgVGVtcGxhdGVQb3J0YWw8VD47XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBlcnJvciB0byBiZSB0aHJvd24gaWYgdGhlIHVzZXIgc3VwcGxpZWQgYW4gaW52YWxpZCBwb3BvdmVyIHBvc2l0aW9uLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG9wb3ZlckludmFsaWRQb3NpdGlvbkVycm9yKHBvc2l0aW9uOiBzdHJpbmcpIHtcblx0cmV0dXJuIEVycm9yKGBQb3BvdmVyIHBvc2l0aW9uIFwiJHtwb3NpdGlvbn1cIiBpcyBpbnZhbGlkLmApO1xufVxuXG4vKiogRGVmYXVsdCBgUG9wb3ZlcmAgb3B0aW9ucyB0aGF0IGNhbiBiZSBvdmVycmlkZGVuLiAqL1xuZXhwb3J0IGludGVyZmFjZSBQb3BvdmVyRGVmYXVsdE9wdGlvbnMge1xuXHRzaG93RGVsYXk6IG51bWJlcjtcblx0aGlkZURlbGF5OiBudW1iZXI7XG5cdHRvdWNoZW5kSGlkZURlbGF5OiBudW1iZXI7XG5cdHBvc2l0aW9uPzogUG9wb3ZlclBvc2l0aW9uO1xufVxuXG4vKiogSW5qZWN0aW9uIHRva2VuIHRvIGJlIHVzZWQgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb3B0aW9ucyBmb3IgYFBvcG92ZXJgLiAqL1xuZXhwb3J0IGNvbnN0IEdIT1NUX1JJREVSX1BPUE9WRVJfREVGQVVMVF9PUFRJT05TID0gbmV3IEluamVjdGlvblRva2VuPFBvcG92ZXJEZWZhdWx0T3B0aW9ucz4oXG5cdCdQb3BvdmVyRGVmYXVsdE9wdGlvbnMnLFxuXHR7IHByb3ZpZGVkSW46ICdyb290JywgZmFjdG9yeTogR0hPU1RfUklERVJfUE9QT1ZFUl9ERUZBVUxUX09QVElPTlNfRkFDVE9SWSB9LFxuKTtcblxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmV4cG9ydCBmdW5jdGlvbiBHSE9TVF9SSURFUl9QT1BPVkVSX0RFRkFVTFRfT1BUSU9OU19GQUNUT1JZKCk6IFBvcG92ZXJEZWZhdWx0T3B0aW9ucyB7XG5cdHJldHVybiB7XG5cdFx0c2hvd0RlbGF5OiAwLFxuXHRcdGhpZGVEZWxheTogMCxcblx0XHR0b3VjaGVuZEhpZGVEZWxheTogMTUwMCxcblx0fTtcbn1cblxuaW50ZXJmYWNlIFBvcG92ZXJOdWJiaW5PZmZzZXRzIHtcblx0cGVycGVuZGljdWxhcjogbnVtYmVyO1xuXHRwYXJhbGxlbDogbnVtYmVyO1xufVxuXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBjbGFzcyBQb3BvdmVyPFQgPSBhbnk+IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuXHRwdWJsaWMgX292ZXJsYXlSZWY6IE92ZXJsYXlSZWYgfCBudWxsO1xuXHRwcml2YXRlIF9wb3BvdmVySW5zdGFuY2U6IFBvcG92ZXJDb21wb25lbnQgfCBudWxsO1xuXG5cdHByb3RlY3RlZCBfcG9ydGFsOiBDb21wb25lbnRQb3J0YWw8UG9wb3ZlckNvbXBvbmVudD47XG5cdHByb3RlY3RlZCBfcG9zaXRpb246IFBvcG92ZXJQb3NpdGlvbiA9ICdiZWxvdyc7XG5cdHByb3RlY3RlZCBfbnViYmluUG9zaXRpb246IFBvcG92ZXJOdWJiaW5Qb3NpdGlvbiA9ICdub25lJztcblx0cHJvdGVjdGVkIF9kaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXHRwcm90ZWN0ZWQgX3Njcm9sbFN0cmF0ZWd5OiAoKSA9PiBTY3JvbGxTdHJhdGVneTtcblx0cHJvdGVjdGVkIF9wb3NpdGlvblN0cmF0ZWd5OiBQb3BvdmVyUG9zaXRpb25TdHJhdGVneUZhY3Rvcnk7XG5cdHB1YmxpYyBpc1Rvb2x0aXA6IGJvb2xlYW47XG5cdHB1YmxpYyBwb3BvdmVyVHlwZTogVHlwZTxQb3BvdmVyQ29tcG9uZW50PiA9IFBvcG92ZXJDb21wb25lbnQ7XG5cblx0cHVibGljIGdldCBwb3BvdmVySW5zdGFuY2UoKTogUG9wb3ZlckNvbXBvbmVudCB8IG51bGwgeyByZXR1cm4gdGhpcy5fcG9wb3Zlckluc3RhbmNlOyB9XG5cblx0LyoqIEFsbG93cyB0aGUgdXNlciB0byBkZWZpbmUgdGhlIHBvc2l0aW9uIG9mIHRoZSBwb3BvdmVyIHJlbGF0aXZlIHRvIHRoZSBwYXJlbnQgZWxlbWVudCAqL1xuXHRnZXQgcG9zaXRpb24oKTogUG9wb3ZlclBvc2l0aW9uIHsgcmV0dXJuIHRoaXMuX3Bvc2l0aW9uOyB9XG5cdHNldCBwb3NpdGlvbih2YWx1ZTogUG9wb3ZlclBvc2l0aW9uKSB7XG5cdFx0aWYgKHZhbHVlICE9PSB0aGlzLl9wb3NpdGlvbikge1xuXHRcdFx0dGhpcy5fcG9zaXRpb24gPSB2YWx1ZTtcblxuXHRcdFx0aWYgKHRoaXMuX292ZXJsYXlSZWYpIHtcblx0XHRcdFx0dGhpcy5fdXBkYXRlUG9zaXRpb24oKTtcblxuXHRcdFx0XHRpZiAodGhpcy5fcG9wb3Zlckluc3RhbmNlKSB7XG5cdFx0XHRcdFx0dGhpcy5fcG9wb3Zlckluc3RhbmNlLnNob3coMCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLl9vdmVybGF5UmVmLnVwZGF0ZVBvc2l0aW9uKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqIEFsbG93cyB0aGUgdXNlciB0byBkZWZpbmUgdGhlIG51YmJpbiBwb3NpdGlvbiBvZiB0aGUgcG9wb3ZlciByZWxhdGl2ZSB0byB0aGUgcGFyZW50IGVsZW1lbnQgKi9cblx0Z2V0IG51YmJpblBvc2l0aW9uKCk6IFBvcG92ZXJOdWJiaW5Qb3NpdGlvbiB7IHJldHVybiB0aGlzLl9udWJiaW5Qb3NpdGlvbjsgfVxuXHRzZXQgbnViYmluUG9zaXRpb24odmFsdWU6IFBvcG92ZXJOdWJiaW5Qb3NpdGlvbikge1xuXHRcdGlmICh2YWx1ZSAhPT0gdGhpcy5fbnViYmluUG9zaXRpb24pIHtcblx0XHRcdHRoaXMuX251YmJpblBvc2l0aW9uID0gdmFsdWU7XG5cblx0XHRcdGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG5cdFx0XHRcdHRoaXMuX3VwZGF0ZVBvc2l0aW9uKCk7XG5cblx0XHRcdFx0aWYgKHRoaXMuX3BvcG92ZXJJbnN0YW5jZSkge1xuXHRcdFx0XHRcdHRoaXMuX3BvcG92ZXJJbnN0YW5jZS5zaG93KDApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5fb3ZlcmxheVJlZi51cGRhdGVQb3NpdGlvbigpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKiBEaXNhYmxlcyB0aGUgZGlzcGxheSBvZiB0aGUgcG9wb3Zlci4gKi9cblx0Z2V0IGRpc2FibGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7IH1cblx0c2V0IGRpc2FibGVkKHZhbHVlKSB7XG5cdFx0dGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuXG5cdFx0Ly8gSWYgcG9wb3ZlciBpcyBkaXNhYmxlZCwgaGlkZSBpbW1lZGlhdGVseS5cblx0XHRpZiAodGhpcy5fZGlzYWJsZWQpIHtcblx0XHRcdHRoaXMuaGlkZSgwKTtcblx0XHR9XG5cdH1cblxuXHQvKiogVGhlIGRlZmF1bHQgZGVsYXkgaW4gbXMgYmVmb3JlIHNob3dpbmcgdGhlIHBvcG92ZXIgYWZ0ZXIgc2hvdyBpcyBjYWxsZWQgKi9cblx0c2hvd0RlbGF5ID0gdGhpcy5fZGVmYXVsdE9wdGlvbnMuc2hvd0RlbGF5O1xuXG5cdC8qKiBUaGUgZGVmYXVsdCBkZWxheSBpbiBtcyBiZWZvcmUgaGlkaW5nIHRoZSBwb3BvdmVyIGFmdGVyIGhpZGUgaXMgY2FsbGVkICovXG5cdGhpZGVEZWxheSA9IHRoaXMuX2RlZmF1bHRPcHRpb25zLmhpZGVEZWxheTtcblxuXHRwcm90ZWN0ZWQgX2NvbnRlbnQhOiBQb3BvdmVyQ29udGVudDxUPjtcblxuXHQvKiogVGhlIG1lc3NhZ2UgdG8gYmUgZGlzcGxheWVkIGluIHRoZSBwb3BvdmVyICovXG5cdGdldCBjb250ZW50KCk6IFBvcG92ZXJDb250ZW50PFQ+IHsgcmV0dXJuIHRoaXMuX2NvbnRlbnQ7IH1cblx0c2V0IGNvbnRlbnQodmFsdWU6IFBvcG92ZXJDb250ZW50PFQ+KSB7XG5cdFx0aWYgKHR5cGVvZiB0aGlzLl9jb250ZW50ID09PSAnc3RyaW5nJykge1xuXHRcdFx0dGhpcy5fYXJpYURlc2NyaWJlci5yZW1vdmVEZXNjcmlwdGlvbih0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIHRoaXMuX2NvbnRlbnQpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2NvbnRlbnQgPSB2YWx1ZTtcblxuXHRcdGlmICghdGhpcy5fY29udGVudCAmJiB0aGlzLmlzUG9wb3ZlclZpc2libGUoKSkge1xuXHRcdFx0dGhpcy5oaWRlKDApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl91cGRhdGVDb250ZW50KCk7XG5cdFx0XHRpZiAodHlwZW9mIHRoaXMuX2NvbnRlbnQgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG5cdFx0XHRcdFx0Ly8gVGhlIGBBcmlhRGVzY3JpYmVyYCBoYXMgc29tZSBmdW5jdGlvbmFsaXR5IHRoYXQgYXZvaWRzIGFkZGluZyBhIGRlc2NyaXB0aW9uIGlmIGl0J3MgdGhlXG5cdFx0XHRcdFx0Ly8gc2FtZSBhcyB0aGUgYGFyaWEtbGFiZWxgIG9mIGFuIGVsZW1lbnQsIGhvd2V2ZXIgd2UgY2FuJ3Qga25vdyB3aGV0aGVyIHRoZSBwb3BvdmVyIHRyaWdnZXJcblx0XHRcdFx0XHQvLyBoYXMgYSBkYXRhLWJvdW5kIGBhcmlhLWxhYmVsYCBvciB3aGVuIGl0J2xsIGJlIHNldCBmb3IgdGhlIGZpcnN0IHRpbWUuIFdlIGNhbiBhdm9pZCB0aGVcblx0XHRcdFx0XHQvLyBpc3N1ZSBieSBkZWZlcnJpbmcgdGhlIGRlc2NyaXB0aW9uIGJ5IGEgdGljayBzbyBBbmd1bGFyIGhhcyB0aW1lIHRvIHNldCB0aGUgYGFyaWEtbGFiZWxgLlxuXHRcdFx0XHRcdFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5fYXJpYURlc2NyaWJlci5kZXNjcmliZSh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIHRoaXMuX2NvbnRlbnQgYXMgc3RyaW5nKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cHJvdGVjdGVkIF9tYW51YWxMaXN0ZW5lcnMgPSBuZXcgTWFwPHN0cmluZywgRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdD4oKTtcblxuXHQvKiogRW1pdHMgd2hlbiB0aGUgY29tcG9uZW50IGlzIGRlc3Ryb3llZC4gKi9cblx0cHJvdGVjdGVkIHJlYWRvbmx5IF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG5cdHByb3RlY3RlZCBfZG9jdW1lbnQ6IERvY3VtZW50O1xuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHByb3RlY3RlZCBfb3ZlcmxheTogT3ZlcmxheSxcblx0XHRwcm90ZWN0ZWQgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuXHRcdHByb3RlY3RlZCBfc2Nyb2xsRGlzcGF0Y2hlcjogU2Nyb2xsRGlzcGF0Y2hlcixcblx0XHRwcm90ZWN0ZWQgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG5cdFx0cHJvdGVjdGVkIF9uZ1pvbmU6IE5nWm9uZSxcblx0XHRwbGF0Zm9ybTogUGxhdGZvcm0sXG5cdFx0cHJvdGVjdGVkIF9hcmlhRGVzY3JpYmVyOiBBcmlhRGVzY3JpYmVyLFxuXHRcdHByb3RlY3RlZCBfZm9jdXNNb25pdG9yOiBGb2N1c01vbml0b3IsXG5cdFx0QEluamVjdChET0NVTUVOVCkgZG9jdW1lbnQ6IGFueSxcblx0XHRASW5qZWN0KEdIT1NUX1JJREVSX1BPUE9WRVJfU0NST0xMX1NUUkFURUdZKSBzY3JvbGxTdHJhdGVneTogYW55LFxuXHRcdEBJbmplY3QoR0hPU1RfUklERVJfUE9QT1ZFUl9QT1NJVElPTl9TVFJBVEVHWSkgcG9zaXRpb25TdHJhdGVneTogYW55LFxuXHRcdEBJbmplY3QoR0hPU1RfUklERVJfUE9QT1ZFUl9DT05UQUlORVIpIHByaXZhdGUgX2NvbnRhaW5lcjogR2hvc3RSaWRlclBvcG92ZXJDb250YWluZXIsXG5cdFx0QE9wdGlvbmFsKCkgcHJvdGVjdGVkIF9kaXI6IERpcmVjdGlvbmFsaXR5LFxuXHRcdEBPcHRpb25hbCgpIEBJbmplY3QoR0hPU1RfUklERVJfUE9QT1ZFUl9ERUZBVUxUX09QVElPTlMpXG5cdFx0cHJvdGVjdGVkIF9kZWZhdWx0T3B0aW9uczogUG9wb3ZlckRlZmF1bHRPcHRpb25zLFxuXHRcdEBPcHRpb25hbCgpIEBJbmplY3QoSEFNTUVSX0xPQURFUikgaGFtbWVyTG9hZGVyPzogSGFtbWVyTG9hZGVyLFxuXHQpIHtcblx0XHR0aGlzLl9kb2N1bWVudCA9IGRvY3VtZW50O1xuXHRcdHRoaXMuX3Njcm9sbFN0cmF0ZWd5ID0gc2Nyb2xsU3RyYXRlZ3k7XG5cdFx0dGhpcy5fcG9zaXRpb25TdHJhdGVneSA9IHBvc2l0aW9uU3RyYXRlZ3k7XG5cdFx0dGhpcy5fYmluZEV2ZW50cyhwbGF0Zm9ybSwgaGFtbWVyTG9hZGVyIGFzIEhhbW1lckxvYWRlcik7XG5cblx0XHRpZiAoX2RlZmF1bHRPcHRpb25zICYmIF9kZWZhdWx0T3B0aW9ucy5wb3NpdGlvbikge1xuXHRcdFx0dGhpcy5wb3NpdGlvbiA9IF9kZWZhdWx0T3B0aW9ucy5wb3NpdGlvbjtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2V0dXAgc3R5bGluZy1zcGVjaWZpYyB0aGluZ3Ncblx0ICovXG5cdG5nT25Jbml0KCkge1xuXHRcdGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cdFx0Y29uc3QgZWxlbWVudFN0eWxlID0gZWxlbWVudC5zdHlsZSBhcyBDU1NTdHlsZURlY2xhcmF0aW9uICYgeyB3ZWJraXRVc2VyRHJhZzogc3RyaW5nIH07XG5cblx0XHRpZiAoZWxlbWVudC5ub2RlTmFtZSA9PT0gJ0lOUFVUJyB8fCBlbGVtZW50Lm5vZGVOYW1lID09PSAnVEVYVEFSRUEnKSB7XG5cdFx0XHQvLyBXaGVuIHdlIGJpbmQgYSBnZXN0dXJlIGV2ZW50IG9uIGFuIGVsZW1lbnQgKGluIHRoaXMgY2FzZSBgbG9uZ3ByZXNzYCksIEhhbW1lckpTXG5cdFx0XHQvLyB3aWxsIGFkZCBzb21lIGlubGluZSBzdHlsZXMgYnkgZGVmYXVsdCwgaW5jbHVkaW5nIGB1c2VyLXNlbGVjdDogbm9uZWAuIFRoaXMgaXNcblx0XHRcdC8vIHByb2JsZW1hdGljIG9uIGlPUyBhbmQgaW4gU2FmYXJpLCBiZWNhdXNlIGl0IHdpbGwgcHJldmVudCB1c2VycyBmcm9tIHR5cGluZyBpbiBpbnB1dHMuXG5cdFx0XHQvLyBTaW5jZSBgdXNlci1zZWxlY3Q6IG5vbmVgIGlzIG5vdCBuZWVkZWQgZm9yIHRoZSBgbG9uZ3ByZXNzYCBldmVudCBhbmQgY2FuIGNhdXNlIHVuZXhwZWN0ZWRcblx0XHRcdC8vIGJlaGF2aW9yIGZvciB0ZXh0IGZpZWxkcywgd2UgYWx3YXlzIGNsZWFyIHRoZSBgdXNlci1zZWxlY3RgIHRvIGF2b2lkIHN1Y2ggaXNzdWVzLlxuXG5cdFx0XHQvLyBlbGVtZW50U3R5bGUud2Via2l0VXNlclNlbGVjdCA9IGVsZW1lbnRTdHlsZS51c2VyU2VsZWN0ID0gZWxlbWVudFN0eWxlLm1zVXNlclNlbGVjdCA9ICcnO1xuXHRcdFx0ZWxlbWVudFN0eWxlLndlYmtpdFVzZXJTZWxlY3QgPSBlbGVtZW50U3R5bGUudXNlclNlbGVjdDtcblx0XHR9XG5cblx0XHQvLyBIYW1tZXIgYXBwbGllcyBgLXdlYmtpdC11c2VyLWRyYWc6IG5vbmVgIG9uIGFsbCBlbGVtZW50cyBieSBkZWZhdWx0LFxuXHRcdC8vIHdoaWNoIGJyZWFrcyB0aGUgbmF0aXZlIGRyYWcmZHJvcC4gSWYgdGhlIGNvbnN1bWVyIGV4cGxpY2l0bHkgbWFkZVxuXHRcdC8vIHRoZSBlbGVtZW50IGRyYWdnYWJsZSwgY2xlYXIgdGhlIGAtd2Via2l0LXVzZXItZHJhZ2AuXG5cdFx0aWYgKGVsZW1lbnQuZHJhZ2dhYmxlICYmIGVsZW1lbnRTdHlsZS53ZWJraXRVc2VyRHJhZyA9PT0gJ25vbmUnKSB7XG5cdFx0XHRlbGVtZW50U3R5bGUud2Via2l0VXNlckRyYWcgPSAnJztcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRGlzcG9zZSB0aGUgcG9wb3ZlciB3aGVuIGRlc3Ryb3llZC5cblx0ICovXG5cdG5nT25EZXN0cm95KCkge1xuXHRcdGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG5cdFx0XHR0aGlzLl9vdmVybGF5UmVmLmRpc3Bvc2UoKTtcblx0XHRcdHRoaXMuX3BvcG92ZXJJbnN0YW5jZSA9IG51bGw7XG5cdFx0fVxuXG5cdFx0Ly8gQ2xlYW4gdXAgdGhlIGV2ZW50IGxpc3RlbmVycyBzZXQgaW4gdGhlIGNvbnN0cnVjdG9yXG5cdFx0dGhpcy5fbWFudWFsTGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyLCBldmVudCkgPT4ge1xuXHRcdFx0dGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKTtcblx0XHR9KTtcblx0XHR0aGlzLl9tYW51YWxMaXN0ZW5lcnMuY2xlYXIoKTtcblxuXHRcdHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG5cdFx0dGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG5cblx0XHRpZiAodHlwZW9mIHRoaXMuY29udGVudCA9PT0gJ3N0cmluZycpIHtcblx0XHRcdHRoaXMuX2FyaWFEZXNjcmliZXIucmVtb3ZlRGVzY3JpcHRpb24odGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLmNvbnRlbnQpO1xuXHRcdH1cblx0XHR0aGlzLl9mb2N1c01vbml0b3Iuc3RvcE1vbml0b3JpbmcodGhpcy5fZWxlbWVudFJlZik7XG5cdH1cblxuXHQvKiogU2hvd3MgdGhlIHBvcG92ZXIgYWZ0ZXIgdGhlIGRlbGF5IGluIG1zLCBkZWZhdWx0cyB0byBwb3BvdmVyLWRlbGF5LXNob3cgb3IgMG1zIGlmIG5vIGlucHV0ICovXG5cdHB1YmxpYyBzaG93KGRlbGF5OiBudW1iZXIgPSB0aGlzLnNob3dEZWxheSk6IHZvaWQge1xuXHRcdGlmICh0aGlzLmRpc2FibGVkIHx8ICF0aGlzLmNvbnRlbnQgfHwgKHRoaXMuaXNQb3BvdmVyVmlzaWJsZSgpICYmICF0aGlzLl9wb3BvdmVySW5zdGFuY2U/Lmhhc1RpbWVvdXQpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb3ZlcmxheVJlZiA9IHRoaXMuX2NyZWF0ZU92ZXJsYXkoKTtcblxuXHRcdHRoaXMuX2RldGFjaCgpO1xuXHRcdHRoaXMuX3BvcnRhbCA9IHRoaXMuX3BvcnRhbCB8fCBuZXcgQ29tcG9uZW50UG9ydGFsKHRoaXMucG9wb3ZlclR5cGUsIHRoaXMuX3ZpZXdDb250YWluZXJSZWYpO1xuXHRcdHRoaXMuX3BvcG92ZXJJbnN0YW5jZSA9IG92ZXJsYXlSZWYuYXR0YWNoKHRoaXMuX3BvcnRhbCkuaW5zdGFuY2U7XG5cdFx0dGhpcy5fcG9wb3Zlckluc3RhbmNlLmlzVG9vbHRpcCA9IHRoaXMuaXNUb29sdGlwO1xuXHRcdHRoaXMuX3BvcG92ZXJJbnN0YW5jZS5hZnRlckhpZGRlbigpXG5cdFx0XHQucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSlcblx0XHRcdC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fZGV0YWNoKCkpO1xuXHRcdHRoaXMuX3VwZGF0ZUNvbnRlbnQoKTtcblx0XHR0aGlzLl9wb3BvdmVySW5zdGFuY2Uuc2hvdyhkZWxheSk7XG5cdH1cblxuXHQvKiogSGlkZXMgdGhlIHBvcG92ZXIgYWZ0ZXIgdGhlIGRlbGF5IGluIG1zLCBkZWZhdWx0cyB0byBwb3BvdmVyLWRlbGF5LWhpZGUgb3IgMG1zIGlmIG5vIGlucHV0ICovXG5cdHB1YmxpYyBoaWRlKGRlbGF5OiBudW1iZXIgPSB0aGlzLmhpZGVEZWxheSk6IHZvaWQge1xuXHRcdGlmICh0aGlzLl9wb3BvdmVySW5zdGFuY2UpIHtcblx0XHRcdHRoaXMuX3BvcG92ZXJJbnN0YW5jZS5oaWRlKGRlbGF5KTtcblx0XHR9XG5cdH1cblxuXHQvKiogU2hvd3MvaGlkZXMgdGhlIHBvcG92ZXIgKi9cblx0cHVibGljIHRvZ2dsZSgpOiB2b2lkIHtcblx0XHR0aGlzLmlzUG9wb3ZlclZpc2libGUoKSA/IHRoaXMuaGlkZSgpIDogdGhpcy5zaG93KCk7XG5cdH1cblxuXHQvKiogUmV0dXJucyB0cnVlIGlmIHRoZSBwb3BvdmVyIGlzIGN1cnJlbnRseSB2aXNpYmxlIHRvIHRoZSB1c2VyICovXG5cdHB1YmxpYyBpc1BvcG92ZXJWaXNpYmxlKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiAhIXRoaXMuX3BvcG92ZXJJbnN0YW5jZSAmJiB0aGlzLl9wb3BvdmVySW5zdGFuY2UuaXNWaXNpYmxlKCk7XG5cdH1cblxuXHQvKiogSGFuZGxlcyB0aGUga2V5ZG93biBldmVudHMgb24gdGhlIGhvc3QgZWxlbWVudC4gKi9cblx0cHVibGljIGhhbmRsZUtleWRvd24oZTogS2V5Ym9hcmRFdmVudCkge1xuXHRcdGlmICh0aGlzLmlzUG9wb3ZlclZpc2libGUoKSAmJiBlLmtleUNvZGUgPT09IEVTQ0FQRSAmJiAhaGFzTW9kaWZpZXJLZXkoZSkpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHR0aGlzLmhpZGUoMCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqIEhhbmRsZXMgdGhlIHRvdWNoZW5kIGV2ZW50cyBvbiB0aGUgaG9zdCBlbGVtZW50LiAqL1xuXHRwdWJsaWMgaGFuZGxlVG91Y2hlbmQoKSB7XG5cdFx0dGhpcy5oaWRlKHRoaXMuX2RlZmF1bHRPcHRpb25zLnRvdWNoZW5kSGlkZURlbGF5KTtcblx0fVxuXG5cdC8qKiBDcmVhdGUgdGhlIG92ZXJsYXkgY29uZmlnIGFuZCBwb3NpdGlvbiBzdHJhdGVneSAqL1xuXHRwcm90ZWN0ZWQgX2NyZWF0ZU92ZXJsYXkoKTogT3ZlcmxheVJlZiB7XG5cdFx0aWYgKHRoaXMuX292ZXJsYXlSZWYpIHtcblx0XHRcdHJldHVybiB0aGlzLl9vdmVybGF5UmVmO1xuXHRcdH1cblxuXHRcdGNvbnN0IHNjcm9sbGFibGVBbmNlc3RvcnMgPVxuXHRcdFx0dGhpcy5fc2Nyb2xsRGlzcGF0Y2hlci5nZXRBbmNlc3RvclNjcm9sbENvbnRhaW5lcnModGhpcy5fZWxlbWVudFJlZik7XG5cblx0XHQvLyBDcmVhdGUgY29ubmVjdGVkIHBvc2l0aW9uIHN0cmF0ZWd5IHRoYXQgbGlzdGVucyBmb3Igc2Nyb2xsIGV2ZW50cyB0byByZXBvc2l0aW9uLlxuXHRcdGNvbnN0IHN0cmF0ZWd5ID0gdGhpcy5fcG9zaXRpb25TdHJhdGVneSh0aGlzLl9lbGVtZW50UmVmKVxuXHRcdFx0LndpdGhDb250YWluZXIodGhpcy5fY29udGFpbmVyKVxuXHRcdFx0LndpdGhTY3JvbGxhYmxlQ29udGFpbmVycyhzY3JvbGxhYmxlQW5jZXN0b3JzKTtcblxuXHRcdHN0cmF0ZWd5LnBvc2l0aW9uQ2hhbmdlcy5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKS5zdWJzY3JpYmUoKGNoYW5nZSkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuX3BvcG92ZXJJbnN0YW5jZSkge1xuXHRcdFx0XHRpZiAoY2hhbmdlLnNjcm9sbGFibGVWaWV3UHJvcGVydGllcy5pc092ZXJsYXlDbGlwcGVkICYmIHRoaXMuX3BvcG92ZXJJbnN0YW5jZS5pc1Zpc2libGUoKSkge1xuXHRcdFx0XHRcdC8vIEFmdGVyIHBvc2l0aW9uIGNoYW5nZXMgb2NjdXIgYW5kIHRoZSBvdmVybGF5IGlzIGNsaXBwZWQgYnlcblx0XHRcdFx0XHQvLyBhIHBhcmVudCBzY3JvbGxhYmxlIHRoZW4gY2xvc2UgdGhlIHBvcG92ZXIuXG5cdFx0XHRcdFx0dGhpcy5fbmdab25lLnJ1bigoKSA9PiB0aGlzLmhpZGUoMCkpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMuX251YmJpblBvc2l0aW9uICE9PSAnbm9uZScpIHtcblx0XHRcdFx0XHQvLyBUT0RPOiBDaGVjayB0b29sdGlwIHBvc2l0aW9uIHRvIHNlZSBpZiBudWJiaW4gZXhjZWVkcyBib3VuZHMgb2Ygb3JpZ2luIChoaWRlIGlmIHNvKVxuXHRcdFx0XHRcdGlmIChjaGFuZ2UuY29ubmVjdGlvblBhaXIgIT09IHRoaXMuX3BvcG92ZXJJbnN0YW5jZS5wb3NpdGlvbikge1xuXHRcdFx0XHRcdFx0dGhpcy5fbmdab25lLnJ1bigoKSA9PiB0aGlzLl9wb3BvdmVySW5zdGFuY2UhLnBvc2l0aW9uID0gY2hhbmdlLmNvbm5lY3Rpb25QYWlyKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGNvbnN0IGhhc0JhY2tkcm9wOiBib29sZWFuID0gdGhpcy5wb3BvdmVyVHlwZSAhPT0gUG9wb3ZlckNvbXBvbmVudDtcblxuXHRcdHRoaXMuX292ZXJsYXlSZWYgPSB0aGlzLl9vdmVybGF5LmNyZWF0ZSh7XG5cdFx0XHRkaXJlY3Rpb246IHRoaXMuX2Rpcixcblx0XHRcdHBvc2l0aW9uU3RyYXRlZ3k6IHN0cmF0ZWd5LFxuXHRcdFx0cGFuZWxDbGFzczogUE9QT1ZFUl9QQU5FTF9DTEFTUyxcblx0XHRcdHNjcm9sbFN0cmF0ZWd5OiB0aGlzLl9zY3JvbGxTdHJhdGVneSgpLFxuXHRcdFx0aGFzQmFja2Ryb3AsXG5cdFx0XHRiYWNrZHJvcENsYXNzOiBbJ2dob3N0LXJpZGVyLWJhY2tkcm9wJywgJ2dob3N0LXJpZGVyLWJhY2tkcm9wX29wZW4nXSxcblx0XHR9KTtcblxuXHRcdHRoaXMuX3VwZGF0ZVBvc2l0aW9uKCk7XG5cblx0XHR0aGlzLl9vdmVybGF5UmVmLmRldGFjaG1lbnRzKClcblx0XHRcdC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKVxuXHRcdFx0LnN1YnNjcmliZSgoKSA9PiB0aGlzLl9kZXRhY2goKSk7XG5cblx0XHRyZXR1cm4gdGhpcy5fb3ZlcmxheVJlZjtcblx0fVxuXG5cdC8qKiBEZXRhY2hlcyB0aGUgY3VycmVudGx5LWF0dGFjaGVkIHBvcG92ZXIuICovXG5cdHByb3RlY3RlZCBfZGV0YWNoKCkge1xuXHRcdGlmICh0aGlzLl9vdmVybGF5UmVmICYmIHRoaXMuX292ZXJsYXlSZWYuaGFzQXR0YWNoZWQoKSkge1xuXHRcdFx0dGhpcy5fb3ZlcmxheVJlZi5kZXRhY2goKTtcblx0XHR9XG5cblx0XHR0aGlzLl9wb3BvdmVySW5zdGFuY2UgPSBudWxsO1xuXHR9XG5cblx0LyoqIFVwZGF0ZXMgdGhlIHBvc2l0aW9uIG9mIHRoZSBjdXJyZW50IHBvcG92ZXIuICovXG5cdHByb3RlY3RlZCBfdXBkYXRlUG9zaXRpb24oKSB7XG5cdFx0bGV0IG51YmJpbk9mZnNldHM6IFBvcG92ZXJOdWJiaW5PZmZzZXRzO1xuXG5cdFx0aWYgKHRoaXMuX251YmJpblBvc2l0aW9uID09PSAnbm9uZScpIHtcblx0XHRcdG51YmJpbk9mZnNldHMgPSB7IHBlcnBlbmRpY3VsYXI6IDAsIHBhcmFsbGVsOiAwIH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IFJFTTogbnVtYmVyID0gcGFyc2VGbG9hdChnZXRDb21wdXRlZFN0eWxlKHRoaXMuX2RvY3VtZW50LmRvY3VtZW50RWxlbWVudCkuZm9udFNpemUpO1xuXHRcdFx0bnViYmluT2Zmc2V0cyA9IHsgcGVycGVuZGljdWxhcjogUkVNICogMC44NzUsIHBhcmFsbGVsOiBSRU0gKiAxLjUgfTtcblx0XHR9XG5cblx0XHRjb25zdCBwb3NpdGlvbnM6IENvbm5lY3RlZFBvc2l0aW9uW10gPSBidWlsZENvbm5lY3RlZFBvc2l0aW9ucyhcblx0XHRcdHRoaXMuX2dldE9yaWdpbigpLFxuXHRcdFx0dGhpcy5fZ2V0T3ZlcmxheVBvc2l0aW9uKCksXG5cdFx0XHR0aGlzLl9udWJiaW5Qb3NpdGlvbixcblx0XHRcdG51YmJpbk9mZnNldHMsXG5cdFx0KTtcblxuXHRcdCh0aGlzLl9vdmVybGF5UmVmIS5nZXRDb25maWcoKS5wb3NpdGlvblN0cmF0ZWd5IGFzIFBvcG92ZXJQb3NpdGlvblN0cmF0ZWd5KS53aXRoUG9zaXRpb25zKHBvc2l0aW9ucyk7XG5cdH1cblxuXHQvKiogRm9yY2VzIHRvb2x0aXAgcG9zaXRpb24gdG8gYmUgcmVjYWxjdWxhdGVkLiBOZWNlc3NhcnkgZm9yIG1hbnVhbGx5IHRyaWdnZXJlZCB0b29sdGlwIGluc3RhbmNlcyAqL1xuXHRwdWJsaWMgdXBkYXRlT3ZlcmxheVBvc2l0aW9uKCk6IHZvaWQge1xuXHRcdGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG5cdFx0XHR0aGlzLl9vdmVybGF5UmVmLnVwZGF0ZVBvc2l0aW9uKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIG9yaWdpbiBwb3NpdGlvbiBhbmQgYSBmYWxsYmFjayBwb3NpdGlvbiBiYXNlZCBvbiB0aGUgdXNlcidzIHBvc2l0aW9uIHByZWZlcmVuY2UuXG5cdCAqIFRoZSBmYWxsYmFjayBwb3NpdGlvbiBpcyB0aGUgaW52ZXJzZSBvZiB0aGUgb3JpZ2luIChlLmcuIGAnYmVsb3cnIC0+ICdhYm92ZSdgKS5cblx0ICovXG5cdHByb3RlY3RlZCBfZ2V0T3JpZ2luKCk6IENvbm5lY3Rpb25Qb3NpdGlvbnM8T3JpZ2luQ29ubmVjdGlvblBvc2l0aW9uPiB7XG5cdFx0Y29uc3QgaXNMdHIgPSAhdGhpcy5fZGlyIHx8IHRoaXMuX2Rpci52YWx1ZSA9PT0gJ2x0cic7XG5cdFx0Y29uc3QgcG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uO1xuXHRcdGxldCBvcmlnaW5Qb3NpdGlvbjogT3JpZ2luQ29ubmVjdGlvblBvc2l0aW9uO1xuXG5cdFx0aWYgKHBvc2l0aW9uID09PSAnYWJvdmUnIHx8IHBvc2l0aW9uID09PSAnYmVsb3cnKSB7XG5cdFx0XHRvcmlnaW5Qb3NpdGlvbiA9IHsgb3JpZ2luWDogJ2NlbnRlcicsIG9yaWdpblk6IHBvc2l0aW9uID09PSAnYWJvdmUnID8gJ3RvcCcgOiAnYm90dG9tJyB9O1xuXHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRwb3NpdGlvbiA9PT0gJ2JlZm9yZScgfHxcblx0XHRcdChwb3NpdGlvbiA9PT0gJ2xlZnQnICYmIGlzTHRyKSB8fFxuXHRcdFx0KHBvc2l0aW9uID09PSAncmlnaHQnICYmICFpc0x0cikpIHtcblx0XHRcdG9yaWdpblBvc2l0aW9uID0geyBvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAnY2VudGVyJyB9O1xuXHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRwb3NpdGlvbiA9PT0gJ2FmdGVyJyB8fFxuXHRcdFx0KHBvc2l0aW9uID09PSAncmlnaHQnICYmIGlzTHRyKSB8fFxuXHRcdFx0KHBvc2l0aW9uID09PSAnbGVmdCcgJiYgIWlzTHRyKSkge1xuXHRcdFx0b3JpZ2luUG9zaXRpb24gPSB7IG9yaWdpblg6ICdlbmQnLCBvcmlnaW5ZOiAnY2VudGVyJyB9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBnZXRQb3BvdmVySW52YWxpZFBvc2l0aW9uRXJyb3IocG9zaXRpb24pO1xuXHRcdH1cblxuXHRcdGNvbnN0IHsgeCwgeSB9ID0gdGhpcy5faW52ZXJ0UG9zaXRpb24ob3JpZ2luUG9zaXRpb24ub3JpZ2luWCwgb3JpZ2luUG9zaXRpb24ub3JpZ2luWSk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0bWFpbjogb3JpZ2luUG9zaXRpb24sXG5cdFx0XHRmYWxsYmFjazogeyBvcmlnaW5YOiB4LCBvcmlnaW5ZOiB5IH0sXG5cdFx0fTtcblx0fVxuXG5cdC8qKiBSZXR1cm5zIHRoZSBvdmVybGF5IHBvc2l0aW9uIGFuZCBhIGZhbGxiYWNrIHBvc2l0aW9uIGJhc2VkIG9uIHRoZSB1c2VyJ3MgcHJlZmVyZW5jZSAqL1xuXHRwcm90ZWN0ZWQgX2dldE92ZXJsYXlQb3NpdGlvbigpOiBDb25uZWN0aW9uUG9zaXRpb25zPE92ZXJsYXlDb25uZWN0aW9uUG9zaXRpb24+IHtcblx0XHRjb25zdCBpc0x0ciA9ICF0aGlzLl9kaXIgfHwgdGhpcy5fZGlyLnZhbHVlID09PSAnbHRyJztcblx0XHRjb25zdCBwb3NpdGlvbiA9IHRoaXMucG9zaXRpb247XG5cdFx0bGV0IG92ZXJsYXlQb3NpdGlvbjogT3ZlcmxheUNvbm5lY3Rpb25Qb3NpdGlvbjtcblxuXHRcdGlmIChwb3NpdGlvbiA9PT0gJ2Fib3ZlJykge1xuXHRcdFx0b3ZlcmxheVBvc2l0aW9uID0geyBvdmVybGF5WDogJ2NlbnRlcicsIG92ZXJsYXlZOiAnYm90dG9tJyB9O1xuXHRcdH0gZWxzZSBpZiAocG9zaXRpb24gPT09ICdiZWxvdycpIHtcblx0XHRcdG92ZXJsYXlQb3NpdGlvbiA9IHsgb3ZlcmxheVg6ICdjZW50ZXInLCBvdmVybGF5WTogJ3RvcCcgfTtcblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0cG9zaXRpb24gPT09ICdiZWZvcmUnIHx8XG5cdFx0XHQocG9zaXRpb24gPT09ICdsZWZ0JyAmJiBpc0x0cikgfHxcblx0XHRcdChwb3NpdGlvbiA9PT0gJ3JpZ2h0JyAmJiAhaXNMdHIpKSB7XG5cdFx0XHRvdmVybGF5UG9zaXRpb24gPSB7IG92ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICdjZW50ZXInIH07XG5cdFx0fSBlbHNlIGlmIChcblx0XHRcdHBvc2l0aW9uID09PSAnYWZ0ZXInIHx8XG5cdFx0XHQocG9zaXRpb24gPT09ICdyaWdodCcgJiYgaXNMdHIpIHx8XG5cdFx0XHQocG9zaXRpb24gPT09ICdsZWZ0JyAmJiAhaXNMdHIpKSB7XG5cdFx0XHRvdmVybGF5UG9zaXRpb24gPSB7IG92ZXJsYXlYOiAnc3RhcnQnLCBvdmVybGF5WTogJ2NlbnRlcicgfTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgZ2V0UG9wb3ZlckludmFsaWRQb3NpdGlvbkVycm9yKHBvc2l0aW9uKTtcblx0XHR9XG5cblx0XHRjb25zdCB7IHgsIHkgfSA9IHRoaXMuX2ludmVydFBvc2l0aW9uKG92ZXJsYXlQb3NpdGlvbi5vdmVybGF5WCwgb3ZlcmxheVBvc2l0aW9uLm92ZXJsYXlZKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRtYWluOiBvdmVybGF5UG9zaXRpb24sXG5cdFx0XHRmYWxsYmFjazogeyBvdmVybGF5WDogeCwgb3ZlcmxheVk6IHkgfSxcblx0XHR9O1xuXHR9XG5cblx0LyoqIFVwZGF0ZXMgdGhlIHBvcG92ZXIgbWVzc2FnZSBhbmQgcmVwb3NpdGlvbnMgdGhlIG92ZXJsYXkgYWNjb3JkaW5nIHRvIHRoZSBuZXcgbWVzc2FnZSBsZW5ndGggKi9cblx0cHJvdGVjdGVkIF91cGRhdGVDb250ZW50KCkge1xuXHRcdC8vIE11c3Qgd2FpdCBmb3IgdGhlIG1lc3NhZ2UgdG8gYmUgcGFpbnRlZCB0byB0aGUgcG9wb3ZlciBzbyB0aGF0IHRoZSBvdmVybGF5IGNhbiBwcm9wZXJseVxuXHRcdC8vIGNhbGN1bGF0ZSB0aGUgY29ycmVjdCBwb3NpdGlvbmluZyBiYXNlZCBvbiB0aGUgc2l6ZSBvZiB0aGUgdGV4dC5cblx0XHRpZiAodGhpcy5fcG9wb3Zlckluc3RhbmNlKSB7XG5cdFx0XHR0aGlzLl9wb3BvdmVySW5zdGFuY2UuY29udGVudCA9IHRoaXMuY29udGVudDtcblx0XHRcdHRoaXMuX3BvcG92ZXJJbnN0YW5jZS5tYXJrRm9yQ2hlY2soKTtcblxuXHRcdFx0dGhpcy5fbmdab25lLm9uTWljcm90YXNrRW1wdHkuYXNPYnNlcnZhYmxlKCkucGlwZShcblx0XHRcdFx0dGFrZSgxKSxcblx0XHRcdFx0dGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCksXG5cdFx0XHQpLnN1YnNjcmliZSgoKSA9PiB7XG5cdFx0XHRcdGlmICh0aGlzLl9wb3BvdmVySW5zdGFuY2UpIHtcblx0XHRcdFx0XHR0aGlzLl9vdmVybGF5UmVmIS51cGRhdGVQb3NpdGlvbigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHQvKiogSW52ZXJ0cyBhbiBvdmVybGF5IHBvc2l0aW9uLiAqL1xuXHRwcml2YXRlIF9pbnZlcnRQb3NpdGlvbih4OiBIb3Jpem9udGFsQ29ubmVjdGlvblBvcywgeTogVmVydGljYWxDb25uZWN0aW9uUG9zKSB7XG5cdFx0aWYgKHRoaXMucG9zaXRpb24gPT09ICdhYm92ZScgfHwgdGhpcy5wb3NpdGlvbiA9PT0gJ2JlbG93Jykge1xuXHRcdFx0aWYgKHkgPT09ICd0b3AnKSB7XG5cdFx0XHRcdHkgPSAnYm90dG9tJztcblx0XHRcdH0gZWxzZSBpZiAoeSA9PT0gJ2JvdHRvbScpIHtcblx0XHRcdFx0eSA9ICd0b3AnO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoeCA9PT0gJ2VuZCcpIHtcblx0XHRcdFx0eCA9ICdzdGFydCc7XG5cdFx0XHR9IGVsc2UgaWYgKHggPT09ICdzdGFydCcpIHtcblx0XHRcdFx0eCA9ICdlbmQnO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7IHgsIHkgfTtcblx0fVxuXG5cdC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1lbXB0eVxuXHRwcm90ZWN0ZWQgX2JpbmRFdmVudHMocGxhdGZvcm06IFBsYXRmb3JtLCBoYW1tZXJMb2FkZXI6IEhhbW1lckxvYWRlcik6IHZvaWQgeyB9XG59XG5cbi8vIENhbiB0aGlzIGJlIHJldHJpZXZlZCBmcm9tIGNvbXBpbGVkIGNvZGU/Pz9cbmV4cG9ydCBjb25zdCBHSE9TVF9SSURFUl9QT1BPVkVSX1NUQVRJQ19QUk9WSURFUjogQ29uc3RydWN0b3JQcm92aWRlciA9IHtcblx0cHJvdmlkZTogUG9wb3Zlcixcblx0ZGVwczogW1xuXHRcdE92ZXJsYXksXG5cdFx0RWxlbWVudFJlZixcblx0XHRTY3JvbGxEaXNwYXRjaGVyLFxuXHRcdFZpZXdDb250YWluZXJSZWYsXG5cdFx0Tmdab25lLFxuXHRcdFBsYXRmb3JtLFxuXHRcdEFyaWFEZXNjcmliZXIsXG5cdFx0Rm9jdXNNb25pdG9yLFxuXHRcdERPQ1VNRU5ULFxuXHRcdEdIT1NUX1JJREVSX1BPUE9WRVJfU0NST0xMX1NUUkFURUdZLFxuXHRcdEdIT1NUX1JJREVSX1BPUE9WRVJfUE9TSVRJT05fU1RSQVRFR1ksXG5cdFx0R0hPU1RfUklERVJfUE9QT1ZFUl9DT05UQUlORVIsXG5cdFx0W25ldyBPcHRpb25hbCgpLCBEaXJlY3Rpb25hbGl0eV0sXG5cdFx0W25ldyBPcHRpb25hbCgpLCBHSE9TVF9SSURFUl9QT1BPVkVSX0RFRkFVTFRfT1BUSU9OU10sXG5cdFx0W25ldyBPcHRpb25hbCgpLCBIQU1NRVJfTE9BREVSXSxcblx0XSxcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29ubmVjdGlvblBvc2l0aW9uczxUIGV4dGVuZHMgT3ZlcmxheUNvbm5lY3Rpb25Qb3NpdGlvbiB8IE9yaWdpbkNvbm5lY3Rpb25Qb3NpdGlvbj4ge1xuXHRtYWluOiBUO1xuXHRmYWxsYmFjazogVDtcbn1cblxuZnVuY3Rpb24gYnVpbGRDb25uZWN0ZWRQb3NpdGlvbnMoXG5cdG9yaWdpbjogQ29ubmVjdGlvblBvc2l0aW9uczxPcmlnaW5Db25uZWN0aW9uUG9zaXRpb24+LFxuXHRvdmVybGF5OiBDb25uZWN0aW9uUG9zaXRpb25zPE92ZXJsYXlDb25uZWN0aW9uUG9zaXRpb24+LFxuXHRudWJiaW5Qb3NpdGlvbjogUG9wb3Zlck51YmJpblBvc2l0aW9uLFxuXHRvZmZzZXRzOiBQb3BvdmVyTnViYmluT2Zmc2V0cyxcbik6IENvbm5lY3RlZFBvc2l0aW9uW10ge1xuXHRjb25zdCBtYWluOiBDb25uZWN0ZWRQb3NpdGlvbiA9IHsgLi4ub3JpZ2luLm1haW4sIC4uLm92ZXJsYXkubWFpbiB9O1xuXHRjb25zdCBmYWxsYmFjazogQ29ubmVjdGVkUG9zaXRpb24gPSB7IC4uLm9yaWdpbi5mYWxsYmFjaywgLi4ub3ZlcmxheS5mYWxsYmFjayB9O1xuXG5cdGNvbnN0IHBvc2l0aW9uczogQ29ubmVjdGVkUG9zaXRpb25bXSA9IFtcblx0XHQuLi5idWlsZFBvc2l0aW9uc0Zvck51YmJpbihtYWluLCBudWJiaW5Qb3NpdGlvbiksXG5cdFx0Li4uYnVpbGRQb3NpdGlvbnNGb3JOdWJiaW4oZmFsbGJhY2ssIG51YmJpblBvc2l0aW9uKSxcblx0XTtcblxuXHQvLyBBZGQgb2Zmc2V0cyBmb3IgZWFjaCBwb3NpdGlvbiBzbyB0aGF0IHRvb2x0aXAgbnViYmluIGlzIHBvaW50aW5nIHRvd2FyZHMgb3JpZ2luIHBvaW50XG5cdHBvc2l0aW9ucy5mb3JFYWNoKChwb3NpdGlvbikgPT4ge1xuXHRcdGlmIChwb3NpdGlvbi5vcmlnaW5ZICE9PSAnY2VudGVyJykgeyAvLyBUb3AvQm90dG9tXG5cdFx0XHRwb3NpdGlvbi5vZmZzZXRZID0gb2Zmc2V0cy5wZXJwZW5kaWN1bGFyICogUE9QT1ZFUl9OVUJCSU5fT0ZGU0VUX01VTFRJUExJRVJTW3Bvc2l0aW9uLm9yaWdpblldO1xuXG5cdFx0XHRpZiAocG9zaXRpb24ub3ZlcmxheVggIT09ICdjZW50ZXInKSB7XG5cdFx0XHRcdHBvc2l0aW9uLm9mZnNldFggPSBvZmZzZXRzLnBhcmFsbGVsICogUE9QT1ZFUl9OVUJCSU5fT0ZGU0VUX01VTFRJUExJRVJTW3Bvc2l0aW9uLm92ZXJsYXlYXTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHBvc2l0aW9uLm9yaWdpblggIT09ICdjZW50ZXInKSB7IC8vIExlZnQvUmlnaHRcblx0XHRcdHBvc2l0aW9uLm9mZnNldFggPSBvZmZzZXRzLnBlcnBlbmRpY3VsYXIgKiBQT1BPVkVSX05VQkJJTl9PRkZTRVRfTVVMVElQTElFUlNbcG9zaXRpb24ub3JpZ2luWF07XG5cblx0XHRcdGlmIChwb3NpdGlvbi5vdmVybGF5WSAhPT0gJ2NlbnRlcicpIHtcblx0XHRcdFx0cG9zaXRpb24ub2Zmc2V0WSA9IG9mZnNldHMucGFyYWxsZWwgKiBQT1BPVkVSX05VQkJJTl9PRkZTRVRfTVVMVElQTElFUlNbcG9zaXRpb24ub3ZlcmxheVldO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0cmV0dXJuIHBvc2l0aW9ucztcbn1cblxuY29uc3QgUE9QT1ZFUl9OVUJCSU5fT0ZGU0VUX01VTFRJUExJRVJTID0ge1xuXHR0b3A6IC0xLFxuXHRib3R0b206IDEsXG5cdHN0YXJ0OiAtMSxcblx0ZW5kOiAxLFxufTtcblxuLy8gQnVpbGRzIGFkZGl0aW9uYWwgcG9zaXRpb25zIGZvciBcInN0YXJ0XCIvXCJlbmRcIiBudWJiaW5zXG4vLyBJLkUuIGJvdHRvbSAtPiBbIGJvdHRvbS1sZWZ0LCBib3R0b20tcmlnaHQgXVxuZnVuY3Rpb24gYnVpbGRQb3NpdGlvbnNGb3JOdWJiaW4oXG5cdHBvc2l0aW9uOiBDb25uZWN0ZWRQb3NpdGlvbixcblx0bnViYmluUG9zaXRpb246IFBvcG92ZXJOdWJiaW5Qb3NpdGlvbixcbik6IENvbm5lY3RlZFBvc2l0aW9uW10ge1xuXHRpZiAobnViYmluUG9zaXRpb24gPT09ICdub25lJykge1xuXHRcdHJldHVybiBbcG9zaXRpb25dO1xuXHR9XG5cdGlmIChwb3NpdGlvbi5vcmlnaW5YID09PSAnY2VudGVyJykgeyAvLyBUb3AvQm90dG9tXG5cdFx0aWYgKG51YmJpblBvc2l0aW9uID09PSAnYXV0bycpIHtcblx0XHRcdHJldHVybiBbXG5cdFx0XHRcdHBvc2l0aW9uLFxuXHRcdFx0XHR7IC4uLnBvc2l0aW9uLCBvdmVybGF5WDogJ3N0YXJ0JyB9LFxuXHRcdFx0XHR7IC4uLnBvc2l0aW9uLCBvdmVybGF5WDogJ2VuZCcgfSxcblx0XHRcdF07XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBbXG5cdFx0XHRcdHsgLi4ucG9zaXRpb24sIG92ZXJsYXlYOiBudWJiaW5Qb3NpdGlvbiB9LFxuXHRcdFx0XTtcblx0XHR9XG5cdH0gZWxzZSB7IC8vIExlZnQvUmlnaHRcblx0XHRpZiAobnViYmluUG9zaXRpb24gPT09ICdhdXRvJykge1xuXHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0cG9zaXRpb24sXG5cdFx0XHRcdHsgLi4ucG9zaXRpb24sIG92ZXJsYXlZOiAnYm90dG9tJyB9LFxuXHRcdFx0XHR7IC4uLnBvc2l0aW9uLCBvdmVybGF5WTogJ3RvcCcgfSxcblx0XHRcdF07XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBbXG5cdFx0XHRcdHsgLi4ucG9zaXRpb24sIG92ZXJsYXlZOiBudWJiaW5Qb3NpdGlvbiA9PT0gJ3N0YXJ0JyA/ICd0b3AnIDogJ2JvdHRvbScgfSxcblx0XHRcdF07XG5cdFx0fVxuXHR9XG59XG4iXX0=