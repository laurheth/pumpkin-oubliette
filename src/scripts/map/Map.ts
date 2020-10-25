import { SquareParams, MapParams, theme, generator } from './MapInterfaces';
import { Art, Position } from '../util/interfaces';
import { Actor } from '../actors/Actor';

/** Each square in the map */
export class Square {
    private baseArt : Art;
    public actor: Actor;
    public passable: boolean;
    public empty: boolean;
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
            passable=true,
            empty=false,
            ...rest
        } = parameters;

        this.baseArt = {art, background, foreground};
        this.passable = passable;
        this.empty = empty;
    }
}

/** Individual room */
export class Room {
    public connections:Array<Room>;
    readonly position:Position;
    public name:string;
    public description:string;
    private exits: {
        north?: Room,
        south?: Room,
        east?: Room,
        west?: Room
    }

    constructor(position:Position, name?:string, description?:string) {
        if (!name) {name="Generic room";}
        if (!description) {description="A very normal room."}

        this.position = position;
        this.exits = {};
    }
}

/** Map class */
export class Map {
    /** Object containing the map data */
    private mapData: Array<Square>;
    private width: number;
    private height: number;

    /** Entry and exit locations */
    public entrance: Position;
    public exit: Position;

    constructor(parameters: MapParams) {
        const {width=30, height=30, source, level=1, theme="default", ...rest} = parameters;
        let generator = rest.generator;

        // Check if a source was provided. If not, generator should be set to default
        // TODO: also check if source even exists and is valid
        if (!source && generator === "json") {
            generator = "default";
        }

        // Prepare the map
        this.width = Math.max(width,1);
        this.height = Math.max(height,1);
        this.allocateMap();

        // Generate
        if (generator === "default") {
            this.generateMap(generator, theme);
        }
    };

    /** Set up the starting squares and fill up the array of mapData */
    allocateMap() {
        this.mapData = [];
        const length = this.width * this.height;
        for (let i=0;i<length;i++) {
            this.mapData.push(new Square({
                art:"",
                passable:true,
                empty:true
            }));
        }
    };

    /** Get a specific square */
    getSquare(x:number,y:number) {
        if (x>=0 && x<this.width && y>=0 && y<this.height) {
            const index = x + y*this.width;
            return (this.mapData[index]);
        }
        else {
            return undefined;
        }
    }

    /** Generate the map */
    generateMap(generator: generator, theme: theme) {

    };

    /** Build a room */
    addRoom(position: Position, width: number, height: number, wall?: Art, floor?:Art):boolean {
        // Some defaults
        if (!wall) {
            wall = {
                art:'#',
                foreground:'white',
                background:'gray'
            }
        }
        if (!floor) {
            floor = {
                art:'.',
                foreground:'gray',
                background:'black'
            }
        }

        const boundaries = {
            left: Math.ceil(position.x - width/2),
            right: Math.ceil(position.x + width/2),
            top: Math.ceil(position.y - height/2),
            bottom: Math.ceil(position.y + height/2)
        };

        // First, determine if the room would even fit
        for (let i=boundaries.left; i<=boundaries.right; i++) {
            for (let j=boundaries.top; j<=boundaries.bottom; j++) {
                if (!this.getSquare(i,j) || !this.getSquare(i,j).empty) {
                    return false;
                }
            }
        }

        // If it does, lets go ahead!
        for (let i=boundaries.left; i<=boundaries.right; i++) {
            for (let j=boundaries.top; j<=boundaries.bottom; j++) {
                if (i===boundaries.left || j===boundaries.top || i===boundaries.right || j===boundaries.bottom) {
                    this.getSquare(i,j).parameters = {
                        art: wall.art,
                        foreground: wall.foreground,
                        background: wall.background,
                        passable: false,
                    }
                }
                else {
                    this.getSquare(i,j).parameters = {
                        art: floor.art,
                        foreground: floor.foreground,
                        background: floor.background,
                        passable: true,
                    }
                }
            }
        }
    }
}