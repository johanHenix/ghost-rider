import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { GhostRiderService } from '../providers/ghost-rider.service';
import { GhostRiderEventSource } from '../models/ghost-rider-step-event.model';

/**
 * Goes to the next step in the tour when clicked
 */
@Directive({ selector: '[ghostRiderStepAdvance]' })
export class GhostRiderStepAdvanceDirective {

  /**
   * If the element has this directive and is clicked, this output will be called and emit a 'MouseEvent' or 'Click' event
   */
  @Output()
  public ghostRiderStepAdvance: EventEmitter<MouseEvent> = new EventEmitter();

  /**
   * 
   * @param _ghostRiderService Injects the service required to perform basic 'tour' operations and lifecycle
   */
  constructor(
    private readonly _ghostRiderService: GhostRiderService,
  ) { }

  /**
   * @param event MouseEvent - data from click in the UI
   */
  @HostListener('click', ['$event'])
  public advance(event: MouseEvent): void {
    this.ghostRiderStepAdvance.emit(event);
    this._ghostRiderService.next(GhostRiderEventSource.Directive);
  }
}
