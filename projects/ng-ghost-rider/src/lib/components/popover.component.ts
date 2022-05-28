/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Adapted from @angular/material "TooltipComponent"

import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';

import { Observable, Subject } from 'rxjs';

// #region template
const template = `

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

`;

export type PopoverContent<T> = T extends string ? string : ComponentPortal<T> | TemplatePortal<T>;

@Component({
	selector: 'ghost-rider-popover',
	template,
})
export class PopoverComponent<T = any> implements OnDestroy {
	public set content(content: PopoverContent<T>) {
		this.contentText = this.contentTpl = this.contentCmp = null;
		if (typeof content === 'string') {
			this.contentText = content;
		} else if (content instanceof TemplatePortal) {
			this.contentTpl = content;
		} else if (content instanceof ComponentPortal) {
			this.contentCmp = content;
		}
	}

	// todo FIX TYPES 'any'
	public contentCmp: ComponentPortal<T> | any;
	public contentTpl: TemplatePortal<T> | any; // TODO: Add ability to configure context
	public contentText: string | any;

	public nubbinCls: string;

	public isTooltip!: boolean;

	private _position!: ConnectedPosition;
	public get position(): ConnectedPosition { return this._position; }
	public set position(pos: ConnectedPosition) {
		if (pos !== this._position) {
			this._position = pos;
			// @ts-ignore
			this.nubbinCls = pos ? `ghost-rider-nubbin_${getNubbinPosition(pos)}` : null;
			this._cdr.markForCheck();
		}
	}

	/** The timeout ID of any current timer set to show the tooltip */
	private _showTimeoutId!: number | null;

	/** The timeout ID of any current timer set to hide the tooltip */
	private _hideTimeoutId: number | null;

	/** Property watched by the animation framework to show or hide the tooltip */
	private _visibility: TooltipVisibility = 'initial';

	/** Subject for notifying that the tooltip has been hidden from the view */
	private readonly _onHide: Subject<any> = new Subject();

	/** Subject for notifying that the tooltip has been made visible */
	private readonly _onShow: Subject<any> = new Subject();

	public get hasTimeout(): boolean { return !!this._showTimeoutId || !!this._hideTimeoutId; }

	constructor(
		private _cdr: ChangeDetectorRef,
	) { }

	ngOnDestroy() {
		this._onHide.complete();
		this._onShow.complete();
	}

	/**
	 * Shows the tooltip with an animation originating from the provided origin
	 * @param delay Amount of milliseconds to the delay showing the tooltip.
	 */
	public show(delay: number): void {
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
		}, delay) as any as number;
	}

	/**
	 * Begins the animation to hide the tooltip after the provided delay in ms.
	 * @param delay Amount of milliseconds to delay showing the tooltip.
	 */
	public hide(delay: number): void {
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
		}, delay) as any as number;
	}

	/** Returns an observable that notifies when the tooltip has been hidden from view. */
	public afterHidden(): Observable<void> {
		return this._onHide.asObservable();
	}

	/** Returns an observable that notifies when the tooltip has been made visible. */
	public afterVisible(): Observable<void> {
		return this._onShow.asObservable();
	}

	/** Whether the tooltip is being displayed. */
	public isVisible(): boolean {
		return this._visibility === 'visible';
	}

	public markForCheck(): void {
		this._cdr.markForCheck();
	}
}

export type TooltipVisibility = 'initial' | 'visible' | 'hidden';

function getNubbinPosition(position: ConnectedPosition): string {
	const positions: string[] = [];

	if (position.originY !== 'center') { // TopBottom
		positions.push(position.originY === 'bottom' ? 'top' : 'bottom');

		if (position.overlayX !== 'center') {
			positions.push(position.overlayX === 'start' ? 'left' : 'right');
		}
	} else { // Left/Right
		positions.push(position.originX === 'end' ? 'left' : 'right');

		if (position.overlayY !== 'center') {
			positions.push(position.overlayY);
		}
	}

	return (positions.length ? positions.join('-') : null as any);
}
