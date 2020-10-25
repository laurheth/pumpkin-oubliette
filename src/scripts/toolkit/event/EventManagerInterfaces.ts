/** Setup parameters for the event manager */
export interface EventManagerParams {
    type?:"simple"|"complex";
    cyclic?:boolean;
}

export interface Event {
    repeats?:boolean|number;
    delay?:number;
    callback:()=>void;
    actor?:object;
}

export interface QueuedEvent {
    event: Event;
    time:number;
}