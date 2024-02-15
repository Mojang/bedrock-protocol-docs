# Minecraft Network Protocol Docs 8/18/20
For Network Protocol Version 411

## Packet Changes
Reminder, the MoveActorDeltaData change from last rev is a BREAKING CHANGE.

## New packets

AnimateEntityPacket
CameraShakePacket
SetActorMotionPlusPacket (note: name will be changed to MotionPredictionHintsPacket in next rev)

## New enums

No new enums

## Enum changes

ActorFlags:
  Added OUT_OF_CONTROL(95)
  Displaced Count

EventPacket::Type:
  Added Deprecated_FishBucketed(12)
  Removed FishBucketed

ItemStackNetResult:
  Added DstContainerAndSlotEqualToSrcContainerAndSlot(48)
  Added CannotRemoveItem(65)
  Removed DstContainerEqualToSrcContainer

MinecraftPacketIds:
  Added SetActorMotionPlus(157)
  Added TriggerAnimation(158)
  Added CameraShake(159)
  Displaced EndId

