import { Actor, allActors } from './Actor';
import { Goal } from './ActorInterfaces';
import { Messenger } from '../messages/Messenger';
import { Position } from '../util/interfaces';

/** The player! */
export class Player extends Actor {

    /** Resolution function to advance */
    finishTurn: (value?:unknown)=>void;

    constructor(messenger: Messenger) {
        super({
            name: "Franklin",
            title: "The Pumpkin Slayer",
            art: '@',
            messenger: messenger,
        });
    };
    
    /** Player turn */
    async act() {
        this.map.drawMap();
        // Check if the player does not currently have any goals. Get a new action if not.
        if (!this.currentGoal) {
            // Promise to await player choice
            const playerActionPromise = new Promise(resolve=>{
                // Store the resolution function
                this.finishTurn = resolve;
            });

            // Determine directions the play can travel to
            const travelOptions = this.map.getTravelOptions(this.position);
            allActors.forEach(actor=>actor.getActionsOn(this));
            console.log('Current node', this.map.getSquare(this.position.x,this.position.y).location, this.position);
            console.log('travelOptions', travelOptions);
            if (travelOptions.length>0) {
                travelOptions.forEach(option=>{
                    this.messenger.addAction({
                        description:option.direction,
                        callback:()=>{
                            this.currentGoal = {
                                target:option.position,
                                midTarget:option.midPosition
                            }
                            this.finishTurn();
                        }
                    });
                });
            }

            // Add to the messages
            // this.messenger.addMessage({message:"Testing?"});
    
            // Display current messages and actions
            this.messenger.generate();
    
            // Wait for the player's selection before advancing
            await playerActionPromise;
            this.messenger.clear();
        }
        // Framerate while executing an actions
        else {
            await new Promise(resolve=>{
                setTimeout(()=>resolve(),20);
            });
        }
        super.act();
    }

    /** Send a message about opening a door */
    doorOpenMessage() {
        this.messenger.addMessage({
            message:'You open the door...',
            importance:Infinity
        });
    }

    swapMessage(actor:Actor) {
        this.messenger.addMessage({
            message:`You jump past ${actor.name} the ${actor.title}!`,
            importance:Infinity
        });
    }

    interruptTravel() {
        if (this.currentGoal && !this.currentGoal.action) {
            this.currentGoal = undefined;
            this.finishTurn();
        }
    }
}