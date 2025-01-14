# Minecraft Network Protocol Docs 01/14/2025
For r21_u6, Network Protocol Version 776


## New Packets

ClientCameraAimAssistPacket
* Added mCameraPresetId (std::string)
* Added mAction (enum ClientCameraAimAssistPacketAction) [enum definition below]
* Added mAllowAimAssist (bool)

ClientMovementPredictionSyncPacket
* Added mActorDataFlag (ActorDataFlagComponent)
* Added mActorBoundingBox (ActorDataBoundingBoxComponent)
* Added mMovementAttributes (MovementAttributesComponent)
* Added mActorID (ActorUniqueID)

CreativeContentPacket
* Removed mWriteEntries
* Added conditional on mCreativeItemRegistryForWrite != nullptr
  * If true
    * Added mCreativeItemRegistryForWrite->getCreativeGroups() (CreativeGroupInfo)
      * Added val.getCreativeCategory() (enum CreativeItemCategory) [enum definition below] 
      * Added val.getName() (std::string)
      * Added NetworkItemInstanceDescriptor(val.getIcon()) (NetworkItemInstanceDescriptor)
  * If false
    * Added mCreativeItemRegistryForWrite->getCreativeItemEntries() (CreativeGroupInfo)
      * Added val.getCreativeNetId() (TypedServerNetId<struct CreativeItemNetIdTag>)
      * Added NetworkItemInstanceDescriptor(val.getItemInstance()) (NetworkItemInstanceDescriptor)
      * Added val.getGroupIndex() (uint32_t)


# Renamed Packets

ItemComponentPacket
* To ItemRegistryPacket


## Packet Changes

CameraAimAssistPresetsPacket
* Added mOperation (enum CameraAimAssistPresetsPacketOperation) [enum definition below]

CommandBlockUpdatePacket
* Added mName.getRedacted().value_or(Util::EMPTY_STRING) (std::string)

StartGamePacket
* Removed mItemData

StructureEditorData
* Added val.mStructureName.getRedacted().value_or(Util::EMPTY_STRING) (std::string)


## New Types

ActorDataBoundingBoxComponent
* Added value.mValue[enum_cast(ActorDataBoundingBoxComponent::Type::Scale)] (float)
* Added value.mValue[enum_cast(ActorDataBoundingBoxComponent::Type::Width)] (float)
* Added value.mValue[enum_cast(ActorDataBoundingBoxComponent::Type::Height)] (float)

ActorDataFlagComponent
* Added value.mValue (std::bitset<120>)

CameraInstruction::FadeInstruction
* Added mTime (brstd::optional<CameraInstruction::FadeInstruction::TimeOption>)
* Added mColor (brstd::optional<CameraInstruction::FadeInstruction::ColorOption>)

CameraInstruction::FadeInstruction::ColorOption
* Added mRed (float)
* Added mGreen (float)
* Added mBlue (float)

CameraInstruction::FadeInstruction::TimeOption
* Added mFadeInTime (float)
* Added mHoldTime (float)
* Added mFadeOutTime (float)

CameraInstruction::SetInstruction
* Added mPresetIndex (uint32_t)
* Added mEase (brstd::optional<EaseOption>)
* Added mPos (brstd::optional<PosOption>)
* Added mRot (brstd::optional<RotOption>)
* Added mFacing (brstd::optional<FacingOption>)
* Added mViewOffset (brstd::optional<ViewOffsetOption>)
* Added mEntityOffset (brstd::optional<EntityOffsetOption>)
* Added mDefault (brstd::optional<bool>)

CameraInstruction::SetInstruction::EaseOption
* Added mEasingType (EasingType)
* Added mEasingTime (float)

CameraInstruction::SetInstruction::PosOption
* Added mPos (Vec3)

CameraInstruction::SetInstruction::RotOption
* Added mRotX (float)
* Added mRotY (float)

CameraInstruction::SetInstruction::FacingOption
* Added mFacingPos (Vec3)

CameraInstruction::SetInstruction::ViewOffsetOption
* Added mViewOffsetX (float)
* Added mViewOffsetY (float)

CameraInstruction::SetInstruction::EntityOffsetOption
* Added mEntityOffsetX (float)
* Added mEntityOffsetY (float)
* Added mEntityOffsetZ (float)

CameraInstruction::TargetInstruction
* Added mTargetCenterOffset (brstd::optional<Vec3>)
* Added mTargetActorId (int64_t)

