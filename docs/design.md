# **Store Galore — Daily Loop & Data Model**

## **Design goals**

Store Galore is a shared-town tycoon: everyone's stores sit on one map per Discord server, and the best moves depend on your friends. Three rules shape every feature below.

* **30 seconds a day.** One check-in covers everything. Nothing punishes a missed day beyond lost profit.
* **Every check-in touches a friend.** Your daily visit, your neighbors, and town projects all involve other players. No action is purely solo.
* **One town per server.** Your friend group is the first town. Any server that adds the bot gets its own, which is how the game spreads.

## **Daily loop**

A check-in is one command, /checkin, that runs three steps and posts one summary. Days reset at a fixed hour per town (e.g. 6 a.m. server time).

1. **Collect.** Profit since your last check-in lands in your wallet, capped at 48 hours so a missed day costs little and a missed week doesn't matter more.
2. **Visit.** You get one shopping trip per day. Spend it at any friend's store: they get a customer boost for the day, and you get a small drop (coins, a decoration, or a reroll coupon) based on that store's type.
3. **Roll (optional).** If you have a free roll or enough coins, roll for a new store and place it on an empty plot. Rerolls cost coins, as in the notes.

The bot then posts a daily digest in the town channel: who visited whom, new stores, and progress on the current town project. That digest is the "vlog" — it's how friends see each other's activity without extra effort.

**Weekly:** market day (one rare store appears for auction or a lottery), and a new town project. **Seasonal:** the store pool and seasonal bonuses rotate every month or so, and seasonal achievements (Summer Sweat, Winter Monarch, etc.) open.

## **Core data model**

The model splits **templates** (what can exist, shared by all towns) from **instances** (what a player owns in one town). Store definitions live in config; everything per-town lives in Postgres. Store profit isn't saved per tick — it's computed from timestamps at check-in.

| Table | What it holds | Key fields |
| :---- | :---- | :---- |
| towns | One per Discord server | guild\_id, grid width/height, day reset hour, current season |
| players | One per user per town | town\_id, discord\_user\_id, coins, xp, last\_checkin\_at, last\_visit\_at |
| plots | Grid cells of the town | town\_id, x, y, zone (residential, downtown, park), store\_id (nullable) |
| store\_templates | Every store type from the notes | name, category (food, shop, activity), size, allowed rarities, base profit, tags, seasonal flag |
| stores | A store a player owns | owner\_id, template\_id, rarity, plot\_id, acquired\_at, last\_collected\_at |
| visits | One row per daily trip | visitor\_id, store\_id, day, drop received |
| town\_projects | Weekly cooperative goals | town\_id, kind, requirements (JSON), progress, reward, ends\_at |
| achievements | Unlocked titles | player\_id, achievement\_key, unlocked\_at |
| ledger | Every coin change | player\_id, amount, reason (collect, roll, visit, gamble, sale), ref id |

Two choices worth keeping:

* **Sizes take multiple plots.** An XL store covers a 2×2 block, so plots.store\_id points several cells at one store. Adjacency checks then work on cells, not stores.
* **The ledger is the source of truth.** players.coins is a cached sum. That makes gambling disputes, refunds, and balance tuning easy to audit later.

## **Key mechanics**

### **Rolling**

Roll rarity first, then pick a template that allows that rarity, weighted by size. The notes' odds sum past 100%, so these are suggested weights to start from:

| Rarity | Weight (%) | Profit multiplier |
| :---- | :---- | :---- |
| Common | 50 | 1× |
| Uncommon | 28 | 1.5× |
| Rare | 15 | 2.5× |
| Epic | 6 | 4× |
| Legendary | 0.99 | 8× |
| Mythical | 0.01 | 20× |

Size weights could be XS 10, S 25, M 40, L 20, XL 5\. Season and event modifiers nudge weights for tagged templates (a smoothie shop is likelier in summer).

### **Profit**

Each store's hourly profit at check-in:

\\text{profit} \= \\text{base} \\times \\text{rarity} \\times (1 \+ \\text{neighbor bonus} \+ \\text{visit bonus} \+ \\text{season bonus})
Bonuses add rather than multiply, so stacking stays predictable. Cap the total bonus (e.g. \+150%) so a perfect block doesn't run away from everyone else.

