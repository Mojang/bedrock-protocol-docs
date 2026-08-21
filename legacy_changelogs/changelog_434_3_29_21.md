# Minecraft Network Protocol Docs 3/16/21
For 16u6-beta-2, Network Protocol Version 434.
(Note: we never made docs for beta-1)

## Packet Changes
StartGamePacket:
* new field: Server Version - is a string. You can pass whatever you want here; it would be useful for our telemetry if you passed a version code that included the name of your server, frex: "OurSweetServer 12.23.01"

## New Packet
SyncActorPropertyPacket:
This is intended to some day (could be years, ngl) replace Synched Actor data. It's currently in a first-draft state and we don't expect any of the server partners to use it yet. The gist is it contains a compound tag that has a 'type' (the actor name hash ID) and a 'properties' which is the Actor properties that are flagged for client replication.

## Enum Changes
ActorDataIDs:
* Changed UPDATE_PROPERTIES from 125 to 120
* Changed FREEZING_EFFECT_STRENGTH from 120 to 121
* Changed BUOYANCY_DATA from 121 to 122
* Changed GOAT_HORN_COUNT from 122 to 123
* Changed BASE_RUNTIME_ID from 123 to 124
* Removed DEFINE_PROPERTIES

ActorFlags:
* Added PLAYING_DEAD(97)
* Displaced Count

ActorType:
* Added Axolotl(130 | Animal)

CommandPermissionLevel:
* Added GameDirectors(1)
* Removed GameMasters

MinecraftPacketIds:
* Added SyncActorProperty(165)
* Displaced EndId

## Doc Improvements
* Fixed incorrect User Instance Data type: now that it's sent within a string by the Item Network types it's ints rather than varints.
* Fixed incorrect byte-size specs for varints on the types page (and removed incorrect specs for how to send a varint, since y'all are doing it the right way anyhow.)