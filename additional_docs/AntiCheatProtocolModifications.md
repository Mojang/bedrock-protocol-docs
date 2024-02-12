# Introduction

This document contains details about what changes were made to the network protocol for anti-cheat, as well as what a third party server partner can do with them.

---

# Intention behind the protocol changes

- Communicate anti-cheat configuration to clients
- Client sending extra data to the server so it can accurately simulate movement in sync with the client
- Server sending tick values back for values that need to be applied with rewind so the client knows what frame to rewind to and replay from
- New correction packet used to correct deviations between client and server simulations

---

# The tick values

Several packets have added tick values now. The client sends a tick value in `PlayerAuthInputPacket` which represents that player's simulation frame. Any time the server sends a tick value, it is referring to one of the previous tick values the client sent to it. The server advances the player's simulation upon receiving `PlayerAuthInputPacket`, so a Bedrock server's tick value for a player will never be past what the client thinks it is, regardless of latency.

- 0 is an acceptable tick value, which will prevent the client from applying the packet with rewind.
- If a tick value is out of range the client will apply the packet on the current frame without rewind.
- The server keeps track of the most recent (in queued order of all packets) and sends that value back to the client in packets that now have tick values.

---

# Third party servers

The server instructs the client on what movement mode it expects, so servers could choose to disable this feature entirely. If a server chooses to enable it, the bare minimum to ensure a smooth player experience is to echo back the tick values that the client sends as described in the tick section above. If the server does that, and accepts all position data within `PlayerAuthInputPacket` then gameplay will feel normal with this feature enabled.

Of course, without sending corrections there isn't much of a point of turning it on. The frequency of corrections that still allows a smooth game experience for players is tied to how closely movement simulation on a third party server matches what the client does. If there is too much deviation, then the rewind/replay mechanism won't be as helpful as desired for smoothing out corrections, since the player will effectively always be mis-predicting movement, and the server will correct it. The end result should be some jerkiness in player movement. If client and server simulation match exactly, in theory, corrections could be sent every frame and the player wouldn't be able to notice anything is different.

Even if the server's simulation isn't accurate enough to allow frequent corrections, infrequent corrections using rewind will still be more fluid than a plain position modification would be using the previous server authoritative movement method. For instance, imagine a case where the player is running steadily forward, but the server decides the player should be one block to the right. Without rewind, when the player's position is modified, from the client's perspective they will be moved right and pulled backwards. This is because the client had moved forward since the point in time when the server sent the position adjustment of one block to the right. With rewind enabled, the player sees himself snap to the right, but not backwards, because when the correction was applied, the client rewound to the frame, moved one block to the right, then replayed all inputs since the packet was sent, which brings them back forward to where they were, except one block to the right.

---

# Modifications per packet

## StartGamePacket

- RewindHistorySize, used to determine how many frames of history the client tracks for rewind
- IsServerAuthoritativeMovement (bool) changes to an enum (varint).
  - 0 for client authoritative
  - 1 for server authoritative
  - 2 for server authoritative with rewind

## MovePlayerPacket

- Tick (unsigned varint64) value for application with rewind

## UpdateAttributesPacket

- Tick (unsigned varint64) value for application with rewind

## PlayerAuthInputPacket

- PosDelta (vec3) value of client after simulating input. Used for comparison with server's simulation value
- Tick (unsigned varint64) value. This is the tick value that all client bound packets are referring to
- These extra flags were added after "PersistSneak" and replace what used to be individual `PlayerActionPackets` with the given action:
  - StartSprinting
  - StopSprinting
  - StartSneaking
  - StopSneaking
  - StartSwimming
  - StopSwimming
  - StartJumping
  - StartGliding
  - StopGliding
- In addition, these flags were added, which each indicate that related data will be packed into the packet:
  - PerformItemInteraction (ItemUseInventoryTransaction will be packed)
  - PerformBlockActions (PlayerBlockActions will be packed)
  - PerformItemStackRequest (ItemStackRequestData will be packed)

## ActorDataPacket

- Tick (unsigned varint64) value for application with rewind


## CorrectPlayerMovePredictionPacket

- Pos (vec3) position the player should be at the end of this tick
- PosDelta (vec3) per-frame velocity the player should have at the end of this tick
- Tick (unsigned varint64) value for application with rewind
- OnGround (bool) if the player should think he is on the ground at the end of the frame