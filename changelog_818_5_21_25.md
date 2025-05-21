# Minecraft Network Protocol Docs 5/21/25
For r21_u9, Network Protocol Version 818


## New Packets

ServerScriptDebugDrawerPacket:
* Added mShapes (std::vector<PacketShapeData>) [PacketShapeData type definition in New Types]


## Packet Changes

ResourcePacksInfoPacket:
* Added mData.mForceDisableVibrantVisuals (bool)


## Removed Packets

* SetMovementAuthorityMode (now SetMovementAuthorityMode_DEPRECATED)


## New Types

PacketShapeData:
* Added mNetworkId (uint64_t)
* Added mShapeType (brstd::optional<ScriptModuleDebugUtilities::ScriptDebugShapeType>) [ScriptModuleDebugUtilities::ScriptDebugShapeType enum definition in New Enums]
* Added mLocation (brstd::optional<Vec3>)
* Added mRotation (brstd::optional<Vec3>)
* Added mScale (brstd::optional<float>)
* Added mColor (brstd::optional<mce::Color>)
* Added mTimeLeftTotalSec (brstd::optional<float>)
* Added mText (brstd::optional<std::string>)
* Added mBoxBound (brstd::optional<Vec3>)
* Added mEndLocation (brstd::optional<Vec3>)
* Added mArrowHeadLength (brstd::optional<float>)
* Added mArrowHeadRadius (brstd::optional<float>)
* Added mNumSegments (brstd::optional<byte>)


## Other Changes to Types

CameraInstruction::SetInstruction:
* Added mRemoveIgnoreStartingValuesComponent (bool)

LevelSettings:
* Added mOwnerId (std::string)

SharedTypes::v1_21_80::CameraPreset:
* Removed mAlignTargetAndCameraForward

SubChunkPacket::HeightmapData:
* Added mRenderHeightMapType (enum SubChunkPacket::HeightMapDataType)
* Added mSubchunkRenderHeightMap (std::array<std::array<int8_t, LevelConstants::CHUNK_WIDTH>, LevelConstants::CHUNK_WIDTH>)

SyncedPlayerMovementSettings:
* Removed mAuthorityMode


## New Enums

ScriptModuleDebugUtilities::ScriptDebugShapeType:
* Added Line (0) []
* Added Box (1) []
* Added Sphere (2) []
* Added Circle (3) []
* Added Text (4) []
* Added Arrow (5) []
* Added NumShapeTypes (6) []


## Enum Changes

ActorFlags:
* Added BODY_ROTATION_ALWAYS_FOLLOWS_HEAD (124) []
* Displaced Count

Connection::DisconnectFailReason:
* Added RealmsTimelineRequired (119) []
* Added GuestWithoutHost (120) []
* Added FailedToJoinExperience (121) []

MinecraftPacketIds:
* Added SetMovementAuthorityMode_DEPRECATED (319) []
* Added ServerScriptDebugDrawerPacket (328) []
* Changed EndId from 328 to 329
* Removed SetMovementAuthorityMode

PlayerActionType:
* Added DEPRECATED_ClientAckServerData (36) [Corresponds to Player Auth Input InputData::ClientAckServerData bit 44
 Not sent when using server authoritative movement as specified in StartGamePacket
 This is now deprecated because only server authoritative movement exist ]
* Removed ClientAckServerData

SharedTypes::Legacy::LevelSoundEvent:
* Added ImitateDrowned (531) []
* Added ImitateCreaking (532) []
* Added BundleInsertFail (533) []
* Added SpongeAbsorb (534) []
* Added CreakingHeartTrail (536) []
* Added CreakingHeartSpawn (537) []
* Added Activate (538) []
* Added Deactivate (539) []
* Added Freeze (540) []
* Added Unfreeze (541) []
* Added Open (542) []
* Added OpenLong (543) []
* Added Close (544) []
* Added CloseLong (545) []
* Added ImitatePhantom (546) []
* Added ImitateZoglin (547) []
* Added ImitateGuardian (548) []
* Added ImitateRavager (549) []
* Added ImitatePillager (550) []
* Added PlaceInWater (551) []
* Added StateChange (552) []
* Added ImitateHappyGhast (553) []
* Added UnequipGeneric (554) []
* Added RecordTears (555) []
* Added TheEndLightFlash (556) []
* Added LeadLeash (557) []
* Added LeadUnleash (558) []
* Added LeadBreak (559) []
* Added Unsaddle (560) []
* Changed Undefined from 531 to 561
* Removed ImitateIllusionIllager

SubChunkPacket::HeightMapDataType:
* Added AllCopied (4) []
