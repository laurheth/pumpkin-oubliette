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
    "Char",
    "Greg",
    "Cal",
    "Ein",
    "Ja",
    "Chri",
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
    "lie",
    "ory",
    "vin",
    "stein",
    "son",
    "stine"
]

/** Name generator */
export class NameGen {
    private names:Array<string>;
    private random:Random;

    private ghostNames:Array<string>;

    constructor(random: Random) {
        this.random=random;
        this.names=[];
        this.ghostNames=[];
    }

    getName(params:{prefix?:string, suffix?:string}) {
        let name;
        let attempts=0;
        do {
            const prefix = (params.prefix) ? params.prefix : this.random.getRandomElement(prefixes);
            const suffix = (params.suffix) ? params.suffix : this.random.getRandomElement(suffixes);
            name = prefix+ suffix;
            attempts++;
        } while (this.names.includes(name) && attempts<20);
        return name;
    }

    getGhostName() {
        if (this.ghostNames.length>0) {
            return this.ghostNames.shift();
        }
        else {
            return "";
        }
    }

    clearNames() {
        this.names=[];
    }

    addGhost(name:string,priority=false) {
        if (priority) {
            this.ghostNames.unshift(name);
        }
        else {
            this.ghostNames.push(name);
        }
    }
}