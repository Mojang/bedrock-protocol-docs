# ECS for state storage and application during player rewind/replay

This demonstrates how to implement gameplay logic for player movement that supports anti-cheat rewind corrections when using ECS to store the relevant state. This example shows an ideal component where that is only used by its system. In real scenarios the logic might be in different places but the principles are the same.

In typical ECS fashion, the state related to the logic goes on the component, with the system having no state. Here is a simple hypothetical component that will move the player up by a given amount.

```
struct LevitationComponent {
  // Implement necessary constructors and assignment here...
  float mBlocksPerTick = 0.f;
};
```

The system is then responsible for knowing how to use this component, along with any other relevant components, to implement the desired behavior. It must also implement handling for the `OnExtractStateFrom` method so that the component values are captured when taking snapshots of state for rewind. After performing the movement action, an `IReplayableActorInput` must also be stored on the `ReplayStateComponent` so that this tick is replayed during a correction. This would not be necessary if there was some way to tick entity systems only on the player during rewind. Currently however, the simulation is driven by a series of `IReplayableActorInput` objects, one of which is calling `Mob::aiStep`.

```
struct LevitationSystem : public ITickingSystem {
  // This is needed to replay the levitation simulation during a movement correction
  struct LevitationReplayableInput : public IReplayableActorInput {
    // This is called during a movement correction for each tick that needs to be replayed.
    void advanceFrame(IActorMovementProxy& actor) const override {
      // This component exists on the rewind context due to the state extraction performed in `onExtractStateFrom`
      // tryGet because maybe it's possible for other gameplay logic to remove levitation as part of a correction or otherwise
      if (const auto levitation = actor.tryGetComponent<LevitationComponent>()) {
        LevitationSystem::applyLevitation(actor.getStateVectorNonConst(), *levitation);
      }
    }

    // Since the input is stateless, the same input instance can be used across all ticks
    static std::shared_ptr<IReplayableActorInput> singleton() {
      static std::shared_ptr<IReplayableActorInput> instance = std::make_shared<LevitationReplayableInput>();
      return instance;
    }
  };

  void registerEvents(entt::dispatcher& dispatcher) override {
    dispatcher.sink<OnExtractStateFrom>().connect<LevitationSystem::_extractFrictionState>();
  }

  void tick(EntityRegistry& registry) override {
    // In reality you would need to get the StateVector off of the ActorComponent but let's live in a fantasy world for this example
    registry.viewEach([](EntityContext& entity, StateVector& svc, LevitationComponent& levitation) {
      // Apply the levitation on the entity now
      applyLevitation(svc, levitation);

      // Record the application for later so that the levitation is replayed if necessary for an upcoming correction
      // tryGet for if anti-cheat rewind is disabled
      if (auto replay = entity.tryGetComponent<ReplayStateComponent>()) {
        replay->addInputToCurrentFrame(LevitationReplayableInput::singleton());
      }
    });
  }

  // The actual gameplay logic to apply to the actor
  static void applyLevitation(StateVector& svc, const LevitationComponent& levitation) {
    svc.getPosDelta().y += levitation.mBlocksPerTick;
  }

  // State extraction needed to be able to rewind the component's state during a movement correction
  static void onExtractStateFrom(const OnExtractStateFrom& e) {
    if (const auto levitation = e.mFrom->tryGetComponent<LevitationComponent>()) {
      // Since the component is all plain data, a straight copy can be used back and forth
      e.mTo->getOrAddComponent<LevitationComponent>() = *levitation;
    }

    // If it's necessary to do special logic when applying this back to the live actor after a movement correction,
    // that could be done here. Ideally the data can represent itself and this isn't needed
    if (e.mIsApplyingToLiveActor) {
      // Use the actor here for your nefarious side-effects
    }
  }
};
```
