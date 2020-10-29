import { Random } from '../toolkit/toolkit';

const prefixes = [
    "Fran",
    "Sa",
    "Ra",
    "Al",
    "Lau",
    "Em",
    "Bo",
    "Shru",
    "Ad",
    "Ran",
    "San",
    "An",
    "Dan",
    "Reg",
    "Char"
];

const suffixes = [
    "chesca",
    "klin",
    "lly",
    "chel",
    "exis",
    "ren",
    "ma",
    "nnie",
    "ti",
    "am",
    "dy",
    "iel",
    "ron",
    "inald",
    "lie"
]

/** Name generator */
export class NameGen {
    private names:Array<string>;
    private random:Random;
    constructor(random: Random) {
        this.random=random;
        this.names=[];
    }

    getName(params:{prefix?:string, suffix?:string}) {
        let name;
        let attempts=0;
        do {
            const prefix = (params.prefix) ? params.prefix : this.random.getRandomElement(prefixes);
            const suffix = (params.suffix) ? params.suffix : this.random.getRandomElement(suffixes);
            name = prefix+ suffix;
            attempts++;
        } while (this.names.includes(name) && attempts<10);
        return name;
    }

    clearNames() {
        this.names=[];
    }
}