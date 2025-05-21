# Minecraft Network Protocol Docs 4/8/25
For r21_u8, Network Protocol Version 800


## New Packets

ClientboundControlSchemeSetPacket:
* Added mControlScheme (enum ControlScheme::Scheme) [ControlScheme::Scheme enum definition in New Enums]

PlayerLocationPacket:
* Added mType (enum PlayerLocationPacket::Type) [PlayerLocationPacket::Type enum definition in New Enums]
* Added conditional write on mType:
  * If Type::PLAYER_LOCATION_COORDINATES:
    * Added mId (ActorUniqueID)
    * Added mPos (Vec3)
  * If Type::PLAYER_LOCATION_HIDE:
    * Added mId (ActorUniqueID)


## Packet Changes

BiomeDefinitionListPacket:
* Added mBiomeData(std::unordered_map<BiomeStringList::BiomeStringIndex, BiomeDefinitionData>) [BiomeStringList::BiomeStringIndex type definition in New Types] [BiomeDefinitionData type definition in New Types]
* Added mStringList (BiomeStringList) [BiomeStringList type definition in New Types]


## Removed Packets

* CompressedBiomeDefinitionListPacket
* PassengerJump
* PlayerInputPacket


## New Types

BiomeStringList::BiomeStringIndex (uint16_t)

BiomeIdType (uint16_t)

SharedTypes::Comprehensive::CoordinateEvaluationOrder (enum SharedTypes::v1_21_10::CoordinateEvaluationOrder) [SharedTypes::v1_21_10::CoordinateEvaluationOrder enum definition in New Enums]

SharedTypes::Comprehensive::RandomDistributionType (enum SharedTypes::v1_21_10::RandomDistributionType) [SharedTypes::v1_21_10::RandomDistributionType enum definition in New Enums]

BlockRuntimeId (uint32_t)

BiomeDefinitionData:
* Added mId (brstd::optional<BiomeIdType>)
* Added mTemperature (float)
* Added mDownfall (float)
* Added mRedSporeDensity (float)
* Added mBlueSporeDensity (float)
* Added mAshDensity (float)
* Added mWhiteAshDensity (float)
* Added mDepth (float)
* Added mScale (float)
* Added mMapWaterColorARGB (int32_t)
* Added mRain (bool)
* Added mTags (brstd::optional<BiomeTagsData>) [BiomeTagsData type definition below]
* Added mChunkGenData (brstd::optional<BiomeDefinitionChunkGenData>) [BiomeDefinitionChunkGenData type definition below]

BiomeTagsData:
* Added mTags (std::vector\<BiomeStringList::BiomeStringIndex\>)

BiomeDefinitionChunkGenData:
* Added mClimate (brstd::optional<BiomeClimateData>) [BiomeClimateData type definition below]
* Added mConsolidatedFeatures (brstd::optional<BiomeConsolidatedFeaturesData>) [BiomeConsolidatedFeaturesData type definition below]
* Added mMountainParams (brstd::optional<BiomeMountainParamsData>) [BiomeMountainParamsData type definition below]
* Added mSurfaceMaterialAdjustments (brstd::optional<BiomeSurfaceMaterialAdjustmentData>) [BiomeSurfaceMaterialAdjustmentData type definition below]
* Added mSurfaceMaterials (brstd::optional<BiomeSurfaceMaterialData>) [BiomeSurfaceMaterialData type definition below]
* Added mHasSwampSurface (bool)
* Added mHasFrozenOceanSurface (bool)
* Added mHasTheEndSurface (bool)
* Added mMesaSurface (brstd::optional<BiomeMesaSurfaceData>) [BiomeMesaSurfaceData type definition below]
* Added mCappedSurface (brstd::optional<BiomeCappedSurfaceData>) [BiomeCappedSurfaceData type definition below]
* Added mOverworldGenRules (brstd::optional<BiomeOverworldGenRulesData>) [BiomeOverworldGenRulesData type definition below]
* Added mMultinoiseGenRules (brstd::optional<BiomeMultinoiseGenRulesData>) [BiomeMultinoiseGenRulesData type definition below]
* Added mLegacyWorldGenRules (brstd::optional<BiomeLegacyWorldGenRulesData>) [BiomeLegacyWorldGenRulesData type definition below]
* Added mReplaceBiomes (brstd::optional<BiomeReplacementsData>) [BiomeReplacementsData type definition below]

