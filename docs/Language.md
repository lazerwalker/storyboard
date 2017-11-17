# Language Reference

So you want to write something in Storyboard. Awesome!

## High-level overview

A Storyboard story is made up of a bunch of **nodes**. A node has a bunch of **passages**, which are bits of content that should be presented to the player.

When a node plays, its first passage plays, followed by the rest of its passages in sequence. What it means to "play" a passage depends on how Storyboard is connected to your game engine. A passage might represent a bit of dialog, an audio or animation cue, or anything else you can imagine!

There are two ways a node can exist in Storyboard: it can be part of either the **graph** or the **bag**.

The **graph** is a linked tree of nodes that connect to each other. If you're familiar with Twine, it's like a Twine story; you can also think of it as a directed graph or a finite state machine, if that helps. At any given time, the graph has a specific "active" node. Graph nodes have **choices**; when the player meets the conditions to trigger a choice on the active node, that node becomes the new active node and is played.

The **bag** is a collection of nodes that each have conditions on which they'll **trigger**. Any time anything changes, Storyboard queries the bag to figure out which, if any, bag nodes should be triggered. If you're familiar with StoryNexus or other quality-based or salience-based systems, the bag works kinda like that.

Sound confusing? Hopefully not! It's much simpler in practice than it sounds here.

## Comments

Lines that start with `--` are treated as comments that are ignored by the engine.


## Nodes

A Storyboard story is made up of a bunch of **nodes**. Each node represents a bunch of content being sent to the player.

Here's an example node:

```
# start
text: Hello world!
text: "I'm so excited to be here!"
sfx: tada.mp3
```

Each node has a **name** ("start", in this case), which needs to be unique across a story. You can optionally include a closing pound sign as well; `# start #` is identicaly to `# start `.

This node has three **passages**, each representing a bit of content to present to the player. Two are of type "text", and one is of type "sfx". You'll notice they can, but don't need to be, wrapped in double quotes.


## Passages
A passage is a single piece of content. Each passage needs to have a type, but these can be anything you want: your own game engine is going to wire up different content types to do different things. In this example, we have two output types, "text" and "sfx"; the former would presumably output the given text to the user while the latter would presumably play the sound effect with the given filename.

These are completely defined by you or whoever's wiring your Storyboard code up to a game engine — you can name these types whatever you want and have them do whatever you want them to. It's easy to imagine a Storyboard script where, say, different passage types represent different characters speaking in a play:

```
# waitingForGodot
vladimir: What do they say?
estragon: They talk about their lives.
vladimir: To have lived is not enough for them.
estragon: They have to talk about it.
```

Within a node, passages are played sequentially.


## Variables

Storyboard lets you store and access data using variables.

Variables can be a number of different things:

* Boolean values (`true` or `false`)
* Numbers (e.g. `-1`, `53`, or `12.5`)
* Strings (e.g. `"abracadabra"`)
* Nested Objects (e.g. `{ name: "Joe", score: 10 }`)
* Arrays (e.g. `["Larry", "Curly", "Moe"]`)

Under the hood, variables are just JavaScript variables, and support just about anything you can do in JavaScript (except that we don't currently support executing functions. If you try to set something to a JS function object, the engine won't stop you, but behavior is unspecified and probably not helpful.)

Within nodes, you can set variables. Within passages, you can reference variables by wrapping them in `{curly braces}`:

```
# node
set minPower to 0
set maxPower = 10
readPowerLevel: The power level ranges from {minPower} to {maxPower}
```

For Storyboard variables that are objects, Storyboard supports a simple keypath syntax for getting and setting nested values:

```
-- player = { name: "Joe", score: 10 }
# changeAndReadScore
set player.score to 11
set player.status to "a little hungry"
text: {player.name} has {player.score} points and is feeling {player.status}
```

## Conditionally executing passages

Here's an example node from the "elevator" example:

