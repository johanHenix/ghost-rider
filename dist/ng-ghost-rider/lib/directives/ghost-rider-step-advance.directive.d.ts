import { EventEmitter } from '@angular/core';
import { GhostRiderService } from '../providers/ghost-rider.service';
import * as i0 from "@angular/core";
export declare class GhostRiderStepAdvanceDirective {
    private readonly _ghostRiderService;
    ghostRiderStepAdvance: EventEmitter<MouseEvent>;
    constructor(_ghostRiderService: GhostRiderService);
    advance(event: MouseEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<GhostRiderStepAdvanceDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<GhostRiderStepAdvanceDirective, "[ghostRiderStepAdvance]", never, {}, { "ghostRiderStepAdvance": "ghostRiderStepAdvance"; }, never, never, false>;
}
