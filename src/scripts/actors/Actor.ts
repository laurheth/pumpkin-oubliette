import { ActorParams, Pronouns, attitude, Goal, ActorAction } from './ActorInterfaces';
import { Player } from './Player';
import { Art, Position } from '../util/interfaces';
import { Map } from '../map/Map';
import { Messenger } from 'scripts/messages/Messenger';

export const allActors:Array<Actor> = [];

/** Monsters, the player, etc. Things that move and do stuff */
export class Actor {

    /** Pronouns to use in descriptions */
    public pronouns: Pronouns;

    /** Attitude towards the player */
    protected attitude: attitude;

    /** Behaviours */
    protected behaviours: Array<string>;

    /** Representation on the map */
    protected _art: Art;

    /** Name of the actor */
    public name: string;

    /** Fancy title of the actor */
    public title: string;

    /** Map the actor lives on */
    protected map: Map;

    /** Position of the actor */
    protected position: Position;

    /** Target position of the actor */
    protected targetPosition: Position;
    protected route: Array<Position>;

    /** Messenger object */
    protected messenger: Messenger;

    /** Actor's current goal */
    protected currentGoal: Goal;

    /** Actions that can be performed on this actor */
    protected actionsOn: Array<ActorAction>;

    protected _health:number;

    protected alive:boolean;

    public attack:number;
    public defense:number;

    constructor(parameters: ActorParams) {
        const {
            art,
            name,
            pronouns={subject:"they", object:"them", possessive:"their"},
            foreground='white',
            background='inherit',
            attitude='neutral',
            behaviours=[],
            title="",
            messenger,
            actionsOn=[],
            health=Infinity,
            attack=2,
            defense=2,
            ...rest
        } = parameters;

        
        // Store all the details
        this.art = {art, foreground, background};
        this.pronouns = pronouns;
        this.name = name;
        this.title = title;
        this.attitude = attitude;
        this.behaviours = behaviours;
        this.messenger = messenger;
        this.actionsOn = actionsOn;
        this.health = health;
        this.attack=attack;
        this.defense=defense;
        this.alive = true;

        // Some prep for pathfinding
        this.route=[];

        allActors.push(this);
    }

    /** Remove from the actor and all references */
    remove() {
        // Ded
        this.alive=false;
        // Remove from actor record
        const index = allActors.indexOf(this);
        if (index>=0) {
            allActors.splice(index,1);
        }
        // Remove from map stuff
        if (this.map) {
            this.map.eventManager.remove(this);
            this.map.getSquare(this.position.x,this.position.y).actor=undefined;
            this.position=undefined;
        }
    }

    /** Art for the actor */
    get art():Art {
        return this._art;
    }
    
    set art(newArt: Art) {
        if (!this._art) {
            this._art = {
                art: '@',
                foreground: 'white',
                background: 'black'
            };
        }
        if (newArt.art) {this._art.art = newArt.art;}
        if (newArt.foreground) {this._art.foreground = newArt.foreground;}
        if (newArt.background) {this._art.background = newArt.background;}''
    }

    /** Health of the actor */
    get health():number {
        return this._health;
    }

    set health(newHealth:number) {
        if (this._health > newHealth) {
            this.attitude = "hostile";
        }
        else if (this._health < newHealth) {
            this.attitude = "friendly";
            this.currentGoal=undefined;
        }
        this._health = newHealth;
        if (newHealth <= 0) {
            this.die();
        }
    }

    die() {
        this.messenger.addMessage({message:`${this.name} the ${this.title} dies!`})
        this.remove();
    }

    /** It is this actors turn. Do something! */
    act() {
        // A goal exists! Do it.
        if (this.currentGoal && this.alive) {
            if (this.currentGoal.distance < 0) {this.currentGoal.distance=0;}
            let { target, distance=0, action=()=>{}, midTarget } = this.currentGoal;
            if (target instanceof Actor) {target = target.getPosition();}
            if (midTarget && (midTarget.x !== this.position.x || midTarget.y !== this.position.y)) {
                target = {...midTarget};
            }
            else if (midTarget && midTarget.x === this.position.x && midTarget.y === this.position.y) {
                this.currentGoal.midTarget=undefined;
            }
            const targetDistance = Math.max(Math.abs(target.x - this.position.x),Math.abs(target.y - this.position.y));
            if (targetDistance <= distance || (targetDistance <= 1 && this.map.getSquare(target.x, target.y).actor && this.map.getSquare(target.x, target.y).actor !== this)) {
                this.currentGoal = undefined;
                action(this,this.map.getSquare(target.x,target.y).actor);
            }
            else {
                this.approach(target);
            }
        }
    }