MovementAttributesComponent
* Added value.getMovementSpeed() (float)
* Added value.getUnderwaterMovementSpeed() (float)
* Added value.getLavaMovementSpeed() (float)
* Added value.getJumpStrength() (float)
* Added value.getHealth() (float)
* Added value.getHunger() (float)


## Other Changes in Types

CameraInstruction
* Added mYawLimitMin (brstd::optional<float>)
* Added mYawLimitMax (brstd::optional<float>)

SerializedAbilitiesData::SerializedLayer
* Added layer.mVerticalFlySpeed (float)


## New Enums

ActorDataBoundingBoxComponent::Type:
  Added Scale (0) []
  Added Width (1) []
  Added Height (2) []

CameraAimAssist::TargetMode:
  Added Angle (0) []
  Added Distance (1) []

ClientCameraAimAssistPacketAction:
  Added SetFromCameraPreset (0) [Sets aim-assist to use the settings from a CameraPresets aim_assist field.]
  Added Clear (1) [Clears aim-assist settings.]
  Added _count (2) []

CreativeItemCategory:
  Added All (0) []
  Added Construction (1) []
  Added Nature (2) []
  Added Equipment (3) []
  Added Items (4) []
  Added ItemCommandOnly (5) []
  Added Undefined (6) []
  Added NUM_CATEGORIES (7) []
  

## Enum Changes

AbilitiesIndex:
* Added VerticalFlySpeed (19) []
* Displaced AbilityCount

ActorDataIDs:
* Added FILTERED_NAME (132) []
* Added ENTER_BED_POSITION (133) []
* Displaced Count

ActorEvent:
* Added DEPRECATED_UPDATE_STRUCTURE_FEATURE (66) []
* Removed UPDATE_STRUCTURE_FEATURE

ActorFlags:
* Added RENDERS_WHEN_INVISIBLE (119) []
* Displaced Count

ActorType:
* Added Creaking (146 | Monster) []

AnimatePacket::Action:
* Comment for NoAction changed from [] to [Unused ]
* Comment for Swing changed from [] to [Server bound notification to swing the player's arm. Server is expected to rebroadcast to all that should see the arm move
 See also PlayerAuthInputPacket::InputData::MissedSwing for a very similar action ]
* Comment for WakeUp changed from [] to [Client bound notification to stop sleeping in a bed ]
* Comment for CriticalHit changed from [] to [Client-bound notification to play critical hit particles ]
* Comment for MagicCriticalHit changed from [] to [Unused ]
* Comment for RowRight changed from [] to [Sent every tick the client is in a boat exclusively in legacy client authoritative movement. See Player Auth Input for how to compute this in the latest protocol.
 Writes RowingTime ]
* Comment for RowLeft changed from [] to [Sent every tick the client is in a boat exclusively in legacy client authoritative movement. See Player Auth Input for how to compute this in the latest protocol.
 Writes RowingTime ]

BuildPlatform:
* Added GearVR_Deprecated (5) []
* Removed GearVR

Connection::DisconnectFailReason:
* Added ConnectionLost_DEPRECATED (66) []
* Added SubClientLoginDisabled (116) []
* Added DeepLinkTryingToOpenDemoWorldWhileSignedIn (117) []
* Removed ConnectionLost

ContainerEnumName:
* Added DynamicContainer (63) []

ComplexInventoryTransaction::Type:
* Comment for NormalTransaction changed from [] to [Sent for container UI operations depending on if ItemStackNetManager is enabled ]
* Comment for InventoryMismatch changed from [] to [Sent from server to client to reject a transaction ]
* Comment for ItemUseTransaction changed from [] to [Sent for a player performing right click style item use. See the contained ItemUseInventoryTransaction::ActionType for the expected use case. ]
* Comment for ItemUseOnEntityTransaction changed from [] to [Sent for a player right clicking on an entity or attacking them. See ItemUseInventoryTransaction::ActionType for which it is. ]
* Comment for ItemReleaseTransaction changed from [] to [Sent when releasing right click on a chargeable item like a bow or finishing charging like a crossbow. This is different than canceling item use early which would be in Player Auth Input.
 See ItemReleaseInventoryTransaction::ActionType for which it is. ]

ContainerID:
* Added CONTAINER_ID_REGISTRY (125) []

CraftingDataEntryType:
* Added UserDataShapelessRecipe (5) []
* Removed ShulkerBoxRecipe

