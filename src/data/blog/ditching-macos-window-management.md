---
title: "ditching macOS window management hell"
description: "spoiler: it's AeroSpace. and it's one of those tools that's 80% of your speed bump."
tags: ["productivity", "macos", "tools", "aerospace"]
bannerImage: "ditching-macos-window-management.webp"
bannerImageAlt: "macOS window management with AeroSpace tiling window manager"
createdAt: 2026-02-28
updatedAt: 2026-02-28
---

## windows mismanaged

aight. let's talk about window management.

if you don't know what that means, you prolly have gotten used to whatever default solution your operating system has. and 99% of the time, that's floating windows.

there's nothing inherently wrong with floating windows. jk, no, there's a lot wrong with them. it's just too much work to get anything done.

picture this: you're coding. you need to check the docs, then your terminal, then back to your editor. you hit `cmd + tab`. you tab past slack, past spotify, past 3 different chrome windows you forgot you had open, overshoot your terminal, cycle back, and by the time you're there, you forgot what command you were going to type.

or worse, you're doing that 3-finger DJ swipe on the trackpad trying to find the right desktop, your open apps explode onto there randomly for you to search. you're wasting so much cognitive energy just _finding_ your tools.

i was on windows first. you know how it goes there. i never took anything seriously there.
then i went to linux. kde first. then i discovered `i3` and fell in love. it made so much sense. then the flashy `hyprland`.

this is the world of **tiling window managers**. instead of windows stacking on top of each other like a messy desk, they automatically resize and tile next to each other perfectly. like a bento box. no dragging edges, no overlapping.

### bringing sanity to macos

then i was, and is, on macos.

after going thru what i did with linux, i HAD to dig and find something like that for mac. and i did. there was amethyst. there was yabai. but they weren't straightforward. they fought the OS too much.

then i found the most simple, straight-forward option: **AeroSpace**.

and man, it just worked. it uses TOML for configs (not i3's syntax), but they provide an "i3-like config" sample that maps all the familiar keybindings. suddenly, i was FLYING between windows.

the secret sauce isn't just the perfect grids. it's the muscle memory.

there are things i want done, and i have all the controls i need right at my fingertips. it's all in one place, the same place i leave it at.

- `alt + t` -> terminal (WezTerm)
- `alt + b` -> browser (Arc)
- `alt + c` -> code editor (Cursor)
- `alt + f` -> finder
- `alt + o` -> obsidian

and then i also have `alt + 1..10` for arbitrary apps i want to keep open in specific workspaces.

and it's _always_ there.

i hit the hotkey combo and i know that app is open there, or it will open if it's not. i don't have to search between different desktops, swipe, and use my actual brain to find where my terminal went.

my brain doesn't search for apps anymore. _i finger them, and they come_.

### but wait, there's more

it also has a lot of flexibility when it comes to managing windows, working with multiple monitors, or hell, even toggling an app back to a floating window if you really need to.

you're able to freely move the focused app to any workspace with `alt + shift + <workspace>`. you can have multiple apps open in any workspace, arranged in all kinds of different combinations like neat grids or bento boxes.

it's almost perfect. like, _very_ much almost. i've seen it have weird behavior when i was working with the ios simulator or android emulator, but those things are weird by default anyway.

### you have to try this

i don't want to waste your time, so here's the brew install:

```bash
brew install --cask nikitabobko/tap/aerospace
```

still not convinced? let the creator convince you in 91 seconds:

<iframe width="560" height="315" src="https://www.youtube.com/embed/UOl7ErqWbrk" title="AeroSpace Demo in 91 seconds" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

install it, pull a basic config from their github, or use my [dotfiles](https://github.com/jassuwu/dotfiles/blob/mac/.config/aerospace/aerospace.toml) and give it 24 hours to build the muscle memory. if you don't feel twice as fast by tomorrow, you can go back to your messy floating windows. but you won't.

tiling window management is love. tiling window management is life. i just wanted to share that everything else is objectively wrong and i will die on that hill.

tyvm. fight me. byeeeeeeeeeeeeee.
