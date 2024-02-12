# Minecraft Network Protocol Docs 10/5/21
For r17_u4, Network Protocol Version 471

## Packet Changes
ActorLink:
* Renamed Rider Initiated to Passenger Initiated

ClientboundMapItemDataPacket
* Fixed an issue where the first branching on Creation Bit was not being correctly checked.

EventPacket: 
* Added Objective Name for CodeBuilderScoreboard type (string)
* Added Code Builder Scoreboard Score for CodeBuilderScoreboard type (var int)
* Fixed an issue where it did not have the proper end range value for Type, having its values truncated on the documents.

LevelChunkPacket:
* Branching for "Client needs to request subchunks?"

Renamed RiderJumpPacket to PassengerJumpPacket

SubChunkPacket
* Added Dimension Type (int32)
* Added Sub Chunk Pos (type)
* Added Serialized Sub Chunk (string)
* Added Result (SubChunkRequestResult)
* Added Height Map Data Type (HeightMapDataType)
* Added Subchunk Height Map (array<array<int8_t, CHUNK_WIDTH>, CHUNK_WIDTH>>)
Apologies for the Height Map being spread out into multiple fields. We already have a high priority work item to change the underlying data type to make it more readable.

SubChunkRequestPacket
* Added Dimension Type (int32)
* Added Sub Chunk Pos (type)

Be careful when responding to SubChunkRequestPackets otherwise we could have a repeat of the java version's "Nocom" exploit - vet the request first to make sure it's valid before responding with a SubChunkPacket!

## Enum Changes
ActorDataIDs:
* Added SEAT_LOCK_PASSENGER_ROTATION(57)
* Added SEAT_LOCK_PASSENGER_ROTATION_DEGREES(58)
* Removed SEAT_LOCK_RIDER_ROTATION
* Removed SEAT_LOCK_RIDER_ROTATION_DEGREES

ActorFlags:
* Added PASSENGER_CAN_PICK(60)
* Removed RIDER_CAN_PICK

EventPacket::Type:
* Added CodeBuilderScoreboard(27)
* Added StriderRiddenInLavaInOverworld(28)
* Added SneakCloseToSculkSensor(29)

ItemStackRequestActionType:
* Added ScreenLabTableCombine(7)
* Added ScreenBeaconPayment(8)
* Added ScreenHUDMineBlock(9)
* Added CraftRepairAndDisenchant(14)
* Added CraftLoom(15)
* Changed CraftNonImplemented_DEPRECATEDASKTYLAING from 14 to 16
* Changed CraftResults_DEPRECATEDASKTYLAING from 15 to 17
* Changed Test from 16 to 18
* Removed LabTableCombine
* Removed BeaconPayment
* Removed MineBlock

LevelEvent:
* Added SculkCatalystBloom(2036)

LevelSoundEvent:
* Added SculkCatalystBloom(365)

MinecraftPacketIds:
* Added PassengerJump(20)
* Changed PhotoInfoRequest from 173 to 0
* Added SubChunkPacket(174)
* Added SubChunkRequestPacket(175)
* Changed EndId from 174 to 176
* Removed RiderJump

MolangVersion:
* Added ExpressionErrorMessages(3)
* Added UnexpectedOperatorErrors(4)
* Displaced NumValidVersions

ParticleType:
* Added SculkSoul(83)
* Displaced _count

## New Enums
HeightMapDataType
* Added NoData(0)
* Added HasData(1)
* Added AllTooHigh(2)
* Added AllTooLow(3)

SubChunkRequestResult
* Added Undefined(0)
* Added Success(1)
* Added LevelChunkDoesntExist(2)
* Added WrongDimension(3)
* Added PlayerDoesntExist(4)
* Added IndexOutOfBounds(5)