# Player UI Container

## Versions of this Doc
- 09/03/2019 for R14 Initial version

## What is Player UI Container?

The Player UI Container is a new item stack container which has slots for various player-specific UI screens (e.g. cursor, 3x3 crafting table input, anvil inputs, etc).
See *Appendix - Player UI Container* below for details of all the slots.

This new container is in preparation of Server Authoritative changes for container items.
Player UI Container enables servers to know about all containers that clients see and use (e.g. for crafting).
This container will be used later in enabling servers to become fully authoritative about all item stacks in all containers.

These changes affect existing packets as well as game saves.

## Inventory Transaction Packets

We're looking to deprecate use of the existing Inventory Transaction Manager and its packets in favor of the newer Server Authoritative system in development.
In the meantime these packets are still used but with some changes as we transition systems.

### Container ID

Container ID (124), used to indicate Cursor Selected, but is now repurposed to indicate the new Player UI Container.
This new container has a slot for the cursor selected item stack (in addition to other slots, see *Appendix - Player UI Container* below).

### Inventory Source Type

Some of transaction manager packets used to refer to an Inventory Source Type value (100) for Untracked Interaction UI, which was logged as "untrackedUI".
Such packets now use a source type of Non Implemented Feature TODO, value 99999, logged as "TODO".
The previous value (100) is no longer used as a source type.

The Crafting screen previously used a Source Type value (3) for Creative Inventory (with Slot 0 for delete and Slot 1 for pick).
The crafting screen no longer uses that Source Type (3), rather:

Taking an item stack from the recipe book now causes an Inventory Transaction action using Source Type (124) for the Player UI Container ID, with a source slot (50) for it's Created Item Output slot.
The Created Item Output slot is where such newly created item stacks first come into existence.

All newly created items (e.g. from crafting, anvil, loom, etc.) are created into the Created Item Output slot and then transferred out (e.g. to the Cursors slot, or AutoPlaced to inventory).

## Game Saves

The Bedrock Server for R13 saves, for each player:
- "InventoryVersion"
  - As a Semantic Version string, that was changed each release was not used for anything.
- "UntrackedInteractionUIContainer"
  - A container of "untracked" item stacks saved while a player had a screen open with item stack(s) in client-side container slots (e.g. Anvil inputs) which the server didn't otherwise track.
- "CursorSelectedItem"
  - A single compound tag of the item stack in the cursor (including empty item when the cursor is empty).

The Bedrock Server for R14 no longer saves the above fields for players; rather it now instead saves, per player:
- "format_version"
  - A Semantic Version string, that is bumped only when changes to format require version-dependent, backward-compatibility loading.
  - The first and current value written for "format_version" is: "1.12.0"
- "PlayerUIItems"
  - The new Player UI Container, saved in the same general format as "UntrackedInteractionUIContainer" was saved, though with a different container size.
  - This is also to account for saving item stacks when the server saves the game while a player has a screen open.

The Bedrock Server for R14 conditionally reads "UntrackedInteractionUIContainer" and "CursorSelectedItem" fields for backward compatibility.
- If the new "format_version" field is not found or if it's value is older than "1.12.0", then:
- These fields are loaded and processed the same as they were before R13.
  - Such item stacks are transfered into the player's inventory, if possible.
  - Any item stacks that could not transfer (e.g. player's inventory was full), are dropped.
  - R13 had a bug that if dropping such an item failed (e.g. chunk wasn't loaded yet), the item stack would be lost.
  - This bug still exists, but now only in this edge case when also loading old saved games with "UntrackedInteractionUIContainer" item stacks.

The Bedrock Server and Client, for R14, behave differently in the above edge case.
- When a player joins and their "PlayerUIItems" container is processed, the server:
- Similarly attempts to transfer such item stacks into the player's inventory.
- Any such item stack transfers may fail (e.g. player's inventory is full or become full midway).
- Remaining items are attempted to be dropped to the world.
- These item stack drop attempts may also fail in Bedrock Server (e.g. chunk is not yet loaded).
- Remaining item stacks are kept in their respective Player UI Container slots.
  - A player may find such items by opening an associated container screen.
  - For example, such items stack(s) remaining in Anvil input slot(s) would show upon the player opening any Anvil screen.
  - Likewise, a cursor selected item stack would still show in the cursor in any screen that supports item stacks in the cursor.
- These new features are to fix the above mentioned bug, by now preventing the loss of a player's item stacks.

## Appendix - Player UI Container

## Size

51 slots

### Slots

| Index | Purpose | Comment |
| ----- | ------- | ------- |
|  0 | Cursor Selected | Selected item stack for keyboard/mouse & gamepad input modes |
|  1 | Anvil Input |
|  2 | Anvil Material |
|  3 | StoneCutter Input |
|  4 | Trade2 Input | Trade2 is the new trade screen, 2 inputs |
|  5 | Trade2 Input |
|  6 | Trade Input | Trade (not 2) is the old trade screen, 2 inputs |
|  7 | Trade Input |
|  8 | Material Reducer Input | EDU Chemistry Block |
|  9 | Loom Input |
| 10 | Loom Dye |
| 11 | Loom Material |
| 12 | Cartography Input |
| 13 | Cartography Additional |
| 14 | Enchanting Input |
| 15 | Enchanting Material |
| 16 | Grindstone Input |
| 17 | Grindstone Additional |
| 18 | CompoundCreator | EDU Chemistry Block, 3x3 inputs |
| 19 | CompoundCreator |
| 20 | CompoundCreator |
| 21 | CompoundCreator |
| 22 | CompoundCreator |
| 23 | CompoundCreator |
| 24 | CompoundCreator |
| 25 | CompoundCreator |
| 26 | CompoundCreator |
| 27 | BeaconPayment |
| 28 | Crafting 2x2 | Inventory 2x2 crafting inputs |
| 29 | Crafting 2x2 |
| 30 | Crafting 2x2 |
| 31 | Crafting 2x2 |
| 32 | Crafting 3x3 | Crafting table 3x3 inputs |
| 33 | Crafting 3x3 |
| 34 | Crafting 3x3 |
| 35 | Crafting 3x3 |
| 36 | Crafting 3x3 |
| 37 | Crafting 3x3 |
| 38 | Crafting 3x3 |
| 39 | Crafting 3x3 |
| 40 | Crafting 3x3 |
| 41 | MaterialReducer Output | EDU Chemistry Block, 9 outputs |
| 42 | MaterialReducer Output |
| 43 | MaterialReducer Output |
| 44 | MaterialReducer Output |
| 45 | MaterialReducer Output |
| 46 | MaterialReducer Output |
| 47 | MaterialReducer Output |
| 48 | MaterialReducer Output |
| 49 | MaterialReducer Output |
| 50 | *CreatedItemOutput | Special slot for all newly created items |

### Created Item Output

This slot is not yet used by the Bedrock Server (it will be soon).
It is not associated with any one slot, but rather will be used by all output slots.
This slot is currently always empty on the server; it will always be empty when saving a player.
This slot should thus never be saved in the "PlayerUIContainer" data for a player (as empty slots are not saved out).
Likewise, this slot should never be loaded for a player from saved data.
More about this slot and its uses for server auth will be documented later.