Enchant::Type:
* Added Protection (0) []
* Added FireProtection (1) []
* Added FeatherFalling (2) []
* Added BlastProtection (3) []
* Added ProjectileProtection (4) []
* Added Thorns (5) []
* Added Respiration (6) []
* Added DepthStrider (7) []
* Added AquaAffinity (8) []
* Added Sharpness (9) []
* Added Smite (10) []
* Added BaneOfArthropods (11) []
* Added Knockback (12) []
* Added FireAspect (13) []
* Added Looting (14) []
* Added Efficiency (15) []
* Added SilkTouch (16) []
* Added Unbreaking (17) []
* Added Fortune (18) []
* Added Power (19) []
* Added Punch (20) []
* Added Flame (21) []
* Added Infinity (22) []
* Added LuckOfTheSea (23) []
* Added Lure (24) []
* Added CurseOfBinding (27) []
* Added CurseOfVanishing (28) []
* Added Impaling (29) []
* Added Riptide (30) []
* Added Loyalty (31) []
* Added Channeling (32) []
* Added Multishot (33) []
* Added Piercing (34) []
* Added QuickCharge (35) []
* Removed ArmorAll
* Removed ArmorFire
* Removed ArmorFall
* Removed ArmorExplosive
* Removed ArmorProjectile
* Removed ArmorThorns
* Removed WaterBreath
* Removed WaterSpeed
* Removed WaterAffinity
* Removed WeaponDamage
* Removed WeaponUndead
* Removed WeaponArthropod
* Removed WeaponKnockback
* Removed WeaponFire
* Removed WeaponLoot
* Removed MiningEfficiency
* Removed MiningSilkTouch
* Removed MiningDurability
* Removed MiningLoot
* Removed BowDamage
* Removed BowKnockback
* Removed BowFire
* Removed BowInfinity
* Removed FishingLoot
* Removed FishingLure
* Removed CurseBinding
* Removed CurseVanishing
* Removed TridentImpaling
* Removed TridentRiptide
* Removed TridentLoyalty
* Removed TridentChanneling
* Removed CrossbowMultishot
* Removed CrossbowPiercing
* Removed CrossbowQuickCharge

ItemReleaseInventoryTransaction::ActionType:
* Comment for Release changed from [] to [Release right click and hold style item use, like firing a bow ]
* Comment for Use changed from [] to [Finish right click and hold style item use, like charging a crossbow ]

ItemUseInventoryTransaction::ActionType:
* Comment for Place changed from [] to [Right click item use on a surface like placing a block ]
* Comment for Use changed from [] to [Start right click and hold style item use or potentially interact with nothing.
 If it is a usable item like food the server is expected to send a SetActorDataPacket with ActorFlags::USINGITEM along with the transaction response.
 While using an item, movement speed is slowed which will be reflected in the move vector in Player Auth Input. ]
* Comment for Destroy changed from [] to [Block breaking like left click
 When using server auth block breaking as specified in StartGamePacket this is never sent.
 Instead, block actions are supplied in Player Auth Input. ]

ItemUseOnActorInventoryTransaction::ActionType:
* Comment for Interact changed from [] to [Right click interact with actor. ]
* Comment for Attack changed from [] to [Left click style attack of actor or elytra spin attack.
 Server is expected to deal damage to the entity with visuals. ]
* Comment for ItemInteract changed from [] to [Unused ]

MapItemTrackedActor::Type:
* Removed COUNT

MinecraftPacketIds:
* Added ItemRegistryPacket (162) []
* Added CurrentStructureFeaturePacket (314) []
* Added ServerboundDiagnosticsPacket (315) []
* Added CameraAimAssist (316) []
* Added ContainerRegistryCleanup (317) []
* Added MovementEffect (318) []
* Added SetMovementAuthorityMode (319) []
* Added CameraAimAssistPresets (320) []
* Added ClientCameraAimAssist (321) []
* Added ClientMovementPredictionSyncPacket (322) []
* Changed EndId from 314 to 323
* Removed ItemComponentPacket

ParticleType:
* Added CreakingCrumble (94) []
* Added PaleOakLeaves (95) []
* Added EyeblossomOpen (96) []
* Added EyeblossomClose (97) []
* Displaced _count

