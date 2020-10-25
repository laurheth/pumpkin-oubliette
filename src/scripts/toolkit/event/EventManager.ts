import { EventManagerParams, Event, QueuedEvent } from './EventManagerInterfaces';

/** Event manager, to keep track of turns */
export class EventManager {

    readonly type: "simple" | "complex";
    private queue: Array<QueuedEvent>;
    private time: number;

    constructor(
        parameters?: EventManagerParams
    ) {
        if (!parameters) {parameters = {}};
        const { type="simple" } = parameters;

        this.type = type;
        this.queue = [];
        this.time = 0;

    };

    /** Add an event to the queue */
    add(event: Event) {
        // Assume repeating if an actor was provided
        if (typeof event.repeats === "undefined" && event.actor) {
            event.repeats=true;
        }
        // Complex event queue uses delay time a bit better
        if (this.type==="complex") {
            if (!event.delay) {
                event.delay = 1;
            }
            const scheduleFor = event.delay + this.time;
            // Insert the event at the appropriate time
            if (this.queue.length===0 || this.queue[this.queue.length-1].time <= scheduleFor) {
                this.queue.push({
                    event:event,
                    time:scheduleFor
                });
            }
            else {
                for(let i=0; i<this.queue.length;i++) {
                    if (scheduleFor < this.queue[i].time) {
                        this.queue.splice(i,0,{
                            event:event,
                            time:scheduleFor
                        });
                        break;
                    }
                }
            }
        }
        else {
            // Simple, no weird time shit
            this.queue.push({
                event:event,
                time:0
            });
        }
    }

    /** Run the next event */
    async advance() {
        // Confirm if there is anything in the queue
        if (this.queue.length === 0) {
            throw new Error("Event queue is empty.");
        }
        // Get the next event
        const thisEvent = this.queue.shift();

        // Update the time
        this.time = thisEvent.time;

        // Check if it needs to repeat
        if (thisEvent.event.repeats) {
            if (typeof thisEvent.event.repeats === "number") {
                thisEvent.event.repeats--;
            }
            // re-add to the queue
            this.add(thisEvent.event);
        }

        // Activate the event
        if (thisEvent.event.callback) {
            await thisEvent.event.callback();
        }
        if (thisEvent.event.actor) {
            await thisEvent.event.actor.act();
        }
    }

    /** Remove actor from the event queue */
    remove(actor:object) {
        const matches:Array<number> = [];
        this.queue.forEach((event,index)=>{
            if (event.event.actor === actor) {
                matches.push(index);
            }
        });

        // Reverse matches (work from the end first)
        matches.reverse();
        
        // Remove each match
        matches.forEach(match=>{
            this.queue.splice(match,1);
        });
    }
}

export default EventManager;