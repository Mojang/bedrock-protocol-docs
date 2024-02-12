See this for general context on player movement anti-cheat:
[Player Rewind for Movement Anti-Cheat](./PlayerMovementOverview.md)

In summary, when anti-cheat with client rewind is on, the client and server are both simulating inputs. When the server detects that the client is out of sync, it issues a correction to the client. The client rewinds to the point in time the server was referring to when it sent the packet, performs the correction, then replays all inputs since then. This document explains the configurations that go in to the decisions of how and when to send the corrections.

---

# How the server decides to send corrections

- Don't send/apply during known bad situations
- Trigger correction above thresholds
- Accept client drift within thresholds
- Accept client drift within unsupported scenario with separate threshold
- Limit correction frequency

The server and client both monitor the player and surrounding area for known problematic scenarios. In such a case it is known that the rewind mechanism would produce inconsistent results, the client/server simulations don't match, or both. To avoid disaster the server won't send corrections within a certain amount of ticks of such an unsupported event so that the client won't attempt to rewind over it. Similarly, the client won't rewind over such an event if somehow he gets a packet marked for said frame, instead applying it on the current frame. That could still snap the player, but presumably less than replaying the unsupported movement.

Assuming the movement scenario is supported, the server compares the computed new position and `posDelta` (per frame velocity) and compares this with the various configurable thresholds detailed below. Each of them are exposed to the server props (see `PropertiesSettings.cpp`) file.

# Enabling anti-cheat on a client

Games hosted by the app default to off based on a feature toggle. This can be toggled on in non-publish builds, which will cause games hosted by this instance to instruct other clients to enable anti-cheat. Regardless of the toggle state, anti-cheat will be enabled if the server instructs the client to do so via the `StartGamePacket`

# Enabling anti-cheat on a dedicated server

The feature defaults to off, but can be enabled and configured via the `server.properties` file, as described below.

---

# Server.properties values for anti-cheat

## Common values for all movement scenarios

`server-authoritative-movement` (string)
Possible values:

- `client-auth` Uses client authoritative movement
- `server-auth` Uses server authoritative movement without rewind
- `server-auth-with-rewind` Uses server authoritative movement with rewind

`correct-player-movement` (bool)

Determines if the chosen server authoritative method will issue corrections to the client.

`player-rewind-min-correction-delay-ticks` (long)

Minimum amount of ticks that must elapse in between threshold violations for the server to send a correction. If the value is zero, a correction will be sent every frame if necessary.

`player-rewind-history-size-ticks` (int)

The number of frames that are saved client side for rewinding back to. This changes how much latency will be allowed before rewind cannot be performed and changes will be applied on the most current frame instead. The value is in ticks and there are 20 ticks per second. Using a value of 20 should mean that a one second round trip latency would still be able to apply corrections with rewind.

## Thresholds used during supported movement scenarios

`player-rewind-position-threshold`(float)

Amount of distance (squared) in blocks between client and server simulation of position on a frame to trigger a correction.

`player-rewind-velocity-threshold` (float)

Amount of distance (squared) between client and server simulation of `posDelta` on a frame to trigger a correction.

`player-rewind-position-acceptance` (float)

If position difference (squared) between server and client is within this distance in a frame, the server will accept the client's position.

`player-rewind-position-persuasion` (float)

If there is position difference between the server and client, the server will move this much per frame in the direction of the client's computed value.

## Thresholds used during unsupported movement scenarios

`player-rewind-unsupported-position-threshold` (float)

`player-rewind-unsupported-velocity-threshold` (float)

`player-rewind-unsupported-position-acceptance` (float)

`player-rewind-unsupported-position-persuasion` (float)

## Block Breaking

`server-authoritative-block-breaking` (bool)

With this enabled the server will authoritatively validate block break process and block breaking predicted by the client. **Creative mode is still client authoritative**

`server-authoritative-block-breaking-pick-range-scalar` (float)

With server authoritative block breaking enabled, a distance check is performed by the server when a client attempts to start or continue breaking a block. This is a scalar on top of the player's max pick distance to allow some client drift if desired. When server authoritative block breaking is disabled, the position is client authoritative and 0.5 is added to it for good measure.

## Packet spamming exploit properties

It is possible to exploit movement by sending input packets faster than normal to move faster in game. These properties can protect against that exploit.

`player-tick-policy` (string)

Possible values:
- greedy (no throttling, all inputs are processed immediately)
- throttled (input packet processing is throttled based on the below properties)

`player-tick-throttled-input-batch-size` (int)

Maximum number of input packets that the server can store at once for throttled processing. If new packets would go over this limit, the oldest packets will be discarded. This has no effect outside of the throttled tick policy.

`player-tick-throttled-max-tick-credits` (int)

If the server ticks without receiving inputs from the client, a credit is built up to allow multiple client inputs to be processed by the server once they do arrive. For instance, if the server ticks 10 times without any client input, then 11 client inputs come in at once, the server will process all 10 that were previously credited. The 11th is processed on the server's next tick. The max number of credits that can build up this way is determined by this property. Setting this to 0 disables the crediting, and causes the server to only process one input per tick regardless of if any were missed previously. This has no effect outside of the throttled tick policy.

**See `PropertiesSettings.cpp` for this configuration parsing**

---

# Client Authoritative Scenarios:

In these instances the server doesn't even try to simulate the movement and accepts whatever the client says:

- Riding
- Gliding

---

# Unsupported scenarios:

These are all of the scenarios that currently trigger the "unsupported" thresholds above since there are known to be at least some discrepancies between the client and server simulation.

- Swimming and moving in liquid (pieces of state updated outside of rewind loop
- Bubble columns (updated outside of rewind code path)
- Blocks using `entityInside` to alter movement (bypasses rewind proxy interface)
  - Honey
  - Soul sand
  - Berry Bush
  - Webs
- Bed (bounce behavior mismatch between client and server)
- Piston (push outside of rewind code path, and world state isn't rewound)
- Ice (Friction modification doesn't rewind properly)
- Immobility caused by being in or near unloaded chunks
- Being stuck inside a block, such as teleporting into the ground

**This list is derived from `ReplayStatePolicy.cpp` for the most up to date information, look there.**
