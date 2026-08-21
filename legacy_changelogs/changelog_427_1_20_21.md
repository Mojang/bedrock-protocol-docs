# Minecraft Network Protocol Docs 1/20/21
For 16u4-beta-1, Network Protocol Version 427 
(There were two internal revisions this beta)

## New Packet
ClientBoundDebugRendererPacket

## Packet changes
ItemStackResponsePacket
* ItemStackResponseSlotInfo has changed: added Durability Correction (var int)

PlayerAuthInputPacket
* Added a bunch of conditional stuff at the end

StartGamePacket
* writes MovementSettings (SyncedPlayerMovementSettings) instead of Is Server Auth boolean

## New Type
SyncedPlayerMovementSettings

## New Enums
CameraShakeAction:
* Added Add(0)
* Added Stop(1)

CameraShakeType:
* Added Positional(0)
* Added Rotational(1)

## Enum changes
ItemStackNetResult:
* Added ScreenStackError(67)

ItemStackRequestActionType:
* Added MineBlock(9)
* Displaced CraftRecipe
* Displaced CraftRecipeAuto
* Displaced CraftCreative
* Displaced CraftRecipeOptional
* Displaced CraftNonImplemented_DEPRECATEDASKTYLAING
* Displaced CraftResults_DEPRECATEDASKTYLAING
* Displaced Test

LevelEvent:
* Added ParticlesVibrationSignal(2027)

LevelSoundEvent:
* Added SculkSensorPowerOn(328)
* Added SculkSensorPowerOff(329)

(That collides with the existing BucketFillPowderSnow / BucketEmptyPowderSnow enums; must have been a bad merge, we'll fix it.)

PlayerActionType:
* Added PredictDestroyBlock(26)
* Added ContinueDestroyBlock(27)
* Added Count(28)

PlayerAuthInputPacket::InputData:
* Added StartSprinting(25)
* Added StopSprinting(26)
* Added StartSneaking(27)
* Added StopSneaking(28)
* Added StartSwimming(29)
* Added StopSwimming(30)
* Added StartJumping(31)
* Added StartGliding(32)
* Added StopGliding(33)
* Added PerformItemInteraction(34)
* Added PerformBlockActions(35)
* Added PerformItemStackRequest(36)
* Displaced INPUT_NUM