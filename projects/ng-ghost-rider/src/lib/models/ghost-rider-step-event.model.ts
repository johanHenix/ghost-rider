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
  type: GhostRiderEventType | null;
  name: string;
  source: GhostRiderEventSource;
}