interface Action {
    description: string;
    callback: ()=>void;
}

interface FormattedMessage {
    heading: string;
    subtext?: string;
    maintext: string;
}

/** Class to handle sending messages and displaying action options to the user */
export class Messenger {

    /** The element to print messages to */
    private element : HTMLDivElement;

    private eventListeners : Array<HTMLElement>;

    constructor(element:HTMLDivElement) {
        this.element = element;
        this.eventListeners = [];
        this.clear();
    }

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
            const heading = document.createElement('h2');
            heading.textContent = message.heading;
            this.element.appendChild(heading);

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
    }

    /** Clear messages */
    clear() {
        // Empty the old messages
        while(this.element.lastElementChild) {
            this.element.removeChild(this.element.lastElementChild);
        }
    }
}