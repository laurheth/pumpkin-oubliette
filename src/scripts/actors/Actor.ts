import { ActorParams, Pronouns, attitude } from './ActorInterfaces';
import { Art, Position } from '../util/interfaces';
import { Map } from '../map/Map';

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
            ...rest
        } = parameters;

        // Store all the details
        this.art = {art, foreground, background};
        this.pronouns = pronouns;
        this.name = name;
        this.title = title;
        this.attitude = attitude;
        this.behaviours = behaviours;
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
        console.log(`${this.name} acts!`);
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
            x:this.position.x+dx,
            y:this.position.y+dy
        }
        return this.setPosition(newPosition);
    }
};