```
# headphoneCheck #
  speech: Hi!

  [if headphones and not proximity]
    speech: "I'm glad you're already wearing headphones. I just need you to
        put your {device} in your pocket or your handbag. Don't worry,
        I'll wait for you."

  [unless headphones]
    speech: "I need you to put on headphones, and then put your {device}
      in your pocket or handbag. Don't worry, I'll wait for you."
```

You'll notice that two of the three passages have a bunch of stuff in `[square brackets]`. These are **predicates**. A predicate specifies some conditions that must be true in order for that passage to execute.

The first predicate will only fire if the `headphones` variable is true and the `proximity` variable is false; the second will only fire if `headphones` is false. In this example, everything is a boolean, but that isn't a requirement.

### Comparisons

You can check if two things are equal, or are not equal

```
-- These three are equivalent, and
-- compare the values stored in `truth` and `beauty`
[ truth is beauty ]
[ truth == beauty ]
[ if truth is beauty ]

-- These two are equivalent
[ truth != beauty ]
[ if truth isnt beauty ]

-- This checks if the variable `truth` is equal to the literal string "beauty"
[ truth is "beauty" ]
```

You can also do standard mathematical comparisons (`>`, `>=`, `<`, `<=`)

```
[ power >= 9000 ]
[ if michelinStars < 3]
```

### Existence

You can check whether a variable has been set or not.

```
[ foo exists ]
[ bar doesnt exist ]
```

(Under the hood, all global state is stored as a single JS object. This checks whether the given key is set or not on that object.)


### Negation

You can include `not` or `!` to negate anything

```
[ if !foo ]
[ if not bar > 5 ]
```

### Booleans

As shown above, if you're checking the value of a boolean, it'll implicitly be checked against `true`

```
-- These are equivalent
[ if foo ]
[ if foo is true ]

[ if not foo ]
[ if foo is false ]
```

### If statements

You've likely noticed from previous examples that including a leading `if`
is optional.

You can also use the keyword `unless`, which is equivalent to `if not`.


### Boolean operators

Predicates support boolean AND and OR.

```
[ if foo and bar ]
[ if foo && bar ]

[ if foo and not bar ]
[ if foo && !bar ]

[ if foo or bar ]
[ if foo || bar ]
```

## Parentheses

Parentheses can be used to specify precedence

```
[ if (foo or bar) and baz ]
[ if (foo || bar) && baz ]
```


## Bag Nodes

A bag node always begins with a predicate descibing when that node should trigger.

```
## gottenEnoughSleep
[ hoursOfSleep > 7 and hoursOfSleep < 9 ]
text: "Wow, you got the perfect amount of sleep!"
```

You'll also notice that bag nodes have **two pound signs** in their title line: (`## nodeName` or `## nodeName ##`).
### Tracks

By default, only one bag node will play at a time.

To change this, you can set different bag nodes to be on different "tracks"
(which are just unique string identifiers). At any given time, at most 1 bag node
will play on any given track.

```
## node1
text: I am some text to be read!

## node2
text: I am some other text to be read!

## backgroundMusic
track: bgmusic
audio: smoothJazz.mp3
```

When this story loads, either `node1` or `node2` will play (for that case, play order would be nondeterministic), and when one finishes the other will play. `backgroundMusic` will also play from the start, since being on a separate track means it doesn't need to wait for the other nodes to complete.

### allowRepeats

By default, a bag node will only ever trigger once over the course of a game.
Adding the `allowRepeats` keyword bypasses this.

```
-- If something else sets `holdingNose` to false, this can re-trigger
## gotYourNose
[ holdingNose == false ]
say: Got your nose!
set holdingNose to true
allowRepeats
```

## Graph Nodes

Graph nodes have one or more **choices**  at the end.


### Choices

A choice links a graph node to another graph node.

If a choice has no predicate, it will immediately jump to the named node after the
active node's passages are complete.

```
# countdown
shout: 3... 2... 1...
-> beginLooking

# beginLooking
shout: Ready or not, here I come!
```

If a choice has a predicate, it'll jump to the named node after both the node's
passages are complete and when the predicate is met.

