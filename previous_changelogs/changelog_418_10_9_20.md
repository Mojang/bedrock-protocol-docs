# Minecraft Network Protocol Docs 10/9/20
For 16u1-beta-10, Network Protocol Version 418

We've included a document - 

## Packet Changes

### CameraShakePacket
    Added CameraShakeType enum field.    

### ItemData (in StartGamePacket itemList)
    Added IsComponentBased bool.

## Enum changes

Changes:
Renamed Block::Update to BlockUpdate.

PlayerActionType:
  Added CreativeDestroyBlock(13)
  Removed DEPRECATED_ChangeDimension
