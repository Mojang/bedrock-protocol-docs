# Minecraft Network Protocol Docs 1/6/21
For 16u3-beta-4, Network Protocol Version 425

We were missing some fields in the Login and SubClientConnectionRequest json web tokens that are now documented but have been there a while.

## New Packet
ClientBoundDebugRendererPacket

## Packet change
CameraShakePacket
* Added ShakeAction

# Type change
SerializedSkin
* Added PlayFabId

## New Enums
CameraShakeAction:  (not really new, but now documented)
* Added Add(0)
* Added Stop(1)

CameraShakeType:
* Added Positional(0)
* Added Rotational(1)

ClientboundDebugRendererPacket::Type:
* Added Invalid(0)
* Added ClearDebugMarkers(1)
* Added AddDebugMarkerCube(2)
  
## Enum changes
MinecraftPacketIds:
* Added ClientBoundDebugRendererPacket(164)