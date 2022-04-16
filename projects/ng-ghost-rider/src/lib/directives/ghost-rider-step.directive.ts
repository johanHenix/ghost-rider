import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewContainerRef } from '@angular/core';
import { GhostRiderService } from '../ghost-rider.service';
import { GhostRiderStepConfig } from '../models/ghost-rider-step-config.model';
import { GhostRiderStepDetails } from '../models/ghost-rider-step-details.model';
import { GhostRiderEvent } from '../models/ghost-rider-step-event.model';

@Directive({ selector: '[ghostRiderStep]' })
export class GhostRiderStepDirective<T = any> implements GhostRiderStepDetails, OnInit, OnDestroy {
  @Input() // Might want to remove the 'Partial'
  public set ghostRiderStep(config: Partial<GhostRiderStepConfig<T>>) {
    this.config = {
      ...new GhostRiderStepConfig(),
      ...config,
    };
  }

  public get ghostRiderStep(): GhostRiderStepConfig<T> {
    return this.config;
  }


  @Output()
  public ghostRiderStepEvent: EventEmitter<GhostRiderEvent> = new EventEmitter();

  public config!: GhostRiderStepConfig<T>;

	constructor(
    public readonly element: ElementRef<HTMLElement>,
    public readonly vcr: ViewContainerRef,
		private readonly _ghostRiderService: GhostRiderService,
	) { }

	ngOnInit(): void {
		console.log('directive', this);
    if (this.config.name && this.config.shouldRegister) {
      this._ghostRiderService.registerStep(this);
    }
  }

  ngOnDestroy(): void {
    this._ghostRiderService.unregisterStep(this);
  }
}