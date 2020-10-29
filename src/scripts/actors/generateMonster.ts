import { Actor } from './Actor';
import { Monster } from './Monster';
import { Player } from './Player';
import { ActorParams, Pronouns, attitude, Goal, ActorAction } from './ActorInterfaces';
import { Art, Position } from '../util/interfaces';
import { Map } from '../map/Map';
import { Square } from '../map/Square';
import { weightGen } from '../util/interfaces';

/** Helper function for building ActorActions  */
const makeAction = (description:string, message:string|Array<string>, distance:number,callback:(performer:Actor, target:Actor)=>void, map:Map, condition?:Array<string>,target?:"player"|"self", importance?:number)=>{
    const messenger = map.messenger;
    const action:ActorAction = {
        distance:distance,
        callback:(performer:Actor, target:Actor)=>{
            let msg:string;
            if (typeof message==="string") { msg=message; }
            else {msg = map.random.getRandomElement(message);}
            messenger.addMessage({
                message:msg,
                importance:(importance) ? importance : 3
            })
            callback(performer,target);
        },
        description:description,
        target:(target) ? target : "player",
        condition:(condition) ? condition : [],
    };

    return action;
}

/** Helper function to generate an attack */
const makeAttack = (description:string, success:string|Array<string>, fail:string|Array<string>, distance:number, damage:number, bonusAttack:number, map:Map, condition?:Array<string>) => {
    const messenger = map.messenger;
    const action:ActorAction = {
        distance:distance,
        callback:(performer:Actor, target:Actor)=>{
            let successMsg:string;
            let failMsg:string;
            // Success message
            if (typeof success === "string") {
                successMsg=success;
            }
            else {
                successMsg = map.random.getRandomElement(success);
            }
            // Fail message
            if (typeof fail === "string") {
                failMsg=fail;
            }
            else {
                failMsg = map.random.getRandomElement(fail);
            }
            if(performer.attemptAttack(target,bonusAttack)) {
                console.log('success');
                messenger.addMessage({
                    message:successMsg,
                    importance:5
                });
                target.health -= damage;
                if (performer instanceof Player && condition) {
                    performer.useRelevant(condition);
                }
            }
            else {
                console.log('fail');
                messenger.addMessage({
                    message:failMsg,
                    importance:5
                });
            }
        },
        description:description,
        target:"player",
        condition:(condition) ? condition : [],
    };

    return action;   
}

/** Helper function for feeding */
const feedMe = (name:string, title:string, map:Map, food?:string, eatStrings?:Array<string>) => {
    if (!eatStrings)  {
        eatStrings = ['They eat it happily!', 'They swallow it whole and start to purr!', 'They accept, and love it!'];
    }
    if (!food) {
        food="food";
    }
    return makeAttack(
        `Offer ${name} the ${title} some ${food}.`,
        eatStrings.map(str=>`You offer ${name} some ${food}. ${str}`),
        [
            `You offer ${name} some ${food}. They hiss at you!`,
            `You offer ${name} some ${food}. They reject your offer!`,
            `You offer ${name} some ${food}. They start to growl!`
        ],
        1,
        -1,
        0,
        map,[food])
}

/** Helper function for affection */
const petMe = (name:string, title:string, map:Map,verb?:string,happyVerb?:string|Array<string>) => {
    if (!verb) {verb="Pet";}
    if (!happyVerb) {happyVerb=["purr","nuzzle you","roll over","make cute noises","are very happy"];}

    let reaction:Array<string>;
    if (typeof happyVerb === "string") {
        reaction = [`You ${verb.toLowerCase()} ${name}. They ${happyVerb}!`];
    }
    else {
        reaction = happyVerb.map(happy=>{
            return `You ${verb.toLowerCase()} ${name}. They ${happy}!`
        })
    }
    return makeAction(
        `${verb} ${name} the ${title}.`,
        reaction,
        1,
        (performer,target)=>{
            if (performer instanceof Player) {
                // First time petting recovers some health
                if (target instanceof Monster && !target.hasBeenPet) {
                    performer.updateRecord("pets");
                    performer.updateMood(10);
                    performer.health += 1;
                    target.hasBeenPet=true;
                }
            }
        },
        map,["friendly"]
    );
}

/** Helper function for violence */
const attackMe = (name:string, title:string, map:Map, conditions?:Array<string>,verb="Attack",distance=1,damage=1,bonusAttack=0) => {
    if (!conditions) {conditions=[];}
    // Don't attack friends.
    conditions.push("hostile");
    return makeAttack(
        `${verb} ${name} the ${title}.`,
        `You ${verb.toLowerCase()} ${name}!`,
        [
            `You try to ${verb.toLowerCase()} ${name}, but miss!`,
            `You try to ${verb.toLowerCase()} ${name}, but they dodge out of the way!`,
            `You try to ${verb.toLowerCase()} ${name}, but they parry!`,
            `You try to ${verb.toLowerCase()} ${name}, but they block it!`,
            `You try to ${verb.toLowerCase()} ${name}, but they avoid you!`
        ],distance,damage,bonusAttack,map,conditions
    );
}

/** Helper function for attacks against the player */
const attackYou = (name:string, title:string, map:Map,success?:string|Array<string>,fail?:string|Array<string>,damage=1,bonus=0, distance=1) => {
    if (!success) {success=`${name} attacks you!`;}
    if (!fail) {fail=`${name} tries to attack you, but misses!`}
    return makeAttack(
        "",
        success,
        fail,
        distance,
        damage,
        bonus,
        map);
}

