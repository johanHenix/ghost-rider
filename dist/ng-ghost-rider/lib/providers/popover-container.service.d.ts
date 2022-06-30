import { ViewportRuler } from '@angular/cdk/scrolling';
import { GhostRiderPopoverContainer } from '../tokens/popover-container.token';
import * as i0 from "@angular/core";
export declare class GhostRiderRootPopoverContainer implements GhostRiderPopoverContainer {
    private _viewportRuler;
    private _document;
    constructor(document: any, _viewportRuler: ViewportRuler);
    getBoundingClientRect(): DOMRect;
    static ɵfac: i0.ɵɵFactoryDeclaration<GhostRiderRootPopoverContainer, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<GhostRiderRootPopoverContainer>;
}
