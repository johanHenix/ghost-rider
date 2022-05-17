import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { GhostRiderStepConfig } from '../models/ghost-rider-step-config.model';
import { GhostRiderEventSource } from '../models/ghost-rider-step-event.model';
import { GhostRiderNavigation, GHOST_RIDER_NAVIGATION } from '../providers/ghost-rider-navigation.token';
import { PopoverComponent } from './popover.component';

@Component({
	selector: 'ghost-rider-step',
	template: `
		<div
			class="ghost-rider-popover"
			[ngClass]="nubbinCls"
			role="dialog"
		>
			<h1>{{ details.title }}</h1>
			<p>{{ details.content }}</p>
			<button (click)="close()">Close</button>
			<button (click)="back()">Back</button>
			<button (click)="next()">Next</button>
		</div>
	`,
	styles: [],
})
export class GhostRiderStepComponent extends PopoverComponent {
	// @ts-ignore
	public stepIndex: number;
	public stepCount: number;
	public stepName: string;
	public isLastStep: boolean;
	public hasSubSteps: boolean;
	// @ts-ignore
	public details: GhostRiderStepConfig;

	public readonly isSubStep: boolean;

	constructor(
		@Inject(GHOST_RIDER_NAVIGATION) private readonly _navigation: GhostRiderNavigation,
		cdr: ChangeDetectorRef,
	) {
		super(cdr);

		this.isSubStep = !!this._navigation.tourGuide.activeStep.parent;
		this.stepName = this._navigation.tourGuide.activeStep.name;
		this.hasSubSteps = this._navigation.tourGuide.activeStep.hasSubSteps;

		if (this.isSubStep) {
			// @ts-ignore
			const siblings = this._navigation.tourGuide.activeStep.parent.subSteps;
			this.stepIndex = siblings.indexOf(this._navigation.tourGuide.activeStep);
			this.stepCount = siblings.length;
		} else {
			this.stepIndex = this._navigation.tourGuide.currentStep;
			this.stepCount = this._navigation.tourGuide.steps.length;
		}

		this.isLastStep = this.stepIndex === this.stepCount - 1;
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public next(): void {
		if (this.details.nextIsHide) {
			this._navigation.hideStep();
		} else {
			this._navigation.next(GhostRiderEventSource.Popover);
		}
	}

	public nextSubStep(): void {
		this._navigation.nextSubStep(GhostRiderEventSource.Popover);
	}

	public previousSubStep(): void {
		this._navigation.previousSubStep(GhostRiderEventSource.Popover);
	}

	public goToParent(): void {
		this._navigation.goToParent(GhostRiderEventSource.Popover);
	}

	public back(): void {
		this._navigation.back(GhostRiderEventSource.Popover);
	}

	public close(): void {
		this._navigation.close(GhostRiderEventSource.Popover);
	}

	public complete(): void {
		this._navigation.complete(GhostRiderEventSource.Popover);
	}
}