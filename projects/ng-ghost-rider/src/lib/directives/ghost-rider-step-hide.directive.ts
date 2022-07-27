import { Directive, HostListener } from '@angular/core';
import { GhostRiderService } from '../providers/ghost-rider.service';

/**
 * Hides the current step when clicked
 */
@Directive({ selector: '[ghostRiderStepHide]' })
export class GhostRiderStepHideDirective {
  constructor(
    private readonly _ghostRiderService: GhostRiderService,
  ) { }

  /**
   * If this directive is placed on an element and a tour is active, this method hide the current step but NOT 'end' the tour
   */
  @HostListener('click')
  public hide(): void {
    if (this._ghostRiderService.activeTour) {
      this._ghostRiderService.hideStep();
    }
  }
}
