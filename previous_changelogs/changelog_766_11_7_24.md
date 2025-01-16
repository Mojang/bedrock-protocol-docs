# Minecraft Network Protocol Docs 11/07/2024
For r21_u5, Network Protocol Version 766


## New Packets

CameraAimAssistPresetsPacket:
* Added mCategories (std::vector<SharedTypes::v1_21_50::CameraAimAssistCategoriesDefinition>) [type definition in New Types]
* Added mPresets (std::vector<SharedTypes::v1_21_50::CameraAimAssistPresetDefinition>) [type definition in New Types]


## Packet Changes

CameraAimAssistPacket:
* Added mPresetId (std::string)

ItemStackResponseSlotInfo:
* Added Filtered Custom Name (std::string)

PlayerAuthInputPacket:
* mInputData is now being serialized as std::bitset<static_cast<int>(InputData::INPUT_NUM)> (previous was unsigned varint64)
* Changed mClientTick type from uint64_t to PlayerInputTick
* Added mRawMoveVector (Vec2)

ResourcePacksInfoPacket:
* Added mData.mWorldTemplateIdAndVersion.mId (mce::UUID)
* Added mData.mWorldTemplateIdAndVersion.mVersion.asString() (std::string)
* Changes to PackInfoData:
    - Changed pack.mPackIdVersion.mId from std::string to mce::UUID mId


## New Types

SharedTypes::v1_21_50::CameraAimAssistCategoriesDefinition:
* Added mIdentifier (std::string)
* Added mCategories (std::vector<SharedTypes::v1_21_50::CameraAimAssistCategoryDefinition>) [type definition below]

SharedTypes::v1_21_50::CameraAimAssistCategoryDefinition:
* Added mName (std::string)
* Added mPriorities (SharedTypes::v1_21_50::CameraAimAssistCategoryPriorities) [type definition below]

SharedTypes::v1_21_50::CameraAimAssistCategoryPriorities:
* Added mEntities (std::unordered_map<std::string, int32_t>)
* Added mBlocks (std::unordered_map<std::string, int32_t>)

SharedTypes::v1_21_50::CameraAimAssistPresetDefinition:
* Added mIdentifier (std::string)
* Added mCategories (std::string)
* Added mExclusionList (std::vector<std::string>)
* Added mLiquidTargetingList (std::vector<std::string>)
* Added mItemSettings (std::unordered_map<std::string, std::string>)
* Added mDefaultItemSettings (std::optional<std::string>)
* Added mHandSettings (std::optional<std::string>)

SharedTypes::Comprehensive::v1_21_50::CameraPresetAimAssistDefinition:
* Added mPresetId (brstd::optional<std::string>)
* Added mTargetMode (brstd::optional<CameraAimAssist::TargetMode>) [enum definition in New Enums]
* Added mAngle (brstd::optional<Vec2>)
* Added mDistance (brstd::optional<float>)


## Other Changes in Types

CameraPreset:
* Added mTrackingRadius (brstd::optional<float>)
* Added mAimAssist (brstd::optional<SharedTypes::Comprehensive::v1_21_50::CameraPresetAimAssistDefinition>) [type definition in New Types]


## New Enums

CameraAimAssist::TargetMode:
* Added Angle(0)
* Added Distance(1)


## Enum Changes

ActorType:
* Added Creaking(146 | Monster)

BuildPlatform:
* Added GearVR_Deprecated(5)
* Removed GearVR

CameraAimAssistPacket::Action:
* Added _count(2)

CameraAimAssistPacket::TargetMode:
* Added _count(2)

Connection::DisconnectFailReason:
* Added ConnectionLost_DEPRECATED(66)
* Removed ConnectionLost

ContainerID:
* Removed CONTAINER_ID_REGISTRY_INVENTORY

CraftingDataEntryType:
* Added UserDataShapelessRecipe(5)
* Removed ShulkerBoxRecipe

LevelEvent:
* Added ParticleCreakingHeartTrail(9816)

MapItemTrackedActor::Type:
* Removed COUNT

MinecraftPacketIds:
* Added MovementEffect(318)
* Added SetMovementAuthorityMode(319)
* Added CameraAimAssistPresets(320)
* Displaced EndId

ParticleType:
* Added CreakingCrumble(94)
* Added PaleOakLeaves(95)
* Added EyeblossomOpen(96)
* Added EyeblossomClose(97)
* Displaced _count

PlayerActionType:
* Added StartSpinAttack(23)
* Added StartUsingItem(37)
* Changed Count from 37 to 38
* Removed DEPRECATED_StartSpinAttack

PlayerAuthInputPacket::InputData:
* Added StartUsingItem(53)
* Added IsCameraRelativeMovementEnabled(54)
* Added IsRotControlledByMoveDirection(55)
* Added StartSpinAttack(56)
* Added StopSpinAttack(57)
* Added IsHotbarOnlyTouch(58)
* Added JumpReleasedRaw(59)
* Added JumpPressedRaw(60)
* Added JumpCurrentRaw(61)
* Added SneakReleasedRaw(62)
* Added SneakPressedRaw(63)
* Added SneakCurrentRaw(64)
* Displaced INPUT_NUM

ServerAuthMovementMode:
* Added LegacyClientAuthoritativeV1(0)
* Added ClientAuthoritativeV2(1)
* Added ServerAuthoritativeV3(2)
* Removed ClientAuthoritative
* Removed ServerAuthoritative
* Removed ServerAuthoritativeWithRewind


## Misc

Vectors:
* Changed size name from "Array Size" to "List Size"

Conditional statements:
* If - else if and switch statements have more detailed info for each case

Field name changes:
* Multiple instances of changes in field names. No changes in internal logic
