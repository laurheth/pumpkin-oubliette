// Generate doodads throughout the dungeon. Implemented as actors with special interactions
import { Actor } from './Actor';
import { Player } from './Player';
import { Map } from '../map/Map';
import { Item } from '../items/Item';
import { ActorAction } from './ActorInterfaces';

/** Helper function for simple cosmetic things */
const lookAtMe = (name:string, description:string, map:Map): ActorAction => {
    const messenger = map.messenger;
    return {
        description: `Examine the ${name}.`,
        distance:1,
        callback:()=>{
            messenger.addMessage({
                message:`You take a closer look at the ${name}. ${description}`
            });
        }
    }
}

/** Self improvement items */
const improveYou = (description:string,message:string,callback:(performer:Actor)=>void, map:Map): ActorAction => {
    const messenger=map.messenger;
    return {
        description: description,
        distance:1,
        callback:(performer,target)=>{
            callback(performer);
            messenger.addMessage({
                message:message
            });
            performer.updateMood(20);
            target.remove();
        }
    }
}

/** Helper function for items that don't have actions specifically */
const coolItem = (name:string,tags:Array<string>,outOfUsesString:string,uses:number,pickUp:string,combine:string, map:Map): ActorAction =>{
    const messenger = map.messenger;

    return {
        description:pickUp+'.',
        distance:1,
        callback:(performer,target)=>{
            const item = new Item(
                name,
                tags,
                map,
                uses,
                outOfUsesString
            );
            if (performer instanceof Player) {
                if (performer.hasItem(item)) {
                    messenger.addMessage({message:combine})
                }
                else {
                    messenger.addMessage({message:`You ${pickUp.toLowerCase()}.`})
                }
                performer.updateMood(10);
                item.pickUp(performer);
            }
            target.remove();
        }
    }
}

/** Helper function to generate an action for a consummable */
const consumeMe = (name:string,tags:Array<string>,actionString:string,doneString:string,outOfUsesString:string,uses:number,pickUp:string,combine:string, callback:(performer:Actor)=>void, map:Map): ActorAction => {
    const messenger = map.messenger;

    return {
        description:pickUp+'.',
        distance:1,
        callback:(performer,target)=>{
            const item = new Item(
                name,
                tags,
                map,
                uses,
                outOfUsesString,
                {
                    description:actionString,
                    distance:0,
                    target:"self",
                    callback:(performer,target)=>{
                        callback(performer);
                        messenger.addMessage({message:doneString})
                        item.use();
                    }
                }
            );
            if (performer instanceof Player) {
                if (performer.hasItem(item)) {
                    messenger.addMessage({message:combine})
                }
                else {
                    messenger.addMessage({message:`You ${pickUp.toLowerCase()}.`})
                }
                performer.updateMood(10);
                item.pickUp(performer);
            }
            target.remove();
        }
    }
}

