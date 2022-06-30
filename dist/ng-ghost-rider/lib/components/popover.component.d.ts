/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Observable } from 'rxjs';
import * as i0 from "@angular/core";
export declare type PopoverContent<T> = T extends string ? string : ComponentPortal<T> | TemplatePortal<T>;
export declare class PopoverComponent<T = any> implements OnDestroy {
    private _cdr;
    set content(content: PopoverContent<T>);
    contentCmp: ComponentPortal<T> | any;
    contentTpl: TemplatePortal<T> | any;
    contentText: string | any;
    nubbinCls: string;
    isTooltip: boolean;
    private _position;
    get position(): ConnectedPosition;
    set position(pos: ConnectedPosition);
    /** The timeout ID of any current timer set to show the tooltip */
    private _showTimeoutId;
    /** The timeout ID of any current timer set to hide the tooltip */
    private _hideTimeoutId;
    /** Property watched by the animation framework to show or hide the tooltip */
    private _visibility;
    /** Subject for notifying that the tooltip has been hidden from the view */
    private readonly _onHide;
    /** Subject for notifying that the tooltip has been made visible */
    private readonly _onShow;
    get hasTimeout(): boolean;
    constructor(_cdr: ChangeDetectorRef);
    ngOnDestroy(): void;
    /**
     * Shows the tooltip with an animation originating from the provided origin
     * @param delay Amount of milliseconds to the delay showing the tooltip.
     */
    show(delay: number): void;
    /**
     * Begins the animation to hide the tooltip after the provided delay in ms.
     * @param delay Amount of milliseconds to delay showing the tooltip.
     */
    hide(delay: number): void;
    /** Returns an observable that notifies when the tooltip has been hidden from view. */
    afterHidden(): Observable<void>;
    /** Returns an observable that notifies when the tooltip has been made visible. */
    afterVisible(): Observable<void>;
    /** Whether the tooltip is being displayed. */
    isVisible(): boolean;
    markForCheck(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PopoverComponent<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PopoverComponent<any>, "ghost-rider-popover", never, {}, {}, never, never, false>;
}
export declare type TooltipVisibility = 'initial' | 'visible' | 'hidden';