### **Neighbor synergy**

Templates carry tags (food, sweet, caffeine, nightlife, family, community). Pairs of tags give a bonus when stores touch, and the bonus is bigger when the stores belong to **different owners** — that's the nudge to build next to friends.

* Coffee \+ dessert: \+10% each (+20% if different owners)
* Bar \+ diner: \+10% each, nightlife
* Any store next to a community space (park, pool): \+5%, shared by everyone touching it

### **Visits**

A visit adds \+25% profit to that store for the rest of the day, stacking up to three visits. The visitor's drop depends on category: food drops coins, shops drop decorations, activities drop reroll coupons. Visiting a different friend each day for a week could earn a small bonus, so people spread visits around.

### **Town projects**

Each week the bot posts one project with requirements anyone can help meet, such as "Food Court: three food stores from three owners in one 3×3 area" or "Fund the Park: 5,000 coins pooled". Finishing it gives everyone who contributed a reward, and the town map shows a permanent landmark.

## **Build plan**

Ship the smallest playable version to the friend group first, then add polish only once the daily loop has proven fun.

1. **MVP bot (TypeScript \+ Postgres).** /checkin, /visit @friend, /roll, /town (text summary), and the daily digest. About 15 store templates and adjacency bonuses only. Play it for two weeks.
2. **Rendered town map.** The bot draws the grid as an image (e.g. with node-canvas) for /town and the digest. This is the cheapest "real UI" and the most shareable thing in the game.
3. **Full content and systems.** All store types from the notes, achievements and titles, the shop, gambling, seasons, and town projects.
4. **Discord Activity.** An embedded web app inside Discord with a pannable, clickable town. It reuses the same backend, so the bot keeps working for quick check-ins.

Keep the game logic in one module that knows nothing about Discord. The bot, the image renderer, and a future web UI then all call the same functions.

## **Server structure**

The bot plugs into any existing server and needs one channel and no roles. Your own town runs the same way in your friend group's server, and a hub server can come later if the game grows.

### **What the bot adds to a server**

* **One digest channel.** An admin picks it during setup, and all public game posts go there.
* **Slash commands.** They work in any channel: /checkin, /visit, /roll, /town, /profile, /title.
* **Private replies by default.** Personal results (your roll, your wallet, your visit drop) come back as ephemeral messages only you can see, so the game doesn't flood a shared server. Only the digest and big moments, such as a Legendary roll or a finished project, are public.

### **Setup flow**

1. An admin invites the bot with minimal permissions: View Channel, Send Messages, Embed Links, Attach Files (for the map image), and Use Application Commands. It never asks for Manage Roles or Manage Channels.
2. The admin runs /setup channel:\#store-galore. This creates the town, saves the digest channel, and posts a welcome message with how to play.
3. Optional settings: daily reset hour, time zone, and whether gambling is enabled.
4. Players join by running /checkin once. They get starting coins and one starter store on a random empty plot.

The towns table gains digest\_channel\_id, reset\_hour, timezone, and a settings JSON field for these.

### **Titles instead of roles**

Achievements unlock titles that live in the game, not in Discord. A player picks an active title with /title, and it shows on /profile, in the digest ("Jeff, Chief of Commons"), and on public announcements. Upgrades like Chief of Commons to Caller of Commons just swap the title.

### **Where the notes' channels go**

Each channel from the original notes maps to something lighter in an existing server:

| From the notes | In an existing server |
| :---- | :---- |
| Announcements, special events | Posts in the digest channel |
| View Land | /town and /profile commands |
| Rolling, Shop | Slash commands with private replies |
| Role promotions, achievements | Title unlocks announced in the digest |
| General, voice chats | The server's existing channels |
| Support, feedback, dev chats | Your own server for now, a hub server later |

## **Open questions**

* ☐ Free rolls: one per day, or only coin-bought rolls?
* ☐ Can players move or sell stores to each other, or only back to the bank?
* ☐ Town size: fixed grid, or does it grow as more players join?
* ☐ Gambling: keep double-or-nothing, and if so, what daily cap?
* ☐ Real brand names or parody names ("McDougal's", "Costgo") before other servers join?
* ☐ Should towns ever interact (trade, leaderboards), or stay fully separate?
