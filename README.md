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

## Language Reference

This is coming soon!

For now, I'd recommend looking at the [elevator](https://github.com/lazerwalker/storyboard-lang/tree/master/examples/elevator.story) and [switchboard](https://github.com/lazerwalker/storyboard-lang/tree/master/examples/switchboard.story) sample scripts.

## Runtime Engine Reference

If your project can import a JavaScript module, using Storyboard is super easy.

The first thing you need to do is create a new Game object with your story:

```js
import { Game } from 'storyboard';

const story = ... // This should be a string containing your Storyboard story
const game = new Game(story)

```

### Adding some outputs

When you write a Storyboard story, all text you're writing as an output is namespaced.

Let's say this is your story:

```
# node
text: Hello world!
audio: welcome.mp3
text: Wasn't that music great?
```

In that example, there are two different output types: `text` and `audio`. These are arbitrary strings that don't mean anything to the system. You need to wire them up!

```js

game = new Game(story)
game.addOutput("text", (content, passageId) => {
  console.log(content)
  game.completePassage(passageId)
})

game.addOutput("audio", (content, passageId) => {
  // Assume that "playMp3" plays an mp3 with the given filename, and returns a promise that resolves after playback is complete
  playMp3(content).then(() => {
    game.completePassage(passageId)
  })
})

game.start()
```

If you run this hypothetical code, the text "Hello world!" will be output via `console.log`, the `welcome.mp3` audio file will be played, and then the text "Wasn't that music great?" will be logged after the audio file's done.

Every time a Storyboard passage is evaluated, its output is piped to the appropriate callback function. Once that passage has explicitly been marked as completed (by calling `game.completePassage`) the engine will continue to the next passage within a node. This is important for use cases like audio playback, where you might not want to play a piece of audio until the previous one has asynchronously completed.

You can add multiple callback functions for the same output type, and they will all be called. Playback will continue as soon as any of them calls `completePassage()`.


### Input

Sending inputs to Storyboard is equally simple. Calling `game.receiveInput(key, value)` will set `key` to `value` in the global state object:

```js
const story = """
# start
text: On a scale from 1 to 10, how excited are you?
-> pumped: [ excitement >= 10 ]

# pumped
text: YEAH, LET'S DO THIS
	
"""

const game = new Game(story)

game.addOutput("text", (text, passageId) => {
  console.log(text)
  game.completePassage(passageId)
})

game.start()

setTimeout(() => {
  game.receiveInput("excitement", 10)
}, 5000)
```

This will log out "On a scale of 1 to 10, how excited are you?". 5 seconds later, when the `setTimeout` is executed, it'll log out "YEAH, LET'S DO THIS".

The values you pass in can be any valid JS values, including objects. 

Keys will be evaluated as proper keypaths as well:

```js
game.receiveInput("player", { name: 'Mike', score: 10 })
game.receiveInput("player.score", 11)
game.receiveInput("player.isCool", true)

// game.state.player = { name: 'Mike', score: 11, isCool: true }
```

#### Momentary inputs

Storyboard also has the concept of "momentary inputs". When sending the system a momentary input, it will set the appropriate state, evaluate game state, and then immediately unset the variable.

This is mostly useful for handling things like discrete button presses.

```js

const story = """
# start
text: Welcome! Press 'next' to continue
-> nextNode: [ next is true ]
	
# nextNode
text: Awesome! Press 'next' one more time
-> lastNode: [ next is true ]
	
# lastNode
text: You made it!
"""

const game = new Game(story)
game.addInput("text", ...) // You get the drill by now
game.start()

function pressNextButton = () => {
  game.receiveMomentaryInput("next", true)
}

setTimeout(pressNextButton, 1000)
setTimeout(pressNextButton, 2000)
```

Will lead to "Welcome! ..." being logged immediately, "Awesome! ..." after 1 second, and "You made it!" after another second.


### ...and that's it!

There are a few other API methods, mostly to inspect the full state of the system for debug purposes, that aren't documented yet. That'll change as they stabilize; you can read `game.ts` for now.

But otherwise, that's the entire API! Pass in your story, wire up your inputs and outputs, and Storyboard takes care of the rest.

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