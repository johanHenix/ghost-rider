import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { GhostRiderNavigation } from '../../models/ghost-rider-navigation.model';
import { GhostRiderStepConfig } from '../../models/ghost-rider-step-config.model';
import { GhostRiderEventSource } from '../../models/ghost-rider-step-event.model';
import { GHOST_RIDER_NAVIGATION } from '../../tokens/ghost-rider-navigation.token';
import { PopoverComponent } from './../popover.component';

/**
 * Component that renders the step that the user sees
 */
@Component({
	selector: 'ghost-rider-step',
	templateUrl: 'ghost-rider-step.component.html',
	styles: [],
})
export class GhostRiderStepComponent extends PopoverComponent {

	/**
	 * This is the index of the current step
	 */
	public stepIndex: number;

	/**
	 * This is the total number of tour steps registered in the tour
	 */
	public stepCount: number; // TODO: make this 'readonly'?!?!

	/**
	 * Name to give the tour step
	 */
	public stepName: string;

	/**
	 * Flag for the last step
	 */
	public isLastStep: boolean;

	/**
	 * Flag if the 'Master / Overall' Tour has sub steps
	*/
	public hasSubSteps: boolean;

	/**
	 * Flag if this current step in the tour is a sub-step
	 */
	public readonly isSubStep: boolean;

	/**
	 * Holds the details for the 'GhostRiderStepComponent' details prop
	 */
	public details: GhostRiderStepConfig;

	constructor(
		@Inject(GHOST_RIDER_NAVIGATION) private readonly _navigation: GhostRiderNavigation,
		cdr: ChangeDetectorRef,
	) {
		super(cdr);

		// Flag if the current step is a 'sub step'
		this.isSubStep = !!this._navigation.tourGuide.activeStep.parent;
		// Sets the name of the 'step'
		this.stepName = this._navigation.tourGuide.activeStep.name;
		// Flag if the current step has 'sub steps'
		this.hasSubSteps = this._navigation.tourGuide.activeStep.hasSubSteps;

		if (this.isSubStep) {
			const siblings = this._navigation.tourGuide.activeStep.parent?.subSteps;
			if (siblings) {
				this.stepIndex = siblings.indexOf(this._navigation.tourGuide.activeStep);
				this.stepCount = siblings.length;
			}
		} else {
			this.stepIndex = this._navigation.tourGuide.currentStep;
			this.stepCount = this._navigation.tourGuide.steps.length;
		}

		// Set prop if this is the last step or not
		this.isLastStep = this.stepIndex === this.stepCount - 1;
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	/**
	 * Goes to the next step from 'this' current step
	 */
	public next(): void {
		if (this.details.nextIsHide) {
			this._navigation.hideStep();
		} else {
			this._navigation.next(GhostRiderEventSource.Popover);
		}
	}

	/**
	 * Calls the next step
	 */
	public nextSubStep(): void {
		this._navigation.nextSubStep(GhostRiderEventSource.Popover);
	}

	/**
	 * Goes to the previous step
	 */
	public previousSubStep(): void {
		this._navigation.previousSubStep(GhostRiderEventSource.Popover);
	}

	/**
	 * Goes to a parent step from any sub step
	 */
	public goToParent(): void {
		this._navigation.goToParent(GhostRiderEventSource.Popover);
	}

	/**
	 * Goes to the previous step
	 */
	public back(): void {
		this._navigation.back(GhostRiderEventSource.Popover);
	}

	/**
	 * Ends the tour
	 */
	public close(): void {
		this._navigation.close(GhostRiderEventSource.Popover);
	}

	/**
	 * Closes the tour, but with a more descriptive event
	  */
	public complete(): void {
		this._navigation.complete(GhostRiderEventSource.Popover);
	}
}