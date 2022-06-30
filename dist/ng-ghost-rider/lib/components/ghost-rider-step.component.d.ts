import { ChangeDetectorRef } from '@angular/core';
import { GhostRiderNavigation } from '../models/ghost-rider-navigation.model';
import { GhostRiderStepConfig } from '../models/ghost-rider-step-config.model';
import { PopoverComponent } from './popover.component';
import * as i0 from "@angular/core";
export declare class GhostRiderStepComponent extends PopoverComponent {
    private readonly _navigation;
    stepIndex: number;
    stepCount: number;
    stepName: string;
    isLastStep: boolean;
    hasSubSteps: boolean;
    details: GhostRiderStepConfig;
    readonly isSubStep: boolean;
    constructor(_navigation: GhostRiderNavigation, cdr: ChangeDetectorRef);
    ngOnDestroy(): void;
    next(): void;
    nextSubStep(): void;
    previousSubStep(): void;
    goToParent(): void;
    back(): void;
    close(): void;
    complete(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<GhostRiderStepComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<GhostRiderStepComponent, "ghost-rider-step", never, {}, {}, never, never, false>;
}
