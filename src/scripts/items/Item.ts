import { ActorAction } from '../actors/ActorInterfaces';
import { Actor } from '../actors/Actor';
import { Player } from '../actors/Player';
import { Map } from '../map/Map';

export class Item {
    private player: Player;
    private map:Map;
    private tags:Array<string>;
    private action:ActorAction;
    private singleUse:boolean;
    readonly name:string;

    constructor(map:Map, name:string, tags:string|Array<string>, action?:ActorAction, singleUse?:boolean) {
        this.map=map;
        if (typeof tags === "string") {
            tags=[tags];
        }
        this.tags=tags;
        this.action=action;
        this.singleUse=(typeof singleUse !== "undefined") ? singleUse : false;
        this.name=name;
    }

    getTags():Array<string> {
        return this.tags;
    }

    pickUp(player:Player) {
        this.player=player;
        this.player.addInventory(this);
        if (this.action) {
            if (this.singleUse) {
                const callback = this.action.callback;
                this.action.callback = (performer:Actor, target:Actor)=>{
                    this.player.removeActionOn(this.action);
                    this.player.removeInventory(this);
                    callback(performer, target);
                };
            }
            this.player.addActionOn(this.action);
        }
    }
}