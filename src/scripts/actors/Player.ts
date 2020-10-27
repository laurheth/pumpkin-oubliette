import { Actor } from './Actor';
import { Messenger } from '../messages/Messenger';

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

        // Promise to await player choice
        const playerActionPromise = new Promise(resolve=>{
            // Store the resolution function
            this.finishTurn = resolve;
        });

        // Display current messages and actions
        this.messenger.message('Test',[{description:"Do a thing",callback:()=>this.finishTurn()}]);

        // Wait for the player's selection before advancing
        await playerActionPromise;
        this.messenger.clear();
    }
}