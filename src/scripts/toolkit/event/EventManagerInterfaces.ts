/** Setup parameters for the event manager */
export interface EventManagerParams {
    type?:"simple"|"complex";
    cyclic?:boolean;
}

interface Actor {
    act:()=>Promise<any>|void;
}

export interface Event {
    repeats?:boolean|number;
    delay?:number;
    callback?:()=>Promise<any>|void;
    actor?:Actor;
}

export interface QueuedEvent {
    event: Event;
    time:number;
}