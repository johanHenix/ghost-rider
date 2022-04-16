import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NgGhostRiderService implements OnDestroy {
  private readonly _subs: Subscription[] = [];

  constructor() {
    console.log('service constructor');
  }

  ngOnDestroy(): void {
    this._subs.forEach((sub) => sub.unsubscribe());
  }

  public registerStep(): void {
    console.log('register step');
  }

  public unregisterStep(): void {
    console.log('unregister step');
  }
}