PlayerActionType:
* Comment for Unknown changed from [] to [Unused ]
* Comment for StartDestroyBlock changed from [] to [Sent in Player Auth Input Block Actions with position and facing ]
* Comment for AbortDestroyBlock changed from [] to [Sent in Player Auth Input Block Actions with position and facing ]
* Comment for StopDestroyBlock changed from [] to [Sent in Player Auth Input Block Actions without additional data ]
* Comment for GetUpdatedBlock changed from [] to [Unused ]
* Comment for DropItem changed from [] to [Unused ]
* Comment for StartSleeping changed from [] to [Sent in Player Action ]
* Comment for StopSleeping changed from [] to [Sent in Player Action ]
* Comment for Respawn changed from [] to [Sent in Player Action ]
* Comment for StartJump changed from [] to [Set on the tick that a player triggers a jump.
 Corresponds to Player Auth Input InputData::StartJumping bit 31 ]
* Comment for StartSprinting changed from [] to [Set when the player wants to start sprinting, like double tapping forward.
 Server is expected to respond with SetActorDataPacket with ActorFlags::SPRINTING and an UpdateAttributesPacket to apply the sprint boost.
 Corresponds to Player Auth Input InputData::StartSprinting bit 25 ]
* Comment for StopSprinting changed from [] to [Sent when the player wants to stop sprinting, like releasing the forward input while sprinting.
 Server is expected to respond with SetActorDataPacket with ActorFlags::SPRINTING and an UpdateAttributesPacket clearing the sprint speed boost.
 Corresponds to Player Auth Input InputData::StopSprinting bit 26 ]
* Comment for StartSneaking changed from [] to [Sent when the player wants to start sneaking like pressing shift.
 Server is expected to respond with SetActorDataPacket with ActorFlags::SNEAKING true if accepted, false if rejected, and a bounding box update.
 Corresponds to Player Auth Input InputData::StartSneaking bit 27 ]
* Comment for StopSneaking changed from [] to [Sent when the player wants to stop sneaking like releasing shift.
 Server is expected to respond with SetActorDataPacket with ActorFlags::SNEAKING false if accepted, true if rejected, and a bounding box update.
 Corresponds to Player Auth Input InputData::StopSneaking bit 28 ]
* Comment for CreativeDestroyBlock changed from [] to [Sent when trying to destroy a block in creative like left clicking on it. Expects server to destroy the block and optionally send new block or chunk information.
 Used to be a ChangeDimension action.
 Sent in Player Action. ]
* Comment for ChangeDimensionAck changed from [] to [Sent in Player Action, this is the one case of the server sending an action to the client to start a dimension change. ]
* Comment for StartGliding changed from [] to [Sent when the player wants to start elytra gliding like pressing spacebar in air.
 Server is expected to respond with SetActorDataPacket with ActorFlags::GLIDING true if accepted or false if rejected, and a bounding box update.
 Corresponds to Player Auth Input InputData::StartGliding bit 32 ]
* Comment for StopGliding changed from [] to [Sent when the player is elytra gliding but expects it to stop, like when touching the ground.
 Server is expected to respond with SetActorDataPacket with ActorFlags::GLIDING false if accepted or true if rejected, and a bounding box update.
 Corresponds to Player Auth Input InputData::StopGliding bit 33 ]
* Comment for DenyDestroyBlock changed from [] to [Sent when the client thinks they aren't allowed to break a block at the location and want the deny particle effect.
 Sent in Player Action in EDU ]
* Comment for CrackBlock changed from [] to [Client expects a LevelEventPacket with the appropriate crack event to be broadcast in response.
 Only sent if server auth block breaking is disabled in StartGamePacket.
 Sent in Player Auth Input Block Actions with position and facing. ]
* Comment for ChangeSkin changed from [] to [Unused ]
* Comment for DEPRECATED_UpdatedEnchantingSeed changed from [] to [Sent in Player Action if ItemStackNetManager is disabled ]
* Comment for StartSwimming changed from [] to [Sent when the player wants to enter swimming mode like pressing control while moving forward in water.
 Server is expected to respond with SetActorDataPacket with ActorFlags::SWIMMING set to true if accepted or false if rejected, and a bounding box update.
 Corresponds to Player Auth Input InputData::StartSwimming bit 29 ]
* Comment for StopSwimming changed from [] to [Sent when the player wants to exit swimming mode like when releasing the forward input while swimming.
 Server is expected to respond with SetActorDataPacket with ActorFlags::SWIMMMING set to false if accepted or true if rejected, and a bounding box update.
 Corresponds to Player Auth Input InputData::StopSwimming bit 30 ]
