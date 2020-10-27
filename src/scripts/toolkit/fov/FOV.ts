/** Vision callback function */
type canSee = (position:Array<number>)=>boolean

/** Angles that are in shadows */
interface Shadow {
    startAngle: number;
    endAngle: number;
}

/** Field of view */
export class FOV {

    private canSee:canSee;
    private range:number;

    /** Accepts a callback function to determine if a location is seethrough */
    constructor(canSee:canSee, range?:number) {
        this.canSee = canSee;
        this.range = range ? range : 8;
    };

    /** Do the FOV calculation */
    look(position:Array<number>, lookRangeOverride?:number) {
        const range = (lookRangeOverride) ? lookRangeOverride : this.range;
        // See the starting location (hooray! Great start)
        this.canSee(position);
        // const lookTiles:Array<Tile> = [];
        const shadows:Array<Shadow> = [];
        const newShadows:Array<Shadow> = [];

        // From nearby to far away
        for (let distance=1;distance<=range;distance++) {
            // Get square shell around position
            for (let i=-distance;i<=distance;i++) {
                for (let j=-distance;j<=distance;j++) {
                    if (Math.abs(i) !== distance && Math.abs(j) !== distance) {
                        continue;
                    }
                    const lookPos = [position[0]+i, position[1]+j];
                    const dist = this.distance(position, lookPos);
                    // Out of range? Skip.
                    if (dist > range) {
                        continue;
                    }
                    // In shadows? Skip.
                    const angleTo = this.angleTo(position, lookPos);
                    const angularSize = this.angularSize(position, lookPos) / 2;
                    if(
                        this.isInShadows(angleTo, shadows) &&
                        this.isInShadows(angleTo+angularSize, shadows) &&
                        this.isInShadows(angleTo-angularSize, shadows )) {
                        continue;
                    }
                    
                    // Now, test if we can see through the tile
                    if(!this.canSee(lookPos)) {
                        // Square is opaque! Add its shadow
                        newShadows.push({
                            startAngle: angleTo - angularSize,
                            endAngle: angleTo + angularSize
                        });
                    }
                }
            }
            // Add newShadows to shadows
            while(newShadows.length>0) {
                shadows.push(newShadows.pop());
            }
        }
    };

    /** Get angle a tile resides in
     * This ranges from -180 to 180, so be careful
    */
    angleTo(startPosition: Array<number>, endPosition: Array<number>) {
        const y = endPosition[1] - startPosition[1];
        const x = endPosition[0] - startPosition[0];
        return 180*Math.atan2(y,x)/Math.PI;
    };

    /** Get angular size of a square */
    angularSize(startPosition: Array<number>, endPosition: Array<number>) {
        const distance = this.distance(startPosition,endPosition);
        return 360*Math.atan(1/(distance))/Math.PI;
    }

    /** Get distance */
    distance(startPosition: Array<number>, endPosition: Array<number>) {
        return Math.sqrt((endPosition[1] - startPosition[1])**2 + (endPosition[0] - startPosition[0])**2);
    }

    /** Check if in shadows */
    isInShadows(angle:number, shadows:Array<Shadow>): boolean {
        const negAngle = angle - 360;
        for (const shadow of shadows) {
            if ((angle < shadow.endAngle && angle > shadow.startAngle) || (negAngle < shadow.endAngle && negAngle > shadow.startAngle)) {
                return true;
            }
        }
        return false;
    }
}