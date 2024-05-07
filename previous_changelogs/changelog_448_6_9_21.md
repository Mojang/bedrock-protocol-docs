# Minecraft Network Protocol Docs 6/9/21
For r17_u1, Network Protocol Version 448 (a lot of internal revs this time)

## New Packets
SimulationTypePacket:
In progress.

NPCDialoguePacket:
A packet that allows the client to display dialog boxes for interacting with NPCs.
Mostly json - see additional documentation in additional_docs/dialogue_json.

## Packet Changes
NpcRequestPacket: 
* new string, Scene Name

ResourcePacksInfoPacket: 
* new bool, Force Server Packs Enable 
* (also some renaming for our clarity)

SetTitlesPacket: 
* new string Xuid
* new string Platform Online Id

AvailableCommandsPacket:
* Flags is now an unsigned short

## Enum Changes
Changes:
ActorDamageCause:
* Added RamAttack(30)

ActorFlags:
* Added DESCEND_THROUGH_BLOCK(70)
* Added IN_ASCENDABLE_BLOCK(98)
* Added OVER_DESCENDABLE_BLOCK(99)
* Changed Count from 98 to 100
* Removed FALL_THROUGH_SCAFFOLDING

GameType:
* Removed SurvivalViewer
* Removed CreativeViewer

LevelSoundEvent:
* Added CakeAddCandle(360)
* Added ExtinguishCandle(361)
* Added AmbientCandle(362)
* Displaced Undefined

MinecraftPacketIds:
* Added SimulationTypePacket(168)
* Added NpcDialoguePacket(169)
* Displaced EndId

ParticleType:
* Added CandleFlame(9)        // sorry! someone still didn't get the memo
* Displaced Lava
* Displaced LargeSmoke
* Displaced RedDust
* Displaced RisingBorderDust
* Displaced IconCrack
* Displaced SnowballPoof
* Displaced LargeExplode
* Displaced HugeExplosion
* Displaced MobFlame
* Displaced Heart
* Displaced Terrain
* Displaced TownAura
* Displaced Portal
* Displaced MobPortal
* Displaced WaterSplash
* Displaced WaterSplashManual
* Displaced WaterWake
* Displaced DripWater
* Displaced DripLava
* Displaced DripHoney
* Displaced StalactiteDripWater
* Displaced StalactiteDripLava
* Displaced FallingDust
* Displaced MobSpell
* Displaced MobSpellAmbient
* Displaced MobSpellInstantaneous
* Displaced Ink
* Displaced Slime
* Displaced RainSplash
* Displaced VillagerAngry
* Displaced VillagerHappy
* Displaced EnchantingTable
* Displaced TrackingEmitter
* Displaced Note
* Displaced WitchSpell
* Displaced CarrotBoost
* Displaced MobAppearance
* Displaced EndRod
* Displaced DragonBreath
* Displaced Spit
* Displaced Totem
* Displaced Food
* Displaced FireworksStarter
* Displaced Fireworks
* Displaced FireworksOverlay
* Displaced BalloonGas
* Displaced ColoredFlame
* Displaced Sparkler
* Displaced Conduit
* Displaced BubbleColumnUp
* Displaced BubbleColumnDown
* Displaced Sneeze
* Displaced ShulkerBullet
* Displaced Bleach
* Displaced DragonDestroyBlock
* Displaced MyceliumDust
* Displaced FallingBorderDust
* Displaced CampfireSmoke
* Displaced CampfireSmokeTall
* Displaced DragonBreathFire
* Displaced DragonBreathTrail
* Displaced BlueFlame
* Displaced Soul
* Displaced ObsidianTear
* Displaced PortalReverse
* Displaced Snowflake
* Displaced VibrationSignal
* Displaced SculkSensorRedstone
* Displaced SporeBlossomShower
* Displaced SporeBlossomAmbient
* Displaced Wax
* Displaced ElectricSpark
* Displaced _count

PlayerAuthInputPacket::InputData:
* Added AscendBlock(21)
* Added DescendBlock(22)
* Removed AscendScaffolding
* Removed DescendScaffolding

## New Enums
SimulationType:
* Added Game(0)
* Added Editor(1)
* Added Test(2)
* Added INVALID(3)

NpcDialoguePacket::NpcDialogueActionType:
* Added Open(0)
* Added Close(1)

NpcRequestPacket::RequestType:  // I didn't think this was new but my document generator tool said it was. ::shrug::
* Added SetActions(0)
* Added ExecuteAction(1)
* Added ExecuteClosingCommands(2)
* Added SetName(3)
* Added SetSkin(4)
* Added SetInteractText(5)
* Added ExecuteOpeningCommands(6)
