/** Function to check if a tile is passable */
type canPass = (position:Array<number>)=>boolean;
/** Function to guess at approximate distance to target */
type metric = (position1:Array<number>, position2:Array<number>)=>number;

interface location {
    position: Array<number>;
    steps: number;
    distanceFromGoal: number;
    previousLocation: location|null;
}

/** Pathfinder to determine how to travel from one point to another */
export class PathFinder {
    private canPass:canPass;
    private metric:metric;

    constructor(canPass:canPass, metric?:metric) {
        this.canPass = canPass;
        if (!metric) {
            // Default metric is Manhattan metric, if none provided
            metric = (position1:Array<number>, position2:Array<number>) => {
                return Math.abs(position2[1] - position1[1]) + Math.abs(position2[0] - position1[0]);
            };
        }
        this.metric = metric;
    }

    /** Find route from startPosition to endPosition, via A* */
    findPath(startPosition:Array<number>, endPosition:Array<number>): Array<Array<number>> {
        const route: Array<Array<number>> = [];

        // Limit the loop so it doesn't break things
        const maxIterations = 40 * this.metric(startPosition, endPosition);
        let iterations=0;

        // Initialize the list, and add the start to it
        const closedList:Array<location> = [
            {
                position:[...startPosition],
                steps:0,
                distanceFromGoal:this.metric(startPosition, endPosition),
                previousLocation: null
            }
        ];

        const openList:Array<location> = [];

        // Handle diagonals
        const stepSize = [0,1,1.2];

        // Find a path
        while(
            iterations < maxIterations &&
            !this.contains(closedList, endPosition)
        ){
            iterations++;

            // Expand the open list
            closedList.forEach(location=>{
                for (let i=-1;i<2;i++) {
                    for (let j=-1;j<2;j++) {
                        const newPosition = [location.position[0]+i, location.position[1]+j];
                        if (!this.canPass(newPosition)) {
                            continue;
                        }
                        const inClosedListAlready = this.getLocation(closedList,newPosition);
                        const inOpenListAlready = this.getLocation(openList, newPosition);
                        // New position is in neither list
                        if (!inClosedListAlready && !inOpenListAlready) {
                            openList.push({
                                position: newPosition,
                                steps: location.steps+stepSize[Math.abs(i)+Math.abs(j)],
                                distanceFromGoal: this.metric(newPosition,endPosition),
                                previousLocation: location
                            })
                        }
                        else {
                            if (inClosedListAlready && inClosedListAlready.steps > location.steps+stepSize[Math.abs(i)+Math.abs(j)]) {
                                inClosedListAlready.steps = location.steps+stepSize[Math.abs(i)+Math.abs(j)];
                                inClosedListAlready.previousLocation = location;
                            }
                            if (inOpenListAlready && inOpenListAlready.steps > location.steps+stepSize[Math.abs(i)+Math.abs(j)]) {
                                inOpenListAlready.steps = location.steps+stepSize[Math.abs(i)+Math.abs(j)];
                                inOpenListAlready.previousLocation = location;
                            }
                        }
                    }
                }
            });

            // Sort the open list (highest --> lowest)
            openList.sort((a,b)=>(b.steps+b.distanceFromGoal) - (a.steps+a.distanceFromGoal));

            // Pop off the lowest openList item and add it to the closed list
            closedList.push(openList.pop());
        }

        // Found a route! Put the pieces together by working backwards
        let location = this.getLocation(closedList,endPosition);
        if (this.contains(closedList,endPosition)) {
            iterations=0;
            while((location.position[0] !== startPosition[0] || location.position[1] !== startPosition[1]) && iterations < maxIterations) {
                iterations++;
                route.push(location.position);
                location = location.previousLocation;
            }
        }

        return route.reverse();
    }

    private isEqual(position1: location, position2: location): boolean {
        return (position1.position[0] === position2.position[0] && position1.position[1] === position2.position[1]);
    }

    private contains(locationList: Array<location>, testLocation:location|Array<number>): boolean {
        if (Array.isArray(testLocation)) {
            return locationList.some(location=>{
                return (location.position[0] === testLocation[0] && location.position[1] === testLocation[1]);
            });
        }
        else {
            return locationList.some(location=>{
                return this.isEqual(location, testLocation);
            });
        }
    }

    private getLocation(locationList: Array<location>,testPosition:Array<number>): location {
        for (const location of locationList) {
            if (location.position[0] === testPosition[0] && location.position[1] === testPosition[1]) {
                return location;
            }
        }
        return undefined;
    }

}