import { SquareParams } from './MapInterfaces';
import { Actor } from '../actors/Actor';
import { Art } from '../util/interfaces';
import { MapNode } from './dataStructures';

/** Each square in the map */
export class Square {
    private baseArt : Art;
    private memoryArt : Art;
    public actor: Actor;
    public passable: boolean;
    public empty: boolean;
    public location: MapNode;
    private _visible: boolean;
    public seen: boolean;
    // items?
    constructor(parameters: SquareParams) {
        this.parameters = parameters;
        this.memoryArt = {art:'',foreground:'gray',background:'black'};
        this.visible = false;
    }

    /** Get the current art for the square */
    get art():Art {
        if (!this.visible) {
            this.memoryArt.foreground='gray';
            this.memoryArt.background='black';
            return this.memoryArt;
        }
        else if (this.actor) {
            this.memoryArt = {...this.actor.art}
            return this.actor.art;
        }
        else {
            this.memoryArt = {...this.baseArt}
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

    get visible():boolean {
        return this._visible;
    }

    set visible(see:boolean) {
        if (see) {
            this.seen=true;
        }
        this._visible = see;
    }
}