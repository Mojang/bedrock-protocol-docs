# Minecraft Network Protocol Docs 8/24/21
For r17_u3, Network Protocol Version 464

## Packet Changes
CraftingDataPacket
* Added Material Reducer List (std::vector<MaterialReducerDataEntry>)

## New Types
MaterialReducerDataEntry

## Type Changes
EducationLevelSettings
* Added Disable Legacy Title Bar (bool)

## Enum Changes
ActorBlockSyncMessage::MessageId:
* Added NONE(0)
* Added CREATE(1)
* Added DESTROY(2)

ActorType:
* Added Warden(131 | Mob)

CommandParameterOption:
* Added EnumAsChainedCommand(0x04)

EventPacket::Type:
* Added CodeBuilderRuntimeAction(26)

LevelEvent:
* Added ParticleSculkShriek(2035)

LevelSoundEvent:
* Added SculkShriekerShriek(366)
* Added WardenNearbyClose(367)
* Added WardenNearbyCloser(368)
* Added WardenNearbyClosest(369)
* Added WardenSlightlyAngry(370)
* Changed Undefined from 365 to 371

MinecraftPacketIds:
* Added PhotoInfoRequest(173)
* Displaced EndId

MolangVersion:
* Added FixedItemRemainingUseDurationQuery(2)
* Added NumValidVersions(3)
* Changed Latest from Initial to NumValidVersions - 1

ParticleType:
* Added Shriek(82)
* Displaced _count