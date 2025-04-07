# Minecraft Network Protocol Docs 2/24/25
For r21_u7, Network Protocol Version 785
## New Packets

UpdateClientOptions
* Added mGraphicsMode (std::optional<GraphicsMode>) [enum definition in New Enums]

PlayerVideoCapturePacket
* Added action (bool)
* Added mFrameRate (unsigned int)
* Added mFilePrefix (std::string)

PlayerUpdateEntityOverridesPacket
* Added Target Id (ActorUniqueId)
* Added mPropertyIndex (uint32_t)
* Added mUpdateTupe (UpdateType) [enum definition in New Enums]
* Added mValue (std::variant<int, float>)

## Removed Packets

LevelSoundEventV1
LevelSoundEventV2


## Other Changes in Types

* Added entity unique ID field in LevelSoundEventPacket, can be set to -1 for no entity
* Update SetHudPacket fields to use enum varInt serialization
* Modified the internal JSON structure used by ModalFormRequestPacket

## Enum Changes

ActorFlags:
  * Added BODY_ROTATION_AXIS_ALIGNED (120) []
  * Added COLLIDABLE (121) []
  * Added WASD_AIR_CONTROLLED (122) []
  * Displaced Count

## New Enums

GraphicsMode:
 * Added Simple (0)
 * Added Fancy (1)
 * Added Advanced (2)
 * Added RayTraced(3)

UpdateType:
 * Added ClearOverrides (0)
 * Added RemoveOverride (1)
 * Added SetIntOverride (2)
 * Added SetFloatOverride (3)
