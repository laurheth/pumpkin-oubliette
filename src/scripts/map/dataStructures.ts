import { Position } from '../util/interfaces';

/** Node on the map */
export class MapNode {
    public connections:Array<MapNode>;
    public position:Position;
    public name:string;
    public description:string;
    constructor(position:Position, name?:string, description?:string) {
        if (!name) {name="Generic location";}
        if (!description) {description="A very normal location."}

        this.name=name;
        this.description=description;
        this.position=position;
        this.connections = [];
    }
}

/** Individual room */
export class Room extends MapNode {
    constructor(position:Position, name?:string, description?:string) {
        if (!name) {name="Generic room";}
        if (!description) {description="A very normal room."}
        super(position, name, description);
    }
}

/** Hallway */
export class Hallway extends MapNode {

    /** Array of positions for each square */
    public squarePositions: Array<Position>;

    constructor(name?:string, description?:string) {
        if (!name) {name="Generic hallway";}
        if (!description) {description="A very normal hallway."}
        // Placeholder position
        const position = {x:-1,y:-1};
        super(position, name, description);
        this.squarePositions=[];
    }

    /** Add square positions */
    addSquares(squarePositions: Array<Position>) {
        squarePositions.forEach(position=>{
            this.squarePositions.push(position);
        });
        this.computePosition();
    }

    /** Get the most central square in the hallway */
    computePosition() {
        const positions = this.squarePositions;
        let totalX=0;
        let totalY=0;

        positions.forEach(position=>{
            totalX += position.x;
            totalY += position.y;
        });

        // Mean position
        const meanPosition:Position = {
            x: totalX / positions.length,
            y: totalY / positions.length
        };

        let index=-1;
        let minDistance=Infinity;
        positions.forEach((position,i)=>{
            const distance = Math.abs(meanPosition.x - position.x)**2 + Math.abs(meanPosition.y - position.y)**2;
            if (distance < minDistance) {
                minDistance = distance;
                index=i;
            }
        });

        // Store the middle-most position
        this.position = positions[index];
    }
}