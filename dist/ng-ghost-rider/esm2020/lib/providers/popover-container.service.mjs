import { DOCUMENT } from '@angular/common';
import { Injectable, Inject } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/scrolling";
export class GhostRiderRootPopoverContainer {
    constructor(document, _viewportRuler) {
        this._viewportRuler = _viewportRuler;
        this._document = document;
    }
    getBoundingClientRect() {
        const width = this._document.documentElement.clientWidth;
        const height = this._document.documentElement.clientHeight;
        const scrollPosition = this._viewportRuler.getViewportScrollPosition();
        return {
            top: scrollPosition.top,
            left: scrollPosition.left,
            right: scrollPosition.left + width,
            bottom: scrollPosition.top + height,
            width,
            height,
        };
    }
}
GhostRiderRootPopoverContainer.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderRootPopoverContainer, deps: [{ token: DOCUMENT }, { token: i1.ViewportRuler }], target: i0.ɵɵFactoryTarget.Injectable });
GhostRiderRootPopoverContainer.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderRootPopoverContainer, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.4", ngImport: i0, type: GhostRiderRootPopoverContainer, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i1.ViewportRuler }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci1jb250YWluZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25nLWdob3N0LXJpZGVyL3NyYy9saWIvcHJvdmlkZXJzL3BvcG92ZXItY29udGFpbmVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7QUFJbkQsTUFBTSxPQUFPLDhCQUE4QjtJQUcxQyxZQUNtQixRQUFhLEVBQ3ZCLGNBQTZCO1FBQTdCLG1CQUFjLEdBQWQsY0FBYyxDQUFlO1FBRXJDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0lBQzNCLENBQUM7SUFFTSxxQkFBcUI7UUFDM0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDO1FBQ3pELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQztRQUMzRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLHlCQUF5QixFQUFFLENBQUM7UUFFdkUsT0FBTztZQUNOLEdBQUcsRUFBRSxjQUFjLENBQUMsR0FBRztZQUN2QixJQUFJLEVBQUUsY0FBYyxDQUFDLElBQUk7WUFDekIsS0FBSyxFQUFFLGNBQWMsQ0FBQyxJQUFJLEdBQUcsS0FBSztZQUNsQyxNQUFNLEVBQUUsY0FBYyxDQUFDLEdBQUcsR0FBRyxNQUFNO1lBQ25DLEtBQUs7WUFDTCxNQUFNO1NBQ0ssQ0FBQztJQUNkLENBQUM7OzJIQXZCVyw4QkFBOEIsa0JBSWpDLFFBQVE7K0hBSkwsOEJBQThCLGNBRGpCLE1BQU07MkZBQ25CLDhCQUE4QjtrQkFEMUMsVUFBVTttQkFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUU7OzBCQUsvQixNQUFNOzJCQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWaWV3cG9ydFJ1bGVyIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XG5pbXBvcnQgeyBET0NVTUVOVCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBJbmplY3RhYmxlLCBJbmplY3QgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEdob3N0UmlkZXJQb3BvdmVyQ29udGFpbmVyIH0gZnJvbSAnLi4vdG9rZW5zL3BvcG92ZXItY29udGFpbmVyLnRva2VuJztcblxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBjbGFzcyBHaG9zdFJpZGVyUm9vdFBvcG92ZXJDb250YWluZXIgaW1wbGVtZW50cyBHaG9zdFJpZGVyUG9wb3ZlckNvbnRhaW5lciB7XG5cdHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudDtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogYW55LFxuXHRcdHByaXZhdGUgX3ZpZXdwb3J0UnVsZXI6IFZpZXdwb3J0UnVsZXIsXG5cdCkge1xuXHRcdHRoaXMuX2RvY3VtZW50ID0gZG9jdW1lbnQ7XG5cdH1cblxuXHRwdWJsaWMgZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk6IERPTVJlY3Qge1xuXHRcdGNvbnN0IHdpZHRoID0gdGhpcy5fZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuXHRcdGNvbnN0IGhlaWdodCA9IHRoaXMuX2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XG5cdFx0Y29uc3Qgc2Nyb2xsUG9zaXRpb24gPSB0aGlzLl92aWV3cG9ydFJ1bGVyLmdldFZpZXdwb3J0U2Nyb2xsUG9zaXRpb24oKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHR0b3A6IHNjcm9sbFBvc2l0aW9uLnRvcCxcblx0XHRcdGxlZnQ6IHNjcm9sbFBvc2l0aW9uLmxlZnQsXG5cdFx0XHRyaWdodDogc2Nyb2xsUG9zaXRpb24ubGVmdCArIHdpZHRoLFxuXHRcdFx0Ym90dG9tOiBzY3JvbGxQb3NpdGlvbi50b3AgKyBoZWlnaHQsXG5cdFx0XHR3aWR0aCxcblx0XHRcdGhlaWdodCxcblx0XHR9IGFzIERPTVJlY3Q7XG5cdH1cbn1cbiJdfQ==