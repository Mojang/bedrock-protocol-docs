# Minecraft Network Protocol Docs 09/24/2024
For r21_u4, Network Protocol Version 748


## New Packets

MovementEffectPacket:
* Added mRuntimeId (ActorRuntimeID)
* Added mEffectType (enum MovementEffectType) [enum description below]
* Added mEffectDuration (int)
* Added mTick (PlayerInputTick) [type description below]

SetMovementAuthorityPacket:
* Added mNewAuthMovementMode (enum ServerAuthMovementMode)


## Renamed Packets

* Renamed RiderJumpPacket to PassengerJumpPacket


## Packet Changes

CorrectPlayerMovePredictionPacket:
* Changed mTick type from uint64_t to PlayerInputTick [type description below]

InventoryContentPacket:
* Removed mDynamicContainerSize
* Added mStorageItem (NetworkItemStackDescriptor)

InventorySlotPacket:
* Removed mDynamicContainerSize
* Added mStorageItem (NetworkItemStackDescriptor)

MobEffectPacket:
* Changed mTick type from uint64_t to PlayerInputTick [type description below]

MovePlayerPacket:
* Changed mTick type from uint64_t to PlayerInputTick [type description below]

PlayerAuthInputPacket:
* Removed branching statement on mPlayMode == ClientPlayMode::Reality
* Added mInteractRotation (Vec2)
* Changed mTick type from uint64_t to PlayerInputTick [type description below]
* Added mCameraOrientation (Vec3)

ResourcePacksInfoPacket:
* Added pack.mCDNUrl (std::string) under mData.mResourcePacks
* Removed mData.getCDNUrls()

SetActorDataPacket:
* Changed mTick type from uint64_t to PlayerInputTick [type description below]

SetActorMotionPacket:
* Changed mTick type from uint64_t to PlayerInputTick [type description below]

SetPlayerGameTypePacket:
* Changed mTick type from uint64_t to PlayerInputTick [type description below]

UpdateAttributesPacket:
* Changed mTick type from uint64_t to PlayerInputTick [type description below]


## New Types

PlayerInputTick:
* Added mValue (int64_t)

CameraInstruction::SetInstruction::EntityOffsetOption:
* Added mEntityOffsetX (float)
* Added mEntityOffsetY (float)
* Added mEntityOffsetZ (float)


## Other Changes in Types

CameraInstruction::SetInstruction:
* Added mEntityOffset (brstd::optional<CameraInstruction::SetInstruction::EntityOffsetOption>) [type description in New Types]

CameraPreset:
* Added mHorizontalRotationLimit (brstd::optional<Vec2>)
* Added mVerticalRotationLimit (brstd::optional<Vec2>)
* Added mAlignTargetAndCameraForward (brstd::optional<bool>)
* Added mContinueTargeting (brstd::optional<bool>)


## New Enums

MovementEffectType:
* Added INVALID(-1)
* Added GLIDE_BOOST(0)
* Added COUNT(1)


## Enum Changes

CameraAimAssistPacket::Action:
* Added _count(2)

CameraAimAssistPacket::TargetMode:
* Added _count(2)

ContainerID:
* Removed CONTAINER_ID_REGISTRY_INVENTORY

CraftingDataEntryType:
* Added UserDataShapelessRecipe(5)
* Removed ShulkerBoxRecipe

MinecraftPacketIds:
* Added MovementEffect(318)
* Added SetMovementAuthorityMode(319)
* Displaced EndId

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
* Displaced INPUT_NUM

ServerAuthMovementMode:
* Added LegacyClientAuthoritativeV1(0)
* Added ClientAuthoritativeV2(1)
* Added ServerAuthoritativeV3(2)
* Removed ClientAuthoritative
* Removed ServerAuthoritative
* Removed ServerAuthoritativeWithRewind
