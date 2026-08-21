# Minecraft Network Protocol Docs 08/20/2024
For r21u3, Network Protocol Version 729


## New Packets

CameraAimAssist:
* Added mViewAngle (Vec2)
* Added mDistance (float)
* Added mTargetMode (enum CameraAimAssist::TargetMode)
* Added mAction (enum CameraAimAssist::Action)

ContainerRegistryCleanup:
* Added mRemovedContainers (std::vector<FullContainerName>)


## Packet Changes

EmotePacket:
* Added mEmoteTicks (uint32_t)

InventoryContentPacket:
* Added mFullContainerName (FullContainerName)
* Added mDynamicContainerSize (uint32_t)
* Removed mDynamicContainerId (uint32_t)

InventorySlotPacket:
* Added mFullContainerName (FullContainerName)
* Added mDynamicContainerSize (uint32_t)
* Removed mDynamicContainerId (uint32_t)

ResourcePacksInfoPacket:
* Removed mHasExceptions (bool)
* Removed mForceServerPacksEnabled (bool)
* Removed mBehaviorPacks (std::vector<PackInfoData>)

TransferPacket:
* Added mReloadWorld (bool)

UpdateAttributesPacket:
* Added mDefaultMinValue (float)
* Added mDefaultMaxValue (float)


## Additional Types Added

std::optional<Vec3>


## Additional Types Changed

CameraPreset:
* Added mCameraRotationSpeed (brstd::optional<float>)
* Added mSnapToTarget (brstd::optional<bool>)
* Added mEntityOffset (std::optional<Vec3>)

FullContainerName:
* Added mDynamicId (brstd::optional<uint32_t>)
* Removed mDynamicId (DynamicId)


## New Enums

CameraAimAssistPacket::Action:
* Added Set(0)
* Added Clear(1)

CameraAimAssistPacket::TargetMode:
* Added Angle(0)
* Added Distance(1)


## Enum Changes

ActorDamageCause:
* Added MaceSmash(34)
* Displaced All

Connection::DisconnectFailReason:
* Added DeepLinkTryingToOpenDemoWorldWhileSignedIn(117)

ContainerID:
* Added CONTAINER_ID_REGISTRY(125)
* Added CONTAINER_ID_REGISTRY_INVENTORY(126)

Enchant::Type:
* Enum names have changed, but not necessarily their behavior.
* Added Protection(0)
* Added FireProtection(1)
* Added FeatherFalling(2)
* Added BlastProtection(3)
* Added ProjectileProtection(4)
* Added Thorns(5)
* Added Respiration(6)
* Added DepthStrider(7)
* Added AquaAffinity(8)
* Added Sharpness(9)
* Added Smite(10)
* Added BaneOfArthropods(11)
* Added Knockback(12)
* Added FireAspect(13)
* Added Looting(14)
* Added Efficiency(15)
* Added SilkTouch(16)
* Added Unbreaking(17)
* Added Fortune(18)
* Added Power(19)
* Added Punch(20)
* Added Flame(21)
* Added Infinity(22)
* Added LuckOfTheSea(23)
* Added Lure(24)
* Added CurseOfBinding(27)
* Added CurseOfVanishing(28)
* Added Impaling(29)
* Added Riptide(30)
* Added Loyalty(31)
* Added Channeling(32)
* Added Multishot(33)
* Added Piercing(34)
* Added QuickCharge(35)
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

MinecraftPacketIds:
* Added CameraAimAssist(316)
* Added ContainerRegistryCleanup(317)
* Displaced EndId

PlayerActionType:
* Added DEPRECATED_StartSpinAttack(23)
* Removed StartSpinAttack

PlayerAuthInputPacket::InputData:
* Added HorizontalCollision(49)
* Added VerticalCollision(50)
* Added DownLeft(51)
* Added DownRight(52)
* Displaced INPUT_NUM

Rotation:
* Added Clockwise90(Rotate90)
* Added Clockwise180(Rotate180)
* Added CounterClockwise90(Rotate270)

