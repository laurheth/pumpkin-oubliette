import { ActorParams, Pronouns, attitude } from './ActorInterfaces';
import { Art } from '../util/interfaces';

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
};