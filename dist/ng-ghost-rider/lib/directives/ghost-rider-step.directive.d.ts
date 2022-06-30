import { ElementRef, EventEmitter, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { GhostRiderService } from '../providers/ghost-rider.service';
import { GhostRiderStepConfig } from '../models/ghost-rider-step-config.model';
import { GhostRiderStepDetails } from '../models/ghost-rider-step-details.model';
import { GhostRiderEvent } from '../models/ghost-rider-step-event.model';
import { BehaviorSubject } from 'rxjs';
import * as i0 from "@angular/core";
export declare class GhostRiderStepDirective<T = any> implements GhostRiderStepDetails, OnInit, OnDestroy {
    readonly element: ElementRef<HTMLElement>;
    readonly vcr: ViewContainerRef;
    private readonly _ghostRiderService;
    set ghostRiderStep(config: Partial<GhostRiderStepConfig<T>>);
    get ghostRiderStep(): GhostRiderStepConfig<T>;
    ghostRiderStepEvent: EventEmitter<GhostRiderEvent>;
    config: GhostRiderStepConfig<T>;
    active$: BehaviorSubject<boolean>;
    private readonly _subs;
    constructor(element: ElementRef<HTMLElement>, vcr: ViewContainerRef, _ghostRiderService: GhostRiderService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<GhostRiderStepDirective<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<GhostRiderStepDirective<any>, "[ghostRiderStep]", never, { "ghostRiderStep": "ghostRiderStep"; }, { "ghostRiderStepEvent": "ghostRiderStepEvent"; }, never, never, false>;
}
