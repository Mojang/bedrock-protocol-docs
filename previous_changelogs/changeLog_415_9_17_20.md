# Minecraft Network Protocol Docs 9/17/20
For Beta 16u1-7; Network Protocol Version 415

## Packet Changes

We're partway into implementing a server authoritative movement correction system that is currently turned off because it still has some outstanding bugs but the fields are still being sent across the wire; for now they're okay to ignore when incoming and it's fine to send a 0 when outgoing.

### AvailableActorIdentifiersPacket 
    ActorInfo compound tags no longer contain an experimental flag.

### MovePlayerPacket
    Sends a tick indicating which tick from the PlayerAuthInputPacket it's on. Can be 0 if you don't use server auth movement.

### SetActorDataPacket
    SetActorDataPacket sends a tick indicating which tick from the PlayerAuthInputPacket it's on. Can be 0 if you don't use server auth movement.

### StartGamePacket
    We got rid of the global palette part of the StartGamePacket, and build the built-in block palette from existing known data, and data-driven block palette data which has been folded into the StartGamePacket. (This will save some significant bandwidth and time on level start, as well as make the StartGamePacket immune to the combinatorial explosion of block palette entries.) The data-driven block data can be left empty - sending a zero length vector is best right now.

    mIsServerAuthoritativeMovement is a now an enum (ServerAuthMovementMode) rather than a bool

## New Packets

### PlayerFogPacket 
    Contains a "fog stack" - the stack of slash commands used to create fog effects.

### CorrectPlayerMovePredictionPacket
    Used by ServerAuthoritativeWithRewind server auth movement mode - can send corrections to the client to tell the client where the server really thinks the avatar was on a given frame.

## New enums

### ServerAuthMovementMode
    ClientAuthoritative = 0
    ServerAuthoritative = 1
    ServerAuthoritativeWithRewind = 2

## Enum changes

ActorType:

  * Displaced Zoglin

MinecraftPacketIds:

  * Removed UpdateBlockProperties - Added UNUSED_PLS_USE_ME2(134)

  * Renamed TriggerAnimation to AnimateEntity(158)

  * Added PlayerFogSetting(160)

  * Added CorrectPlayerMovePredictionPacket(161)

  * Changed EndId from 160 to 162
