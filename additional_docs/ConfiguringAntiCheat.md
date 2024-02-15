See this for general context on player movement anti-cheat:
[Player Rewind for Movement Anti-Cheat](./PlayerMovementOverview.md)

In summary, when anti-cheat with client rewind is on, the client and server are both simulating inputs. When the server detects that the client is out of sync, it issues a correction to the client. The client rewinds to the point in time the server was referring to when it sent the packet, performs the correction, then replays all inputs since then. This document explains the configurations that go in to the decisions of how and when to send the corrections.

---

# How the server decides to send corrections

The server compares the server player's authoriative position against the client's prediction from `PlayerAuthInputPacket` with the configurable thresholds. Each of them are exposed to the server props (see [AntiCheatServer.properties](./AntiCheatServer.properties)) file.

# Enabling anti-cheat on a client

Anti-cheat will be enabled if the server instructs the client to do so via the `StartGamePacket` (id 11).

# Enabling anti-cheat on a dedicated server

The feature defaults to off, but can be enabled and configured via the `server.properties` file. Full details can be found in [AntiCheatServer.properties](./AntiCheatServer.properties)

---

# Server.properties values for anti-cheat

## Block Breaking

`server-authoritative-block-breaking` (bool)

With this enabled the server will authoritatively validate block break process and block breaking predicted by the client. **Creative mode is still client authoritative**

`server-authoritative-block-breaking-pick-range-scalar` (float)

With server authoritative block breaking enabled, a distance check is performed by the server when a client attempts to start or continue breaking a block. This is a scalar on top of the player's max pick distance to allow some client drift if desired. When server authoritative block breaking is disabled, the position is client authoritative and 0.5 is added to it for good measure.
