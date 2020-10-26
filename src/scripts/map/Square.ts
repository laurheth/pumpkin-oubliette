import { SquareParams } from './MapInterfaces';
import { Actor } from '../actors/Actor';
import { Art } from '../util/interfaces';
import { MapNode } from './dataStructures';

/** Each square in the map */
export class Square {
    private baseArt : Art;
    public actor: Actor;
    public passable: boolean;
    public empty: boolean;
    public location: MapNode;
    // items?
    constructor(parameters: SquareParams) {
        this.parameters = parameters;
    }

    /** Get the current art for the square */
    get art():Art {
        if (this.actor) {
            return this.actor.art;
        }
        else {
            return this.baseArt;
        }
    }

    /** Set the square parameters */
    set parameters(parameters: SquareParams) {
        const {
            art,
            foreground='white',
            background='black',
            passable=false,
            empty=false,
            location,
            ...rest
        } = parameters;

        this.baseArt = {art, background, foreground};
        this.passable = passable;
        this.empty = empty;
        this.location = location;
    }

    get parameters(): SquareParams {
        return {
            art: this.baseArt.art,
            foreground: this.baseArt.foreground,
            background: this.baseArt.background,
            passable: this.passable,
            empty: this.empty,
            location: this.location
        };
    }
}