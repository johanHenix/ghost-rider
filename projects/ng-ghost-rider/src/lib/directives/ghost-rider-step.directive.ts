import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewContainerRef } from '@angular/core';
import { GhostRiderService } from '../providers/ghost-rider.service';
import { GhostRiderStepConfig } from '../models/ghost-rider-step-config.model';
import { GhostRiderStepDetails } from '../models/ghost-rider-step-details.model';
import { GhostRiderEvent } from '../models/ghost-rider-step-event.model';
import { BehaviorSubject, Subscription } from 'rxjs';

/**
 * Directive to register an element a step in the tour.
 * 
 * @param ghostRiderStep - Config object to customize the step
 */
@Directive({ selector: '[ghostRiderStep]' })
export class GhostRiderStepDirective<T = any> implements GhostRiderStepDetails, OnInit, OnDestroy {
  @Input() // Might want to remove the 'Partial'
  public set ghostRiderStep(config: Partial<GhostRiderStepConfig<T>>) {
    this.config = {
      ...new GhostRiderStepConfig(),
      ...config,
    };
  }

  /**
   * Sets up how the 'step' should work in the tour
   */
  public get ghostRiderStep(): GhostRiderStepConfig<T> {
    return this.config;
  }

  /**
   * Emits anytime there is a step event. ie: Start, Next, Back, Close, Complete...
   * Please look at the 'model' => '../models/ghost-rider-step-event.model'
   */
  @Output()
  public ghostRiderStepEvent: EventEmitter<GhostRiderEvent> = new EventEmitter();

  public config: GhostRiderStepConfig<T>;

  /**
   * This is a subject to indicate when there a 'tour' is active or not.
   */
  public active$: BehaviorSubject<boolean> = new BehaviorSubject(false as boolean);

  private readonly _subs: Subscription[] = []; // Make sure to unsubscribe when you use it 🤘🏻

  constructor(
    public readonly element: ElementRef<HTMLElement>,
    public readonly vcr: ViewContainerRef,
    private readonly _ghostRiderService: GhostRiderService,
  ) { }

  /**
   * Register a new step when this Directive is placed
   */
  ngOnInit(): void {
    if (this.config.name && this.config.shouldRegister) {
      this._ghostRiderService.registerStep(this);
    }
  }

  /**
   * Clean up this step when destroyed
   */
  ngOnDestroy(): void {
    if (this.config && this.config.name) {
      this._ghostRiderService.unregisterStep(this);
    }

    /**
     * Unsubscribe from all subs
     */
    this._subs.forEach((sub) => sub.unsubscribe());
  }
}