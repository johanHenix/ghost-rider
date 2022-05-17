import { Directive, HostListener } from '@angular/core';
import { GhostRiderService } from '../providers/ghost-rider.service';
import { GhostRiderEventSource } from '../models/ghost-rider-step-event.model';

@Directive({ selector: '[ghostRiderStepPrevious]' })
export class GhostRiderStepPreviousDirective {

  constructor(
    private readonly _ghostRiderService: GhostRiderService,
  ) { }

  @HostListener('click')
  public previous(): void {
    this._ghostRiderService.back(GhostRiderEventSource.Directive);
  }
}
