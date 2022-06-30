/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ConstructorProvider, ElementRef, InjectionToken, NgZone, OnDestroy, OnInit, Type, ViewContainerRef } from '@angular/core';
import { HammerLoader } from '@angular/platform-browser';
import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { OriginConnectionPosition, Overlay, OverlayConnectionPosition, OverlayRef, ScrollStrategy } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';
import { PopoverComponent } from '../components/popover.component';
import { GhostRiderPopoverContainer } from '../tokens/popover-container.token';
import { PopoverPositionStrategyFactory } from '../providers/popover-position-strategy.service';
import * as i0 from "@angular/core";
export declare type PopoverPosition = 'left' | 'right' | 'above' | 'below' | 'before' | 'after';
export declare type PopoverNubbinPosition = 'start' | 'center' | 'end' | 'auto' | 'none';
/** CSS class that will be attached to the overlay panel. */
export declare const POPOVER_PANEL_CLASS = "ghost-rider-popover-container";
export declare type PopoverContent<T> = T extends string ? string : ComponentPortal<T> | TemplatePortal<T>;
/**
 * Creates an error to be thrown if the user supplied an invalid popover position.
 * @docs-private
 */
export declare function getPopoverInvalidPositionError(position: string): Error;
/** Default `Popover` options that can be overridden. */
export interface PopoverDefaultOptions {
    showDelay: number;
    hideDelay: number;
    touchendHideDelay: number;
    position?: PopoverPosition;
}
/** Injection token to be used to override the default options for `Popover`. */
export declare const GHOST_RIDER_POPOVER_DEFAULT_OPTIONS: InjectionToken<PopoverDefaultOptions>;
/** @docs-private */
export declare function GHOST_RIDER_POPOVER_DEFAULT_OPTIONS_FACTORY(): PopoverDefaultOptions;
export declare class Popover<T = any> implements OnInit, OnDestroy {
    protected _overlay: Overlay;
    protected _elementRef: ElementRef<HTMLElement>;
    protected _scrollDispatcher: ScrollDispatcher;
    protected _viewContainerRef: ViewContainerRef;
    protected _ngZone: NgZone;
    protected _ariaDescriber: AriaDescriber;
    protected _focusMonitor: FocusMonitor;
    private _container;
    protected _dir: Directionality;
    protected _defaultOptions: PopoverDefaultOptions;
    _overlayRef: OverlayRef | null;
    private _popoverInstance;
    protected _portal: ComponentPortal<PopoverComponent>;
    protected _position: PopoverPosition;
    protected _nubbinPosition: PopoverNubbinPosition;
    protected _disabled: boolean;
    protected _scrollStrategy: () => ScrollStrategy;
    protected _positionStrategy: PopoverPositionStrategyFactory;
    isTooltip: boolean;
    popoverType: Type<PopoverComponent>;
    get popoverInstance(): PopoverComponent | null;
    /** Allows the user to define the position of the popover relative to the parent element */
    get position(): PopoverPosition;
    set position(value: PopoverPosition);
    /** Allows the user to define the nubbin position of the popover relative to the parent element */
    get nubbinPosition(): PopoverNubbinPosition;
    set nubbinPosition(value: PopoverNubbinPosition);
    /** Disables the display of the popover. */
    get disabled(): boolean;
    set disabled(value: boolean);
    /** The default delay in ms before showing the popover after show is called */
    showDelay: number;
    /** The default delay in ms before hiding the popover after hide is called */
    hideDelay: number;
    protected _content: PopoverContent<T>;
    /** The message to be displayed in the popover */
    get content(): PopoverContent<T>;
    set content(value: PopoverContent<T>);
    protected _manualListeners: Map<string, EventListenerOrEventListenerObject>;
    /** Emits when the component is destroyed. */
    protected readonly _destroyed: Subject<void>;
    protected _document: Document;
    constructor(_overlay: Overlay, _elementRef: ElementRef<HTMLElement>, _scrollDispatcher: ScrollDispatcher, _viewContainerRef: ViewContainerRef, _ngZone: NgZone, platform: Platform, _ariaDescriber: AriaDescriber, _focusMonitor: FocusMonitor, document: any, scrollStrategy: any, positionStrategy: any, _container: GhostRiderPopoverContainer, _dir: Directionality, _defaultOptions: PopoverDefaultOptions, hammerLoader?: HammerLoader);
    /**
     * Setup styling-specific things
     */
    ngOnInit(): void;
    /**
     * Dispose the popover when destroyed.
     */
    ngOnDestroy(): void;
    /** Shows the popover after the delay in ms, defaults to popover-delay-show or 0ms if no input */
    show(delay?: number): void;
    /** Hides the popover after the delay in ms, defaults to popover-delay-hide or 0ms if no input */
    hide(delay?: number): void;
    /** Shows/hides the popover */
    toggle(): void;
    /** Returns true if the popover is currently visible to the user */
    isPopoverVisible(): boolean;
    /** Handles the keydown events on the host element. */
    handleKeydown(e: KeyboardEvent): void;
    /** Handles the touchend events on the host element. */
    handleTouchend(): void;
    /** Create the overlay config and position strategy */
    protected _createOverlay(): OverlayRef;
    /** Detaches the currently-attached popover. */
    protected _detach(): void;
    /** Updates the position of the current popover. */
    protected _updatePosition(): void;
    /** Forces tooltip position to be recalculated. Necessary for manually triggered tooltip instances */
    updateOverlayPosition(): void;
    /**
     * Returns the origin position and a fallback position based on the user's position preference.
     * The fallback position is the inverse of the origin (e.g. `'below' -> 'above'`).
     */
    protected _getOrigin(): ConnectionPositions<OriginConnectionPosition>;
    /** Returns the overlay position and a fallback position based on the user's preference */
    protected _getOverlayPosition(): ConnectionPositions<OverlayConnectionPosition>;
    /** Updates the popover message and repositions the overlay according to the new message length */
    protected _updateContent(): void;
    /** Inverts an overlay position. */
    private _invertPosition;
    protected _bindEvents(platform: Platform, hammerLoader: HammerLoader): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Popover<any>, [null, null, null, null, null, null, null, null, null, null, null, null, { optional: true; }, { optional: true; }, { optional: true; }]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<Popover<any>, never, never, {}, {}, never, never, false>;
}
export declare const GHOST_RIDER_POPOVER_STATIC_PROVIDER: ConstructorProvider;
export interface ConnectionPositions<T extends OverlayConnectionPosition | OriginConnectionPosition> {
    main: T;
    fallback: T;
}
