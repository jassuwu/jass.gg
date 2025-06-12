---
title: "choosing git merge AND git rebase"
description: "i won't choose for you, but i'll enable you to choose for yourself. and that's the point."
tags: ["tech", "git", "i put effort into this"]
bannerImage: "git-merge-and-git-rebase.webp"
bannerImageAlt: "sakurajima mai holding a book with the title"
createdAt: 2025-06-11
updatedAt: 2025-06-11
---

# gitting gud

i've always been team rebase because that's what my first team taught me. but recently someone on a PR just casually used merge instead, and i was like "wait, that's illegal." turns out they've *always* used merge.

now we're in this mexican standoff where neither of us can convince the other because we don't actually understand *why* we prefer our way. classic.

so i said fuck it, let's dig this hole. spent some time making <a href="https://gist.github.com/jassuwu/b10a633fb60d4b5015cb0b33c2ca0e9e" target="_blank">one of those flowcharts that asks you questions and tells you what you want</a>.

it asked me: "do you want linear history?"
<br />
me: "uh... yes?"
<br />
also me: "actually, what does that even mean?"

i have no idea what i'm doing.

turns out the `merge` vs `rebase` debate isn't about commands. it's about philosophy. there are two schools of thought:

1.  **that 100%, exact, legit, no filters, no edits type beat:** git log should be a perfect transcript of everything that happened. every merge, every sync, every "oops fixed typo" commit. chaotic but honest. this is `git merge` territory.

2.  **the you don't need to know the details type beat:** git log should read like a clean story. messy details stay in the PR history where they belong. this is `git rebase` land.

i thought i was team rebase, but i'd never felt the pain of choosing wrong, so i wouldn't know.

### the bug hunt from hell: a tale of two timelines

friday, 4 PM. boss comes running over like the building's on fire. critical bug crashed the user profile page, big client threatening to cancel. you need to find the cause *now*.

you and mani both pushed code this week. you built the profile page, mani built caching. bug's somewhere in between.

#### universe A: team merge (preserving all history)

your `git log` looks like spaghetti code had a baby with a bowl of ramen:

```
*   Merge branch 'feat/user-profile' into develop
|\
| *   Merge branch 'develop' into feat/user-profile
| |\
| | * (your other commits)
|/|
* |   Merge branch 'feat/enable-caching' into develop
...
```

you run `git bisect`. it points to: **"Merge branch 'develop' into feat/user-profile"**.

you open it. it's hundreds of lines mixing mani's caching with your half-finished profile code. the bug isn't in her code or your code, it's in the *combination*. and this merge commit is the only place it exists.

`git blame` just points to the merge commit. you're fucked. weekend = gone. client = lost. sanity = obliterated.

#### universe B: team rebase (clean linear history)

your `git log` is as clean as my search history:

```
* feat: Add user profile page
* feat: Enable caching system
* fix: Correct login button color
...
```

boss freaking out. you run `git bisect`.

it checks "fix login button" → **PASS**.
it checks "enable caching system" → **FAIL**.

boom. laser-focused on mani's exact 30-line commit. you walk over, point out the issue, fix it together in 5 minutes. you're home by 4:15 PM and living your work-life balanced (wtf is that) life.

### plot twist: they're not enemies

seeing that, i was ready to declare "rebase supremacy" and call it a day. but hol-up. merge commits aren't the villain. they're just misunderstood.

merge commits are for when you *want* to preserve that "two lines of work came together" moment. like when you're merging `dev` into `main` for a release:

```bash
git merge --no-ff dev
```

that merge commit becomes a milestone: "everything before this is v2.0, everything in this merge is v3.0." if you need to revert the whole release, you just revert that one commit. it's actually big brain.

### the real answer: why not both?

they're not competing. they're different tools for different jobs. here's the galaxy brain workflow:

1.  **`git rebase` = your private workshop**

    this is your personal editing room. before anyone sees your work, you use a powerful command called **interactive rebase (`git rebase -i`)** to clean up your own mess. you can reword your commit messages, combine ten tiny "wip" commits into one logical one, and delete that accidental commit where you saved your password. it's the ultimate tool for polishing your story before it leaves your laptop.

    but this power comes with <a href="https://www.atlassian.com/git/tutorials/merging-vs-rebasing#the-golden-rule-of-rebasing" target="_blank" rel="noopener noreferrer">one unbreakable rule</a>: **never, ever rebase a branch that other people are using.** rebasing a shared public branch rewrites history and will make them throw their laptops at you, so keep your rebasing to your own private branches, or prepare for chaos.

2.  **squash and merge = the editor's touch**

    even if you've already cleaned up your branch with interactive rebase, squashing on the PR is the final step. it ensures that only one single, atomic entry representing your entire feature makes it into the `dev` branch's official history. the main branch doesn't need to see your 15 "fix linting" commits.

3.  **`git merge` = marking important milestones**

    when releasing, merge `dev` into `main` with a proper merge commit. it's a historical marker, not just code changes. it's the one time you want to preserve the exact moment when a complete feature set was integrated.

so when my colleague said he "just uses merge," he wasn't wrong, he was just using the wrong tool at the wrong time. and i was being overly rigid about always rebasing, even when a merge commit would be more meaningful.

the goal was never to choose sides. it was to understand when to clean up your work, when to preserve context, and when to mark important milestones. that's how you don't just use git, that's how you git gud.

---

_hey, this is not an end all, be all guide. this is just my take on git/github workflows after been working with it for a couple of years, and finally deciding to look into it a bit. maybe i'll reshape my flow as shoot myself in the foot with this workflow. maybe i'll experience the pain of the people who think the opposite of what i just wrote. maybe i was on a god-run and just got the best workflow for all cases (prolly not), or maybe i still dunno what i'm doing. (prolly)_
