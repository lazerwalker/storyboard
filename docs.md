# What is Storyboard, and Why Does It Exist?

Storyboard is a small embeddable narrative engine designed to help enable multilinear and nonlinear storytelling, particularly for work using experimental interfaces. 

It really exists to solve two different (but related!) problems:

## 1. An Interface-Agnostic Engine
These days, there are a lot of really great accessible tools to make narrative games (e.g. Twine, RenPy) that are a joy to use. Sadly, they're most easily used to make things that look or behave a certain way; you can use Twine's editing UI to make something that isn't hypertext-based, but you're going to spend a lot of time writing fiddly custom code, and even then it's not going to be a great experience.

Storyboard is a general-purpose narrative engine that doesn't know or care about what your experience looks and feels like. It aims to give authors an easy interface to write stories that react and change based on more varied forms of input and output, with easy ways to reason about weird interfaces. You can use it to make a traditional 3D game, or a Twine-like piece of hypertext fiction, a location-based augmented reality game for smartphones, or anything else you can think of.

There are Unity scripting tools with similar goals, but Storyboard was designed to be runnable in environments where Unity might not be the best fit for various reasons (although it will also be usable within Unity).


## 2. A Better Framework for Modeling Narrative
Most narrative tools take one of two approaches. Either your story's narrative content is modeled as a directed node graph (think Ink's knots, or Twine's "boxes and arrows" UI), or it's a spreadsheet/database of potential bits of content that get contextually triggered based on the world state (the canonical example being Elan Ruskin's [GDC talk](http://gdcvault.com/play/1015528/AI-driven-Dynamic-Dialog-through) on the dynamic dialog system in Left4Dead). Each system has its own advantages and disadvantages; while you can generally tell any story with either type of system, each has types of narrative content that it is better or worse at modeling than the other. 

One of Storyboard's core hypotheses is that combining both of these systems can give you the best of best worlds. It offers both a node graph model and event-based model, with deep interoperability between them (e.g. being able to trigger certain event-system nodes based on the current node graph state, or vice versa). The hope is that this will enable authors to spend less time figuring out how to shoehorn what they're trying to do into a narrative model, letting them spend more time writing!

Storyboard isn't an attempt to reinvent the wheel; it's an attempt at unifying existing best practices into something more flexible and usable than what already exists.

# How it Works

All of the description below uses Storyboard's JSON-based format. Eventually, the hope is that there will be a web-based authoring tool that doesn't require knowledge of the fiddly JSON schema.

## Inputs and Variables

You can 

```js
game.receiveInput('numberOfSteps', 5000)
```

 

In a lot of cases, you don't want to store some state in a variable so much as perform a single action or play a little bit of content in response to an event happening. The `receiveMomentaryInput` method will try to make changes to the narrative state based on the provided input, but won't save that variable itself in the game's internal state.
```js
game.receiveMomentaryInput('pressedButton', true)
```

## Outputs

Any time a piece of content is played in Storyboard, it has an "output" type. As an author, an output type is just a string; as a developer, integrating Storyboard within your game or experience, you'll wire up a given output type to a given output handler (a plain JavaScript callback). For example:

```js
var game = new Storyboard.Game({ /* game content here */ });
game.addOutput('text', function(content, passageId) {
    console.log(`Passage ${passageId}: ${content}`);
});
game.start();
```

Any time the game engine tries to play a piece of content of type "text", that function will run, and will log out the passageId and content to the console. 

Only a single handler may be registered for a given content type, but you may have as many different content types as you'd like.

## Passages

The core unit of content in Storyboard is a `passage`. A single passage looks like this:

```json
{
    "passageId": "1",
    "type": "output",
    "predicate": { "foo": {"gte": 1} },
    "content": "Hello world!"
}
```

**passageId** is a unique string identifier. 

**type** is an output type. <EXPAND>

**predicate** is an optional set of conditions that specify whether the passage should trigger. If the state of the game is such that one of them is false, the passage will not play, and execution will skip to the next passage.

**content** is the text content of the passage. This can be literal text, but it can also be whatever (text-formatted) information is useful to the output format. 