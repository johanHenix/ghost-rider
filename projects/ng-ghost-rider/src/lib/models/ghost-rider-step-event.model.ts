export enum GhostRiderEventType {
  Start,
  Next,
  Back,
  Close,
  Complete,
}

export enum GhostRiderEventSource {
  Directive,
  Popover,
  Manual,
}

export interface GhostRiderEvent {
  type: GhostRiderEventType;
  name: string;
  source: GhostRiderEventSource;
}