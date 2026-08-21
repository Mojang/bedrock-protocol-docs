    
# Minecraft Network Protocol Docs 10/06/22
For r19u4, Network Protocol Version 557

## Packet Changes
AddActorPacket:
* Add mSynchedProperties (PropertySyncData)

AddPlayerPacket:
* Add mSynchedProperties (PropertySyncData)

SetActorDataPacket:
* Add mSynchedProperties (PropertySyncData)

NetworkSettingsPacket:
* Add mClientThrottleEnabled (Bool)
* Add ClientThrottleThreshold (Bytem)
* Add mClientThrottleScalar (Float)

## Serialize Changes
serialize<PropertySyncData>:
* Add mIntEntries (std::vector<PropertySyncIntEntry>)
* Add mPropertyIndex (uint32_t)
* Add mData (uint32_t)
* Add mFloatEntries (std::vector<PropertySyncFloatEntry>)
* Add mPropertyIndex (uint32_t)
* Add mData (float)

ItemDescriptor:
* Add	 mImpl (BaseDescriptor)

MolangDescriptor:
* Add	FullName (std::string)
* Add	mExpressionTags->getMolangVersion() (MolangVersion)

DeferredDescriptor:
* Add	mFullName (std::string)
* Add	mAuxValue (int16_t)

ItemTagDescriptor:
* Add	mItemTag.getString() (std::string))

InternalItemDescriptor:
* Add	mItem->getId() (int16_t)
* Add	mAuxValue (int16_t)

## ENUM CHANGES
ActorDataIDs:
  Changed FREEZING_EFFECT_STRENGTH from 121 to 120
  Changed BUOYANCY_DATA from 122 to 121
  Changed GOAT_HORN_COUNT from 123 to 122
  Changed BASE_RUNTIME_ID from 124 to 123
  Changed MOVEMENT_SOUND_DISTANCE_OFFSET from 125 to 124
  Changed HEARTBEAT_INTERVAL_TICKS from 126 to 125
  Changed HEARTBEAT_SOUND_EVENT from 127 to 126
  Changed PLAYER_LAST_DEATH_POS from 128 to 127
  Changed PLAYER_LAST_DEATH_DIMENSION from 129 to 128
  Changed PLAYER_HAS_DIED from 130 to 129
  Removed UPDATE_PROPERTIES

LevelSoundEvent:
  Added BundleDropContents(445)
  Added BundleInsert(446)
  Added BundleRemoveOne(447)
  Changed Undefined from 443 to 448

SerializedAbilitiesData::SerializedAbilitiesLayer:
  Added Editor(4)

TextProcessingEventOrigin:
  Added SlashCommandNonChat(11)
  Displaced COUNT

UIProfile:
  Added None(2)
  Displaced Count

ItemDescriptor::InternalType:
  Added	Invalid(0)
  Added	Default(1)
  Added	Molang(2)
  Added	ItemTag(3)
  Added	Deferred(4)