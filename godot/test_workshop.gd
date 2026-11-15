extends SceneTree

var workshop: Node

func _initialize() -> void:
	call_deferred("run_workshop")

func run_workshop() -> void:
	workshop = load("res://workshop.tscn").instantiate()
	workshop.persistence_enabled = false
	root.add_child(workshop)
	await process_frame
	assert(workshop.player != null)
	assert(workshop.camera != null and workshop.camera.current)
	var view_key := InputEventKey.new()
	view_key.pressed = true
	view_key.physical_keycode = KEY_V
	workshop._unhandled_input(view_key)
	workshop.update_camera()
	assert(workshop.camera.projection == Camera3D.PROJECTION_PERSPECTIVE)
	view_key.pressed = true
	workshop._unhandled_input(view_key)
	workshop.update_camera()
	assert(workshop.camera.projection == Camera3D.PROJECTION_ORTHOGONAL)
	assert(workshop.claw.visible)
	assert(workshop._current_directive().contains("RESTORE AUXILIARY POWER"))
	assert(not workshop.probe_visual.visible)
	assert(workshop.visual.get_node("Body/CastChassis/LowCastHull") != null)
	assert(not workshop.visual.get_node("Body/CastChassis/RecoveredYellowServiceArm").visible)
	assert(workshop.get_node("ExposedStationInfrastructure").get_child_count() > 30)
	assert(workshop.targets.has("Observation window"))
	assert(workshop.note_visual.visible)
	workshop.start_maker_opening()
	assert(workshop.opening_active and workshop.camera.projection == Camera3D.PROJECTION_PERSPECTIVE)
	workshop._begin_maker_timeline()
	workshop.opening_elapsed = 30.0
	workshop._update_maker_opening()
	assert(workshop.opening_finished and workshop.opening_button.visible)
	var skip_key := InputEventKey.new()
	skip_key.pressed = true
	skip_key.physical_keycode = KEY_Y
	workshop._unhandled_input(skip_key)
	assert(not workshop.opening_active and workshop.visual.visible)
	workshop.nearby = "Observation window"
	workshop.interact()
	assert(workshop.observation_active and workshop.observation_prompt.visible)
	assert(not workshop.observation_prompt.text.contains("Enceladus"))
	var return_key := InputEventKey.new()
	return_key.pressed = true
	return_key.physical_keycode = KEY_E
	workshop._unhandled_input(return_key)
	assert(not workshop.observation_active)
	workshop.nearby = "Handwritten note"
	workshop.interact()
	assert(workshop.progression.note_taken and workshop.progression.inventory.get("note",0) == 1)
	assert(not workshop.note_visual.visible)
	assert(workshop.notice.visible and workshop.notice.text.contains("ETNA ACCESS NOTE"))
	assert(workshop.sound_player.stream is AudioStreamWAV)
	assert((workshop.sound_player.stream as AudioStreamWAV).data.size() > 0)
	workshop.open_menu("inventory")
	assert(workshop.menu.get_child_count() > 0)
	workshop.open_menu("note")
	assert(workshop.menu.get_child_count() > 0)
	workshop.close_menu()
	workshop.nearby = "Crew table"
	workshop.interact()
	assert(workshop.narration.visible and workshop.narration.text.contains("Two mugs"))
	workshop.narration.hide()
	workshop.visual.call("set_moving",true)
	workshop.visual.call("_process",0.18)
	assert(float(workshop.visual.get("stride")) > 0.0)
	workshop.visual.call("set_moving",false)

	workshop.nearby = "Service case"
	workshop.interact()
	workshop.interact()
	assert(workshop.progression.cells == 1)
	assert(workshop.notice.visible and workshop.notice.text.contains("POWER CELL"))
	workshop.nearby = "Auxiliary power"
	workshop.interact()
	assert(workshop.powered and workshop.progression.powered)
	assert(workshop._current_directive().contains("ACCESS NOTE"))

	# Recover the guaranteed recipe drops and the access card through the same
	# locker callbacks the in-game buttons use.
	for pair in [[0,"card"],[1,"motor"],[1,"plate"],[1,"wire"],[2,"gear"],[2,"wire"],[3,"plate"]]:
		workshop.take_part(pair[0],pair[1])
	workshop.open_menu("card")
	assert(workshop.menu.find_child("WorkerPortrait",true,false) is TextureRect)
	workshop.close_menu()
	workshop.nearby = "Broken claw"
	workshop.interact()
	assert(workshop.progression.claw_salvaged and not workshop.claw.visible)
	assert(workshop.visual.get_node("Body/CastChassis/RecoveredYellowServiceArm").visible)
	workshop.nearby = "ETNA terminal"
	workshop.interact()
	assert(workshop.mode == "terminal" and workshop.interface.visible)
	assert(not workshop.terminal_booted)
	await create_timer(1.35).timeout
	assert(workshop.terminal_booted)
	var password := LineEdit.new()
	password.text = "ETNA"
	workshop.authenticate(password)
	assert(workshop.progression.authenticated)
	assert(workshop.terminal_section == "commands")
	workshop.run_terminal_command("HELP")
	assert(workshop.message.contains("STATUS") and workshop.message.contains("SPEC"))
	workshop.select_terminal_section("files")
	workshop.show_terminal_file("GENERATOR 04 MAINTENANCE")
	assert(workshop._terminal_file_text("GENERATOR 04 MAINTENANCE").contains("isolated"))
	workshop.select_terminal_section("record")
	var record := TextEdit.new()
	record.text = "Service bay recovered. Route to Generator 04."
	workshop.save_record_entry(record)
	assert(workshop.progression.record_entry.contains("Generator 04"))
	workshop.run_terminal_command("SPEC")
	assert(workshop.progression.spec_released and workshop.shard.visible)
	workshop.close_menu()
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
	assert(workshop.progression.finished and workshop.mode == "generator_hall")
	print("Workshop scene progression through the Generator 04 doorway passed")
	workshop.queue_free()
	await process_frame
	quit()
