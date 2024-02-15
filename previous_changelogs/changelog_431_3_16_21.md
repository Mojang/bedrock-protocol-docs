# Minecraft Network Protocol Docs 3/16/21
For 16u5-beta-3, Network Protocol Version 431

## Addendum to Version 429 - 
The guidance for Protocol Version 429 was inadequate - here's some extra information if you haven't gotten your server compliant with the Network Item Instance Descriptor.

There are two new network types that exist to replace items being used directly in network packets: NetworkItemInstanceDescriptor replaces ItemInstance uses, and NetworkItemStackDescriptor replaces ItemStack uses. The reason for this change was to remove item aux value dependencies on legacy block data to pave the way for future refactors. Because of this change, we have to recreate the ItemStack or ItemInstance on the client in a post-load step, using the data that was sent along with the packets. The affected packets were AddItemActorPacket, AddPlayerPacket, CraftingDataPacket, CraftingEventPacket, CreativeContentPacket, InventoryContentPacket, InventorySlotPacket, InventoryTransactionPacket, MobArmorEquipmentPacket, and MobEquipmentPacket.

You’ll already be familiar with item id, stack size, and aux value. These should be the same as before. NetworkItemStackDescriptor has an ItemStackNetIdVariant, which is related to the server-auth item changes from before. Both new network item descriptor types contain a block runtime id, and a string data buffer. The block runtime id is a runtime identifier that represents a block in the game, and should be contained in the block palette built from the block properties sent in the StartGamePacket. This value may or may not be zero, if the item is or is not a block item.

The string data buffer is a bit more involved and represents the item user data, written to a binary stream and then sent as a string over the network. This string will be used in a post-load step when constructing the items from the network types.

Thanks to Youri Kersten of The Hive for provoding these additional notes on the Network Item Instance Descriptor:

- Air / Empty / Invalid Item remains a special case, with just a var int 0 id and nothing else written after it. The docs don't yet mention this.
- User Data refers to the binary blob of data that contains NBT and other special properties. You'll already be encoding this for older versions, but note:
- The whole binary blob is now encoded as a String, meaning it's unsigned varint length prefixed. Get all your nbt+property bytes, calculate the length, write that length, THEN write the data.
- If you're still using legacy NBT encoding, you MAY run into issues with the client ignoring / 'losing' this data. Make sure you use the NBT encoding that starts with the User Data Serialization Marker (-1) and Serialization Version (1). The client has only sent Modern NBT for many versions now, so you'll probably already have an up-to-date decoder that you can simply reverse for encoding.

If you don't use net ids, you'll still get two blocks of asserts at the moment. You can (and should) bypass those asserts by doing the "first phase" of compliance with server authoritative inventory AKA the Item Stack Net Manager - sending ids. The documentation for doing that is included in **ServerAuthItemStackPackets_Disabled.md**.

## No Packet Changes

## No Type Changes

## Enum changes

LevelEvent:
* Added SoundDyeUsed(1065)
* Added SoundInkSacUsed(1066)
* Added ParticlesWaxOn(2030)
* Added ParticlesWaxOff(2031)
* Added ParticlesScrape(2032)
* Added ParticlesElectricSpark(2033)

LevelSoundEvent:
* Added CaveVinesPickBerries(336)
* Added BigDripleafTiltDown(337)
* Added BigDripleafTiltUp(338)
* Displaced Undefined

## Documentation clean-up
**CraftingDataEntry**, **MapItemTrackedActor::UniqueId**, **RecipeIngredient** You may notice that some of the pages of the docs have changed from the last revision; these are cosmetic rewrites, the actual underlying protocol hasn't changed.

The **ShapedChemistryRecipe** and **ShapelessChemistryRecipe** are education-edition related packets that I'm assuming nobody needs to use but am including for completeness and to help make sure recipe types added in the future, if any, get documented. They may or may not work in Vanilla as some of their code may be behind Education related #ifdefs.