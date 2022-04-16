import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { GhostRiderStepDetails } from './models/ghost-rider-step-details.model';

@Injectable({
  providedIn: 'root'
})
export class GhostRiderService implements OnDestroy {
  private readonly _steps: Map<string, any> = new Map();
  private readonly _activeTour$ = new BehaviorSubject(false);
  private readonly _stepAdded$ = new Subject<string>();
  private readonly _subs: Subscription[] = [];

  public get activeTour(): boolean {
    return this._activeTour$.getValue();
  }

  constructor() {
    console.log('service constructor');
  }

  ngOnDestroy(): void {
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

  public start(): void {
    console.log('starting tour');
    this._activeTour$.next(true);
  }

  public complete(): void {
    this.close();
  }

  public close(): void {
    this._activeTour$.next(false);
  }
}