* Comment for StartSpinAttack changed from [] to [Sent on the tick that the client predicts a riptide spin attack starting. It is accompanied by an InventoryTransactionPacket of type ComplexInventoryTransaction::Type::ItemUseTransaction.
 Server is expected to send a SetActorDataPacket with ActorFlags::DAMAGENEARBYMOBS set to true if accepted or false if rejected along with a bounding box update.
 Sent in Player Action but will soon turn into a Player Auth Input InputData bit ]
* Comment for StopSpinAttack changed from [] to [Sent when the client thinks a riptide spin attack has ended.
 Server is expected to send a SetActorDataPacket with ActorFlags::DAMAGENEARBYMOBS set to false if accepted or true if rejected along with a bounding box update.
 Sent in Player Action but will soon turn into a Player Auth Input InputData bit ]
* Comment for InteractWithBlock changed from [] to [Unused ]
* Comment for PredictDestroyBlock changed from [] to [Sent in Player Auth Input Block Actions with position and facing.
 Used for the client to inform the server that it predicted the player destroying a block.
 The server may respond with block, chunk, or item information if it disagrees, or send no response to imply agreement.
 Only used when server-auth block breaking toggle is on as specified in StartGamePacket ]
* Comment for ContinueDestroyBlock changed from [] to [Sent in Player Auth Input Block Actions with position and facing.
 Used to inform the server that the client's current block changed for block destruction.
 The server is expected to use this to progress the block destruction and await an upcoming PredictDestroyBlock action.
 They are also expected to broadcast LevelEventPackets for the block cracking of the block being destroyed.
 Only sent when server-auth block breaking toggle is on as specified in StartGamePacket ]
* Comment for StartItemUseOn changed from [] to [Sent upon starting right click and hold style item use.
 Sent in Player Action.
 Server can expect this to arrive with an InventoryTransactionPacket with ItemUseInventoryTransaction in it.]
* Comment for StopItemUseOn changed from [] to [Sent upon releasing right click and hold style item use. This is for canceling the action, not the same as firing a bow which would be InventoryTransactionPacket with ItemUseInventoryTransaction.
 Sent in Player Action ]
* Comment for HandledTeleport changed from [] to [Used to inform the server that we have received a MovePlayerPacket causing a teleport, and re-enable client auth movement.
 The server should ignore any client predicted positions from the moment a MovePlayerPacket was sent until receipt of this action.
 Corresponds to Player Auth Input InputData::HandledTeleport bit 37 ]
* Comment for MissedSwing changed from [] to [Sent when client wants to play the arm swing animation like for left click.
 Server is expected to broadcast a LevelSoundEventPacket with LevelSoundEvent::AttackNoDamage.
 Corresponds to Player Auth Input InputData::MissedSwing bit 39 ]
* Comment for StartCrawling changed from [] to [Sent when the player is standing and thinks there is not enough space to stand.
 Server is expected to respond with a SetActorDataPacket containing a bounding box update.
 Server is expected to respond with SetActorDataPacket with ActorFlags::CRAWLING set to true if accepted, or false if rejected.
 Corresponds to Player Auth Input InputData::StartCrawling bit 40 ]
* Comment for StopCrawling changed from [] to [Sent when the player was crawling and thinks there is space to stand.
 Server is expected to respond with a SetActorDataPacket containing a bounding box update.
 Server is expected to respond with SetActorDataPacket with ActorFlags::CRAWLING set to false if accepted, or true if rejected.
 Corresponds to Player Auth Input InputData::StopCrawling bit 41 ]
* Comment for StartFlying changed from [] to [Sent when the player expects flight to be toggled on like double tap spacebar.
 Server is expected to respond with an UpdateAbilitiesPacket to accept or reject this.
 Corresponds to Player Auth Input InputData::StartFlying bit 42 ]
* Comment for StopFlying changed from [] to [Sent when the player expects flight to be toggled off like double tap spacebar.
 Server is expected to respond with an UpdateAbilitiesPacket to accept or reject this.
 Corresponds to Player Auth Input InputData::StopFlying bit 43 ]
* Comment for ClientAckServerData changed from [] to [Corresponds to Player Auth Input InputData::ClientAckServerData bit 44
 Not sent when using server authoritative movement as specified in StartGamePacket ]
