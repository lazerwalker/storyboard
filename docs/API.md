# Runtime Engine Reference

So you're interested in integrating Storyboard into your own game? Awesome! If your project can import a JavaScript module, using Storyboard is super easy.

The first thing you need to do is create a new Game object with your story:

```js
import { Game } from 'storyboard';

const story = ... // This should be a string containing your Storyboard story
const game = new Game(story)

```

If you're using Storyboard in a browser (or browser-like) environment by including the compiled JS file directly via `<script>` tag, you'll need to call `new storyboard.Game()` instead of `new Game()`. Otherwise, usage should be exactly the same.

## Adding some outputs

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


## Input

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

The values you pass in can be any valid JS object.

Keys will also be evaluated as keypaths:

```js
game.receiveInput("player", { name: 'Mike', score: 10 })
game.receiveInput("player.score", 11)
game.receiveInput("player.isCool", true)

// game.state.player = { name: 'Mike', score: 11, isCool: true }
```

Any string, whether key or value, can also use `{handlebars}`-style keypath template strings, giving you a ton of flexibility.

```js
game.receiveInput("player", { name: "Bruce", nameField: "player.name" })
game.receiveInput("secretIdentity", "Batman")
game.receiveInput("{player.nameField}", "{secretIdentity}")

// game.state.player = { name: "Batman"}
```

#### Momentary inputs

Storyboard also has the concept of "momentary inputs". When sending the system a momentary input, it will set the appropriate state, evaluate game state, and then immediately unset the variable.

This is mostly useful for handling things like discrete button presses.

```js

const story = """
# start
text: Welcome! Press 'next' to continue
-> nextNode: [ next ]

# nextNode
text: Awesome! Press 'next' one more time
-> lastNode: [ next ]

# lastNode
text: You made it!
"""

const game = new Game(story)
game.addInput("text", ...) // You get the drill by now
game.start()

function pressNextButton() {
  game.receiveMomentaryInput("next", true)
}

setTimeout(pressNextButton, 1000)
setTimeout(pressNextButton, 2000)
```

Will lead to "Welcome! ..." being logged immediately, "Awesome! ..." after 1 second, and "You made it!" after another second.


## ...and that's it!

There are a few other API methods, mostly to inspect the full state of the system for debug purposes, that aren't documented yet. That'll change as they stabilize; you can read `game.ts` for now.

But otherwise, that's the entire API! Pass in your story, wire up your inputs and outputs, and Storyboard takes care of the rest.


## Formal API Reference

Coming soon! If you have a local buildchain set up, you can check the compiled `dist/types/game.d.ts` for a pretty good rundown of what methods are available.