# Minecraft Network Protocol Docs 10/1/20
For 16u1-beta-9, (rc0), Network Protocol Version 417

## Packet Changes

We're partway into implementing a server authoritative movement correction system that is currently turned off because it still has some outstanding bugs but the fields are still being sent across the wire; for now they're okay to ignore when incoming and it's fine to send a 0 when outgoing.

### AvailableActorIdentifiersPacket 
    ActorInfo compound tags no longer contain an experimental flag.

## New Packets

### ItemComponentPacket 
    An array of the items with their components. It should be fine to send an empty array after the StartGamePacket.

## Enum changes

Changes:
ItemStackNetResult:
  Added CannotConsumeItem(66)

LevelEvent:
  Added QueueCustomMusic(1900)
  Added PlayCustomMusic(1901)
  Added StopCustomMusic(1902)
  Added SetMusicVolume(1903)

MinecraftPacketIds:
  Removed ActorFall
  Added ActorFall_deprecated(37)
  Added ItemComponentPacket(162)
  Changed EndId from 162 to 163
