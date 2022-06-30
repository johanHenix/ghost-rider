import { ElementRef, ViewContainerRef, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { GhostRiderStepConfig } from './ghost-rider-step-config.model';
import { GhostRiderEvent } from './ghost-rider-step-event.model';
export interface GhostRiderStepDetails<T = any> {
    ghostRiderStep: GhostRiderStepConfig<T>;
    config: GhostRiderStepConfig<T>;
    element: ElementRef<HTMLElement>;
    vcr: ViewContainerRef;
    ghostRiderStepEvent: EventEmitter<GhostRiderEvent>;
    active$: Subject<boolean>;
}