/** Generate a doodad */
export const generateDoodad = (map: Map,danger?:number)=>{
    if (!danger) {danger=1;}
    const messenger = map.messenger;

    const odds = [
        {
            weight:1,
            option:"peanuts"
        },
        {
            weight:1,
            option:"knife"
        },
        {
            weight:1,
            option:"hammer"
        },
        {
            weight:1,
            option:"coffee"
        },
        {
            weight:1,
            option:"car"
        },
        {
            weight:1,
            option:"phone"
        },
        {
            weight:1,
            option:"gold"
        },
        {
            weight:1,
            option:"television"
        },
        {
            weight:1,
            option:"trophy"
        },
        {
            weight:1,
            option:"fountain"
        },
        {
            weight:(danger > 8) ? 1 : 0,
            option:"magic"
        }
    ];

    let newDoodad:Actor;
    const doodadType = map.random.getWeightedElement(odds);
    switch(doodadType) {
        case "magic":
            newDoodad = new Actor({
                art:"🔮",
                name:"Crystal ball",
                map:map,
                messenger:messenger,
                actionsOn:[
                    consumeMe(
                        "Crystal ball",
                        ["magic"],
                        "Look into the crystal ball.",
                        "You look into the crystal ball. The map is revealed to you!",
                        "The ball shatters!",
                        1,"Pick up the crystal ball",
                        "You found another crystal ball! You glue them together for convenience.",
                        (performer)=>{
                            map.revealMap();
                        },
                        map)
                ],
                seeString:"You see here a bag of peanuts."
            });
            break;
        case "fountain":
            newDoodad = new Actor({
                art:"🚰",
                name:"Fountain",
                map:map,
                messenger:messenger,
                actionsOn:[
                    improveYou(
                        'Drink from the fountain.',
                        'Much better! Staying hydrated is great.',
                        (performer)=>{
                            performer.health += 10;
                            performer.defense++;
                        },
                        map)
                ],
                seeString:"There's a fountain here, with potable water!"
            })
            break;
        case "trophy":
            newDoodad = new Actor({
                art:"🏆",
                name:"Trophy",
                map:map,
                messenger:messenger,
                actionsOn:[
                    improveYou(
                        'Examine the trophy.',
                        'Impressive trophy! You feel that some of its fame has rubbed off onto you.',
                        (performer)=>{performer.attack++; performer.defense++;},
                        map)
                ],
                seeString:"You see here a trophy."
            })
            break;
        case "phone":
            newDoodad = new Actor({
                art:"📺",
                name:"Television",
                map:map,
                messenger:messenger,
                actionsOn:[
                    lookAtMe(
                        "television",
                        "No channels are available.",
                        map
                    )
                ],
                seeString:"You see here a television."
            })
            break;
        case "gold":
            newDoodad = new Actor({
                art:"💰",
                name:"Bag of gold",
                map:map,
                messenger:messenger,
                actionsOn:[
                    coolItem(
                        "Bag of gold",
                        ["gold"],
                        "You are out of gold!",
                        3,
                        "Pick up the bag of gold",
                        "More gold! You combine the bags.",
                        map
                    )
                ],
                seeString:"You see here a bag of gold."
            })
            break;
        case "phone":
            newDoodad = new Actor({
                art:"☎",
                name:"Phone",
                map:map,
                messenger:messenger,
                actionsOn:[
                    lookAtMe(
                        "telephone",
                        "Possibly the most terrifying thing down here.",
                        map
                    )
                ],
                seeString:"You see here a telephone."
            })
            break;
        case "car":
            newDoodad = new Actor({
                art:"🚗",
                name:"Car",
                map:map,
                messenger:messenger,
                actionsOn:[
                    lookAtMe(
                        "car",
                        "It's a car. How did it even get down here?",
                        map
                    )
                ],
                seeString:"There's a car here."
            })
            break;
        case "coffee":
            newDoodad = new Actor({
                art:"☕️",
                name:"Coffee",
                map:map,
                messenger:messenger,
                actionsOn:[
                    consumeMe(
                        "Cup of coffee",
                        ["coffee"],
                        "Drink the coffee.",
                        "You drink the coffee",
                        "You are out of coffee!",
                        4,"Pick up the cup of coffee",
                        "You found some more coffee, and combine the cups.",
                        (performer)=>performer.health+=2,
                        map)
                ],
                seeString:"Somebody left their coffee here."
            })
            break;
        case "hammer":
            newDoodad = new Actor({
                art:"🔨",
                name:"Hammer",
                map:map,
                messenger:messenger,
                actionsOn:[
                    coolItem(
                        "Hammer",
                        ["hammer"],
                        "Your hammer breaks!",
                        15,
                        "Pick up the hammer",
                        "You found another hammer! You nail them together for added durability.",
                        map
                    )
                ],
                seeString:"You see a hammer lying around."
            });
            break;
        case "knife":
            newDoodad = new Actor({
                art:"🔪",
                name:"Knife",
                map:map,
                messenger:messenger,
                actionsOn:[
                    coolItem(
                        "Knife",
                        ["knife"],
                        "Your knife breaks!",
                        15,
                        "Pick up the knife",
                        "You find another knife! You tape them together for added durability.",
                        map
                    )
                ],
                seeString:"You see a knife on the ground."
            });
            break;
        default:
        case "peanuts":
            newDoodad = new Actor({
                art:"🥜",
                name:"Bag of peanuts",
                map:map,
                messenger:messenger,
                actionsOn:[
                    consumeMe(
                        "Bag of peanuts",
                        ["peanut","food"],
                        "Eat a peanut.",
                        "You eat a peanut",
                        "You are out of peanuts!",
                        4,"Pick up the bag of peanuts",
                        "You pick up some more peanuts and combine the bags.",
                        (performer)=>performer.health+=2,
                        map)
                ],
                seeString:"You see here a bag of peanuts."
            });
            break;
    }
    return newDoodad;
}