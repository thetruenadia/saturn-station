extends SceneTree

func _initialize() -> void:
	call_deferred("run_hall_tests")

func run_hall_tests() -> void:
	var hall = load("res://generator_hall.tscn").instantiate()
	root.add_child(hall)
	await process_frame
	assert(hall.player != null and hall.camera.current)
	assert(hall.isometric)
	var view_key := InputEventKey.new()
	view_key.pressed = true
	view_key.physical_keycode = KEY_V
	hall._unhandled_input(view_key)
	assert(not hall.isometric and hall.camera.projection == Camera3D.PROJECTION_PERSPECTIVE)
	hall._unhandled_input(view_key)
	assert(hall.isometric and hall.camera.projection == Camera3D.PROJECTION_ORTHOGONAL)
	assert(is_equal_approx(hall.floor_height(0, 17.7), 0.0))
	assert(is_equal_approx(hall.floor_height(-6.0, 8.0), 0.0))
	assert(is_equal_approx(hall.floor_height(-32.0, 8.0), 0.0))
	var previous := 0.0
	for step in 281:
		var z := 8.0 - float(step) * 0.1
		var height = hall.floor_height(-32.0, z, previous)
		assert(height != null, "Connected stair route has a gap at z=%s" % z)
		assert(absf(height - previous) < 0.055, "Stair height jumps at z=%s" % z)
		previous = height
	assert(is_equal_approx(previous, -9.0))
	assert(is_equal_approx(hall.floor_height(-34.0, -20.0, -9.0), -9.0))
	assert(hall.floor_height(0.0, 19.3) == null, "Platform should stop at its real edge")
	var mesh_count := 0
	for node in hall.find_children("*", "MeshInstance3D", true, false):
		mesh_count += 1
	assert(mesh_count > 250, "The hall should contain its large vessel and industrial dressing")
	hall.player.position = Vector3(-34.0, -9.0, -20.0)
	var interact := InputEventKey.new()
	interact.pressed = true
	interact.physical_keycode = KEY_E
	hall._unhandled_input(interact)
	assert(hall.ended and hall.ending.visible)
	assert(hall.dancer != null and hall.confetti_pieces.size() == 54)
	print("Generator 04 scene, connected stairs, isometric view, and ending passed")
	hall.queue_free()
	await process_frame
	quit()
