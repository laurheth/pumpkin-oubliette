// Import styles
import '../styles/style.scss';

import Toolkit from './toolkit/toolkit.ts';

// Put something onto the page
const appRoot: HTMLDivElement = document.querySelector('#appRoot');

// ...and an awesome paragraph
const paragraph: HTMLParagraphElement = document.createElement('p');
const text: Text = document.createTextNode('Hello world!');

paragraph.appendChild(text);
appRoot.appendChild(paragraph);