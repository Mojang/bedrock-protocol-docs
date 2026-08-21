# Minecraft Network Protocol Docs 2/5/21
For 16u4-beta-3, Network Protocol Version 428

## Packet changes
PlayerAuthInputPacket
* the contents of Item Use Transaction has been bundled up into its own type: the PackedItemUseLegacyInventoryTransaction

## New Type
PackedItemUseLegacyInventoryTransaction
* Like the previous Item Use Transaction from the previous version's PlayerAuthInputPacket, but starts with an additional array of container slot info

## No Enum Changes