BiomeClimateData:
* Added mTemperature (float)
* Added mDownfall (float)
* Added mRedSporeDensity (float)
* Added mBlueSporeDensity (float)
* Added mAshDensity (float)
* Added mWhiteAshDensity (float)
* Added mSnowAccumulationMin (float)
* Added mSnowAccumulationMax (float)

BiomeConsolidatedFeaturesData:
* Added mFeatures (std::vector<BiomeConsolidatedFeatureData>) [BiomeConsolidatedFeatureData type definition below]

BiomeConsolidatedFeatureData:
* Added mScatter (BiomeScatterParamData) [BiomeScatterParamData type definition below]
* Added mFeature (BiomeStringList::BiomeStringIndex)
* Added mIdentifier (BiomeStringList::BiomeStringIndex)
* Added mPass (BiomeStringList::BiomeStringIndex)
* Added mCanUseInternalFeature (bool)

BiomeScatterParamData:
* Added mCoordinates (std::vector<BiomeCoordinateData>) [BiomeCoordinateData type definition below]
* Added mEvalOrder (SharedTypes::Comprehensive::CoordinateEvaluationOrder)
* Added mChancePercentType (enum ExpressionOp) [ExpressionOp enum definition in New Enums]
* Added mChancePercent (BiomeStringList::BiomeStringIndex)
* Added mChanceNumerator (int32_t)
* Added mChanceDenominator (int32_t)
* Added mIterationsType (enum ExpressionOp)
* Added miterations (BiomeStringList::BiomeStringIndex)

BiomeCoordinateData:
* Added mMinValueType (enum ExpressionOp)
* Added mMinValue (BiomeStringList::BiomeStringIndex)
* Added mMaxValueType (enum ExpressionOp)
* Added mMaxValue (BiomeStringList::BiomeStringIndex)
* Added mGridOffset (uint32_t)
* Added mGridStepSize (uint32_t)
* Added mDistribution (SharedTypes::Comprehensive::RandomDistributionType)

BiomeMountainParamsData:
* Added mSteepBlock (BlockRuntimeId)
* Added mNorthSlopes (bool)
* Added mSouthSlopes (bool)
* Added mWestSlopes (bool)
* Added mEastSlopes (bool)
* Added mTopSlideEnabled (bool)

BiomeSurfaceMaterialAdjustmentData:
* Added mAdjustments (std::vector<BiomeElementData>) [BiomeElementData type definition below]

BiomeElementData:
* Added mNoiseFreqScale (float)
* Added mNoiseLowerBound (float)
* Added mNoiseUpperBound (float)
* Added mHeightMinType (enum ExpressionOp)
* Added mHeightMin (BiomeStringList::BiomeStringIndex)
* Added mHeightMaxType (enum ExpressionOp)
* Added mHeightMax (BiomeStringList::BiomeStringIndex)
* Added mAdjustedMaterials (BiomeSurfaceMaterialData) [BiomeSurfaceMaterialData type definition below]

BiomeSurfaceMaterialData:
* Added mTopBlock (BlockRuntimeId)
* Added mMidBlock (BlockRuntimeId)
* Added mSeaFloorBlock (BlockRuntimeId)
* Added mFoundationBlock (BlockRuntimeId)
* Added mSeaBlock (BlockRuntimeId)
* Added mSeaFloorDepth (int)

