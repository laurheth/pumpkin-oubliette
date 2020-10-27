interface Action {
    description: string;
    callback: ()=>void;
}

interface FormattedMessage {
    heading?: string;
    subtext?: string;
    maintext: string;
}

interface PartialMessage {
    importance?: number;
    message: string;
}

/** Class to handle sending messages and displaying action options to the user */
export class Messenger {

    /** The element to print messages to */
    private element : HTMLDivElement;

    /** Some logic for generating messages from a combination of sources */
    private partialMessages: Array<PartialMessage>;
    private actions: Array<Action>;
    private heading: string;
    private subHeading: string;

    constructor(element:HTMLDivElement) {
        this.element = element;
        this.partialMessages = [];
        this.actions = [];
        this.clear();
    };

    /** Update the message display */
    message(message:string|FormattedMessage, actions:Array<Action>) {
        // Clear old messages
        this.clear();

        // Now, dispay the new message
        if (typeof message === "string") {
            const paragraph = document.createElement('p');
            paragraph.textContent = message;
            this.element.appendChild(paragraph);
        }
        else {
            if (message.heading) {
                const heading = document.createElement('h2');
                heading.textContent = message.heading;
                this.element.appendChild(heading);
            }

            if (message.subtext) {
                const subHeading = document.createElement('h3');
                subHeading.textContent = message.subtext;
                this.element.appendChild(subHeading);
            }

            const paragraph = document.createElement('p');
            paragraph.textContent = message.maintext;
            this.element.appendChild(paragraph);
        }

        // Next, add on the action options
        const actionList = document.createElement('ul');
        actions.forEach(action=>{
            const listItem = document.createElement('li');
            const button = document.createElement('button');
            button.textContent = action.description;
            button.addEventListener("click",(event)=>{
                event.preventDefault();
                action.callback();
            });

            listItem.appendChild(button);
            actionList.appendChild(listItem);
        });
        this.element.appendChild(actionList);
    };

    /** Clear messages */
    clear() {
        // Empty the old messages
        while(this.element.lastElementChild) {
            this.element.removeChild(this.element.lastElementChild);
        }
    };

    /** Add a partial message */
    addMessage(partial: PartialMessage) {
        if (!partial.importance) {
            partial.importance = 0;
        }

        this.partialMessages.push(partial);
    };

    /** Add a possible action */
    addAction(action:Action) {
        this.actions.push(action);
    };

    /** Set current heading */
    setHeading(heading:string, subHeading?:string) {
        this.heading = heading;
        this.subHeading = subHeading;
    };

    /** Generate messages based on the partials given */
    generate() {
        // Sort by priority.
        this.partialMessages.sort((a,b)=>b.importance - a.importance);
        let message = "";
        for (let i=0;i<this.partialMessages.length;i++) {
            if (message.length > 100 && this.partialMessages[i].importance <= 1) {
                break;
            }
            message += `${this.partialMessages[i]} `;
        }

        // Display the combined results.
        this.message({
            heading: this.heading,
            subtext: this.subHeading,
            maintext: message,
        },this.actions);

        // Purge the old list
        this.partialMessages=[];
        this.actions=[];
        this.heading='';
        this.subHeading='';
    };
}