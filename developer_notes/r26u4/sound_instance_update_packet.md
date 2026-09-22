# ClientboundUpdateSoundDataPacket
- New server→client packet that updates an in-flight sound identified by `ServerSoundHandle`. Payload is a variant of `Stop`, `SetVolume`, `SetPitch`, `Fade`, `SeekTo`, `Pause`, and `Resume` params.
