# Storyboard

[![CI Status](http://img.shields.io/travis/lazerwalker/storyboard.svg?style=flat)](https://travis-ci.org/lazerwalker/storyboard)

Storyboard is a general-purpose engine for multilinear/nonlinear storytelling. It's written in TypeScript, and intended to be embedded within another game or application (such as the included-as-a-git-submodule [Storyboard-iOS](https://github.com/lazerwalker/storyboard-iOS.git) reference native iOS Swift project)

Right now, it's pre-alpha. Stay tuned for more.

If you're interested in progress, you should check out https://twitch.tv/lzrwkr, where I livestream dev work on this at least once a week.

Storyboard consists of two parts: a domain-specific language (that superficially looks a bit like [Ink](https://github.com/inkle/ink)) for authors to write stories, and a runtime engine, designed to be embedded within a larger game project, to manage narrative state for you.

This repo specifically contains the runtime engine. It includes the language compiler as a dependency; that project lives at [https://github.com/lazerwalker-storyboard-lang](https://github.com/lazerwalker-storyboard-lang).

There isn't yet good documentation for either the language or the runtime engine. Coming soon!

## Why Storyboard?

Storyboard draws on a rich history of choice-based interactive fiction platforms. It differentiates itself with two main design philophies:

### Be "just" a narrative engine

Many modern IF systems are written assuming the main way people will interact with your game is by reading text and tapping buttons. More complex interactions are possible, but usually require ugly plumbing.

Storyboard was originally designed to be used in site-specific audio installations that responded to various sources of smartphone data (e.g. indoor location technology, device motion sensors, and external web APIs for things like weather). As a result, it consciously has a very small footprint. 

It knows how to take arbitrary input, modify its internal state as a result, and spit out arbitrary output as a result. That's it. It focuses purely on managing narrative state, so you can focus on everything else instead.

Storyboard is currently being used in production for projects that range from [a site-specific poetry walk](https://lazerwalker.com/flaneur) (a smartphone app using GPS, synthesized audio, and neural network-generated text) to powering the tutorial of a [game played on a 90-year-old telephone switchboard](https://lazerwalker.com/hellooperator). 

This means it's a bit less accessible than tools like Twine, which can be used to create complete works without any formal coding ability. Storyboard is intended to be integrated in projects that have at least one person writing code. By designing for that specific use case, we can make something that's as easy as possible to use for both writers and programmers.

### The combination of finite state machines AND triggers

There are two common approaches for modeling choice-based interactive fiction.

Engines like Twine, Ink, and Yarn are essentially **finite state machines**. A player's journey through the game can be conceptualized as traversing a node graph, like you see in Twine's literal editor: the choices players make are essentially edges that transition between nodes of content.

Engines like StoryNexus and Valve's Left4Dead dialog system are what I call **trigger-based** systems. These are sometimes called quality-based narrative, or salience-based narrative, or event-driven narrative, but they follow the same general concept. When the state of the game world or the player's character changes, a giant list of possible content is checked to figure out how relevant it is to the player. If there's something that's appropriate enough, the system will surface it.

Both of these systems are incredibly powerful, and have been used to make countless wonderful things. But each has strengths and weaknesses, different types of interactions or stories that are easier or more difficult to author using a set of tools.

Storyboard gives you the best of both worlds by including both a state machine-based system and a trigger-based system, with deep interoperability. Write part of your story as a Twine-style node graph, and write other parts as StoryNexus-style storylets! Since all text is still written using the same writer-friendly Storyboard syntax, it's easy to hop back and forth.


## Setup and Usage

So, this really isn't yet suitable for people who aren't me to use. That said:

1. Clone [https://github.com/lazerwalker/storyboard-lang](https://github.com/lazerwalker/storyboard-lang), follow the setup instructions, and use `yarn link` from within its directory to get it set up with Yarn (since it isn't yet on `npm`)

2. Clone this repo and run `yarn install`
3. `npm run build` compiles Storyboard. It'll output to `dist/src`. (There's also type definitions in `dist/types` if you're a TypeScript user)
4. You'll now want to include this whole folder in your own project that uses Storyboard, and import the module. 

Yeah, it's not great. That'll change.

Perhaps the biggest flaw of this all right now is that it currently no longer supports any execution environment other than Node (e.g. the browser). I'm working on fixing that (it requires both some fixes to the language compiler and setting up a proper webpack pipeline)

The `tests` folder contains a fair number of BDD-style tests.

## iOS Project?

This readme mentions an iOS reference project included as a submodule. I've left that in for historical purposes, but it doesn't currently work — it relies on an older version of the project that had a functioning browser/JavaScriptCore-compatible build. 

Once this project works in non-Node environments again, you can expect to see a more functioning iOS reference implementation soon after.

## License

This project is licensed under the MIT License. See the LICENSE file in this repository for more information.