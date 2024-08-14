# Minecraft Network Protocol Docs 07/16/2024
For r21u2, Network Protocol Version 712


## New Packets

CurrentStructureFeaturePacket:
* Added mCurrentStructureFeature (string)
ServerboundDiagnosticsPacket:
* Added mTelemetry.mAvgFps (float)
* Added mTelemetry.mAvgServerSimTickTimeMS (float)
* Added mTelemetry.mAvgClientSimTickTimeMS (float)
* Added mTelemetry.mAvgBeginFrameTimeMS (float)
* Added mTelemetry.mAvgInputTimeMS (float)
* Added mTelemetry.mAvgRenderTimeMS (float)
* Added mTelemetry.mAvgEndFrameTimeMS (float)
* Added mTelemetry.mAvgRemainderTimePercent (float)
* Added mTelemetry.mAvgUnaccountedTimePercent (float)


## Packet Changes

InventoryContentPacket:
* Added mDynamicContainerId (uint32_t)
InventorySlotPacket:
* Added mDynamicContainerId (uint32_t)
ResourcePacksInfoPacket:
* Added pack.mIsAddonPack (bool) under mData.mBehaviorPacks
* Added pack.mIsAddonPack (bool) under mData.mResourcePacks


## Additional Types Added

FullContainerName:
* Added containerName.mName (enum ContainerEnumName)
* Added containerName.mDynamicId.mData (uint32_t)
TargetInstruction:
* Added mTargetCenterOffset (brstd::optional<Vec3>)
* Added mTargetActorId (int64_t)


## Additional Types Changed

CameraInstruction:
* Added mTarget (brstd::optional<TargetInstruction>)
* Added mRemoveTarget (brstd::optional<bool>)
ItemStackRequestSlotInfo:
* Removed mOpenContainerNetId
* Added mFullContainerName (FullContainerName)
ItemUseInventoryTransaction:
* Added mTriggerType (enum ItemUseInventoryTransaction::TriggerType) [description below]


## New Enums

ItemUseInventoryTransaction::TriggerType:
* Added Unknown(0)
* Added PlayerInput(1)
* Added SimulationTick(2)


## Enum Changes

ActorEvent:
* Added DEPRECATED_UPDATE_STRUCTURE_FEATURE(66)
* Removed UPDATE_STRUCTURE_FEATURE

Connection::DisconnectFailReason:
* Added SubClientLoginDisabled(116)

ContainerEnumName:
* Added DynamicContainer(63)

MinecraftPacketIds:
* Added CurrentStructureFeaturePacket(314)
* Added ServerboundDiagnosticsPacket(315)
* Displaced EndId