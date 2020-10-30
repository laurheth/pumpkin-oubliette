export interface Action {
    description: string;
    callback: ()=>void;
}

interface FormattedMessage {
    heading?: string;
    maintext: string;
}

interface PartialMessage {
    importance?: number;
    message: string;
}

/** Class to handle sending messages and displaying action options to the user */
export class Messenger {

    /** Main container for everything message related */
    private element : HTMLDivElement;
    /** Where messages are sent to */
    private messageElement : HTMLParagraphElement;
    /** Where actions are listed */
    private actionListElement : HTMLUListElement;
    /** Where the heading goes */
    private headingElement : HTMLHeadingElement;

    /** Some logic for generating messages from a combination of sources */
    private actions: {[key:string]:Array<Action>};

    constructor(element:HTMLDivElement) {
        this.element = element;
        this.messageElement = element.querySelector('#messagesGoHere');
        this.actionListElement = element.querySelector('#actionsList');
        this.headingElement = element.querySelector('#headingGoesHere');
        this.actions = {};
        this.clear();
    };

    /** Update the message display */
    message(message:string|FormattedMessage, actions?:Array<Action>) {
        // Clear old messages
        this.clear();

        // Now, display the new message
        if (typeof message === "string") {
            this.messageElement.textContent = message;
        }
        else {
            if (message.heading) {
                this.headingElement.textContent = message.heading;
            }

            this.messageElement.textContent = message.maintext;
        }
        this.showActions(actions);
    };

    /** Show actions */
    showActions(actions?:Array<Action>) {
        console.log('actions object',this.actions);
        if (!actions) {
            const allKeys = Object.keys(this.actions);
            if (allKeys.length===2) {
                // If only one catagory, just show that
                actions = this.actions[allKeys.filter(key=>key!=='index')[0]];
                actions.pop();
            }
            // Only inventory and travel; focus on travel, but leave the option to go to inventory
            else if (allKeys.length===3 && allKeys.includes('Inventory') && allKeys.includes('Travel')) {
                actions = this.actions.Travel;
            }
            else {
                actions = this.actions.index;
            }
        }
        // Clear the old actions
        while(this.actionListElement.lastElementChild) {
            this.actionListElement.removeChild(this.actionListElement.lastElementChild);
        }

        actions.forEach(action=>{
            const listItem = document.createElement('li');
            const button = document.createElement('button');
            button.textContent = action.description;
            button.addEventListener("click",(event)=>{
                event.preventDefault();
                action.callback();
            });

            listItem.appendChild(button);
            this.actionListElement.appendChild(listItem);
        });
    }

    /** Clear messages */
    clear() {
        // Empty the old messages
        this.messageElement.textContent="";
    };

    /** Add a partial message */
    addMessage(partial: PartialMessage) {
        this.messageElement.textContent += " " + partial.message;
    };

    /** Add action list */
    addActionList(key:string,actions:Array<Action>) {
        // If the key already exists, combine them lists
        if (key in this.actions) {
            actions.forEach(action=>this.actions[key].unshift(action));
        }
        // Otherwise, add a "return to index" option and then add to the actions object
        else {
            actions.push({
                description:"Show other actions.",
                callback:()=>this.showActions(this.actions.index),
            });
            console.log(key);
            this.actions[key] = actions;
            if (!this.actions.index) {this.actions.index=[];}
            this.actions.index.push({
                description:key,
                callback:()=>this.showActions(this.actions[key])
            })
        }
    };

    /** Clear the actions list */
    clearActions() {
        this.actions = {
            index:[],
        };
    }

    /** Set current heading */
    setHeading(heading:string) {
        this.headingElement.textContent = heading;
    };
}