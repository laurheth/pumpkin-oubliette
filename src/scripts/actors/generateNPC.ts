// Generate doodads throughout the dungeon. Implemented as actors with special interactions
import { Actor } from './Actor';
import { Player } from './Player';
import { Map } from '../map/Map';
import { ActorAction } from './ActorInterfaces';

const interactions = {
    shelly:{
        conversations:0,
        firstLine:`Howdy stranger! My name is Shelly, the local snailsman in these parts! If you've got gold, I can sell you some snail oil!`,
        lines:[
            `Did you know every critter in here comes from pumpkins? The pumpkins carve their dead, and sometimes, they do it so well that the carving springs to life and becomes real. Makes you think, don't it?`,
            `You might wonder what I'm doing down here, but you're the tenth or so adventurer I've met in the last hour alone! Business is good!`,
            `Where does my snail oil come from? Why, 100% natural sources!`,
            `You say you're looking for a package down here? Why bother, when you can just buy more snail oil?`,
            `I live in a huge mansion on the surface. Buy my snail oil, and someday that could be you!`,
            `You be careful down here, alright? The pumpkins ain't so bad, but they sure are vengeful.`,
            `One time I was fishing with my old man. We caught a fish, so big! I hear fish have oil too, but let me tell you, it's a poor substitute.`,
            `Like my shell? I grew it myself! With enough snail oil, maybe you can grow one too!`,
            `When I was your age, I wandered into dungeons sometimes too. But then I discovered the incredible health benefits of snail oil. My life was changed!`,
            `If you meet any nice critters down here, or butter one up a bit that they become nice, you make sure to pet them! Petting critters will make your life better. Always stop to pet the cat, that's what my old man used to say.`,
            `You make sure to stay hydrated, you got that, kid? Hydration is a critical part of a long and healthy life. That and snail oil, of course!`,
            `If you find any trophies, make sure to admire them. They say that thinking real hard about winning helps you win even better. I'm sure that also applies to thinking really hard about other peoples winnings!`,
            `If you find any tacos lying around, you better eat them right up! That's a family recipe, and I don't want any of them going to waste.`,
            `You ever sit and wonder if you, yourself, are a pumpkin? I do, every single day.`
        ],
    }
}

/** Generate an NPC */
export const generateNPC = (map: Map)=>{
    const messenger = map.messenger;

    let newNPC:Actor;
    let seeString="";
    if (interactions.shelly.conversations < 1) {
        seeString = `You see a friendly looking snail. They notice you and say "Howdy stranger! Want to buy some snail oil?"`;
    }
    else {
        seeString = `Shelly, the snail oil snailsman, is here! They smile and say "Howdy!"`
    }

    const line = map.random.getRandomElement(interactions.shelly.lines);

    newNPC = new Actor({
        art:"🐌",
        name:"Shelly the snail oil snailsman",
        map:map,
        messenger:messenger,
        actionsOn:[
            {
                description: `Talk to Shelly.`,
                distance:1,
                callback:()=>{
                    interactions.shelly.conversations++;
                    messenger.addMessage({
                        message:`Shelly says: "${line}"`
                    });
                }
            },
            {
                distance:1,
                callback:(performer:Actor, target:Actor)=>{
                    if (performer instanceof Player) {
                        performer.increaseMaxHealth(2);
                        messenger.addMessage({
                            message:`You buy some snail oil and apply it immediately. You feel great!`
                        })
                        performer.useRelevant("gold");
                    }
                },
                description:"Buy some snail oil.",
                target:"player",
                condition:["gold"]
            }
        ],
        seeString:seeString
    });

    return newNPC;
}