import { Injectable, Injector, OnDestroy, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable, Subject, Subscription } from 'rxjs';
import { GhostRiderTourGuide } from './helpers/ghost-rider-tour-guide';
import { GhostRiderStepDetails } from './models/ghost-rider-step-details.model';
import { GhostRiderEvent, GhostRiderEventSource, GhostRiderEventType } from './models/ghost-rider-step-event.model';
import { GhostRiderStep } from './models/ghost-rider-step.model';

@Injectable({
  providedIn: 'root'
})
export class GhostRiderService implements OnDestroy {
  private readonly _steps: Map<string, any> = new Map();
  private readonly _stepAdded$ = new Subject<string>();
  private readonly _subs: Map<string, Subscription> = new Map();
  private readonly _renderer: Renderer2;

  private _tourGuide!: GhostRiderTourGuide;
  private _activePopover: /* SldsPopover */ any;
  // private _hideStep: () => Observable<void>;

  // Flag that the tour is in flight. Once the tour is closed or skipped, this will be false
  public readonly activeTour$ = new BehaviorSubject(false);

  public events$ = new Subject<GhostRiderEvent>();

  public get activeTour(): boolean {
    return this.activeTour$.getValue();
  }

  constructor(
    private readonly _injector: Injector,
    rendererFactory: RendererFactory2,
  ) {
    // this._popoverFactory = new SldsPopoverFactory(this._injector);
    this._renderer = rendererFactory.createRenderer(null, null);

    /**
     * When there are step events, emit the event from the step's 'sldsWalkthroughStepEvent'
     * output so we can react to event from specific components
     */
    this._subs.set(
      'events',
      this.events$.subscribe((event) => {
        if (this._steps.has(event.name)) {
          this._steps.get(event.name).sldsWalkthroughStepEvent.emit(event);
        }
      }),
    );

    this._subs.set(
      'resize',
      fromEvent(window, 'resize').subscribe(() => {
        this.updateWindow();
      }),
    );
  }

  ngOnDestroy(): void {
    this._stepAdded$.complete();
    this._stepAdded$.unsubscribe();

    this.activeTour$.complete();
    this.activeTour$.unsubscribe();

    this.events$.complete();
    this.events$.unsubscribe();

    this._subs.forEach((sub) => sub.unsubscribe());
  }

  public registerStep(step: GhostRiderStepDetails): void {
    if (!this._steps.has(step.config.name)) {
      console.log('register step', step);
      this._steps.set(step.config.name, step);
      this._stepAdded$.next(step.config.name);
    }
  }

  public unregisterStep(step: GhostRiderStepDetails): void {
    if (this._steps.has(step.config.name) && this._steps.get(step.config.name) === step) {
      this._steps.delete(step.config.name);
    }
  }

  public start(tourNamespace: string, steps: GhostRiderStep[]): void {
    console.log('starting tour');
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

  public complete(): void {
    this.close();
  }

  public close(): void {
    this.activeTour$.next(false);
  }

  public next(source: GhostRiderEventSource = GhostRiderEventSource.Directive): void {
    console.log(source);
  }

  public updateWindow(): void {
    console.log('update window');
  }

  private _goToStep(): void {
    if (this._tourGuide.activeStep) {
      console.log('active step');
    }
  }
}
