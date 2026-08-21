# Minecraft Network Protocol Docs 7/29/20
For Network Protocol Version 409

## No new packets since r/16 (v407)

## Packet changes:

### ItemStackResponseInfo
    ItemStackRespnseInfo has a result enum (ItemStackNetResult) instead of a success flag.

### MoveActorDeltaData
    THIS IS A BREAKING CHANGE.
    The position fields are no longer bitwise additions to the previous result. Now it passes the whole float. The bandwidth savings for the offsets didn't warrant the stability risk.
    And this makes it easier to drop packets to conserve bandwidth and in the future will let us reduce latency.

## New enums

### ItemStackNetResult

### ContainerEnumName
    Not actually a new enum, we failed to get this into the previous documentation.

## Enum changes

ActorType:
  Added PiglinBrute(127 | Mob)

LevelSoundEvent:
  Added EquipNetherite(317)
  Displaced Undefined