```
# forkInTheRoad
text: You reach a fork in the road. Do you go left or right?
-> left: [ choice is "left" ]
-> right: [ choice is "right" ]
-> misunderstood: [ choice exists and choice isnt "left" and choice isnt "right"]

# left
text: You go to the left!

# right
text: You go to the right!

# misunderstood
text: Uh, where did you go?
text: Please go either left or right
-> forkInTheRoad
```

### Dead Ends

When the last passage in a graph node is completed, if that graph node has no
choices, and the next node in the document is a graph node, the graph will
automatically transition to that node. You can add the `deadEnd` keyword to disable that.

```
# firstNode
count: 1

# secondNode
count: 2
-> thirdNode

# twoPointFiveNode
count: 2.5

# thirdNode
count: 3
deadEnd

# fourthNode
count: 4
```

Will result in the following passages being played:

```
count: 1
count: 2
count: 3
```

### Starting Node

By default, the first active graph node will be the first graph node listed in the file. You can change this by specifying a start node by name at the top of your story:


```
# JillIntro
jill: "Hi Jack, my name is Jill!"

# JackIntro
jack: "Hi Jill, great to meet you!"
```

```
start: JillIntro

# JackIntro
jack: "Hi Jill, great to meet you!"

# JillIntro
jill: "Hi Jack, my name is Jill!"
-> JackIntro
```

Each of these will result in:

```
jill: "Hi Jack, my name is Jill!"
jack: "Hi Jill, great to meet you!"
```

## Advanced functionality

### Inline Bag Nodes

Let's take another look at our "fork in the road" choice example from above:


```
# forkInTheRoad
text: You reach a fork in the road. Do you go left or right?
-> left: [ choice is "left" ]
-> right: [ choice is "right" ]
-> misunderstood: [ choice exists and choice isnt "left" and choice isnt "right"]

# left
text: You go to the left!

# right
text: You go to the right!

# misunderstood
text: Uh, where did you go?
text: Please go either left or right
-> forkInTheRoad
```

The player choosing an invalid input and going to the `misunderstood` branch is a bit of a dead end. It's also a bit clunky: if the user says the wrong thing, you might not want to directly just loop them right back to `forkInTheRoad`, complete with replaying the exact same content.

Instead, we could model it as what is called an "inline bag node":

```
# forkInTheRoad
text: You reach a fork in the road. Do you go left or right?
-> left: [ choice is "left" ]
-> right: [ choice is "right" ]
<-> [ choice exists and choice isnt "left" and choice isnt "right"]
  text: Uh, where did you go?
  text: Please go either left or right
```

If `choice` is set to something that isn't `"left"` or `"right"`, those two passages will be presented, but the current graph node will still be (and will never have changed from) `forkInTheRoad`.

You can think of that as a bag node whose predicate is both the given predicate and one saying that it should only ever trigger if the current graph node is the one it's declared within.

Inline bag nodes might seem a bit confusing at first, but they're a super useful tool, particularly for dead-end cases like this where you don't want handling error states to complicate your happy-path flow. They're a great example of how expressive having both graph-based and trigger-based systems coexisting can be.

For some practical examples of inline bag nodes, check out the [switchboard](https://github.com/lazerwalker/storyboard-lang/blob/master/examples/switchboard.story) sample script.


### Global Game State

The entire current state of a given game is stored in the same place that normal variables are set. This means that you can reference the state of a game itself when writing content!

As an example, the 'elevator' example story includes the following predicate: `[altitude <= graph.previousChoice.predicate.altitude.gte]`. This means that the associated node will only ever trigger if:

1. The choice that led the player to the current graph node relied on the `altitude` variable being greater than or equal to something else
2. The current value of `altitude` is now less than or equal to what that value was.

Right now, the structure of the game state isn't particularly well-documented. If you have a functioning local development copy of Storyboard, check out `dist/types/state.d.ts` for type definitions of what exists.

**WARNING**: As there are no access permissions, all of this internal state is read/write. If you really want to, you can modify the internal state of a playthrough while it's happening. Unless you have a _very_ specific reason to do so, you probably don't want to do this. You can do some pretty powerful stuff with this sort of metaprogramming, but you're on your own.