BiomeMesaSurfaceData:
* Added mClayMaterial (BlockRuntimeId)
* Added mHardClayMaterial (BlockRuntimeId)
* Added mBrycePillars (BlockRuntimeId)
* Added mHasForest (BlockRuntimeId)

BiomeCappedSurfaceData:
* Added mFloorBlocks (std::vector<BlockRuntimeId>)
* Added mCeilingBlocks (std::vector<BlockRuntimeId>)
* Added mSeaBlock (brstd::optional<BlockRuntimeId>)
* Added mFoundationBlock (brstd::optional<BlockRuntimeId>)
* Added mBeachBlock (brstd::optional<BlockRuntimeId>)

BiomeOverworldGenRulesData:
* Added mHillsTransformations (std::vector<BiomeWeightedData>) [BiomeWeightedData type definition below]
* Added mMutateTransformations (std::vector<BiomeWeightedData>)
* Added mRiverTransformations (std::vector<BiomeWeightedData>)
* Added mShoreTransformations (std::vector<BiomeWeightedData>)
* Added mPreHillsEdge (std::vector<BiomeConditionalTransformationData>) [BiomeConditionalTransformationData type definition below]
* Added mPostShoreEdge (std::vector<BiomeConditionalTransformationData>)
* Added mClimate (std::vector<BiomeWeightedTemperatureData>) [BiomeWeightedTemperatureData type definition below]

BiomeWeightedData:
* Added mBiomeIdentifier (BiomeStringList::BiomeStringIndex)
* Added mWeight (uint32_t)

BiomeConditionalTransformationData:
* Added mTransformsInto (std::vector<BiomeWeightedData>)
* Added mConditionJson (BiomeStringList::BiomeStringIndex)
* Added mMinPassingNeighbors (uint32_t)

BiomeWeightedTemperatureData:
* Added mTemperature (enum BiomeTemperatureCategory) [BiomeTemperatureCategory enum definition in New Enums]
* Added mWeight (uint32_t)

BiomeMultinoiseGenRulesData:
* Added mTemperature (float)
* Added mHumidity (float)
* Added mAltitude (float)
* Added mWeirdness (float)
* Added mWeight (float)

BiomeLegacyWorldGenRulesData:
* Added mLegacyPreHillsEdge (std::vector<BiomeConditionalTransformationData>)

BiomeReplacementsData:
* Added mBiomeReplacements (std::vector<BiomeReplacementData>) [BiomeReplacementData type definition below]

BiomeReplacementData:
* Added mReplacementBiome (BiomeStringList::BiomeStringIndex)
* Added mDimension (BiomeStringList::BiomeStringIndex)
* Added mTargetBiomes (std::vector<BiomeStringList::BiomeStringIndex>)
* Added mAmount (float)
* Added mNoiseFrequencyScale (float)
* Added mReplacementIndex (uint32_t)

BiomeStringList:
* Added mAllStrings (std::unordered_map<std::string, BiomeStringList::BiomeStringIndex>)
* Added mStrings (std::vector<std::string>)


## Other Changes to Types

PlayerListEntry:
* Added mColor (mce::Color)


## New Enums

ControlScheme::Scheme:
* Added LockedPlayerRelativeStrafe (0) []
* Added CameraRelative (1) []
* Added CameraRelativeStrafe (2) []
* Added PlayerRelative (3) []
* Added PlayerRelativeStrafe (4) []