/** Generate monster */
export const generateMonster = (map: Map,danger?:number)=>{
    if (!danger) {danger=1;}
    const messenger = map.messenger;
    const eventManager = map.eventManager;
    let newMonster:Monster;

    const odds = [
        {
            weight:weightGen(0,5,5,danger),
            option:"pumpkin"
        },
        {
            weight:weightGen(3,10,3,danger),
            option:"skull"
        },
        {
            weight:weightGen(2,12,3,danger),
            option:"crab"
        },
        {
            weight:weightGen(10,10,1,danger),
            option:"dragon"
        },
        {
            weight:1,
            option:"cat"
        }
    ];

    const monsterType = map.random.getWeightedElement(odds);
    let name:string;
    let title:string;
    switch(monsterType) {
        case "cat":
            name = map.nameGen.getName({});
            title = 'cat'
            newMonster = new Monster({
                art:'🐈',
                name:name,
                title:title,
                messenger:messenger,
                attitude:'friendly',
                actionsOn:[
                    feedMe(name,title,map),
                    petMe(name,title,map,"Pet"),
                ],
                health:Infinity,
                attack:5,
                defense:5,
            },8,1,[
                attackYou(name,title,map,`${name} scratches you!`,`${name} tries to scratch you, but you avoid the attack!`,3,0,1),
            ]);
            break;
        case "dragon":
            name = map.nameGen.getName({});
            title = 'dragon'
            newMonster = new Monster({
                art:'🐉',
                name:name,
                title:title,
                messenger:messenger,
                attitude:'hostile',
                actionsOn:[
                    feedMe(name,title,map,"gold"),
                    petMe(name,title,map,"Pet"),
                    attackMe(name,title,map,['hammer'],'Smash',1,3,2),
                    attackMe(name,title,map,['knife'],'Stab',1,3,2),
                    attackMe(name,title,map)
                ],
                health:12,
                attack:5,
                defense:5,
            },8,2,[
                attackYou(name,title,map,[`${name} bites you!`,`${name} claws you!`],`${name} swings a claw at you, but you avoid the attack!`,4,1,1),
            ]);
            break;
        case "crab":
            name = map.nameGen.getName({prefix:'Crab'});
            title = 'crab'
            newMonster = new Monster({
                art:'🦀',
                name:name,
                title:title,
                messenger:messenger,
                attitude:'hostile',
                actionsOn:[
                    feedMe(name,title,map),
                    petMe(name,title,map,"Pet",["raise their claws","pinch happily","make a weird, but happy, gurgling noise"]),
                    attackMe(name,title,map,['hammer'],'Smash',1,3,2),
                    attackMe(name,title,map,['knife'],'Stab',1,2,2),
                    attackMe(name,title,map)
                ],
                health:3,
                attack:3,
                defense:2,
            },8,1.5,[
                attackYou(name,title,map,`${name} pinches you!`,`${name} tries to pinch you, but you avoid the attack!`,3,1,1),
            ]);
            break;
        case "skull":
            name = map.nameGen.getName({suffix:'skull'});
            title = 'skull'
            newMonster = new Monster({
                art:'💀',
                name:name,
                title:title,
                messenger:messenger,
                attitude:'hostile',
                actionsOn:[
                    feedMe(name,title,map,"coffee",['They drink it happily!','They chug it and make happy noises!','They accept your offering!']),
                    petMe(name,title,map,"Pet",["rattle their teeth","roll around","wobble happily"]),
                    attackMe(name,title,map,['hammer'],'Smash',1,3,2),
                    attackMe(name,title,map,['knife'],'Stab',1,2,-1),
                    attackMe(name,title,map)
                ],
                health:6,
                attack:3,
                defense:4,
            },8,1.5,[
                attackYou(name,title,map,`${name} bites you!`,`${name} tries to bite you, but you avoid the attack!`,3,1,1),
            ]);
            break;
        default:
        case "pumpkin":
            name = map.nameGen.getName({prefix:'Pump'});
            title = 'pumpkin'
            newMonster = new Monster({
                art:'🎃',
                name:name,
                title:title,
                messenger:messenger,
                attitude:'hostile',
                actionsOn:[
                    feedMe(name,title,map),
                    petMe(name,title,map),
                    attackMe(name,title,map,['knife'],'Carve',1,10,2),
                    attackMe(name,title,map,['hammer'],'Smash',1,3,0),
                    attackMe(name,title,map)
                ],
                health:3,
                attack:2,
                defense:2,
            },8,2,[
                attackYou(name,title,map,`${name} bites you!`,`${name} tries to bite you, but you avoid the attack!`,3,1,1),
                attackYou(name,title,map,[
                    `${name} shoots pumpkin seeds at you!`,
                    `${name} shoots pumpkin seeds at you! One goes into your eye; ouch!`,
                ],[
                    `${name} shoots pumpkin seeds at you, but misses!`,
                    `${name} shoots pumpkin seeds at you, but you dodge it!`,
                    `${name} shoots pumpkin seeds at you, but it has no effect!`,
                ],1,0,3)
            ]);
            break;
    }

    eventManager.add({
        actor:newMonster,
        delay:newMonster.speed
    });

    return newMonster;
};