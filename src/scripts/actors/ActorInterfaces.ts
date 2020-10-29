import { Messenger } from 'scripts/messages/Messenger';
import { Map } from '../map/Map';
import { Position } from '../util/interfaces';
import { Actor } from './Actor';

/** Attitude */
export type attitude = "friendly"|"hostile"|"neutral";

/** Actions */
export interface ActorAction {
    distance:number;
    description:string;
    callback:(actor?:Actor,target?:Actor)=>void;
    target?:"self"|"player";
}

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
    /** Behaviours */
    behaviours?: Array<string>;
    /** Map that the actor lives on */
    map?: Map;
    /** Actor's current position */
    position?: Position;
    /** Messenger object */
    messenger: Messenger;
    /** Actions performed on */
    actionsOn?:Array<ActorAction>;
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

/** Current Goal
 *  This describes a target position for the actor to go to, and upon reaching it, run the given action
*/
export interface Goal {
    /** Target position */
    target: Position|Actor;
    /** Middle point to go to before target */
    midTarget?: Position;
    /** Distance at which to execute */
    distance?:number;
    /** Action to perform */
    action?:(actor?:Actor,target?:Actor)=>void;
}