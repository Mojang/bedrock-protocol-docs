# Minecraft Network Protocol Docs 4/24/21
For 17u1-beta-2, Network Protocol Version 437.

## Type Changes
StructureSettings, part of StructureTemplateDataRequestPacket
* New field: AnimationMode - is an enum, see below
* New field: AnimationSeconds - is a float
		
GameRulesChangedPacketData, part of GameRulesChangedPacket, LevelSettings (in turn part of StartGamePacket)
* new Bool "Can Be Modified By Player"

## Enum Changes
AnimationMode:
* Added None(0)
* Added Layers(1)
* Added Blocks(2)

EventPacket::Type:
* Added PlayerWaxedOrUnwaxedCopper(25)

LevelEvent:
* Added WaxOn(2030)
* Added WaxOff(2031)
* Added Scrape(2032)
* Removed ParticlesWaxOn
* Removed ParticlesWaxOff
* Removed ParticlesScrape

LevelSoundEvent:
* Added CopperWaxOn(339)
* Added CopperWaxOff(340)
* Added Scrape(341)
* Added PlayerHurtDrown(342)
* Added PlayerHurtOnFire(343)
* Added PlayerHurtFreeze(344)
* Added UseSpyglass(345)
* Added StopUsingSpyglass(346)
* Added AmethystBlockChime(347)
* Displaced Undefined