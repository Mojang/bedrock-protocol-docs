# Minecraft Network Protocol Docs 17/1/22
For r18_u1, Network Protocol Version 485

## New Packets
CodeBuilderSourcePacket:
* Added mOperation (CodeBuilderStorageQueryOptions::Operation)
* Added mCategory (CodeBuilderStorageQueryOptions::Category)
* Added mValue (string)
* updated brief for packet

ScriptMessagePacket:
* Added mMessageId (string)
* Added mMessageValue (string)

PlayerStartItemCooldownPacket:
* Added mItemCategory (string)
* Added mDurationTicks (int)
* updated brief for packet

## Packet Changes
AddVolumeEntityPacket:
* Added mComponents (ComponenetTag)
* Added mJsonIdentifier (string)
* Added mInstanceName (string)
* Added mEngineVersion (string)

BossEventPacket:
* Added a new switch case (BossEventUpdateType::Query) and moved mPlayerID under it.
* Added description for existing values.
* Changed range end value for switch statment to BossEventUpdateType::Query.

LevelChunkPacket:
* Added PARTIAL_SUBCHUNK_COUNT_WHEN_CLIENT_REQUESTING (uint32_t)
* Added mClientRequestSubChunkLimit (int)
* Added if condition statment for "Client Request SubChunk Limit < 0?".

SubChunkPacket:
* Added mCenterPos (SubChunkPos)
* Added size of mSubChunkData (uint16_t)
* Added mSubChunkData (vector<SubChunkPacketData>)
* Added mSubChunkPosOffset (SubChunkPosOffset)
* Added if conditional statment for "Is SubChunk Request Result SuccessAllAir? or Cache Enabled?".
* Modified mCacheEnabled (bool); repositioned in the graph.
* Modified mResult (SubChunkRequestResult); changed naming.
* Removed mSubChunkPos (SubChunkPos)

SubChunkRequestPacket:
* Added mCenterPos (SubChunkPos)
* Added mRequestCount (uint32_t)
* Added size of mSubChunkPosOffsets (uint16_t)
* Added mSubChunkPosOffsets (vector<mSubChunkPosOffsets>)
* Added mSubChunkPosOffset (SubChunkPosOffset)
* Removed mSubChunkPos (SubChunkPos)

## Removed Packet 
* DimensionDataPacket

## Removed Types 
* DimensionDefinitionGroup
* DimensionDefinitionGroup::DimensionDefinition

## Enum CHanges
ActorFlags:
* Added CROAKING(100)
* Added EAT_MOB(101)
* Displaced Count

ActorType:
* Added Frog(132 | Animal)
* Added Tadpole(133 | WaterAnimal)
* Added Allay(134 | Mob)
* Added Firefly(135 | Animal)

BossEventUpdateType:
* Added Query(8)

CommandOriginType:
* Added ExecuteContext(15)

GeneratorType:
* Changed Undefined from 6 to 5
* Removed Void

ItemStackRequestActionType:
* Added PlaceInItemContainer(7)
* Added TakeFromItemContainer(8)
* Displaced ScreenLabTableCombine
* Displaced ScreenBeaconPayment
* Displaced ScreenHUDMineBlock
* Displaced CraftRecipe
* Displaced CraftRecipeAuto
* Displaced CraftCreative
* Displaced CraftRecipeOptional
* Displaced CraftRepairAndDisenchant
* Displaced CraftLoom
* Displaced CraftNonImplemented_DEPRECATEDASKTYLAING
* Displaced CraftResults_DEPRECATEDASKTYLAING
* Displaced Test

LevelSoundEvent:
* Added Tongue(372)
* Added CrackIronGolem(373)
* Added RepairIronGolem(374)
* Displaced Undefined

MinecraftPacketIds:
* Added PlayerStartItemCooldown(176)
* Added ScriptMessagePacket(177)
* Added CodeBuilderSourcePacket(178)
* Changed EndId from 177 to 179
* Removed DimensionDataPacket

MolangVersion:
* Added ConditionalOperatorAssociativity(5)
* Displaced NumValidVersions

SubChunkPacket::SubChunkRequestResult:
* Added SuccessAllAir(6)

## Non protocol docs related files
VineBlock
* moved side ways grwoing logic into a spaerate function called growSideways()

SkullBlock
* removed the function playerWillDestroy()

StrongholdPieces
* removed hasPlacedMobSpawner (bool)

NetherFortressPieces
* removed hasPlacedMobSpawner (bool)

RuinedPortalFeature
* Added casting to Block::UPDATE_NONE in setBlock()