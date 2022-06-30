import { ExistingProvider } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import * as i0 from "@angular/core";
export declare class GhostRiderOverlayContainer extends OverlayContainer {
    constructor(document: any, platform: Platform);
    protected _createContainer(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<GhostRiderOverlayContainer, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<GhostRiderOverlayContainer>;
}
export declare const GHOST_RIDER_OVERLAY_CONTAINER_PROVIDER: ExistingProvider;
