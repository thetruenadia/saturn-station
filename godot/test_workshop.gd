extends SceneTree

var workshop: Node

func approach_target(target_name: String) -> void:
	var point: Vector2 = workshop.targets[target_name]
	workshop.player.position = Vector3(point.x,0,point.y)
	workshop.nearby = target_name
	workshop.selected_target = ""
	workshop.move_target = Vector2.ZERO

func _initialize() -> void:
	call_deferred("run_workshop")

func run_workshop() -> void:
	workshop = load("res://workshop.tscn").instantiate()
	workshop.persistence_enabled = false
	root.add_child(workshop)
	await process_frame
	assert(workshop.player != null)
	assert(workshop.camera != null and workshop.camera.current)
	assert(workshop.pause_overlay != null and not workshop.pause_overlay.visible)
	assert(workshop.controls_hint.text.contains("WASD MOVE"))
	assert(workshop.hotbar_slots.size() == 5)
	assert(workshop.ambient_player.playing)
	assert((workshop.ambient_player.stream as AudioStreamWAV).loop_mode == AudioStreamWAV.LOOP_FORWARD)
	var atmosphere = workshop.infrastructure
	var work_lights: Array = atmosphere.get("work_fixture_lights")
	var emergency_lights: Array = atmosphere.get("emergency_lights")
	assert(work_lights.size() == 6 and emergency_lights.size() == 6)
	assert(not atmosphere.get("powered"))
	for light in work_lights:
		assert(is_zero_approx(light.light_energy))
	for light in emergency_lights:
		assert(light.light_energy > 0.0 and absf(light.position.x) > 13.0)
	var slow_start: float = workshop._advance_gait(0.1,true)
	var cruise_speed: float = workshop._advance_gait(0.5,true)
	var braking_speed: float = workshop._advance_gait(0.2,false)
	assert(slow_start > 0.0 and slow_start < 2.25)
	assert(cruise_speed > slow_start and cruise_speed < 2.25)
	assert(braking_speed > 0.0 and braking_speed < cruise_speed)
	workshop.gait_velocity = 1.0
	workshop._update_footstep_audio(0.6,true)
	assert(is_zero_approx(workshop.step_elapsed) and workshop.sound_player.stream is AudioStreamWAV)
	workshop._update_footstep_audio(0.1,false)
	assert(is_zero_approx(workshop.step_elapsed))
	workshop.gait_velocity = 0.0
	workshop.gait_weight = 0.0
	var desktop_inventory_layout: Dictionary = workshop._inventory_layout_for_width(1280.0)
	assert(desktop_inventory_layout["panel_width"] == 780.0 and desktop_inventory_layout["columns"] == 5)
	var mobile_inventory_layout: Dictionary = workshop._inventory_layout_for_width(320.0)
	assert(mobile_inventory_layout["panel_width"] == 288.0 and mobile_inventory_layout["columns"] == 3 and mobile_inventory_layout["stack_inspection"])
	workshop.player.position = Vector3(3.5,0,-2.25)
	workshop.visual.rotation.y = 1.1
	workshop.charge = 42.0
	workshop.yaw = 2.4
	workshop.pitch = 0.55
	workshop.zoom = 11.0
	workshop.isometric = false
	var saved_world: Dictionary = workshop._capture_world_state()
	workshop.player.position = Vector3.ZERO
	workshop.visual.rotation.y = 0.0
	workshop.charge = 60.0
	workshop.yaw = 0.8
	workshop.pitch = 0.72
	workshop.zoom = 15.0
	workshop.isometric = true
	workshop._restore_world_state(saved_world)
	assert(is_equal_approx(workshop.player.position.x,3.5) and is_equal_approx(workshop.player.position.z,-2.25))
	assert(is_equal_approx(workshop.charge,42.0) and is_equal_approx(workshop.visual.rotation.y,1.1))
	assert(is_equal_approx(workshop.yaw,2.4) and is_equal_approx(workshop.pitch,0.55) and is_equal_approx(workshop.zoom,11.0))
	assert(not workshop.isometric)
	workshop.player.position = Vector3.ZERO
	workshop.charge = 60.0
	workshop.yaw = PI / 4.0
	workshop.pitch = 0.72
	workshop.zoom = 15.0
	workshop.isometric = true
	workshop.update_camera()
	var saved_path: String = workshop.save_path
	var regression_path := "/private/tmp/saturn-station-godot-save-regression.cfg"
	if FileAccess.file_exists(regression_path):
		DirAccess.remove_absolute(regression_path)
	workshop.save_path = regression_path
	workshop.persistence_enabled = true
	workshop.player.position = Vector3(4.25,0,-3.5)
	workshop.visual.rotation.y = -0.7
	workshop.charge = 37.0
	workshop.yaw = 1.7
	workshop.pitch = 0.44
	workshop.zoom = 9.5
	workshop.isometric = false
	assert(workshop._save_progress() == OK)
	workshop.player.position = Vector3.ZERO
	workshop.visual.rotation.y = 0.0
	workshop.charge = 60.0
	workshop.yaw = PI/4.0
	workshop.pitch = 0.72
	workshop.zoom = 15.0
	workshop.isometric = true
	workshop._load_progress()
	assert(is_equal_approx(workshop.player.position.x,4.25) and is_equal_approx(workshop.player.position.z,-3.5))
	assert(is_equal_approx(workshop.charge,37.0) and is_equal_approx(workshop.visual.rotation.y,-0.7))
	assert(is_equal_approx(workshop.yaw,1.7) and is_equal_approx(workshop.pitch,0.44) and is_equal_approx(workshop.zoom,9.5))
	assert(not workshop.isometric)
	workshop.persistence_enabled = false
	workshop.save_path = saved_path
	DirAccess.remove_absolute(regression_path)
	workshop.player.position = Vector3.ZERO
	workshop.visual.rotation.y = 0.0
	workshop.charge = 60.0
	workshop.yaw = PI/4.0
	workshop.pitch = 0.72
	workshop.zoom = 15.0
	workshop.isometric = true
	workshop.update_camera()
	assert(workshop._interaction_hint("Service case") == "MANIPULATOR REQUIRED")
	assert(workshop._interaction_hint("Observation window") == "VIEW ENCELADUS")
	var pause_key := InputEventKey.new()
	pause_key.pressed = true
	pause_key.physical_keycode = KEY_ESCAPE
	workshop._unhandled_input(pause_key)
	assert(workshop.paused and workshop.pause_overlay.visible)
	workshop._refresh_pause_screen(true)
	assert(workshop.pause_content.find_child("MasterVolumeSlider",true,false) is HSlider)
	assert(workshop.pause_content.find_child("BrightnessSlider",true,false) is HSlider)
	assert(workshop.pause_content.find_child("SoundEnabledToggle",true,false) is CheckButton)
	workshop._set_brightness(1.25)
	assert(is_equal_approx(workshop.world_environment.environment.tonemap_exposure,1.25))
	workshop._set_sound_enabled(false)
	assert(not workshop.sound_enabled)
	workshop._set_sound_enabled(true)
	workshop.set_paused(false)
	assert(not workshop.paused and not workshop.pause_overlay.visible)
	var arm_screen_position: Vector2 = workshop.camera.unproject_position(Vector3(-7.2,0.85,3.0))
	var click_down := InputEventMouseButton.new()
	click_down.button_index = MOUSE_BUTTON_LEFT
	click_down.pressed = true
	click_down.position = arm_screen_position
	workshop._unhandled_input(click_down)
	var click_up := InputEventMouseButton.new()
	click_up.button_index = MOUSE_BUTTON_LEFT
	click_up.position = arm_screen_position
	workshop._unhandled_input(click_up)
	assert(workshop.selected_target == "Lock-service manipulator")
	workshop.interact()
	assert(workshop.move_target == Vector2(-7.2,3.0) and not workshop.progression.claw_salvaged)
	var arm_distance_before := Vector2(workshop.player.position.x,workshop.player.position.z).distance_to(workshop.move_target)
	workshop._physics_process(0.2)
	var arm_distance_after := Vector2(workshop.player.position.x,workshop.player.position.z).distance_to(Vector2(-7.2,3.0))
	assert(arm_distance_after < arm_distance_before)
	assert(workshop.player.position.x >= -12.5 and workshop.player.position.x <= 12.5)
	workshop.move_target = Vector2.ZERO
	workshop.selected_target = ""
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
	assert(workshop._current_directive().contains("RECOVER THE LOCK-SERVICE MANIPULATOR"))
	assert(not workshop.probe_visual.visible)
	assert(workshop.visual.get_node("Body/CastChassis/LowCastHull") != null)
	assert(not workshop.visual.get_node("Body/CastChassis/RecoveredYellowServiceArm").visible)
	assert(workshop.get_node("ExposedStationInfrastructure").get_child_count() > 30)
	assert(workshop.targets.has("Observation window"))
	assert(workshop.targets.has("Mara's cup") and workshop.targets.has("Sorted rejects"))
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
	assert(workshop.controls_hint.visible)
	approach_target("Observation window")
	workshop.interact()
	assert(workshop.observation_active and workshop.observation_prompt.visible)
	assert(not workshop.observation_prompt.text.contains("Enceladus"))
	var return_key := InputEventKey.new()
	return_key.pressed = true
	return_key.physical_keycode = KEY_E
	workshop._unhandled_input(return_key)
	assert(not workshop.observation_active)
	approach_target("Handwritten note")
	workshop.interact()
	assert(workshop.progression.note_taken and workshop.progression.inventory.get("note",0) == 1)
	assert(not workshop.note_visual.visible)
	assert(workshop.notice.visible and workshop.notice.text.contains("ETNA ACCESS NOTE"))
	workshop._refresh_hotbar()
	assert(workshop.hotbar_labels[0].text.contains("Note ×1"))
	workshop.select_hotbar_slot(0)
	assert(workshop.hotbar_selected == 0)
	assert(workshop.sound_player.stream is AudioStreamWAV)
	assert((workshop.sound_player.stream as AudioStreamWAV).data.size() > 0)
	workshop.open_menu("inventory")
	assert(workshop.menu.get_child_count() > 0)
	workshop.open_menu("note")
	assert(workshop.menu.get_child_count() > 0)
	workshop.close_menu()
	approach_target("Crew table")
	workshop.interact()
	assert(workshop.narration.visible and workshop.narration.text.contains("Two mugs"))
	approach_target("Mara's cup")
	workshop.interact()
	assert(workshop.narration.text.contains("watched the plumes"))
	approach_target("Unfinished handover")
	workshop.interact()
	assert(workshop.narration.text.contains("Claw still binding"))
	workshop.narration.hide()
	var robot_ankles: Array = workshop.visual.get("ankles")
	assert(robot_ankles.size() == 2)
	var ankle_before: Vector3 = robot_ankles[0].global_position
	workshop.visual.call("set_moving",true)
	workshop.visual.call("_process",0.18)
	assert(float(workshop.visual.get("stride")) > 0.0)
	var ankle_after: Vector3 = robot_ankles[0].global_position
	assert(ankle_after.distance_to(ankle_before) > 0.001)
	assert(is_finite(robot_ankles[0].rotation.x) and is_finite(robot_ankles[1].rotation.x))
	workshop.visual.call("set_moving",false)
	workshop.visual.call("_process",0.35)
	assert(float(workshop.visual.get("stride")) < 1.0)

	approach_target("Service case")
	workshop.interact()
	assert(not workshop.progression.case_open and workshop.message.contains("fitted manipulator"))
	approach_target("Auxiliary power")
	workshop.interact()
	assert(not workshop.powered and workshop.message.contains("stiff to move"))
	approach_target("Lock-service manipulator")
	workshop.interact()
	assert(workshop.arm_pickup_active and workshop.claw.visible)
	await create_timer(1.0).timeout
	assert(workshop.progression.manipulator_recovered and not workshop.progression.arm_equipped)
	assert(not workshop.claw.visible and not workshop.recovered_arm.visible)
	assert(workshop.progression.inventory.get("manipulator",0) == 1)
	workshop.open_menu("inventory")
	assert(workshop.menu.find_child("InventoryGrid",true,false) is GridContainer)
	workshop.select_inventory_item("manipulator")
	var item_preview = workshop.menu.find_child("ItemModelPreview",true,false)
	assert(item_preview is SubViewportContainer)
	assert(item_preview.find_child("RotatingItemModel",true,false).get_child_count() > 2)
	var item_inspection = workshop.menu.find_child("InventoryInspection",true,false)
	assert(item_inspection.get_child(0).text.contains("Heavy gripper"))
	workshop.refresh_menu(Vector2(320,640))
	assert(workshop.menu.find_child("InventoryGrid",true,false).columns == 3)
	assert(workshop.menu.find_child("InventoryInspectionRow",true,false) is VBoxContainer)
	assert(is_equal_approx(workshop.interface.size.x,288.0))
	workshop.refresh_menu(Vector2(1280,800))
	assert(workshop.menu.find_child("InventoryGrid",true,false).columns == 5)
	workshop.equip_or_stow_manipulator()
	assert(workshop.progression.arm_equipped and workshop.recovered_arm.visible)
	assert(workshop._interaction_hint("Service case") == "RELEASE SERVICE CASE")
	assert(workshop._hotbar_items().has("Manipulator ×1"))
	workshop.equip_or_stow_manipulator()
	assert(not workshop.progression.arm_equipped and not workshop.recovered_arm.visible)
	workshop.equip_or_stow_manipulator()
	assert(workshop.progression.arm_equipped and workshop.recovered_arm.visible)
	workshop.close_menu()
	approach_target("Service case")
	workshop.interact()
	assert(workshop._interaction_hint("Service case") == "RECOVER POWER CELL")
	workshop.interact()
	assert(workshop.progression.cells == 1)
	assert(workshop.notice.visible and workshop.notice.text.contains("POWER CELL"))
	approach_target("Auxiliary power")
	workshop.interact()
	assert(workshop.powered and workshop.progression.powered)
	assert(atmosphere.get("powered") and is_zero_approx(work_lights[0].light_energy))
	await create_timer(1.9).timeout
	for light in work_lights:
		assert(light.light_energy > 0.0)
	assert(workshop._current_directive().contains("ACCESS NOTE"))

	# Recover the guaranteed recipe drops and the access card through the same
	# locker callbacks the in-game buttons use.
	for pair in [[0,"card"],[1,"motor"],[1,"plate"],[1,"wire"],[2,"gear"],[2,"wire"],[3,"plate"]]:
		workshop.take_part(pair[0],pair[1])
	workshop.open_menu("card")
	assert(workshop.menu.find_child("WorkerPortrait",true,false) is TextureRect)
	workshop.close_menu()
	assert(workshop.progression.claw_salvaged and not workshop.claw.visible)
	assert(workshop.visual.get_node("Body/CastChassis/RecoveredYellowServiceArm").visible)
	approach_target("ETNA terminal")
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
	workshop.run_terminal_command("1")
	assert(workshop.message.contains("DOOR LINK ISOLATED"))
	workshop.progression.door_open = true
	workshop.exit_door.position.y = 4.8
	workshop.run_terminal_command("2")
	assert(not workshop.progression.door_open and is_equal_approx(workshop.exit_door.position.y,1.5))
	workshop.run_terminal_command("HELP")
	assert(workshop.message.contains("STATUS") and workshop.message.contains("SPEC"))
	workshop.select_terminal_section("files")
	workshop.refresh_menu()
	var archive_labels: Array[String] = []
	for child in workshop.menu.get_children():
		if child is Button:
			archive_labels.append(child.text)
	for archive_file in ["B7-STATION-STATUS.LOG", "SYSTEM STATUS", "STAFF-ACCESS-CARD.TXT", "STAFF DIRECTORY", "ACCESS-PROBE.SPEC", "GENERATOR 04 MAINTENANCE", "INCIDENT LOG"]:
		assert(archive_labels.has(archive_file))
	assert(workshop._terminal_file_text("ACCESS-PROBE.SPEC").contains("1 servo motor"))
	assert(workshop._terminal_file_text("STAFF-ACCESS-CARD.TXT").contains("ETNA"))
	assert(workshop._terminal_file_text("SYSTEM STATUS").contains("online"))
	assert(workshop._terminal_file_text("STAFF DIRECTORY").contains("MARA VENN"))
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
	approach_target("Specification shard")
	workshop.interact()
	assert(workshop.progression.spec_unlocked and not workshop.shard.visible)

	workshop.player.position = Vector3(-9,0,2.2)
	workshop.open_menu("bench")
	var tray = workshop.menu.find_child("FabricationTray",true,false)
	assert(tray is PanelContainer)
	for type in workshop.progression.RECIPE:
		for i in range(workshop.progression.RECIPE[type]):
			assert(tray._can_drop_data(Vector2.ZERO,{"part_type":type}))
			tray._drop_data(Vector2.ZERO,{"part_type":type})
			tray = workshop.menu.find_child("FabricationTray",true,false)
	assert(workshop.progression.can_fabricate(true))
	workshop.fabricate_probe()
	assert(workshop.progression.probe_crafted and not workshop.progression.probe_installed)
	var probe_socket = workshop.menu.find_child("MU1ProbeSocket",true,false)
	assert(probe_socket is PanelContainer)
	assert(probe_socket._can_drop_data(Vector2.ZERO,{"part_type":"access_probe"}))
	for child in workshop.menu.get_children():
		if child is Button:
			assert(not child.text.to_lower().contains("place probe"))
			assert(not child.text.to_lower().contains("confirm installation"))
	probe_socket._drop_data(Vector2.ZERO,{"part_type":"access_probe"})
	assert(workshop.progression.probe_installed and workshop.probe_visual.visible)
	workshop.close_menu()
	approach_target("Maintenance exit")
	workshop.interact()
	assert(workshop.progression.door_open)
	workshop.interact()
	assert(workshop.progression.finished and workshop.mode == "generator_hall")
	workshop.powered = true
	workshop.progression.powered = true
	workshop.open_menu("terminal")
	workshop.terminal_booted = true
	workshop.progression.authenticated = true
	workshop.run_terminal_command("3")
	assert(not workshop.powered and not workshop.progression.powered and workshop.mode == "")
	assert(not atmosphere.get("powered"))
	for light in work_lights:
		assert(is_zero_approx(light.light_energy))
	for light in emergency_lights:
		assert(light.light_energy > 0.5)
	workshop.charge = 0.0
	workshop._physics_process(0.01)
	assert(workshop.death_active and workshop.death_overlay.visible)
	assert(workshop.death_overlay.find_child("RebootUnitButton",true,false) is Button)
	workshop._unhandled_input(pause_key)
	assert(not workshop.paused and workshop.death_overlay.visible)
	print("Workshop scene progression through the Generator 04 doorway passed")
	workshop.queue_free()
	await process_frame
	quit()
