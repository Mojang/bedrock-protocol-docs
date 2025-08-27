# Minecraft Network Protocol Docs 7/2/25
For r21_u11, Network Protocol Version 847

## Packet Changes
ServerboundPackSettingChangePacket
* Modified the binary format, see docdocumentation.
* TODO: Fix the packet rendering.

BiomeDefinitionData
* Moved the properties "ash", "red_spores", "blue_spores", and "white_ash" from the "minecraft:climate" biome component to the new client biome component "minecraft:precipitation"
* Added mFoliageSnow float after Downfall within BiomeDefinitionData to sync the progress of leaves turning white in snow (0-1 value, for old behavior just send zero)

MapInfoRequestPacket
- Updated to store only the actual pixel count during deserialization, matching the serialization logic.
- The exact index of each pixel is now stored when constructing the packet.

CameraPresetsPacket
- Modified linked assets fields in camera preset definitions - ??

LevelSoundEventPacket
- Added Enum PlaceItem, SingleItemSwap and MultiItemSwap to LevelSoundsEvents.

GameEventPacket
- Added new singleItemSwap and multiItemSwap for vibration events.

PlayerArmorDamagePacket 
- Modified the binary format of PlayerArmorDamagePacket, see documentation.
- TODO Update documentation to better explain example element - ??

GameRulesChangedPacket
- Modified binary format of GameRulesChangedPacket
- TODO Update documentation to better explain example element - ??
- TODO Rule Value missing for custom getter and setters.


Block Components:
* Added "minecraft:embedded_visual" component. It serializes a material_instances object and geometry object.
* Added a new type `BlockRedstoneProducerComponent`
*  Modified `"minecraft:material_instances"` to support weighted variations textures with these requirements
  - **"format_version"** must be greater than or equal to `"1.21.110"`
  - World must have **Upcoming Creator Features** experiment enabled


## Enum Changes
LevelSoundsEvents
- Added PlaceItem
- Added SingleItemSwap
- Added MultiItemSwap

ItemUseInventoryTransaction::ActionType
- Added UseAsAttack (3) [Left-click to instantaneously use an item instead of attacking. Does not require a target block or actor.]

ParticleType
- Added GreenFlame (98)


