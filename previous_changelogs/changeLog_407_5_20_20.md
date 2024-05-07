# Minecraft Network Protocol Docs 5/20/20
For Network Protocol Version 407

## New Packets since r/Holiday
CreativeContentPacket

PlayerEnchantOptionsPacket

ItemStackRequestPacket

ItemStackResponsePacket

PlayerArmorDamagePacket

CodeBuilderPacket

UpdatePlayerGameTypePacket

EmoteListPacket

PositionTrackingDBServerBroadcastPacket

PositionTrackingDBClientRequestPacket

DebugInfoPacket

PacketViolationWarningPacket

## Packet changes:
My apologies, this is not an exhaustive list. Taking over the documentation system had issues.

### PlayerSkinPacket
	isTrustedSKin (bool) field

### StartGamePacket
	Added mEnableItemStackNetManager to end

### ActorLink
	added mRiderInitiated field: whether the link was changed by the reader

### CraftingDataPacket
	Now sends a net ID after the recipe (varint)

### CreativeContentPacket
	Note that a GroupInfo list was in the CreativeContent packet for a while, but has been temporarily removed. (Props to Youri Kersten for noticing.)

### HurtArmorPacket
	Now has a cause enum field before the damage amount

### InventoryContentPacket
	This is pretty much all-new; see Tyler Laing's doc on migrating to the new inventory system; you'll likely be using the legacy slots for now while we prepare the docs on how to migrate to the server auth system.

### InventoryTransactionPacket
	If has a legacy request id write a vector of LegacySetSlots (Container enum, vector of slots (bytes))

### PlayerSkinPacket
	IsTrustedSKin (bool) field

### SetSpawnPositionPacket
	Spawn block pos (NetworkBlockPosition) field

### StartGamePacket
	Add enable item stack net manager (bool).

## Serializaton changes:

### TextPacketType
	What was previously called TextObject is now called TextObjectWhisper; also there is a new TextObject that goes to everyone


### ActorLink
	Added mRiderInitiated field: whether the link was changed by the reader

### Education Settings serialization
	Has new members, one optional

### LevelSettings
		Dimension has been replaced by SpawnSettings
		Added Education Product ID between Education Features Enabled and Rain Level.
		Added at end: Limited World Width, Limited World Depth, Nether Type

### TextPacketType
		What was previously called TextObject is now called TextObjectWhisper; also there is a new TextObject that goes to everyone


## Enum changes

ContainerID:

	Removed CONTAINER_ID_CREATIVE

ActorEvent:

	Added LANDED_ON_GROUND(75)

PlayerActionType:

	Added DEPRECATED_UpdatedEnchantingSeed(20)
	Added InteractWithBlock(25)
	Removed UpdatedEnchantingSeed
	Removed StartBuildingBlock

TextPacketType:

	Added TextObjectWhisper(9)
	Displaced TextObject

PackType:

	Removed Invalid
	Removed Addon
	Removed Cached
	Removed CopyProtected
	Removed Behavior
	Removed PersonaPiece
	Removed Resources
	Removed Skins
	Removed WorldTemplate
	Removed Count

ContainerType:

	Added HUD(31)
	Added JIGSAW_EDITOR(32)
	Added SMITHING_TABLE(33)

Enchant::Type:

	Added SoulSpeed(36)
	Displaced NumEnchantments
	Displaced InvalidEnchantment

ActorDataIDs:

	Added LOW_TIER_CURED_TRADE_DISCOUNT(113)
	Added HIGH_TIER_CURED_TRADE_DISCOUNT(114)
	Added NEARBY_CURED_TRADE_DISCOUNT(115)
	Added NEARBY_CURED_DISCOUNT_TIME_STAMP(116)
	Added HITBOX(117)
	Added IS_BUOYANT(118)
	Added BUOYANCY_DATA(119)

ActorEvent:

	Added LANDED_ON_GROUND(75)

ActorFlags:

	Added IS_AVOIDING_BLOCK(86)
	Displaced FACING_TARGET_TO_RANGE_ATTACK
	Displaced HIDDEN_WHEN_INVISIBLE
	Displaced IS_IN_UI
	Displaced STALKING
	Displaced EMOTING
	Displaced CELEBRATING
	Added ADMIRING(93)
	Added CELEBRATING_SPECIAL(94)
	Displaced Count

ActorType:

	Added Piglin(123 | Mob)
	Added Hoglin(124 | Animal)
	Added Strider(125 | Animal)
	Added Zoglin(126 | Mob)

EventPacket::Type:

	Added TargetBlockHit(23)
	Added PiglinBarter(24)

InteractPacket::Action:

	Added Invalid(0)

LevelSoundEvent:

	Added AmbientCave(295)
	Added Angry(295)
	Added Retreat(296)
	Added ConvertToZombified(297)
	Added Admire(298)
	Added StepLava(299)
	Added Tempt(300)
	Added Panic(301)
	Added AmbientCrimsonForest(302)
	Added AmbientWarpedForest(303)
	Added AmbientSoulsandValley(304)
	Added AmbientNetherWastes(305)
	Added AmbientBasaltDeltas(306)
	Added RespawnAnchorCharge(306)
	Added RespawnAnchorDeplete(307)
	Added RespawnAnchorSetSpawn(308)
	Added RespawnAnchorAmbient(309)
	Added SoulEscapeQuiet(310)
	Added SoulEscapeLoud(311)
	Added RecordPigstep(312)
	Changed Undefined from 295 to 313

MobEffectPacket::Event:

	Added Invalid(0)

PlayerActionType:

	Added DEPRECATED_UpdatedEnchantingSeed(20)
	Added InteractWithBlock(25)
	Removed UpdatedEnchantingSeed
	Removed StartBuildingBlock

TextPacketType:

	Added TextObjectWhisper(9)
	Displaced TextObject

AdventureSettingsPacket::Flags:

	Added WorldImmutable((1 << 0))
	Added NoPvM((1 << 1))
	Added NoMvP((1 << 2))
	Added Unused((1 << 3))
	Added ShowNameTags((1 << 4))
	Added AutoJump((1 << 5))
	Added PlayerMayFly((1 << 6))
	Added PlayerNoClip((1 << 7))
	Added PlayerWorldBuilder((1 << 8))
	Added PlayerFlying((1 << 9))
	Added PlayerMuted((1 << 10))

PackType:

	Removed Invalid
	Removed Addon
	Removed Cached
	Removed CopyProtected
	Removed Behavior
	Removed PersonaPiece
	Removed Resources
	Removed Skins
	Removed WorldTemplate
	Removed Count


LevelSoundEvent:	[	:(	sorry about this one	]
	Changed Angry from 295 to 302
	Changed AmbientCrimsonForest from 302 to 307
	Changed RespawnAnchorCharge from 306 to 308
	Changed RespawnAnchorDeplete from 307 to 309
	Changed RespawnAnchorSetSpawn from 308 to 310
	Changed RespawnAnchorAmbient from 309 to 311
	Changed SoulEscapeQuiet from 310 to 312
	Changed SoulEscapeLoud from 311 to 313
	Changed RecordPigstep from 312 to 314
	Added LinkCompassToLodestone(315)
	Added UseSmithingTable(316)
	Changed Undefined from 313 to 317



EventPacket::Type::TargetBlockHit writes varInt: TargetBlockHit.mRedstoneLevel
EventPacket::Type::PiglinBarter writes varInt: mItemId, bool: mWasTargetingBarteringPlayer
