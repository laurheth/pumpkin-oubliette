import { Actor } from './Actor';
import { ActorParams } from './ActorInterfaces'

/** The player! */
export class Player extends Actor {
    constructor() {
        super({
            name: "Franklin",
            title: "The Pumpkin Slayer",
            art: '@',
        });
    };

    async act() {
        console.log('Player thinking about their action...')
        await new Promise(resolve => setTimeout(()=>{
            console.log('Player acts!')
            resolve();
        },5000));
    }
}