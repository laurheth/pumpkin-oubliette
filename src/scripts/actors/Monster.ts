import { Actor } from './Actor';
import { ActorParams, Pronouns, attitude, Goal } from './ActorInterfaces';
import { Art, Position } from '../util/interfaces';
import { Map } from '../map/Map';
import { Square } from '../map/Square';
import { Messenger } from 'scripts/messages/Messenger';

/** Hostile critters */
export class Monster extends Actor {

    private awake: number;
    private persistence:number;
    private speed:number;

    constructor(parameters: ActorParams,persistence?:number, speed?:number) {
        super(parameters);
        this.awake = -1;
        this.persistence = (persistence) ? persistence : 8;
        this.speed = (speed) ? speed : 1;
    }

    /** Time to do stuff! */
    act() {
        let square: Square;
        if (this.position && this.map) {
            square = this.map.getSquare(this.position.x, this.position.y);
            if (square && square.visible) {
                this.awake=this.persistence;
            }
            else {
                this.awake--;
            }
        }
        /** Sleep. Maybe jitter a bit */
        if (this.awake<0) {
            if (!this.behaviours.includes("sleeps") && this.distanceToPlayer() < 10) {
                this.step(this.map.random.getNumber(-1,1), this.map.random.getNumber(-1,1));
            }
            return;
        }
        /** Ready for action! */
        else {
            // TODO: Monster behaviour here
        }
    }

    /** Distance to the player */
    distanceToPlayer() {
        if (this.map && this.position) {
            const playerPos = this.map.player.getPosition();
            return Math.abs(playerPos.x - this.position.x) + Math.abs(playerPos.y - this.position.y);
        }
    }
};