ExpressionOp:
* Added Unknown (-1) []
* Added LeftBrace (0) []
* Added RightBrace (1) []
* Added LeftBracket (2) []
* Added RightBracket (3) []
* Added LeftParenthesis (4) []
* Added RightParenthesis (5) []
* Added Negate (6) []
* Added LogicalNot (7) []
* Added Abs (8) []
* Added Add (9) []
* Added Acos (10) []
* Added Asin (11) []
* Added Atan (12) []
* Added Atan2 (13) []
* Added Ceil (14) []
* Added Clamp (15) []
* Added CopySign (16) []
* Added Cos (17) []
* Added DieRoll (18) []
* Added DieRollInt (19) []
* Added Div (20) []
* Added Exp (21) []
* Added Floor (22) []
* Added HermiteBlend (23) []
* Added Lerp (24) []
* Added LerpRotate (25) []
* Added Ln (26) []
* Added Max (27) []
* Added Min (28) []
* Added MinAngle (29) []
* Added Mod (30) []
* Added Mul (31) []
* Added Pow (32) []
* Added Random (33) []
* Added RandomInt (34) []
* Added Round (35) []
* Added Sin (36) []
* Added Sign (37) []
* Added Sqrt (38) []
* Added Trunc (39) []
* Added QueryFunction (40) []
* Added ArrayVariable (41) []
* Added ContextVariable (42) []
* Added EntityVariable (43) []
* Added TempVariable (44) []
* Added MemberAccessor (45) []
* Added HashedStringHash (46) []
* Added GeometryVariable (47) []
* Added MaterialVariable (48) []
* Added TextureVariable (49) []
* Added LessThan (50) []
* Added LessEqual (51) []
* Added GreaterEqual (52) []
* Added GreaterThan (53) []
* Added LogicalEqual (54) []
* Added LogicalNotEqual (55) []
* Added LogicalOr (56) []
* Added LogicalAnd (57) []
* Added NullCoalescing (58) []
* Added Conditional (59) []
* Added ConditionalElse (60) []
* Added Float (61) []
* Added Pi (62) []
* Added Array (63) []
* Added Geometry (64) []
* Added Material (65) []
* Added Texture (66) []
* Added Loop (67) []
* Added ForEach (68) []
* Added Break (69) []
* Added Continue (70) []
* Added Assignment (71) []
* Added Pointer (72) []
* Added Semicolon (73) []
* Added Return (74) []
* Added Comma (75) []
* Added This (76) []
* Added Internal_NonEvaluatedArray (77) []
* Added Count (78) []

PlayerLocationPacket::Type:
* Added PLAYER_LOCATION_COORDINATES (0) []
* Added PLAYER_LOCATION_HIDE (1) []

SharedTypes::v1_21_10::CoordinateEvaluationOrder:
* Added XYZ (0) []
* Added XZY (1) []
* Added YXZ (2) []
* Added YZX (3) []
* Added ZXY (4) []
* Added ZYX (5) []

SharedTypes::v1_21_10::RandomDistributionType:
* Added SingleValued (0) []
* Added Uniform (1) []
* Added Gaussian (2) []
* Added InverseGaussian (3) []
* Added FixedGrid (4) []
* Added JitteredGrid (5) []
* Added Triangle (6) []


## Enum Changes
ActorDataIDs:
* Added SEAT_THIRD_PERSON_CAMERA_RADIUS (134) []
* Added SEAT_CAMERA_RELAX_DISTANCE_SMOOTHING (135) []
* Displaced Count

ActorFlags:
* Added DOES_SERVER_AUTH_ONLY_DISMOUNT (123) []
* Displaced Count

ActorType:
* Added HappyGhast (147 | Animal) []

AnimatePacket::Action:
* Removed RowRight
* Removed RowLeft

Connection::DisconnectFailReason:
* Added AsyncJoinTaskDenied (118) []

Editor::WorldType:
* Added EditorRealmsUpload (3) []

MinecraftPacketIds:
* Added PassengerJump_Deprecated (20) []
* Added PlayerInput_Deprecated (57) []
* Added CompressedBiomeDefinitionList_DEPRECATED (301) []
* Added PlayerLocation (326) []
* Added ClientboundControlSchemeSetPacket (327) []
* Changed EndId from 326 to 328
* Removed PassengerJump
* Removed PlayerInput
* Removed CompressedBiomeDefinitionList

ServerAuthMovementMode:
* Added LegacyClientAuthoritativeV1_Deprecated (0) []
* Removed LegacyClientAuthoritativeV1

