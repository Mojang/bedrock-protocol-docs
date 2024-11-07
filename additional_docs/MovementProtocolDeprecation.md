# Introduction

In Fall 2024, Bedrock will be starting the preview process of migrating player movement to be server authoritative. Once this process is complete and the changes have been in retail for a release, the client authoritative code paths will be deleted.

This document is a starting point that refers to relevant locations in the rest of the protocol documents describing how to adopt the new protocol. Any servers that do not adopt the new protocol will eventually be incompatible with Bedrock.

# Who is affected

The movement protocol in question is `ServerAuthMovementMode`, see [enums documentation](../html/enums.html) for the full details. Any server not currently specifying `ServerAuthoritativeV3` will need to take some action, as that will become the only option.

# Adopting the protocol

It is not necessary to implement server authoritative movement physics to adopt the protocol. Any behavior previously implemented using the older protocols remains possible with `ServerAuthoritativeV3`. The documentation for the following packets contain details of how its properties map to the new protocol. See the notes on the [packets](../html/packets.html) page for high level details and the packet pages themselves for particular fields.

Servers currently using `LegacyClientAuthoritativeV1` need to be aware of changes to the following packets:

- 11 [StartGamePacket](../html/StartGamePacket.html) (Server specifies the movement protocol here)
- 18 [Move Actor Absolute](../html/MoveActorAbsolutePacket.html) (Deprecated client to server motion updates of vehicles)
- 19 [Move Player](../html/MovePlayerPacket.html) (Deprecated client to server motion updates)
- 20 [PassengerJumpPacket](../html/PassengerJumpPacket.html) (Deprecated horse jump)
- 36 [Player Action](../html/PlayerActionPacket.html) (Deprecated for select action types, see also the `PlayerActionType` enum)
- 44 [Animate Actor](../html/AnimatePacket.html) (Deprecated for boat paddle input)
- 57 [Player Input](../html/PlayerInputPacket.html) (Deprecated vehicle input)
- 144 [Player Auth Input](../html/PlayerAuthInputPacket.html) (Primary input packet)
- 161 [CorrectPlayerMovePrediction](../html/CorrectPlayerMovePredictionPacket.html) (New optional movement correction mechanism)

Servers currently using `ClientAuthoritativeV2` and below should be aware of the following:

See also all packets that specify usage of a `PlayerInputTick` and follow the steps described in documentation of that [type](../html/PlayerInputTick.html)