# Minecraft Network Protocol Docs 23/2/22
For r18_u2, Network Protocol Version 491

## new packets 
TickingAreasLoadStatusPacket:
* Add mWaitingForPreload (bool)

## Packet Changes
RemoveVolumeEntityPacket:
* Add mDimensionType (DimensionType)

SubChunkPacket:
* Modified mSubChunkData.size(); changed from unsigned shot to unsigned int

SpawnParticleEffectPacket:
* Add mMolangVariables (MolangVariableMap)   

AddVolumeEntityPacket:
* Add mMinBounds (NetworkBlockPosition)
* Add mMaxBounds (NetworkBlockPosition)
* Add mDimensionType (DimensionType)

## Other file changes
SerializedSkin:
* Modified mFullId; name changed

LevelSettings:
* Modified Seed; changed from varInt to unsignedInt64

## Enum changes
ActorFlags:
* Added JUMP_GOAL_JUMP(102)
* Displaced Count

LevelSoundEvent:
* Added HornBreak(377)
* Changed Undefined from 375 to 378

MinecraftPacketIds:
* Added TickingAreasLoadStatus(179)
* Displaced EndId

MolangVersion:
* Added ComparisonAndLogicalOperatorPrecedence(6)
* Displaced NumValidVersions
