import { Map } from '../map/Map';
import { Position } from '../util/interfaces';

/** Attitude */
export type attitude = "friendly"|"hostile"|"neutral";

/** Setup parameters for a new actor */
export interface ActorParams {
    /** Representation on the map */
    art: string;
    /** Color */
    foreground?: string;
    /** Background color */
    background?: string;
    /** Name of the actor */
    name: string;
    /** Fancy title of the actor, if they have one */
    title?: string;
    /** Pronouns */
    pronouns?: Pronouns;
    /** Attitude */
    attitude?: attitude;
    behaviours?: Array<string>;
    map?: Map;
    position?: Position;
}

/** Pronouns */
export interface Pronouns {
    /** he, she, they, ze, it */
    subject: string;
    /** him, her, they, zer, it  */
    object: string;
    /** his, her, their, zer, its */
    possessive: string;
}