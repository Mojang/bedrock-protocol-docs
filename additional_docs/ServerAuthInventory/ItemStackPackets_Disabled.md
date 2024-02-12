# ServerAuthInventory / ItemStack Packets / Disabled

## Versions of this Doc
- 05/12/2020, for R16, Initial version
- 01/07/2021, minor typo fixes and clarification of related packets in section OpenContainerPacket

## Abstract

Servers, as of R16, can be much more authoritative over item stack transfers via a new ItemStackNetManager system. Whereas beforehand clients were widely client-authoritative over their inventories and related mechanics such as crafting results.

ItemStackNetManager:
- Clients send requests for UI item stack changes in Container Screens.
- Client request are for simple transfers and also various Crafting/Trading/Enchanting/etc.
- Clients locally predict results for most UI operations to mask latency.
- Servers process requests and authoritatively respond with success or failure to each.
- Clients apply changes on success and otherwise throw away relevant predictions on failure.
- Clients do not wait for responses before sending subsequent requests for further smooth UI.

## Terms, Scope and Packet Documentation

*ItemStackNetManager* is hereafter referred to simply as *system*, *this system*, *new system*, etc. throughout this document.

This document covers protocol changes related to this system only (i.e. does not include any other network protocol changes that may also ship in the same release).

All packet descriptions, enumeration values, and similar in this document are here for discussion purposes and may be out of date. Please refer to the general network protocol documentation of the release (including the first release of this system) for latest-and-greatest packet layouts, enumeration values, etc. found there - i.e. trust data there over duplicated-and-possibly-out-of-date values in this document.

## Disabling Approach - The Easier Way

Using ItemStackNetManager is a large network protocol change, perhaps the largest to date for Minecraft.

To ease supporting these protocol changes the new ItemStackNetManager system can be disabled by servers.

This document covers only the use case of disabling this new system and other related protocol changes that are still necessary (whether enabled or disabled). Most of these other protocol changes are intended for use when the system is enabled, however most new fields are still serialized while the system is disabled, typically serialized as dummy values.

A later document will be shared with much more detail about what the ItemStackNetManager system is and how to fully enable and use it for its anti-cheat benefits and more.

## Check List For Compatibility

High level checklist and description of what needs done on servers to become compatible; see sections below for further detail regarding each of these steps:

- `StartGamePacket` - serialize the new `mEnableItemStackNetManager` bool to `false`.
- `InventoryContentPacket` - serialize `0` (empty slots) or `1` (non-empty slots) for the new `ItemStackNetId` field per slot.
- `InventorySlotPacket` - serialize `0` (empty slot) or `1` (non-empty slot) for the new `ItemStackNetId` field for the slot.
- `CreativeContentPacket`
  - Refactor use case out from `InventoryContentPacket`.
  - Serialize unique values for the new `CreativeItemNetId` fields per creative item.
- `CraftingDataPacket` - serialize unique values for the new `RecipeNetId` fields for various `CraftingDataEntry` types.
- `InventoryTransactionPacket`
  - Serialize `0` for the new `LegacyRequestId` field.
  - Serialize `false` for the new `hasNetIds` field per `InventoryAction`.
- `OpenContainerPacket` send for opening of all container screens; clients depend on this now for all container screens.
- `InteractPacket` - Fyi, is now *also* sent by clients, to open the Inventory screen, for the use-case of the player *not* riding a mob.
- `MobArmorEquipmentPacket`
  - No changes to the contents of the packet.
  - Various changes to when Bedrock servers send this packet.
  - Bedrock servers no longer handles receiving this packet.
- `UpdateTradePacket` - serialize `1` for the new "netId" tag per `MerchantRecipe`.

## StartGamePacket

The `StartGamePacket` now has a `bool mEnableItemStackNetManager` - set it to `false` when sending to clients.

Disabling the system causes related network protocol to mostly match the previous release and is thus a much easier first approach than enabling and using ItemStackNetManager.

Disabling ItemStackNetManager is no less server authoritative than the previous release nor is it any more server authoritative while disabled.

## Server Partner Rollout Consideration

This disable-approach provides a means for partners to update servers more quickly to be compatible with the new R16 clients and provides server partners with more time, post-R16 release, to transition over to fully supporting the system in its enabled mode.

The ability to disable the system will be removed in a later release, at which point clients will require full support from servers for ItemStackNetManager being enabled.

This disable-feature is temporary because supporting it costs a burden to Bedrock Minecraft development and quality validation; it also blocks further server authoritative feature work until removed.

## ItemStackNetId

The server is authoritative about the generation and assignment of `ItemStackNetIds` values in various packets below.

For now, with the system disabled, these values only need to be:
- **Zero** (0) for empty slots (i.e. empty item stack in the slot).
- **One** (1) for non-empty slots (i.e. a non-empty item stack in the slot).

These values are generally serialized in packets below as VarInt (packed 32-bit signed integer) in binary streams; and sometimes as IntTag in nbt CompoundTags serialized in some packets.

## Client Debug Asserts

