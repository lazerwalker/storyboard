# Storyboard

[![CI Status](http://img.shields.io/travis/lazerwalker/storyboard.svg?style=flat)](https://travis-ci.org/lazerwalker/storyboard)

Storyboard is a general-purpose engine for multilinear/nonlinear storytelling. It's written in TypeScript, and intended to be embedded within another game or application.

Right now, it's pre-alpha. Stay tuned for more.

If you're interested in progress, you should check out https://twitch.tv/mlazerwalker, where I livestream dev work on this at least once a week.

Storyboard consists of two parts: a domain-specific language for authors to write stories (that superficially looks a bit like [Ink](https://github.com/inkle/ink)) and a runtime narrative engine designed to be embedded within a larger game project.

This repo specifically contains the runtime engine. A few other projects exist:

* [https://github.com/lazerwalker/storyboard-lang](https://github.com/lazerwalker/storyboard-lang) is the language compiler. This repo includes it as a dependency via npm.
* [https://github.com/lazerwalker/storyboard-iOS](https://github.com/lazerwalker/storyboard-ios) is an iOS framework that provides a native Swift API layer on top of Storyboard running within an embedded JS runtime. It also includes a working sample app.


## Why Storyboard?

Storyboard draws on a rich history of choice-based interactive fiction platforms. It differentiates itself with two main design philophies:

### Be "just" a narrative engine

Many modern IF systems are written assuming the main way people will interact with your game is by reading text and tapping buttons. More complex interactions are possible, but usually require ugly plumbing.

Storyboard was originally designed to be used in site-specific audio installations that responded to various sources of smartphone data (e.g. indoor location technology, device motion sensors, and external web APIs for things like weather). As a result, it consciously has a very small footprint. It knows how to take arbitrary input, modify its internal state as a result, and spit out arbitrary output as a result. That's it. It's a single-purpose tool that exists to manage the narrative flow of your game, leaving the rest to your own engine.

Storyboard is currently being used in production for projects that range from [a site-specific poetry walk](https://lazerwalker.com/flaneur) (a smartphone app using GPS, synthesized audio, and neural network-generated text) to powering the tutorial of a [game played on a 90-year-old telephone switchboard](https://lazerwalker.com/hellooperator).

This means it's a bit less accessible than tools like Twine, which can be used to create complete works without any formal coding ability. Storyboard is intended to be integrated in projects that have at least one person writing code. By designing for that specific use case, we can make something that's as easy as possible to use for both writers and programmers.

### The combination of finite state machines AND triggers

There are two common approaches for modeling choice-based interactive fiction.

Engines like [Twine](https://twinery.org), [Ink](https://github.com/inkle/ink), [ChoiceScript](https://www.choiceofgames.com/make-your-own-games/choicescript-intro/), and [Yarn](https://github.com/InfiniteAmmoInc/Yarn) are essentially **finite state machines**. A player's journey through the game can be conceptualized as traversing a node graph, like you see in Twine's literal editor: the choices players make are essentially edges that transition between nodes of content.

Engines like [StoryNexus](http://www.storynexus.com/) and Valve's [Left4Dead dialog system](http://gdcvault.com/play/1015528/AI-driven-Dynamic-Dialog-through) are what I call **trigger-based** systems. These are sometimes called quality-based narrative, or salience-based narrative, or event-driven narrative, but all describe roughly the same general concept. You have a giant collection of possible pieces of content that each have various prerequites based on the game state. When your game state changes, the system tries to figure out the most appropriate bit (or bits) of content to surface, and presents them to the player.

Both of these systems are incredibly powerful, and have been used to make countless wonderful things. But each has strengths and weaknesses, different types of interactions or stories that are easier or more difficult to author using a set of tools.

Storyboard gives you the best of both worlds by including both a state machine-based system and a trigger-based system, with deep interoperability. Write part of your story as a Twine-style node graph, and write other parts as StoryNexus-style storylets! Since all text is still written using the same writer-friendly Storyboard syntax, it's easy to hop back and forth.


## How do I use this?

Documentation lives in the `docs` folder of this repo!

If you're an **author** looking to write stories in Storyboard, check out the [language reference](https://github.com/lazerwalker/storyboard/blob/master/docs/Language.md).

If you're a **programmer** looking to integrate Storyboard into your existing game engine, check out the [runtime API reference](https://github.com/lazerwalker/storyboard/blob/master/docs/API.md).

(Not that I'm suggesting that being an author and a programmer are mutually exclusive!)


## Setup

So, this really isn't yet suitable for people who aren't me to use. I'm avoiding publishing it to npm until it's slightly more stable. As a result, using this is a wee bit involved:

1. Clone this repo: `git clone git@github.com:lazerwalker/storyboard.git`
2. Run `yarn install` to install dependencies
3. Run `yarn run build` to compile the library. It'll output a `dist/bundle.js` file. If you use TypeScript, `dist/types` will contain type definitions.

The generated production library is built as a [UMD](https://github.com/umdjs/umd) module, so it's usable in Node, in-browser, etc.

If you're using it in a browser context, its namespace is placed in the global variable `storyboard`.


## Development Setup

Looking to hack on Storyboard yourself?

Webpack is used to compile Storyboard. You can run it via `yarn run build`. You can also manually run webpack (`./node_modules/.bin/webpack`, or a globally-installed version) with whatever other args you'd like, to e.g. enable watch mode. (Better dev support is coming!)

The `tests` folder contains a fair number of BDD-style tests. `yarn test` runs 'em.


## License

This project is licensed under the MIT License. See the LICENSE file in this repository for more information.
