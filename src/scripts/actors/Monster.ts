import { Actor } from './Actor';
import { ActorParams, ActorAction } from './ActorInterfaces';
import { Position } from '../util/interfaces';
import { Square } from '../map/Square';

/** Hostile critters */
export class Monster extends Actor {

    private awake: number;
    private persistence:number;
    public speed:number;
    private actionsBy:Array<ActorAction>;
    public hasBeenPet:boolean;

    constructor(parameters: ActorParams,persistence?:number, speed?:number,actionsBy?:Array<ActorAction>) {
        super(parameters);
        this.awake = -1;
        this.persistence = (persistence) ? persistence : 8;
        this.speed = (speed) ? speed : 1;
        this.actionsBy = (actionsBy) ? actionsBy : [];
        this.hasBeenPet=false;
    }

    /** Time to do stuff! */
    act() {
        super.act();
        let square: Square;
        if (this.position && this.map) {
            square = this.map.getSquare(this.position.x, this.position.y);
            if (square && square.visible) {
                // Oh no! A fiend!
                if (this.awake < 0 ) {
                    if (this.attitude==='hostile') {
                        this.messenger.addMessage({
                            message: this.map.random.getRandomElement([
                                `${this.name} the ${this.title} comes into view. They look at you and shout!`,
                                `${this.name} the ${this.title} comes into view. They look angry!`,
                                `${this.name} the ${this.title} comes into view. They roar!`,
                                `${this.name} the ${this.title} comes into view. They bare their teeth!`,
                            ])
                        })
                        this.map.player.interruptTravel();
                    }
                    else {
                        this.messenger.addMessage({
                            message: this.map.random.getRandomElement([
                                `${this.name} the ${this.title} comes into view. They purr!`,
                                `${this.name} the ${this.title} comes into view. They roll around cutely.`,
                                `${this.name} the ${this.title} comes into view. They are taking a nap.`,
                                `${this.name} the ${this.title} comes into view. They look happy!`,
                            ])
                        })
                    }
                }
                this.awake=this.persistence;
            }
            else {
                this.awake--;
            }
        }
        /** Sleep. Maybe jitter a bit */
        if (this.awake<0 || !this.map) {
            this.currentGoal=undefined;
            if (!this.behaviours.includes("sleeps") && this.distanceToPlayer() < 10) {
                const steps = [this.map.random.getNumber(-1,1),this.map.random.getNumber(-1,1)];
                this.step(steps[0],steps[1]);
            }
            return;
        }
        /** Ready for action! */
        else {
            if (this.attitude === "hostile") {
                if (!this.currentGoal) {
                    if (this.actionsBy.length > 0) {
                        const actionToDo: ActorAction = this.map.random.getRandomElement(this.actionsBy);
                        let targetPosition: Position|Actor;
                        if (!actionToDo.target || actionToDo.target==="player") {
                            targetPosition = this.map.player;
                        }
                        else {
                            targetPosition = this.getPosition();
                        }
                        this.currentGoal = {
                            target:targetPosition,
                            distance:actionToDo.distance,
                            action:actionToDo.callback
                        };
                    }
                }
            }
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