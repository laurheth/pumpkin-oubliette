# Pumpkin Oubliette

The Pumpkin Oubliette is an attempt to meld a roguelike with a text based adventure game. The game world and its denizens are generated in a roguelike manner, but play is controlled by choosing text options, like "move north" or "Pet Sally the cat". The results will strike fear into your bones! And, I hope, be accessible to assistive technology.

You can play a [live release of the game](https://laurheth.itch.io/the-pumpkin-oubliette) on Itch. A single successful run should be under 30 minutes.

## Features

- Randomly generated levels.
- The rooms and connections between them are internally graphed out, to provide "move north" type commands. These _mostly_ work.
- Dungeon inhabitants whom you can choose to befriend, or not!
- Consequences for choosing the "or not" option. (Angry ghosts)
- Shelly, the snail oil snailsman, who can provide you with snail oil as well as general life advice.

## Installation

For play, just play the live release linked to above! To built it locally however, Pumpkin Oubliette uses WebPack, TypeScript, Sass, and a handful of other WebPack loaders. (Shout out especially to [css-modules-typescript-loader](https://www.npmjs.com/package/css-modules-typescript-loader))

First, clone the repository:

```git clone https://github.com/laurheth/pumpkin-oubliette.git```

Enter the new pumpkin-oubliette directory, and install the needed npm packages

```
cd pumpkin-oubliette
npm install
```

Finally, build it!

```
npm run build
```

After this, open ```./dist/index.html``` in your browser and play it!

## The story so far...

The date is October 31st. You ordered an extremely important package from an online retailer, but there was a typo in the delivery address. Tracking indicates that, instead of being delivered to your home, it has been delivered HERE! You have no choice but to journey deep into the deepest and most feared dungeon in town; the dangerous place where pumpkins and their associates reign...

### Credits

Created by Lauren Hetherington as a Halloween experiment.

Makes use of [Twemoji](https://twemoji.twitter.com/) for some tiles.
