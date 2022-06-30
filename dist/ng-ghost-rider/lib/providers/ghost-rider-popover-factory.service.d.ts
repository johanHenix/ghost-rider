import { ElementRef, Injector, ViewContainerRef } from '@angular/core';
import { Popover } from '../models/ghost-rider-popover.model';
import * as i0 from "@angular/core";
export interface GhostRiderPopoverConfig {
    vcr: ViewContainerRef;
}
export declare class GhostRiderPopoverFactory {
    private readonly _injector;
    constructor(_injector: Injector);
    createPopover<T = any>(elementRef: ElementRef, config?: GhostRiderPopoverConfig): Popover<T>;
    static ɵfac: i0.ɵɵFactoryDeclaration<GhostRiderPopoverFactory, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<GhostRiderPopoverFactory>;
}
