/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, InjectionToken } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { coerceCssPixelValue, coerceArray } from '@angular/cdk/coercion';
import { ConnectedOverlayPositionChange, OverlayContainer, validateHorizontalPosition, validateVerticalPosition, } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { Subscription, Subject } from 'rxjs';
import { GhostRiderRootPopoverContainer } from '../providers/popover-container.service';
/** Class to be added to the overlay bounding box. */
const boundingBoxClass = 'cdk-overlay-connected-position-bounding-box';
/** Injection token that determines the position handling while a popover is visible. */
export const GHOST_RIDER_POPOVER_POSITION_STRATEGY = new InjectionToken('PopoverPositionStrategy');
/**
 * A strategy for positioning overlays. Using this strategy, an overlay is given an
 * implicit position relative some origin element. The relative position is defined in terms of
 * a point on the origin element that is connected to a point on the overlay element. For example,
 * a basic dropdown is connecting the bottom-left corner of the origin to the top-left corner
 * of the overlay.
 */
export class PopoverPositionStrategy {
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
export function GHOST_RIDER_POPOVER_POSITION_STRATEGY_FACTORY(viewportRuler, document, platform, overlayContainer, rootPopoverContainer) {
    return (origin) => {
        return new PopoverPositionStrategy(origin, viewportRuler, document, platform, overlayContainer, rootPopoverContainer);
    };
}
/** @docs-private */
export const GHOST_RIDER_POPOVER_POSITION_STRATEGY_FACTORY_PROVIDER = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci1wb3NpdGlvbi1zdHJhdGVneS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmctZ2hvc3QtcmlkZXIvc3JjL2xpYi9wcm92aWRlcnMvcG9wb3Zlci1wb3NpdGlvbi1zdHJhdGVneS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBRSxVQUFVLEVBQW1CLGNBQWMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM1RSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFM0MsT0FBTyxFQUFFLG1CQUFtQixFQUFFLFdBQVcsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3pFLE9BQU8sRUFDTiw4QkFBOEIsRUFHOUIsZ0JBQWdCLEVBSWhCLDBCQUEwQixFQUMxQix3QkFBd0IsR0FDeEIsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDakQsT0FBTyxFQUFFLGFBQWEsRUFBeUMsTUFBTSx3QkFBd0IsQ0FBQztBQUU5RixPQUFPLEVBQWMsWUFBWSxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUl6RCxPQUFPLEVBQUUsOEJBQThCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUV4RixxREFBcUQ7QUFDckQsTUFBTSxnQkFBZ0IsR0FBRyw2Q0FBNkMsQ0FBQztBQUV2RSx3RkFBd0Y7QUFDeEYsTUFBTSxDQUFDLE1BQU0scUNBQXFDLEdBQUcsSUFBSSxjQUFjLENBQWlDLHlCQUF5QixDQUFDLENBQUM7QUFrQm5JOzs7Ozs7R0FNRztBQUNILE1BQU0sT0FBTyx1QkFBdUI7SUE4Rm5DLFlBQ0MsV0FBMEMsRUFDaEMsY0FBNkIsRUFDN0IsU0FBbUIsRUFDbkIsU0FBbUIsRUFDbkIsaUJBQW1DLEVBQ25DLGNBQThDO1FBSjlDLG1CQUFjLEdBQWQs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MkIsRUFBRTtRQUN6RSxPQUFPLElBQUksdUJBQXVCLENBQ2pDLE1BQU0sRUFDTixhQUFhLEVBQ2IsUUFBUSxFQUNSLFFBQVEsRUFDUixnQkFBZ0IsRUFDaEIsb0JBQW9CLENBQ3BCLENBQUM7SUFDSCxDQUFDLENBQUM7QUFDSCxDQUFDO0FBRUQsb0JBQW9CO0FBQ3BCLE1BQU0sQ0FBQyxNQUFNLHNEQUFzRCxHQUFvQjtJQUN0RixPQUFPLEVBQUUscUNBQXFDO0lBQzlDLFVBQVUsRUFBRSw2Q0FBNkM7SUFDekQsSUFBSSxFQUFFO1FBQ0wsYUFBYTtRQUNiLFFBQVE7UUFDUixRQUFRO1FBQ1IsZ0JBQWdCO1FBQ2hCLDhCQUE4QjtLQUM5QjtDQUNELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IEVsZW1lbnRSZWYsIEZhY3RvcnlQcm92aWRlciwgSW5qZWN0aW9uVG9rZW4gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IERPQ1VNRU5UIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuaW1wb3J0IHsgY29lcmNlQ3NzUGl4ZWxWYWx1ZSwgY29lcmNlQXJyYXkgfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtcblx0Q29ubmVjdGVkT3ZlcmxheVBvc2l0aW9uQ2hhbmdlLFxuXHRDb25uZWN0ZWRQb3NpdGlvbixcblx0Q29ubmVjdGlvblBvc2l0aW9uUGFpcixcblx0T3ZlcmxheUNvbnRhaW5lcixcblx0T3ZlcmxheVJlZixcblx0UG9zaXRpb25TdHJhdGVneSxcblx0U2Nyb2xsaW5nVmlzaWJpbGl0eSxcblx0dmFsaWRhdGVIb3Jpem9udGFsUG9zaXRpb24sXG5cdHZhbGlkYXRlVmVydGljYWxQb3NpdGlvbixcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHsgUGxhdGZvcm0gfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHsgVmlld3BvcnRSdWxlciwgQ2RrU2Nyb2xsYWJsZSwgVmlld3BvcnRTY3JvbGxQb3NpdGlvbiB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9zY3JvbGxpbmcnO1xuXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJzY3JpcHRpb24sIFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuLy8gUHJvdmlkZXJzXG5pbXBvcnQgeyBHaG9zdFJpZGVyUG9wb3ZlckNvbnRhaW5lciB9IGZyb20gJy4uL3Rva2Vucy9wb3BvdmVyLWNvbnRhaW5lci50b2tlbic7XG5pbXBvcnQgeyBHaG9zdFJpZGVyUm9vdFBvcG92ZXJDb250YWluZXIgfSBmcm9tICcuLi9wcm92aWRlcnMvcG9wb3Zlci1jb250YWluZXIuc2VydmljZSc7XG5cbi8qKiBDbGFzcyB0byBiZSBhZGRlZCB0byB0aGUgb3ZlcmxheSBib3VuZGluZyBib3guICovXG5jb25zdCBib3VuZGluZ0JveENsYXNzID0gJ2Nkay1vdmVybGF5LWNvbm5lY3RlZC1wb3NpdGlvbi1ib3VuZGluZy1ib3gnO1xuXG4vKiogSW5qZWN0aW9uIHRva2VuIHRoYXQgZGV0ZXJtaW5lcyB0aGUgcG9zaXRpb24gaGFuZGxpbmcgd2hpbGUgYSBwb3BvdmVyIGlzIHZpc2libGUuICovXG5leHBvcnQgY29uc3QgR0hPU1RfUklERVJfUE9QT1ZFUl9QT1NJVElPTl9TVFJBVEVHWSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxQb3BvdmVyUG9zaXRpb25TdHJhdGVneUZhY3Rvcnk+KCdQb3BvdmVyUG9zaXRpb25TdHJhdGVneScpO1xuXG4vKiogUG9zc2libGUgdmFsdWVzIHRoYXQgY2FuIGJlIHNldCBhcyB0aGUgb3JpZ2luIG9mIGEgUG9wb3ZlclBvc2l0aW9uU3RyYXRlZ3kuICovXG5leHBvcnQgdHlwZSBQb3BvdmVyUG9zaXRpb25TdHJhdGVneU9yaWdpbiA9IEVsZW1lbnRSZWYgfCBIVE1MRWxlbWVudCB8IFBvaW50ICYge1xuXHR3aWR0aD86IG51bWJlcjtcblx0aGVpZ2h0PzogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgUG9wb3ZlclBvc2l0aW9uU3RyYXRlZ3lGYWN0b3J5XG5cdD0gKG9yaWdpbjogUG9wb3ZlclBvc2l0aW9uU3RyYXRlZ3lPcmlnaW4pID0+IFBvcG92ZXJQb3NpdGlvblN0cmF0ZWd5O1xuXG5leHBvcnQgaW50ZXJmYWNlIFBvcG92ZXJQb3NpdGlvblN0cmF0ZWd5IGV4dGVuZHMgUG9zaXRpb25TdHJhdGVneSB7XG5cdHBvc2l0aW9uQ2hhbmdlczogT2JzZXJ2YWJsZTxDb25uZWN0ZWRPdmVybGF5UG9zaXRpb25DaGFuZ2U+O1xuXHR3aXRoU2Nyb2xsYWJsZUNvbnRhaW5lcnMoc2Nyb2xsYWJsZXM6IENka1Njcm9sbGFibGVbXSk6IHRoaXM7XG5cdHdpdGhQb3NpdGlvbnMocG9zaXRpb25zOiBDb25uZWN0ZWRQb3NpdGlvbltdKTogdGhpcztcblx0d2l0aENvbnRhaW5lcihjb250YWluZXI6IEdob3N0UmlkZXJQb3BvdmVyQ29udGFpbmVyKTogdGhpcztcbn1cblxuLyoqXG4gKiBBIHN0cmF0ZWd5IGZvciBwb3NpdGlvbmluZyBvdmVybGF5cy4gVXNpbmcgdGhpcyBzdHJhdGVneSwgYW4gb3ZlcmxheSBpcyBnaXZlbiBhblxuICogaW1wbGljaXQgcG9zaXRpb24gcmVsYXRpdmUgc29tZSBvcmlnaW4gZWxlbWVudC4gVGhlIHJlbGF0aXZlIHBvc2l0aW9uIGlzIGRlZmluZWQgaW4gdGVybXMgb2ZcbiAqIGEgcG9pbnQgb24gdGhlIG9yaWdpbiBlbGVtZW50IHRoYXQgaXMgY29ubmVjdGVkIHRvIGEgcG9pbnQgb24gdGhlIG92ZXJsYXkgZWxlbWVudC4gRm9yIGV4YW1wbGUsXG4gKiBhIGJhc2ljIGRyb3Bkb3duIGlzIGNvbm5lY3RpbmcgdGhlIGJvdHRvbS1sZWZ0IGNvcm5lciBvZiB0aGUgb3JpZ2luIHRvIHRoZSB0b3AtbGVmdCBjb3JuZXJcbiAqIG9mIHRoZSBvdmVybGF5LlxuICovXG5leHBvcnQgY2xhc3MgUG9wb3ZlclBvc2l0aW9uU3RyYXRlZ3kgaW1wbGVtZW50cyBQb3NpdGlvblN0cmF0ZWd5IHtcblx0LyoqIFRoZSBvdmVybGF5IHRvIHdoaWNoIHRoaXMgc3RyYXRlZ3kgaXMgYXR0YWNoZWQuICovXG5cdHByb3RlY3RlZCBfb3ZlcmxheVJlZiE6IE92ZXJsYXlSZWY7XG5cblx0LyoqIFdoZXRoZXIgd2UncmUgcGVyZm9ybWluZyB0aGUgdmVyeSBmaXJzdCBwb3NpdGlvbmluZyBvZiB0aGUgb3ZlcmxheS4gKi9cblx0cHJvdGVjdGVkIF9pc0luaXRpYWxSZW5kZXIhOiBib29sZWFuO1xuXG5cdC8qKiBMYXN0IHNpemUgdXNlZCBmb3IgdGhlIGJvdW5kaW5nIGJveC4gVXNlZCB0byBhdm9pZCByZXNpemluZyB0aGUgb3ZlcmxheSBhZnRlciBvcGVuLiAqL1xuXHRwcm90ZWN0ZWQgX2xhc3RCb3VuZGluZ0JveFNpemUgPSB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfTtcblxuXHQvKiogV2hldGhlciB0aGUgb3ZlcmxheSB3YXMgcHVzaGVkIGluIGEgcHJldmlvdXMgcG9zaXRpb25pbmcuICovXG5cdHByb3RlY3RlZCBfaXNQdXNoZWQgPSBmYWxzZTtcblxuXHQvKiogV2hldGhlciB0aGUgb3ZlcmxheSBjYW4gYmUgcHVzaGVkIG9uLXNjcmVlbiBvbiB0aGUgaW5pdGlhbCBvcGVuLiAqL1xuXHRwcm90ZWN0ZWQgX2NhblB1c2ggPSB0cnVlO1xuXG5cdC8qKiBXaGV0aGVyIHRoZSBvdmVybGF5IGNhbiBncm93IHZpYSBmbGV4aWJsZSB3aWR0aC9oZWlnaHQgYWZ0ZXIgdGhlIGluaXRpYWwgb3Blbi4gKi9cblx0cHJvdGVjdGVkIF9ncm93QWZ0ZXJPcGVuID0gZmFsc2U7XG5cblx0LyoqIFdoZXRoZXIgdGhlIG92ZXJsYXkncyB3aWR0aCBhbmQgaGVpZ2h0IGNhbiBiZSBjb25zdHJhaW5lZCB0byBmaXQgd2l0aGluIHRoZSB2aWV3cG9ydC4gKi9cblx0cHJvdGVjdGVkIF9oYXNGbGV4aWJsZURpbWVuc2lvbnMgPSBmYWxzZTtcblxuXHQvKiogV2hldGhlciB0aGUgb3ZlcmxheSBwb3NpdGlvbiBpcyBsb2NrZWQuICovXG5cdHByb3RlY3RlZCBfcG9zaXRpb25Mb2NrZWQgPSBmYWxzZTtcblxuXHQvKiogQ2FjaGVkIG9yaWdpbiBkaW1lbnNpb25zICovXG5cdHByb3RlY3RlZCBfb3JpZ2luUmVjdCE6IENsaWVudFJlY3Q7XG5cblx0LyoqIENhY2hlZCBvdmVybGF5IGRpbWVuc2lvbnMgKi9cblx0cHJvdGVjdGVkIF9vdmVybGF5UmVjdCE6IENsaWVudFJlY3Q7XG5cblx0LyoqIENhY2hlZCB2aWV3cG9ydCBkaW1lbnNpb25zICovXG5cdHByb3RlY3RlZCBfdmlld3BvcnRSZWN0ITogQ2xpZW50UmVjdDtcblxuXHRwcm90ZWN0ZWQgX2NvbnRhaW5lclJlY3QhOiBDbGllbnRSZWN0O1xuXG5cdC8qKiBBbW91bnQgb2Ygc3BhY2UgdGhhdCBtdXN0IGJlIG1haW50YWluZWQgYmV0d2VlbiB0aGUgb3ZlcmxheSBhbmQgdGhlIGVkZ2Ugb2YgdGhlIHZpZXdwb3J0LiAqL1xuXHRwcm90ZWN0ZWQgX3ZpZXdwb3J0TWFyZ2luID0gODtcblxuXHQvKiogVGhlIFNjcm9sbGFibGUgY29udGFpbmVycyB1c2VkIHRvIGNoZWNrIHNjcm9sbGFibGUgdmlldyBwcm9wZXJ0aWVzIG9uIHBvc2l0aW9uIGNoYW5nZS4gKi9cblx0cHJvdGVjdGVkIF9zY3JvbGxhYmxlczogQ2RrU2Nyb2xsYWJsZVtdID0gW107XG5cblx0cHJvdGVjdGVkIF9jb250YWluZXI6IEdob3N0UmlkZXJQb3BvdmVyQ29udGFpbmVyID0gdGhpcy5fcm9vdENvbnRhaW5lcjtcblxuXHQvKiogT3JkZXJlZCBsaXN0IG9mIHByZWZlcnJlZCBwb3NpdGlvbnMsIGZyb20gbW9zdCB0byBsZWFzdCBkZXNpcmFibGUuICovXG5cdF9wcmVmZXJyZWRQb3NpdGlvbnM6IENvbm5lY3Rpb25Qb3NpdGlvblBhaXJbXSA9IFtdO1xuXG5cdC8qKiBUaGUgb3JpZ2luIGVsZW1lbnQgYWdhaW5zdCB3aGljaCB0aGUgb3ZlcmxheSB3aWxsIGJlIHBvc2l0aW9uZWQuICovXG5cdHByb3RlY3RlZCBfb3JpZ2luITogUG9wb3ZlclBvc2l0aW9uU3RyYXRlZ3lPcmlnaW47XG5cblx0LyoqIFRoZSBvdmVybGF5IHBhbmUgZWxlbWVudC4gKi9cblx0cHJvdGVjdGVkIF9wYW5lITogSFRNTEVsZW1lbnQ7XG5cblx0LyoqIFdoZXRoZXIgdGhlIHN0cmF0ZWd5IGhhcyBiZWVuIGRpc3Bvc2VkIG9mIGFscmVhZHkuICovXG5cdHByb3RlY3RlZCBfaXNEaXNwb3NlZCE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFBhcmVudCBlbGVtZW50IGZvciB0aGUgb3ZlcmxheSBwYW5lbCB1c2VkIHRvIGNvbnN0cmFpbiB0aGUgb3ZlcmxheSBwYW5lbCdzIHNpemUgdG8gZml0XG5cdCAqIHdpdGhpbiB0aGUgdmlld3BvcnQuXG5cdCAqL1xuXHRwcm90ZWN0ZWQgX2JvdW5kaW5nQm94ITogSFRNTEVsZW1lbnQgfCBudWxsO1xuXG5cdC8qKiBUaGUgbGFzdCBwb3NpdGlvbiB0byBoYXZlIGJlZW4gY2FsY3VsYXRlZCBhcyB0aGUgYmVzdCBmaXQgcG9zaXRpb24uICovXG5cdHByb3RlY3RlZCBfbGFzdFBvc2l0aW9uITogQ29ubmVjdGVkUG9zaXRpb24gfCBudWxsO1xuXG5cdC8qKiBTdWJqZWN0IHRoYXQgZW1pdHMgd2hlbmV2ZXIgdGhlIHBvc2l0aW9uIGNoYW5nZXMuICovXG5cdHByb3RlY3RlZCBfcG9zaXRpb25DaGFuZ2VzID0gbmV3IFN1YmplY3Q8Q29ubmVjdGVkT3ZlcmxheVBvc2l0aW9uQ2hhbmdlPigpO1xuXG5cdC8qKiBTdWJzY3JpcHRpb24gdG8gdmlld3BvcnQgc2l6ZSBjaGFuZ2VzLiAqL1xuXHRwcm90ZWN0ZWQgX3Jlc2l6ZVN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcblxuXHQvKiogRGVmYXVsdCBvZmZzZXQgZm9yIHRoZSBvdmVybGF5IGFsb25nIHRoZSB4IGF4aXMuICovXG5cdHByb3RlY3RlZCBfb2Zmc2V0WCA9IDA7XG5cblx0LyoqIERlZmF1bHQgb2Zmc2V0IGZvciB0aGUgb3ZlcmxheSBhbG9uZyB0aGUgeSBheGlzLiAqL1xuXHRwcm90ZWN0ZWQgX29mZnNldFkgPSAwO1xuXG5cdC8qKiBTZWxlY3RvciB0byBiZSB1c2VkIHdoZW4gZmluZGluZyB0aGUgZWxlbWVudHMgb24gd2hpY2ggdG8gc2V0IHRoZSB0cmFuc2Zvcm0gb3JpZ2luLiAqL1xuXHRwcm90ZWN0ZWQgX3RyYW5zZm9ybU9yaWdpblNlbGVjdG9yOiBzdHJpbmcgPSAnLmdob3N0LXJpZGVyLXBvcG92ZXInO1xuXG5cdC8qKiBLZWVwcyB0cmFjayBvZiB0aGUgQ1NTIGNsYXNzZXMgdGhhdCB0aGUgcG9zaXRpb24gc3RyYXRlZ3kgaGFzIGFwcGxpZWQgb24gdGhlIG92ZXJsYXkgcGFuZWwuICovXG5cdHByb3RlY3RlZCBfYXBwbGllZFBhbmVsQ2xhc3Nlczogc3RyaW5nW10gPSBbXTtcblxuXHQvKiogQW1vdW50IGJ5IHdoaWNoIHRoZSBvdmVybGF5IHdhcyBwdXNoZWQgaW4gZWFjaCBheGlzIGR1cmluZyB0aGUgbGFzdCB0aW1lIGl0IHdhcyBwb3NpdGlvbmVkLiAqL1xuXHRwcm90ZWN0ZWQgX3ByZXZpb3VzUHVzaEFtb3VudCE6IHsgeDogbnVtYmVyLCB5OiBudW1iZXIgfSB8IG51bGw7XG5cblx0LyoqIE9ic2VydmFibGUgc2VxdWVuY2Ugb2YgcG9zaXRpb24gY2hhbmdlcy4gKi9cblx0cG9zaXRpb25DaGFuZ2VzOiBPYnNlcnZhYmxlPENvbm5lY3RlZE92ZXJsYXlQb3NpdGlvbkNoYW5nZT4gPSB0aGlzLl9wb3NpdGlvbkNoYW5nZXMuYXNPYnNlcnZhYmxlKCk7XG5cblx0LyoqIE9yZGVyZWQgbGlzdCBvZiBwcmVmZXJyZWQgcG9zaXRpb25zLCBmcm9tIG1vc3QgdG8gbGVhc3QgZGVzaXJhYmxlLiAqL1xuXHRnZXQgcG9zaXRpb25zKCk6IENvbm5lY3Rpb25Qb3NpdGlvblBhaXJbXSB7XG5cdFx0cmV0dXJuIHRoaXMuX3ByZWZlcnJlZFBvc2l0aW9ucztcblx0fVxuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdGNvbm5lY3RlZFRvOiBQb3BvdmVyUG9zaXRpb25TdHJhdGVneU9yaWdpbixcblx0XHRwcm90ZWN0ZWQgX3ZpZXdwb3J0UnVsZXI6IFZpZXdwb3J0UnVsZXIsXG5cdFx0cHJvdGVjdGVkIF9kb2N1bWVudDogRG9jdW1lbnQsXG5cdFx0cHJvdGVjdGVkIF9wbGF0Zm9ybTogUGxhdGZvcm0sXG5cdFx0cHJvdGVjdGVkIF9vdmVybGF5Q29udGFpbmVyOiBPdmVybGF5Q29udGFpbmVyLFxuXHRcdHByb3RlY3RlZCBfcm9vdENvbnRhaW5lcjogR2hvc3RSaWRlclJvb3RQb3BvdmVyQ29udGFpbmVyLFxuXHQpIHtcblx0XHR0aGlzLnNldE9yaWdpbihjb25uZWN0ZWRUbyk7XG5cdH1cblxuXHQvKiogQXR0YWNoZXMgdGhpcyBwb3NpdGlvbiBzdHJhdGVneSB0byBhbiBvdmVybGF5LiAqL1xuXHRhdHRhY2gob3ZlcmxheVJlZjogT3ZlcmxheVJlZik6IHZvaWQge1xuXHRcdGlmICh0aGlzLl9vdmVybGF5UmVmICYmIG92ZXJsYXlSZWYgIT09IHRoaXMuX292ZXJsYXlSZWYpIHtcblx0XHRcdHRocm93IEVycm9yKCdUaGlzIHBvc2l0aW9uIHN0cmF0ZWd5IGlzIGFscmVhZHkgYXR0YWNoZWQgdG8gYW4gb3ZlcmxheScpO1xuXHRcdH1cblxuXHRcdHRoaXMuX3ZhbGlkYXRlUG9zaXRpb25zKCk7XG5cblx0XHRvdmVybGF5UmVmLmhvc3RFbGVtZW50LmNsYXNzTGlzdC5hZGQoYm91bmRpbmdCb3hDbGFzcyk7XG5cblx0XHR0aGlzLl9vdmVybGF5UmVmID0gb3ZlcmxheVJlZjtcblx0XHR0aGlzLl9ib3VuZGluZ0JveCA9IG92ZXJsYXlSZWYuaG9zdEVsZW1lbnQ7XG5cdFx0dGhpcy5fcGFuZSA9IG92ZXJsYXlSZWYub3ZlcmxheUVsZW1lbnQ7XG5cdFx0dGhpcy5faXNEaXNwb3NlZCA9IGZhbHNlO1xuXHRcdHRoaXMuX2lzSW5pdGlhbFJlbmRlciA9IHRydWU7XG5cdFx0dGhpcy5fbGFzdFBvc2l0aW9uID0gbnVsbDtcblx0XHR0aGlzLl9yZXNpemVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcblx0XHR0aGlzLl9yZXNpemVTdWJzY3JpcHRpb24gPSB0aGlzLl92aWV3cG9ydFJ1bGVyLmNoYW5nZSgpLnN1YnNjcmliZSgoKSA9PiB7XG5cdFx0XHQvLyBXaGVuIHRoZSB3aW5kb3cgaXMgcmVzaXplZCwgd2Ugd2FudCB0byB0cmlnZ2VyIHRoZSBuZXh0IHJlcG9zaXRpb24gYXMgaWYgaXRcblx0XHRcdC8vIHdhcyBhbiBpbml0aWFsIHJlbmRlciwgaW4gb3JkZXIgZm9yIHRoZSBzdHJhdGVneSB0byBwaWNrIGEgbmV3IG9wdGltYWwgcG9zaXRpb24sXG5cdFx0XHQvLyBvdGhlcndpc2UgcG9zaXRpb24gbG9ja2luZyB3aWxsIGNhdXNlIGl0IHRvIHN0YXkgYXQgdGhlIG9sZCBvbmUuXG5cdFx0XHR0aGlzLl9pc0luaXRpYWxSZW5kZXIgPSB0cnVlO1xuXHRcdFx0dGhpcy5hcHBseSgpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgdGhlIHBvc2l0aW9uIG9mIHRoZSBvdmVybGF5IGVsZW1lbnQsIHVzaW5nIHdoaWNoZXZlciBwcmVmZXJyZWQgcG9zaXRpb24gcmVsYXRpdmVcblx0ICogdG8gdGhlIG9yaWdpbiBiZXN0IGZpdHMgb24tc2NyZWVuLlxuXHQgKlxuXHQgKiBUaGUgc2VsZWN0aW9uIG9mIGEgcG9zaXRpb24gZ29lcyBhcyBmb2xsb3dzOlxuXHQgKiAgLSBJZiBhbnkgcG9zaXRpb25zIGZpdCBjb21wbGV0ZWx5IHdpdGhpbiB0aGUgdmlld3BvcnQgYXMtaXMsXG5cdCAqICAgICAgY2hvb3NlIHRoZSBmaXJzdCBwb3NpdGlvbiB0aGF0IGRvZXMgc28uXG5cdCAqICAtIElmIGZsZXhpYmxlIGRpbWVuc2lvbnMgYXJlIGVuYWJsZWQgYW5kIGF0IGxlYXN0IG9uZSBzYXRpZmllcyB0aGUgZ2l2ZW4gbWluaW11bSB3aWR0aC9oZWlnaHQsXG5cdCAqICAgICAgY2hvb3NlIHRoZSBwb3NpdGlvbiB3aXRoIHRoZSBncmVhdGVzdCBhdmFpbGFibGUgc2l6ZSBtb2RpZmllZCBieSB0aGUgcG9zaXRpb25zJyB3ZWlnaHQuXG5cdCAqICAtIElmIHB1c2hpbmcgaXMgZW5hYmxlZCwgdGFrZSB0aGUgcG9zaXRpb24gdGhhdCB3ZW50IG9mZi1zY3JlZW4gdGhlIGxlYXN0IGFuZCBwdXNoIGl0XG5cdCAqICAgICAgb24tc2NyZWVuLlxuXHQgKiAgLSBJZiBub25lIG9mIHRoZSBwcmV2aW91cyBjcml0ZXJpYSB3ZXJlIG1ldCwgdXNlIHRoZSBwb3NpdGlvbiB0aGF0IGdvZXMgb2ZmLXNjcmVlbiB0aGUgbGVhc3QuXG5cdCAqIEBkb2NzLXByaXZhdGVcblx0ICovXG5cdGFwcGx5KCk6IHZvaWQge1xuXHRcdC8vIFdlIHNob3VsZG4ndCBkbyBhbnl0aGluZyBpZiB0aGUgc3RyYXRlZ3kgd2FzIGRpc3Bvc2VkIG9yIHdlJ3JlIG9uIHRoZSBzZXJ2ZXIuXG5cdFx0aWYgKHRoaXMuX2lzRGlzcG9zZWQgfHwgIXRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIElmIHRoZSBwb3NpdGlvbiBoYXMgYmVlbiBhcHBsaWVkIGFscmVhZHkgKGUuZy4gd2hlbiB0aGUgb3ZlcmxheSB3YXMgb3BlbmVkKSBhbmQgdGhlXG5cdFx0Ly8gY29uc3VtZXIgb3B0ZWQgaW50byBsb2NraW5nIGluIHRoZSBwb3NpdGlvbiwgcmUtdXNlIHRoZSBvbGQgcG9zaXRpb24sIGluIG9yZGVyIHRvXG5cdFx0Ly8gcHJldmVudCB0aGUgb3ZlcmxheSBmcm9tIGp1bXBpbmcgYXJvdW5kLlxuXHRcdGlmICghdGhpcy5faXNJbml0aWFsUmVuZGVyICYmIHRoaXMuX3Bvc2l0aW9uTG9ja2VkICYmIHRoaXMuX2xhc3RQb3NpdGlvbikge1xuXHRcdFx0dGhpcy5yZWFwcGx5TGFzdFBvc2l0aW9uKCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5fY2xlYXJQYW5lbENsYXNzZXMoKTtcblx0XHR0aGlzLl9yZXNldE92ZXJsYXlFbGVtZW50U3R5bGVzKCk7XG5cdFx0dGhpcy5fcmVzZXRCb3VuZGluZ0JveFN0eWxlcygpO1xuXG5cdFx0Ly8gV2UgbmVlZCB0aGUgYm91bmRpbmcgcmVjdHMgZm9yIHRoZSBvcmlnaW4gYW5kIHRoZSBvdmVybGF5IHRvIGRldGVybWluZSBob3cgdG8gcG9zaXRpb25cblx0XHQvLyB0aGUgb3ZlcmxheSByZWxhdGl2ZSB0byB0aGUgb3JpZ2luLlxuXHRcdC8vIFdlIHVzZSB0aGUgdmlld3BvcnQgcmVjdCB0byBkZXRlcm1pbmUgd2hldGhlciBhIHBvc2l0aW9uIHdvdWxkIGdvIG9mZi1zY3JlZW4uXG5cdFx0dGhpcy5fdmlld3BvcnRSZWN0ID0gdGhpcy5fZ2V0TmFycm93ZWRSZWN0KHRoaXMuX3Jvb3RDb250YWluZXIpO1xuXHRcdHRoaXMuX29yaWdpblJlY3QgPSB0aGlzLl9nZXRPcmlnaW5SZWN0KCk7XG5cdFx0dGhpcy5fb3ZlcmxheVJlY3QgPSB0aGlzLl9wYW5lLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdHRoaXMuX2NvbnRhaW5lclJlY3QgPSB0aGlzLl9nZXROYXJyb3dlZFJlY3QodGhpcy5fY29udGFpbmVyKTtcblxuXHRcdGNvbnN0IG9yaWdpblJlY3QgPSB0aGlzLl9vcmlnaW5SZWN0O1xuXHRcdGNvbnN0IG92ZXJsYXlSZWN0ID0gdGhpcy5fb3ZlcmxheVJlY3Q7XG5cdFx0Y29uc3Qgdmlld3BvcnRSZWN0ID0gdGhpcy5fdmlld3BvcnRSZWN0O1xuXHRcdGNvbnN0IGNvbnRhaW5lclJlY3QgPSB0aGlzLl9jb250YWluZXJSZWN0O1xuXG5cdFx0Ly8gUG9zaXRpb25zIHdoZXJlIHRoZSBvdmVybGF5IHdpbGwgZml0IHdpdGggZmxleGlibGUgZGltZW5zaW9ucy5cblx0XHRjb25zdCBmbGV4aWJsZUZpdHM6IEZsZXhpYmxlRml0W10gPSBbXTtcblxuXHRcdC8vIEZhbGxiYWNrIGlmIG5vbmUgb2YgdGhlIHByZWZlcnJlZCBwb3NpdGlvbnMgZml0IHdpdGhpbiB0aGUgdmlld3BvcnQuXG5cdFx0bGV0IGZhbGxiYWNrOiBGYWxsYmFja1Bvc2l0aW9uIHwgdW5kZWZpbmVkO1xuXG5cdFx0Ly8gR28gdGhyb3VnaCBlYWNoIG9mIHRoZSBwcmVmZXJyZWQgcG9zaXRpb25zIGxvb2tpbmcgZm9yIGEgZ29vZCBmaXQuXG5cdFx0Ly8gSWYgYSBnb29kIGZpdCBpcyBmb3VuZCwgaXQgd2lsbCBiZSBhcHBsaWVkIGltbWVkaWF0ZWx5LlxuXHRcdGZvciAoY29uc3QgcG9zIG9mIHRoaXMuX3ByZWZlcnJlZFBvc2l0aW9ucykge1xuXHRcdFx0Ly8gR2V0IHRoZSBleGFjdCAoeCwgeSkgY29vcmRpbmF0ZSBmb3IgdGhlIHBvaW50LW9mLW9yaWdpbiBvbiB0aGUgb3JpZ2luIGVsZW1lbnQuXG5cdFx0XHRjb25zdCBvcmlnaW5Qb2ludCA9IHRoaXMuX2dldE9yaWdpblBvaW50KG9yaWdpblJlY3QsIHBvcyk7XG5cblx0XHRcdC8vIEZyb20gdGhhdCBwb2ludC1vZi1vcmlnaW4sIGdldCB0aGUgZXhhY3QgKHgsIHkpIGNvb3JkaW5hdGUgZm9yIHRoZSB0b3AtbGVmdCBjb3JuZXIgb2YgdGhlXG5cdFx0XHQvLyBvdmVybGF5IGluIHRoaXMgcG9zaXRpb24uIFdlIHVzZSB0aGUgdG9wLWxlZnQgY29ybmVyIGZvciBjYWxjdWxhdGlvbnMgYW5kIGxhdGVyIHRyYW5zbGF0ZVxuXHRcdFx0Ly8gdGhpcyBpbnRvIGFuIGFwcHJvcHJpYXRlICh0b3AsIGxlZnQsIGJvdHRvbSwgcmlnaHQpIHN0eWxlLlxuXHRcdFx0Y29uc3Qgb3ZlcmxheVBvaW50ID0gdGhpcy5fZ2V0T3ZlcmxheVBvaW50KG9yaWdpblBvaW50LCBvdmVybGF5UmVjdCwgcG9zKTtcblxuXHRcdFx0Ly8gQ2FsY3VsYXRlIGhvdyB3ZWxsIHRoZSBvdmVybGF5IHdvdWxkIGZpdCBpbnRvIHRoZSB2aWV3cG9ydCB3aXRoIHRoaXMgcG9pbnQuXG5cdFx0XHRjb25zdCBvdmVybGF5Rml0ID0gdGhpcy5fZ2V0T3ZlcmxheUZpdChvdmVybGF5UG9pbnQsIG92ZXJsYXlSZWN0LCBjb250YWluZXJSZWN0LCBwb3MpO1xuXG5cdFx0XHQvLyBJZiB0aGUgb3ZlcmxheSwgd2l0aG91dCBhbnkgZnVydGhlciB3b3JrLCBmaXRzIGludG8gdGhlIHZpZXdwb3J0LCB1c2UgdGhpcyBwb3NpdGlvbi5cblx0XHRcdGlmIChvdmVybGF5Rml0LmlzQ29tcGxldGVseVdpdGhpblZpZXdwb3J0KSB7XG5cdFx0XHRcdHRoaXMuX2lzUHVzaGVkID0gZmFsc2U7XG5cdFx0XHRcdHRoaXMuX2FwcGx5UG9zaXRpb24ocG9zLCBvcmlnaW5Qb2ludCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgdGhlIG92ZXJsYXkgaGFzIGZsZXhpYmxlIGRpbWVuc2lvbnMsIHdlIGNhbiB1c2UgdGhpcyBwb3NpdGlvblxuXHRcdFx0Ly8gc28gbG9uZyBhcyB0aGVyZSdzIGVub3VnaCBzcGFjZSBmb3IgdGhlIG1pbmltdW0gZGltZW5zaW9ucy5cblx0XHRcdGlmICh0aGlzLl9jYW5GaXRXaXRoRmxleGlibGVEaW1lbnNpb25zKG92ZXJsYXlGaXQsIG92ZXJsYXlQb2ludCwgdmlld3BvcnRSZWN0KSkge1xuXHRcdFx0XHQvLyBTYXZlIHBvc2l0aW9ucyB3aGVyZSB0aGUgb3ZlcmxheSB3aWxsIGZpdCB3aXRoIGZsZXhpYmxlIGRpbWVuc2lvbnMuIFdlIHdpbGwgdXNlIHRoZXNlXG5cdFx0XHRcdC8vIGlmIG5vbmUgb2YgdGhlIHBvc2l0aW9ucyBmaXQgKndpdGhvdXQqIGZsZXhpYmxlIGRpbWVuc2lvbnMuXG5cdFx0XHRcdGZsZXhpYmxlRml0cy5wdXNoKHtcblx0XHRcdFx0XHRwb3NpdGlvbjogcG9zLFxuXHRcdFx0XHRcdG9yaWdpbjogb3JpZ2luUG9pbnQsXG5cdFx0XHRcdFx0b3ZlcmxheVJlY3QsXG5cdFx0XHRcdFx0Ym91bmRpbmdCb3hSZWN0OiB0aGlzLl9jYWxjdWxhdGVCb3VuZGluZ0JveFJlY3Qob3JpZ2luUG9pbnQsIHBvcyksXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBJZiB0aGUgY3VycmVudCBwcmVmZXJyZWQgcG9zaXRpb24gZG9lcyBub3QgZml0IG9uIHRoZSBzY3JlZW4sIHJlbWVtYmVyIHRoZSBwb3NpdGlvblxuXHRcdFx0Ly8gaWYgaXQgaGFzIG1vcmUgdmlzaWJsZSBhcmVhIG9uLXNjcmVlbiB0aGFuIHdlJ3ZlIHNlZW4gYW5kIG1vdmUgb250byB0aGUgbmV4dCBwcmVmZXJyZWRcblx0XHRcdC8vIHBvc2l0aW9uLlxuXHRcdFx0aWYgKCFmYWxsYmFjayB8fCBmYWxsYmFjay5vdmVybGF5Rml0LnZpc2libGVBcmVhIDwgb3ZlcmxheUZpdC52aXNpYmxlQXJlYSkge1xuXHRcdFx0XHRmYWxsYmFjayA9IHsgb3ZlcmxheUZpdCwgb3ZlcmxheVBvaW50LCBvcmlnaW5Qb2ludCwgcG9zaXRpb246IHBvcywgb3ZlcmxheVJlY3QgfTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBJZiB0aGVyZSBhcmUgYW55IHBvc2l0aW9ucyB3aGVyZSB0aGUgb3ZlcmxheSB3b3VsZCBmaXQgd2l0aCBmbGV4aWJsZSBkaW1lbnNpb25zLCBjaG9vc2UgdGhlXG5cdFx0Ly8gb25lIHRoYXQgaGFzIHRoZSBncmVhdGVzdCBhcmVhIGF2YWlsYWJsZSBtb2RpZmllZCBieSB0aGUgcG9zaXRpb24ncyB3ZWlnaHRcblx0XHRpZiAoZmxleGlibGVGaXRzLmxlbmd0aCkge1xuXHRcdFx0bGV0IGJlc3RGaXQ6IEZsZXhpYmxlRml0ID0gbnVsbCBhcyB1bmtub3duIGFzIEZsZXhpYmxlRml0O1xuXHRcdFx0bGV0IGJlc3RTY29yZSA9IC0xO1xuXHRcdFx0Zm9yIChjb25zdCBmaXQgb2YgZmxleGlibGVGaXRzKSB7XG5cdFx0XHRcdGNvbnN0IHNjb3JlID1cblx0XHRcdFx0XHRmaXQuYm91bmRpbmdCb3hSZWN0LndpZHRoICogZml0LmJvdW5kaW5nQm94UmVjdC5oZWlnaHQgKiAoZml0LnBvc2l0aW9uLndlaWdodCB8fCAxKTtcblx0XHRcdFx0aWYgKHNjb3JlID4gYmVzdFNjb3JlKSB7XG5cdFx0XHRcdFx0YmVzdFNjb3JlID0gc2NvcmU7XG5cdFx0XHRcdFx0YmVzdEZpdCA9IGZpdDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl9pc1B1c2hlZCA9IGZhbHNlO1xuXHRcdFx0dGhpcy5fYXBwbHlQb3NpdGlvbihiZXN0Rml0LnBvc2l0aW9uLCBiZXN0Rml0Lm9yaWdpbik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gV2hlbiBub25lIG9mIHRoZSBwcmVmZXJyZWQgcG9zaXRpb25zIGZpdCB3aXRoaW4gdGhlIHZpZXdwb3J0LCB0YWtlIHRoZSBwb3NpdGlvblxuXHRcdC8vIHRoYXQgd2VudCBvZmYtc2NyZWVuIHRoZSBsZWFzdCBhbmQgYXR0ZW1wdCB0byBwdXNoIGl0IG9uLXNjcmVlbi5cblx0XHRpZiAodGhpcy5fY2FuUHVzaCkge1xuXHRcdFx0dGhpcy5faXNQdXNoZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5fYXBwbHlQb3NpdGlvbihmYWxsYmFjayEucG9zaXRpb24sIGZhbGxiYWNrIS5vcmlnaW5Qb2ludCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gQWxsIG9wdGlvbnMgZm9yIGdldHRpbmcgdGhlIG92ZXJsYXkgd2l0aGluIHRoZSB2aWV3cG9ydCBoYXZlIGJlZW4gZXhoYXVzdGVkLCBzbyBnbyB3aXRoIHRoZVxuXHRcdC8vIHBvc2l0aW9uIHRoYXQgd2VudCBvZmYtc2NyZWVuIHRoZSBsZWFzdC5cblx0XHR0aGlzLl9hcHBseVBvc2l0aW9uKGZhbGxiYWNrIS5wb3NpdGlvbiwgZmFsbGJhY2shLm9yaWdpblBvaW50KTtcblx0fVxuXG5cdGRldGFjaCgpOiB2b2lkIHtcblx0XHR0aGlzLl9jbGVhclBhbmVsQ2xhc3NlcygpO1xuXHRcdHRoaXMuX2xhc3RQb3NpdGlvbiA9IG51bGw7XG5cdFx0dGhpcy5fcHJldmlvdXNQdXNoQW1vdW50ID0gbnVsbDtcblx0XHR0aGlzLl9yZXNpemVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcblx0fVxuXG5cdC8qKiBDbGVhbnVwIGFmdGVyIHRoZSBlbGVtZW50IGdldHMgZGVzdHJveWVkLiAqL1xuXHRkaXNwb3NlKCk6IHZvaWQge1xuXHRcdGlmICh0aGlzLl9pc0Rpc3Bvc2VkKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gV2UgY2FuJ3QgdXNlIGBfcmVzZXRCb3VuZGluZ0JveFN0eWxlc2AgaGVyZSwgYmVjYXVzZSBpdCByZXNldHNcblx0XHQvLyBzb21lIHByb3BlcnRpZXMgdG8gemVybywgcmF0aGVyIHRoYW4gcmVtb3ZpbmcgdGhlbS5cblx0XHRpZiAodGhpcy5fYm91bmRpbmdCb3gpIHtcblx0XHRcdGV4dGVuZFN0eWxlcyh0aGlzLl9ib3VuZGluZ0JveC5zdHlsZSwge1xuXHRcdFx0XHR0b3A6ICcnLFxuXHRcdFx0XHRsZWZ0OiAnJyxcblx0XHRcdFx0cmlnaHQ6ICcnLFxuXHRcdFx0XHRib3R0b206ICcnLFxuXHRcdFx0XHRoZWlnaHQ6ICcnLFxuXHRcdFx0XHR3aWR0aDogJycsXG5cdFx0XHRcdGFsaWduSXRlbXM6ICcnLFxuXHRcdFx0XHRqdXN0aWZ5Q29udGVudDogJycsXG5cdFx0XHR9IGFzIENTU1N0eWxlRGVjbGFyYXRpb24pO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9wYW5lKSB7XG5cdFx0XHR0aGlzLl9yZXNldE92ZXJsYXlFbGVtZW50U3R5bGVzKCk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX292ZXJsYXlSZWYpIHtcblx0XHRcdHRoaXMuX292ZXJsYXlSZWYuaG9zdEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShib3VuZGluZ0JveENsYXNzKTtcblx0XHR9XG5cblx0XHR0aGlzLmRldGFjaCgpO1xuXHRcdHRoaXMuX3Bvc2l0aW9uQ2hhbmdlcy5jb21wbGV0ZSgpO1xuXHRcdHRoaXMuX292ZXJsYXlSZWYgPSB0aGlzLl9ib3VuZGluZ0JveCA9IG51bGwgYXMgYW55O1xuXHRcdHRoaXMuX2lzRGlzcG9zZWQgPSB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgcmUtYWxpZ25zIHRoZSBvdmVybGF5IGVsZW1lbnQgd2l0aCB0aGUgdHJpZ2dlciBpbiBpdHMgbGFzdCBjYWxjdWxhdGVkIHBvc2l0aW9uLFxuXHQgKiBldmVuIGlmIGEgcG9zaXRpb24gaGlnaGVyIGluIHRoZSBcInByZWZlcnJlZCBwb3NpdGlvbnNcIiBsaXN0IHdvdWxkIG5vdyBmaXQuIFRoaXNcblx0ICogYWxsb3dzIG9uZSB0byByZS1hbGlnbiB0aGUgcGFuZWwgd2l0aG91dCBjaGFuZ2luZyB0aGUgb3JpZW50YXRpb24gb2YgdGhlIHBhbmVsLlxuXHQgKi9cblx0cmVhcHBseUxhc3RQb3NpdGlvbigpOiB2b2lkIHtcblx0XHRpZiAoIXRoaXMuX2lzRGlzcG9zZWQgJiYgKCF0aGlzLl9wbGF0Zm9ybSB8fCB0aGlzLl9wbGF0Zm9ybS5pc0Jyb3dzZXIpKSB7XG5cdFx0XHR0aGlzLl9vcmlnaW5SZWN0ID0gdGhpcy5fZ2V0T3JpZ2luUmVjdCgpO1xuXHRcdFx0dGhpcy5fb3ZlcmxheVJlY3QgPSB0aGlzLl9wYW5lLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0dGhpcy5fdmlld3BvcnRSZWN0ID0gdGhpcy5fZ2V0TmFycm93ZWRSZWN0KHRoaXMuX3Jvb3RDb250YWluZXIpO1xuXG5cdFx0XHRjb25zdCBsYXN0UG9zaXRpb24gPSB0aGlzLl9sYXN0UG9zaXRpb24gfHwgdGhpcy5fcHJlZmVycmVkUG9zaXRpb25zWzBdO1xuXHRcdFx0Y29uc3Qgb3JpZ2luUG9pbnQgPSB0aGlzLl9nZXRPcmlnaW5Qb2ludCh0aGlzLl9vcmlnaW5SZWN0LCBsYXN0UG9zaXRpb24pO1xuXG5cdFx0XHR0aGlzLl9hcHBseVBvc2l0aW9uKGxhc3RQb3NpdGlvbiwgb3JpZ2luUG9pbnQpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBsaXN0IG9mIFNjcm9sbGFibGUgY29udGFpbmVycyB0aGF0IGhvc3QgdGhlIG9yaWdpbiBlbGVtZW50IHNvIHRoYXRcblx0ICogb24gcmVwb3NpdGlvbiB3ZSBjYW4gZXZhbHVhdGUgaWYgaXQgb3IgdGhlIG92ZXJsYXkgaGFzIGJlZW4gY2xpcHBlZCBvciBvdXRzaWRlIHZpZXcuIEV2ZXJ5XG5cdCAqIFNjcm9sbGFibGUgbXVzdCBiZSBhbiBhbmNlc3RvciBlbGVtZW50IG9mIHRoZSBzdHJhdGVneSdzIG9yaWdpbiBlbGVtZW50LlxuXHQgKi9cblx0d2l0aFNjcm9sbGFibGVDb250YWluZXJzKHNjcm9sbGFibGVzOiBDZGtTY3JvbGxhYmxlW10pOiB0aGlzIHtcblx0XHR0aGlzLl9zY3JvbGxhYmxlcyA9IHNjcm9sbGFibGVzO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0d2l0aENvbnRhaW5lcihjb250YWluZXI6IEdob3N0UmlkZXJQb3BvdmVyQ29udGFpbmVyKTogdGhpcyB7XG5cdFx0dGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyIHx8IHRoaXMuX3Jvb3RDb250YWluZXI7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBuZXcgcHJlZmVycmVkIHBvc2l0aW9ucy5cblx0ICogQHBhcmFtIHBvc2l0aW9ucyBMaXN0IG9mIHBvc2l0aW9ucyBvcHRpb25zIGZvciB0aGlzIG92ZXJsYXkuXG5cdCAqL1xuXHR3aXRoUG9zaXRpb25zKHBvc2l0aW9uczogQ29ubmVjdGVkUG9zaXRpb25bXSk6IHRoaXMge1xuXHRcdHRoaXMuX3ByZWZlcnJlZFBvc2l0aW9ucyA9IHBvc2l0aW9ucztcblxuXHRcdC8vIElmIHRoZSBsYXN0IGNhbGN1bGF0ZWQgcG9zaXRpb24gb2JqZWN0IGlzbid0IHBhcnQgb2YgdGhlIHBvc2l0aW9ucyBhbnltb3JlLCBjbGVhclxuXHRcdC8vIGl0IGluIG9yZGVyIHRvIGF2b2lkIGl0IGJlaW5nIHBpY2tlZCB1cCBpZiB0aGUgY29uc3VtZXIgdHJpZXMgdG8gcmUtYXBwbHkuXG5cdFx0aWYgKHBvc2l0aW9ucy5pbmRleE9mKHRoaXMuX2xhc3RQb3NpdGlvbiBhcyBDb25uZWN0ZWRQb3NpdGlvbikgPT09IC0xKSB7XG5cdFx0XHR0aGlzLl9sYXN0UG9zaXRpb24gPSBudWxsO1xuXHRcdH1cblxuXHRcdHRoaXMuX3ZhbGlkYXRlUG9zaXRpb25zKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBvcmlnaW4sIHJlbGF0aXZlIHRvIHdoaWNoIHRvIHBvc2l0aW9uIHRoZSBvdmVybGF5LlxuXHQgKiBVc2luZyBhbiBlbGVtZW50IG9yaWdpbiBpcyB1c2VmdWwgZm9yIGJ1aWxkaW5nIGNvbXBvbmVudHMgdGhhdCBuZWVkIHRvIGJlIHBvc2l0aW9uZWRcblx0ICogcmVsYXRpdmVseSB0byBhIHRyaWdnZXIgKGUuZy4gZHJvcGRvd24gbWVudXMgb3IgdG9vbHRpcHMpLCB3aGVyZWFzIHVzaW5nIGEgcG9pbnQgY2FuIGJlXG5cdCAqIHVzZWQgZm9yIGNhc2VzIGxpa2UgY29udGV4dHVhbCBtZW51cyB3aGljaCBvcGVuIHJlbGF0aXZlIHRvIHRoZSB1c2VyJ3MgcG9pbnRlci5cblx0ICogQHBhcmFtIG9yaWdpbiBSZWZlcmVuY2UgdG8gdGhlIG5ldyBvcmlnaW4uXG5cdCAqL1xuXHRzZXRPcmlnaW4ob3JpZ2luOiBQb3BvdmVyUG9zaXRpb25TdHJhdGVneU9yaWdpbik6IHRoaXMge1xuXHRcdHRoaXMuX29yaWdpbiA9IG9yaWdpbjtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSAoeCwgeSkgY29vcmRpbmF0ZSBvZiBhIGNvbm5lY3Rpb24gcG9pbnQgb24gdGhlIG9yaWdpbiBiYXNlZCBvbiBhIHJlbGF0aXZlIHBvc2l0aW9uLlxuXHQgKi9cblx0cHJpdmF0ZSBfZ2V0T3JpZ2luUG9pbnQob3JpZ2luUmVjdDogQ2xpZW50UmVjdCwgcG9zOiBDb25uZWN0ZWRQb3NpdGlvbik6IFBvaW50IHtcblx0XHRsZXQgeDogbnVtYmVyO1xuXHRcdGlmIChwb3Mub3JpZ2luWCA9PT0gJ2NlbnRlcicpIHtcblx0XHRcdC8vIE5vdGU6IHdoZW4gY2VudGVyaW5nIHdlIHNob3VsZCBhbHdheXMgdXNlIHRoZSBgbGVmdGBcblx0XHRcdC8vIG9mZnNldCwgb3RoZXJ3aXNlIHRoZSBwb3NpdGlvbiB3aWxsIGJlIHdyb25nIGluIFJUTC5cblx0XHRcdHggPSBvcmlnaW5SZWN0LmxlZnQgKyAob3JpZ2luUmVjdC53aWR0aCAvIDIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBzdGFydFggPSB0aGlzLl9pc1J0bCgpID8gb3JpZ2luUmVjdC5yaWdodCA6IG9yaWdpblJlY3QubGVmdDtcblx0XHRcdGNvbnN0IGVuZFggPSB0aGlzLl9pc1J0bCgpID8gb3JpZ2luUmVjdC5sZWZ0IDogb3JpZ2luUmVjdC5yaWdodDtcblx0XHRcdHggPSBwb3Mub3JpZ2luWCA9PT0gJ3N0YXJ0JyA/IHN0YXJ0WCA6IGVuZFg7XG5cdFx0fVxuXG5cdFx0bGV0IHk6IG51bWJlcjtcblx0XHRpZiAocG9zLm9yaWdpblkgPT09ICdjZW50ZXInKSB7XG5cdFx0XHR5ID0gb3JpZ2luUmVjdC50b3AgKyAob3JpZ2luUmVjdC5oZWlnaHQgLyAyKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0eSA9IHBvcy5vcmlnaW5ZID09PSAndG9wJyA/IG9yaWdpblJlY3QudG9wIDogb3JpZ2luUmVjdC5ib3R0b207XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHsgeCwgeSB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlICh4LCB5KSBjb29yZGluYXRlIG9mIHRoZSB0b3AtbGVmdCBjb3JuZXIgb2YgdGhlIG92ZXJsYXkgZ2l2ZW4gYSBnaXZlbiBwb3NpdGlvbiBhbmRcblx0ICogb3JpZ2luIHBvaW50IHRvIHdoaWNoIHRoZSBvdmVybGF5IHNob3VsZCBiZSBjb25uZWN0ZWQuXG5cdCAqL1xuXHRwcml2YXRlIF9nZXRPdmVybGF5UG9pbnQoXG5cdFx0b3JpZ2luUG9pbnQ6IFBvaW50LFxuXHRcdG92ZXJsYXlSZWN0OiBDbGllbnRSZWN0LFxuXHRcdHBvczogQ29ubmVjdGVkUG9zaXRpb24pOiBQb2ludCB7XG5cblx0XHQvLyBDYWxjdWxhdGUgdGhlIChvdmVybGF5U3RhcnRYLCBvdmVybGF5U3RhcnRZKSwgdGhlIHN0YXJ0IG9mIHRoZVxuXHRcdC8vIHBvdGVudGlhbCBvdmVybGF5IHBvc2l0aW9uIHJlbGF0aXZlIHRvIHRoZSBvcmlnaW4gcG9pbnQuXG5cdFx0bGV0IG92ZXJsYXlTdGFydFg6IG51bWJlcjtcblx0XHRpZiAocG9zLm92ZXJsYXlYID09PSAnY2VudGVyJykge1xuXHRcdFx0b3ZlcmxheVN0YXJ0WCA9IC1vdmVybGF5UmVjdC53aWR0aCAvIDI7XG5cdFx0fSBlbHNlIGlmIChwb3Mub3ZlcmxheVggPT09ICdzdGFydCcpIHtcblx0XHRcdG92ZXJsYXlTdGFydFggPSB0aGlzLl9pc1J0bCgpID8gLW92ZXJsYXlSZWN0LndpZHRoIDogMDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b3ZlcmxheVN0YXJ0WCA9IHRoaXMuX2lzUnRsKCkgPyAwIDogLW92ZXJsYXlSZWN0LndpZHRoO1xuXHRcdH1cblxuXHRcdGxldCBvdmVybGF5U3RhcnRZOiBudW1iZXI7XG5cdFx0aWYgKHBvcy5vdmVybGF5WSA9PT0gJ2NlbnRlcicpIHtcblx0XHRcdG92ZXJsYXlTdGFydFkgPSAtb3ZlcmxheVJlY3QuaGVpZ2h0IC8gMjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b3ZlcmxheVN0YXJ0WSA9IHBvcy5vdmVybGF5WSA9PT0gJ3RvcCcgPyAwIDogLW92ZXJsYXlSZWN0LmhlaWdodDtcblx0XHR9XG5cblx0XHQvLyBUaGUgKHgsIHkpIGNvb3JkaW5hdGVzIG9mIHRoZSBvdmVybGF5LlxuXHRcdHJldHVybiB7XG5cdFx0XHR4OiBvcmlnaW5Qb2ludC54ICsgb3ZlcmxheVN0YXJ0WCxcblx0XHRcdHk6IG9yaWdpblBvaW50LnkgKyBvdmVybGF5U3RhcnRZLFxuXHRcdH07XG5cdH1cblxuXHQvKiogR2V0cyBob3cgd2VsbCBhbiBvdmVybGF5IGF0IHRoZSBnaXZlbiBwb2ludCB3aWxsIGZpdCB3aXRoaW4gdGhlIHZpZXdwb3J0LiAqL1xuXHRwcml2YXRlIF9nZXRPdmVybGF5Rml0KFxuXHRcdHBvaW50OiBQb2ludCxcblx0XHRvdmVybGF5OiBDbGllbnRSZWN0LFxuXHRcdHZpZXdwb3J0OiBDbGllbnRSZWN0LFxuXHRcdHBvc2l0aW9uOiBDb25uZWN0ZWRQb3NpdGlvbixcblx0KTogT3ZlcmxheUZpdCB7XG5cdFx0bGV0IHsgeCwgeSB9ID0gcG9pbnQ7XG5cdFx0Y29uc3Qgb2Zmc2V0WCA9IHRoaXMuX2dldE9mZnNldChwb3NpdGlvbiwgJ3gnKTtcblx0XHRjb25zdCBvZmZzZXRZID0gdGhpcy5fZ2V0T2Zmc2V0KHBvc2l0aW9uLCAneScpO1xuXG5cdFx0Ly8gQWNjb3VudCBmb3IgdGhlIG9mZnNldHMgc2luY2UgdGhleSBjb3VsZCBwdXNoIHRoZSBvdmVybGF5IG91dCBvZiB0aGUgdmlld3BvcnQuXG5cdFx0aWYgKG9mZnNldFgpIHtcblx0XHRcdHggKz0gb2Zmc2V0WDtcblx0XHR9XG5cblx0XHRpZiAob2Zmc2V0WSkge1xuXHRcdFx0eSArPSBvZmZzZXRZO1xuXHRcdH1cblxuXHRcdC8vIEhvdyBtdWNoIHRoZSBvdmVybGF5IHdvdWxkIG92ZXJmbG93IGF0IHRoaXMgcG9zaXRpb24sIG9uIGVhY2ggc2lkZS5cblx0XHRjb25zdCBsZWZ0T3ZlcmZsb3cgPSB2aWV3cG9ydC5sZWZ0IC0geDtcblx0XHRjb25zdCByaWdodE92ZXJmbG93ID0gKHggKyBvdmVybGF5LndpZHRoKSAtIHZpZXdwb3J0LnJpZ2h0O1xuXHRcdGNvbnN0IHRvcE92ZXJmbG93ID0gdmlld3BvcnQudG9wIC0geTtcblx0XHRjb25zdCBib3R0b21PdmVyZmxvdyA9ICh5ICsgb3ZlcmxheS5oZWlnaHQpIC0gdmlld3BvcnQuYm90dG9tO1xuXG5cdFx0Ly8gVmlzaWJsZSBwYXJ0cyBvZiB0aGUgZWxlbWVudCBvbiBlYWNoIGF4aXMuXG5cdFx0Y29uc3QgdmlzaWJsZVdpZHRoID0gdGhpcy5fc3VidHJhY3RPdmVyZmxvd3Mob3ZlcmxheS53aWR0aCwgbGVmdE92ZXJmbG93LCByaWdodE92ZXJmbG93KTtcblx0XHRjb25zdCB2aXNpYmxlSGVpZ2h0ID0gdGhpcy5fc3VidHJhY3RPdmVyZmxvd3Mob3ZlcmxheS5oZWlnaHQsIHRvcE92ZXJmbG93LCBib3R0b21PdmVyZmxvdyk7XG5cdFx0Y29uc3QgdmlzaWJsZUFyZWEgPSB2aXNpYmxlV2lkdGggKiB2aXNpYmxlSGVpZ2h0O1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHZpc2libGVBcmVhOiBNYXRoLmFicyh2aXNpYmxlQXJlYSksXG5cdFx0XHQvLyB2aXNpYmxlQXJlYSxcblx0XHRcdGlzQ29tcGxldGVseVdpdGhpblZpZXdwb3J0OiAob3ZlcmxheS53aWR0aCAqIG92ZXJsYXkuaGVpZ2h0KSA9PT0gdmlzaWJsZUFyZWEsXG5cdFx0XHRmaXRzSW5WaWV3cG9ydFZlcnRpY2FsbHk6IHZpc2libGVIZWlnaHQgPT09IG92ZXJsYXkuaGVpZ2h0LFxuXHRcdFx0Zml0c0luVmlld3BvcnRIb3Jpem9udGFsbHk6IHZpc2libGVXaWR0aCA9PT0gb3ZlcmxheS53aWR0aCxcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgdGhlIG92ZXJsYXkgY2FuIGZpdCB3aXRoaW4gdGhlIHZpZXdwb3J0IHdoZW4gaXQgbWF5IHJlc2l6ZSBlaXRoZXIgaXRzIHdpZHRoIG9yIGhlaWdodC5cblx0ICogQHBhcmFtIGZpdCBIb3cgd2VsbCB0aGUgb3ZlcmxheSBmaXRzIGluIHRoZSB2aWV3cG9ydCBhdCBzb21lIHBvc2l0aW9uLlxuXHQgKiBAcGFyYW0gcG9pbnQgVGhlICh4LCB5KSBjb29yZGluYXRlcyBvZiB0aGUgb3ZlcmxhdCBhdCBzb21lIHBvc2l0aW9uLlxuXHQgKiBAcGFyYW0gdmlld3BvcnQgVGhlIGdlb21ldHJ5IG9mIHRoZSB2aWV3cG9ydC5cblx0ICovXG5cdHByaXZhdGUgX2NhbkZpdFdpdGhGbGV4aWJsZURpbWVuc2lvbnMoZml0OiBPdmVybGF5Rml0LCBwb2ludDogUG9pbnQsIHZpZXdwb3J0OiBDbGllbnRSZWN0KSB7XG5cdFx0aWYgKHRoaXMuX2hhc0ZsZXhpYmxlRGltZW5zaW9ucykge1xuXHRcdFx0Y29uc3QgYXZhaWxhYmxlSGVpZ2h0ID0gdmlld3BvcnQuYm90dG9tIC0gcG9pbnQueTtcblx0XHRcdGNvbnN0IGF2YWlsYWJsZVdpZHRoID0gdmlld3BvcnQucmlnaHQgLSBwb2ludC54O1xuXHRcdFx0Y29uc3QgbWluSGVpZ2h0ID0gdGhpcy5fb3ZlcmxheVJlZi5nZXRDb25maWcoKS5taW5IZWlnaHQ7XG5cdFx0XHRjb25zdCBtaW5XaWR0aCA9IHRoaXMuX292ZXJsYXlSZWYuZ2V0Q29uZmlnKCkubWluV2lkdGg7XG5cblx0XHRcdGNvbnN0IHZlcnRpY2FsRml0ID0gZml0LmZpdHNJblZpZXdwb3J0VmVydGljYWxseSB8fFxuXHRcdFx0XHQobWluSGVpZ2h0ICE9IG51bGwgJiYgbWluSGVpZ2h0IDw9IGF2YWlsYWJsZUhlaWdodCk7XG5cdFx0XHRjb25zdCBob3Jpem9udGFsRml0ID0gZml0LmZpdHNJblZpZXdwb3J0SG9yaXpvbnRhbGx5IHx8XG5cdFx0XHRcdChtaW5XaWR0aCAhPSBudWxsICYmIG1pbldpZHRoIDw9IGF2YWlsYWJsZVdpZHRoKTtcblxuXHRcdFx0cmV0dXJuIHZlcnRpY2FsRml0ICYmIGhvcml6b250YWxGaXQ7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBwb2ludCBhdCB3aGljaCB0aGUgb3ZlcmxheSBjYW4gYmUgXCJwdXNoZWRcIiBvbi1zY3JlZW4uIElmIHRoZSBvdmVybGF5IGlzIGxhcmdlciB0aGFuXG5cdCAqIHRoZSB2aWV3cG9ydCwgdGhlIHRvcC1sZWZ0IGNvcm5lciB3aWxsIGJlIHB1c2hlZCBvbi1zY3JlZW4gKHdpdGggb3ZlcmZsb3cgb2NjdXJpbmcgb24gdGhlXG5cdCAqIHJpZ2h0IGFuZCBib3R0b20pLlxuXHQgKlxuXHQgKiBAcGFyYW0gc3RhcnQgU3RhcnRpbmcgcG9pbnQgZnJvbSB3aGljaCB0aGUgb3ZlcmxheSBpcyBwdXNoZWQuXG5cdCAqIEBwYXJhbSBvdmVybGF5IERpbWVuc2lvbnMgb2YgdGhlIG92ZXJsYXkuXG5cdCAqIEBwYXJhbSBzY3JvbGxQb3NpdGlvbiBDdXJyZW50IHZpZXdwb3J0IHNjcm9sbCBwb3NpdGlvbi5cblx0ICogQHJldHVybnMgVGhlIHBvaW50IGF0IHdoaWNoIHRvIHBvc2l0aW9uIHRoZSBvdmVybGF5IGFmdGVyIHB1c2hpbmcuIFRoaXMgaXMgZWZmZWN0aXZlbHkgYSBuZXdcblx0ICogICAgIG9yaWdpblBvaW50LlxuXHQgKi9cblx0cHJpdmF0ZSBfcHVzaE92ZXJsYXlPblNjcmVlbihcblx0XHRzdGFydDogUG9pbnQsXG5cdFx0b3ZlcmxheTogQ2xpZW50UmVjdCxcblx0XHRzY3JvbGxQb3NpdGlvbjogVmlld3BvcnRTY3JvbGxQb3NpdGlvbixcblx0XHRwb3NpdGlvbjogQ29ubmVjdGlvblBvc2l0aW9uUGFpcixcblx0KTogUG9pbnQge1xuXHRcdC8vIElmIHRoZSBwb3NpdGlvbiBpcyBsb2NrZWQgYW5kIHdlJ3ZlIHB1c2hlZCB0aGUgb3ZlcmxheSBhbHJlYWR5LCByZXVzZSB0aGUgcHJldmlvdXMgcHVzaFxuXHRcdC8vIGFtb3VudCwgcmF0aGVyIHRoYW4gcHVzaGluZyBpdCBhZ2Fpbi4gSWYgd2Ugd2VyZSB0byBjb250aW51ZSBwdXNoaW5nLCB0aGUgZWxlbWVudCB3b3VsZFxuXHRcdC8vIHJlbWFpbiBpbiB0aGUgdmlld3BvcnQsIHdoaWNoIGdvZXMgYWdhaW5zdCB0aGUgZXhwZWN0YXRpb25zIHdoZW4gcG9zaXRpb24gbG9ja2luZyBpcyBlbmFibGVkLlxuXHRcdGlmICh0aGlzLl9wcmV2aW91c1B1c2hBbW91bnQgJiYgdGhpcy5fcG9zaXRpb25Mb2NrZWQpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHg6IHN0YXJ0LnggKyB0aGlzLl9wcmV2aW91c1B1c2hBbW91bnQueCxcblx0XHRcdFx0eTogc3RhcnQueSArIHRoaXMuX3ByZXZpb3VzUHVzaEFtb3VudC55LFxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRjb25zdCBjb250YWluZXIgPSB0aGlzLl9jb250YWluZXJSZWN0O1xuXG5cdFx0Ly8gRGV0ZXJtaW5lIGhvdyBtdWNoIHRoZSBvdmVybGF5IGdvZXMgb3V0c2lkZSB0aGUgY29udGFpbmVyIG9uIGVhY2hcblx0XHQvLyBzaWRlLCB3aGljaCB3ZSdsbCB1c2UgdG8gZGVjaWRlIHdoaWNoIGRpcmVjdGlvbiB0byBwdXNoIGl0LlxuXHRcdGNvbnN0IG92ZXJmbG93UmlnaHQgPSBNYXRoLm1heChzdGFydC54ICsgb3ZlcmxheS53aWR0aCAtIGNvbnRhaW5lci5yaWdodCArIChwb3NpdGlvbi5vZmZzZXRYIHx8IDApLCAwKTtcblx0XHRjb25zdCBvdmVyZmxvd0JvdHRvbSA9IE1hdGgubWF4KHN0YXJ0LnkgKyBvdmVybGF5LmhlaWdodCAtIGNvbnRhaW5lci5ib3R0b20gKyAocG9zaXRpb24ub2Zmc2V0WSB8fCAwKSwgMCk7XG5cdFx0Y29uc3Qgb3ZlcmZsb3dUb3AgPSBNYXRoLm1heChjb250YWluZXIudG9wIC0gc2Nyb2xsUG9zaXRpb24udG9wIC0gc3RhcnQueSAtIChwb3NpdGlvbi5vZmZzZXRZIHx8IDApLCAwKTtcblx0XHRjb25zdCBvdmVyZmxvd0xlZnQgPSBNYXRoLm1heChjb250YWluZXIubGVmdCAtIHNjcm9sbFBvc2l0aW9uLmxlZnQgLSBzdGFydC54IC0gKHBvc2l0aW9uLm9mZnNldFggfHwgMCksIDApO1xuXG5cdFx0Ly8gQW1vdW50IGJ5IHdoaWNoIHRvIHB1c2ggdGhlIG92ZXJsYXkgaW4gZWFjaCBheGlzIHN1Y2ggdGhhdCBpdCByZW1haW5zIG9uLXNjcmVlbi5cblx0XHRsZXQgcHVzaFggPSAwO1xuXHRcdGxldCBwdXNoWSA9IDA7XG5cblx0XHQvLyBJZiB0aGUgb3ZlcmxheSBmaXRzIGNvbXBsZXRlbHkgd2l0aGluIHRoZSBib3VuZHMgb2YgdGhlIGNvbnRhaW5lciwgcHVzaCBpdCBmcm9tIHdoaWNoZXZlclxuXHRcdC8vIGRpcmVjdGlvbiBpcyBnb2VzIG9mZi1zY3JlZW4uIE90aGVyd2lzZSwgcHVzaCB0aGUgdG9wLWxlZnQgY29ybmVyIHN1Y2ggdGhhdCBpdHMgaW4gdGhlXG5cdFx0Ly8gY29udGFpbmVyIGFuZCBhbGxvdyBmb3IgdGhlIHRyYWlsaW5nIGVuZCBvZiB0aGUgb3ZlcmxheSB0byBnbyBvdXQgb2YgYm91bmRzLlxuXHRcdGlmIChvdmVybGF5LndpZHRoIDw9IGNvbnRhaW5lci53aWR0aCkge1xuXHRcdFx0cHVzaFggPSBvdmVyZmxvd0xlZnQgfHwgLW92ZXJmbG93UmlnaHQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHB1c2hYID0gc3RhcnQueCA8IHRoaXMuX3ZpZXdwb3J0TWFyZ2luID8gKGNvbnRhaW5lci5sZWZ0IC0gc2Nyb2xsUG9zaXRpb24ubGVmdCkgLSBzdGFydC54IDogMDtcblx0XHR9XG5cblx0XHRpZiAob3ZlcmxheS5oZWlnaHQgPD0gY29udGFpbmVyLmhlaWdodCkge1xuXHRcdFx0cHVzaFkgPSBvdmVyZmxvd1RvcCB8fCAtb3ZlcmZsb3dCb3R0b207XG5cdFx0fSBlbHNlIHtcblx0XHRcdHB1c2hZID0gc3RhcnQueSA8IHRoaXMuX3ZpZXdwb3J0TWFyZ2luID8gKGNvbnRhaW5lci50b3AgLSBzY3JvbGxQb3NpdGlvbi50b3ApIC0gc3RhcnQueSA6IDA7XG5cdFx0fVxuXG5cdFx0dGhpcy5fcHJldmlvdXNQdXNoQW1vdW50ID0geyB4OiBwdXNoWCwgeTogcHVzaFkgfTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHR4OiBzdGFydC54ICsgcHVzaFgsXG5cdFx0XHR5OiBzdGFydC55ICsgcHVzaFksXG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHBsaWVzIGEgY29tcHV0ZWQgcG9zaXRpb24gdG8gdGhlIG92ZXJsYXkgYW5kIGVtaXRzIGEgcG9zaXRpb24gY2hhbmdlLlxuXHQgKiBAcGFyYW0gcG9zaXRpb24gVGhlIHBvc2l0aW9uIHByZWZlcmVuY2Vcblx0ICogQHBhcmFtIG9yaWdpblBvaW50IFRoZSBwb2ludCBvbiB0aGUgb3JpZ2luIGVsZW1lbnQgd2hlcmUgdGhlIG92ZXJsYXkgaXMgY29ubmVjdGVkLlxuXHQgKi9cblx0cHJpdmF0ZSBfYXBwbHlQb3NpdGlvbihwb3NpdGlvbjogQ29ubmVjdGVkUG9zaXRpb24sIG9yaWdpblBvaW50OiBQb2ludCkge1xuXHRcdHRoaXMuX3NldFRyYW5zZm9ybU9yaWdpbihwb3NpdGlvbik7XG5cdFx0dGhpcy5fc2V0T3ZlcmxheUVsZW1lbnRTdHlsZXMob3JpZ2luUG9pbnQsIHBvc2l0aW9uKTtcblx0XHR0aGlzLl9zZXRCb3VuZGluZ0JveFN0eWxlcyhvcmlnaW5Qb2ludCwgcG9zaXRpb24pO1xuXG5cdFx0aWYgKHBvc2l0aW9uLnBhbmVsQ2xhc3MpIHtcblx0XHRcdHRoaXMuX2FkZFBhbmVsQ2xhc3Nlcyhwb3NpdGlvbi5wYW5lbENsYXNzKTtcblx0XHR9XG5cblx0XHQvLyBTYXZlIHRoZSBsYXN0IGNvbm5lY3RlZCBwb3NpdGlvbiBpbiBjYXNlIHRoZSBwb3NpdGlvbiBuZWVkcyB0byBiZSByZS1jYWxjdWxhdGVkLlxuXHRcdHRoaXMuX2xhc3RQb3NpdGlvbiA9IHBvc2l0aW9uO1xuXG5cdFx0Ly8gTm90aWZ5IHRoYXQgdGhlIHBvc2l0aW9uIGhhcyBiZWVuIGNoYW5nZWQgYWxvbmcgd2l0aCBpdHMgY2hhbmdlIHByb3BlcnRpZXMuXG5cdFx0Ly8gV2Ugb25seSBlbWl0IGlmIHdlJ3ZlIGdvdCBhbnkgc3Vic2NyaXB0aW9ucywgYmVjYXVzZSB0aGUgc2Nyb2xsIHZpc2liaWxpdHlcblx0XHQvLyBjYWxjdWxjYXRpb25zIGNhbiBiZSBzb21ld2hhdCBleHBlbnNpdmUuXG5cdFx0aWYgKHRoaXMuX3Bvc2l0aW9uQ2hhbmdlcy5vYnNlcnZlcnMubGVuZ3RoKSB7XG5cdFx0XHRjb25zdCBzY3JvbGxhYmxlVmlld1Byb3BlcnRpZXMgPSB0aGlzLl9nZXRTY3JvbGxWaXNpYmlsaXR5KCk7XG5cdFx0XHRjb25zdCBjaGFuZ2VFdmVudCA9IG5ldyBDb25uZWN0ZWRPdmVybGF5UG9zaXRpb25DaGFuZ2UocG9zaXRpb24sIHNjcm9sbGFibGVWaWV3UHJvcGVydGllcyk7XG5cdFx0XHR0aGlzLl9wb3NpdGlvbkNoYW5nZXMubmV4dChjaGFuZ2VFdmVudCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5faXNJbml0aWFsUmVuZGVyID0gZmFsc2U7XG5cdH1cblxuXHQvKiogU2V0cyB0aGUgdHJhbnNmb3JtIG9yaWdpbiBiYXNlZCBvbiB0aGUgY29uZmlndXJlZCBzZWxlY3RvciBhbmQgdGhlIHBhc3NlZC1pbiBwb3NpdGlvbi4gICovXG5cdHByaXZhdGUgX3NldFRyYW5zZm9ybU9yaWdpbihwb3NpdGlvbjogQ29ubmVjdGVkUG9zaXRpb24pIHtcblx0XHRpZiAoIXRoaXMuX3RyYW5zZm9ybU9yaWdpblNlbGVjdG9yKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3QgZWxlbWVudHM6IE5vZGVMaXN0T2Y8SFRNTEVsZW1lbnQ+ID0gdGhpcy5fYm91bmRpbmdCb3ghLnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5fdHJhbnNmb3JtT3JpZ2luU2VsZWN0b3IpO1xuXHRcdGxldCB4T3JpZ2luOiAnbGVmdCcgfCAncmlnaHQnIHwgJ2NlbnRlcic7XG5cdFx0Y29uc3QgeU9yaWdpbjogJ3RvcCcgfCAnYm90dG9tJyB8ICdjZW50ZXInID0gcG9zaXRpb24ub3ZlcmxheVk7XG5cblx0XHRpZiAocG9zaXRpb24ub3ZlcmxheVggPT09ICdjZW50ZXInKSB7XG5cdFx0XHR4T3JpZ2luID0gJ2NlbnRlcic7XG5cdFx0fSBlbHNlIGlmICh0aGlzLl9pc1J0bCgpKSB7XG5cdFx0XHR4T3JpZ2luID0gcG9zaXRpb24ub3ZlcmxheVggPT09ICdzdGFydCcgPyAncmlnaHQnIDogJ2xlZnQnO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR4T3JpZ2luID0gcG9zaXRpb24ub3ZlcmxheVggPT09ICdzdGFydCcgPyAnbGVmdCcgOiAncmlnaHQnO1xuXHRcdH1cblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGVsZW1lbnRzW2ldLnN0eWxlLnRyYW5zZm9ybU9yaWdpbiA9IGAke3hPcmlnaW59ICR7eU9yaWdpbn1gO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBwb3NpdGlvbiBhbmQgc2l6ZSBvZiB0aGUgb3ZlcmxheSdzIHNpemluZyBjb250YWluZXIuXG5cdCAqXG5cdCAqIFRoaXMgbWV0aG9kIGRvZXMgbm8gbWVhc3VyaW5nIGFuZCBhcHBsaWVzIG5vIHN0eWxlcyBzbyB0aGF0IHdlIGNhbiBjaGVhcGx5IGNvbXB1dGUgdGhlXG5cdCAqIGJvdW5kcyBmb3IgYWxsIHBvc2l0aW9ucyBhbmQgY2hvb3NlIHRoZSBiZXN0IGZpdCBiYXNlZCBvbiB0aGVzZSByZXN1bHRzLlxuXHQgKi9cblx0cHJpdmF0ZSBfY2FsY3VsYXRlQm91bmRpbmdCb3hSZWN0KG9yaWdpbjogUG9pbnQsIHBvc2l0aW9uOiBDb25uZWN0ZWRQb3NpdGlvbik6IEJvdW5kaW5nQm94UmVjdCB7XG5cdFx0Y29uc3QgY29udGFpbmVyID0gdGhpcy5fY29udGFpbmVyUmVjdDtcblx0XHRjb25zdCBpc1J0bCA9IHRoaXMuX2lzUnRsKCk7XG5cdFx0bGV0IGhlaWdodDogbnVtYmVyO1xuXHRcdGxldCB0b3A6IG51bWJlcjtcblx0XHRsZXQgYm90dG9tOiBudW1iZXI7XG5cblx0XHRpZiAocG9zaXRpb24ub3ZlcmxheVkgPT09ICd0b3AnKSB7XG5cdFx0XHQvLyBPdmVybGF5IGlzIG9wZW5pbmcgXCJkb3dud2FyZFwiIGFuZCB0aHVzIGlzIGJvdW5kIGJ5IHRoZSBib3R0b20gdmlld3BvcnQgZWRnZS5cblx0XHRcdHRvcCA9IG9yaWdpbi55O1xuXHRcdFx0aGVpZ2h0ID0gY29udGFpbmVyLmhlaWdodCAtIHRvcCArIHRoaXMuX3ZpZXdwb3J0TWFyZ2luO1xuXHRcdH0gZWxzZSBpZiAocG9zaXRpb24ub3ZlcmxheVkgPT09ICdib3R0b20nKSB7XG5cdFx0XHQvLyBPdmVybGF5IGlzIG9wZW5pbmcgXCJ1cHdhcmRcIiBhbmQgdGh1cyBpcyBib3VuZCBieSB0aGUgdG9wIGNvbnRhaW5lciBlZGdlLiBXZSBuZWVkIHRvIGFkZFxuXHRcdFx0Ly8gdGhlIGNvbnRhaW5lciBtYXJnaW4gYmFjayBpbiwgYmVjYXVzZSB0aGUgY29udGFpbmVyIHJlY3QgaXMgbmFycm93ZWQgZG93biB0byByZW1vdmUgdGhlXG5cdFx0XHQvLyBtYXJnaW4sIHdoZXJlYXMgdGhlIGBvcmlnaW5gIHBvc2l0aW9uIGlzIGNhbGN1bGF0ZWQgYmFzZWQgb24gaXRzIGBDbGllbnRSZWN0YC5cblx0XHRcdGJvdHRvbSA9IGNvbnRhaW5lci5oZWlnaHQgLSBvcmlnaW4ueSArIHRoaXMuX3ZpZXdwb3J0TWFyZ2luICogMjtcblx0XHRcdGhlaWdodCA9IGNvbnRhaW5lci5oZWlnaHQgLSBib3R0b20gKyB0aGlzLl92aWV3cG9ydE1hcmdpbjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gSWYgbmVpdGhlciB0b3Agbm9yIGJvdHRvbSwgaXQgbWVhbnMgdGhhdCB0aGUgb3ZlcmxheSBpcyB2ZXJ0aWNhbGx5IGNlbnRlcmVkIG9uIHRoZVxuXHRcdFx0Ly8gb3JpZ2luIHBvaW50LiBOb3RlIHRoYXQgd2Ugd2FudCB0aGUgcG9zaXRpb24gcmVsYXRpdmUgdG8gdGhlIHZpZXdwb3J0LCByYXRoZXIgdGhhblxuXHRcdFx0Ly8gdGhlIHBhZ2UsIHdoaWNoIGlzIHdoeSB3ZSBkb24ndCB1c2Ugc29tZXRoaW5nIGxpa2UgYHZpZXdwb3J0LmJvdHRvbSAtIG9yaWdpbi55YCBhbmRcblx0XHRcdC8vIGBvcmlnaW4ueSAtIGNvbnRhaW5lci50b3BgLlxuXHRcdFx0Y29uc3Qgc21hbGxlc3REaXN0YW5jZVRvY29udGFpbmVyRWRnZSA9XG5cdFx0XHRcdE1hdGgubWluKGNvbnRhaW5lci5ib3R0b20gLSBvcmlnaW4ueSArIGNvbnRhaW5lci50b3AsIG9yaWdpbi55KTtcblxuXHRcdFx0Y29uc3QgcHJldmlvdXNIZWlnaHQgPSB0aGlzLl9sYXN0Qm91bmRpbmdCb3hTaXplLmhlaWdodDtcblxuXHRcdFx0aGVpZ2h0ID0gc21hbGxlc3REaXN0YW5jZVRvY29udGFpbmVyRWRnZSAqIDI7XG5cdFx0XHR0b3AgPSBvcmlnaW4ueSAtIHNtYWxsZXN0RGlzdGFuY2VUb2NvbnRhaW5lckVkZ2U7XG5cblx0XHRcdGlmIChoZWlnaHQgPiBwcmV2aW91c0hlaWdodCAmJiAhdGhpcy5faXNJbml0aWFsUmVuZGVyICYmICF0aGlzLl9ncm93QWZ0ZXJPcGVuKSB7XG5cdFx0XHRcdHRvcCA9IG9yaWdpbi55IC0gKHByZXZpb3VzSGVpZ2h0IC8gMik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gVGhlIG92ZXJsYXkgaXMgb3BlbmluZyAncmlnaHQtd2FyZCcgKHRoZSBjb250ZW50IGZsb3dzIHRvIHRoZSByaWdodCkuXG5cdFx0Y29uc3QgaXNCb3VuZGVkQnlSaWdodENvbnRhaW5lckVkZ2UgPVxuXHRcdFx0KHBvc2l0aW9uLm92ZXJsYXlYID09PSAnc3RhcnQnICYmICFpc1J0bCkgfHxcblx0XHRcdChwb3NpdGlvbi5vdmVybGF5WCA9PT0gJ2VuZCcgJiYgaXNSdGwpO1xuXG5cdFx0Ly8gVGhlIG92ZXJsYXkgaXMgb3BlbmluZyAnbGVmdC13YXJkJyAodGhlIGNvbnRlbnQgZmxvd3MgdG8gdGhlIGxlZnQpLlxuXHRcdGNvbnN0IGlzQm91bmRlZEJ5TGVmdENvbnRhaW5lckVkZ2UgPVxuXHRcdFx0KHBvc2l0aW9uLm92ZXJsYXlYID09PSAnZW5kJyAmJiAhaXNSdGwpIHx8XG5cdFx0XHQocG9zaXRpb24ub3ZlcmxheVggPT09ICdzdGFydCcgJiYgaXNSdGwpO1xuXG5cdFx0bGV0IHdpZHRoOiBudW1iZXI7XG5cdFx0bGV0IGxlZnQ6IG51bWJlcjtcblx0XHRsZXQgcmlnaHQ6IG51bWJlcjtcblxuXHRcdGlmIChpc0JvdW5kZWRCeUxlZnRDb250YWluZXJFZGdlKSB7XG5cdFx0XHRyaWdodCA9IGNvbnRhaW5lci53aWR0aCAtIG9yaWdpbi54ICsgdGhpcy5fdmlld3BvcnRNYXJnaW47XG5cdFx0XHR3aWR0aCA9IG9yaWdpbi54IC0gdGhpcy5fdmlld3BvcnRNYXJnaW47XG5cdFx0fSBlbHNlIGlmIChpc0JvdW5kZWRCeVJpZ2h0Q29udGFpbmVyRWRnZSkge1xuXHRcdFx0bGVmdCA9IG9yaWdpbi54O1xuXHRcdFx0d2lkdGggPSBjb250YWluZXIucmlnaHQgLSBvcmlnaW4ueDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gSWYgbmVpdGhlciBzdGFydCBub3IgZW5kLCBpdCBtZWFucyB0aGF0IHRoZSBvdmVybGF5IGlzIGhvcml6b250YWxseSBjZW50ZXJlZCBvbiB0aGVcblx0XHRcdC8vIG9yaWdpbiBwb2ludC4gTm90ZSB0aGF0IHdlIHdhbnQgdGhlIHBvc2l0aW9uIHJlbGF0aXZlIHRvIHRoZSBjb250YWluZXIsIHJhdGhlciB0aGFuXG5cdFx0XHQvLyB0aGUgcGFnZSwgd2hpY2ggaXMgd2h5IHdlIGRvbid0IHVzZSBzb21ldGhpbmcgbGlrZSBgY29udGFpbmVyLnJpZ2h0IC0gb3JpZ2luLnhgIGFuZFxuXHRcdFx0Ly8gYG9yaWdpbi54IC0gY29udGFpbmVyLmxlZnRgLlxuXHRcdFx0Y29uc3Qgc21hbGxlc3REaXN0YW5jZVRvQ29udGFpbmVyRWRnZSA9XG5cdFx0XHRcdE1hdGgubWluKGNvbnRhaW5lci5yaWdodCAtIG9yaWdpbi54ICsgY29udGFpbmVyLmxlZnQsIG9yaWdpbi54KTtcblx0XHRcdGNvbnN0IHByZXZpb3VzV2lkdGggPSB0aGlzLl9sYXN0Qm91bmRpbmdCb3hTaXplLndpZHRoO1xuXG5cdFx0XHR3aWR0aCA9IHNtYWxsZXN0RGlzdGFuY2VUb0NvbnRhaW5lckVkZ2UgKiAyO1xuXHRcdFx0bGVmdCA9IG9yaWdpbi54IC0gc21hbGxlc3REaXN0YW5jZVRvQ29udGFpbmVyRWRnZTtcblxuXHRcdFx0aWYgKHdpZHRoID4gcHJldmlvdXNXaWR0aCAmJiAhdGhpcy5faXNJbml0aWFsUmVuZGVyICYmICF0aGlzLl9ncm93QWZ0ZXJPcGVuKSB7XG5cdFx0XHRcdGxlZnQgPSBvcmlnaW4ueCAtIChwcmV2aW91c1dpZHRoIC8gMik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiB7IHRvcCwgbGVmdCwgYm90dG9tLCByaWdodCwgd2lkdGgsIGhlaWdodCB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIHBvc2l0aW9uIGFuZCBzaXplIG9mIHRoZSBvdmVybGF5J3Mgc2l6aW5nIHdyYXBwZXIuIFRoZSB3cmFwcGVyIGlzIHBvc2l0aW9uZWQgb24gdGhlXG5cdCAqIG9yaWdpbidzIGNvbm5lY3Rpb24gcG9pbnQgYW5kIHN0ZXRjaGVzIHRvIHRoZSBib3VuZHMgb2YgdGhlIHZpZXdwb3J0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb3JpZ2luIFRoZSBwb2ludCBvbiB0aGUgb3JpZ2luIGVsZW1lbnQgd2hlcmUgdGhlIG92ZXJsYXkgaXMgY29ubmVjdGVkLlxuXHQgKiBAcGFyYW0gcG9zaXRpb24gVGhlIHBvc2l0aW9uIHByZWZlcmVuY2Vcblx0ICovXG5cdHByaXZhdGUgX3NldEJvdW5kaW5nQm94U3R5bGVzKG9yaWdpbjogUG9pbnQsIHBvc2l0aW9uOiBDb25uZWN0ZWRQb3NpdGlvbik6IHZvaWQge1xuXHRcdGNvbnN0IGJvdW5kaW5nQm94UmVjdCA9IHRoaXMuX2NhbGN1bGF0ZUJvdW5kaW5nQm94UmVjdChvcmlnaW4sIHBvc2l0aW9uKTtcblxuXHRcdC8vIEl0J3Mgd2VpcmQgaWYgdGhlIG92ZXJsYXkgKmdyb3dzKiB3aGlsZSBzY3JvbGxpbmcsIHNvIHdlIHRha2UgdGhlIGxhc3Qgc2l6ZSBpbnRvIGFjY291bnRcblx0XHQvLyB3aGVuIGFwcGx5aW5nIGEgbmV3IHNpemUuXG5cdFx0aWYgKCF0aGlzLl9pc0luaXRpYWxSZW5kZXIgJiYgIXRoaXMuX2dyb3dBZnRlck9wZW4pIHtcblx0XHRcdGJvdW5kaW5nQm94UmVjdC5oZWlnaHQgPSBNYXRoLm1pbihib3VuZGluZ0JveFJlY3QuaGVpZ2h0LCB0aGlzLl9sYXN0Qm91bmRpbmdCb3hTaXplLmhlaWdodCk7XG5cdFx0XHRib3VuZGluZ0JveFJlY3Qud2lkdGggPSBNYXRoLm1pbihib3VuZGluZ0JveFJlY3Qud2lkdGgsIHRoaXMuX2xhc3RCb3VuZGluZ0JveFNpemUud2lkdGgpO1xuXHRcdH1cblxuXHRcdGNvbnN0IHN0eWxlcyA9IHt9IGFzIENTU1N0eWxlRGVjbGFyYXRpb247XG5cblx0XHRpZiAodGhpcy5faGFzRXhhY3RQb3NpdGlvbigpKSB7XG5cdFx0XHRzdHlsZXMudG9wID0gc3R5bGVzLmxlZnQgPSAnMCc7XG5cdFx0XHRzdHlsZXMuYm90dG9tID0gc3R5bGVzLnJpZ2h0ID0gJyc7XG5cdFx0XHRzdHlsZXMud2lkdGggPSBzdHlsZXMuaGVpZ2h0ID0gJzEwMCUnO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBtYXhIZWlnaHQgPSB0aGlzLl9vdmVybGF5UmVmLmdldENvbmZpZygpLm1heEhlaWdodDtcblx0XHRcdGNvbnN0IG1heFdpZHRoID0gdGhpcy5fb3ZlcmxheVJlZi5nZXRDb25maWcoKS5tYXhXaWR0aDtcblxuXHRcdFx0c3R5bGVzLmhlaWdodCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUoYm91bmRpbmdCb3hSZWN0LmhlaWdodCk7XG5cdFx0XHRzdHlsZXMudG9wID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShib3VuZGluZ0JveFJlY3QudG9wKTtcblx0XHRcdHN0eWxlcy5ib3R0b20gPSBjb2VyY2VDc3NQaXhlbFZhbHVlKGJvdW5kaW5nQm94UmVjdC5ib3R0b20pO1xuXHRcdFx0c3R5bGVzLndpZHRoID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZShib3VuZGluZ0JveFJlY3Qud2lkdGgpO1xuXHRcdFx0c3R5bGVzLmxlZnQgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKGJvdW5kaW5nQm94UmVjdC5sZWZ0KTtcblx0XHRcdHN0eWxlcy5yaWdodCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUoYm91bmRpbmdCb3hSZWN0LnJpZ2h0KTtcblxuXHRcdFx0Ly8gUHVzaCB0aGUgcGFuZSBjb250ZW50IHRvd2FyZHMgdGhlIHByb3BlciBkaXJlY3Rpb24uXG5cdFx0XHRpZiAocG9zaXRpb24ub3ZlcmxheVggPT09ICdjZW50ZXInKSB7XG5cdFx0XHRcdHN0eWxlcy5hbGlnbkl0ZW1zID0gJ2NlbnRlcic7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzdHlsZXMuYWxpZ25JdGVtcyA9IHBvc2l0aW9uLm92ZXJsYXlYID09PSAnZW5kJyA/ICdmbGV4LWVuZCcgOiAnZmxleC1zdGFydCc7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChwb3NpdGlvbi5vdmVybGF5WSA9PT0gJ2NlbnRlcicpIHtcblx0XHRcdFx0c3R5bGVzLmp1c3RpZnlDb250ZW50ID0gJ2NlbnRlcic7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzdHlsZXMuanVzdGlmeUNvbnRlbnQgPSBwb3NpdGlvbi5vdmVybGF5WSA9PT0gJ2JvdHRvbScgPyAnZmxleC1lbmQnIDogJ2ZsZXgtc3RhcnQnO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAobWF4SGVpZ2h0KSB7XG5cdFx0XHRcdHN0eWxlcy5tYXhIZWlnaHQgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKG1heEhlaWdodCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChtYXhXaWR0aCkge1xuXHRcdFx0XHRzdHlsZXMubWF4V2lkdGggPSBjb2VyY2VDc3NQaXhlbFZhbHVlKG1heFdpZHRoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLl9sYXN0Qm91bmRpbmdCb3hTaXplID0gYm91bmRpbmdCb3hSZWN0O1xuXG5cdFx0ZXh0ZW5kU3R5bGVzKHRoaXMuX2JvdW5kaW5nQm94IS5zdHlsZSwgc3R5bGVzKTtcblx0fVxuXG5cdC8qKiBSZXNldHMgdGhlIHN0eWxlcyBmb3IgdGhlIGJvdW5kaW5nIGJveCBzbyB0aGF0IGEgbmV3IHBvc2l0aW9uaW5nIGNhbiBiZSBjb21wdXRlZC4gKi9cblx0cHJpdmF0ZSBfcmVzZXRCb3VuZGluZ0JveFN0eWxlcygpIHtcblx0XHRleHRlbmRTdHlsZXModGhpcy5fYm91bmRpbmdCb3ghLnN0eWxlLCB7XG5cdFx0XHR0b3A6ICcwJyxcblx0XHRcdGxlZnQ6ICcwJyxcblx0XHRcdHJpZ2h0OiAnMCcsXG5cdFx0XHRib3R0b206ICcwJyxcblx0XHRcdGhlaWdodDogJycsXG5cdFx0XHR3aWR0aDogJycsXG5cdFx0XHRhbGlnbkl0ZW1zOiAnJyxcblx0XHRcdGp1c3RpZnlDb250ZW50OiAnJyxcblx0XHR9IGFzIENTU1N0eWxlRGVjbGFyYXRpb24pO1xuXHR9XG5cblx0LyoqIFJlc2V0cyB0aGUgc3R5bGVzIGZvciB0aGUgb3ZlcmxheSBwYW5lIHNvIHRoYXQgYSBuZXcgcG9zaXRpb25pbmcgY2FuIGJlIGNvbXB1dGVkLiAqL1xuXHRwcml2YXRlIF9yZXNldE92ZXJsYXlFbGVtZW50U3R5bGVzKCkge1xuXHRcdGV4dGVuZFN0eWxlcyh0aGlzLl9wYW5lLnN0eWxlLCB7XG5cdFx0XHR0b3A6ICcnLFxuXHRcdFx0bGVmdDogJycsXG5cdFx0XHRib3R0b206ICcnLFxuXHRcdFx0cmlnaHQ6ICcnLFxuXHRcdFx0cG9zaXRpb246ICcnLFxuXHRcdFx0dHJhbnNmb3JtOiAnJyxcblx0XHR9IGFzIENTU1N0eWxlRGVjbGFyYXRpb24pO1xuXHR9XG5cblx0LyoqIFNldHMgcG9zaXRpb25pbmcgc3R5bGVzIHRvIHRoZSBvdmVybGF5IGVsZW1lbnQuICovXG5cdHByaXZhdGUgX3NldE92ZXJsYXlFbGVtZW50U3R5bGVzKG9yaWdpblBvaW50OiBQb2ludCwgcG9zaXRpb246IENvbm5lY3RlZFBvc2l0aW9uKTogdm9pZCB7XG5cdFx0Y29uc3Qgc3R5bGVzID0ge30gYXMgQ1NTU3R5bGVEZWNsYXJhdGlvbjtcblxuXHRcdGlmICh0aGlzLl9oYXNFeGFjdFBvc2l0aW9uKCkpIHtcblx0XHRcdGNvbnN0IHNjcm9sbFBvc2l0aW9uID0gdGhpcy5fdmlld3BvcnRSdWxlci5nZXRWaWV3cG9ydFNjcm9sbFBvc2l0aW9uKCk7XG5cdFx0XHRleHRlbmRTdHlsZXMoc3R5bGVzLCB0aGlzLl9nZXRFeGFjdE92ZXJsYXlZKHBvc2l0aW9uLCBvcmlnaW5Qb2ludCwgc2Nyb2xsUG9zaXRpb24pKTtcblx0XHRcdGV4dGVuZFN0eWxlcyhzdHlsZXMsIHRoaXMuX2dldEV4YWN0T3ZlcmxheVgocG9zaXRpb24sIG9yaWdpblBvaW50LCBzY3JvbGxQb3NpdGlvbikpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdHlsZXMucG9zaXRpb24gPSAnc3RhdGljJztcblx0XHR9XG5cblx0XHQvLyBVc2UgYSB0cmFuc2Zvcm0gdG8gYXBwbHkgdGhlIG9mZnNldHMuIFdlIGRvIHRoaXMgYmVjYXVzZSB0aGUgYGNlbnRlcmAgcG9zaXRpb25zIHJlbHkgb25cblx0XHQvLyBiZWluZyBpbiB0aGUgbm9ybWFsIGZsZXggZmxvdyBhbmQgc2V0dGluZyBhIGB0b3BgIC8gYGxlZnRgIGF0IGFsbCB3aWxsIGNvbXBsZXRlbHkgdGhyb3dcblx0XHQvLyBvZmYgdGhlIHBvc2l0aW9uLiBXZSBhbHNvIGNhbid0IHVzZSBtYXJnaW5zLCBiZWNhdXNlIHRoZXkgd29uJ3QgaGF2ZSBhbiBlZmZlY3QgaW4gc29tZVxuXHRcdC8vIGNhc2VzIHdoZXJlIHRoZSBlbGVtZW50IGRvZXNuJ3QgaGF2ZSBhbnl0aGluZyB0byBcInB1c2ggb2ZmIG9mXCIuIEZpbmFsbHksIHRoaXMgd29ya3Ncblx0XHQvLyBiZXR0ZXIgYm90aCB3aXRoIGZsZXhpYmxlIGFuZCBub24tZmxleGlibGUgcG9zaXRpb25pbmcuXG5cdFx0bGV0IHRyYW5zZm9ybVN0cmluZyA9ICcnO1xuXHRcdGNvbnN0IG9mZnNldFggPSB0aGlzLl9nZXRPZmZzZXQocG9zaXRpb24sICd4Jyk7XG5cdFx0Y29uc3Qgb2Zmc2V0WSA9IHRoaXMuX2dldE9mZnNldChwb3NpdGlvbiwgJ3knKTtcblxuXHRcdGlmIChvZmZzZXRYKSB7XG5cdFx0XHR0cmFuc2Zvcm1TdHJpbmcgKz0gYHRyYW5zbGF0ZVgoJHtvZmZzZXRYfXB4KSBgO1xuXHRcdH1cblxuXHRcdGlmIChvZmZzZXRZKSB7XG5cdFx0XHR0cmFuc2Zvcm1TdHJpbmcgKz0gYHRyYW5zbGF0ZVkoJHtvZmZzZXRZfXB4KWA7XG5cdFx0fVxuXG5cdFx0c3R5bGVzLnRyYW5zZm9ybSA9IHRyYW5zZm9ybVN0cmluZy50cmltKCk7XG5cblx0XHQvLyBJZiBhIG1heFdpZHRoIG9yIG1heEhlaWdodCBpcyBzcGVjaWZpZWQgb24gdGhlIG92ZXJsYXksIHdlIHJlbW92ZSB0aGVtLiBXZSBkbyB0aGlzIGJlY2F1c2Vcblx0XHQvLyB3ZSBuZWVkIHRoZXNlIHZhbHVlcyB0byBib3RoIGJlIHNldCB0byBcIjEwMCVcIiBmb3IgdGhlIGF1dG9tYXRpYyBmbGV4aWJsZSBzaXppbmcgdG8gd29yay5cblx0XHQvLyBUaGUgbWF4SGVpZ2h0IGFuZCBtYXhXaWR0aCBhcmUgc2V0IG9uIHRoZSBib3VuZGluZ0JveCBpbiBvcmRlciB0byBlbmZvcmNlIHRoZSBjb25zdHJhaW50LlxuXHRcdGlmICh0aGlzLl9oYXNGbGV4aWJsZURpbWVuc2lvbnMgJiYgdGhpcy5fb3ZlcmxheVJlZi5nZXRDb25maWcoKS5tYXhIZWlnaHQpIHtcblx0XHRcdHN0eWxlcy5tYXhIZWlnaHQgPSAnJztcblx0XHR9XG5cblx0XHRpZiAodGhpcy5faGFzRmxleGlibGVEaW1lbnNpb25zICYmIHRoaXMuX292ZXJsYXlSZWYuZ2V0Q29uZmlnKCkubWF4V2lkdGgpIHtcblx0XHRcdHN0eWxlcy5tYXhXaWR0aCA9ICcnO1xuXHRcdH1cblxuXHRcdGV4dGVuZFN0eWxlcyh0aGlzLl9wYW5lLnN0eWxlLCBzdHlsZXMpO1xuXHR9XG5cblx0LyoqIEdldHMgdGhlIGV4YWN0IHRvcC9ib3R0b20gZm9yIHRoZSBvdmVybGF5IHdoZW4gbm90IHVzaW5nIGZsZXhpYmxlIHNpemluZyBvciB3aGVuIHB1c2hpbmcuICovXG5cdHByaXZhdGUgX2dldEV4YWN0T3ZlcmxheVkoXG5cdFx0cG9zaXRpb246IENvbm5lY3RlZFBvc2l0aW9uLFxuXHRcdG9yaWdpblBvaW50OiBQb2ludCxcblx0XHRzY3JvbGxQb3NpdGlvbjogVmlld3BvcnRTY3JvbGxQb3NpdGlvbixcblx0KSB7XG5cdFx0Ly8gUmVzZXQgYW55IGV4aXN0aW5nIHN0eWxlcy4gVGhpcyBpcyBuZWNlc3NhcnkgaW4gY2FzZSB0aGVcblx0XHQvLyBwcmVmZXJyZWQgcG9zaXRpb24gaGFzIGNoYW5nZWQgc2luY2UgdGhlIGxhc3QgYGFwcGx5YC5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0Y29uc3Qgc3R5bGVzID0geyB0b3A6IG51bGwsIGJvdHRvbTogbnVsbCB9IGFzIENTU1N0eWxlRGVjbGFyYXRpb247XG5cdFx0bGV0IG92ZXJsYXlQb2ludCA9IHRoaXMuX2dldE92ZXJsYXlQb2ludChvcmlnaW5Qb2ludCwgdGhpcy5fb3ZlcmxheVJlY3QsIHBvc2l0aW9uKTtcblxuXHRcdGlmICh0aGlzLl9pc1B1c2hlZCkge1xuXHRcdFx0b3ZlcmxheVBvaW50ID0gdGhpcy5fcHVzaE92ZXJsYXlPblNjcmVlbihvdmVybGF5UG9pbnQsIHRoaXMuX292ZXJsYXlSZWN0LCBzY3JvbGxQb3NpdGlvbiwgcG9zaXRpb24pO1xuXHRcdH1cblxuXHRcdGNvbnN0IHZpcnR1YWxLZXlib2FyZE9mZnNldCA9IHRoaXMuX292ZXJsYXlDb250YWluZXIuZ2V0Q29udGFpbmVyRWxlbWVudCgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcblxuXHRcdC8vIE5vcm1hbGx5IHRoaXMgd291bGQgYmUgemVybywgaG93ZXZlciB3aGVuIHRoZSBvdmVybGF5IGlzIGF0dGFjaGVkIHRvIGFuIGlucHV0IChlLmcuIGluIGFuXG5cdFx0Ly8gYXV0b2NvbXBsZXRlKSwgbW9iaWxlIGJyb3dzZXJzIHdpbGwgc2hpZnQgZXZlcnl0aGluZyBpbiBvcmRlciB0byBwdXQgdGhlIGlucHV0IGluIHRoZSBtaWRkbGVcblx0XHQvLyBvZiB0aGUgc2NyZWVuIGFuZCB0byBtYWtlIHNwYWNlIGZvciB0aGUgdmlydHVhbCBrZXlib2FyZC4gV2UgbmVlZCB0byBhY2NvdW50IGZvciB0aGlzIG9mZnNldCxcblx0XHQvLyBvdGhlcndpc2Ugb3VyIHBvc2l0aW9uaW5nIHdpbGwgYmUgdGhyb3duIG9mZi5cblx0XHRvdmVybGF5UG9pbnQueSAtPSB2aXJ0dWFsS2V5Ym9hcmRPZmZzZXQ7XG5cblx0XHQvLyBXZSB3YW50IHRvIHNldCBlaXRoZXIgYHRvcGAgb3IgYGJvdHRvbWAgYmFzZWQgb24gd2hldGhlciB0aGUgb3ZlcmxheSB3YW50cyB0byBhcHBlYXJcblx0XHQvLyBhYm92ZSBvciBiZWxvdyB0aGUgb3JpZ2luIGFuZCB0aGUgZGlyZWN0aW9uIGluIHdoaWNoIHRoZSBlbGVtZW50IHdpbGwgZXhwYW5kLlxuXHRcdGlmIChwb3NpdGlvbi5vdmVybGF5WSA9PT0gJ2JvdHRvbScpIHtcblx0XHRcdC8vIFdoZW4gdXNpbmcgYGJvdHRvbWAsIHdlIGFkanVzdCB0aGUgeSBwb3NpdGlvbiBzdWNoIHRoYXQgaXQgaXMgdGhlIGRpc3RhbmNlXG5cdFx0XHQvLyBmcm9tIHRoZSBib3R0b20gb2YgdGhlIHZpZXdwb3J0IHJhdGhlciB0aGFuIHRoZSB0b3AuXG5cdFx0XHRjb25zdCBkb2N1bWVudEhlaWdodCA9IHRoaXMuX2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XG5cdFx0XHRzdHlsZXMuYm90dG9tID0gYCR7ZG9jdW1lbnRIZWlnaHQgLSAob3ZlcmxheVBvaW50LnkgKyB0aGlzLl9vdmVybGF5UmVjdC5oZWlnaHQpfXB4YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3R5bGVzLnRvcCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUob3ZlcmxheVBvaW50LnkpO1xuXHRcdH1cblxuXHRcdHJldHVybiBzdHlsZXM7XG5cdH1cblxuXHQvKiogR2V0cyB0aGUgZXhhY3QgbGVmdC9yaWdodCBmb3IgdGhlIG92ZXJsYXkgd2hlbiBub3QgdXNpbmcgZmxleGlibGUgc2l6aW5nIG9yIHdoZW4gcHVzaGluZy4gKi9cblx0cHJpdmF0ZSBfZ2V0RXhhY3RPdmVybGF5WChcblx0XHRwb3NpdGlvbjogQ29ubmVjdGVkUG9zaXRpb24sXG5cdFx0b3JpZ2luUG9pbnQ6IFBvaW50LFxuXHRcdHNjcm9sbFBvc2l0aW9uOiBWaWV3cG9ydFNjcm9sbFBvc2l0aW9uLFxuXHQpIHtcblx0XHQvLyBSZXNldCBhbnkgZXhpc3Rpbmcgc3R5bGVzLiBUaGlzIGlzIG5lY2Vzc2FyeSBpbiBjYXNlIHRoZSBwcmVmZXJyZWQgcG9zaXRpb24gaGFzXG5cdFx0Ly8gY2hhbmdlZCBzaW5jZSB0aGUgbGFzdCBgYXBwbHlgLlxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRjb25zdCBzdHlsZXMgPSB7IGxlZnQ6IG51bGwsIHJpZ2h0OiBudWxsIH0gYXMgQ1NTU3R5bGVEZWNsYXJhdGlvbjtcblx0XHRsZXQgb3ZlcmxheVBvaW50ID0gdGhpcy5fZ2V0T3ZlcmxheVBvaW50KG9yaWdpblBvaW50LCB0aGlzLl9vdmVybGF5UmVjdCwgcG9zaXRpb24pO1xuXG5cdFx0aWYgKHRoaXMuX2lzUHVzaGVkKSB7XG5cdFx0XHRvdmVybGF5UG9pbnQgPSB0aGlzLl9wdXNoT3ZlcmxheU9uU2NyZWVuKG92ZXJsYXlQb2ludCwgdGhpcy5fb3ZlcmxheVJlY3QsIHNjcm9sbFBvc2l0aW9uLCBwb3NpdGlvbik7XG5cdFx0fVxuXG5cdFx0Ly8gV2Ugd2FudCB0byBzZXQgZWl0aGVyIGBsZWZ0YCBvciBgcmlnaHRgIGJhc2VkIG9uIHdoZXRoZXIgdGhlIG92ZXJsYXkgd2FudHMgdG8gYXBwZWFyIFwiYmVmb3JlXCJcblx0XHQvLyBvciBcImFmdGVyXCIgdGhlIG9yaWdpbiwgd2hpY2ggZGV0ZXJtaW5lcyB0aGUgZGlyZWN0aW9uIGluIHdoaWNoIHRoZSBlbGVtZW50IHdpbGwgZXhwYW5kLlxuXHRcdC8vIEZvciB0aGUgaG9yaXpvbnRhbCBheGlzLCB0aGUgbWVhbmluZyBvZiBcImJlZm9yZVwiIGFuZCBcImFmdGVyXCIgY2hhbmdlIGJhc2VkIG9uIHdoZXRoZXIgdGhlXG5cdFx0Ly8gcGFnZSBpcyBpbiBSVEwgb3IgTFRSLlxuXHRcdGxldCBob3Jpem9udGFsU3R5bGVQcm9wZXJ0eTogJ2xlZnQnIHwgJ3JpZ2h0JztcblxuXHRcdGlmICh0aGlzLl9pc1J0bCgpKSB7XG5cdFx0XHRob3Jpem9udGFsU3R5bGVQcm9wZXJ0eSA9IHBvc2l0aW9uLm92ZXJsYXlYID09PSAnZW5kJyA/ICdsZWZ0JyA6ICdyaWdodCc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGhvcml6b250YWxTdHlsZVByb3BlcnR5ID0gcG9zaXRpb24ub3ZlcmxheVggPT09ICdlbmQnID8gJ3JpZ2h0JyA6ICdsZWZ0Jztcblx0XHR9XG5cblx0XHQvLyBXaGVuIHdlJ3JlIHNldHRpbmcgYHJpZ2h0YCwgd2UgYWRqdXN0IHRoZSB4IHBvc2l0aW9uIHN1Y2ggdGhhdCBpdCBpcyB0aGUgZGlzdGFuY2Vcblx0XHQvLyBmcm9tIHRoZSByaWdodCBlZGdlIG9mIHRoZSB2aWV3cG9ydCByYXRoZXIgdGhhbiB0aGUgbGVmdCBlZGdlLlxuXHRcdGlmIChob3Jpem9udGFsU3R5bGVQcm9wZXJ0eSA9PT0gJ3JpZ2h0Jykge1xuXHRcdFx0Y29uc3QgZG9jdW1lbnRXaWR0aCA9IHRoaXMuX2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcblx0XHRcdHN0eWxlcy5yaWdodCA9IGAke2RvY3VtZW50V2lkdGggLSAob3ZlcmxheVBvaW50LnggKyB0aGlzLl9vdmVybGF5UmVjdC53aWR0aCl9cHhgO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdHlsZXMubGVmdCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUob3ZlcmxheVBvaW50LngpO1xuXHRcdH1cblxuXHRcdHJldHVybiBzdHlsZXM7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgdmlldyBwcm9wZXJ0aWVzIG9mIHRoZSB0cmlnZ2VyIGFuZCBvdmVybGF5LCBpbmNsdWRpbmcgd2hldGhlciB0aGV5IGFyZSBjbGlwcGVkXG5cdCAqIG9yIGNvbXBsZXRlbHkgb3V0c2lkZSB0aGUgdmlldyBvZiBhbnkgb2YgdGhlIHN0cmF0ZWd5J3Mgc2Nyb2xsYWJsZXMuXG5cdCAqL1xuXHRwcml2YXRlIF9nZXRTY3JvbGxWaXNpYmlsaXR5KCk6IFNjcm9sbGluZ1Zpc2liaWxpdHkge1xuXHRcdC8vIE5vdGU6IG5lZWRzIGZyZXNoIHJlY3RzIHNpbmNlIHRoZSBwb3NpdGlvbiBjb3VsZCd2ZSBjaGFuZ2VkLlxuXHRcdGNvbnN0IG9yaWdpbkJvdW5kcyA9IHRoaXMuX2dldE9yaWdpblJlY3QoKTtcblx0XHRjb25zdCBvdmVybGF5Qm91bmRzID0gdGhpcy5fcGFuZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuXHRcdGNvbnN0IHNjcm9sbENvbnRhaW5lckJvdW5kcyA9IHRoaXMuX3Njcm9sbGFibGVzLm1hcCgoc2Nyb2xsYWJsZSkgPT4ge1xuXHRcdFx0cmV0dXJuIHNjcm9sbGFibGUuZ2V0RWxlbWVudFJlZigpLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0aXNPcmlnaW5DbGlwcGVkOiBpc0VsZW1lbnRDbGlwcGVkQnlTY3JvbGxpbmcob3JpZ2luQm91bmRzLCBzY3JvbGxDb250YWluZXJCb3VuZHMpLFxuXHRcdFx0aXNPcmlnaW5PdXRzaWRlVmlldzogaXNFbGVtZW50U2Nyb2xsZWRPdXRzaWRlVmlldyhvcmlnaW5Cb3VuZHMsIHNjcm9sbENvbnRhaW5lckJvdW5kcyksXG5cdFx0XHRpc092ZXJsYXlDbGlwcGVkOiBpc0VsZW1lbnRDbGlwcGVkQnlTY3JvbGxpbmcob3ZlcmxheUJvdW5kcywgc2Nyb2xsQ29udGFpbmVyQm91bmRzKSxcblx0XHRcdGlzT3ZlcmxheU91dHNpZGVWaWV3OiBpc0VsZW1lbnRTY3JvbGxlZE91dHNpZGVWaWV3KG92ZXJsYXlCb3VuZHMsIHNjcm9sbENvbnRhaW5lckJvdW5kcyksXG5cdFx0fTtcblx0fVxuXG5cdC8qKiBTdWJ0cmFjdHMgdGhlIGFtb3VudCB0aGF0IGFuIGVsZW1lbnQgaXMgb3ZlcmZsb3dpbmcgb24gYW4gYXhpcyBmcm9tIGl0cyBsZW5ndGguICovXG5cdHByaXZhdGUgX3N1YnRyYWN0T3ZlcmZsb3dzKGxlbmd0aDogbnVtYmVyLCAuLi5vdmVyZmxvd3M6IG51bWJlcltdKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gb3ZlcmZsb3dzLnJlZHVjZSgoY3VycmVudFZhbHVlOiBudW1iZXIsIGN1cnJlbnRPdmVyZmxvdzogbnVtYmVyKSA9PiB7XG5cdFx0XHRyZXR1cm4gY3VycmVudFZhbHVlIC0gTWF0aC5tYXgoY3VycmVudE92ZXJmbG93LCAwKTtcblx0XHR9LCBsZW5ndGgpO1xuXHR9XG5cblx0cHJpdmF0ZSBfZ2V0TmFycm93ZWRSZWN0KGNvbnRhaW5lcjogR2hvc3RSaWRlclBvcG92ZXJDb250YWluZXIpOiBDbGllbnRSZWN0IHtcblx0XHRjb25zdCBuYXRpdmVSZWN0OiBDbGllbnRSZWN0ID0gY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiB7XG5cdFx0XHR0b3A6IG5hdGl2ZVJlY3QudG9wICsgdGhpcy5fdmlld3BvcnRNYXJnaW4sXG5cdFx0XHRsZWZ0OiBuYXRpdmVSZWN0LmxlZnQgKyB0aGlzLl92aWV3cG9ydE1hcmdpbixcblx0XHRcdHJpZ2h0OiBuYXRpdmVSZWN0LnJpZ2h0IC0gdGhpcy5fdmlld3BvcnRNYXJnaW4sXG5cdFx0XHRib3R0b206IG5hdGl2ZVJlY3QuYm90dG9tIC0gdGhpcy5fdmlld3BvcnRNYXJnaW4sXG5cdFx0XHR3aWR0aDogbmF0aXZlUmVjdC53aWR0aCAtICgyICogdGhpcy5fdmlld3BvcnRNYXJnaW4pLFxuXHRcdFx0aGVpZ2h0OiBuYXRpdmVSZWN0LmhlaWdodCAtICgyICogdGhpcy5fdmlld3BvcnRNYXJnaW4pLFxuXHRcdH07XG5cdH1cblxuXHQvKiogV2hldGhlciB0aGUgd2UncmUgZGVhbGluZyB3aXRoIGFuIFJUTCBjb250ZXh0ICovXG5cdHByaXZhdGUgX2lzUnRsKCkge1xuXHRcdHJldHVybiB0aGlzLl9vdmVybGF5UmVmLmdldERpcmVjdGlvbigpID09PSAncnRsJztcblx0fVxuXG5cdC8qKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIG92ZXJsYXkgdXNlcyBleGFjdCBvciBmbGV4aWJsZSBwb3NpdGlvbmluZy4gKi9cblx0cHJpdmF0ZSBfaGFzRXhhY3RQb3NpdGlvbigpIHtcblx0XHRyZXR1cm4gIXRoaXMuX2hhc0ZsZXhpYmxlRGltZW5zaW9ucyB8fCB0aGlzLl9pc1B1c2hlZDtcblx0fVxuXG5cdC8qKiBSZXRyaWV2ZXMgdGhlIG9mZnNldCBvZiBhIHBvc2l0aW9uIGFsb25nIHRoZSB4IG9yIHkgYXhpcy4gKi9cblx0cHJpdmF0ZSBfZ2V0T2Zmc2V0KHBvc2l0aW9uOiBDb25uZWN0ZWRQb3NpdGlvbiwgYXhpczogJ3gnIHwgJ3knKSB7XG5cdFx0aWYgKGF4aXMgPT09ICd4Jykge1xuXHRcdFx0Ly8gV2UgZG9uJ3QgZG8gc29tZXRoaW5nIGxpa2UgYHBvc2l0aW9uWydvZmZzZXQnICsgYXhpc11gIGluXG5cdFx0XHQvLyBvcmRlciB0byBhdm9pZCBicmVraW5nIG1pbmlmaWVycyB0aGF0IHJlbmFtZSBwcm9wZXJ0aWVzLlxuXHRcdFx0cmV0dXJuIHBvc2l0aW9uLm9mZnNldFggPT0gbnVsbCA/IHRoaXMuX29mZnNldFggOiBwb3NpdGlvbi5vZmZzZXRYO1xuXHRcdH1cblxuXHRcdHJldHVybiBwb3NpdGlvbi5vZmZzZXRZID09IG51bGwgPyB0aGlzLl9vZmZzZXRZIDogcG9zaXRpb24ub2Zmc2V0WTtcblx0fVxuXG5cdC8qKiBWYWxpZGF0ZXMgdGhhdCB0aGUgY3VycmVudCBwb3NpdGlvbiBtYXRjaCB0aGUgZXhwZWN0ZWQgdmFsdWVzLiAqL1xuXHRwcml2YXRlIF92YWxpZGF0ZVBvc2l0aW9ucygpOiB2b2lkIHtcblx0XHRpZiAoIXRoaXMuX3ByZWZlcnJlZFBvc2l0aW9ucy5sZW5ndGgpIHtcblx0XHRcdHRocm93IEVycm9yKCdGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3k6IEF0IGxlYXN0IG9uZSBwb3NpdGlvbiBpcyByZXF1aXJlZC4nKTtcblx0XHR9XG5cblx0XHQvLyBUT0RPKGNyaXNiZXRvKTogcmVtb3ZlIHRoZXNlIG9uY2UgQW5ndWxhcidzIHRlbXBsYXRlIHR5cGVcblx0XHQvLyBjaGVja2luZyBpcyBhZHZhbmNlZCBlbm91Z2ggdG8gY2F0Y2ggdGhlc2UgY2FzZXMuXG5cdFx0dGhpcy5fcHJlZmVycmVkUG9zaXRpb25zLmZvckVhY2goKHBhaXIpID0+IHtcblx0XHRcdHZhbGlkYXRlSG9yaXpvbnRhbFBvc2l0aW9uKCdvcmlnaW5YJywgcGFpci5vcmlnaW5YKTtcblx0XHRcdHZhbGlkYXRlVmVydGljYWxQb3NpdGlvbignb3JpZ2luWScsIHBhaXIub3JpZ2luWSk7XG5cdFx0XHR2YWxpZGF0ZUhvcml6b250YWxQb3NpdGlvbignb3ZlcmxheVgnLCBwYWlyLm92ZXJsYXlYKTtcblx0XHRcdHZhbGlkYXRlVmVydGljYWxQb3NpdGlvbignb3ZlcmxheVknLCBwYWlyLm92ZXJsYXlZKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKiBBZGRzIGEgc2luZ2xlIENTUyBjbGFzcyBvciBhbiBhcnJheSBvZiBjbGFzc2VzIG9uIHRoZSBvdmVybGF5IHBhbmVsLiAqL1xuXHRwcml2YXRlIF9hZGRQYW5lbENsYXNzZXMoY3NzQ2xhc3Nlczogc3RyaW5nIHwgc3RyaW5nW10pIHtcblx0XHRpZiAodGhpcy5fcGFuZSkge1xuXHRcdFx0Y29lcmNlQXJyYXkoY3NzQ2xhc3NlcykuZm9yRWFjaCgoY3NzQ2xhc3MpID0+IHtcblx0XHRcdFx0aWYgKGNzc0NsYXNzICE9PSAnJyAmJiB0aGlzLl9hcHBsaWVkUGFuZWxDbGFzc2VzLmluZGV4T2YoY3NzQ2xhc3MpID09PSAtMSkge1xuXHRcdFx0XHRcdHRoaXMuX2FwcGxpZWRQYW5lbENsYXNzZXMucHVzaChjc3NDbGFzcyk7XG5cdFx0XHRcdFx0dGhpcy5fcGFuZS5jbGFzc0xpc3QuYWRkKGNzc0NsYXNzKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqIENsZWFycyB0aGUgY2xhc3NlcyB0aGF0IHRoZSBwb3NpdGlvbiBzdHJhdGVneSBoYXMgYXBwbGllZCBmcm9tIHRoZSBvdmVybGF5IHBhbmVsLiAqL1xuXHRwcml2YXRlIF9jbGVhclBhbmVsQ2xhc3NlcygpIHtcblx0XHRpZiAodGhpcy5fcGFuZSkge1xuXHRcdFx0dGhpcy5fYXBwbGllZFBhbmVsQ2xhc3Nlcy5mb3JFYWNoKChjc3NDbGFzcykgPT4ge1xuXHRcdFx0XHR0aGlzLl9wYW5lLmNsYXNzTGlzdC5yZW1vdmUoY3NzQ2xhc3MpO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLl9hcHBsaWVkUGFuZWxDbGFzc2VzID0gW107XG5cdFx0fVxuXHR9XG5cblx0LyoqIFJldHVybnMgdGhlIENsaWVudFJlY3Qgb2YgdGhlIGN1cnJlbnQgb3JpZ2luLiAqL1xuXHRwcml2YXRlIF9nZXRPcmlnaW5SZWN0KCk6IENsaWVudFJlY3Qge1xuXHRcdGNvbnN0IG9yaWdpbiA9IHRoaXMuX29yaWdpbjtcblxuXHRcdGlmIChvcmlnaW4gaW5zdGFuY2VvZiBFbGVtZW50UmVmKSB7XG5cdFx0XHRyZXR1cm4gb3JpZ2luLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0fVxuXG5cdFx0aWYgKG9yaWdpbiBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gb3JpZ2luLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdH1cblxuXHRcdGNvbnN0IHdpZHRoID0gb3JpZ2luLndpZHRoIHx8IDA7XG5cdFx0Y29uc3QgaGVpZ2h0ID0gb3JpZ2luLmhlaWdodCB8fCAwO1xuXG5cdFx0Ly8gSWYgdGhlIG9yaWdpbiBpcyBhIHBvaW50LCByZXR1cm4gYSBjbGllbnQgcmVjdCBhcyBpZiBpdCB3YXMgYSAweDAgZWxlbWVudCBhdCB0aGUgcG9pbnQuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiB7XG5cdFx0XHR0b3A6IG9yaWdpbi55LFxuXHRcdFx0Ym90dG9tOiBvcmlnaW4ueSArIGhlaWdodCxcblx0XHRcdGxlZnQ6IG9yaWdpbi54LFxuXHRcdFx0cmlnaHQ6IG9yaWdpbi54ICsgd2lkdGgsXG5cdFx0XHRoZWlnaHQsXG5cdFx0XHR3aWR0aCxcblx0XHR9O1xuXHR9XG59XG5cbi8qKiBBIHNpbXBsZSAoeCwgeSkgY29vcmRpbmF0ZS4gKi9cbmludGVyZmFjZSBQb2ludCB7XG5cdHg6IG51bWJlcjtcblx0eTogbnVtYmVyO1xufVxuXG4vKiogUmVjb3JkIG9mIG1lYXN1cmVtZW50cyBmb3IgaG93IGFuIG92ZXJsYXkgKGF0IGEgZ2l2ZW4gcG9zaXRpb24pIGZpdHMgaW50byB0aGUgdmlld3BvcnQuICovXG5pbnRlcmZhY2UgT3ZlcmxheUZpdCB7XG5cdC8qKiBXaGV0aGVyIHRoZSBvdmVybGF5IGZpdHMgY29tcGxldGVseSBpbiB0aGUgdmlld3BvcnQuICovXG5cdGlzQ29tcGxldGVseVdpdGhpblZpZXdwb3J0OiBib29sZWFuO1xuXG5cdC8qKiBXaGV0aGVyIHRoZSBvdmVybGF5IGZpdHMgaW4gdGhlIHZpZXdwb3J0IG9uIHRoZSB5LWF4aXMuICovXG5cdGZpdHNJblZpZXdwb3J0VmVydGljYWxseTogYm9vbGVhbjtcblxuXHQvKiogV2hldGhlciB0aGUgb3ZlcmxheSBmaXRzIGluIHRoZSB2aWV3cG9ydCBvbiB0aGUgeC1heGlzLiAqL1xuXHRmaXRzSW5WaWV3cG9ydEhvcml6b250YWxseTogYm9vbGVhbjtcblxuXHQvKiogVGhlIHRvdGFsIHZpc2libGUgYXJlYSAoaW4gcHheMikgb2YgdGhlIG92ZXJsYXkgaW5zaWRlIHRoZSB2aWV3cG9ydC4gKi9cblx0dmlzaWJsZUFyZWE6IG51bWJlcjtcbn1cblxuLyoqIFJlY29yZCBvZiB0aGUgbWVhc3VybWVudHMgZGV0ZXJtaW5pbmcgd2hldGhlciBhbiBvdmVybGF5IHdpbGwgZml0IGluIGEgc3BlY2lmaWMgcG9zaXRpb24uICovXG5pbnRlcmZhY2UgRmFsbGJhY2tQb3NpdGlvbiB7XG5cdHBvc2l0aW9uOiBDb25uZWN0ZWRQb3NpdGlvbjtcblx0b3JpZ2luUG9pbnQ6IFBvaW50O1xuXHRvdmVybGF5UG9pbnQ6IFBvaW50O1xuXHRvdmVybGF5Rml0OiBPdmVybGF5Rml0O1xuXHRvdmVybGF5UmVjdDogQ2xpZW50UmVjdDtcbn1cblxuLyoqIFBvc2l0aW9uIGFuZCBzaXplIG9mIHRoZSBvdmVybGF5IHNpemluZyB3cmFwcGVyIGZvciBhIHNwZWNpZmljIHBvc2l0aW9uLiAqL1xuaW50ZXJmYWNlIEJvdW5kaW5nQm94UmVjdCBleHRlbmRzIENsaWVudFJlY3QgeyAvLyBoZWlnaHQvd2lkdGggcmVhZG9ubHkgb24gQ2llbnRSZWN0XG5cdGhlaWdodDogbnVtYmVyO1xuXHR3aWR0aDogbnVtYmVyO1xufVxuXG4vKiogUmVjb3JkIG9mIG1lYXN1cmVzIGRldGVybWluaW5nIGhvdyB3ZWxsIGEgZ2l2ZW4gcG9zaXRpb24gd2lsbCBmaXQgd2l0aCBmbGV4aWJsZSBkaW1lbnNpb25zLiAqL1xuaW50ZXJmYWNlIEZsZXhpYmxlRml0IHtcblx0cG9zaXRpb246IENvbm5lY3RlZFBvc2l0aW9uO1xuXHRvcmlnaW46IFBvaW50O1xuXHRvdmVybGF5UmVjdDogQ2xpZW50UmVjdDtcblx0Ym91bmRpbmdCb3hSZWN0OiBCb3VuZGluZ0JveFJlY3Q7XG59XG5cbi8qKiBTaGFsbG93LWV4dGVuZHMgYSBzdHlsZXNoZWV0IG9iamVjdCB3aXRoIGFub3RoZXIgc3R5bGVzaGVldCBvYmplY3QuICovXG5mdW5jdGlvbiBleHRlbmRTdHlsZXMoZGVzdDogQ1NTU3R5bGVEZWNsYXJhdGlvbiwgc291cmNlOiBDU1NTdHlsZURlY2xhcmF0aW9uKTogQ1NTU3R5bGVEZWNsYXJhdGlvbiB7XG5cdGZvciAoY29uc3Qga2V5IGluIHNvdXJjZSkge1xuXHRcdGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdFx0ZGVzdFtrZXldID0gc291cmNlW2tleV07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGRlc3Q7XG59XG5cbi8qKlxuICogR2V0cyB3aGV0aGVyIGFuIGVsZW1lbnQgaXMgc2Nyb2xsZWQgb3V0c2lkZSBvZiB2aWV3IGJ5IGFueSBvZiBpdHMgcGFyZW50IHNjcm9sbGluZyBjb250YWluZXJzLlxuICogQHBhcmFtIGVsZW1lbnQgRGltZW5zaW9ucyBvZiB0aGUgZWxlbWVudCAoZnJvbSBnZXRCb3VuZGluZ0NsaWVudFJlY3QpXG4gKiBAcGFyYW0gc2Nyb2xsQ29udGFpbmVycyBEaW1lbnNpb25zIG9mIGVsZW1lbnQncyBzY3JvbGxpbmcgY29udGFpbmVycyAoZnJvbSBnZXRCb3VuZGluZ0NsaWVudFJlY3QpXG4gKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIHNjcm9sbGVkIG91dCBvZiB2aWV3XG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGlzRWxlbWVudFNjcm9sbGVkT3V0c2lkZVZpZXcoZWxlbWVudDogQ2xpZW50UmVjdCwgc2Nyb2xsQ29udGFpbmVyczogQ2xpZW50UmVjdFtdKSB7XG5cdHJldHVybiBzY3JvbGxDb250YWluZXJzLnNvbWUoKGNvbnRhaW5lckJvdW5kcykgPT4ge1xuXHRcdHJldHVybiBlbGVtZW50LmJvdHRvbSA8IGNvbnRhaW5lckJvdW5kcy50b3AgLy8gT3V0c2lkZSBBYm92ZVxuXHRcdFx0fHwgZWxlbWVudC50b3AgPiBjb250YWluZXJCb3VuZHMuYm90dG9tIC8vIE91dHNpZGUgQmVsb3dcblx0XHRcdHx8IGVsZW1lbnQucmlnaHQgPCBjb250YWluZXJCb3VuZHMubGVmdCAvLyBPdXRzaWRlIExlZnRcblx0XHRcdHx8IGVsZW1lbnQubGVmdCA+IGNvbnRhaW5lckJvdW5kcy5yaWdodDsgLy8gT3V0c2lkZSBSaWdodFxuXHR9KTtcbn1cblxuLyoqXG4gKiBHZXRzIHdoZXRoZXIgYW4gZWxlbWVudCBpcyBjbGlwcGVkIGJ5IGFueSBvZiBpdHMgc2Nyb2xsaW5nIGNvbnRhaW5lcnMuXG4gKiBAcGFyYW0gZWxlbWVudCBEaW1lbnNpb25zIG9mIHRoZSBlbGVtZW50IChmcm9tIGdldEJvdW5kaW5nQ2xpZW50UmVjdClcbiAqIEBwYXJhbSBzY3JvbGxDb250YWluZXJzIERpbWVuc2lvbnMgb2YgZWxlbWVudCdzIHNjcm9sbGluZyBjb250YWluZXJzIChmcm9tIGdldEJvdW5kaW5nQ2xpZW50UmVjdClcbiAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgY2xpcHBlZFxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBpc0VsZW1lbnRDbGlwcGVkQnlTY3JvbGxpbmcoZWxlbWVudDogQ2xpZW50UmVjdCwgc2Nyb2xsQ29udGFpbmVyczogQ2xpZW50UmVjdFtdKSB7XG5cdHJldHVybiBzY3JvbGxDb250YWluZXJzLnNvbWUoKHNjcm9sbENvbnRhaW5lclJlY3QpID0+IHtcblx0XHRyZXR1cm4gZWxlbWVudC50b3AgPCBzY3JvbGxDb250YWluZXJSZWN0LnRvcCAvLyBDbGlwcGVkIEFib3ZlXG5cdFx0XHR8fCBlbGVtZW50LmJvdHRvbSA+IHNjcm9sbENvbnRhaW5lclJlY3QuYm90dG9tIC8vIENsaXBwZWQgQmVsb3dcblx0XHRcdHx8IGVsZW1lbnQubGVmdCA8IHNjcm9sbENvbnRhaW5lclJlY3QubGVmdCAvLyBDbGlwcGVkIExlZnRcblx0XHRcdHx8IGVsZW1lbnQucmlnaHQgPiBzY3JvbGxDb250YWluZXJSZWN0LnJpZ2h0OyAvLyBDbGlwcGVkIFJpZ2h0XG5cdH0pO1xufVxuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdIT1NUX1JJREVSX1BPUE9WRVJfUE9TSVRJT05fU1RSQVRFR1lfRkFDVE9SWShcblx0dmlld3BvcnRSdWxlcjogVmlld3BvcnRSdWxlcixcblx0ZG9jdW1lbnQ6IERvY3VtZW50LFxuXHRwbGF0Zm9ybTogUGxhdGZvcm0sXG5cdG92ZXJsYXlDb250YWluZXI6IE92ZXJsYXlDb250YWluZXIsXG5cdHJvb3RQb3BvdmVyQ29udGFpbmVyOiBHaG9zdFJpZGVyUm9vdFBvcG92ZXJDb250YWluZXIsXG4pOiBQb3BvdmVyUG9zaXRpb25TdHJhdGVneUZhY3Rvcnkge1xuXHRyZXR1cm4gKG9yaWdpbjogUG9wb3ZlclBvc2l0aW9uU3RyYXRlZ3lPcmlnaW4pOiBQb3BvdmVyUG9zaXRpb25TdHJhdGVneSA9PiB7XG5cdFx0cmV0dXJuIG5ldyBQb3BvdmVyUG9zaXRpb25TdHJhdGVneShcblx0XHRcdG9yaWdpbixcblx0XHRcdHZpZXdwb3J0UnVsZXIsXG5cdFx0XHRkb2N1bWVudCxcblx0XHRcdHBsYXRmb3JtLFxuXHRcdFx0b3ZlcmxheUNvbnRhaW5lcixcblx0XHRcdHJvb3RQb3BvdmVyQ29udGFpbmVyLFxuXHRcdCk7XG5cdH07XG59XG5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5leHBvcnQgY29uc3QgR0hPU1RfUklERVJfUE9QT1ZFUl9QT1NJVElPTl9TVFJBVEVHWV9GQUNUT1JZX1BST1ZJREVSOiBGYWN0b3J5UHJvdmlkZXIgPSB7XG5cdHByb3ZpZGU6IEdIT1NUX1JJREVSX1BPUE9WRVJfUE9TSVRJT05fU1RSQVRFR1ksXG5cdHVzZUZhY3Rvcnk6IEdIT1NUX1JJREVSX1BPUE9WRVJfUE9TSVRJT05fU1RSQVRFR1lfRkFDVE9SWSxcblx0ZGVwczogW1xuXHRcdFZpZXdwb3J0UnVsZXIsXG5cdFx0RE9DVU1FTlQsXG5cdFx0UGxhdGZvcm0sXG5cdFx0T3ZlcmxheUNvbnRhaW5lcixcblx0XHRHaG9zdFJpZGVyUm9vdFBvcG92ZXJDb250YWluZXIsXG5cdF0sXG59O1xuIl19