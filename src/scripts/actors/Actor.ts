import { ActorParams, Pronouns, attitude, Goal } from './ActorInterfaces';
import { Art, Position } from '../util/interfaces';
import { Map } from '../map/Map';
import { Messenger } from 'scripts/messages/Messenger';
import { PathFinder } from '../toolkit/toolkit';

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

        // Some prep for pathfinding
        this.route=[];
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

    /** It is this actors turn. Do something! */
    act() {
        // A goal exists! Do it.
        if (this.currentGoal) {
            if (this.currentGoal.distance < 0) {this.currentGoal.distance=0;}
            let { target, distance=0, action=()=>{}, midTarget } = this.currentGoal;
            if (midTarget && (midTarget.x !== this.position.x || midTarget.y !== this.position.y)) {
                target = {...midTarget};
            }
            else if (midTarget && midTarget.x === this.position.x && midTarget.y === this.position.y) {
                this.currentGoal.midTarget=undefined;
            }
            if (Math.max(Math.abs(target.x - this.position.x),Math.abs(target.y - this.position.y)) <= distance) {
                this.currentGoal = undefined;
                action();
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
        if (square && square.passable && !square.actor) {
            
            // Remove actor from previous location, if possible
            if (this.position) {
                const previousSquare = this.map.getSquare(this.position.x, this.position.y);
                if (previousSquare && previousSquare.actor === this) {
                    previousSquare.actor = undefined;
                }
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
        return this.setPosition(newPosition);
    }

    /** Take a step towards the given position */
    approach(target: Position) {
        // New target
        if (!this.targetPosition || (this.targetPosition.x !== target.x || this.targetPosition.y !== target.y)) {
            // Store the target, and determine a route
            this.targetPosition = {...target};
            this.route = this.getRoute(target);
        }
        // Next position
        const nextPosition = this.route[0];
        if (nextPosition && !this.step(nextPosition.x - this.position.x, nextPosition.y - this.position.y)) {
            // Next position exists, but we can't go there for some reason
            // Recalculate route
            this.targetPosition = {...target};
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
};