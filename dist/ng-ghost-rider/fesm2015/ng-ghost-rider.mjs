import * as i2 from '@angular/cdk/portal';
import { TemplatePortal, ComponentPortal, PortalModule } from '@angular/cdk/portal';
import * as i1$2 from '@angular/cdk/overlay';
import { Overlay, ConnectedOverlayPositionChange, validateHorizontalPosition, validateVerticalPosition, OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import * as i1 from '@angular/common';
import { DOCUMENT, CommonModule } from '@angular/common';
import * as i0 from '@angular/core';
import { InjectionToken, Component, Inject, Injectable, ElementRef, Directive, Optional, ViewContainerRef, NgZone, Injector, EventEmitter, Output, HostListener, Input, NgModule } from '@angular/core';
import { Subject, Subscription, BehaviorSubject, of, defer } from 'rxjs';
import { takeUntil, take, first, startWith, last } from 'rxjs/operators';
import { HAMMER_LOADER } from '@angular/platform-browser';
import * as i4 from '@angular/cdk/a11y';
import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import * as i5 from '@angular/cdk/bidi';
import { Directionality } from '@angular/cdk/bidi';
import { coerceCssPixelValue, coerceArray, coerceBooleanProperty } from '@angular/cdk/coercion';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import * as i3 from '@angular/cdk/platform';
import { Platform } from '@angular/cdk/platform';
import * as i1$1 from '@angular/cdk/scrolling';
import { ViewportRuler, ScrollDispatcher } from '@angular/cdk/scrolling';

var GhostRiderEventType;
(function (GhostRiderEventType) {
    GhostRiderEventType[GhostRiderEventType["Start"] = 0] = "Start";
    GhostRiderEventType[GhostRiderEventType["Next"] = 1] = "Next";
    GhostRiderEventType[GhostRiderEventType["Back"] = 2] = "Back";
    GhostRiderEventType[GhostRiderEventType["Close"] = 3] = "Close";
    GhostRiderEventType[GhostRiderEventType["Complete"] = 4] = "Complete";
})(GhostRiderEventType || (GhostRiderEventType = {}));
var GhostRiderEventSource;
(function (GhostRiderEventSource) {
    GhostRiderEventSource[GhostRiderEventSource["Directive"] = 0] = "Directive";
    GhostRiderEventSource[GhostRiderEventSource["Popover"] = 1] = "Popover";
    GhostRiderEventSource[GhostRiderEventSource["Manual"] = 2] = "Manual";
})(GhostRiderEventSource || (GhostRiderEventSource = {}));

const GHOST_RIDER_NAVIGATION = new InjectionToken('GhostRiderNavigation');

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class PopoverComponent {
    constructor(_cdr) {
        this._cdr = _cdr;
        /** Property watched by the animation framework to show or hide the tooltip */
        this._visibility = 'initial';
        /** Subject for notifying that the tooltip has been hidden from the view */
        this._onHide = new Subject();
        /** Subject for notifying that the tooltip has been made visible */
        this._onShow = new Subject();
    }
    set content(content) {
        this.contentText = this.contentTpl = this.contentCmp = null;
        if (typeof content === 'string') {
            this.contentText = content;
        }
        else if (content instanceof TemplatePortal) {
            this.contentTpl = content;
        }
        else if (content instanceof ComponentPortal) {
            this.contentCmp = content;
        }
    }
    get position() { return this._position; }
    set position(pos) {
        if (pos !== this._position) {
            this._position = pos;
            this.nubbinCls = pos ? `ghost-rider-nubbin_${getNubbinPosition(pos)}` : null;
            this._cdr.markForCheck();
        }
    }
    get hasTimeout() { return !!this._showTimeoutId || !!this._hideTimeoutId; }
    ngOnDestroy() {
        this._onHide.complete();
        this._onShow.complete();
    }
    /**
     * Shows the tooltip with an animation originating from the provided origin
     * @param delay Amount of milliseconds to the delay showing the tooltip.
     */
    show(delay) {
        // Cancel the delayed hide if it is scheduled
        if (this._hideTimeoutId) {
            clearTimeout(this._hideTimeoutId);
            this._hideTimeoutId = null;
        }
        this._showTimeoutId = setTimeout(() => {
            this._visibility = 'visible';
            this._showTimeoutId = null;
            this._onShow.next(null);
            // Mark for check so if any parent component has set the
            // ChangeDetectionStrategy to OnPush it will be checked anyways
            this._cdr.markForCheck();
        }, delay);
    }
    /**
     * Begins the animation to hide the tooltip after the provided delay in ms.
     * @param delay Amount of milliseconds to delay showing the tooltip.
     */
    hide(delay) {
        // Cancel the delayed show if it is scheduled
        if (this._showTimeoutId) {
            clearTimeout(this._showTimeoutId);
            this._showTimeoutId = null;
        }
        this._hideTimeoutId = setTimeout(() => {
            this._visibility = 'hidden';
            this._hideTimeoutId = null;
            this._onHide.next(null);
            // Mark for check so if any parent component has set the
            // ChangeDetectionStrategy to OnPush it will be checked anyways
            this._cdr.markForCheck();
        }, delay);
    }
    /** Returns an observable that notifies when the tooltip has been hidden from view. */
    afterHidden() {
        return this._onHide.asObservable();
    }
    /** Returns an observable that notifies when the tooltip has been made visible. */
    afterVisible() {
        return this._onShow.asObservable();
    }
    /** Whether the tooltip is being displayed. */
    isVisible() {
        return this._visibility === 'visible';
    }
    markForCheck() {
        this._cdr.markForCheck();
    }
}
PopoverComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: PopoverComponent, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
PopoverComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.0.4", type: PopoverComponent, selector: "ghost-rider-popover", ngImport: i0, template: `
		<div
			class="ghost-rider-popover"
			[ngClass]="nubbinCls"
			[class.ghost-rider-popover_tooltip]="isTooltip"
			[attr.role]="isTooltip ? 'tooltip' : 'dialog'"
		>
			<div class="ghost-rider-popover__body">
				<ng-container [cdkPortalOutlet]="contentCmp || contentTpl || contentTextTpl"></ng-container>
			</div>
		</div>

		<ng-template
			cdkPortal
			#contentTextTpl="cdkPortal"
		>
			{{ contentText }}
		</ng-template>
	`, isInline: true, dependencies: [{ kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i2.CdkPortal, selector: "[cdkPortal]", exportAs: ["cdkPortal"] }, { kind: "directive", type: i2.CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: PopoverComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ghost-rider-popover',
                    template: `
		<div
			class="ghost-rider-popover"
			[ngClass]="nubbinCls"
			[class.ghost-rider-popover_tooltip]="isTooltip"
			[attr.role]="isTooltip ? 'tooltip' : 'dialog'"
		>
			<div class="ghost-rider-popover__body">
				<ng-container [cdkPortalOutlet]="contentCmp || contentTpl || contentTextTpl"></ng-container>
			</div>
		</div>

		<ng-template
			cdkPortal
			#contentTextTpl="cdkPortal"
		>
			{{ contentText }}
		</ng-template>
	`,
                }]
        }], ctorParameters: function () { return [{ type: i0.ChangeDetectorRef }]; } });
function getNubbinPosition(position) {
    const positions = [];
    if (position.originY !== 'center') { // TopBottom
        positions.push(position.originY === 'bottom' ? 'top' : 'bottom');
        if (position.overlayX !== 'center') {
            positions.push(position.overlayX === 'start' ? 'left' : 'right');
        }
    }
    else { // Left/Right
        positions.push(position.originX === 'end' ? 'left' : 'right');
        if (position.overlayY !== 'center') {
            positions.push(position.overlayY);
        }
    }
    return (positions.length ? positions.join('-') : null);
}

class GhostRiderStepComponent extends PopoverComponent {
    constructor(_navigation, cdr) {
        var _a;
        super(cdr);
        this._navigation = _navigation;
        this.isSubStep = !!this._navigation.tourGuide.activeStep.parent;
        this.stepName = this._navigation.tourGuide.activeStep.name;
        this.hasSubSteps = this._navigation.tourGuide.activeStep.hasSubSteps;
        if (this.isSubStep) {
            const siblings = (_a = this._navigation.tourGuide.activeStep.parent) === null || _a === void 0 ? void 0 : _a.subSteps;
            if (siblings) {
                this.stepIndex = siblings.indexOf(this._navigation.tourGuide.activeStep);
                this.stepCount = siblings.length;
            }
        }
        else {
            this.stepIndex = this._navigation.tourGuide.currentStep;
            this.stepCount = this._navigation.tourGuide.steps.length;
        }
        this.isLastStep = this.stepIndex === this.stepCount - 1;
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    next() {
        if (this.details.nextIsHide) {
            this._navigation.hideStep();
        }
        else {
            this._navigation.next(GhostRiderEventSource.Popover);
        }
    }
    nextSubStep() {
        this._navigation.nextSubStep(GhostRiderEventSource.Popover);
    }
    previousSubStep() {
        this._navigation.previousSubStep(GhostRiderEventSource.Popover);
    }
    goToParent() {
        this._navigation.goToParent(GhostRiderEventSource.Popover);
    }
    back() {
        this._navigation.back(GhostRiderEventSource.Popover);
    }
    close() {
        this._navigation.close(GhostRiderEventSource.Popover);
    }
    complete() {
        this._navigation.complete(GhostRiderEventSource.Popover);
    }
}
GhostRiderStepComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepComponent, deps: [{ token: GHOST_RIDER_NAVIGATION }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
GhostRiderStepComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.0.4", type: GhostRiderStepComponent, selector: "ghost-rider-step", usesInheritance: true, ngImport: i0, template: `
		<div
			class="ghost-rider-popover"
			[ngClass]="nubbinCls"
			role="dialog"
		>
			<div class="ghost-rider-popover__header">
				<h2 class="ghost-rider_title">{{ details.title || '&nbsp;' }}</h2>
				<div
					(click)="close()"
					class="ghost-rider_close-button"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						role="img"
						width="1.3em"
						height="1.3em"
						preserveAspectRatio="xMidYMid meet"
						viewBox="0 0 1024 1024"
					>
						<path
							fill="currentColor"
							d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504L738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512L828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496L285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512L195.2 285.696a64 64 0 0 1 0-90.496z"
						/>
					</svg>
				</div>
			</div>

			<div class="ghost-rider-popover__body">
				<ng-container [cdkPortalOutlet]="contentCmp || contentTpl || contentTextTpl"></ng-container>
			</div>

			<div class="ghost-rider-popover__footer">
				<span>
					Step {{ stepIndex + 1 }} of {{ stepCount }}
				</span>
				<div>
					<button
						(click)="back()"
						*ngIf="stepIndex > 0"
						class="ghost-rider_back-button"
					>
						Back
					</button>
					<button
						(click)="next()"
						*ngIf="!isLastStep"
						class="ghost-rider_next-button"
					>
						Next
					</button>
					<button
						(click)="complete()"
						*ngIf="isLastStep"
						class="ghost-rider_complete-button"
					>
						Complete
					</button>
				</div>
			</div>
		</div>

		<ng-template
			cdkPortal
			#contentTextTpl="cdkPortal"
		>
			{{ contentText }}
		</ng-template>
	`, isInline: true, dependencies: [{ kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.CdkPortal, selector: "[cdkPortal]", exportAs: ["cdkPortal"] }, { kind: "directive", type: i2.CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ghost-rider-step', template: `
		<div
			class="ghost-rider-popover"
			[ngClass]="nubbinCls"
			role="dialog"
		>
			<div class="ghost-rider-popover__header">
				<h2 class="ghost-rider_title">{{ details.title || '&nbsp;' }}</h2>
				<div
					(click)="close()"
					class="ghost-rider_close-button"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						role="img"
						width="1.3em"
						height="1.3em"
						preserveAspectRatio="xMidYMid meet"
						viewBox="0 0 1024 1024"
					>
						<path
							fill="currentColor"
							d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504L738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512L828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496L285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512L195.2 285.696a64 64 0 0 1 0-90.496z"
						/>
					</svg>
				</div>
			</div>

			<div class="ghost-rider-popover__body">
				<ng-container [cdkPortalOutlet]="contentCmp || contentTpl || contentTextTpl"></ng-container>
			</div>

			<div class="ghost-rider-popover__footer">
				<span>
					Step {{ stepIndex + 1 }} of {{ stepCount }}
				</span>
				<div>
					<button
						(click)="back()"
						*ngIf="stepIndex > 0"
						class="ghost-rider_back-button"
					>
						Back
					</button>
					<button
						(click)="next()"
						*ngIf="!isLastStep"
						class="ghost-rider_next-button"
					>
						Next
					</button>
					<button
						(click)="complete()"
						*ngIf="isLastStep"
						class="ghost-rider_complete-button"
					>
						Complete
					</button>
				</div>
			</div>
		</div>

		<ng-template
			cdkPortal
			#contentTextTpl="cdkPortal"
		>
			{{ contentText }}
		</ng-template>
	` }]
        }], ctorParameters: function () {
        return [{ type: undefined, decorators: [{
                        type: Inject,
                        args: [GHOST_RIDER_NAVIGATION]
                    }] }, { type: i0.ChangeDetectorRef }];
    } });

/** Time in ms to throttle repositioning after scroll events. */
const SCROLL_THROTTLE_MS = 20;
/** Injection token that determines the scroll handling while a popover is visible. */
const GHOST_RIDER_POPOVER_SCROLL_STRATEGY = new InjectionToken('GhostRiderPopoverScrollStrategy');
/** @docs-private */
function GHOST_RIDER_POPOVER_SCROLL_STRATEGY_FACTORY(overlay) {
    return () => overlay.scrollStrategies.reposition({
        scrollThrottle: SCROLL_THROTTLE_MS
    });
}
/** @docs-private */
const GHOST_RIDER_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: GHOST_RIDER_POPOVER_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: GHOST_RIDER_POPOVER_SCROLL_STRATEGY_FACTORY,
};

class GhostRiderRootPopoverContainer {
    constructor(document, _viewportRuler) {
        this._viewportRuler = _viewportRuler;
        this._document = document;
    }
    getBoundingClientRect() {
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
        };
    }
}
GhostRiderRootPopoverContainer.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderRootPopoverContainer, deps: [{ token: DOCUMENT }, { token: i1$1.ViewportRuler }], target: i0.ɵɵFactoryTarget.Injectable });
GhostRiderRootPopoverContainer.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderRootPopoverContainer, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderRootPopoverContainer, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () {
        return [{ type: undefined, decorators: [{
                        type: Inject,
                        args: [DOCUMENT]
                    }] }, { type: i1$1.ViewportRuler }];
    } });

const GHOST_RIDER_POPOVER_CONTAINER = new InjectionToken('GhostRiderPopoverContainer');
const GHOST_RIDER_POPOVER_CONTAINER_FACTORY_PROVIDER = {
    provide: GHOST_RIDER_POPOVER_CONTAINER,
    useExisting: GhostRiderRootPopoverContainer,
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Class to be added to the overlay bounding box. */
const boundingBoxClass = 'cdk-overlay-connected-position-bounding-box';
/** Injection token that determines the position handling while a popover is visible. */
const GHOST_RIDER_POPOVER_POSITION_STRATEGY = new InjectionToken('PopoverPositionStrategy');
/**
 * A strategy for positioning overlays. Using this strategy, an overlay is given an
 * implicit position relative some origin element. The relative position is defined in terms of
 * a point on the origin element that is connected to a point on the overlay element. For example,
 * a basic dropdown is connecting the bottom-left corner of the origin to the top-left corner
 * of the overlay.
 */
class PopoverPositionStrategy {
    constructor(connectedTo, _viewportRuler, _document, _platform, _overlayContainer, _rootContainer) {
        this._viewportRuler = _viewportRuler;
        this._document = _document;
        this._platform = _platform;
        this._overlayContainer = _overlayContainer;
        this._rootContainer = _rootContainer;
        /** Last size used for the bounding box. Used to avoid resizing the overlay after open. */
        this._lastBoundingBoxSize = { width: 0, height: 0 };
        /** Whether the overlay was pushed in a previous positioning. */
        this._isPushed = false;
        /** Whether the overlay can be pushed on-screen on the initial open. */
        this._canPush = true;
        /** Whether the overlay can grow via flexible width/height after the initial open. */
        this._growAfterOpen = false;
        /** Whether the overlay's width and height can be constrained to fit within the viewport. */
        this._hasFlexibleDimensions = false;
        /** Whether the overlay position is locked. */
        this._positionLocked = false;
        /** Amount of space that must be maintained between the overlay and the edge of the viewport. */
        this._viewportMargin = 8;
        /** The Scrollable containers used to check scrollable view properties on position change. */
        this._scrollables = [];
        this._container = this._rootContainer;
        /** Ordered list of preferred positions, from most to least desirable. */
        this._preferredPositions = [];
        /** Subject that emits whenever the position changes. */
        this._positionChanges = new Subject();
        /** Subscription to viewport size changes. */
        this._resizeSubscription = Subscription.EMPTY;
        /** Default offset for the overlay along the x axis. */
        this._offsetX = 0;
        /** Default offset for the overlay along the y axis. */
        this._offsetY = 0;
        /** Selector to be used when finding the elements on which to set the transform origin. */
        this._transformOriginSelector = '.ghost-rider-popover';
        /** Keeps track of the CSS classes that the position strategy has applied on the overlay panel. */
        this._appliedPanelClasses = [];
        /** Observable sequence of position changes. */
        this.positionChanges = this._positionChanges.asObservable();
        this.setOrigin(connectedTo);
    }
    /** Ordered list of preferred positions, from most to least desirable. */
    get positions() {
        return this._preferredPositions;
    }
    /** Attaches this position strategy to an overlay. */
    attach(overlayRef) {
        if (this._overlayRef && overlayRef !== this._overlayRef) {
            throw Error('This position strategy is already attached to an overlay');
        }
        this._validatePositions();
        overlayRef.hostElement.classList.add(boundingBoxClass);
        this._overlayRef = overlayRef;
        this._boundingBox = overlayRef.hostElement;
        this._pane = overlayRef.overlayElement;
        this._isDisposed = false;
        this._isInitialRender = true;
        this._lastPosition = null;
        this._resizeSubscription.unsubscribe();
        this._resizeSubscription = this._viewportRuler.change().subscribe(() => {
            // When the window is resized, we want to trigger the next reposition as if it
            // was an initial render, in order for the strategy to pick a new optimal position,
            // otherwise position locking will cause it to stay at the old one.
            this._isInitialRender = true;
            this.apply();
        });
    }
    /**
     * Updates the position of the overlay element, using whichever preferred position relative
     * to the origin best fits on-screen.
     *
     * The selection of a position goes as follows:
     *  - If any positions fit completely within the viewport as-is,
     *      choose the first position that does so.
     *  - If flexible dimensions are enabled and at least one satifies the given minimum width/height,
     *      choose the position with the greatest available size modified by the positions' weight.
     *  - If pushing is enabled, take the position that went off-screen the least and push it
     *      on-screen.
     *  - If none of the previous criteria were met, use the position that goes off-screen the least.
     * @docs-private
     */
    apply() {
        // We shouldn't do anything if the strategy was disposed or we're on the server.
        if (this._isDisposed || !this._platform.isBrowser) {
            return;
        }
        // If the position has been applied already (e.g. when the overlay was opened) and the
        // consumer opted into locking in the position, re-use the old position, in order to
        // prevent the overlay from jumping around.
        if (!this._isInitialRender && this._positionLocked && this._lastPosition) {
            this.reapplyLastPosition();
            return;
        }
        this._clearPanelClasses();
        this._resetOverlayElementStyles();
        this._resetBoundingBoxStyles();
        // We need the bounding rects for the origin and the overlay to determine how to position
        // the overlay relative to the origin.
        // We use the viewport rect to determine whether a position would go off-screen.
        this._viewportRect = this._getNarrowedRect(this._rootContainer);
        this._originRect = this._getOriginRect();
        this._overlayRect = this._pane.getBoundingClientRect();
        this._containerRect = this._getNarrowedRect(this._container);
        const originRect = this._originRect;
        const overlayRect = this._overlayRect;
        const viewportRect = this._viewportRect;
        const containerRect = this._containerRect;
        // Positions where the overlay will fit with flexible dimensions.
        const flexibleFits = [];
        // Fallback if none of the preferred positions fit within the viewport.
        let fallback;
        // Go through each of the preferred positions looking for a good fit.
        // If a good fit is found, it will be applied immediately.
        for (const pos of this._preferredPositions) {
            // Get the exact (x, y) coordinate for the point-of-origin on the origin element.
            const originPoint = this._getOriginPoint(originRect, pos);
            // From that point-of-origin, get the exact (x, y) coordinate for the top-left corner of the
            // overlay in this position. We use the top-left corner for calculations and later translate
            // this into an appropriate (top, left, bottom, right) style.
            const overlayPoint = this._getOverlayPoint(originPoint, overlayRect, pos);
            // Calculate how well the overlay would fit into the viewport with this point.
            const overlayFit = this._getOverlayFit(overlayPoint, overlayRect, containerRect, pos);
            // If the overlay, without any further work, fits into the viewport, use this position.
            if (overlayFit.isCompletelyWithinViewport) {
                this._isPushed = false;
                this._applyPosition(pos, originPoint);
                return;
            }
            // If the overlay has flexible dimensions, we can use this position
            // so long as there's enough space for the minimum dimensions.
            if (this._canFitWithFlexibleDimensions(overlayFit, overlayPoint, viewportRect)) {
                // Save positions where the overlay will fit with flexible dimensions. We will use these
                // if none of the positions fit *without* flexible dimensions.
                flexibleFits.push({
                    position: pos,
                    origin: originPoint,
                    overlayRect,
                    boundingBoxRect: this._calculateBoundingBoxRect(originPoint, pos),
                });
                continue;
            }
            // If the current preferred position does not fit on the screen, remember the position
            // if it has more visible area on-screen than we've seen and move onto the next preferred
            // position.
            if (!fallback || fallback.overlayFit.visibleArea < overlayFit.visibleArea) {
                fallback = { overlayFit, overlayPoint, originPoint, position: pos, overlayRect };
            }
        }
        // If there are any positions where the overlay would fit with flexible dimensions, choose the
        // one that has the greatest area available modified by the position's weight
        if (flexibleFits.length) {
            let bestFit = null;
            let bestScore = -1;
            for (const fit of flexibleFits) {
                const score = fit.boundingBoxRect.width * fit.boundingBoxRect.height * (fit.position.weight || 1);
                if (score > bestScore) {
                    bestScore = score;
                    bestFit = fit;
                }
            }
            this._isPushed = false;
            this._applyPosition(bestFit.position, bestFit.origin);
            return;
        }
        // When none of the preferred positions fit within the viewport, take the position
        // that went off-screen the least and attempt to push it on-screen.
        if (this._canPush) {
            this._isPushed = true;
            this._applyPosition(fallback.position, fallback.originPoint);
            return;
        }
        // All options for getting the overlay within the viewport have been exhausted, so go with the
        // position that went off-screen the least.
        this._applyPosition(fallback.position, fallback.originPoint);
    }
    detach() {
        this._clearPanelClasses();
        this._lastPosition = null;
        this._previousPushAmount = null;
        this._resizeSubscription.unsubscribe();
    }
    /** Cleanup after the element gets destroyed. */
    dispose() {
        if (this._isDisposed) {
            return;
        }
        // We can't use `_resetBoundingBoxStyles` here, because it resets
        // some properties to zero, rather than removing them.
        if (this._boundingBox) {
            extendStyles(this._boundingBox.style, {
                top: '',
                left: '',
                right: '',
                bottom: '',
                height: '',
                width: '',
                alignItems: '',
                justifyContent: '',
            });
        }
        if (this._pane) {
            this._resetOverlayElementStyles();
        }
        if (this._overlayRef) {
            this._overlayRef.hostElement.classList.remove(boundingBoxClass);
        }
        this.detach();
        this._positionChanges.complete();
        this._overlayRef = this._boundingBox = null;
        this._isDisposed = true;
    }
    /**
     * This re-aligns the overlay element with the trigger in its last calculated position,
     * even if a position higher in the "preferred positions" list would now fit. This
     * allows one to re-align the panel without changing the orientation of the panel.
     */
    reapplyLastPosition() {
        if (!this._isDisposed && (!this._platform || this._platform.isBrowser)) {
            this._originRect = this._getOriginRect();
            this._overlayRect = this._pane.getBoundingClientRect();
            this._viewportRect = this._getNarrowedRect(this._rootContainer);
            const lastPosition = this._lastPosition || this._preferredPositions[0];
            const originPoint = this._getOriginPoint(this._originRect, lastPosition);
            this._applyPosition(lastPosition, originPoint);
        }
    }
    /**
     * Sets the list of Scrollable containers that host the origin element so that
     * on reposition we can evaluate if it or the overlay has been clipped or outside view. Every
     * Scrollable must be an ancestor element of the strategy's origin element.
     */
    withScrollableContainers(scrollables) {
        this._scrollables = scrollables;
        return this;
    }
    withContainer(container) {
        this._container = container || this._rootContainer;
        return this;
    }
    /**
     * Adds new preferred positions.
     * @param positions List of positions options for this overlay.
     */
    withPositions(positions) {
        this._preferredPositions = positions;
        // If the last calculated position object isn't part of the positions anymore, clear
        // it in order to avoid it being picked up if the consumer tries to re-apply.
        if (positions.indexOf(this._lastPosition) === -1) {
            this._lastPosition = null;
        }
        this._validatePositions();
        return this;
    }
    /**
     * Sets the origin, relative to which to position the overlay.
     * Using an element origin is useful for building components that need to be positioned
     * relatively to a trigger (e.g. dropdown menus or tooltips), whereas using a point can be
     * used for cases like contextual menus which open relative to the user's pointer.
     * @param origin Reference to the new origin.
     */
    setOrigin(origin) {
        this._origin = origin;
        return this;
    }
    /**
     * Gets the (x, y) coordinate of a connection point on the origin based on a relative position.
     */
    _getOriginPoint(originRect, pos) {
        let x;
        if (pos.originX === 'center') {
            // Note: when centering we should always use the `left`
            // offset, otherwise the position will be wrong in RTL.
            x = originRect.left + (originRect.width / 2);
        }
        else {
            const startX = this._isRtl() ? originRect.right : originRect.left;
            const endX = this._isRtl() ? originRect.left : originRect.right;
            x = pos.originX === 'start' ? startX : endX;
        }
        let y;
        if (pos.originY === 'center') {
            y = originRect.top + (originRect.height / 2);
        }
        else {
            y = pos.originY === 'top' ? originRect.top : originRect.bottom;
        }
        return { x, y };
    }
    /**
     * Gets the (x, y) coordinate of the top-left corner of the overlay given a given position and
     * origin point to which the overlay should be connected.
     */
    _getOverlayPoint(originPoint, overlayRect, pos) {
        // Calculate the (overlayStartX, overlayStartY), the start of the
        // potential overlay position relative to the origin point.
        let overlayStartX;
        if (pos.overlayX === 'center') {
            overlayStartX = -overlayRect.width / 2;
        }
        else if (pos.overlayX === 'start') {
            overlayStartX = this._isRtl() ? -overlayRect.width : 0;
        }
        else {
            overlayStartX = this._isRtl() ? 0 : -overlayRect.width;
        }
        let overlayStartY;
        if (pos.overlayY === 'center') {
            overlayStartY = -overlayRect.height / 2;
        }
        else {
            overlayStartY = pos.overlayY === 'top' ? 0 : -overlayRect.height;
        }
        // The (x, y) coordinates of the overlay.
        return {
            x: originPoint.x + overlayStartX,
            y: originPoint.y + overlayStartY,
        };
    }
    /** Gets how well an overlay at the given point will fit within the viewport. */
    _getOverlayFit(point, overlay, viewport, position) {
        let { x, y } = point;
        const offsetX = this._getOffset(position, 'x');
        const offsetY = this._getOffset(position, 'y');
        // Account for the offsets since they could push the overlay out of the viewport.
        if (offsetX) {
            x += offsetX;
        }
        if (offsetY) {
            y += offsetY;
        }
        // How much the overlay would overflow at this position, on each side.
        const leftOverflow = viewport.left - x;
        const rightOverflow = (x + overlay.width) - viewport.right;
        const topOverflow = viewport.top - y;
        const bottomOverflow = (y + overlay.height) - viewport.bottom;
        // Visible parts of the element on each axis.
        const visibleWidth = this._subtractOverflows(overlay.width, leftOverflow, rightOverflow);
        const visibleHeight = this._subtractOverflows(overlay.height, topOverflow, bottomOverflow);
        const visibleArea = visibleWidth * visibleHeight;
        return {
            visibleArea: Math.abs(visibleArea),
            // visibleArea,
            isCompletelyWithinViewport: (overlay.width * overlay.height) === visibleArea,
            fitsInViewportVertically: visibleHeight === overlay.height,
            fitsInViewportHorizontally: visibleWidth === overlay.width,
        };
    }
    /**
     * Whether the overlay can fit within the viewport when it may resize either its width or height.
     * @param fit How well the overlay fits in the viewport at some position.
     * @param point The (x, y) coordinates of the overlat at some position.
     * @param viewport The geometry of the viewport.
     */
    _canFitWithFlexibleDimensions(fit, point, viewport) {
        if (this._hasFlexibleDimensions) {
            const availableHeight = viewport.bottom - point.y;
            const availableWidth = viewport.right - point.x;
            const minHeight = this._overlayRef.getConfig().minHeight;
            const minWidth = this._overlayRef.getConfig().minWidth;
            const verticalFit = fit.fitsInViewportVertically ||
                (minHeight != null && minHeight <= availableHeight);
            const horizontalFit = fit.fitsInViewportHorizontally ||
                (minWidth != null && minWidth <= availableWidth);
            return verticalFit && horizontalFit;
        }
        return false;
    }
    /**
     * Gets the point at which the overlay can be "pushed" on-screen. If the overlay is larger than
     * the viewport, the top-left corner will be pushed on-screen (with overflow occuring on the
     * right and bottom).
     *
     * @param start Starting point from which the overlay is pushed.
     * @param overlay Dimensions of the overlay.
     * @param scrollPosition Current viewport scroll position.
     * @returns The point at which to position the overlay after pushing. This is effectively a new
     *     originPoint.
     */
    _pushOverlayOnScreen(start, overlay, scrollPosition, position) {
        // If the position is locked and we've pushed the overlay already, reuse the previous push
        // amount, rather than pushing it again. If we were to continue pushing, the element would
        // remain in the viewport, which goes against the expectations when position locking is enabled.
        if (this._previousPushAmount && this._positionLocked) {
            return {
                x: start.x + this._previousPushAmount.x,
                y: start.y + this._previousPushAmount.y,
            };
        }
        const container = this._containerRect;
        // Determine how much the overlay goes outside the container on each
        // side, which we'll use to decide which direction to push it.
        const overflowRight = Math.max(start.x + overlay.width - container.right + (position.offsetX || 0), 0);
        const overflowBottom = Math.max(start.y + overlay.height - container.bottom + (position.offsetY || 0), 0);
        const overflowTop = Math.max(container.top - scrollPosition.top - start.y - (position.offsetY || 0), 0);
        const overflowLeft = Math.max(container.left - scrollPosition.left - start.x - (position.offsetX || 0), 0);
        // Amount by which to push the overlay in each axis such that it remains on-screen.
        let pushX = 0;
        let pushY = 0;
        // If the overlay fits completely within the bounds of the container, push it from whichever
        // direction is goes off-screen. Otherwise, push the top-left corner such that its in the
        // container and allow for the trailing end of the overlay to go out of bounds.
        if (overlay.width <= container.width) {
            pushX = overflowLeft || -overflowRight;
        }
        else {
            pushX = start.x < this._viewportMargin ? (container.left - scrollPosition.left) - start.x : 0;
        }
        if (overlay.height <= container.height) {
            pushY = overflowTop || -overflowBottom;
        }
        else {
            pushY = start.y < this._viewportMargin ? (container.top - scrollPosition.top) - start.y : 0;
        }
        this._previousPushAmount = { x: pushX, y: pushY };
        return {
            x: start.x + pushX,
            y: start.y + pushY,
        };
    }
    /**
     * Applies a computed position to the overlay and emits a position change.
     * @param position The position preference
     * @param originPoint The point on the origin element where the overlay is connected.
     */
    _applyPosition(position, originPoint) {
        this._setTransformOrigin(position);
        this._setOverlayElementStyles(originPoint, position);
        this._setBoundingBoxStyles(originPoint, position);
        if (position.panelClass) {
            this._addPanelClasses(position.panelClass);
        }
        // Save the last connected position in case the position needs to be re-calculated.
        this._lastPosition = position;
        // Notify that the position has been changed along with its change properties.
        // We only emit if we've got any subscriptions, because the scroll visibility
        // calculcations can be somewhat expensive.
        if (this._positionChanges.observers.length) {
            const scrollableViewProperties = this._getScrollVisibility();
            const changeEvent = new ConnectedOverlayPositionChange(position, scrollableViewProperties);
            this._positionChanges.next(changeEvent);
        }
        this._isInitialRender = false;
    }
    /** Sets the transform origin based on the configured selector and the passed-in position.  */
    _setTransformOrigin(position) {
        if (!this._transformOriginSelector) {
            return;
        }
        const elements = this._boundingBox.querySelectorAll(this._transformOriginSelector);
        let xOrigin;
        const yOrigin = position.overlayY;
        if (position.overlayX === 'center') {
            xOrigin = 'center';
        }
        else if (this._isRtl()) {
            xOrigin = position.overlayX === 'start' ? 'right' : 'left';
        }
        else {
            xOrigin = position.overlayX === 'start' ? 'left' : 'right';
        }
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.transformOrigin = `${xOrigin} ${yOrigin}`;
        }
    }
    /**
     * Gets the position and size of the overlay's sizing container.
     *
     * This method does no measuring and applies no styles so that we can cheaply compute the
     * bounds for all positions and choose the best fit based on these results.
     */
    _calculateBoundingBoxRect(origin, position) {
        const container = this._containerRect;
        const isRtl = this._isRtl();
        let height;
        let top;
        let bottom;
        if (position.overlayY === 'top') {
            // Overlay is opening "downward" and thus is bound by the bottom viewport edge.
            top = origin.y;
            height = container.height - top + this._viewportMargin;
        }
        else if (position.overlayY === 'bottom') {
            // Overlay is opening "upward" and thus is bound by the top container edge. We need to add
            // the container margin back in, because the container rect is narrowed down to remove the
            // margin, whereas the `origin` position is calculated based on its `ClientRect`.
            bottom = container.height - origin.y + this._viewportMargin * 2;
            height = container.height - bottom + this._viewportMargin;
        }
        else {
            // If neither top nor bottom, it means that the overlay is vertically centered on the
            // origin point. Note that we want the position relative to the viewport, rather than
            // the page, which is why we don't use something like `viewport.bottom - origin.y` and
            // `origin.y - container.top`.
            const smallestDistanceTocontainerEdge = Math.min(container.bottom - origin.y + container.top, origin.y);
            const previousHeight = this._lastBoundingBoxSize.height;
            height = smallestDistanceTocontainerEdge * 2;
            top = origin.y - smallestDistanceTocontainerEdge;
            if (height > previousHeight && !this._isInitialRender && !this._growAfterOpen) {
                top = origin.y - (previousHeight / 2);
            }
        }
        // The overlay is opening 'right-ward' (the content flows to the right).
        const isBoundedByRightContainerEdge = (position.overlayX === 'start' && !isRtl) ||
            (position.overlayX === 'end' && isRtl);
        // The overlay is opening 'left-ward' (the content flows to the left).
        const isBoundedByLeftContainerEdge = (position.overlayX === 'end' && !isRtl) ||
            (position.overlayX === 'start' && isRtl);
        let width;
        let left;
        let right;
        if (isBoundedByLeftContainerEdge) {
            right = container.width - origin.x + this._viewportMargin;
            width = origin.x - this._viewportMargin;
        }
        else if (isBoundedByRightContainerEdge) {
            left = origin.x;
            width = container.right - origin.x;
        }
        else {
            // If neither start nor end, it means that the overlay is horizontally centered on the
            // origin point. Note that we want the position relative to the container, rather than
            // the page, which is why we don't use something like `container.right - origin.x` and
            // `origin.x - container.left`.
            const smallestDistanceToContainerEdge = Math.min(container.right - origin.x + container.left, origin.x);
            const previousWidth = this._lastBoundingBoxSize.width;
            width = smallestDistanceToContainerEdge * 2;
            left = origin.x - smallestDistanceToContainerEdge;
            if (width > previousWidth && !this._isInitialRender && !this._growAfterOpen) {
                left = origin.x - (previousWidth / 2);
            }
        }
        // @ts-ignore
        return { top, left, bottom, right, width, height };
    }
    /**
     * Sets the position and size of the overlay's sizing wrapper. The wrapper is positioned on the
     * origin's connection point and stetches to the bounds of the viewport.
     *
     * @param origin The point on the origin element where the overlay is connected.
     * @param position The position preference
     */
    _setBoundingBoxStyles(origin, position) {
        const boundingBoxRect = this._calculateBoundingBoxRect(origin, position);
        // It's weird if the overlay *grows* while scrolling, so we take the last size into account
        // when applying a new size.
        if (!this._isInitialRender && !this._growAfterOpen) {
            boundingBoxRect.height = Math.min(boundingBoxRect.height, this._lastBoundingBoxSize.height);
            boundingBoxRect.width = Math.min(boundingBoxRect.width, this._lastBoundingBoxSize.width);
        }
        const styles = {};
        if (this._hasExactPosition()) {
            styles.top = styles.left = '0';
            styles.bottom = styles.right = '';
            styles.width = styles.height = '100%';
        }
        else {
            const maxHeight = this._overlayRef.getConfig().maxHeight;
            const maxWidth = this._overlayRef.getConfig().maxWidth;
            styles.height = coerceCssPixelValue(boundingBoxRect.height);
            styles.top = coerceCssPixelValue(boundingBoxRect.top);
            styles.bottom = coerceCssPixelValue(boundingBoxRect.bottom);
            styles.width = coerceCssPixelValue(boundingBoxRect.width);
            styles.left = coerceCssPixelValue(boundingBoxRect.left);
            styles.right = coerceCssPixelValue(boundingBoxRect.right);
            // Push the pane content towards the proper direction.
            if (position.overlayX === 'center') {
                styles.alignItems = 'center';
            }
            else {
                styles.alignItems = position.overlayX === 'end' ? 'flex-end' : 'flex-start';
            }
            if (position.overlayY === 'center') {
                styles.justifyContent = 'center';
            }
            else {
                styles.justifyContent = position.overlayY === 'bottom' ? 'flex-end' : 'flex-start';
            }
            if (maxHeight) {
                styles.maxHeight = coerceCssPixelValue(maxHeight);
            }
            if (maxWidth) {
                styles.maxWidth = coerceCssPixelValue(maxWidth);
            }
        }
        this._lastBoundingBoxSize = boundingBoxRect;
        extendStyles(this._boundingBox.style, styles);
    }
    /** Resets the styles for the bounding box so that a new positioning can be computed. */
    _resetBoundingBoxStyles() {
        extendStyles(this._boundingBox.style, {
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            height: '',
            width: '',
            alignItems: '',
            justifyContent: '',
        });
    }
    /** Resets the styles for the overlay pane so that a new positioning can be computed. */
    _resetOverlayElementStyles() {
        extendStyles(this._pane.style, {
            top: '',
            left: '',
            bottom: '',
            right: '',
            position: '',
            transform: '',
        });
    }
    /** Sets positioning styles to the overlay element. */
    _setOverlayElementStyles(originPoint, position) {
        const styles = {};
        if (this._hasExactPosition()) {
            const scrollPosition = this._viewportRuler.getViewportScrollPosition();
            extendStyles(styles, this._getExactOverlayY(position, originPoint, scrollPosition));
            extendStyles(styles, this._getExactOverlayX(position, originPoint, scrollPosition));
        }
        else {
            styles.position = 'static';
        }
        // Use a transform to apply the offsets. We do this because the `center` positions rely on
        // being in the normal flex flow and setting a `top` / `left` at all will completely throw
        // off the position. We also can't use margins, because they won't have an effect in some
        // cases where the element doesn't have anything to "push off of". Finally, this works
        // better both with flexible and non-flexible positioning.
        let transformString = '';
        const offsetX = this._getOffset(position, 'x');
        const offsetY = this._getOffset(position, 'y');
        if (offsetX) {
            transformString += `translateX(${offsetX}px) `;
        }
        if (offsetY) {
            transformString += `translateY(${offsetY}px)`;
        }
        styles.transform = transformString.trim();
        // If a maxWidth or maxHeight is specified on the overlay, we remove them. We do this because
        // we need these values to both be set to "100%" for the automatic flexible sizing to work.
        // The maxHeight and maxWidth are set on the boundingBox in order to enforce the constraint.
        if (this._hasFlexibleDimensions && this._overlayRef.getConfig().maxHeight) {
            styles.maxHeight = '';
        }
        if (this._hasFlexibleDimensions && this._overlayRef.getConfig().maxWidth) {
            styles.maxWidth = '';
        }
        extendStyles(this._pane.style, styles);
    }
    /** Gets the exact top/bottom for the overlay when not using flexible sizing or when pushing. */
    _getExactOverlayY(position, originPoint, scrollPosition) {
        // Reset any existing styles. This is necessary in case the
        // preferred position has changed since the last `apply`.
        // @ts-ignore
        const styles = { top: null, bottom: null };
        let overlayPoint = this._getOverlayPoint(originPoint, this._overlayRect, position);
        if (this._isPushed) {
            overlayPoint = this._pushOverlayOnScreen(overlayPoint, this._overlayRect, scrollPosition, position);
        }
        const virtualKeyboardOffset = this._overlayContainer.getContainerElement().getBoundingClientRect().top;
        // Normally this would be zero, however when the overlay is attached to an input (e.g. in an
        // autocomplete), mobile browsers will shift everything in order to put the input in the middle
        // of the screen and to make space for the virtual keyboard. We need to account for this offset,
        // otherwise our positioning will be thrown off.
        overlayPoint.y -= virtualKeyboardOffset;
        // We want to set either `top` or `bottom` based on whether the overlay wants to appear
        // above or below the origin and the direction in which the element will expand.
        if (position.overlayY === 'bottom') {
            // When using `bottom`, we adjust the y position such that it is the distance
            // from the bottom of the viewport rather than the top.
            const documentHeight = this._document.documentElement.clientHeight;
            styles.bottom = `${documentHeight - (overlayPoint.y + this._overlayRect.height)}px`;
        }
        else {
            styles.top = coerceCssPixelValue(overlayPoint.y);
        }
        return styles;
    }
    /** Gets the exact left/right for the overlay when not using flexible sizing or when pushing. */
    _getExactOverlayX(position, originPoint, scrollPosition) {
        // Reset any existing styles. This is necessary in case the preferred position has
        // changed since the last `apply`.
        // @ts-ignore
        const styles = { left: null, right: null };
        let overlayPoint = this._getOverlayPoint(originPoint, this._overlayRect, position);
        if (this._isPushed) {
            overlayPoint = this._pushOverlayOnScreen(overlayPoint, this._overlayRect, scrollPosition, position);
        }
        // We want to set either `left` or `right` based on whether the overlay wants to appear "before"
        // or "after" the origin, which determines the direction in which the element will expand.
        // For the horizontal axis, the meaning of "before" and "after" change based on whether the
        // page is in RTL or LTR.
        let horizontalStyleProperty;
        if (this._isRtl()) {
            horizontalStyleProperty = position.overlayX === 'end' ? 'left' : 'right';
        }
        else {
            horizontalStyleProperty = position.overlayX === 'end' ? 'right' : 'left';
        }
        // When we're setting `right`, we adjust the x position such that it is the distance
        // from the right edge of the viewport rather than the left edge.
        if (horizontalStyleProperty === 'right') {
            const documentWidth = this._document.documentElement.clientWidth;
            styles.right = `${documentWidth - (overlayPoint.x + this._overlayRect.width)}px`;
        }
        else {
            styles.left = coerceCssPixelValue(overlayPoint.x);
        }
        return styles;
    }
    /**
     * Gets the view properties of the trigger and overlay, including whether they are clipped
     * or completely outside the view of any of the strategy's scrollables.
     */
    _getScrollVisibility() {
        // Note: needs fresh rects since the position could've changed.
        const originBounds = this._getOriginRect();
        const overlayBounds = this._pane.getBoundingClientRect();
        const scrollContainerBounds = this._scrollables.map((scrollable) => {
            return scrollable.getElementRef().nativeElement.getBoundingClientRect();
        });
        return {
            isOriginClipped: isElementClippedByScrolling(originBounds, scrollContainerBounds),
            isOriginOutsideView: isElementScrolledOutsideView(originBounds, scrollContainerBounds),
            isOverlayClipped: isElementClippedByScrolling(overlayBounds, scrollContainerBounds),
            isOverlayOutsideView: isElementScrolledOutsideView(overlayBounds, scrollContainerBounds),
        };
    }
    /** Subtracts the amount that an element is overflowing on an axis from its length. */
    _subtractOverflows(length, ...overflows) {
        return overflows.reduce((currentValue, currentOverflow) => {
            return currentValue - Math.max(currentOverflow, 0);
        }, length);
    }
    _getNarrowedRect(container) {
        const nativeRect = container.getBoundingClientRect();
        // @ts-ignore
        return {
            top: nativeRect.top + this._viewportMargin,
            left: nativeRect.left + this._viewportMargin,
            right: nativeRect.right - this._viewportMargin,
            bottom: nativeRect.bottom - this._viewportMargin,
            width: nativeRect.width - (2 * this._viewportMargin),
            height: nativeRect.height - (2 * this._viewportMargin),
        };
    }
    /** Whether the we're dealing with an RTL context */
    _isRtl() {
        return this._overlayRef.getDirection() === 'rtl';
    }
    /** Determines whether the overlay uses exact or flexible positioning. */
    _hasExactPosition() {
        return !this._hasFlexibleDimensions || this._isPushed;
    }
    /** Retrieves the offset of a position along the x or y axis. */
    _getOffset(position, axis) {
        if (axis === 'x') {
            // We don't do something like `position['offset' + axis]` in
            // order to avoid breking minifiers that rename properties.
            return position.offsetX == null ? this._offsetX : position.offsetX;
        }
        return position.offsetY == null ? this._offsetY : position.offsetY;
    }
    /** Validates that the current position match the expected values. */
    _validatePositions() {
        if (!this._preferredPositions.length) {
            throw Error('FlexibleConnectedPositionStrategy: At least one position is required.');
        }
        // TODO(crisbeto): remove these once Angular's template type
        // checking is advanced enough to catch these cases.
        this._preferredPositions.forEach((pair) => {
            validateHorizontalPosition('originX', pair.originX);
            validateVerticalPosition('originY', pair.originY);
            validateHorizontalPosition('overlayX', pair.overlayX);
            validateVerticalPosition('overlayY', pair.overlayY);
        });
    }
    /** Adds a single CSS class or an array of classes on the overlay panel. */
    _addPanelClasses(cssClasses) {
        if (this._pane) {
            coerceArray(cssClasses).forEach((cssClass) => {
                if (cssClass !== '' && this._appliedPanelClasses.indexOf(cssClass) === -1) {
                    this._appliedPanelClasses.push(cssClass);
                    this._pane.classList.add(cssClass);
                }
            });
        }
    }
    /** Clears the classes that the position strategy has applied from the overlay panel. */
    _clearPanelClasses() {
        if (this._pane) {
            this._appliedPanelClasses.forEach((cssClass) => {
                this._pane.classList.remove(cssClass);
            });
            this._appliedPanelClasses = [];
        }
    }
    /** Returns the ClientRect of the current origin. */
    _getOriginRect() {
        const origin = this._origin;
        if (origin instanceof ElementRef) {
            return origin.nativeElement.getBoundingClientRect();
        }
        if (origin instanceof HTMLElement) {
            return origin.getBoundingClientRect();
        }
        const width = origin.width || 0;
        const height = origin.height || 0;
        // If the origin is a point, return a client rect as if it was a 0x0 element at the point.
        // @ts-ignore
        return {
            top: origin.y,
            bottom: origin.y + height,
            left: origin.x,
            right: origin.x + width,
            height,
            width,
        };
    }
}
/** Shallow-extends a stylesheet object with another stylesheet object. */
function extendStyles(dest, source) {
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            dest[key] = source[key];
        }
    }
    return dest;
}
/**
 * Gets whether an element is scrolled outside of view by any of its parent scrolling containers.
 * @param element Dimensions of the element (from getBoundingClientRect)
 * @param scrollContainers Dimensions of element's scrolling containers (from getBoundingClientRect)
 * @returns Whether the element is scrolled out of view
 * @docs-private
 */
function isElementScrolledOutsideView(element, scrollContainers) {
    return scrollContainers.some((containerBounds) => {
        return element.bottom < containerBounds.top // Outside Above
            || element.top > containerBounds.bottom // Outside Below
            || element.right < containerBounds.left // Outside Left
            || element.left > containerBounds.right; // Outside Right
    });
}
/**
 * Gets whether an element is clipped by any of its scrolling containers.
 * @param element Dimensions of the element (from getBoundingClientRect)
 * @param scrollContainers Dimensions of element's scrolling containers (from getBoundingClientRect)
 * @returns Whether the element is clipped
 * @docs-private
 */
function isElementClippedByScrolling(element, scrollContainers) {
    return scrollContainers.some((scrollContainerRect) => {
        return element.top < scrollContainerRect.top // Clipped Above
            || element.bottom > scrollContainerRect.bottom // Clipped Below
            || element.left < scrollContainerRect.left // Clipped Left
            || element.right > scrollContainerRect.right; // Clipped Right
    });
}
/** @docs-private */
function GHOST_RIDER_POPOVER_POSITION_STRATEGY_FACTORY(viewportRuler, document, platform, overlayContainer, rootPopoverContainer) {
    return (origin) => {
        return new PopoverPositionStrategy(origin, viewportRuler, document, platform, overlayContainer, rootPopoverContainer);
    };
}
/** @docs-private */
const GHOST_RIDER_POPOVER_POSITION_STRATEGY_FACTORY_PROVIDER = {
    provide: GHOST_RIDER_POPOVER_POSITION_STRATEGY,
    useFactory: GHOST_RIDER_POPOVER_POSITION_STRATEGY_FACTORY,
    deps: [
        ViewportRuler,
        DOCUMENT,
        Platform,
        OverlayContainer,
        GhostRiderRootPopoverContainer,
    ],
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** CSS class that will be attached to the overlay panel. */
const POPOVER_PANEL_CLASS = 'ghost-rider-popover-container';
/**
 * Creates an error to be thrown if the user supplied an invalid popover position.
 * @docs-private
 */
function getPopoverInvalidPositionError(position) {
    return Error(`Popover position "${position}" is invalid.`);
}
/** Injection token to be used to override the default options for `Popover`. */
const GHOST_RIDER_POPOVER_DEFAULT_OPTIONS = new InjectionToken('PopoverDefaultOptions', { providedIn: 'root', factory: GHOST_RIDER_POPOVER_DEFAULT_OPTIONS_FACTORY });
/** @docs-private */
function GHOST_RIDER_POPOVER_DEFAULT_OPTIONS_FACTORY() {
    return {
        showDelay: 0,
        hideDelay: 0,
        touchendHideDelay: 1500,
    };
}
class Popover {
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
        var _a;
        if (this.disabled || !this.content || (this.isPopoverVisible() && !((_a = this._popoverInstance) === null || _a === void 0 ? void 0 : _a.hasTimeout))) {
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
Popover.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: Popover, deps: [{ token: i1$2.Overlay }, { token: i0.ElementRef }, { token: i1$1.ScrollDispatcher }, { token: i0.ViewContainerRef }, { token: i0.NgZone }, { token: i3.Platform }, { token: i4.AriaDescriber }, { token: i4.FocusMonitor }, { token: DOCUMENT }, { token: GHOST_RIDER_POPOVER_SCROLL_STRATEGY }, { token: GHOST_RIDER_POPOVER_POSITION_STRATEGY }, { token: GHOST_RIDER_POPOVER_CONTAINER }, { token: i5.Directionality, optional: true }, { token: GHOST_RIDER_POPOVER_DEFAULT_OPTIONS, optional: true }, { token: HAMMER_LOADER, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
Popover.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.4", type: Popover, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: Popover, decorators: [{
            type: Directive
        }], ctorParameters: function () {
        return [{ type: i1$2.Overlay }, { type: i0.ElementRef }, { type: i1$1.ScrollDispatcher }, { type: i0.ViewContainerRef }, { type: i0.NgZone }, { type: i3.Platform }, { type: i4.AriaDescriber }, { type: i4.FocusMonitor }, { type: undefined, decorators: [{
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
                    }] }];
    } });
// Can this be retrieved from compiled code???
const GHOST_RIDER_POPOVER_STATIC_PROVIDER = {
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
    const main = Object.assign(Object.assign({}, origin.main), overlay.main);
    const fallback = Object.assign(Object.assign({}, origin.fallback), overlay.fallback);
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
                Object.assign(Object.assign({}, position), { overlayX: 'start' }),
                Object.assign(Object.assign({}, position), { overlayX: 'end' }),
            ];
        }
        else {
            return [
                Object.assign(Object.assign({}, position), { overlayX: nubbinPosition }),
            ];
        }
    }
    else { // Left/Right
        if (nubbinPosition === 'auto') {
            return [
                position,
                Object.assign(Object.assign({}, position), { overlayY: 'bottom' }),
                Object.assign(Object.assign({}, position), { overlayY: 'top' }),
            ];
        }
        else {
            return [
                Object.assign(Object.assign({}, position), { overlayY: nubbinPosition === 'start' ? 'top' : 'bottom' }),
            ];
        }
    }
}

class GhostRiderPopoverFactory {
    constructor(_injector) {
        this._injector = _injector;
    }
    createPopover(elementRef, config) {
        const providers = [
            GHOST_RIDER_POPOVER_STATIC_PROVIDER,
            { provide: ElementRef, useValue: elementRef },
        ];
        if (config) {
            if (config.vcr) {
                providers.push({ provide: ViewContainerRef, useValue: config.vcr });
            }
        }
        const instance = Injector.create({
            providers,
            parent: this._injector,
        }).get(Popover);
        // Not attached to, must manually run
        instance.ngOnInit();
        return instance;
    }
}
GhostRiderPopoverFactory.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderPopoverFactory, deps: [{ token: i0.Injector }], target: i0.ɵɵFactoryTarget.Injectable });
GhostRiderPopoverFactory.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderPopoverFactory });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderPopoverFactory, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i0.Injector }]; } });

class GhostRiderTourGuide {
    constructor(tourNamespace, steps) {
        this.tourNamespace = tourNamespace;
        this.steps = steps;
        this.currentStep = 0;
        this.steps.forEach((step) => {
            // Add the tour namespace to every step
            step.name = this.tourNamespace + step.name;
            if (step.hasSubSteps) {
                step.subSteps.forEach((subStep) => {
                    // Add the tour namespace to every sub step
                    subStep.name = this.tourNamespace + subStep.name;
                });
            }
        });
        this.activeStep = this.steps[0];
    }
    /**
     * Sets the active step to the next 'Parent' step that is visible
     */
    getNextStep() {
        const startingStep = this.activeStep;
        do {
            if (this.steps[this.currentStep + 1]) {
                this.currentStep++;
                this.activeStep = this.steps[this.currentStep];
            }
            else {
                return startingStep;
            }
        } while (this.activeStep.hidden);
        return this.activeStep;
        // do {
        // 	this.currentStep++;
        // 	this.activeStep = this.steps[this.currentStep];
        // } while (this.activeStep.hidden);
        // return this.activeStep;
    }
    /**
     * Sets the active step to the next sub step in the order
     */
    getNextSubStep() {
        if (this.activeStep.hasSubSteps) {
            this.activeStep = this.activeStep.subSteps[0];
        }
        else if (this.activeStep.parent) {
            const siblings = this.activeStep.parent.subSteps;
            this.activeStep = siblings[siblings.indexOf(this.activeStep) + 1];
        }
        return this.activeStep;
    }
    /**
     * Sets the active step to the previous 'Parent' step that is visible
     */
    getPreviousStep() {
        const startingStep = this.activeStep;
        do {
            if (this.steps[this.currentStep - 1]) {
                this.currentStep--;
                this.activeStep = this.steps[this.currentStep];
            }
            else {
                return startingStep;
            }
        } while (this.activeStep.hidden);
        return this.activeStep;
        // do {
        // 	this.currentStep--;
        // 	this.activeStep = this.steps[this.currentStep];
        // } while (this.activeStep.hidden);
        // return this.activeStep;
    }
    /**
     * Sets the active step to the previous sub step that is visible
     */
    getPreviousSubStep() {
        const siblings = this.activeStep.parent.subSteps;
        const previous = siblings.indexOf(this.activeStep) - 1;
        if (siblings[previous]) {
            this.activeStep = siblings[previous];
        }
        else if (this.activeStep.parent) {
            this.activeStep = this.activeStep.parent;
        }
        return this.activeStep;
    }
}

/**
 * Used for the '_subs' map prop keys
 */
var SubKeys;
(function (SubKeys) {
    SubKeys["StepAdded"] = "stepAdded";
    SubKeys["Events"] = "events";
})(SubKeys || (SubKeys = {}));
const ACTIVE_TARGET_CLASS = `ghost-rider-walkthrough-step_active`;
/**
 * Service to control guided tours and walkthrough steps
 */
class GhostRiderService {
    constructor(_injector, rendererFactory) {
        this._injector = _injector;
        this._stepAdded$ = new Subject();
        // Add keys to the 'SubKeys' enum pleez
        this._subs = new Map();
        this._steps = new Map(); // name => step
        // TODO: Implement an optional UI masking element to override clicks from the user
        // private _uiMask: HTMLDivElement | null;
        this._isAsync = false; // Flag to use asynchronous or synchronous methods
        // Flag that the tour is in flight. Once the tour is closed or skipped, this will be false
        this.activeTour$ = new BehaviorSubject(false);
        this.events$ = new Subject();
        this._popoverFactory = new GhostRiderPopoverFactory(this._injector);
        this._renderer = rendererFactory.createRenderer(null, null);
        /**
         * When there are step events, emit the event from the step's 'GhostRiderStepEvent'
         * output so we can react to event from specific components
         */
        this._subs.set(SubKeys.Events, this.events$.subscribe((event) => {
            var _a;
            if (this._steps.has(event.name)) {
                (_a = this._steps.get(event.name)) === null || _a === void 0 ? void 0 : _a.ghostRiderStepEvent.emit(event);
            }
        }));
    }
    get activeTour() {
        return this.activeTour$.value;
    }
    get tourGuide() {
        return this._tourGuide;
    }
    ngOnDestroy() {
        this._stepAdded$.complete();
        this._stepAdded$.unsubscribe();
        this.activeTour$.complete();
        this.activeTour$.unsubscribe();
        this.events$.complete();
        this.events$.unsubscribe();
        this._subs.forEach((sub) => sub.unsubscribe());
    }
    /**
     * Adds a new step to the tour
     * @param step The step to add to the tour
     */
    registerStep(step) {
        if (!this._steps.has(step.config.name)) {
            this._steps.set(step.config.name, step);
        }
        this._stepAdded$.next(step.config.name);
    }
    /**
     * Removes the step from the '_steps' map
     * @param step The step to remove from the map
     */
    unregisterStep(step) {
        if (this._steps.has(step.config.name) && this._steps.get(step.config.name) === step) {
            this._steps.delete(step.config.name);
        }
    }
    /**
     * Starts the tour at from the first step
     * @param tourNamespace String to distinguish different tour contexts (becomes a prefix to all steps)
     * @param steps List of tour steps in the order in which they should go
     */
    start(tourNamespace, steps) {
        tourNamespace = tourNamespace ? tourNamespace + '.' : '';
        this.activeTour$.next(true);
        this.events$.next({
            type: GhostRiderEventType.Start,
            name: tourNamespace,
            source: GhostRiderEventSource.Manual,
        });
        this._tourGuide = new GhostRiderTourGuide(tourNamespace, steps);
        this._goToStep();
    }
    /**
     * Pauses the tour on the active step
     */
    pause() {
        if (this.activeTour) {
            this.hideStep();
        }
    }
    /**
     * Resumes the tour from the active step
     */
    resume() {
        if (this.activeTour) {
            this._goToStep();
        }
    }
    /**
     * Goes to a parent step from any sub step
     * @param source The source value that caused this to be called
     */
    goToParent(source = GhostRiderEventSource.Manual) {
        if (this.activeTour) {
            const { name } = this._tourGuide.activeStep;
            this.tourGuide.activeStep = this.tourGuide.activeStep.parent;
            this._goToStep({ type: null, name, source }, true);
        }
    }
    /**
     * Goes to the next step
     * @param source The source value that caused this to be called
     */
    next(source = GhostRiderEventSource.Manual) {
        if (this.activeTour) {
            const { name } = this._tourGuide.activeStep;
            this._tourGuide.getNextStep();
            this._goToStep({ type: GhostRiderEventType.Next, name, source });
        }
    }
    /**
     * Goes to the previous step
     * @param source The source value that caused this to be called
     */
    back(source = GhostRiderEventSource.Manual) {
        if (this.activeTour) {
            const { name } = this._tourGuide.activeStep;
            this._tourGuide.getPreviousStep();
            this._goToStep({ type: GhostRiderEventType.Back, name, source });
        }
    }
    /**
     * Goes to the next sub step
     * @param source The source value that caused this to be called
     */
    nextSubStep(source = GhostRiderEventSource.Manual) {
        if (this.activeTour) {
            const { name } = this._tourGuide.activeStep;
            this._tourGuide.getNextSubStep();
            this._goToStep({ type: null, name, source });
        }
    }
    /**
     * Goes to the previous sub step
     * @param source The source value that caused this to be called
     */
    previousSubStep(source = GhostRiderEventSource.Manual) {
        if (this.activeTour) {
            const { name } = this._tourGuide.activeStep;
            this._tourGuide.getPreviousSubStep();
            this._goToStep({ type: null, name, source }, true);
        }
    }
    /**
     * Closes the tour, but with a more descriptive event
     * @param source The source value that caused this to be called
     */
    complete(source = GhostRiderEventSource.Manual) {
        this.close(source, GhostRiderEventType.Complete);
    }
    /**
     * Ends the tour
     * @param source The source value that caused this to be called
     * @param type The event type to use for the emitted event
     */
    close(source = GhostRiderEventSource.Manual, type = GhostRiderEventType.Close) {
        this.activeTour$.next(false);
        const { name } = this._tourGuide.activeStep;
        // Immediately remove the backdrop and clip path elements
        this._removeWindowHandler();
        // Dispose of the step and cleanup
        const hideStepSub = this.hideStep().subscribe(() => {
            this.events$.next({ type, name, source });
            hideStepSub.unsubscribe();
        });
        this._tourGuide = undefined;
    }
    /**
     * Calls the dynamic '_hideStep' prop function to remove a popover step from the UI
     */
    hideStep() {
        if (this._hideStep) {
            return this._hideStep();
        }
        else {
            return of(void 0);
        }
    }
    /**
     * Repositions the window and the popover manually
     */
    tidy() {
        this.updatePosition();
        this.updateWindow();
    }
    /**
     * Updates the active popover's overlay position
     */
    updatePosition() {
        if (this._activePopover) {
            this._activePopover.updateOverlayPosition();
        }
    }
    /**
     * Updates the positions of the clip paths for the target element
     */
    updateWindow() {
        var _a, _b;
        if (this._activePopover && ((_b = (_a = this._activePopover) === null || _a === void 0 ? void 0 : _a._overlayRef) === null || _b === void 0 ? void 0 : _b.backdropElement)) {
            this._buildWindow(this._steps.get(this._tourGuide.activeStep.name).element.nativeElement.getBoundingClientRect(), this._activePopover._overlayRef);
        }
    }
    /**
     * Removes backdrop and clip path divs for the active step
     */
    removeWindow() {
        if (this._removeWindowHandler) {
            this._removeWindowHandler();
        }
    }
    /**
     * Finds the step to show if it exists or when it is dynamically registered from the subject
     * @param event Optional event object to emit
     */
    _goToStep(event, asyncOverride) {
        if (this._tourGuide.activeStep) {
            this.hideStep().subscribe(() => {
                if (event) {
                    this.events$.next(event);
                }
                if (this._subs.has(SubKeys.StepAdded)) {
                    const stepAdded = this._subs.get(SubKeys.StepAdded);
                    if (stepAdded) {
                        stepAdded.unsubscribe();
                        this._subs.delete(SubKeys.StepAdded);
                    }
                }
                const hasStep = this._steps.has(this._tourGuide.activeStep.name);
                if (asyncOverride !== undefined) {
                    this._isAsync = asyncOverride;
                }
                else {
                    this._isAsync = !hasStep;
                }
                if (hasStep) {
                    this._showStep();
                }
                else {
                    this._subs.set(SubKeys.StepAdded, this._stepAdded$.pipe(first((step) => step === this._tourGuide.activeStep.name)).subscribe(() => {
                        this._showStep();
                    }));
                }
            });
        }
        else {
            // There isn't a next step so just end the tour
            this.close();
        }
    }
    /**
     * Destroys the active popover and creates the new popover for the desired step
     */
    _showStep() {
        var _a;
        const { element, vcr, config, active$ } = this._steps.get(this._tourGuide.activeStep.name);
        const popover = this._activePopover = this._popoverFactory.createPopover(element, { vcr });
        // Assign a tear down function for the active step
        this._hideStep = () => {
            popover.hide();
            active$.next(false);
            // this._removeMask();
            this._renderer.removeClass(element.nativeElement, ACTIVE_TARGET_CLASS);
            if (this._activePopover === popover) {
                this._activePopover = null;
            }
            this._hideStep = null;
            return defer(() => {
                return popover.popoverInstance.afterHidden().pipe(startWith(null), last());
            });
        };
        // Custom class that we can use too style the target element
        this._renderer.addClass(element.nativeElement, ACTIVE_TARGET_CLASS);
        popover.position = config.position;
        popover.nubbinPosition = config.nubbinPosition;
        popover.content = config.content;
        popover.popoverType = GhostRiderStepComponent;
        if (config.beforeActivate) {
            config.beforeActivate();
        }
        // Remove old backdrop and clip paths
        this.removeWindow();
        // TODO: rethink some of this logic and design
        if (this._tourGuide.activeStep.parent) {
            this._isAsync = true;
        }
        // Show new popover step
        popover.show(0);
        // Set props on step component
        popover.popoverInstance.details = config;
        // Assign new backdrop and clip path destroyer
        this._removeWindowHandler = () => {
            var _a;
            this._removeWindow((_a = popover._overlayRef) === null || _a === void 0 ? void 0 : _a.backdropElement);
        };
        if (this._isAsync) {
            // Wait for popover component to be visible before adding styles
            const afterVisibleSub = (_a = popover.popoverInstance) === null || _a === void 0 ? void 0 : _a.afterVisible().subscribe(() => {
                this._buildWindow(element.nativeElement.getBoundingClientRect(), popover._overlayRef);
                active$.next(true);
                afterVisibleSub === null || afterVisibleSub === void 0 ? void 0 : afterVisibleSub.unsubscribe();
            });
        }
        else {
            // Since this isn't async, we can just build the new backdrop and set styles ASAP
            this._buildWindow(element.nativeElement.getBoundingClientRect(), popover._overlayRef);
        }
    }
    /**
     * Creates the clip path in the backdrop and an inner inset clip path to round the edges
     *
     * TODO: fix the slight edges that are showing between the inner and outter clip paths
     * @param rect The rectangle dimensions to clip
     * @param overlayRef The overlay element
     */
    _buildWindow(rect, overlayRef) {
        var _a, _b, _c;
        // if (this._tourGuide.activeStep.preventClicks && !this._uiMask) {
        //   // Make div to prevent actions
        //   this._uiMask = this._renderer.createElement('div');
        //   this._renderer.setStyle(this._uiMask, 'position', 'fixed');
        //   this._renderer.setStyle(this._uiMask, 'height', '100%');
        //   this._renderer.setStyle(this._uiMask, 'width', '100%');
        //   this._renderer.setStyle(this._uiMask, 'background-color', 'transparent');
        //   this._renderer.setStyle(this._uiMask, 'zIndex', '8999');
        //   this._renderer.setStyle(this._uiMask, 'pointerEvents', 'all');
        //   this._renderer.insertBefore(overlayRef.backdropElement.parentElement, this._uiMask, overlayRef.backdropElement);
        // }
        this._renderer.setStyle((_a = overlayRef.backdropElement) === null || _a === void 0 ? void 0 : _a.nextSibling, 'zIndex', 9001);
        this._renderer.setStyle(// Should we remove this style on tear down?
        overlayRef.backdropElement, 'clipPath', `polygon(
          0% 0%,
          0% 100%,
          ${rect.left}px 100%,
          ${rect.left}px ${rect.top}px,
          ${rect.right}px ${rect.top}px,
          ${rect.right}px ${rect.bottom}px,
          ${rect.left}px ${rect.bottom}px,
          ${rect.left}px 100%,
          100% 100%,
          100% 0%
        )`);
        if (!((_b = overlayRef.backdropElement) === null || _b === void 0 ? void 0 : _b.firstChild)) {
            this._renderer.appendChild(overlayRef.backdropElement, this._renderer.createElement('div'));
        }
        const buffer = 5;
        const borderRadius = buffer;
        const distributionSize = buffer / 2;
        if ((_c = overlayRef.backdropElement) === null || _c === void 0 ? void 0 : _c.firstChild) {
            this._renderer.setStyle(overlayRef.backdropElement.firstChild, 'position', 'absolute');
            this._renderer.setStyle(overlayRef.backdropElement.firstChild, 'background', 'white');
            this._renderer.setStyle(overlayRef.backdropElement.firstChild, 'width', `${rect.width + buffer}px`);
            this._renderer.setStyle(overlayRef.backdropElement.firstChild, 'height', `${rect.height + buffer}px`);
            this._renderer.setStyle(overlayRef.backdropElement.firstChild, 'clipPath', `inset(0 round ${borderRadius}px)`);
            this._renderer.setStyle(overlayRef.backdropElement.firstChild, 'inset', `${rect.y - distributionSize}px 0 0 ${rect.x - distributionSize}px`);
        }
    }
    /**
     * Removes the custom backdrop styles and inset clip path div
     * @param backdrop The backdrop overlay element
     */
    _removeWindow(backdrop) {
        if (backdrop) {
            this._renderer.removeClass(backdrop, 'ghost-rider-backdrop');
            if (backdrop.firstChild) {
                this._renderer.removeChild(backdrop, backdrop.firstChild);
            }
        }
        // this._removeMask();
    }
}
GhostRiderService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderService, deps: [{ token: i0.Injector }, { token: i0.RendererFactory2 }], target: i0.ɵɵFactoryTarget.Injectable });
GhostRiderService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: i0.Injector }, { type: i0.RendererFactory2 }]; } });

class GhostRiderStepAdvanceDirective {
    constructor(_ghostRiderService) {
        this._ghostRiderService = _ghostRiderService;
        this.ghostRiderStepAdvance = new EventEmitter();
    }
    advance(event) {
        this.ghostRiderStepAdvance.emit(event);
        this._ghostRiderService.next(GhostRiderEventSource.Directive);
    }
}
GhostRiderStepAdvanceDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepAdvanceDirective, deps: [{ token: GhostRiderService }], target: i0.ɵɵFactoryTarget.Directive });
GhostRiderStepAdvanceDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.4", type: GhostRiderStepAdvanceDirective, selector: "[ghostRiderStepAdvance]", outputs: { ghostRiderStepAdvance: "ghostRiderStepAdvance" }, host: { listeners: { "click": "advance($event)" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepAdvanceDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[ghostRiderStepAdvance]' }]
        }], ctorParameters: function () { return [{ type: GhostRiderService }]; }, propDecorators: { ghostRiderStepAdvance: [{
                type: Output
            }], advance: [{
                type: HostListener,
                args: ['click', ['$event']]
            }] } });

class GhostRiderStepConfig {
    constructor() {
        this.backButtonLabel = 'Back';
        this.nextButtonLabel = 'Next';
        this.shouldRegister = true;
        this.backIsDisabled = false;
        this.nextIsDisabled = false;
        this.nextIsHide = false;
        this.position = 'below';
        this.nubbinPosition = 'auto';
    }
}

class GhostRiderStepDirective {
    constructor(element, vcr, _ghostRiderService) {
        this.element = element;
        this.vcr = vcr;
        this._ghostRiderService = _ghostRiderService;
        this.ghostRiderStepEvent = new EventEmitter();
        this.active$ = new BehaviorSubject(false);
        this._subs = [];
    }
    set ghostRiderStep(config) {
        this.config = Object.assign(Object.assign({}, new GhostRiderStepConfig()), config);
    }
    get ghostRiderStep() {
        return this.config;
    }
    ngOnInit() {
        if (this.config.name && this.config.shouldRegister) {
            this._ghostRiderService.registerStep(this);
        }
    }
    ngOnDestroy() {
        if (this.config && this.config.name) {
            this._ghostRiderService.unregisterStep(this);
        }
        this._subs.forEach((sub) => sub.unsubscribe());
    }
}
GhostRiderStepDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepDirective, deps: [{ token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: GhostRiderService }], target: i0.ɵɵFactoryTarget.Directive });
GhostRiderStepDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.4", type: GhostRiderStepDirective, selector: "[ghostRiderStep]", inputs: { ghostRiderStep: "ghostRiderStep" }, outputs: { ghostRiderStepEvent: "ghostRiderStepEvent" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[ghostRiderStep]' }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.ViewContainerRef }, { type: GhostRiderService }]; }, propDecorators: { ghostRiderStep: [{
                type: Input
            }], ghostRiderStepEvent: [{
                type: Output
            }] } });

class GhostRiderStepCompleteDirective {
    constructor(_ghostRiderService) {
        this._ghostRiderService = _ghostRiderService;
    }
    complete() {
        this._ghostRiderService.complete(GhostRiderEventSource.Directive);
    }
}
GhostRiderStepCompleteDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepCompleteDirective, deps: [{ token: GhostRiderService }], target: i0.ɵɵFactoryTarget.Directive });
GhostRiderStepCompleteDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.4", type: GhostRiderStepCompleteDirective, selector: "[ghostRiderStepComplete]", host: { listeners: { "click": "complete()" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepCompleteDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[ghostRiderStepComplete]' }]
        }], ctorParameters: function () { return [{ type: GhostRiderService }]; }, propDecorators: { complete: [{
                type: HostListener,
                args: ['click']
            }] } });

class GhostRiderStepHideDirective {
    constructor(_ghostRiderService) {
        this._ghostRiderService = _ghostRiderService;
    }
    hide() {
        if (this._ghostRiderService.activeTour) {
            this._ghostRiderService.hideStep();
        }
    }
}
GhostRiderStepHideDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepHideDirective, deps: [{ token: GhostRiderService }], target: i0.ɵɵFactoryTarget.Directive });
GhostRiderStepHideDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.4", type: GhostRiderStepHideDirective, selector: "[ghostRiderStepHide]", host: { listeners: { "click": "hide()" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepHideDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[ghostRiderStepHide]' }]
        }], ctorParameters: function () { return [{ type: GhostRiderService }]; }, propDecorators: { hide: [{
                type: HostListener,
                args: ['click']
            }] } });

class GhostRiderStepPreviousDirective {
    constructor(_ghostRiderService) {
        this._ghostRiderService = _ghostRiderService;
    }
    previous() {
        this._ghostRiderService.back(GhostRiderEventSource.Directive);
    }
}
GhostRiderStepPreviousDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepPreviousDirective, deps: [{ token: GhostRiderService }], target: i0.ɵɵFactoryTarget.Directive });
GhostRiderStepPreviousDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.0.4", type: GhostRiderStepPreviousDirective, selector: "[ghostRiderStepPrevious]", host: { listeners: { "click": "previous()" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderStepPreviousDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[ghostRiderStepPrevious]' }]
        }], ctorParameters: function () { return [{ type: GhostRiderService }]; }, propDecorators: { previous: [{
                type: HostListener,
                args: ['click']
            }] } });

class GhostRiderOverlayContainer extends OverlayContainer {
    constructor(document, platform) {
        super(document, platform);
    }
    _createContainer() {
        super._createContainer();
        this._containerElement.classList.add('ghost-rider'); // TODO: Make configurable
    }
}
GhostRiderOverlayContainer.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderOverlayContainer, deps: [{ token: DOCUMENT }, { token: i3.Platform }], target: i0.ɵɵFactoryTarget.Injectable });
GhostRiderOverlayContainer.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderOverlayContainer, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderOverlayContainer, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () {
        return [{ type: undefined, decorators: [{
                        type: Inject,
                        args: [DOCUMENT]
                    }] }, { type: i3.Platform }];
    } });
const GHOST_RIDER_OVERLAY_CONTAINER_PROVIDER = {
    provide: OverlayContainer,
    useExisting: GhostRiderOverlayContainer,
};

const DIRECTIVES = [
    GhostRiderStepDirective,
    GhostRiderStepAdvanceDirective,
    GhostRiderStepCompleteDirective,
    GhostRiderStepHideDirective,
    GhostRiderStepPreviousDirective,
];
const COMPONENTS = [
    GhostRiderStepComponent,
    PopoverComponent
];
class GhostRiderModule {
}
GhostRiderModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
GhostRiderModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderModule, declarations: [GhostRiderStepComponent,
        PopoverComponent, GhostRiderStepDirective,
        GhostRiderStepAdvanceDirective,
        GhostRiderStepCompleteDirective,
        GhostRiderStepHideDirective,
        GhostRiderStepPreviousDirective], imports: [CommonModule,
        PortalModule,
        OverlayModule], exports: [GhostRiderStepComponent,
        PopoverComponent, GhostRiderStepDirective,
        GhostRiderStepAdvanceDirective,
        GhostRiderStepCompleteDirective,
        GhostRiderStepHideDirective,
        GhostRiderStepPreviousDirective] });
GhostRiderModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderModule, providers: [
        {
            provide: GHOST_RIDER_NAVIGATION,
            useExisting: GhostRiderService,
        },
        GHOST_RIDER_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER,
        GHOST_RIDER_POPOVER_POSITION_STRATEGY_FACTORY_PROVIDER,
        GHOST_RIDER_POPOVER_CONTAINER_FACTORY_PROVIDER,
        GHOST_RIDER_OVERLAY_CONTAINER_PROVIDER,
    ], imports: [CommonModule,
        PortalModule,
        OverlayModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        PortalModule,
                        OverlayModule,
                    ],
                    declarations: [
                        ...COMPONENTS,
                        ...DIRECTIVES
                    ],
                    exports: [
                        ...COMPONENTS,
                        ...DIRECTIVES,
                    ],
                    providers: [
                        {
                            provide: GHOST_RIDER_NAVIGATION,
                            useExisting: GhostRiderService,
                        },
                        GHOST_RIDER_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER,
                        GHOST_RIDER_POPOVER_POSITION_STRATEGY_FACTORY_PROVIDER,
                        GHOST_RIDER_POPOVER_CONTAINER_FACTORY_PROVIDER,
                        GHOST_RIDER_OVERLAY_CONTAINER_PROVIDER,
                    ],
                }]
        }] });

class GhostRiderStep {
    constructor(name, ...steps) {
        this.name = name;
        this.hasSubSteps = false;
        this.subSteps = [];
        this.hidden = false;
        if (steps && steps.length) {
            this.hasSubSteps = true;
            this.subSteps = steps;
            steps.forEach((subStep) => {
                subStep.parent = this;
            });
        }
    }
}

/*
 * Public API Surface of ng-ghost-rider
 */

/**
 * Generated bundle index. Do not edit.
 */

export { GhostRiderEventSource, GhostRiderEventType, GhostRiderModule, GhostRiderService, GhostRiderStep, GhostRiderStepAdvanceDirective, GhostRiderStepCompleteDirective, GhostRiderStepComponent, GhostRiderStepDirective, GhostRiderStepHideDirective, GhostRiderStepPreviousDirective, PopoverComponent };
//# sourceMappingURL=ng-ghost-rider.mjs.map
