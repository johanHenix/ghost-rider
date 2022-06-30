/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Adapted from @angular/material "TooltipComponent"
import { Component } from '@angular/core';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/cdk/portal";
export class PopoverComponent {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZy1naG9zdC1yaWRlci9zcmMvbGliL2NvbXBvbmVudHMvcG9wb3Zlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsb0RBQW9EO0FBRXBELE9BQU8sRUFBcUIsU0FBUyxFQUFhLE1BQU0sZUFBZSxDQUFDO0FBRXhFLE9BQU8sRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDdEUsT0FBTyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQzs7OztBQTBCM0MsTUFBTSxPQUFPLGdCQUFnQjtJQWdENUIsWUFDUyxJQUF1QjtRQUF2QixTQUFJLEdBQUosSUFBSSxDQUFtQjtRQVpoQyw4RUFBOEU7UUFDdEUsZ0JBQVcsR0FBc0IsU0FBUyxDQUFDO1FBRW5ELDJFQUEyRTtRQUMxRCxZQUFPLEdBQWlCLElBQUksT0FBTyxFQUFFLENBQUM7UUFFdkQsbUVBQW1FO1FBQ2xELFlBQU8sR0FBaUIsSUFBSSxPQUFPLEVBQUUsQ0FBQztJQU1uRCxDQUFDO0lBakRMLElBQVcsT0FBTyxDQUFDLE9BQTBCO1FBQzVDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUM1RCxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTtZQUNoQyxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQztTQUMzQjthQUFNLElBQUksT0FBTyxZQUFZLGNBQWMsRUFBRTtZQUM3QyxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQztTQUMxQjthQUFNLElBQUksT0FBTyxZQUFZLGVBQWUsRUFBRTtZQUM5QyxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQztTQUMxQjtJQUNGLENBQUM7SUFZ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QXFCO29CQUMvQixRQUFRLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQWtCVDtpQkFDRDs7QUE0SEQsU0FBUyxpQkFBaUIsQ0FBQyxRQUEyQjtJQUNyRCxNQUFNLFNBQVMsR0FBYSxFQUFFLENBQUM7SUFFL0IsSUFBSSxRQUFRLENBQUMsT0FBTyxLQUFLLFFBQVEsRUFBRSxFQUFFLFlBQVk7UUFDaEQsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVqRSxJQUFJLFFBQVEsQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFO1lBQ25DLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDakU7S0FDRDtTQUFNLEVBQUUsYUFBYTtRQUNyQixTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTlELElBQUksUUFBUSxDQUFDLFFBQVEsS0FBSyxRQUFRLEVBQUU7WUFDbkMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDbEM7S0FDRDtJQUVELE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFXLENBQUMsQ0FBQztBQUMvRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG4vLyBBZGFwdGVkIGZyb20gQGFuZ3VsYXIvbWF0ZXJpYWwgXCJUb29sdGlwQ29tcG9uZW50XCJcblxuaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb25uZWN0ZWRQb3NpdGlvbiB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7IENvbXBvbmVudFBvcnRhbCwgVGVtcGxhdGVQb3J0YWwgfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuZXhwb3J0IHR5cGUgUG9wb3ZlckNvbnRlbnQ8VD4gPSBUIGV4dGVuZHMgc3RyaW5nID8gc3RyaW5nIDogQ29tcG9uZW50UG9ydGFsPFQ+IHwgVGVtcGxhdGVQb3J0YWw8VD47XG5cbkBDb21wb25lbnQoe1xuXHRzZWxlY3RvcjogJ2dob3N0LXJpZGVyLXBvcG92ZXInLFxuXHR0ZW1wbGF0ZTogYFxuXHRcdDxkaXZcblx0XHRcdGNsYXNzPVwiZ2hvc3QtcmlkZXItcG9wb3ZlclwiXG5cdFx0XHRbbmdDbGFzc109XCJudWJiaW5DbHNcIlxuXHRcdFx0W2NsYXNzLmdob3N0LXJpZGVyLXBvcG92ZXJfdG9vbHRpcF09XCJpc1Rvb2x0aXBcIlxuXHRcdFx0W2F0dHIucm9sZV09XCJpc1Rvb2x0aXAgPyAndG9vbHRpcCcgOiAnZGlhbG9nJ1wiXG5cdFx0PlxuXHRcdFx0PGRpdiBjbGFzcz1cImdob3N0LXJpZGVyLXBvcG92ZXJfX2JvZHlcIj5cblx0XHRcdFx0PG5nLWNvbnRhaW5lciBbY2RrUG9ydGFsT3V0bGV0XT1cImNvbnRlbnRDbXAgfHwgY29udGVudFRwbCB8fCBjb250ZW50VGV4dFRwbFwiPjwvbmctY29udGFpbmVyPlxuXHRcdFx0PC9kaXY+XG5cdFx0PC9kaXY+XG5cblx0XHQ8bmctdGVtcGxhdGVcblx0XHRcdGNka1BvcnRhbFxuXHRcdFx0I2NvbnRlbnRUZXh0VHBsPVwiY2RrUG9ydGFsXCJcblx0XHQ+XG5cdFx0XHR7eyBjb250ZW50VGV4dCB9fVxuXHRcdDwvbmctdGVtcGxhdGU+XG5cdGAsXG59KVxuZXhwb3J0IGNsYXNzIFBvcG92ZXJDb21wb25lbnQ8VCA9IGFueT4gaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuXHRwdWJsaWMgc2V0IGNvbnRlbnQoY29udGVudDogUG9wb3ZlckNvbnRlbnQ8VD4pIHtcblx0XHR0aGlzLmNvbnRlbnRUZXh0ID0gdGhpcy5jb250ZW50VHBsID0gdGhpcy5jb250ZW50Q21wID0gbnVsbDtcblx0XHRpZiAodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHR0aGlzLmNvbnRlbnRUZXh0ID0gY29udGVudDtcblx0XHR9IGVsc2UgaWYgKGNvbnRlbnQgaW5zdGFuY2VvZiBUZW1wbGF0ZVBvcnRhbCkge1xuXHRcdFx0dGhpcy5jb250ZW50VHBsID0gY29udGVudDtcblx0XHR9IGVsc2UgaWYgKGNvbnRlbnQgaW5zdGFuY2VvZiBDb21wb25lbnRQb3J0YWwpIHtcblx0XHRcdHRoaXMuY29udGVudENtcCA9IGNvbnRlbnQ7XG5cdFx0fVxuXHR9XG5cblx0Ly8gdG9kbyBGSVggVFlQRVMgJ2FueSdcblx0cHVibGljIGNvbnRlbnRDbXA6IENvbXBvbmVudFBvcnRhbDxUPiB8IGFueTtcblx0cHVibGljIGNvbnRlbnRUcGw6IFRlbXBsYXRlUG9ydGFsPFQ+IHwgYW55OyAvLyBUT0RPOiBBZGQgYWJpbGl0eSB0byBjb25maWd1cmUgY29udGV4dFxuXHRwdWJsaWMgY29udGVudFRleHQ6IHN0cmluZyB8IGFueTtcblxuXHRwdWJsaWMgbnViYmluQ2xzOiBzdHJpbmc7XG5cblx0cHVibGljIGlzVG9vbHRpcDogYm9vbGVhbjtcblxuXHRwcml2YXRlIF9wb3NpdGlvbjogQ29ubmVjdGVkUG9zaXRpb247XG5cdHB1YmxpYyBnZXQgcG9zaXRpb24oKTogQ29ubmVjdGVkUG9zaXRpb24geyByZXR1cm4gdGhpcy5fcG9zaXRpb247IH1cblx0cHVibGljIHNldCBwb3NpdGlvbihwb3M6IENvbm5lY3RlZFBvc2l0aW9uKSB7XG5cdFx0aWYgKHBvcyAhPT0gdGhpcy5fcG9zaXRpb24pIHtcblx0XHRcdHRoaXMuX3Bvc2l0aW9uID0gcG9zO1xuXHRcdFx0dGhpcy5udWJiaW5DbHMgPSBwb3MgPyBgZ2hvc3QtcmlkZXItbnViYmluXyR7Z2V0TnViYmluUG9zaXRpb24ocG9zKX1gIDogbnVsbCBhcyB1bmtub3duIGFzIHN0cmluZztcblx0XHRcdHRoaXMuX2Nkci5tYXJrRm9yQ2hlY2soKTtcblx0XHR9XG5cdH1cblxuXHQvKiogVGhlIHRpbWVvdXQgSUQgb2YgYW55IGN1cnJlbnQgdGltZXIgc2V0IHRvIHNob3cgdGhlIHRvb2x0aXAgKi9cblx0cHJpdmF0ZSBfc2hvd1RpbWVvdXRJZDogbnVtYmVyIHwgbnVsbDtcblxuXHQvKiogVGhlIHRpbWVvdXQgSUQgb2YgYW55IGN1cnJlbnQgdGltZXIgc2V0IHRvIGhpZGUgdGhlIHRvb2x0aXAgKi9cblx0cHJpdmF0ZSBfaGlkZVRpbWVvdXRJZDogbnVtYmVyIHwgbnVsbDtcblxuXHQvKiogUHJvcGVydHkgd2F0Y2hlZCBieSB0aGUgYW5pbWF0aW9uIGZyYW1ld29yayB0byBzaG93IG9yIGhpZGUgdGhlIHRvb2x0aXAgKi9cblx0cHJpdmF0ZSBfdmlzaWJpbGl0eTogVG9vbHRpcFZpc2liaWxpdHkgPSAnaW5pdGlhbCc7XG5cblx0LyoqIFN1YmplY3QgZm9yIG5vdGlmeWluZyB0aGF0IHRoZSB0b29sdGlwIGhhcyBiZWVuIGhpZGRlbiBmcm9tIHRoZSB2aWV3ICovXG5cdHByaXZhdGUgcmVhZG9ubHkgX29uSGlkZTogU3ViamVjdDxhbnk+ID0gbmV3IFN1YmplY3QoKTtcblxuXHQvKiogU3ViamVjdCBmb3Igbm90aWZ5aW5nIHRoYXQgdGhlIHRvb2x0aXAgaGFzIGJlZW4gbWFkZSB2aXNpYmxlICovXG5cdHByaXZhdGUgcmVhZG9ubHkgX29uU2hvdzogU3ViamVjdDxhbnk+ID0gbmV3IFN1YmplY3QoKTtcblxuXHRwdWJsaWMgZ2V0IGhhc1RpbWVvdXQoKTogYm9vbGVhbiB7IHJldHVybiAhIXRoaXMuX3Nob3dUaW1lb3V0SWQgfHwgISF0aGlzLl9oaWRlVGltZW91dElkOyB9XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSBfY2RyOiBDaGFuZ2VEZXRlY3RvclJlZixcblx0KSB7IH1cblxuXHRuZ09uRGVzdHJveSgpIHtcblx0XHR0aGlzLl9vbkhpZGUuY29tcGxldGUoKTtcblx0XHR0aGlzLl9vblNob3cuY29tcGxldGUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTaG93cyB0aGUgdG9vbHRpcCB3aXRoIGFuIGFuaW1hdGlvbiBvcmlnaW5hdGluZyBmcm9tIHRoZSBwcm92aWRlZCBvcmlnaW5cblx0ICogQHBhcmFtIGRlbGF5IEFtb3VudCBvZiBtaWxsaXNlY29uZHMgdG8gdGhlIGRlbGF5IHNob3dpbmcgdGhlIHRvb2x0aXAuXG5cdCAqL1xuXHRwdWJsaWMgc2hvdyhkZWxheTogbnVtYmVyKTogdm9pZCB7XG5cdFx0Ly8gQ2FuY2VsIHRoZSBkZWxheWVkIGhpZGUgaWYgaXQgaXMgc2NoZWR1bGVkXG5cdFx0aWYgKHRoaXMuX2hpZGVUaW1lb3V0SWQpIHtcblx0XHRcdGNsZWFyVGltZW91dCh0aGlzLl9oaWRlVGltZW91dElkKTtcblx0XHRcdHRoaXMuX2hpZGVUaW1lb3V0SWQgPSBudWxsO1xuXHRcdH1cblxuXHRcdHRoaXMuX3Nob3dUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdHRoaXMuX3Zpc2liaWxpdHkgPSAndmlzaWJsZSc7XG5cdFx0XHR0aGlzLl9zaG93VGltZW91dElkID0gbnVsbDtcblx0XHRcdHRoaXMuX29uU2hvdy5uZXh0KG51bGwpO1xuXG5cdFx0XHQvLyBNYXJrIGZvciBjaGVjayBzbyBpZiBhbnkgcGFyZW50IGNvbXBvbmVudCBoYXMgc2V0IHRoZVxuXHRcdFx0Ly8gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgdG8gT25QdXNoIGl0IHdpbGwgYmUgY2hlY2tlZCBhbnl3YXlzXG5cdFx0XHR0aGlzLl9jZHIubWFya0ZvckNoZWNrKCk7XG5cdFx0fSwgZGVsYXkpIGFzIGFueSBhcyBudW1iZXI7XG5cdH1cblxuXHQvKipcblx0ICogQmVnaW5zIHRoZSBhbmltYXRpb24gdG8gaGlkZSB0aGUgdG9vbHRpcCBhZnRlciB0aGUgcHJvdmlkZWQgZGVsYXkgaW4gbXMuXG5cdCAqIEBwYXJhbSBkZWxheSBBbW91bnQgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5IHNob3dpbmcgdGhlIHRvb2x0aXAuXG5cdCAqL1xuXHRwdWJsaWMgaGlkZShkZWxheTogbnVtYmVyKTogdm9pZCB7XG5cdFx0Ly8gQ2FuY2VsIHRoZSBkZWxheWVkIHNob3cgaWYgaXQgaXMgc2NoZWR1bGVkXG5cdFx0aWYgKHRoaXMuX3Nob3dUaW1lb3V0SWQpIHtcblx0XHRcdGNsZWFyVGltZW91dCh0aGlzLl9zaG93VGltZW91dElkKTtcblx0XHRcdHRoaXMuX3Nob3dUaW1lb3V0SWQgPSBudWxsO1xuXHRcdH1cblxuXHRcdHRoaXMuX2hpZGVUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdHRoaXMuX3Zpc2liaWxpdHkgPSAnaGlkZGVuJztcblx0XHRcdHRoaXMuX2hpZGVUaW1lb3V0SWQgPSBudWxsO1xuXHRcdFx0dGhpcy5fb25IaWRlLm5leHQobnVsbCk7XG5cblx0XHRcdC8vIE1hcmsgZm9yIGNoZWNrIHNvIGlmIGFueSBwYXJlbnQgY29tcG9uZW50IGhhcyBzZXQgdGhlXG5cdFx0XHQvLyBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSB0byBPblB1c2ggaXQgd2lsbCBiZSBjaGVja2VkIGFueXdheXNcblx0XHRcdHRoaXMuX2Nkci5tYXJrRm9yQ2hlY2soKTtcblx0XHR9LCBkZWxheSkgYXMgYW55IGFzIG51bWJlcjtcblx0fVxuXG5cdC8qKiBSZXR1cm5zIGFuIG9ic2VydmFibGUgdGhhdCBub3RpZmllcyB3aGVuIHRoZSB0b29sdGlwIGhhcyBiZWVuIGhpZGRlbiBmcm9tIHZpZXcuICovXG5cdHB1YmxpYyBhZnRlckhpZGRlbigpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcblx0XHRyZXR1cm4gdGhpcy5fb25IaWRlLmFzT2JzZXJ2YWJsZSgpO1xuXHR9XG5cblx0LyoqIFJldHVybnMgYW4gb2JzZXJ2YWJsZSB0aGF0IG5vdGlmaWVzIHdoZW4gdGhlIHRvb2x0aXAgaGFzIGJlZW4gbWFkZSB2aXNpYmxlLiAqL1xuXHRwdWJsaWMgYWZ0ZXJWaXNpYmxlKCk6IE9ic2VydmFibGU8dm9pZD4ge1xuXHRcdHJldHVybiB0aGlzLl9vblNob3cuYXNPYnNlcnZhYmxlKCk7XG5cdH1cblxuXHQvKiogV2hldGhlciB0aGUgdG9vbHRpcCBpcyBiZWluZyBkaXNwbGF5ZWQuICovXG5cdHB1YmxpYyBpc1Zpc2libGUoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX3Zpc2liaWxpdHkgPT09ICd2aXNpYmxlJztcblx0fVxuXG5cdHB1YmxpYyBtYXJrRm9yQ2hlY2soKTogdm9pZCB7XG5cdFx0dGhpcy5fY2RyLm1hcmtGb3JDaGVjaygpO1xuXHR9XG59XG5cbmV4cG9ydCB0eXBlIFRvb2x0aXBWaXNpYmlsaXR5ID0gJ2luaXRpYWwnIHwgJ3Zpc2libGUnIHwgJ2hpZGRlbic7XG5cbmZ1bmN0aW9uIGdldE51YmJpblBvc2l0aW9uKHBvc2l0aW9uOiBDb25uZWN0ZWRQb3NpdGlvbik6IHN0cmluZyB7XG5cdGNvbnN0IHBvc2l0aW9uczogc3RyaW5nW10gPSBbXTtcblxuXHRpZiAocG9zaXRpb24ub3JpZ2luWSAhPT0gJ2NlbnRlcicpIHsgLy8gVG9wQm90dG9tXG5cdFx0cG9zaXRpb25zLnB1c2gocG9zaXRpb24ub3JpZ2luWSA9PT0gJ2JvdHRvbScgPyAndG9wJyA6ICdib3R0b20nKTtcblxuXHRcdGlmIChwb3NpdGlvbi5vdmVybGF5WCAhPT0gJ2NlbnRlcicpIHtcblx0XHRcdHBvc2l0aW9ucy5wdXNoKHBvc2l0aW9uLm92ZXJsYXlYID09PSAnc3RhcnQnID8gJ2xlZnQnIDogJ3JpZ2h0Jyk7XG5cdFx0fVxuXHR9IGVsc2UgeyAvLyBMZWZ0L1JpZ2h0XG5cdFx0cG9zaXRpb25zLnB1c2gocG9zaXRpb24ub3JpZ2luWCA9PT0gJ2VuZCcgPyAnbGVmdCcgOiAncmlnaHQnKTtcblxuXHRcdGlmIChwb3NpdGlvbi5vdmVybGF5WSAhPT0gJ2NlbnRlcicpIHtcblx0XHRcdHBvc2l0aW9ucy5wdXNoKHBvc2l0aW9uLm92ZXJsYXlZKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gKHBvc2l0aW9ucy5sZW5ndGggPyBwb3NpdGlvbnMuam9pbignLScpIDogbnVsbCBhcyBhbnkpO1xufVxuIl19