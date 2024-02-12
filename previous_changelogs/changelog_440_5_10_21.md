# Minecraft Network Protocol Docs 5/10/21
For r17, Network Protocol Version 440.

## New Packets
AddVolumeEntityPacket - Sends a volume entity's definition and components from server to client.
RemoveVolumeEntityPacket - Indicates a volume entity to be removed (from server to client).
(I've included a snapshot of our json docs in additional_docs so you can see the schema for those.)

## Enum Changes
LevelSoundEvent:
* Added AmbientScreamer(348)
* Added HurtScreamer(349)
* Added DeathScreamer(350)
* Added MilkScreamer(351)
* Added JumpToBlock(352)
* Added PreRam(353)
* Added PreRamScreamer(354)
* Added RamImpact(355)
* Added RamImpactScreamer(356)
* Added SquidInkSquirt(357)
* Added GlowSquidInkSquirt(358)
* Added ConvertToStray(359)
* Displaced Undefined

MinecraftPacketIds:
* Added AddVolumeEntityPacket(166)
* Added RemoveVolumeEntityPacket(167)
* Displaced EndId