export declare enum GhostRiderEventType {
    Start = 0,
    Next = 1,
    Back = 2,
    Close = 3,
    Complete = 4
}
export declare enum GhostRiderEventSource {
    Directive = 0,
    Popover = 1,
    Manual = 2
}
export interface GhostRiderEvent {
    type: GhostRiderEventType | null;
    name: string;
    source: GhostRiderEventSource;
}