Sending incorrect values to clients, for packet values below, will cause client debug asserts in builds that have them (e.g. release builds with asserts enabled).
Such asserts are documented below per packet type.

## InventoryContentPacket

Servers now include ItemStackNetId values, for all item stacks, sent in InventoryContentPackets to clients:
- Zero (0) for each empty slot.
- A valid ItemStackNetId for each non-empty slot - for now use a value of One (1).

Servers serialize these new ID values, as VarInt types, before each item stack in the packet.

Clients do not send this packet.

#### Client Asserts

- `InventoryContentPacket::read()`
  - "Sent an invalid server net ID for a non-empty item"
  - "Sent a valid server net ID for an empty item"
- `ItemStack::clientInitNetId()`
  - "Invalid call for an invalid item to initialize to a valid server net id"
- `LegacyClientNetworkHandler::handle()`
  - "Failed to send item stack net id from the server."

#### Creative Items Refactor

Note that creative items have been refactored out of `InventoryContentPacket` and put into their own new `CreativeContentPacket`. So no more using `ContainerId::CONTAINER_ID_CREATIVE = 121` for the inventory ID of `InventoryContentPacket`.

## InventorySlotPacket

Servers now include an ItemStackNetId value, for the item stack, in InventorySlotPackets sent to clients:
- Zero (0) for an empty slot.
- A valid ItemStackNetId for a non-empty slot - for now send a value of One (1).

Servers serialize this new ID value, as a VarInt type, before the item stack in the packet.

Clients do not send this packet.

#### Client Asserts
- `ItemStack::clientInitNetId()`
  - "Invalid call for an invalid item to initialize to a valid server net id"
- `InventorySlotPacket::read()`
  - "Sent an invalid server net id for a non-empty item"

## CreativeContentPacket

This is a new packet for servers to send creative items to clients.
It replaces a previous use of `InventoryContentPacket` when sent before with an inventory ID of `ContainerId::CONTAINER_ID_CREATIVE = 121`).
This new packet should be sent at the same time as that previous packet was sent for the use case of creative items.

Servers serialize a list of `CreativeItemEntry` values, where each element is a pair of:
- `CreativeItemNetId`, as VarInt type.
- `ItemInstance`, as similarly sent in the previous packet but now with the above unique ID per creative item.

Each of these `CreativeItemNetId` values must be unique and non-zero (0).

#### Uniqueness
Each `CreativeItemNetId` value must be unique as compared to all other `CreativeItemNetId` values that are sent to a given client during the scope of a connection of that client to a server.

These ID values do not need to be unique as compared to values used in previous connections of a given client and there is no uniqueness requirement regarding ID values used from client to client connected to the same server.

It is okay to send the same set of unique IDs to all clients that join/re-join a given server level. It is also fine to simply increment a value for assigning an ID to each creative item. Fyi, Bedrock Servers takes both of these approaches. However, any ID assignment algorithm is fine so long as it fits the uniqueness and non-zero (0) requirements above.

#### Asserts
- `Item::initCreativeItemsClient()`
  - "Removing invalid creative item"
    - Server sent an empty, null or otherwise invalid creative item.
  - "Removing creative item (%s) due to having an invalid CreativeNetId value."
    - Server sent a creative item with an invalid/zero (0) value for its `CreativeNetId`.
  - "Removing creative item (%s) due to duplicate CreativeNetId with existing creative item (%s)."
    - Server sent a duplicate `CreativeNetId` the latter item is removed, whereas the previous item is kept.

All such removal is client-side only. Removed creative items will not show up in recipe book UI.

## CraftingDataPacket
For each `CraftingDataEntry` written in this packet of the following entry types:
- `CraftingDataEntryType::ShapedRecipe` (1)
- `CraftingDataEntryType::ShapelessRecipe` (0)
- `CraftingDataEntryType::ShulkerBoxRecipe` (5)
- `CraftingDataEntryType::MultiRecipe` (4)
- `CraftingDataEntryType::ShapelessChemistryRecipe` (6)
- `CraftingDataEntryType::ShapedChemistryRecipe` (7)
Intentionally excluding entry types:
- `CraftingDataEntryType::FurnaceRecipe` (2)
- `CraftingDataEntryType::FurnaceAuxRecipe` (3)
Servers serialize a `RecipeNetId` immediately after each such Recipe in the packet.

Each of these `RecipeNetId` values serialized must be unique and non-zero (0).

#### Uniqueness
Each `RecipeNetId` of CraftingDataPacket, must be unique as compared to all other `RecipeNetId` values that are sent to a given client during the scope of a connection of that client to a server.

These ID values do not need to be unique as compared to values used in previous connections and there is no uniqueness requirement regarding ID values used from client to client. There is also no relationship nor uniqueness requirement as compared to above `CreativeItemNetId` values.

It is okay to send the same set of unique IDs to all client joins and re-joins of a given server session. It is also fine to simply increment a value for assigning an ID to each such recipe. Fyi, Bedrock Servers takes both of these approaches. However, any ID assignment algorithm is fine so long as it fits the uniqueness and non-zero (0) requirements above.

