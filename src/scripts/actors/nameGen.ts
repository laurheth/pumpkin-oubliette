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
]

/** Name generator */
export class NameGen {
    private random:Random;
    constructor(random: Random) {
        this.random=random;
    }

    getName(params:{prefix?:string, suffix?:string}) {
        const prefix = (params.prefix) ? params.prefix : this.random.getRandomElement(prefixes);
        const suffix = (params.suffix) ? params.suffix : this.random.getRandomElement(suffixes);
        return prefix+suffix;
    }
}