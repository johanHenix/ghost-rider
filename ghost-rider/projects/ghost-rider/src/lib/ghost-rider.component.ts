import { Component, OnInit } from '@angular/core';
import { GhostRiderService } from './ghost-rider.service';

@Component({
  selector: 'lib-ghost-rider',
  template: `
    <p>
      ghost-rider works!
    </p>
  `,
  styles: [
  ]
})
export class GhostRiderComponent implements OnInit {

  constructor(
    private readonly _service: GhostRiderService,
  ) { }

  ngOnInit(): void {
  }

  public start(): void {
    this._service.start();
  }

}