#### Asserts
- `Recipes::_addItemRecipe()`
  - "Recipe has no net ID assigned: %s"
  - "Recipe \"%s\" (%s) collides in netId with existing recipe \"%s\" (%s)!", with Recipe Id and zeroth result item name followed by existing Recipe Id and its zeroth result item name.

## InventoryTransactionPacket

This existing packet now has a LegacyRequestId field which should always be zero (0) if/when ever sent by the server. Clients sometimes send zero (0) and other values.

While ItemStackNetManager is disabled, any non-zero LegacyRequestId value does not matter, except that when it is non-zero then the packet contains following extra serialized data which also doesn't matter while the system is disabled. Specifically, this extra data is:
- A list of LegacySetSlot info which consists of:
  - A byte for a container identifier.
  - And a list of bytes for slot indexes.
Whereas none of this extra data is serialized in the packet when the LegacyRequestId field is zero (0).

When serializing an InventoryTransaction in this packet, there is now a new bool field `hasNetIds` which is always `false` if ever sent by a client. Servers for now should also always send this value as `false`.
There is some extra data that is serialized into the packet for each InventoryAction when `hasNetIds` is `true` but none of that matters while the system is disabled.

Fyi, Bedrock Server generally no longer sends this packet if all slots are empty.

## OpenContainerPacket

Clients in the previous release would sometimes immediately open various container screen UI instead of requesting to do so from the server. Whereas in various other use cases clients would ask the server (e.g. via InteractPacket) without directly opening any screen client-side - and then if/when an OpenContainerPacket is received by the client it would then show the relevant container screen UI.

Now clients wait for an OpenContainerPacket from the server for opening all container screens, including the player's inventory screen. I.e. no more client-side immediate opening of such UI. The server is now authoritative, e.g. can deny a client's request by choosing not to respond with an OpenContainerPacket (e.g. chest has a cat on it, etc.).

Note, typically a server, after sending an OpenContainerPacket, immediately also sends an InventoryContentPacket, as in previous releases, for the respective screen's primary container (e.g. chest contents for a Chest screen; Horse's equipment; Llama's equipment & chested slots (when chested); furnace's items; etc.). However, InventoryContentPacket has not been and still isn't sent by Bedrock Servers for opening of a player's inventory screen for both (2x2 crafting and also for enchanting tables for 3x3 crafting). Historically this is because clients were authoritative over their inventories (which is still true with the system disabled).
Similarly, Bedrock server does not send Hotbar, Inventory, Offhand, Armor contents for opening of such screens.

It is important that servers respond appropriately and timely with OpenContainerPackets so that client's container screens still open as expected by players. The latency added for these screens opening (i.e. the screens that used to open immediately for clients like player Inventory) is often not noticeable (assuming the server responds quickly) due to the duration for UI to load and display for clients (i.e. the UI slowness generally masks the round-trip lag).

Note that some container screens behave the same as described above except they respond on the client to different packets (instead of OpenContainerPacket):
- UpdateEquipPacket for Horse mob types: e.g. horse, donkey, mule.
- UpdateTradePacket for legacy Trade1 and newer Trade2 screens for villagers.

## InteractPacket

Clients now send this packet when wanting to open the Inventory screen while not riding a mob, instead of just opening the screen right away as they used to (this is in addition to still sending this packet in other use cases as before). In this new case clients send this packet with:
- `InteractPacket::Action::OpenInventory` (6)
- With a TargetId of the sending player's RuntimeID
  - Though servers should ignore this serialized RuntimeID value (to not trust client's value for the `OpenInventory` case, e.g. cheaters) and instead more securely infer the requesting Player from the received network channel.

## MobArmorEquipmentPacket

Fwiw, Bedrock Server:
- No longer handles receiving this packet. It used to handle it by forwarding the packet on to other players in the same dimension.
- No longer redundantly sends this packet when processing the "replace" slash command in the case of replacing a server player's armor slot contents.
- Broadcasts only to other players in the same dimension, rather than to all other players connected to the server (which may be in different dimensions).
- No longer sends this to a player when a mob becomes nearby when said mob has all empty armor slots.
- For horse/donkey/mule/llama - only sends for actual armor slot item stack changes (instead of incorrectly sometimes for other item stack changes, e.g. in some chested slots).
- For elytra gliding, now only sends when elytra is actually hurt and/or broken instead of every tick (where some ticks may not actually damage the elytra).

## UpdateTradePacket

`UpdateTradePacket`'s mData has changed, within this mData tag there is a ListTag with the key of "Recipes". Each of these MerchantRecipes now has a `RecipeNetId` value (as an Int tag) with:
- A tag key of "netId"
- And a valid RecipeNetId value - for now send a value of One (1).

#### Asserts
- `SimpleServerNetId<Tag, RawIdT, RawInvalid>::_assertServerThread()`
  - an assert regarding main thread, harmless when ItemStackNetManager is disabled, but avoidable by sending "netId" with One (1) as described above.
