import { GhostRiderStep } from '../models/ghost-rider-step.model';
export declare class GhostRiderTourGuide {
    readonly tourNamespace: string;
    readonly steps: GhostRiderStep[];
    activeStep: GhostRiderStep;
    currentStep: number;
    constructor(tourNamespace: string, steps: GhostRiderStep[]);
    /**
     * Sets the active step to the next 'Parent' step that is visible
     */
    getNextStep(): GhostRiderStep;
    /**
     * Sets the active step to the next sub step in the order
     */
    getNextSubStep(): GhostRiderStep;
    /**
     * Sets the active step to the previous 'Parent' step that is visible
     */
    getPreviousStep(): GhostRiderStep;
    /**
     * Sets the active step to the previous sub step that is visible
     */
    getPreviousSubStep(): GhostRiderStep;
}
