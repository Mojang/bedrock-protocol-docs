# Minecraft Network Protocol Docs 7/21/21
For r17_u2, Network Protocol Version 459

## New Packets
CreatePhotoPacket:
Probably not relevant?

EduUriResourcePacket:
Probably not relevant?

UpdateSubChunkBlocks:
Packet sent for every set of blocks changed in a sub chunk every tick.

## Packet Changes
ActorPickRequestPacket
* added UserData (bool)

AddVolumeEntityPacket
* added Engine Version (string)

AnimateEntityPacket
* added Stop Expression Version (MolangVersion)

HurtArmorPacket
* added Armor Slots bitset (int64)

Login:
For the Connection (& Sub Client Connection), we've added a new field to the json portion:
* SkinGeometryDataEngineVersion, a semantic version string

PhotoTransferPacket
* added Type (PhotoType)
* added SourceType (PhotoType)
* added Owner Id (signed int 64)
* added New Photo Name (string)

## New Types
EduSharedUriResource

optional<> - 
Some of our packets now use std::optional to determine whether to send fields across the wire or not
Currently we have optional<string>, optional<AgentCapabilities>, and optional<ExternalLinkSettings>
(And yes, the documentation generator does not do a good job of making them pretty)

## Type Changes
SerializedSkin
* added Geometry Data Engine Version (string)

EducationLevelSettings
* added Post Process Filter (string)
* added Screenshot Border Resource Path (string)
* added Agent Capabilities (optional<AgentCapabilities>)
* removed Optional Override URI (bool) 
* codeBuilderOverrideUri string is now an optional type: its bool comes from there (I believe but am not 100% sure that the protocol is the same over the wire even though the code is different)
* added External Link Settings (type)

LevelSettings
* added Edu Shared Uri Resource

## Enum Changes:
ActorEvent:
* Added ACTOR_GROW_UP(76)

LevelEvent:
* Added ParticleTurtleEgg(2034)

LevelSoundEvent:
* Added BlockClick(363)
* Added BlockClickFail(364)
* Displaced Undefined

MinecraftPacketIds:
* Added EduUriResourcePacket(170)
* Added CreatePhotoPacket(171)
* Added UpdateSubChunkBlocks(172)
* Displaced EndId

## New enums
MolangVersion:
* Added Invalid(-1)
* Added BeforeVersioning(0)
* Added Initial(1)
* Added Latest(Initial)
* Added HardcodedMolang(Latest)

PhotoType:
* Added Portfolio(0)
* Added PhotoItem(1)
* Added Book(2)