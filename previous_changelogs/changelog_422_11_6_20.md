# Minecraft Network Protocol Docs 11/6/20
For 16u2-beta-3 and 16u2-beta-4, Network Protocol Version 422

The anvil supports server authoritative crafting as well as the cartography table at this point.

## Packet Changes

### Resource Packs Info
    Added Is Raytracing Capable boolean field to the textures.

## Enum changes

ItemStackRequestActionType:
  Added CraftRecipeOptional(12)
  Removed CraftMap

The PlayerAuthMovementPacket::InputData enum is never written as is but governs a bitset in PlayerAuthMovementPacket; it's documented now.