import { Injector, OnDestroy, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { GhostRiderTourGuide } from '../helpers/ghost-rider-tour-guide';
import { GhostRiderEvent, GhostRiderEventSource, GhostRiderEventType } from '../models/ghost-rider-step-event.model';
import { GhostRiderStepDetails } from '../models/ghost-rider-step-details.model';
import { GhostRiderStep } from '../models/ghost-rider-step.model';
import * as i0 from "@angular/core";
/**
 * Service to control guided tours and walkthrough steps
 */
export declare class GhostRiderService implements OnDestroy {
    private readonly _injector;
    private readonly _stepAdded$;
    private readonly _subs;
    private readonly _steps;
    private readonly _popoverFactory;
    private readonly _renderer;
    private _tourGuide;
    private _activePopover;
    private _isAsync;
    private _hideStep;
    private _removeWindowHandler;
    readonly activeTour$: BehaviorSubject<boolean>;
    events$: Subject<GhostRiderEvent>;
    get activeTour(): boolean;
    get tourGuide(): GhostRiderTourGuide;
    constructor(_injector: Injector, rendererFactory: RendererFactory2);
    ngOnDestroy(): void;
    /**
     * Adds a new step to the tour
     * @param step The step to add to the tour
     */
    registerStep(step: GhostRiderStepDetails): void;
    /**
     * Removes the step from the '_steps' map
     * @param step The step to remove from the map
     */
    unregisterStep(step: GhostRiderStepDetails): void;
    /**
     * Starts the tour at from the first step
     * @param tourNamespace String to distinguish different tour contexts (becomes a prefix to all steps)
     * @param steps List of tour steps in the order in which they should go
     */
    start(tourNamespace: string, steps: GhostRiderStep[]): void;
    /**
     * Pauses the tour on the active step
     */
    pause(): void;
    /**
     * Resumes the tour from the active step
     */
    resume(): void;
    /**
     * Goes to a parent step from any sub step
     * @param source The source value that caused this to be called
     */
    goToParent(source?: GhostRiderEventSource): void;
    /**
     * Goes to the next step
     * @param source The source value that caused this to be called
     */
    next(source?: GhostRiderEventSource): void;
    /**
     * Goes to the previous step
     * @param source The source value that caused this to be called
     */
    back(source?: GhostRiderEventSource): void;
    /**
     * Goes to the next sub step
     * @param source The source value that caused this to be called
     */
    nextSubStep(source?: GhostRiderEventSource): void;
    /**
     * Goes to the previous sub step
     * @param source The source value that caused this to be called
     */
    previousSubStep(source?: GhostRiderEventSource): void;
    /**
     * Closes the tour, but with a more descriptive event
     * @param source The source value that caused this to be called
     */
    complete(source?: GhostRiderEventSource): void;
    /**
     * Ends the tour
     * @param source The source value that caused this to be called
     * @param type The event type to use for the emitted event
     */
    close(source?: GhostRiderEventSource, type?: GhostRiderEventType): void;
    /**
     * Calls the dynamic '_hideStep' prop function to remove a popover step from the UI
     */
    hideStep(): Observable<void>;
    /**
     * Repositions the window and the popover manually
     */
    tidy(): void;
    /**
     * Updates the active popover's overlay position
     */
    updatePosition(): void;
    /**
     * Updates the positions of the clip paths for the target element
     */
    updateWindow(): void;
    /**
     * Removes backdrop and clip path divs for the active step
     */
    removeWindow(): void;
    /**
     * Finds the step to show if it exists or when it is dynamically registered from the subject
     * @param event Optional event object to emit
     */
    private _goToStep;
    /**
     * Destroys the active popover and creates the new popover for the desired step
     */
    private _showStep;
    /**
     * Creates the clip path in the backdrop and an inner inset clip path to round the edges
     *
     * TODO: fix the slight edges that are showing between the inner and outter clip paths
     * @param rect The rectangle dimensions to clip
     * @param overlayRef The overlay element
     */
    private _buildWindow;
    /**
     * Removes the custom backdrop styles and inset clip path div
     * @param backdrop The backdrop overlay element
     */
    private _removeWindow;
    static ɵfac: i0.ɵɵFactoryDeclaration<GhostRiderService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<GhostRiderService>;
}
