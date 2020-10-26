import { WeightedItem } from './RandomInterfaces';

/** Random generator */
export class Random {
    /** Seed */
    seed: number;
    weyl: number;
    x: number;
    base: number;

    constructor(seed?: number, base?:number) {
        if (!seed) {
            // Get seed from milliseconds since Jan 1st, 1970
            seed = Math.floor(Date.now());
        }
        this.seed = seed;
        console.log('Random seed:', this.seed);
        this.weyl = 0;
        this.x = 0;
        this.base = (base) ? base : 100000;

        // Run it a couple of times, in case the seed isn't that good.
        for (let i=0;i<10;i++) {
            this.getRandom();
        }
    };

    /** Generate a random number from 0 <= number < 1 */
    // An attempt to reproduce something resembling the Middle Square Weyl Sequence PRNG
    // See Widynski (2017) https://arxiv.org/abs/1704.00358v5
    // The above algorithm uses unsigned ints. JS uses signed floats. Further testing required to see whether or not this is actually a problem.
    getRandom():number {
        this.x *= this.x;
        this.x += (this.weyl += this.seed);
        // Note, >>> makes the shift be unsigned. The >>> 0 at the end flips the "sign" bit to be positive, ensuring a non-negative result.
        this.x = ((this.x >>> 32) | (this.x << 32)) >>> 0;
        return (this.x % this.base) / this.base;
    }

    /** Get a random number in a range */
    getNumber(min:number, max:number, integer?:boolean) {
        if (typeof integer === "undefined") {
            if (Number.isInteger(min) && Number.isInteger(max)) {
                integer = true;
            }
        }
        if (integer) {
            return Math.floor(this.getRandom() * (max + 1 - min)) + Math.ceil(min);
        }
        else {
            return (this.getRandom() * (max - min)) + min;
        }
    }

    /** Get a random element from an array */
    getRandomElement(array:Array<any>) {
        const randomIndex = this.getNumber(0,array.length-1,true);
        return array[randomIndex];
    }

    /** Get a random element, with weights */
    getWeightedElement(array:Array<WeightedItem>) : any {
        let totalWeight = 0;
        let integer = true;
        array.forEach(element=>{
            totalWeight += element.weight;
            integer = integer && Number.isInteger(element.weight);
        })

        let randomNumber = this.getNumber((integer) ? 1 : 0,totalWeight,integer);

        // Go through the array until we have a winner
        for (let i=0;i<array.length;i++) {
            randomNumber -= array[i].weight;
            if (randomNumber <= 0) {
                // Found it!
                return array[i].option;
            }
        }

        // Not found; seems like a problem
        throw new Error("No match found.");
    }
}