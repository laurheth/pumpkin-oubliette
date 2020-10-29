import { Actor } from './Actor';
import { ActorParams, Pronouns, attitude, Goal, ActorAction } from './ActorInterfaces';
import { Art, Position } from '../util/interfaces';
import { Map } from '../map/Map';
import { Square } from '../map/Square';
import { EventManager } from '../toolkit/toolkit';
import { Messenger } from 'scripts/messages/Messenger';

/** Generate monster */
export const generateMonster = (messenger:Messenger, eventManager:EventManager)=>{
    const newMonster = new Monster({
        art:'🎃',
        name:'Pumpkin',
        title:'Pumpkin',
        messenger:messenger,
        attitude:'hostile',
        actionsOn:[
            {
                distance:1,
                callback:(doer:Actor, doner:Actor)=>{
                    messenger.addMessage({
                        message:"You fed the pumpkin!",
                        importance:3
                    })
                    doner.health -= 10;
                },
                description:'Feed the pumpkin.'
            }
        ],
        health:3
    },8,2,[
        {
            distance:1,
            callback:(doer:Actor, doner:Actor)=>{
                messenger.addMessage({
                    message:"The pumpkin fed YOU!",
                    importance:2
                })
                doner.health -= 2;
            },
            description:''
        }
    ]);

    eventManager.add({
        actor:newMonster,
        delay:newMonster.speed
    });

    return newMonster;
};

/** Hostile critters */
export class Monster extends Actor {

    private awake: number;
    private persistence:number;
    public speed:number;
    private actionsBy:Array<ActorAction>;

    constructor(parameters: ActorParams,persistence?:number, speed?:number,actionsBy?:Array<ActorAction>) {
        super(parameters);
        this.awake = -1;
        this.persistence = (persistence) ? persistence : 8;
        this.speed = (speed) ? speed : 1;
        this.actionsBy = (actionsBy) ? actionsBy : [];
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
                    this.messenger.addMessage({
                        message:`${this.name} the ${this.title} comes into view!`
                    })
                    this.map.player.interruptTravel();
                }
                this.awake=this.persistence;
            }
            else {
                this.awake--;
            }
        }
        /** Sleep. Maybe jitter a bit */
        if (this.awake<0 || !this.map) {
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