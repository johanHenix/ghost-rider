import { GhostRiderStep } from '../models/ghost-rider-step.model';

export class GhostRiderTourGuide {
	public activeStep: GhostRiderStep;
	public currentStep: number = 0;

	constructor(
		public readonly tourNamespace: string,
		public readonly steps: GhostRiderStep[],
	) {
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
	public getNextStep(): GhostRiderStep {
		const startingStep: GhostRiderStep = this.activeStep;
		do {
			if (this.steps[this.currentStep + 1]) {
				this.currentStep++;
				this.activeStep = this.steps[this.currentStep];
			} else {
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
	public getNextSubStep(): GhostRiderStep {
		if (this.activeStep.hasSubSteps) {
			this.activeStep = this.activeStep.subSteps[0];
		} else if (this.activeStep.parent) {
			const siblings = this.activeStep.parent.subSteps;
			this.activeStep = siblings[siblings.indexOf(this.activeStep) + 1];
		}
		return this.activeStep;
	}

	/**
	 * Sets the active step to the previous 'Parent' step that is visible
	 */
	public getPreviousStep(): GhostRiderStep {
		const startingStep: GhostRiderStep = this.activeStep;
		do {
			if (this.steps[this.currentStep - 1]) {
				this.currentStep--;
				this.activeStep = this.steps[this.currentStep];
			} else {
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
	public getPreviousSubStep(): GhostRiderStep {
		const siblings = this.activeStep.parent!.subSteps;
		const previous = siblings.indexOf(this.activeStep) - 1;
		if (siblings[previous]) {
			this.activeStep = siblings[previous];
		} else if (this.activeStep.parent) {
			this.activeStep = this.activeStep.parent;
		}
		return this.activeStep;
	}
}
