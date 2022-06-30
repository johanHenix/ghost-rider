import { Injectable } from '@angular/core';
import { BehaviorSubject, defer, of, Subject } from 'rxjs';
import { first, last, startWith } from 'rxjs/operators';
import { GhostRiderPopoverFactory } from './ghost-rider-popover-factory.service';
import { GhostRiderStepComponent } from '../components/ghost-rider-step.component';
import { GhostRiderTourGuide } from '../helpers/ghost-rider-tour-guide';
import { GhostRiderEventSource, GhostRiderEventType } from '../models/ghost-rider-step-event.model';
import * as i0 from "@angular/core";
/**
 * Used for the '_subs' map prop keys
 */
var SubKeys;
(function (SubKeys) {
    SubKeys["StepAdded"] = "stepAdded";
    SubKeys["Events"] = "events";
})(SubKeys || (SubKeys = {}));
const ACTIVE_TARGET_CLASS = `ghost-rider-walkthrough-step_active`;
/**
 * Service to control guided tours and walkthrough steps
 */
export class GhostRiderService {
    constructor(_injector, rendererFactory) {
        this._injector = _injector;
        this._stepAdded$ = new Subject();
        // Add keys to the 'SubKeys' enum pleez
        this._subs = new Map();
        this._steps = new Map(); // name => step
        // TODO: Implement an optional UI masking element to override clicks from the user
        // private _uiMask: HTMLDivElement | null;
        this._isAsync = false; // Flag to use asynchronous or synchronous methods
        // Flag that the tour is in flight. Once the tour is closed or skipped, this will be false
        this.activeTour$ = new BehaviorSubject(false);
        this.events$ = new Subject();
        this._popoverFactory = new GhostRiderPopoverFactory(this._injector);
        this._renderer = rendererFactory.createRenderer(null, null);
        /**
         * When there are step events, emit the event from the step's 'GhostRiderStepEvent'
         * output so we can react to event from specific components
         */
        this._subs.set(SubKeys.Events, this.events$.subscribe((event) => {
            if (this._steps.has(event.name)) {
                this._steps.get(event.name)?.ghostRiderStepEvent.emit(event);
            }
        }));
    }
    get activeTour() {
        return this.activeTour$.value;
    }
    get tourGuide() {
        return this._tourGuide;
    }
    ngOnDestroy() {
        this._stepAdded$.complete();
        this._stepAdded$.unsubscribe();
        this.activeTour$.complete();
        this.activeTour$.unsubscribe();
        this.events$.complete();
        this.events$.unsubscribe();
        this._subs.forEach((sub) => sub.unsubscribe());
    }
    /**
     * Adds a new step to the tour
     * @param step The step to add to the tour
     */
    registerStep(step) {
        if (!this._steps.has(step.config.name)) {
            this._steps.set(step.config.name, step);
        }
        this._stepAdded$.next(step.config.name);
    }
    /**
     * Removes the step from the '_steps' map
     * @param step The step to remove from the map
     */
    unregisterStep(step) {
        if (this._steps.has(step.config.name) && this._steps.get(step.config.name) === step) {
            this._steps.delete(step.config.name);
        }
    }
    /**
     * Starts the tour at from the first step
     * @param tourNamespace String to distinguish different tour contexts (becomes a prefix to all steps)
     * @param steps List of tour steps in the order in which they should go
     */
    start(tourNamespace, steps) {
        tourNamespace = tourNamespace ? tourNamespace + '.' : '';
        this.activeTour$.next(true);
        this.events$.next({
            type: GhostRiderEventType.Start,
            name: tourNamespace,
            source: GhostRiderEventSource.Manual,
        });
        this._tourGuide = new GhostRiderTourGuide(tourNamespace, steps);
        this._goToStep();
    }
    /**
     * Pauses the tour on the active step
     */
    pause() {
        if (this.activeTour) {
            this.hideStep();
        }
    }
    /**
     * Resumes the tour from the active step
     */
    resume() {
        if (this.activeTour) {
            this._goToStep();
        }
    }
    /**
     * Goes to a parent step from any sub step
     * @param source The source value that caused this to be called
     */
    goToParent(source = GhostRiderEventSource.Manual) {
        if (this.activeTour) {
            const { name } = this._tourGuide.activeStep;
            this.tourGuide.activeStep = this.tourGuide.activeStep.parent;
            this._goToStep({ type: null, name, source }, true);
        }
    }
    /**
     * Goes to the next step
     * @param source The source value that caused this to be called
     */
    next(source = GhostRiderEventSource.Manual) {
        if (this.activeTour) {
            const { name } = this._tourGuide.activeStep;
            this._tourGuide.getNextStep();
            this._goToStep({ type: GhostRiderEventType.Next, name, source });
        }
    }
    /**
     * Goes to the previous step
     * @param source The source value that caused this to be called
     */
    back(source = GhostRiderEventSource.Manual) {
        if (this.activeTour) {
            const { name } = this._tourGuide.activeStep;
            this._tourGuide.getPreviousStep();
            this._goToStep({ type: GhostRiderEventType.Back, name, source });
        }
    }
    /**
     * Goes to the next sub step
     * @param source The source value that caused this to be called
     */
    nextSubStep(source = GhostRiderEventSource.Manual) {
        if (this.activeTour) {
            const { name } = this._tourGuide.activeStep;
            this._tourGuide.getNextSubStep();
            this._goToStep({ type: null, name, source });
        }
    }
    /**
     * Goes to the previous sub step
     * @param source The source value that caused this to be called
     */
    previousSubStep(source = GhostRiderEventSource.Manual) {
        if (this.activeTour) {
            const { name } = this._tourGuide.activeStep;
            this._tourGuide.getPreviousSubStep();
            this._goToStep({ type: null, name, source }, true);
        }
    }
    /**
     * Closes the tour, but with a more descriptive event
     * @param source The source value that caused this to be called
     */
    complete(source = GhostRiderEventSource.Manual) {
        this.close(source, GhostRiderEventType.Complete);
    }
    /**
     * Ends the tour
     * @param source The source value that caused this to be called
     * @param type The event type to use for the emitted event
     */
    close(source = GhostRiderEventSource.Manual, type = GhostRiderEventType.Close) {
        this.activeTour$.next(false);
        const { name } = this._tourGuide.activeStep;
        // Immediately remove the backdrop and clip path elements
        this._removeWindowHandler();
        // Dispose of the step and cleanup
        const hideStepSub = this.hideStep().subscribe(() => {
            this.events$.next({ type, name, source });
            hideStepSub.unsubscribe();
        });
        this._tourGuide = undefined;
    }
    /**
     * Calls the dynamic '_hideStep' prop function to remove a popover step from the UI
     */
    hideStep() {
        if (this._hideStep) {
            return this._hideStep();
        }
        else {
            return of(void 0);
        }
    }
    /**
     * Repositions the window and the popover manually
     */
    tidy() {
        this.updatePosition();
        this.updateWindow();
    }
    /**
     * Updates the active popover's overlay position
     */
    updatePosition() {
        if (this._activePopover) {
            this._activePopover.updateOverlayPosition();
        }
    }
    /**
     * Updates the positions of the clip paths for the target element
     */
    updateWindow() {
        if (this._activePopover && this._activePopover?._overlayRef?.backdropElement) {
            this._buildWindow(this._steps.get(this._tourGuide.activeStep.name).element.nativeElement.getBoundingClientRect(), this._activePopover._overlayRef);
        }
    }
    /**
     * Removes backdrop and clip path divs for the active step
     */
    removeWindow() {
        if (this._removeWindowHandler) {
            this._removeWindowHandler();
        }
    }
    /**
     * Finds the step to show if it exists or when it is dynamically registered from the subject
     * @param event Optional event object to emit
     */
    _goToStep(event, asyncOverride) {
        if (this._tourGuide.activeStep) {
            this.hideStep().subscribe(() => {
                if (event) {
                    this.events$.next(event);
                }
                if (this._subs.has(SubKeys.StepAdded)) {
                    const stepAdded = this._subs.get(SubKeys.StepAdded);
                    if (stepAdded) {
                        stepAdded.unsubscribe();
                        this._subs.delete(SubKeys.StepAdded);
                    }
                }
                const hasStep = this._steps.has(this._tourGuide.activeStep.name);
                if (asyncOverride !== undefined) {
                    this._isAsync = asyncOverride;
                }
                else {
                    this._isAsync = !hasStep;
                }
                if (hasStep) {
                    this._showStep();
                }
                else {
                    this._subs.set(SubKeys.StepAdded, this._stepAdded$.pipe(first((step) => step === this._tourGuide.activeStep.name)).subscribe(() => {
                        this._showStep();
                    }));
                }
            });
        }
        else {
            // There isn't a next step so just end the tour
            this.close();
        }
    }
    /**
     * Destroys the active popover and creates the new popover for the desired step
     */
    _showStep() {
        const { element, vcr, config, active$ } = this._steps.get(this._tourGuide.activeStep.name);
        const popover = this._activePopover = this._popoverFactory.createPopover(element, { vcr });
        // Assign a tear down function for the active step
        this._hideStep = () => {
            popover.hide();
            active$.next(false);
            // this._removeMask();
            this._renderer.removeClass(element.nativeElement, ACTIVE_TARGET_CLASS);
            if (this._activePopover === popover) {
                this._activePopover = null;
            }
            this._hideStep = null;
            return defer(() => {
                return popover.popoverInstance.afterHidden().pipe(startWith(null), last());
            });
        };
        // Custom class that we can use too style the target element
        this._renderer.addClass(element.nativeElement, ACTIVE_TARGET_CLASS);
        popover.position = config.position;
        popover.nubbinPosition = config.nubbinPosition;
        popover.content = config.content;
        popover.popoverType = GhostRiderStepComponent;
        if (config.beforeActivate) {
            config.beforeActivate();
        }
        // Remove old backdrop and clip paths
        this.removeWindow();
        // TODO: rethink some of this logic and design
        if (this._tourGuide.activeStep.parent) {
            this._isAsync = true;
        }
        // Show new popover step
        popover.show(0);
        // Set props on step component
        popover.popoverInstance.details = config;
        // Assign new backdrop and clip path destroyer
        this._removeWindowHandler = () => {
            this._removeWindow(popover._overlayRef?.backdropElement);
        };
        if (this._isAsync) {
            // Wait for popover component to be visible before adding styles
            const afterVisibleSub = popover.popoverInstance?.afterVisible().subscribe(() => {
                this._buildWindow(element.nativeElement.getBoundingClientRect(), popover._overlayRef);
                active$.next(true);
                afterVisibleSub?.unsubscribe();
            });
        }
        else {
            // Since this isn't async, we can just build the new backdrop and set styles ASAP
            this._buildWindow(element.nativeElement.getBoundingClientRect(), popover._overlayRef);
        }
    }
    /**
     * Creates the clip path in the backdrop and an inner inset clip path to round the edges
     *
     * TODO: fix the slight edges that are showing between the inner and outter clip paths
     * @param rect The rectangle dimensions to clip
     * @param overlayRef The overlay element
     */
    _buildWindow(rect, overlayRef) {
        // if (this._tourGuide.activeStep.preventClicks && !this._uiMask) {
        //   // Make div to prevent actions
        //   this._uiMask = this._renderer.createElement('div');
        //   this._renderer.setStyle(this._uiMask, 'position', 'fixed');
        //   this._renderer.setStyle(this._uiMask, 'height', '100%');
        //   this._renderer.setStyle(this._uiMask, 'width', '100%');
        //   this._renderer.setStyle(this._uiMask, 'background-color', 'transparent');
        //   this._renderer.setStyle(this._uiMask, 'zIndex', '8999');
        //   this._renderer.setStyle(this._uiMask, 'pointerEvents', 'all');
        //   this._renderer.insertBefore(overlayRef.backdropElement.parentElement, this._uiMask, overlayRef.backdropElement);
        // }
        this._renderer.setStyle(overlayRef.backdropElement?.nextSibling, 'zIndex', 9001);
        this._renderer.setStyle(// Should we remove this style on tear down?
        overlayRef.backdropElement, 'clipPath', `polygon(
          0% 0%,
          0% 100%,
          ${rect.left}px 100%,
          ${rect.left}px ${rect.top}px,
          ${rect.right}px ${rect.top}px,
          ${rect.right}px ${rect.bottom}px,
          ${rect.left}px ${rect.bottom}px,
          ${rect.left}px 100%,
          100% 100%,
          100% 0%
        )`);
        if (!overlayRef.backdropElement?.firstChild) {
            this._renderer.appendChild(overlayRef.backdropElement, this._renderer.createElement('div'));
        }
        const buffer = 5;
        const borderRadius = buffer;
        const distributionSize = buffer / 2;
        if (overlayRef.backdropElement?.firstChild) {
            this._renderer.setStyle(overlayRef.backdropElement.firstChild, 'position', 'absolute');
            this._renderer.setStyle(overlayRef.backdropElement.firstChild, 'background', 'white');
            this._renderer.setStyle(overlayRef.backdropElement.firstChild, 'width', `${rect.width + buffer}px`);
            this._renderer.setStyle(overlayRef.backdropElement.firstChild, 'height', `${rect.height + buffer}px`);
            this._renderer.setStyle(overlayRef.backdropElement.firstChild, 'clipPath', `inset(0 round ${borderRadius}px)`);
            this._renderer.setStyle(overlayRef.backdropElement.firstChild, 'inset', `${rect.y - distributionSize}px 0 0 ${rect.x - distributionSize}px`);
        }
    }
    /**
     * Removes the custom backdrop styles and inset clip path div
     * @param backdrop The backdrop overlay element
     */
    _removeWindow(backdrop) {
        if (backdrop) {
            this._renderer.removeClass(backdrop, 'ghost-rider-backdrop');
            if (backdrop.firstChild) {
                this._renderer.removeChild(backdrop, backdrop.firstChild);
            }
        }
        // this._removeMask();
    }
}
GhostRiderService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderService, deps: [{ token: i0.Injector }, { token: i0.RendererFactory2 }], target: i0.ɵɵFactoryTarget.Injectable });
GhostRiderService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: i0.Injector }, { type: i0.RendererFactory2 }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hvc3QtcmlkZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25nLWdob3N0LXJpZGVyL3NyYy9saWIvcHJvdmlkZXJzL2dob3N0LXJpZGVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBb0QsTUFBTSxlQUFlLENBQUM7QUFDN0YsT0FBTyxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQWMsRUFBRSxFQUFFLE9BQU8sRUFBZ0IsTUFBTSxNQUFNLENBQUM7QUFDckYsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEQsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDakYsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFDbkYsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDeEUsT0FBTyxFQUFtQixxQkFBcUIsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDOztBQUtySDs7R0FFRztBQUNILElBQUssT0FHSjtBQUhELFdBQUssT0FBTztJQUNWLGtDQUF1QixDQUFBO0lBQ3ZCLDRCQUFpQixDQUFBO0FBQ25CLENBQUMsRUFISSxPQUFPLEtBQVAsT0FBTyxRQUdYO0FBRUQsTUFBTSxtQkFBbUIsR0FBVyxxQ0FBcUMsQ0FBQztBQUUxRTs7R0FFRztBQUVILE1BQU0sT0FBTyxpQkFBaUI7SUErQjVCLFlBQ21CLFNBQW1CLEVBQ3BDLGVBQWlDO1FBRGhCLGNBQVMsR0FBVCxTQUFTLENBQVU7UUEvQnJCLGdCQUFXLEdBQUcsSUFBSSxPQUFPLEVBQVUsQ0FBQztRQUNyRCx1Q0FBdUM7UUFDdEIsVUFBSyxHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO1FBQ3pDLFdBQU0sR0FBRyxJQUFJLEdBQUcs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LFFBQVEsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDM0Q7U0FDRjtRQUVELHNCQUFzQjtJQUN4QixDQUFDOzs4R0FqY1UsaUJBQWlCO2tIQUFqQixpQkFBaUIsY0FESixNQUFNOzJGQUNuQixpQkFBaUI7a0JBRDdCLFVBQVU7bUJBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSwgSW5qZWN0b3IsIE9uRGVzdHJveSwgUmVuZGVyZXIyLCBSZW5kZXJlckZhY3RvcnkyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIGRlZmVyLCBPYnNlcnZhYmxlLCBvZiwgU3ViamVjdCwgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBmaXJzdCwgbGFzdCwgc3RhcnRXaXRoIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgUG9wb3ZlciB9IGZyb20gJy4uL21vZGVscy9naG9zdC1yaWRlci1wb3BvdmVyLm1vZGVsJztcbmltcG9ydCB7IEdob3N0UmlkZXJQb3BvdmVyRmFjdG9yeSB9IGZyb20gJy4vZ2hvc3QtcmlkZXItcG9wb3Zlci1mYWN0b3J5LnNlcnZpY2UnO1xuaW1wb3J0IHsgR2hvc3RSaWRlclN0ZXBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnRzL2dob3N0LXJpZGVyLXN0ZXAuY29tcG9uZW50JztcbmltcG9ydCB7IEdob3N0UmlkZXJUb3VyR3VpZGUgfSBmcm9tICcuLi9oZWxwZXJzL2dob3N0LXJpZGVyLXRvdXItZ3VpZGUnO1xuaW1wb3J0IHsgR2hvc3RSaWRlckV2ZW50LCBHaG9zdFJpZGVyRXZlbnRTb3VyY2UsIEdob3N0UmlkZXJFdmVudFR5cGUgfSBmcm9tICcuLi9tb2RlbHMvZ2hvc3QtcmlkZXItc3RlcC1ldmVudC5tb2RlbCc7XG5pbXBvcnQgeyBHaG9zdFJpZGVyU3RlcERldGFpbHMgfSBmcm9tICcuLi9tb2RlbHMvZ2hvc3QtcmlkZXItc3RlcC1kZXRhaWxzLm1vZGVsJztcbmltcG9ydCB7IEdob3N0UmlkZXJTdGVwIH0gZnJvbSAnLi4vbW9kZWxzL2dob3N0LXJpZGVyLXN0ZXAubW9kZWwnO1xuaW1wb3J0IHsgT3ZlcmxheVJlZiB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcblxuLyoqXG4gKiBVc2VkIGZvciB0aGUgJ19zdWJzJyBtYXAgcHJvcCBrZXlzXG4gKi9cbmVudW0gU3ViS2V5cyB7XG4gIFN0ZXBBZGRlZCA9ICdzdGVwQWRkZWQnLFxuICBFdmVudHMgPSAnZXZlbnRzJ1xufVxuXG5jb25zdCBBQ1RJVkVfVEFSR0VUX0NMQVNTOiBzdHJpbmcgPSBgZ2hvc3QtcmlkZXItd2Fsa3Rocm91Z2gtc3RlcF9hY3RpdmVgO1xuXG4vKipcbiAqIFNlcnZpY2UgdG8gY29udHJvbCBndWlkZWQgdG91cnMgYW5kIHdhbGt0aHJvdWdoIHN0ZXBzXG4gKi9cbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXG5leHBvcnQgY2xhc3MgR2hvc3RSaWRlclNlcnZpY2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIHJlYWRvbmx5IF9zdGVwQWRkZWQkID0gbmV3IFN1YmplY3Q8c3RyaW5nPigpO1xuICAvLyBBZGQga2V5cyB0byB0aGUgJ1N1YktleXMnIGVudW0gcGxlZXpcbiAgcHJpdmF0ZSByZWFkb25seSBfc3VicyA9IG5ldyBNYXA8U3ViS2V5cywgU3Vic2NyaXB0aW9uPigpO1xuICBwcml2YXRlIHJlYWRvbmx5IF9zdGVwcyA9IG5ldyBNYXA8c3RyaW5nLCBHaG9zdFJpZGVyU3RlcERldGFpbHM+KCk7IC8vIG5hbWUgPT4gc3RlcFxuICBwcml2YXRlIHJlYWRvbmx5IF9wb3BvdmVyRmFjdG9yeTogR2hvc3RSaWRlclBvcG92ZXJGYWN0b3J5O1xuICBwcml2YXRlIHJlYWRvbmx5IF9yZW5kZXJlcjogUmVuZGVyZXIyO1xuXG4gIHByaXZhdGUgX3RvdXJHdWlkZTogR2hvc3RSaWRlclRvdXJHdWlkZTtcbiAgcHJpdmF0ZSBfYWN0aXZlUG9wb3ZlcjogUG9wb3ZlcjtcbiAgLy8gVE9ETzogSW1wbGVtZW50IGFuIG9wdGlvbmFsIFVJIG1hc2tpbmcgZWxlbWVudCB0byBvdmVycmlkZSBjbGlja3MgZnJvbSB0aGUgdXNlclxuICAvLyBwcml2YXRlIF91aU1hc2s6IEhUTUxEaXZFbGVtZW50IHwgbnVsbDtcblxuICBwcml2YXRlIF9pc0FzeW5jOiBib29sZWFuID0gZmFsc2U7IC8vIEZsYWcgdG8gdXNlIGFzeW5jaHJvbm91cyBvciBzeW5jaHJvbm91cyBtZXRob2RzXG5cbiAgcHJpdmF0ZSBfaGlkZVN0ZXA6ICgpID0+IE9ic2VydmFibGU8dm9pZD47XG4gIHByaXZhdGUgX3JlbW92ZVdpbmRvd0hhbmRsZXI6ICgpID0+IHZvaWQ7XG5cbiAgLy8gRmxhZyB0aGF0IHRoZSB0b3VyIGlzIGluIGZsaWdodC4gT25jZSB0aGUgdG91ciBpcyBjbG9zZWQgb3Igc2tpcHBlZCwgdGhpcyB3aWxsIGJlIGZhbHNlXG4gIHB1YmxpYyByZWFkb25seSBhY3RpdmVUb3VyJCA9IG5ldyBCZWhhdmlvclN1YmplY3QoZmFsc2UpO1xuXG4gIHB1YmxpYyBldmVudHMkID0gbmV3IFN1YmplY3Q8R2hvc3RSaWRlckV2ZW50PigpO1xuXG4gIHB1YmxpYyBnZXQgYWN0aXZlVG91cigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hY3RpdmVUb3VyJC52YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgdG91ckd1aWRlKCk6IEdob3N0UmlkZXJUb3VyR3VpZGUge1xuICAgIHJldHVybiB0aGlzLl90b3VyR3VpZGU7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9pbmplY3RvcjogSW5qZWN0b3IsXG4gICAgcmVuZGVyZXJGYWN0b3J5OiBSZW5kZXJlckZhY3RvcnkyLFxuICApIHtcbiAgICB0aGlzLl9wb3BvdmVyRmFjdG9yeSA9IG5ldyBHaG9zdFJpZGVyUG9wb3ZlckZhY3RvcnkodGhpcy5faW5qZWN0b3IpO1xuICAgIHRoaXMuX3JlbmRlcmVyID0gcmVuZGVyZXJGYWN0b3J5LmNyZWF0ZVJlbmRlcmVyKG51bGwsIG51bGwpO1xuXG4gICAgLyoqXG4gICAgICogV2hlbiB0aGVyZSBhcmUgc3RlcCBldmVudHMsIGVtaXQgdGhlIGV2ZW50IGZyb20gdGhlIHN0ZXAncyAnR2hvc3RSaWRlclN0ZXBFdmVudCdcbiAgICAgKiBvdXRwdXQgc28gd2UgY2FuIHJlYWN0IHRvIGV2ZW50IGZyb20gc3BlY2lmaWMgY29tcG9uZW50c1xuICAgICAqL1xuICAgIHRoaXMuX3N1YnMuc2V0KFxuICAgICAgU3ViS2V5cy5FdmVudHMsXG4gICAgICB0aGlzLmV2ZW50cyQuc3Vic2NyaWJlKChldmVudCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fc3RlcHMuaGFzKGV2ZW50Lm5hbWUpKSB7XG4gICAgICAgICAgdGhpcy5fc3RlcHMuZ2V0KGV2ZW50Lm5hbWUpPy5naG9zdFJpZGVyU3RlcEV2ZW50LmVtaXQoZXZlbnQpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fc3RlcEFkZGVkJC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX3N0ZXBBZGRlZCQudW5zdWJzY3JpYmUoKTtcblxuICAgIHRoaXMuYWN0aXZlVG91ciQuY29tcGxldGUoKTtcbiAgICB0aGlzLmFjdGl2ZVRvdXIkLnVuc3Vic2NyaWJlKCk7XG5cbiAgICB0aGlzLmV2ZW50cyQuY29tcGxldGUoKTtcbiAgICB0aGlzLmV2ZW50cyQudW5zdWJzY3JpYmUoKTtcblxuICAgIHRoaXMuX3N1YnMuZm9yRWFjaCgoc3ViKSA9PiBzdWIudW5zdWJzY3JpYmUoKSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIG5ldyBzdGVwIHRvIHRoZSB0b3VyXG4gICAqIEBwYXJhbSBzdGVwIFRoZSBzdGVwIHRvIGFkZCB0byB0aGUgdG91clxuICAgKi9cbiAgcHVibGljIHJlZ2lzdGVyU3RlcChzdGVwOiBHaG9zdFJpZGVyU3RlcERldGFpbHMpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX3N0ZXBzLmhhcyhzdGVwLmNvbmZpZy5uYW1lKSkge1xuICAgICAgdGhpcy5fc3RlcHMuc2V0KHN0ZXAuY29uZmlnLm5hbWUsIHN0ZXApO1xuICAgIH1cbiAgICB0aGlzLl9zdGVwQWRkZWQkLm5leHQoc3RlcC5jb25maWcubmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgc3RlcCBmcm9tIHRoZSAnX3N0ZXBzJyBtYXBcbiAgICogQHBhcmFtIHN0ZXAgVGhlIHN0ZXAgdG8gcmVtb3ZlIGZyb20gdGhlIG1hcFxuICAgKi9cbiAgcHVibGljIHVucmVnaXN0ZXJTdGVwKHN0ZXA6IEdob3N0UmlkZXJTdGVwRGV0YWlscyk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdGVwcy5oYXMoc3RlcC5jb25maWcubmFtZSkgJiYgdGhpcy5fc3RlcHMuZ2V0KHN0ZXAuY29uZmlnLm5hbWUpID09PSBzdGVwKSB7XG4gICAgICB0aGlzLl9zdGVwcy5kZWxldGUoc3RlcC5jb25maWcubmFtZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgdG91ciBhdCBmcm9tIHRoZSBmaXJzdCBzdGVwXG4gICAqIEBwYXJhbSB0b3VyTmFtZXNwYWNlIFN0cmluZyB0byBkaXN0aW5ndWlzaCBkaWZmZXJlbnQgdG91ciBjb250ZXh0cyAoYmVjb21lcyBhIHByZWZpeCB0byBhbGwgc3RlcHMpXG4gICAqIEBwYXJhbSBzdGVwcyBMaXN0IG9mIHRvdXIgc3RlcHMgaW4gdGhlIG9yZGVyIGluIHdoaWNoIHRoZXkgc2hvdWxkIGdvXG4gICAqL1xuICBwdWJsaWMgc3RhcnQodG91ck5hbWVzcGFjZTogc3RyaW5nLCBzdGVwczogR2hvc3RSaWRlclN0ZXBbXSk6IHZvaWQge1xuICAgIHRvdXJOYW1lc3BhY2UgPSB0b3VyTmFtZXNwYWNlID8gdG91ck5hbWVzcGFjZSArICcuJyA6ICcnO1xuICAgIHRoaXMuYWN0aXZlVG91ciQubmV4dCh0cnVlKTtcbiAgICB0aGlzLmV2ZW50cyQubmV4dCh7XG4gICAgICB0eXBlOiBHaG9zdFJpZGVyRXZlbnRUeXBlLlN0YXJ0LFxuICAgICAgbmFtZTogdG91ck5hbWVzcGFjZSxcbiAgICAgIHNvdXJjZTogR2hvc3RSaWRlckV2ZW50U291cmNlLk1hbnVhbCxcbiAgICB9KTtcbiAgICB0aGlzLl90b3VyR3VpZGUgPSBuZXcgR2hvc3RSaWRlclRvdXJHdWlkZSh0b3VyTmFtZXNwYWNlLCBzdGVwcyk7XG4gICAgdGhpcy5fZ29Ub1N0ZXAoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXVzZXMgdGhlIHRvdXIgb24gdGhlIGFjdGl2ZSBzdGVwXG4gICAqL1xuICBwdWJsaWMgcGF1c2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuYWN0aXZlVG91cikge1xuICAgICAgdGhpcy5oaWRlU3RlcCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXN1bWVzIHRoZSB0b3VyIGZyb20gdGhlIGFjdGl2ZSBzdGVwXG4gICAqL1xuICBwdWJsaWMgcmVzdW1lKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmFjdGl2ZVRvdXIpIHtcbiAgICAgIHRoaXMuX2dvVG9TdGVwKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdvZXMgdG8gYSBwYXJlbnQgc3RlcCBmcm9tIGFueSBzdWIgc3RlcFxuICAgKiBAcGFyYW0gc291cmNlIFRoZSBzb3VyY2UgdmFsdWUgdGhhdCBjYXVzZWQgdGhpcyB0byBiZSBjYWxsZWRcbiAgICovXG4gIHB1YmxpYyBnb1RvUGFyZW50KHNvdXJjZTogR2hvc3RSaWRlckV2ZW50U291cmNlID0gR2hvc3RSaWRlckV2ZW50U291cmNlLk1hbnVhbCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmFjdGl2ZVRvdXIpIHtcbiAgICAgIGNvbnN0IHsgbmFtZSB9ID0gdGhpcy5fdG91ckd1aWRlLmFjdGl2ZVN0ZXA7XG4gICAgICB0aGlzLnRvdXJHdWlkZS5hY3RpdmVTdGVwID0gdGhpcy50b3VyR3VpZGUuYWN0aXZlU3RlcC5wYXJlbnQgYXMgR2hvc3RSaWRlclN0ZXA7XG4gICAgICB0aGlzLl9nb1RvU3RlcCh7IHR5cGU6IG51bGwsIG5hbWUsIHNvdXJjZSB9LCB0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR29lcyB0byB0aGUgbmV4dCBzdGVwXG4gICAqIEBwYXJhbSBzb3VyY2UgVGhlIHNvdXJjZSB2YWx1ZSB0aGF0IGNhdXNlZCB0aGlzIHRvIGJlIGNhbGxlZFxuICAgKi9cbiAgcHVibGljIG5leHQoc291cmNlOiBHaG9zdFJpZGVyRXZlbnRTb3VyY2UgPSBHaG9zdFJpZGVyRXZlbnRTb3VyY2UuTWFudWFsKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuYWN0aXZlVG91cikge1xuICAgICAgY29uc3QgeyBuYW1lIH0gPSB0aGlzLl90b3VyR3VpZGUuYWN0aXZlU3RlcDtcbiAgICAgIHRoaXMuX3RvdXJHdWlkZS5nZXROZXh0U3RlcCgpO1xuICAgICAgdGhpcy5fZ29Ub1N0ZXAoeyB0eXBlOiBHaG9zdFJpZGVyRXZlbnRUeXBlLk5leHQsIG5hbWUsIHNvdXJjZSB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR29lcyB0byB0aGUgcHJldmlvdXMgc3RlcFxuICAgKiBAcGFyYW0gc291cmNlIFRoZSBzb3VyY2UgdmFsdWUgdGhhdCBjYXVzZWQgdGhpcyB0byBiZSBjYWxsZWRcbiAgICovXG4gIHB1YmxpYyBiYWNrKHNvdXJjZTogR2hvc3RSaWRlckV2ZW50U291cmNlID0gR2hvc3RSaWRlckV2ZW50U291cmNlLk1hbnVhbCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmFjdGl2ZVRvdXIpIHtcbiAgICAgIGNvbnN0IHsgbmFtZSB9ID0gdGhpcy5fdG91ckd1aWRlLmFjdGl2ZVN0ZXA7XG4gICAgICB0aGlzLl90b3VyR3VpZGUuZ2V0UHJldmlvdXNTdGVwKCk7XG4gICAgICB0aGlzLl9nb1RvU3RlcCh7IHR5cGU6IEdob3N0UmlkZXJFdmVudFR5cGUuQmFjaywgbmFtZSwgc291cmNlIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHb2VzIHRvIHRoZSBuZXh0IHN1YiBzdGVwXG4gICAqIEBwYXJhbSBzb3VyY2UgVGhlIHNvdXJjZSB2YWx1ZSB0aGF0IGNhdXNlZCB0aGlzIHRvIGJlIGNhbGxlZFxuICAgKi9cbiAgcHVibGljIG5leHRTdWJTdGVwKHNvdXJjZTogR2hvc3RSaWRlckV2ZW50U291cmNlID0gR2hvc3RSaWRlckV2ZW50U291cmNlLk1hbnVhbCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmFjdGl2ZVRvdXIpIHtcbiAgICAgIGNvbnN0IHsgbmFtZSB9ID0gdGhpcy5fdG91ckd1aWRlLmFjdGl2ZVN0ZXA7XG4gICAgICB0aGlzLl90b3VyR3VpZGUuZ2V0TmV4dFN1YlN0ZXAoKTtcbiAgICAgIHRoaXMuX2dvVG9TdGVwKHsgdHlwZTogbnVsbCwgbmFtZSwgc291cmNlIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHb2VzIHRvIHRoZSBwcmV2aW91cyBzdWIgc3RlcFxuICAgKiBAcGFyYW0gc291cmNlIFRoZSBzb3VyY2UgdmFsdWUgdGhhdCBjYXVzZWQgdGhpcyB0byBiZSBjYWxsZWRcbiAgICovXG4gIHB1YmxpYyBwcmV2aW91c1N1YlN0ZXAoc291cmNlOiBHaG9zdFJpZGVyRXZlbnRTb3VyY2UgPSBHaG9zdFJpZGVyRXZlbnRTb3VyY2UuTWFudWFsKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuYWN0aXZlVG91cikge1xuICAgICAgY29uc3QgeyBuYW1lIH0gPSB0aGlzLl90b3VyR3VpZGUuYWN0aXZlU3RlcDtcbiAgICAgIHRoaXMuX3RvdXJHdWlkZS5nZXRQcmV2aW91c1N1YlN0ZXAoKTtcbiAgICAgIHRoaXMuX2dvVG9TdGVwKHsgdHlwZTogbnVsbCwgbmFtZSwgc291cmNlIH0sIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIHRvdXIsIGJ1dCB3aXRoIGEgbW9yZSBkZXNjcmlwdGl2ZSBldmVudFxuICAgKiBAcGFyYW0gc291cmNlIFRoZSBzb3VyY2UgdmFsdWUgdGhhdCBjYXVzZWQgdGhpcyB0byBiZSBjYWxsZWRcbiAgICovXG4gIHB1YmxpYyBjb21wbGV0ZShzb3VyY2U6IEdob3N0UmlkZXJFdmVudFNvdXJjZSA9IEdob3N0UmlkZXJFdmVudFNvdXJjZS5NYW51YWwpOiB2b2lkIHtcbiAgICB0aGlzLmNsb3NlKHNvdXJjZSwgR2hvc3RSaWRlckV2ZW50VHlwZS5Db21wbGV0ZSk7XG4gIH1cblxuICAvKipcbiAgICogRW5kcyB0aGUgdG91clxuICAgKiBAcGFyYW0gc291cmNlIFRoZSBzb3VyY2UgdmFsdWUgdGhhdCBjYXVzZWQgdGhpcyB0byBiZSBjYWxsZWRcbiAgICogQHBhcmFtIHR5cGUgVGhlIGV2ZW50IHR5cGUgdG8gdXNlIGZvciB0aGUgZW1pdHRlZCBldmVudFxuICAgKi9cbiAgcHVibGljIGNsb3NlKFxuICAgIHNvdXJjZTogR2hvc3RSaWRlckV2ZW50U291cmNlID0gR2hvc3RSaWRlckV2ZW50U291cmNlLk1hbnVhbCxcbiAgICB0eXBlOiBHaG9zdFJpZGVyRXZlbnRUeXBlID0gR2hvc3RSaWRlckV2ZW50VHlwZS5DbG9zZSxcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5hY3RpdmVUb3VyJC5uZXh0KGZhbHNlKTtcblxuICAgIGNvbnN0IHsgbmFtZSB9ID0gdGhpcy5fdG91ckd1aWRlLmFjdGl2ZVN0ZXA7XG4gICAgLy8gSW1tZWRpYXRlbHkgcmVtb3ZlIHRoZSBiYWNrZHJvcCBhbmQgY2xpcCBwYXRoIGVsZW1lbnRzXG4gICAgdGhpcy5fcmVtb3ZlV2luZG93SGFuZGxlcigpO1xuICAgIC8vIERpc3Bvc2Ugb2YgdGhlIHN0ZXAgYW5kIGNsZWFudXBcbiAgICBjb25zdCBoaWRlU3RlcFN1YiA9IHRoaXMuaGlkZVN0ZXAoKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5ldmVudHMkLm5leHQoeyB0eXBlLCBuYW1lLCBzb3VyY2UgfSk7XG4gICAgICBoaWRlU3RlcFN1Yi51bnN1YnNjcmliZSgpO1xuICAgIH0pO1xuICAgIHRoaXMuX3RvdXJHdWlkZSA9IHVuZGVmaW5lZCBhcyB1bmtub3duIGFzIEdob3N0UmlkZXJUb3VyR3VpZGU7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgdGhlIGR5bmFtaWMgJ19oaWRlU3RlcCcgcHJvcCBmdW5jdGlvbiB0byByZW1vdmUgYSBwb3BvdmVyIHN0ZXAgZnJvbSB0aGUgVUlcbiAgICovXG4gIHB1YmxpYyBoaWRlU3RlcCgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5faGlkZVN0ZXApIHtcbiAgICAgIHJldHVybiB0aGlzLl9oaWRlU3RlcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2Yodm9pZCAwKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVwb3NpdGlvbnMgdGhlIHdpbmRvdyBhbmQgdGhlIHBvcG92ZXIgbWFudWFsbHlcbiAgICovXG4gIHB1YmxpYyB0aWR5KCk6IHZvaWQge1xuICAgIHRoaXMudXBkYXRlUG9zaXRpb24oKTtcbiAgICB0aGlzLnVwZGF0ZVdpbmRvdygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGFjdGl2ZSBwb3BvdmVyJ3Mgb3ZlcmxheSBwb3NpdGlvblxuICAgKi9cbiAgcHVibGljIHVwZGF0ZVBvc2l0aW9uKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9hY3RpdmVQb3BvdmVyKSB7XG4gICAgICB0aGlzLl9hY3RpdmVQb3BvdmVyLnVwZGF0ZU92ZXJsYXlQb3NpdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBwb3NpdGlvbnMgb2YgdGhlIGNsaXAgcGF0aHMgZm9yIHRoZSB0YXJnZXQgZWxlbWVudFxuICAgKi9cbiAgcHVibGljIHVwZGF0ZVdpbmRvdygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fYWN0aXZlUG9wb3ZlciAmJiB0aGlzLl9hY3RpdmVQb3BvdmVyPy5fb3ZlcmxheVJlZj8uYmFja2Ryb3BFbGVtZW50KSB7XG4gICAgICB0aGlzLl9idWlsZFdpbmRvdyhcbiAgICAgICAgdGhpcy5fc3RlcHMuZ2V0KHRoaXMuX3RvdXJHdWlkZS5hY3RpdmVTdGVwLm5hbWUpIS5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgIHRoaXMuX2FjdGl2ZVBvcG92ZXIuX292ZXJsYXlSZWYsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGJhY2tkcm9wIGFuZCBjbGlwIHBhdGggZGl2cyBmb3IgdGhlIGFjdGl2ZSBzdGVwXG4gICAqL1xuICBwdWJsaWMgcmVtb3ZlV2luZG93KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9yZW1vdmVXaW5kb3dIYW5kbGVyKSB7XG4gICAgICB0aGlzLl9yZW1vdmVXaW5kb3dIYW5kbGVyKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIHRoZSBzdGVwIHRvIHNob3cgaWYgaXQgZXhpc3RzIG9yIHdoZW4gaXQgaXMgZHluYW1pY2FsbHkgcmVnaXN0ZXJlZCBmcm9tIHRoZSBzdWJqZWN0XG4gICAqIEBwYXJhbSBldmVudCBPcHRpb25hbCBldmVudCBvYmplY3QgdG8gZW1pdFxuICAgKi9cbiAgcHJpdmF0ZSBfZ29Ub1N0ZXAoZXZlbnQ/OiBHaG9zdFJpZGVyRXZlbnQsIGFzeW5jT3ZlcnJpZGU/OiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3RvdXJHdWlkZS5hY3RpdmVTdGVwKSB7XG4gICAgICB0aGlzLmhpZGVTdGVwKCkuc3Vic2NyaWJlKCgpID0+IHtcblxuICAgICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgICB0aGlzLmV2ZW50cyQubmV4dChldmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fc3Vicy5oYXMoU3ViS2V5cy5TdGVwQWRkZWQpKSB7XG4gICAgICAgICAgY29uc3Qgc3RlcEFkZGVkID0gdGhpcy5fc3Vicy5nZXQoU3ViS2V5cy5TdGVwQWRkZWQpO1xuICAgICAgICAgIGlmIChzdGVwQWRkZWQpIHtcbiAgICAgICAgICAgIHN0ZXBBZGRlZC51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgdGhpcy5fc3Vicy5kZWxldGUoU3ViS2V5cy5TdGVwQWRkZWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGhhc1N0ZXAgPSB0aGlzLl9zdGVwcy5oYXModGhpcy5fdG91ckd1aWRlLmFjdGl2ZVN0ZXAubmFtZSk7XG5cbiAgICAgICAgaWYgKGFzeW5jT3ZlcnJpZGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuX2lzQXN5bmMgPSBhc3luY092ZXJyaWRlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2lzQXN5bmMgPSAhaGFzU3RlcDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYXNTdGVwKSB7XG4gICAgICAgICAgdGhpcy5fc2hvd1N0ZXAoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9zdWJzLnNldChcbiAgICAgICAgICAgIFN1YktleXMuU3RlcEFkZGVkLFxuICAgICAgICAgICAgdGhpcy5fc3RlcEFkZGVkJC5waXBlKFxuICAgICAgICAgICAgICBmaXJzdCgoc3RlcCkgPT4gc3RlcCA9PT0gdGhpcy5fdG91ckd1aWRlLmFjdGl2ZVN0ZXAubmFtZSksXG4gICAgICAgICAgICApLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuX3Nob3dTdGVwKCk7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlcmUgaXNuJ3QgYSBuZXh0IHN0ZXAgc28ganVzdCBlbmQgdGhlIHRvdXJcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIGFjdGl2ZSBwb3BvdmVyIGFuZCBjcmVhdGVzIHRoZSBuZXcgcG9wb3ZlciBmb3IgdGhlIGRlc2lyZWQgc3RlcFxuICAgKi9cbiAgcHJpdmF0ZSBfc2hvd1N0ZXAoKTogdm9pZCB7XG4gICAgY29uc3QgeyBlbGVtZW50LCB2Y3IsIGNvbmZpZywgYWN0aXZlJCB9ID0gdGhpcy5fc3RlcHMuZ2V0KHRoaXMuX3RvdXJHdWlkZS5hY3RpdmVTdGVwLm5hbWUpIGFzIEdob3N0UmlkZXJTdGVwRGV0YWlscztcbiAgICBjb25zdCBwb3BvdmVyID0gdGhpcy5fYWN0aXZlUG9wb3ZlciA9IHRoaXMuX3BvcG92ZXJGYWN0b3J5LmNyZWF0ZVBvcG92ZXIoZWxlbWVudCwgeyB2Y3IgfSk7XG5cbiAgICAvLyBBc3NpZ24gYSB0ZWFyIGRvd24gZnVuY3Rpb24gZm9yIHRoZSBhY3RpdmUgc3RlcFxuICAgIHRoaXMuX2hpZGVTdGVwID0gKCk6IE9ic2VydmFibGU8dm9pZD4gPT4ge1xuICAgICAgcG9wb3Zlci5oaWRlKCk7XG4gICAgICBhY3RpdmUkLm5leHQoZmFsc2UpO1xuICAgICAgLy8gdGhpcy5fcmVtb3ZlTWFzaygpO1xuICAgICAgdGhpcy5fcmVuZGVyZXIucmVtb3ZlQ2xhc3MoXG4gICAgICAgIGVsZW1lbnQubmF0aXZlRWxlbWVudCxcbiAgICAgICAgQUNUSVZFX1RBUkdFVF9DTEFTU1xuICAgICAgKTtcblxuICAgICAgaWYgKHRoaXMuX2FjdGl2ZVBvcG92ZXIgPT09IHBvcG92ZXIpIHtcbiAgICAgICAgdGhpcy5fYWN0aXZlUG9wb3ZlciA9IG51bGwgYXMgdW5rbm93biBhcyBQb3BvdmVyPGFueT47XG4gICAgICB9XG4gICAgICB0aGlzLl9oaWRlU3RlcCA9IG51bGwgYXMgdW5rbm93biBhcyAoKSA9PiBPYnNlcnZhYmxlPHZvaWQ+O1xuXG4gICAgICByZXR1cm4gZGVmZXIoKCkgPT4ge1xuICAgICAgICByZXR1cm4gcG9wb3Zlci5wb3BvdmVySW5zdGFuY2UhLmFmdGVySGlkZGVuKCkucGlwZShcbiAgICAgICAgICBzdGFydFdpdGgobnVsbCBhcyBhbnkpLFxuICAgICAgICAgIGxhc3QoKSxcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBDdXN0b20gY2xhc3MgdGhhdCB3ZSBjYW4gdXNlIHRvbyBzdHlsZSB0aGUgdGFyZ2V0IGVsZW1lbnRcbiAgICB0aGlzLl9yZW5kZXJlci5hZGRDbGFzcyhcbiAgICAgIGVsZW1lbnQubmF0aXZlRWxlbWVudCxcbiAgICAgIEFDVElWRV9UQVJHRVRfQ0xBU1NcbiAgICApO1xuXG4gICAgcG9wb3Zlci5wb3NpdGlvbiA9IGNvbmZpZy5wb3NpdGlvbjtcbiAgICBwb3BvdmVyLm51YmJpblBvc2l0aW9uID0gY29uZmlnLm51YmJpblBvc2l0aW9uO1xuICAgIHBvcG92ZXIuY29udGVudCA9IGNvbmZpZy5jb250ZW50O1xuICAgIHBvcG92ZXIucG9wb3ZlclR5cGUgPSBHaG9zdFJpZGVyU3RlcENvbXBvbmVudDtcblxuICAgIGlmIChjb25maWcuYmVmb3JlQWN0aXZhdGUpIHtcbiAgICAgIGNvbmZpZy5iZWZvcmVBY3RpdmF0ZSgpO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBvbGQgYmFja2Ryb3AgYW5kIGNsaXAgcGF0aHNcbiAgICB0aGlzLnJlbW92ZVdpbmRvdygpO1xuICAgIC8vIFRPRE86IHJldGhpbmsgc29tZSBvZiB0aGlzIGxvZ2ljIGFuZCBkZXNpZ25cbiAgICBpZiAodGhpcy5fdG91ckd1aWRlLmFjdGl2ZVN0ZXAucGFyZW50KSB7XG4gICAgICB0aGlzLl9pc0FzeW5jID0gdHJ1ZTtcbiAgICB9XG4gICAgLy8gU2hvdyBuZXcgcG9wb3ZlciBzdGVwXG4gICAgcG9wb3Zlci5zaG93KDApO1xuICAgIC8vIFNldCBwcm9wcyBvbiBzdGVwIGNvbXBvbmVudFxuICAgIChwb3BvdmVyLnBvcG92ZXJJbnN0YW5jZSBhcyBHaG9zdFJpZGVyU3RlcENvbXBvbmVudCkuZGV0YWlscyA9IGNvbmZpZztcbiAgICAvLyBBc3NpZ24gbmV3IGJhY2tkcm9wIGFuZCBjbGlwIHBhdGggZGVzdHJveWVyXG4gICAgdGhpcy5fcmVtb3ZlV2luZG93SGFuZGxlciA9ICgpID0+IHtcbiAgICAgIHRoaXMuX3JlbW92ZVdpbmRvdyhwb3BvdmVyLl9vdmVybGF5UmVmPy5iYWNrZHJvcEVsZW1lbnQgYXMgSFRNTEVsZW1lbnQpO1xuICAgIH07XG5cbiAgICBpZiAodGhpcy5faXNBc3luYykge1xuICAgICAgLy8gV2FpdCBmb3IgcG9wb3ZlciBjb21wb25lbnQgdG8gYmUgdmlzaWJsZSBiZWZvcmUgYWRkaW5nIHN0eWxlc1xuICAgICAgY29uc3QgYWZ0ZXJWaXNpYmxlU3ViID0gcG9wb3Zlci5wb3BvdmVySW5zdGFuY2U/LmFmdGVyVmlzaWJsZSgpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2J1aWxkV2luZG93KGVsZW1lbnQubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwgcG9wb3Zlci5fb3ZlcmxheVJlZiBhcyBPdmVybGF5UmVmKTtcbiAgICAgICAgYWN0aXZlJC5uZXh0KHRydWUpO1xuICAgICAgICBhZnRlclZpc2libGVTdWI/LnVuc3Vic2NyaWJlKCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU2luY2UgdGhpcyBpc24ndCBhc3luYywgd2UgY2FuIGp1c3QgYnVpbGQgdGhlIG5ldyBiYWNrZHJvcCBhbmQgc2V0IHN0eWxlcyBBU0FQXG4gICAgICB0aGlzLl9idWlsZFdpbmRvdyhlbGVtZW50Lm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIHBvcG92ZXIuX292ZXJsYXlSZWYgYXMgT3ZlcmxheVJlZik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGhlIGNsaXAgcGF0aCBpbiB0aGUgYmFja2Ryb3AgYW5kIGFuIGlubmVyIGluc2V0IGNsaXAgcGF0aCB0byByb3VuZCB0aGUgZWRnZXNcbiAgICpcbiAgICogVE9ETzogZml4IHRoZSBzbGlnaHQgZWRnZXMgdGhhdCBhcmUgc2hvd2luZyBiZXR3ZWVuIHRoZSBpbm5lciBhbmQgb3V0dGVyIGNsaXAgcGF0aHNcbiAgICogQHBhcmFtIHJlY3QgVGhlIHJlY3RhbmdsZSBkaW1lbnNpb25zIHRvIGNsaXBcbiAgICogQHBhcmFtIG92ZXJsYXlSZWYgVGhlIG92ZXJsYXkgZWxlbWVudFxuICAgKi9cbiAgcHJpdmF0ZSBfYnVpbGRXaW5kb3cocmVjdDogRE9NUmVjdCwgb3ZlcmxheVJlZjogT3ZlcmxheVJlZik6IHZvaWQge1xuICAgIC8vIGlmICh0aGlzLl90b3VyR3VpZGUuYWN0aXZlU3RlcC5wcmV2ZW50Q2xpY2tzICYmICF0aGlzLl91aU1hc2spIHtcbiAgICAvLyAgIC8vIE1ha2UgZGl2IHRvIHByZXZlbnQgYWN0aW9uc1xuICAgIC8vICAgdGhpcy5fdWlNYXNrID0gdGhpcy5fcmVuZGVyZXIuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgLy8gICB0aGlzLl9yZW5kZXJlci5zZXRTdHlsZSh0aGlzLl91aU1hc2ssICdwb3NpdGlvbicsICdmaXhlZCcpO1xuICAgIC8vICAgdGhpcy5fcmVuZGVyZXIuc2V0U3R5bGUodGhpcy5fdWlNYXNrLCAnaGVpZ2h0JywgJzEwMCUnKTtcbiAgICAvLyAgIHRoaXMuX3JlbmRlcmVyLnNldFN0eWxlKHRoaXMuX3VpTWFzaywgJ3dpZHRoJywgJzEwMCUnKTtcbiAgICAvLyAgIHRoaXMuX3JlbmRlcmVyLnNldFN0eWxlKHRoaXMuX3VpTWFzaywgJ2JhY2tncm91bmQtY29sb3InLCAndHJhbnNwYXJlbnQnKTtcbiAgICAvLyAgIHRoaXMuX3JlbmRlcmVyLnNldFN0eWxlKHRoaXMuX3VpTWFzaywgJ3pJbmRleCcsICc4OTk5Jyk7XG4gICAgLy8gICB0aGlzLl9yZW5kZXJlci5zZXRTdHlsZSh0aGlzLl91aU1hc2ssICdwb2ludGVyRXZlbnRzJywgJ2FsbCcpO1xuICAgIC8vICAgdGhpcy5fcmVuZGVyZXIuaW5zZXJ0QmVmb3JlKG92ZXJsYXlSZWYuYmFja2Ryb3BFbGVtZW50LnBhcmVudEVsZW1lbnQsIHRoaXMuX3VpTWFzaywgb3ZlcmxheVJlZi5iYWNrZHJvcEVsZW1lbnQpO1xuICAgIC8vIH1cblxuICAgIHRoaXMuX3JlbmRlcmVyLnNldFN0eWxlKG92ZXJsYXlSZWYuYmFja2Ryb3BFbGVtZW50Py5uZXh0U2libGluZywgJ3pJbmRleCcsIDkwMDEpO1xuICAgIHRoaXMuX3JlbmRlcmVyLnNldFN0eWxlKCAvLyBTaG91bGQgd2UgcmVtb3ZlIHRoaXMgc3R5bGUgb24gdGVhciBkb3duP1xuICAgICAgb3ZlcmxheVJlZi5iYWNrZHJvcEVsZW1lbnQsXG4gICAgICAnY2xpcFBhdGgnLFxuICAgICAgYHBvbHlnb24oXG4gICAgICAgICAgMCUgMCUsXG4gICAgICAgICAgMCUgMTAwJSxcbiAgICAgICAgICAke3JlY3QubGVmdH1weCAxMDAlLFxuICAgICAgICAgICR7cmVjdC5sZWZ0fXB4ICR7cmVjdC50b3B9cHgsXG4gICAgICAgICAgJHtyZWN0LnJpZ2h0fXB4ICR7cmVjdC50b3B9cHgsXG4gICAgICAgICAgJHtyZWN0LnJpZ2h0fXB4ICR7cmVjdC5ib3R0b219cHgsXG4gICAgICAgICAgJHtyZWN0LmxlZnR9cHggJHtyZWN0LmJvdHRvbX1weCxcbiAgICAgICAgICAke3JlY3QubGVmdH1weCAxMDAlLFxuICAgICAgICAgIDEwMCUgMTAwJSxcbiAgICAgICAgICAxMDAlIDAlXG4gICAgICAgIClgLFxuICAgICk7XG5cbiAgICBpZiAoIW92ZXJsYXlSZWYuYmFja2Ryb3BFbGVtZW50Py5maXJzdENoaWxkKSB7XG4gICAgICB0aGlzLl9yZW5kZXJlci5hcHBlbmRDaGlsZChvdmVybGF5UmVmLmJhY2tkcm9wRWxlbWVudCwgdGhpcy5fcmVuZGVyZXIuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1ZmZlciA9IDU7XG4gICAgY29uc3QgYm9yZGVyUmFkaXVzID0gYnVmZmVyO1xuICAgIGNvbnN0IGRpc3RyaWJ1dGlvblNpemUgPSBidWZmZXIgLyAyO1xuXG4gICAgaWYgKG92ZXJsYXlSZWYuYmFja2Ryb3BFbGVtZW50Py5maXJzdENoaWxkKSB7XG4gICAgICB0aGlzLl9yZW5kZXJlci5zZXRTdHlsZShvdmVybGF5UmVmLmJhY2tkcm9wRWxlbWVudC5maXJzdENoaWxkLCAncG9zaXRpb24nLCAnYWJzb2x1dGUnKTtcbiAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFN0eWxlKG92ZXJsYXlSZWYuYmFja2Ryb3BFbGVtZW50LmZpcnN0Q2hpbGQsICdiYWNrZ3JvdW5kJywgJ3doaXRlJyk7XG4gICAgICB0aGlzLl9yZW5kZXJlci5zZXRTdHlsZShvdmVybGF5UmVmLmJhY2tkcm9wRWxlbWVudC5maXJzdENoaWxkLCAnd2lkdGgnLCBgJHtyZWN0LndpZHRoICsgYnVmZmVyfXB4YCk7XG4gICAgICB0aGlzLl9yZW5kZXJlci5zZXRTdHlsZShvdmVybGF5UmVmLmJhY2tkcm9wRWxlbWVudC5maXJzdENoaWxkLCAnaGVpZ2h0JywgYCR7cmVjdC5oZWlnaHQgKyBidWZmZXJ9cHhgKTtcbiAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFN0eWxlKG92ZXJsYXlSZWYuYmFja2Ryb3BFbGVtZW50LmZpcnN0Q2hpbGQsICdjbGlwUGF0aCcsIGBpbnNldCgwIHJvdW5kICR7Ym9yZGVyUmFkaXVzfXB4KWApO1xuICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0U3R5bGUob3ZlcmxheVJlZi5iYWNrZHJvcEVsZW1lbnQuZmlyc3RDaGlsZCwgJ2luc2V0JywgYCR7cmVjdC55IC0gZGlzdHJpYnV0aW9uU2l6ZX1weCAwIDAgJHtyZWN0LnggLSBkaXN0cmlidXRpb25TaXplfXB4YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGN1c3RvbSBiYWNrZHJvcCBzdHlsZXMgYW5kIGluc2V0IGNsaXAgcGF0aCBkaXZcbiAgICogQHBhcmFtIGJhY2tkcm9wIFRoZSBiYWNrZHJvcCBvdmVybGF5IGVsZW1lbnRcbiAgICovXG4gIHByaXZhdGUgX3JlbW92ZVdpbmRvdyhiYWNrZHJvcDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBpZiAoYmFja2Ryb3ApIHtcbiAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbW92ZUNsYXNzKGJhY2tkcm9wLCAnZ2hvc3QtcmlkZXItYmFja2Ryb3AnKTtcbiAgICAgIGlmIChiYWNrZHJvcC5maXJzdENoaWxkKSB7XG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbW92ZUNoaWxkKGJhY2tkcm9wLCBiYWNrZHJvcC5maXJzdENoaWxkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB0aGlzLl9yZW1vdmVNYXNrKCk7XG4gIH1cblxuICAvLyAvKipcbiAgLy8gICogUmVtb3ZlcyB0aGUgbWFza2luZyBkaXYgdG8gcHJldmVudCBjbGlja3NcbiAgLy8gICovXG4gIC8vIHByaXZhdGUgX3JlbW92ZU1hc2soKTogdm9pZCB7XG4gIC8vICAgaWYgKHRoaXMuX3VpTWFzaykge1xuICAvLyAgICAgdGhpcy5fdWlNYXNrLnJlbW92ZSgpO1xuICAvLyAgICAgdGhpcy5fdWlNYXNrID0gbnVsbDtcbiAgLy8gICB9XG4gIC8vIH1cbn1cbiJdfQ==