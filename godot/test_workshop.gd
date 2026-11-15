extends SceneTree

var workshop: Node

func _initialize() -> void:
	call_deferred("run_workshop")

func run_workshop() -> void:
	workshop = load("res://workshop.tscn").instantiate()
	root.add_child(workshop)
	await process_frame
	assert(workshop.player != null)
	assert(workshop.camera != null and workshop.camera.current)
	assert(workshop.claw.visible)
	assert(not workshop.probe_visual.visible)
	assert(workshop.visual.get_node("Body/CastChassis/LowCastHull") != null)
	assert(not workshop.visual.get_node("Body/CastChassis/RecoveredYellowServiceArm").visible)
	assert(workshop.get_node("ExposedStationInfrastructure").get_child_count() > 30)
	workshop.visual.call("set_moving",true)
	await create_timer(0.18).timeout
	assert(float(workshop.visual.get("stride")) > 0.0)
	workshop.visual.call("set_moving",false)

	workshop.nearby = "Service case"
	workshop.interact()
	workshop.interact()
	assert(workshop.progression.cells == 1)
	workshop.nearby = "Auxiliary power"
	workshop.interact()
	assert(workshop.powered and workshop.progression.powered)

	# Recover the guaranteed recipe drops and the access card through the same
	# locker callbacks the in-game buttons use.
	for pair in [[0,"card"],[1,"motor"],[1,"plate"],[1,"wire"],[2,"gear"],[2,"wire"],[3,"plate"]]:
		workshop.take_part(pair[0],pair[1])
	workshop.nearby = "Broken claw"
	workshop.interact()
	assert(workshop.progression.claw_salvaged and not workshop.claw.visible)
	assert(workshop.visual.get_node("Body/CastChassis/RecoveredYellowServiceArm").visible)
	workshop.nearby = "ETNA terminal"
	workshop.interact()
	assert(workshop.mode == "terminal" and workshop.interface.visible)
	var password := LineEdit.new()
	password.text = "ETNA"
	workshop.authenticate(password)
	assert(workshop.progression.authenticated)
	workshop.export_spec()
	assert(workshop.progression.spec_released and workshop.shard.visible)
	workshop.nearby = "Specification shard"
	workshop.interact()
	assert(workshop.progression.spec_unlocked and not workshop.shard.visible)

	workshop.player.position = Vector3(-9,0,2.2)
	workshop.open_menu("bench")
	for type in workshop.progression.RECIPE:
		for i in range(workshop.progression.RECIPE[type]):
			workshop.load_part(type)
	assert(workshop.progression.can_fabricate(true))
	workshop.fabricate_probe()
	assert(workshop.progression.probe_crafted and not workshop.progression.probe_installed)
	workshop.place_probe()
	workshop.install_probe()
	assert(workshop.progression.probe_installed and workshop.probe_visual.visible)
	workshop.close_menu()
	workshop.nearby = "Maintenance exit"
	workshop.interact()
	assert(workshop.progression.door_open)
	workshop.interact()
	assert(workshop.progression.finished)
	print("Workshop scene progression passed end to end")
	workshop.queue_free()
	await process_frame
	quit()
