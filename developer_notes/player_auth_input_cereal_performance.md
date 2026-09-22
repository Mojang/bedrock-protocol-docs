# PlayerAuthInputPacket

- Optimized `Input Data` serialization by binding its enum set directly instead of converting through an intermediate list.
- Removed redundant Cereal accessor-presence markers from `Input Data`, `Item Use Transaction`, `Item Stack Request`, `Player Block Actions`, `Vehicle Rotation`, and `Client Predicted Vehicle`. The binary wire format has changed.
