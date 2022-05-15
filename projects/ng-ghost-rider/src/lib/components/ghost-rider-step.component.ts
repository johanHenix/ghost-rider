import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { GhostRiderStepConfig } from '../models/ghost-rider-step-config.model';
import { GhostRiderEventSource } from '../models/ghost-rider-step-event.model';
import { GhostRiderNavigation, GHOST_RIDER_NAVIGATION } from '../providers/ghost-rider-navigation.token';
import { PopoverComponent } from './popover.component';

@Component({
	selector: 'ghost-rider-step',
	template: `
		<div
			class="slds-popover"
			[ngClass]="nubbinCls"
			role="dialog"
		>
			<h1>{{ details.title }}</h1>
			<button (click)="back()">Back</button>
			<button (click)="next()">Next</button>
		</div>
	`,
	styles: [],
})
export class GhostRiderStepComponent extends PopoverComponent {
	// @ts-ignore
	public details: GhostRiderStepConfig;

	constructor(
		@Inject(GHOST_RIDER_NAVIGATION) private readonly _navigation: GhostRiderNavigation,
		cdr: ChangeDetectorRef,
	) {
		super(cdr);
	}

	public next(): void {
		if (this.details.nextIsHide) {
			this._navigation.hideStep();
		} else {
			this._navigation.next(GhostRiderEventSource.Popover);
		}
	}

	public back(): void {
		this._navigation.back(GhostRiderEventSource.Popover);
	}
}