* Added StartUsingItem (37) []
* Displaced Count

PlayerAuthInputPacket::InputData:
* Comment for Ascend changed from [] to [Touch input for flying up, similar to WantUp ]
* Comment for Descend changed from [] to [Touch input for flying down, similar to WantDown ]
* Comment for NorthJump_DEPRECATED changed from [] to [Unused ]
* Comment for JumpDown changed from [] to [If jump input is down. Doesn't necessarily mean the player is jumping. ]
* Comment for SprintDown changed from [] to [If sprint input is down. Doesn't necessarily mean they want to start sprinting ]
* Comment for ChangeHeight changed from [] to [Touch input for flying down ]
* Comment for Jumping changed from [] to [If the jump input is down or auto jump, even in non-jump cases like flying or swimming ]
* Comment for AutoJumpingInWater changed from [] to [If an auto jump is currently triggering while touching water. Can be ignored if handling Jumping properly ]
* Comment for Sneaking changed from [] to [If the player is sneaking, which may be from input or because there's not enough space to stand ]
* Comment for SneakDown changed from [] to [If the sneak input is down, which may not mean that they are sneaking depending on input permission and if they're crawling instead ]
* Comment for Up changed from [] to [Local space up input. Equivalent to the move input Y being positive. ]
* Comment for Down changed from [] to [Local space down input. Equivalent to the move input Y being negative. ]
* Comment for Left changed from [] to [Local space left input. Equivalent to the move input X being negative. ]
* Comment for Right changed from [] to [Local space right input. Equivalent to the move input X being positive. ]
* Comment for UpLeft changed from [] to [Local space diagonal up and left. Equivalent to move input (-1, 1) normalized. ]
* Comment for UpRight changed from [] to [Local space diagonal up and right. Equivalent to move input (1, 1) normalized. ]
* Comment for WantUp changed from [] to [Flying upwards like holding spacebar, all input modes ]
* Comment for WantDown changed from [] to [Flying downwards like holding shift, all input modes ]
* Comment for WantDownSlow changed from [] to [Alternate flying downwards for gamepad ]
* Comment for WantUpSlow changed from [] to [Alternate flying upwards for gamepad ]
* Comment for Sprinting changed from [] to [If the client thinks they're sprinting. Changes to this come in as start and stop sprinting actions ]
* Comment for AscendBlock changed from [] to [Touch-specific input for ascending scaffolding ]
* Comment for DescendBlock changed from [] to [Touch-specific input for descending scaffolding ]
* Comment for SneakToggleDown changed from [] to [Set while sneak toggle is being pressed for touch and gamepad. See Sneaking for the toggle state. ]
* Comment for PersistSneak changed from [] to [Always true when using touch input ]
* Comment for StartSprinting changed from [] to [Set when the player wants to start sprinting, like double tapping forward.
 Server is expected to respond with SetActorDataPacket with ActorFlags::SPRINTING and an UpdateAttributesPacket to apply the sprint boost.]
* Comment for StopSprinting changed from [] to [Sent when the player wants to stop sprinting, like releasing the forward input while sprinting.
 Server is expected to respond with SetActorDataPacket with ActorFlags::SPRINTING and an UpdateAttributesPacket clearing the sprint speed boost. ]
* Comment for StartSneaking changed from [] to [Sent when the player wants to start sneaking like pressing shift.
 Server is expected to respond with SetActorDataPacket with ActorFlags::SNEAKING true if accepted, false if rejected, and a bounding box update. ]
* Comment for StopSneaking changed from [] to [Sent when the player wants to stop sneaking like releasing shift.
 Server is expected to respond with SetActorDataPacket with ActorFlags::SNEAKING false if accepted, true if rejected, and a bounding box update. ]
* Comment for StartSwimming changed from [] to [Sent when the player wants to enter swimming mode like pressing control while moving forward in water.
 Server is expected to respond with SetActorDataPacket with ActorFlags::SWIMMING set to true if accepted or false if rejected, and a bounding box update. ]
* Comment for StopSwimming changed from [] to [Sent when the player wants to exit swimming mode like when releasing the forward input while swimming.
 Server is expected to respond with SetActorDataPacket with ActorFlags::SWIMMMING set to false if accepted or true if rejected, and a bounding box update. ]
* Comment for StartJumping changed from [] to [Set on the tick that the client triggers a non-vehicle jump ]
* Comment for StartGliding changed from [] to [Sent when the player wants to start elytra gliding like pressing spacebar in air.
 Server is expected to respond with SetActorDataPacket with ActorFlags::GLIDING true if accepted or false if rejected, and a bounding box update. ]
* Comment for StopGliding changed from [] to [Sent when the player is elytra gliding but expects it to stop, like when touching the ground.
 Server is expected to respond with SetActorDataPacket with ActorFlags::GLIDING false if accepted or true if rejected, and a bounding box update. ]
* Comment for PerformItemInteraction changed from [] to [Indicates that mItemUseTransaction will be written to the packet ]
* Comment for PerformBlockActions changed from [] to [Indicates that mPlayerBlockActions will be written to the packet ]
* Comment for PerformItemStackRequest changed from [] to [Indicates mItemStackRequest will be written to the packet ]
* Comment for HandledTeleport changed from [] to [Used to inform the server that we have received a MovePlayerPacket causing a teleport, and re-enable client auth movement.
 The server should ignore any client predicted positions from the moment a MovePlayerPacket was sent until receipt of this action. ]
* Comment for Emoting changed from [] to [If the player is currently performing an emote, see EmotePacket ]
* Comment for MissedSwing changed from [] to [Sent when client wants to play the arm swing animation like for left click.
 Server is expected to broadcast a LevelSoundEventPacket with LevelSoundEvent::AttackNoDamage. ]
* Comment for StartCrawling changed from [] to [Sent when the player is standing and thinks there is not enough space to stand.
 Server is expected to respond with a SetActorDataPacket containing a bounding box update.
 Server is expected to respond with SetActorDataPacket with ActorFlags::CRAWLING set to true if accepted, or false if rejected. ]
* Comment for StopCrawling changed from [] to [Sent when the player was crawling and thinks there is space to stand.
 Server is expected to respond with a SetActorDataPacket containing a bounding box update.
 Server is expected to respond with SetActorDataPacket with ActorFlags::CRAWLING set to false if accepted, or true if rejected. ]
* Comment for StartFlying changed from [] to [Sent when the player expects flight to be toggled on like double tap spacebar.
 Server is expected to respond with an UpdateAbilitiesPacket to accept or reject this. ]
* Comment for StopFlying changed from [] to [Sent when the player expects flight to be toggled off like double tap spacebar.
 Server is expected to respond with an UpdateAbilitiesPacket to accept or reject this. ]
* Comment for ClientAckServerData changed from [] to [Not sent when using server authoritative movement as specified in StartGamePacket ]
* Comment for IsInClientPredictedVehicle changed from [] to [Used when the client sends input while in control of a client predicted vehicle. Aka, Horse and Boat.
 If set, Vehicle Rotation and Client Predicted Vehicle will be written ]
* Comment for PaddlingLeft changed from [] to [Player is in a boat and holding the paddle input.
 Server is expected to respond with SetActorDataPacket updates of the boat's ROW_TIME_LEFT
 See Player Auth Input for further details ]
* Comment for PaddlingRight changed from [] to [Player is in a boat and holding the paddle input.
 Server is expected to respond with SetActorDataPacket updates of the boat's ROW_TIME_RIGHT
 See Player Auth Input for further details ]
* Comment for BlockBreakingDelayEnabled changed from [] to [For touch input modes in creative, true if block destruction in the current mode should happen with a delay, and false if it should happen instantly.]
* Added HorizontalCollision (49) [Set if the client predicted a horizontal collision. Used to factor in to client acceptance logic.
 Can be used as a hint to the server or ignored based on desired strictness ]
* Added VerticalCollision (50) [Set if the client predicted a vertical collision. Used to factor in to client acceptance logic.
 Can be used as a hint to the server or ignored based on desired strictness.
 Strongly correlates with the 'on ground' state of the player ]
* Added DownLeft (51) [Local space diagonal down and left. Equivalent to move input (-1, -1) normalized. ]
* Added DownRight (52) [Local space diagonal down and right. Equivalent to move input (1, -1) normalized. ]
* Added StartUsingItem (53) [Set on ticks when the client predicted the beginning of an item use animation like raising arm for trident or drinking potion.
 On this same tick will be an InventoryTransactionPacket of type ComplexInventoryTransaction::Type::ItemUseTransaction.
 Server is expected to respond with SetActorDataPacket containing ActorFlags::USINGITEM true if they agree, otherwise false.]
* Added IsCameraRelativeMovementEnabled (54) [This is part of an experimental feature, servers should ignore it. ]
* Added IsRotControlledByMoveDirection (55) [This is part of an experimental feature, servers should ignore it. ]
* Added StartSpinAttack (56) [Set on the tick that the client predicts a riptide spin attack starting, when PlayerActionType::StartSpinAttack is set in PlayerActionComponent.
 and ActorFlags::DAMAGENEARBYMOBS set true in SetActorDataPacket ]
* Added StopSpinAttack (57) [Set on the tick that client thinks a riptide spin attack has ended, when PlayerActionType::StopSpinAttack is set in PlayerActionComponent
 and ActorFlags::DAMAGENEARBYMOBS set false in SetActorDataPacket ]
* Added IsHotbarOnlyTouch (58) [Indicates if touch is only allowed in the touch bar and not in gameplay. ]
* Added JumpReleasedRaw (59) [This is whether or not the jump button was released since the last packet. 
 This will be sent even if input permissions are disabled.]
* Added JumpPressedRaw (60) [This is whether or not the jump button was pressed since the last packet. 
 This will be sent even if input permissions are disabled.]
* Added JumpCurrentRaw (61) [This is whether or not the jump button currently down. 
 This will be sent even if input permissions are disabled.]
* Added SneakReleasedRaw (62) [This is whether or not the sneak button was released since the last packet. 
 This will be sent even if input permissions are disabled.]
* Added SneakPressedRaw (63) [This is whether or not the sneak button was pressed since the last packet. 
 This will be sent even if input permissions are disabled.]
* Added SneakCurrentRaw (64) [This is whether or not the sneak button currently down. 
 This will be sent even if input permissions are disabled.]
* Displaced INPUT_NUM

Rotation:
* Added Clockwise90 (Rotate90) []
* Added Clockwise180 (Rotate180) []
* Added CounterClockwise90 (Rotate270) []

ServerAuthMovementMode:
* Added LegacyClientAuthoritativeV1 (0) [Referred to in the rest of the documentation as 'Legacy client authoritative'.
 The mode is intended to be phased out in favor of server authoritative.
 It results in the client communicating movement input in the following packets, see their documentation for details:
 - MovePlayerPacket (Primary motion and input data)
 - PlayerInputPacket (Vehicle inputs)
 - PlayerActionPacket (various one-off actions)
 - InventoryTransactionPacket (Item use, tangentially movement related)
 - PassengerJumpPacket (Horse jump)
 - AnimatePacket (Boat paddle)
 - MoveActorAbsolutePacket (motion of controlled vehicle)
 
 The client can be repositioned with:
 - MovePlayerPacket
 - SetActorMotionPacket
 ]
* Added ClientAuthoritativeV2 (1) [Referred to in the rest of the documentation as 'Client Authoritative'.
 This mode is the current default with previews coming soon for migrating to server authoritative
 The packets sent from client to server are largely the same as for server authoritative, see their documentation for details:
 - PlayerAuthInputPacket (Primary motion and input data)
 - InventoryTransactionPacket (Item use, tangentially movement related)
 
 PlayerActionPacket is sent in some cases, and in others has become a bit inside of PlayerAuthInputPacket.
 
 The client can be repositioned with:
 - MovePlayerPacket
 - SetActorMotionPacket
 ]
* Added ServerAuthoritativeV3 (2) [Referred to in the rest of the documentation as 'Server Authoritative'
 This mode is intended to become the new default after previews coming soon.
 The packets from client to server are similar.
 - PlayerAuthInputPacket (Primary motion and input data)
 - InventoryTransactionPacket (Item use, tangentially movement related)
 
 PlayerActionPacket is sent in some cases, and in others has become a bit inside of PlayerAuthInputPacket.
 
 The client can be repositioned with:
 - MovePlayerPacket
 - CorrectPlayerMovePredictionPacket
 - SetActorMotionPacket
 
 Additionally, in this mode many client-bound packets have a 'Tick' value. These echo back the tick value that the client supplies in the PlayerAuthInputPacket.
 For packets relating to a player or client predicted vehicle, the tick value should be that of the most recently processed PlayerAuthInputPacket from the player.
 Specifying zero is also acceptable although may result in minor visual flickering as it may confuse client predicted actions.
 ]
* Removed ClientAuthoritative
* Removed ServerAuthoritative
* Removed ServerAuthoritativeWithRewind

