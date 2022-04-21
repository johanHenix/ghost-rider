import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

// @Injectable({ providedIn: 'root' })
@Injectable()
export class GhostRiderBackdropService {
  private _renderer: Renderer2;
  private _backdrop!: HTMLElement;

  constructor(
    rendererFactory: RendererFactory2,
  ) {
    this._renderer = rendererFactory.createRenderer(null, null);
  }

  public makeBackdrop(): void {
    this._backdrop = this._renderer.createElement('div');
    this._renderer.addClass(this._backdrop, 'backdrop-container');
    this._renderer.setStyle(this._backdrop, 'background', 'black');
    this._renderer.setStyle(this._backdrop, 'position', 'fixed');
    this._renderer.setStyle(this._backdrop, 'top', '0px');
    this._renderer.setStyle(this._backdrop, 'left', '0px');
    this._renderer.setStyle(this._backdrop, 'width', '100%');
    this._renderer.setStyle(this._backdrop, 'height', '100%');
    this._renderer.setStyle(this._backdrop, 'z-index', '1000');
    this._renderer.setStyle(this._backdrop, 'opacity', '.7');
    this._renderer.appendChild(document.body, this._backdrop);
  }

  public removeBackdrop(): void {
    if (this._backdrop) {
      this._renderer.removeChild(document.body, this._backdrop);
      this._backdrop = undefined as unknown as HTMLElement;
    }
  }
}