/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, FactoryProvider, InjectionToken } from '@angular/core';
import { ConnectedOverlayPositionChange, ConnectedPosition, ConnectionPositionPair, OverlayContainer, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { ViewportRuler, CdkScrollable } from '@angular/cdk/scrolling';
import { Observable, Subscription, Subject } from 'rxjs';
import { GhostRiderPopoverContainer } from '../tokens/popover-container.token';
import { GhostRiderRootPopoverContainer } from '../providers/popover-container.service';
/** Injection token that determines the position handling while a popover is visible. */
export declare const GHOST_RIDER_POPOVER_POSITION_STRATEGY: InjectionToken<PopoverPositionStrategyFactory>;
/** Possible values that can be set as the origin of a PopoverPositionStrategy. */
export declare type PopoverPositionStrategyOrigin = ElementRef | HTMLElement | Point & {
    width?: number;
    height?: number;
};
export declare type PopoverPositionStrategyFactory = (origin: PopoverPositionStrategyOrigin) => PopoverPositionStrategy;
export interface PopoverPositionStrategy extends PositionStrategy {
    positionChanges: Observable<ConnectedOverlayPositionChange>;
    withScrollableContainers(scrollables: CdkScrollable[]): this;
    withPositions(positions: ConnectedPosition[]): this;
    withContainer(container: GhostRiderPopoverContainer): this;
}
/**
 * A strategy for positioning overlays. Using this strategy, an overlay is given an
 * implicit position relative some origin element. The relative position is defined in terms of
 * a point on the origin element that is connected to a point on the overlay element. For example,
 * a basic dropdown is connecting the bottom-left corner of the origin to the top-left corner
 * of the overlay.
 */
export declare class PopoverPositionStrategy implements PositionStrategy {
    protected _viewportRuler: ViewportRuler;
    protected _document: Document;
    protected _platform: Platform;
    protected _overlayContainer: OverlayContainer;
    protected _rootContainer: GhostRiderRootPopoverContainer;
    /** The overlay to which this strategy is attached. */
    protected _overlayRef: OverlayRef;
    /** Whether we're performing the very first positioning of the overlay. */
    protected _isInitialRender: boolean;
    /** Last size used for the bounding box. Used to avoid resizing the overlay after open. */
    protected _lastBoundingBoxSize: {
        width: number;
        height: number;
    };
    /** Whether the overlay was pushed in a previous positioning. */
    protected _isPushed: boolean;
    /** Whether the overlay can be pushed on-screen on the initial open. */
    protected _canPush: boolean;
    /** Whether the overlay can grow via flexible width/height after the initial open. */
    protected _growAfterOpen: boolean;
    /** Whether the overlay's width and height can be constrained to fit within the viewport. */
    protected _hasFlexibleDimensions: boolean;
    /** Whether the overlay position is locked. */
    protected _positionLocked: boolean;
    /** Cached origin dimensions */
    protected _originRect: ClientRect;
    /** Cached overlay dimensions */
    protected _overlayRect: ClientRect;
    /** Cached viewport dimensions */
    protected _viewportRect: ClientRect;
    protected _containerRect: ClientRect;
    /** Amount of space that must be maintained between the overlay and the edge of the viewport. */
    protected _viewportMargin: number;
    /** The Scrollable containers used to check scrollable view properties on position change. */
    protected _scrollables: CdkScrollable[];
    protected _container: GhostRiderPopoverContainer;
    /** Ordered list of preferred positions, from most to least desirable. */
    _preferredPositions: ConnectionPositionPair[];
    /** The origin element against which the overlay will be positioned. */
    protected _origin: PopoverPositionStrategyOrigin;
    /** The overlay pane element. */
    protected _pane: HTMLElement;
    /** Whether the strategy has been disposed of already. */
    protected _isDisposed: boolean;
    /**
     * Parent element for the overlay panel used to constrain the overlay panel's size to fit
     * within the viewport.
     */
    protected _boundingBox: HTMLElement | null;
    /** The last position to have been calculated as the best fit position. */
    protected _lastPosition: ConnectedPosition | null;
    /** Subject that emits whenever the position changes. */
    protected _positionChanges: Subject<ConnectedOverlayPositionChange>;
    /** Subscription to viewport size changes. */
    protected _resizeSubscription: Subscription;
    /** Default offset for the overlay along the x axis. */
    protected _offsetX: number;
    /** Default offset for the overlay along the y axis. */
    protected _offsetY: number;
    /** Selector to be used when finding the elements on which to set the transform origin. */
    protected _transformOriginSelector: string;
    /** Keeps track of the CSS classes that the position strategy has applied on the overlay panel. */
    protected _appliedPanelClasses: string[];
    /** Amount by which the overlay was pushed in each axis during the last time it was positioned. */
    protected _previousPushAmount: {
        x: number;
        y: number;
    } | null;
    /** Observable sequence of position changes. */
    positionChanges: Observable<ConnectedOverlayPositionChange>;
    /** Ordered list of preferred positions, from most to least desirable. */
    get positions(): ConnectionPositionPair[];
    constructor(connectedTo: PopoverPositionStrategyOrigin, _viewportRuler: ViewportRuler, _document: Document, _platform: Platform, _overlayContainer: OverlayContainer, _rootContainer: GhostRiderRootPopoverContainer);
    /** Attaches this position strategy to an overlay. */
    attach(overlayRef: OverlayRef): void;
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
    apply(): void;
    detach(): void;
    /** Cleanup after the element gets destroyed. */
    dispose(): void;
    /**
     * This re-aligns the overlay element with the trigger in its last calculated position,
     * even if a position higher in the "preferred positions" list would now fit. This
     * allows one to re-align the panel without changing the orientation of the panel.
     */
    reapplyLastPosition(): void;
    /**
     * Sets the origin, relative to which to position the overlay.
     * Using an element origin is useful for building components that need to be positioned
     * relatively to a trigger (e.g. dropdown menus or tooltips), whereas using a point can be
     * used for cases like contextual menus which open relative to the user's pointer.
     * @param origin Reference to the new origin.
     */
    setOrigin(origin: PopoverPositionStrategyOrigin): this;
    /**
     * Gets the (x, y) coordinate of a connection point on the origin based on a relative position.
     */
    private _getOriginPoint;
    /**
     * Gets the (x, y) coordinate of the top-left corner of the overlay given a given position and
     * origin point to which the overlay should be connected.
     */
    private _getOverlayPoint;
    /** Gets how well an overlay at the given point will fit within the viewport. */
    private _getOverlayFit;
    /**
     * Whether the overlay can fit within the viewport when it may resize either its width or height.
     * @param fit How well the overlay fits in the viewport at some position.
     * @param point The (x, y) coordinates of the overlat at some position.
     * @param viewport The geometry of the viewport.
     */
    private _canFitWithFlexibleDimensions;
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
    private _pushOverlayOnScreen;
    /**
     * Applies a computed position to the overlay and emits a position change.
     * @param position The position preference
     * @param originPoint The point on the origin element where the overlay is connected.
     */
    private _applyPosition;
    /** Sets the transform origin based on the configured selector and the passed-in position.  */
    private _setTransformOrigin;
    /**
     * Gets the position and size of the overlay's sizing container.
     *
     * This method does no measuring and applies no styles so that we can cheaply compute the
     * bounds for all positions and choose the best fit based on these results.
     */
    private _calculateBoundingBoxRect;
    /**
     * Sets the position and size of the overlay's sizing wrapper. The wrapper is positioned on the
     * origin's connection point and stetches to the bounds of the viewport.
     *
     * @param origin The point on the origin element where the overlay is connected.
     * @param position The position preference
     */
    private _setBoundingBoxStyles;
    /** Resets the styles for the bounding box so that a new positioning can be computed. */
    private _resetBoundingBoxStyles;
    /** Resets the styles for the overlay pane so that a new positioning can be computed. */
    private _resetOverlayElementStyles;
    /** Sets positioning styles to the overlay element. */
    private _setOverlayElementStyles;
    /** Gets the exact top/bottom for the overlay when not using flexible sizing or when pushing. */
    private _getExactOverlayY;
    /** Gets the exact left/right for the overlay when not using flexible sizing or when pushing. */
    private _getExactOverlayX;
    /**
     * Gets the view properties of the trigger and overlay, including whether they are clipped
     * or completely outside the view of any of the strategy's scrollables.
     */
    private _getScrollVisibility;
    /** Subtracts the amount that an element is overflowing on an axis from its length. */
    private _subtractOverflows;
    private _getNarrowedRect;
    /** Whether the we're dealing with an RTL context */
    private _isRtl;
    /** Determines whether the overlay uses exact or flexible positioning. */
    private _hasExactPosition;
    /** Retrieves the offset of a position along the x or y axis. */
    private _getOffset;
    /** Validates that the current position match the expected values. */
    private _validatePositions;
    /** Adds a single CSS class or an array of classes on the overlay panel. */
    private _addPanelClasses;
    /** Clears the classes that the position strategy has applied from the overlay panel. */
    private _clearPanelClasses;
    /** Returns the ClientRect of the current origin. */
    private _getOriginRect;
}
/** A simple (x, y) coordinate. */
interface Point {
    x: number;
    y: number;
}
/** @docs-private */
export declare function GHOST_RIDER_POPOVER_POSITION_STRATEGY_FACTORY(viewportRuler: ViewportRuler, document: Document, platform: Platform, overlayContainer: OverlayContainer, rootPopoverContainer: GhostRiderRootPopoverContainer): PopoverPositionStrategyFactory;
/** @docs-private */
export declare const GHOST_RIDER_POPOVER_POSITION_STRATEGY_FACTORY_PROVIDER: FactoryProvider;
export {};