    /** Attach to a position, and a specific map if not defined otherwise */
    setPosition(position: Position, map?:Map): boolean {
        if (!this.map && !map) {
            throw new Error("Actor is not on the map!");
        }

        if (map) {
            this.map = map;
        }

        // Get the square to move the actor to
        const square = this.map.getSquare(position.x, position.y);
        if (square && square.passable) {
            
            // Remove actor from previous location, if possible
            if (this.position) {
                const previousSquare = this.map.getSquare(this.position.x, this.position.y);
                if (previousSquare && previousSquare.actor === this) {
                    previousSquare.actor = undefined;
                }
            }

            // Swap places
            if(square.actor && square.actor !== this) {
                this.swapMessage(square.actor);
                square.actor.setPosition(this.position);
            }
            
            // Move to the new location
            square.actor = this;
            this.position = position;
            return true;
        }
        else {
            return false;
        }
    }

    /** Get current position */
    getPosition(): Position {
        return this.position;
    }

    /** Take a step */
    step(dx: number, dy: number): boolean {
        const newPosition = {
            x:this.position.x+Math.round(dx),
            y:this.position.y+Math.round(dy)
        }
        // Is this a door?
        const newSquare = this.map.getSquare(newPosition.x,newPosition.y)
        if ( newSquare && newSquare.door) {
            if ( !newSquare.isOpen ) {
                this.doorOpenMessage()
                newSquare.toggleDoor();
                return true;
            }
        }
        // Move
        return this.setPosition(newPosition);
    }

    /** Take a step towards the given position */
    approach(target: Position) {
        // New target
        if (!this.targetPosition || (this.targetPosition.x !== target.x || this.targetPosition.y !== target.y)) {
            // Store the target, and determine a route
            this.targetPosition = target;
            this.route = this.getRoute(target);
        }
        // Next position
        const nextPosition = this.route[0];
        if (nextPosition && !this.step(nextPosition.x - this.position.x, nextPosition.y - this.position.y)) {
            // Next position exists, but we can't go there for some reason
            // Recalculate route
            this.targetPosition = target;
            this.route = this.getRoute(target);
        }

        if (nextPosition && this.position.x === nextPosition.x && this.position.y === nextPosition.y) {
            this.route.shift();
        }
    }

    /** Get route */ 
    getRoute(target:Position) {
        // Do nothing if no associated map
        if (this.map && this.position && target) {
            const route = this.map.pathFinder.findPath([this.position.x, this.position.y],[target.x,target.y]);
            // Format route into a form the actor will understand
            return route.map(pos=>{
                return {
                    x:pos[0],
                    y:pos[1]
                }
            });
        }
    }

    /** Send a message about opening a door */
    doorOpenMessage() {
        if (this.map.getSquare(this.position.x,this.position.y).visible) {
            this.messenger.addMessage({
                message:`A door creaks open. ${this.name} the ${this.title} approaches!`,
                importance:2
            });
        }
    }

    /** Swap position message */
    swapMessage(actor:Actor) {}

    /** Add actions on */
    addActionOn(newAction: ActorAction) {
        this.actionsOn.push(newAction);
    }

    /** Remove action */
    removeActionOn(removeAction: ActorAction) {
        const index = this.actionsOn.indexOf(removeAction);
        if (index>=0) {
            this.actionsOn.splice(index,1);
        }
    }

    /** Get actions on */
    getActionsOn(performer:Actor,performerTags:Array<string>) {
        // Include attitude in tags
        const tags = [...performerTags, this.attitude];
        if (this.map && this.messenger && this.actionsOn.length>0) {
            if(this.map.getSquare(this.position.x, this.position.y).visible) {
                this.actionsOn.forEach(action=>{
                    if (action.condition) {
                        if (typeof action.condition === "string") {
                            if (!tags.includes(action.condition)) {return;}
                        }
                        else {
                            if (action.condition.some(condition=>!tags.includes(condition))) {return;}
                        }
                    }
                    this.messenger.addAction({
                        description: action.description,
                        callback: ()=>{
                            performer.currentGoal = {
                                target:this,
                                action:()=>action.callback(performer,this),
                                distance:action.distance
                            };
                            performer.finishTurn();
                        },
                    });
                });
            }
        }
    }

    /** Performer an attack */
    attemptAttack(target:Actor, bonusAttack?:number):boolean {
        if (target.attitude === "friendly") {
            return true;
        }
        let attack = this.attack+1;
        const defense = target.defense;
        if (bonusAttack) {attack+=bonusAttack;}

        let success=0;
        for (let i=0;i<Math.max(1,attack);i++) {
            if (this.map.random.getRandom() > 0.5) {
                success++;
            }
        }
        for (let i=0;i<Math.max(1,defense);i++) {
            if (this.map.random.getRandom() > 0.5) {
                success--;
            }
        }
        return (success>0);
    }

    finishTurn() {}
};