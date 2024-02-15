# Introduction

This document describes the approach used for the server authoritative movement mode particularly focused on what a dedicated server host would want to know about configuring the feature and what a third party server developer would need to know to implement it. How to enable the feature is described in [ConfiguringAntiCheat](./ConfiguringAntiCheat.md).

This movement mode is client predicted with full server authority. After simulating movement for the frame, the client sends their input along with their predicted position information in the input packet containing a tick ID. The server does not simulate movement for players until one of these packets arrives. When it does, they simulate movement for the player, comparing the server's results with the predicted client positions. If the server deems a correction necessary, they send a correction packet to the client containing the tick ID specified in that frame's input packet. By the time the client receives the correction they will have already predicted several more ticks past the time the correction is referring to. The player rewinds their state to the tick the correction is referring to, applies it, then simulates all predictions since then back up to the present. This allows for corrections to be sent frequently with minimal disruption to the player experience compared to applying the correction directly to the later frame the client is currently on. These corrections are not applied with any interpolation. Aside from explicit movement correction packets, other packets containing values that affect movement simulation can also contain the tick ID which then apply the movement related portions with this rewind approach.

---

# Examples of non-cheat scenarios where rewind is needed

Movement corrections are not exclusively for malicious clients. Because clients are always predicting ahead while the server communicates with some amount of latency, these differing perceptions of time can lead to different results of the exact same movement simulation logic. Below are some non-malicious examples where the client's rewind correction mechanism comes into play.

Frame (2, 0) means frame 2 for the client, 0 for the server.

Actor data problem scenario, 2 frame arrival time:
- Frame (2, 0): Client sets sneak to ON
- Frame (4, 2): Client sets sneak to OFF
- Frame (4, 2): Server updates sneak to ON
- Frame (5, 3): Server decides to broadcast dirty actor data (sneak state)
- Frame (6, 4): Server updates sneak to OFF
- Frame (7, 5): Client receives dirty actor data saying sneak should be ON
Now client and server are out of sync with each other on sneak state, meaning their computations of movement won't agree with one-another.

Solution, same interval:
- Frame (2, 0): Client sets sneak to ON
- Frame (4, 2): Client sets sneak to OFF
- Frame (4, 2): Server updates sneak to ON from client frame 2
- Frame (5, 3): Server decides to broadcast dirty actor data (sneak state)
- Frame (6, 4): Server updates sneak to OFF from client frame 4
- Frame (7, 5): Client receives dirty actor data saying sneak should be ON from server frame 2.
  - Client rewinds state to frame 2
  - Applies actor data change, redundantly setting sneak from ON to ON
  - Simulate back to frame 7
  - Nothing has changed, no corrective action is needed, client and server are in sync for simulating frame 3

Unexpected knockback problem scenario, 2 frame arrival time:
Client is moving north at a constant 1 block per tick (for simplicity)
- Frame (2, 0): Client player is at [0, 2]
- Frame (2, 0): Server player is knocked one block east by a server authoritative force, landing at [1, 0]
- Frame (3, 1): Client player is at [0, 3]
- Frame (3, 1): Server player is at [1, 1]
- Frame (4, 2): Client gets a packet from server frame 0 saying he should be at [1, 0]
  - Client rewinds to frame 0, adjusting [0, 0] to [1, 0]
  - Client replays frame 1, adjusting [0, 1] to [1, 1]
  - Client replays frame 2, adjusting [0, 2] to [1, 2]
- Frame (4, 2) Client simulates input with knockback to [1, 4]
- Frame (4, 2): Server gets client input expecting [0, 2] but server computes [1, 2]
- Frame (5, 3): Server gets client input expecting [0, 3] but server computes [1, 3]
- Frame (6, 4): Server gets client input expecting [1, 4] and server computes [1, 4], they are now back in sync

---

# End to end from client perspective

### Receiving Packets

If an incoming packet on the client contains a nonzero tick id relating to a previously sent input packet, the packet is captured in history at the given tick id for processing during upcoming movement simulation. Any other packets are processed immediately. If the specified tick ID is no longer in the client's history window, the packet will also be applied immediately without any rewind. Client bound packets containing a tick id in this way are:

- CorrectPlayerMovePredictionPacket (id 161)
  - The main packet intended for the server to correct client mispredictions
- MovePlayerPacket (id 19)
  - Intended for things like teleports, not quite the same as the correction packet
- SetActorDataPacket (id 39)
- UpdateAttributesPacket (id 29)

### Processing corrections

At the beginning of movement simulation for the player the packets deferred from the previous step are processed. If any new packets were put into history with values relevant to movement simulation, the rewind mechanism will be used to rewind, apply, and re-simulate back up to the current tick.

### Simulating movement

After processing the corrections, the client advances the tick ID and captures a new snapshot of movement related data into the rolling history window. They then advance their input state and simulate movement forward, resulting in new position and velocity. This new input and the resulting predicted position data is sent in the `PlayerAuthInputPacket` (id 144). During movement simulation the client may also send `InventoryTransactionPacket` (id 30) for interacting with items in hand. Given that this can affect movement (like slowdown from drawing a bow) the server simulates this inline with the next `PlayerAuthInputPacket` that arrives.

Note that when riding a client-predicted vehicle (horse or boat) the predicted position values in the packet are referring to the vehicle not the player.

---

# End to end from server perspective

### Simulating movement

When the server is ready to process a `PlayerAuthInputPacket` it will advance the tick id corresponding to that player, update the input state based on the values provided in the packet, and simulate movement. Note the pairing with `InventoryTransactionPacket` described in the client section above. If any of the packets containing a tick id are sent, they use this updated id.

If a server didn't want to implement server authoritative movement yet still use this protocol they could blindly accept the predicted positions supplied in `PlayerAuthInputPacket` rather than simulating and sending corrections.

### Sending corrections

After movement simulation the server compares the results of what they simulated with the client prediction contained in `PlayerAuthInputPacket`. If it is happy with the results, nothing needs to be sent. Otherwise, a `CorrectPlayerMovePredictionPacket` is sent. This is done with thresholds to avoid spamming the client for minor differences or avoid sending multiple corrections before the client gets the chance to process the first.

Note that when riding a client-predicted vehicle the position data is compared with the vehicle and the correction data is also specifying the corrected vehicle data.

After deciding to correct the cient (or not) the player position can be broadcast to other clients the same way as other movement modes.
