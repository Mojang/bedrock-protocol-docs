This document discusses an approach to implementing an anti-cheat mechanism that allows for server authoritative movement that still feels responsive, as described in this GDC [talk](https://youtu.be/W3aieHjyNvw)
The idea is that the client simulates frames and sends his inputs to the server, assuming that the server will agree with his simulated position. Once the server gets the input, it simulates the movement as well, and notifies the client of the result. In the mean time, the client has moved on simulating the next few frames. This means by the time the server's computed value arrives it is referring to a frame in the past. The client rewinds to the frame the packet is referring to, applies the correction (if any) and re-simulates his inputs back up to the frame the client is on. This means corrected values can still be applied, but without dramatically snapping the player due to the latency, because in most cases a correction will show up as a minor offset from the player's current position, instead of having to force him back several frames. This document's focus is to discuss how to implement the rewind and replay mechanism in Minecraft. Overwatch shrugs this off as being possible due to their scripting abstraction, while Minecraft has no such abstraction, and is more like spaghetti across actor, mob, player, client instance, and input handlers.

---

# Examples of non-cheat scenarios where rewind is needed

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

# Scope of changes for currently supported scenarios

Netease wants anti-cheat to secure key server game scenarios. They control which scenarios they choose to enable, meaning it's acceptable to have anti-cheat functionality for certain movement methods and not others. Currently supported movement methods are:
- Running on normal terrain (not ice, soul sand, spider webs)
- Sprinting and sneaking
- Flying
- Jumping

---

# The movement simulation loop

I started with trying to identify what portion of a player's tick is responsible for applying most of movement, so that I could simply extract out this little bit of logic, add a small abstraction for rewind, and be done with it. I quickly found out that the surface area of movement related changes is much larger than that, requiring encapsulation of almost all the functionality in `Mob::aiStep`. Even so, there are still some pieces of state relevant to player movement outside of this, like updating some water/swimming related values in `Actor::baseTick`, or the setting of `posPrev` in `Level::tickEntities`. Of course there's also code in network handler and during other parts of the tick that all can affect movement, so our solution needs to also support a way of tracking those modifications. In addition, `aiStep` is a mutable virtual member function on large classes (`Mob`, `Player`, `LocalPlayer` in the client case) so the logic should be encapsulated in a way that keeps necessary actor data available, while still being resilient to future code changes made around movement. To target the core movement logic in `aiStep` I introduced `IActorMovementProxy`. This is also the interface that the rewind and replay mechanism operates on. Movement related changes outside `aiStep` are tracked by `IReplayableActorInput` which will be discussed in more detail below.
**See `TickSnapshot` for implementation of extracted form of tick**

---

# IActorMovementProxy abstraction for Mob::aiStep

Objectives:
- Ability to simulate movement without needing to supply a mutable in-world Mob.
- A mechanism to ignore changes that don't make sense during rewind, like double triggering events or packets
- Add an interface that clearly describe what pieces of state are needed for movement simulation
- Share the same code path for movement logic when running live vs during a rewind and replay correction
- Make it difficult to accidentally add logic to movement code path that would only break the rewind case
- Make `Mob::aiStep` unit testable (abstract interface + fakeit)
- As little change as possible to the gameplay logic since restructuring could easily cause bugs.

`IActorMovementProxy` is an abstract class that I added which contains all methods accessed by logic with `Mob::aiStep` and its overrides. There is also `IMobMovementProxy` and `IPlayerMovementProxy` for logic within those classes. The objective is to transform the mutable virtual `aiStep` method into a static function that takes an `IActorMovementProxy`. This means any new logic that is added within `aiStep` must either use an existing method on `IActorMovementProxy` or add one, making it more difficult to unintentionally break the rewind/replay code path. If a method is added, the implementation can then decide what needs to be done for this operation in the context of rewind.

> When is it appropriate to access the underlying Actor?

There are some occasions where reaching through to the underlying actor is allowed as a measure to reduce the size of the refactor needed to introduce this proxy. The underlying actor is exposed via `IMobMovementProxy::_getMob` and `IPlayerMovementProxy::_getPlayer`. These are exposed during normal simulation, but not during rewind. The biggest purpose of the proxy is to allow different logic to execute during a rewind. Certain cases can be immediately discarded as not applicable to rewind. In such cases, the underlying actor can be used. In an ideal world everything would go through an interface, this is just a measure to reduce the surface area of the initial proxy integration. Cases where reaching through the proxy is acceptable:
- Server only logic, since the server doesn't rewind
- Currently unsupported movement scenarios like riding. Rewind won't be used during unsupported scenarios
- Manipulating/ticking objects that have nothing to do with movement. Ideally these wouldn't even be in the movement code path to begin with. Since they don't affect movement, capturing and rewinding their state doesn't matter for movement corrections.

A big section of the changes come down to refactoring functions to operate on `IActorMoveProxy`. Given a simplified example like this:
```
struct Mob {
  // Virtual and mutable, derived classes could change any of the many movement and non-movement related members
  virtual void doMoveStuff() {
    ++mWorldState;
    // Anyone could come along and add something like mWorldStateXxa = 6 here, potentially breaking rewind
  }

  int mWorldState = 0;
}

struct Player : public Mob {
  virtual void doMoveStuff() override {
    mLastWorldState = mWorldState;
    Mob::doMoveStuff();
  }

  int mLastWorldState = 0;
}
```

The proxy is introduced in this way:
```
struct IMobMovementProxy {
  // Values that the original method accessed are extracted to the interface
  virtual int getWorldState() const = 0;
  virtual void setWorldState(int state) = 0;
  // If doMoveStuff is called in a place that only has access to the proxy, it needs to go back through the proxy to use the underlying Mob's vtable to dispatch to either Mob::doMoveStuff(proxy) or Player::doMoveStuff(proxy)
  virtual void doMoveStuff() = 0;
  // Cast to player if it actually is one
  virtual IPlayerMovementProxy* asPlayer() = 0;
};

struct IPlayerMovementProxy : public IMobMovementProxy {
  // Values modified by player but not mob go on the player proxy in a similar way
  virtual int getLastWorldState() const = 0;
  virtual void setLastWorldState(int state) = 0;
};

struct Mob {
  // Keep this here for legacy purposes if it's already used in a million places. Otherwise this can be deleted in favor of the other virtual method taking the proxy
  virtual void doMoveStuff() {
    // Create a proxy object that is directly backed by the underlying mob.
    // Within the context of a rewind this code path wouldn't be called since it's all operating only on a proxy
    auto proxy = createDirectMobProxy(*this);
    // Forward any of the actual logic to the static method
    Mob::_doMoveStuff(proxy);
  }

  virtual void doMoveStuff(IMobMovementProxy& mob) const {
    // It is still possible to accidentally access class members here instead of from the proxy, so discourage this by always putting the real logic in a static method
    Mob::_doMoveStuff(mob);
  }

  static void _doMoveStuff(IMobMovementProxy& mob) {
    mob.setWorldState(++mob.getLastWorldState());
    // If someone now wants to add mWorldStateXxa they will clearly see that it would need to be added to IMobMovementProxy, and be forced to think about the implications of this on the rewind specific implementation of the proxy
  }

  int mWorldState = 0;
}

struct Player : public Mob {
  // Same 3 function process here as in mob
  virtual void doMoveStuff() override {
    auto proxy = createDirectPlayerProxy(this);
    Player::_doMoveStuff(proxy);
  }

  virtual void doMoveStuff(IMobMovementProxy& mob) {
    // Should always work if we reached this overload, but just to be sure
    if (IPlayerMovementProxy* player = mob.asPlayer()) {
      Player::_doMoveStuff(*player);
    }
  }

  static void _doMoveStuff(IPlayerMovementProxy& player) {
    player.setLastWorldState(player.getWorldState());
    // Can still call the base as before using the mob's static method
    Mob::_doMoveStuff(*this);
  }

  int mLastWorldState = 0;
}
```

Before the changes `doMoveStuff` required a real Mob to perform its functionality on, and developers could easily add additional logic inside of it that would inadvertently affect the rewind code path. It would also be tricky to unit test since it requires creating an entire Mob, which has many other dependencies. After the changes, the structure of the logic is still the same, although it has been moved to static methods. It now depends entirely on an abstract interface, meaning that during actual live simulation `doMoveStuff` can be called with a proxy that directly reflects the values of an underlying Mob. Then during rewind and replay, you could implement the proxy using a "MobSnapshot" object that has a `mLastWorldState` value that is modified. Now it's possible to run movement code without fear of side effects on a live mob, and it's obvious based on what was added to the proxy interface what values need to be tracked if this should be re-playable: `mWorldState` and `mLastWorldState`. In Minecraft these classes ended up being really bulky due to the large amount of loose pieces of state that gameplay logic was referring to. In some careful cases I still call through to the underlying Mob's implementation of methods if it would take too much refactoring to adapt the method. The ideal case is still that ultimately an underlying mob wouldn't be needed, but for the moment it is still used carefully within the rewind context.

**See `ActorMovementProxy.h/cpp` for base implementation and `PlayerRewindCotext.h/cpp` for rewind implementation**

---

# ReplayStateComponent

- `ReplayStateComponent` contains history buffer and state releveant to rewind
- `IReplayableActorState` is a snapshot of a piece actor state from `IReplayableActorStateSource`
- `IReplayableActorInput` is a state mutation

To store data relevant to tracking history I added the ReplayStateComponent. This is responsible for holding the collection of frames in the desired time window as well as all mutable changes that lead to the next frame. Specifically, this is done with `IReplayableActorState` which encompasses a snapshot of a piece of data at a point in time for the actor. `IReplayableActorState` objects are created via `IReplayableActorStateSource` which is supplied by the `GameModule`. As gameplay moves more towards ECS I imagine each component could have their own state source which supplies snapshots of just that component. At the moment though it's significantly more granular since the bulk of data that needs to be captured are direct members on Player. While `IReplayableActorState` captures the snapshot of state at a particular time, `IReplayableActorInput` snapshots a state mutation used to get from one frame to the next. Examples of inputs are ticking the mob, modifying input handler, receiving movement related packets, etc.. These inputs are added in line with the action when they're performed live, via `PlayerRewindListener` being notified of the given event.

---

# Performing correction on a past frame

Movement related packets (currently only `MovePlayerPacket`) to the client now come with a tick which specifies which frame of movement simulation they were referring to. This tick is computed by a tick value provided by the client in his latest `PlayerAuthInputPacket`. When the client receives a packet with tick information he does the following (ignoring early out optimization for simplicity):
- Use `ReplayStateComponent` to add this movement operation to the destination frame
- Create a rewind specific implementation of `IPlayerMovementProxy`
- For each frame from destination frame to latest frame:
  - Regenerate all `IReplayableActorState` values on this frame using all `IReplayableActorStateSource`s, since the correction presumably invalidated them.
  - Apply all `IReplayableActorInput` actions to the proxy from this frame, meaning the simulation of this proxy actor advances forward one frame

The actor is now in the updated state, having applied the corrections in the past and replayed all inputs since then forward back to the latest frame. Note that `PlayerRewindContext` implements the proxy implementation used during rewind. As discussed above, ideally this would be entirely backed by data, but to reduce refactor surface area the underlying player object is still accessed and modified. As such, each mutable action on `IPlayerMovementProxy` was carefully considered, using mocked data via `PlayerSnapshot` when possible, and from the underlying actor when it isn't, due to other pieces of code that ignore the proxy reaching through to the underlying object during rewind. Most notably for the `StateVector` since that's used everywhere. For a similar reason, all setters on the proxy interface also set the underlying player value unless said values are unrelated to rewind.

This process can be optimized by realizing that starting on frame x + 1 is equivalent to starting from x and applying all inputs in x. Since the input correction goes at the end of the input list on the given frame, this means instead of applying the destination frame, we can apply the frame after the destination, then the corrected input, then compare the state to see if it's any different than it was when the client first simulated it. If not, advancing inputs can be ignored, which is relatively expensive since it has all of `aiStep` in it.

**See `ReplayStateComponent::applyCorrectionToFrame` for implementation and `PlayerRewindListener` for use cases**

---

# End to end from client perspective

- `ReplayStateComponent` added upon player creation if desired
- `PlayerEventListener::onPlayerAIStepBegin` advances the state on the `ReplayStateComponent`
- Corrections are applied via the packet handlers in `ClientPlayerRewindListener`

When the game module is configuring the level it will add the `ClientPlayerRewindListener` if the feature is allowed to be on. Once the player is created, `ClientPlayerRewindListener::onPlayerCreated` will add the `ReplayStateComponent` if player rewind is desired. This is determined by if the server indicated the desire to use corrections in the `StartGamePacket`. The addition of the `ReplayStateComponent` to the player indicates the desire to rewind, and is what all the related rewind logic is based on.

Every frame, assuming rewind is enabled, `ClientPlayerRewindListener::onPlayerAIStepBegin` will tick the `ReplayStateComponent`. This advances the current frame counter as well as taking a snapshot of the current player state for potential rewind later. What state to capture is determined by the registered `IReplayableActorStateSource` objects registered by the module. The bulk of relevant state is contained in `PlayerSnapshot` which is applied as a state source via the `PlayerSnapshotReplay` in `ClientReplayableActorState.cpp`

After extracting snapshot information from the frame within `ReplayStateComponent`, the `ClientPlayerRewindListener` also adds a snapshot of the current input, as well as the `IReplayableActorInput` representation of a mob tick via `History::createTickMobReplay()`. These are all state mutations that will be applied to an `IActorMovementProxy` if replaying over this frame.

Simulation of the frame continues, and any state modifications relevant to replay should fire an event that the `ClientPlayerRewindListener` can listen to to record the change as an `IReplayableActorInput` on the `ReplayStateComponent`. One such example is `ClientPlayerRewindListener::onCameraSetPlayerRot` which is when the client's input is applied to the orientation of the camera. This is of course a vital part of movement replay, as it'll allow the frames to replay the rotational inputs. In the future there may be some more events to record relevant state mutations outside of the `_aiStep` portion of the mob update which is covered by the `TickMobReplay` added at the beginning of the `aiStep`.

This process continues to record information for each frame that passes until the server sends a packet that requires rewind. This may either be a `CorrectPlayerMovePredictionPacket` or could be a `SetActorDataPacket` or `UpdateAttributesPacket`. It is important to replay actor data and attributes properly so that in flight state isn't accidentally reapplied or misinterpreted, as explained in the section above about non-cheat scenarios.

When replay is needed, the relevant packet will supply a tick. This is referring to the tick that the client provided in the latest `PlayerAuthInputPacket` that the server had processed at the time that it issued the correction. This is the same tick that is used as the key into `ReplayStateComponent` frames. `ReplayStateComponent::applyFrameCorrection` now applies the actual correction, which must be implemented as an `IReplayableActorState` since it is possible that this correction will be replayed in a future correction. The `ReplayStateComponent` then uses the underlying `ActorHistory` object to perform the rewind and replay using this sequence of actions:
- Apply the snapshot of the frame after the destination frame
- Apply correction, taking note of if this changed anything or if the correction was redundant
- If the change was redundant, revert back to original present state.
- If the correction does result in a different state than the original snapshot, perform the rewind. For each frame since the destination frame + 1 until the current frame:
  - Use state sources to extract new snapshots for these frames. The old snapshots are invalidated by the correction.
  - Apply all `IReplayableActorInput`s on this frame to advance to the next frame
- Once this process is complete the actor is back in the present but their state has been adjusted to account for the correction while replaying all inputs since then to minimize the visible impact of the correction.

---

# End to end from server perspective

Similar to the process described above for the client, the server game module will add the `ServerPlayerRewindListener` if replay is desired, which is based either on the feature toggle state or the dedicated server props file as parsed in `PropertiesSettings`. Rewind logic is again gated upon the existence of the listener itself as well as the listener's decision to add the `ReplayStateComponent` to the player. This time the addition happens lazily as part of `ServerPlayerRewindListener::onPlayerAuthInputReceived`.

Every frame, if server authoritative corrections are desired, the server will advance the state on `ReplayStateComponent`. However, the server doesn't need to rewind, so there are no `IReplayableActorStateSource`s registered by the server module. Instead, the `ReplayStateComponent` is just keeping track of the current tick that should be used for corrections sent back to the client. `PlayerAuthInputPacket` is what advances the player simulation forward, so the server uses the tick value that the client sent there as an easy way to ensure that the client and server are talking about the same frame for corrections.

The server simulates the player's movement in the `ServerNetworkHandler` handling of the `PlayerAuthInputPacket`. After it is done, `ServerPlayerRewindListener::onPlayerAuthInputApplied` checks to see if it should send a correction. The logic for this is controlled by `ReplayStatePolicy::shouldCorrectMovement`. `ReplayStatePolicy` contains the nasty special cases to handle all the current limitations of anti-cheat as it stands now, as described in the "Anti-cheat limitations" wiki section. Here the various threshold values supplied by the dedicated server props files are used to determine if the server wants to accept some or all of the client's drift, or if it should issue corrections, using separate thresholds for "supported" and "unsupported" scenarios. This is because unsupported scenarios are expected to have much more error, so being able to specify a different threshold allows big enough windows that corrections don't misfire without making all the windows too big to render the server simulation pointless. 

Ultimately `ReplayStatePolicy` will return a value indicating how `ServerPlayerRewindListener` should respond, be it accepting the client's drift, sending a correction, or doing nothing. Corrections are sent via the new `CorrectPlayerMovePredictionPacket`.

Throughout the frame, another addition for the sake of anti-cheat is adding tick values to the attribute and actor data packets. This is needed for any pieces of state that affect movement that the client can request to change. The tick is needed so the client can rewind and replay the change properly instead of running in to the "Actor data problem scenario" noted at the top of this document.

---

# When correction packets are sent

## Objectives:

- Minimize cpu cost
- Minimize bandwidth required
- Prevent sending corrections during unsupported movement scenarios
- Prevent client from attempting to rewind during unsupported movement scenarios
- Throttle server corrections to give the client a brief window to get back in sync naturally
- Configurable balance between strict anti-cheat and comfortable movement

Strictly speaking the server could send a correction packet every frame back to the client and the client could redundantly replay even though their computations already matched. This uses more bandwidth than necessary and uses considerable cpu to re-simulate several frames each frame. Since not all movement scenarios are supported, we also must be careful not to send correction packets during unsupported scenarios, since the client would butcher the rewind, at best leading to them getting stuck, at worst getting jerked around frame by frame as it spirals out of control since every "replay" produces new incorrect results. For the same reason, the client should also be careful not to attempt rewinds through unsupported movement scenarios.

Thus the decision of when to send correction packets is rather messy. For the smoothest player experience the server would accept some threshold of error from the client and apply differences to keep in sync. For the strictest anti-cheat functionality the server wouldn't allow any error and insist that it knows best. This is a very fiddly area that has no right answer, so I am implementing solutions with multiple thresholds and allowing the server owner to specify then in the server props. See this page for descriptions of each of the configurable values and how it works:

[Anti-cheat configuration](./ConfiguringAntiCheat.md)

**See `ReplayStatePolicy.cpp` for its implementation.**

Before client rewind work there was already a system in place to monitor desyncs and over time determine a cheating score to determine the likelihood of cheating weighed against the expected inaccuracy of the simulation. The logic to determine when to send packets is similar, but doesn't need to replace this. The scoring system is still useful for telemetry to determine the likelihood of cheating, while small corrections should help reduce the expected amount of desyncs, except for in unsupported scenarios.
**See `ServerPlayer::checkCheating` for its implementation**
