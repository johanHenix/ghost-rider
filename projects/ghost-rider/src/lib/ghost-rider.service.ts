import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GhostRiderService {

  constructor() { }

  public start(): void {
    console.log('START');
  }
}
