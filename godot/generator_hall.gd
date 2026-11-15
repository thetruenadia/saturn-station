extends Node3D

signal return_to_workshop
signal demo_completed

const LEVEL_BASE := -23.0
const LEVEL_STEP := 14.0
const LEVELS := 6

var player: CharacterBody3D
var robot: Node3D
var camera: Camera3D
var status: Label
var location_card: PanelContainer
var ending: Control
var credits_panel: PanelContainer
var dancer: Node3D
var confetti_pieces: Array[ColorRect] = []
var return_door: MeshInstance3D
var end_door: MeshInstance3D
var isometric := true
var orbit := PI / 4.0
var elevation := 0.72
var zoom := 25.0
var dragging := false
var landing_height := 0.0
var elapsed := 0.0
var ended := false
var lamp: OmniLight3D

var iron: StandardMaterial3D
var rust: StandardMaterial3D
var paint: StandardMaterial3D
var brass: StandardMaterial3D
var dark: StandardMaterial3D
var hot: StandardMaterial3D

func _ready() -> void:
	_build_materials()
	_build_hall()
	_build_player()
	_build_hud()
	_update_camera()
	return_to_workshop.connect(func(): get_tree().change_scene_to_file("res://workshop.tscn"))

func _process(delta: float) -> void:
	elapsed += delta
	if lamp:
		lamp.light_energy = 2.0 + sin(elapsed * 0.7) * 0.12
	if dancer and ending and ending.visible:
		dancer.call("set_moving", true)
		dancer.rotation.y += delta * 2.8
		dancer.position.y = -0.38 + sin(elapsed * 5.0) * 0.08
	for i in confetti_pieces.size():
		var piece := confetti_pieces[i]
		piece.position.y = fposmod(piece.position.y + delta * (55.0 + float(i % 6) * 12.0), get_viewport().get_visible_rect().size.y + 24.0)
		piece.rotation += delta * (0.8 if i % 2 == 0 else -0.8)

func _physics_process(delta: float) -> void:
	if ended:
		return
	var direction := Vector3.ZERO
	if Input.is_physical_key_pressed(KEY_W) or Input.is_physical_key_pressed(KEY_UP):
		direction.z -= 1.0
	if Input.is_physical_key_pressed(KEY_S) or Input.is_physical_key_pressed(KEY_DOWN):
		direction.z += 1.0
	if Input.is_physical_key_pressed(KEY_A) or Input.is_physical_key_pressed(KEY_LEFT):
		direction.x -= 1.0
	if Input.is_physical_key_pressed(KEY_D) or Input.is_physical_key_pressed(KEY_RIGHT):
		direction.x += 1.0
	if not isometric:
		var rotated := direction.rotated(Vector3.UP, orbit)
		direction = rotated
	direction = direction.normalized()
	var delta_pos := direction * 2.8 * delta
	var current_floor: Variant = floor_height(player.position.x, player.position.z, landing_height)
	var next_x_floor: Variant = floor_height(player.position.x + delta_pos.x, player.position.z, float(current_floor))
	if next_x_floor != null:
		player.position.x += delta_pos.x
		landing_height = float(next_x_floor)
	var next_z_floor: Variant = floor_height(player.position.x, player.position.z + delta_pos.z, landing_height)
	if next_z_floor != null:
		player.position.z += delta_pos.z
		landing_height = float(next_z_floor)
	player.position.y = landing_height
	if direction.length_squared() > 0.001:
		robot.rotation.y = lerp_angle(robot.rotation.y, atan2(direction.x, direction.z), minf(delta * 8.0, 1.0))
	robot.call("set_moving", direction.length_squared() > 0.001)
	_update_camera()
	if status:
		status.text = "W A S D · WALK     DRAG · ORBIT     SCROLL · ZOOM     V · ISOMETRIC / FIRST PERSON     E · DOOR     R · RESET"
		if Vector2(player.position.x + 34.0, player.position.z + 20.0).length() < 2.6:
			status.text += "\nLOWER GALLERY · E END DEMO"
		elif player.position.z > 16.0 and absf(player.position.x) < 2.5:
			status.text += "\nE RETURN TO THE SERVICE BAY"

func _unhandled_input(event: InputEvent) -> void:
	if ended:
		return
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT or event.button_index == MOUSE_BUTTON_RIGHT:
			dragging = event.pressed
		if event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_UP:
			zoom = clampf(zoom - 1.5, 8.0, 42.0)
		if event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			zoom = clampf(zoom + 1.5, 8.0, 42.0)
	if event is InputEventMouseMotion and dragging:
		orbit -= event.relative.x * 0.006
		elevation = clampf(elevation + event.relative.y * 0.004, 0.28, 1.15)
		_update_camera()
	if event is InputEventKey and event.pressed and not event.echo:
		match event.physical_keycode:
			KEY_V, KEY_SECTION:
				isometric = not isometric
				_update_camera()
			KEY_R:
				orbit = PI / 4.0
				elevation = 0.72
				zoom = 25.0
				isometric = true
				_update_camera()
			KEY_E:
				if Vector2(player.position.x + 34.0, player.position.z + 20.0).length() < 2.6:
					show_ending()
				elif player.position.z > 16.0 and absf(player.position.x) < 2.5:
					return_to_workshop.emit()

func floor_height(x: float, z: float, current_height: float = NAN) -> Variant:
	var heights: Array[float] = []
	if ((x >= -5.8 and x <= 5.8 and z >= 4.6 and z <= 11.8) or (x >= -1.25 and x <= 1.25 and z >= 11.5 and z <= 19.2)):
		heights.append(0.0)
	if x >= -33.1 and x <= -5.7 and z >= 6.8 and z <= 9.2:
		heights.append(0.0)
	if x >= -33.1 and x <= -30.9 and z >= -20.1 and z <= 6.8:
		heights.append(-9.0 * (6.8 - z) / 26.8)
	if x >= -37.05 and x <= -30.7 and z >= -21.25 and z <= -19.9:
		heights.append(-9.0)
	for level in LEVELS:
		var y := LEVEL_BASE + float(level) * LEVEL_STEP
		if absf(x) >= 34.95 and absf(x) <= 37.05 and z >= -85.3 and z <= 21.3:
			heights.append(y)
		if x >= -37.05 and x <= 37.05 and z >= -86.1 and z <= -84.0:
			heights.append(y)
		if absf(x) >= 27.9 and absf(x) <= 37.05 and (absf(z + 43.0) <= 0.35 or absf(z + 10.0) <= 0.35):
			heights.append(y)
		var stair_x := 29.0 if level % 2 == 1 else 32.0
		if level < LEVELS - 1 and absf(absf(x) - stair_x) <= 0.9 and z >= -43.0 and z <= -10.0:
			var progress := (z + 43.0) / 33.0 if level % 2 == 1 else (-10.0 - z) / 33.0
			heights.append(y + LEVEL_STEP * progress)
	if heights.is_empty():
		return null
	if is_nan(current_height):
		return heights[0]
	var nearest := heights[0]
	for h in heights:
		if absf(h - current_height) < absf(nearest - current_height):
			nearest = h
	return nearest if absf(nearest - current_height) < 0.55 else null

func _build_materials() -> void:
	iron = _material("414b47", 0.26)
	rust = _material("624737", 0.12)
	paint = _material("6c7b70", 0.1)
	brass = _material("9b8450", 0.22)
	dark = _material("1b2526", 0.08)
	hot = _material("b37442", 0.18)
	hot.emission_enabled = true
	hot.emission = Color("ff6426")
	hot.emission_energy_multiplier = 1.4

func _material(color: String, metalness: float) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = Color(color)
	m.roughness = 0.94
	m.metallic = metalness
	return m

func _box(parent: Node3D, size: Vector3, position: Vector3, material: Material, solid := false) -> MeshInstance3D:
	var mesh := MeshInstance3D.new()
	var shape := BoxMesh.new()
	shape.size = size
	mesh.mesh = shape
	mesh.material_override = material
	mesh.position = position
	parent.add_child(mesh)
	if solid:
		var body := StaticBody3D.new()
		var collision := CollisionShape3D.new()
		var bounds := BoxShape3D.new()
		bounds.size = size
		collision.shape = bounds
		body.add_child(collision)
		mesh.add_child(body)
	return mesh

func _pipe(parent: Node3D, a: Vector3, b: Vector3, radius: float, material: Material) -> void:
	var direction := b - a
	if direction.length() < 0.01:
		return
	var mesh := MeshInstance3D.new()
	var cylinder := CylinderMesh.new()
	cylinder.top_radius = radius
	cylinder.bottom_radius = radius
	cylinder.height = direction.length()
	cylinder.radial_segments = 8
	mesh.mesh = cylinder
	mesh.material_override = material
	mesh.position = (a + b) * 0.5
	mesh.quaternion = Quaternion(Vector3.UP, direction.normalized())
	parent.add_child(mesh)

func _ring(parent: Node3D, radius: float, y: float, material: Material, centre := Vector3(4, 0, -37)) -> void:
	var mesh := MeshInstance3D.new()
	var torus := TorusMesh.new()
	torus.inner_radius = radius - 0.14
	torus.outer_radius = radius + 0.14
	torus.rings = 16
	torus.ring_segments = 48
	mesh.mesh = torus
	mesh.material_override = material
	mesh.position = centre + Vector3(0, y, 0)
	mesh.rotation.x = PI / 2.0
	parent.add_child(mesh)

func _deck(x: float, y: float, z: float, width: float, length: float) -> void:
	_box(self, Vector3(width, 0.22, length), Vector3(x, y - 0.11, z), iron, true)
	for zz in range(int(z - length * 0.5), int(z + length * 0.5), 2):
		_box(self, Vector3(width - 0.12, 0.025, 0.07), Vector3(x, y + 0.02, zz), brass)
	for edge_value in [-1.0, 1.0]:
		var edge: float = edge_value
		var ex := x + width * 0.5 * edge
		for zz in range(int(z - length * 0.5), int(z + length * 0.5), 4):
			_box(self, Vector3(0.08, 1.2, 0.08), Vector3(ex, y + 0.6, zz), iron)
		_pipe(self, Vector3(ex, y + 0.55, z - length * 0.5), Vector3(ex, y + 0.55, z + length * 0.5), 0.045, brass)
		_pipe(self, Vector3(ex, y + 1.2, z - length * 0.5), Vector3(ex, y + 1.2, z + length * 0.5), 0.045, brass)

func _stair_flight(a: Vector3, b: Vector3, width: float = 2.2) -> void:
	var steps := maxi(2, int(ceil(absf(b.y - a.y) / 0.22)))
	var dx := b.x - a.x
	var dz := b.z - a.z
	var length := Vector2(dx, dz).length()
	var angle := atan2(dx, dz)
	for i in steps:
		var t := (float(i) + 0.5) / float(steps)
		var stair := _box(self, Vector3(width, 0.13, length / float(steps) + 0.06), a.lerp(b, t) - Vector3(0, 0.065, 0), iron)
		stair.rotation.y = angle
	for side_value in [-1.0, 1.0]:
		var side: float = side_value
		var lateral := Vector3(cos(angle), 0, -sin(angle)) * width * 0.48 * side
		_pipe(self, a + lateral + Vector3(0, 1.25, 0), b + lateral + Vector3(0, 1.25, 0), 0.05, brass)

func _build_hall() -> void:
	var world := WorldEnvironment.new()
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color("10191b")
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color("a9aaa0")
	env.ambient_light_energy = 0.25
	env.fog_enabled = true
	env.fog_light_color = Color("152023")
	env.fog_density = 0.004
	world.environment = env
	add_child(world)
	var sky := DirectionalLight3D.new()
	sky.rotation_degrees = Vector3(-57, -35, 0)
	sky.light_color = Color("c3d5d1")
	sky.light_energy = 1.05
	add_child(sky)
	_box(self, Vector3(110, 1, 120), Vector3(0, -37, -32), dark)
	_box(self, Vector3(1.5, 100, 120), Vector3(-43, 10, -32), paint)
	_box(self, Vector3(1.5, 100, 120), Vector3(43, 10, -32), iron)
	_box(self, Vector3(87, 100, 1.5), Vector3(0, 10, -91), paint)
	for x in [-40.0, 40.0]:
		for z in range(-86, 21, 12):
			_box(self, Vector3(0.9, 90, 1), Vector3(x, 8, z), rust)
			for y in [-26.0, -11.0, 4.0, 19.0, 34.0]:
				_box(self, Vector3(1.1, 1.05, 12), Vector3(x, y, z + 5.5), iron)
				_pipe(self, Vector3(x, y - 6, z), Vector3(x, y + 6, z + 10), 0.16, iron)
	for level in LEVELS:
		var y := LEVEL_BASE + float(level) * LEVEL_STEP
		_deck(-36, y, -32, 3.4, 108)
		_deck(36, y, -32, 3.4, 108)
		_box(self, Vector3(75, 0.24, 3), Vector3(0, y, -85), iron)
		for side_value in [-1.0, 1.0]:
			var side: float = side_value
			var x: float = side * (29.0 if level % 2 == 1 else 32.0)
			var from_z: float = -43.0 if level % 2 == 1 else -10.0
			var to_z: float = -10.0 if level % 2 == 1 else -43.0
			_box(self, Vector3(10, 0.22, 3.2), Vector3(side * 32.0, y, from_z), iron)
			_box(self, Vector3(10, 0.22, 3.2), Vector3(side * 32.0, y + LEVEL_STEP, to_z), iron)
			_stair_flight(Vector3(x, y, from_z), Vector3(x, y + LEVEL_STEP, to_z))
	for z in [-80.0, -54.0, -28.0, 0.0, 21.0]:
		_box(self, Vector3(84, 1.2, 0.8), Vector3(0, 52, z), iron)
		for x in [-21.0, 0.0, 21.0]:
			_pipe(self, Vector3(x, 52, z), Vector3(x + 19, 57, z), 0.18, rust)
	_box(self, Vector3(86, 0.7, 118), Vector3(0, 58, -32), dark)
	_build_vessel()
	_build_landing()
	_build_equipment()

func _build_vessel() -> void:
	var vessel := Node3D.new()
	vessel.position = Vector3(4, 0, -37)
	add_child(vessel)
	_vessel_cylinder(vessel, 14.3, 12.2, 34, paint, -8)
	_vessel_cylinder(vessel, 12.2, 8.3, 13, iron, 15.5)
	_vessel_cylinder(vessel, 8.3, 8.3, 18, paint, 31)
	_vessel_cylinder(vessel, 8.3, 3.5, 9, iron, 44.5)
	for y in [-23.0, -17.0, -9.0, -1.0, 8.0, 13.0, 23.0, 30.0, 39.0]:
		_ring(vessel, 8.5 if y > 22.0 else 11.4 if y > 8.0 else 13.9, y, rust, Vector3.ZERO)
	for i in 24:
		var angle := float(i) * TAU / 24.0
		var radial := Vector3(sin(angle), 0, cos(angle))
		_box(vessel, Vector3(0.24, 28, 0.24), radial * 14.1 + Vector3(0, -8, 0), iron)
		for y in [-20.0, -8.0, 5.0]:
			_pipe(vessel, radial * 14.2 + Vector3(0, y, 0), radial * 14.2 + Vector3(0, y + 0.22, 0), 0.11, brass)
	for i in 8:
		var a := float(i) * TAU / 8.0
		_pipe(vessel, Vector3(sin(a) * 5, 47, cos(a) * 5), Vector3(sin(a) * 15, 49, cos(a) * 15), 1.25, iron)
		_pipe(vessel, Vector3(sin(a) * 15, 49, cos(a) * 15), Vector3(sin(a) * 23, 37, cos(a) * 23), 1.25, iron)
	for x in [-9.0, 9.0]:
		_pipe(vessel, Vector3(x, -31, 0), Vector3(x, -22, 6), 2.0, rust)
		_pipe(vessel, Vector3(x, -22, 6), Vector3(x, -14, 13), 2.0, rust)
	var throat := MeshInstance3D.new()
	var core := CylinderMesh.new()
	core.top_radius = 4.5
	core.bottom_radius = 4.5
	core.height = 1.1
	throat.mesh = core
	throat.material_override = dark
	throat.position = Vector3(0, -24.5, 0)
	vessel.add_child(throat)
	_ring(vessel, 4.1, -24.0, hot, Vector3.ZERO)
	lamp = OmniLight3D.new()
	lamp.light_color = Color("f5823f")
	lamp.light_energy = 2.2
	lamp.omni_range = 33
	lamp.position = Vector3(4, -19, -27)
	add_child(lamp)
	for i in 17:
		var a := float(i) * 0.37
		_pipe(self, Vector3(4 + sin(a) * 9, -28, -37 + cos(a) * 9), Vector3(sin(a) * 22, -32, -30 + cos(a) * 23), 0.18, dark)
	for x in [-22.0, 25.0]:
		_vessel_cylinder(self, 8.0, 6.0, 35.0, iron, 2.0, Vector3(x, 0, -75))
		_vessel_cylinder(self, 6.0, 3.0, 10.0, rust, 24.0, Vector3(x, 0, -75))
		for y in [-10.0, 0.0, 12.0]:
			_ring(self, 7.0, y, rust, Vector3(x, 0, -75))

func _vessel_cylinder(parent: Node3D, bottom: float, top: float, height: float, material: Material, center_y: float, center := Vector3.ZERO) -> void:
	var mesh := MeshInstance3D.new()
	var cylinder := CylinderMesh.new()
	cylinder.top_radius = top
	cylinder.bottom_radius = bottom
	cylinder.height = height
	cylinder.radial_segments = 40
	mesh.mesh = cylinder
	mesh.material_override = material
	mesh.position = center + Vector3(0, center_y, 0)
	parent.add_child(mesh)

func _build_landing() -> void:
	_deck(0, 0, 8, 13, 8)
	_box(self, Vector3(3.2, 0.25, 8), Vector3(0, -0.12, 16), paint, true)
	for x in [-6.3, 6.3]:
		for z in [5.0, 11.0, 18.0]:
			_box(self, Vector3(0.08, 1.25, 0.08), Vector3(x, 0.62, z), iron)
		_pipe(self, Vector3(x, 0.6, 4), Vector3(x, 0.6, 19), 0.05, brass)
		_pipe(self, Vector3(x, 1.25, 4), Vector3(x, 1.25, 19), 0.05, brass)
	for x in range(-6, -32, -2):
		_box(self, Vector3(2.1, 0.22, 2.4), Vector3(x, -0.11, 8), iron, true)
	_stair_flight(Vector3(-32, 0, 6.8), Vector3(-32, -9, -20), 2.5)
	_box(self, Vector3(6.4, 0.22, 3.4), Vector3(-34, -9.11, -20), iron, true)
	end_door = _box(self, Vector3(3.2, 4.5, 0.3), Vector3(-34, -6.75, -18.3), dark)
	for side in [-1.0, 1.0]:
		_box(self, Vector3(0.15, 4.7, 0.18), Vector3(-34.0 + side * 1.7, -6.7, -18.3), brass)
	_box(self, Vector3(3.5, 0.15, 0.18), Vector3(-34, -4.4, -18.3), brass)
	# A damaged section hangs below the continuous, usable stair flight.
	_pipe(self, Vector3(-32, -13, -20), Vector3(-29, -18, -28), 0.12, rust)
	_pipe(self, Vector3(-29, -18, -28), Vector3(-32, -23, -35), 0.12, rust)
	for x in [-6.0, 6.0]:
		_box(self, Vector3(0.18, 31, 0.18), Vector3(x, -16, 7), iron)

func _build_equipment() -> void:
	for x in [-35.0, 35.0, -22.0, 22.0]:
		for y in [-18.0, 2.0, 22.0]:
			var cabinet := _box(self, Vector3(3.0, 5.5, 1.2), Vector3(x, y, -21.5), paint)
			_box(cabinet, Vector3(2.7, 0.08, 0.12), Vector3(0, 1.2, 0.65), brass)
			for i in 4:
				var lamp_mesh := _box(cabinet, Vector3(0.24, 0.18, 0.12), Vector3(-0.9 + i * 0.6, 0.65, 0.65), hot if i == 0 else dark)
	for x in [-35.0, 35.0, -22.0, 22.0, 0.0]:
		_pipe(self, Vector3(x, 48, -70), Vector3(x, 38, -35), 0.22, rust)
		_pipe(self, Vector3(x, 38, -35), Vector3(x, 16, 6), 0.12, iron)
	_box(self, Vector3(2.7, 3.5, 0.25), Vector3(0, 1.75, 20), dark)
	for x in [-1.48, 1.48]:
		_box(self, Vector3(0.15, 3.5, 0.15), Vector3(x, 1.75, 19.9), brass)

func _build_player() -> void:
	player = CharacterBody3D.new()
	player.name = "MU1 Hall Player"
	add_child(player)
	player.position = Vector3(0, 0, 17.7)
	var body := CollisionShape3D.new()
	var capsule := CapsuleShape3D.new()
	capsule.radius = 0.38
	capsule.height = 1.6
	body.shape = capsule
	body.position.y = 0.8
	player.add_child(body)
	robot = preload("res://mu1_robot.tscn").instantiate()
	player.add_child(robot)
	robot.call("set_recovered_arm", true)
	robot.call("set_probe_installed", true)
	robot.scale = Vector3.ONE * 0.8
	camera = Camera3D.new()
	camera.current = true
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	add_child(camera)

func _build_hud() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	status = Label.new()
	layer.add_child(status)
	status.position = Vector2(24, 24)
	status.add_theme_font_size_override("font_size", 15)
	status.add_theme_color_override("font_color", Color("d5c69c"))
	var door_note := Label.new()
	door_note.text = "THE LOWER GALLERY DOOR ENDS THE DEMO"
	door_note.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	door_note.offset_bottom = -22
	door_note.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	door_note.add_theme_font_size_override("font_size", 14)
	door_note.add_theme_color_override("font_color", Color("9ea790"))
	layer.add_child(door_note)
	location_card = PanelContainer.new()
	location_card.set_anchors_and_offsets_preset(Control.PRESET_CENTER_TOP)
	location_card.position = Vector2(-170, 42)
	location_card.size = Vector2(340, 44)
	layer.add_child(location_card)
	var location := Label.new()
	location.text = "GENERATOR 04"
	location.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	location.add_theme_font_size_override("font_size", 24)
	location.add_theme_color_override("font_color", Color("d5c69c"))
	location_card.add_child(location)
	location_card.modulate.a = 0.0
	var fade := create_tween()
	fade.tween_property(location_card, "modulate:a", 1.0, 0.75)
	fade.tween_interval(3.7)
	fade.tween_property(location_card, "modulate:a", 0.0, 1.0)
	fade.tween_callback(location_card.queue_free)
	_build_ending(layer)

func _build_ending(layer: CanvasLayer) -> void:
	ending = Control.new()
	ending.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	layer.add_child(ending)
	ending.hide()
	var background := ColorRect.new()
	background.color = Color(0.015, 0.02, 0.02, 0.97)
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	ending.add_child(background)
	var random := RandomNumberGenerator.new()
	random.randomize()
	var screen := get_viewport().get_visible_rect().size
	for i in 54:
		var piece := ColorRect.new()
		piece.color = [Color("d7ad63"), Color("8caa91"), Color("a96b48"), Color("d7d0b2")][i % 4]
		piece.size = Vector2(4.0 + float(i % 3) * 2.0, 8.0 + float(i % 4) * 2.0)
		piece.position = Vector2(random.randf_range(0.0, screen.x), random.randf_range(0.0, screen.y))
		piece.rotation = random.randf_range(-0.7, 0.7)
		ending.add_child(piece)
		confetti_pieces.append(piece)
	var stack := VBoxContainer.new()
	stack.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	stack.position = Vector2(-190, -245)
	stack.size = Vector2(380, 490)
	stack.add_theme_constant_override("separation", 14)
	ending.add_child(stack)
	var icon := Label.new()
	icon.text = "MU-1"
	icon.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	icon.add_theme_font_size_override("font_size", 12)
	icon.add_theme_color_override("font_color", Color("b8c5a7"))
	stack.add_child(icon)
	var icon_frame := SubViewportContainer.new()
	icon_frame.custom_minimum_size = Vector2(150, 150)
	icon_frame.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	stack.add_child(icon_frame)
	var icon_viewport := SubViewport.new()
	icon_viewport.size = Vector2i(180, 180)
	icon_viewport.transparent_bg = true
	icon_viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	icon_frame.add_child(icon_viewport)
	var icon_world := Node3D.new()
	icon_viewport.add_child(icon_world)
	var icon_light := DirectionalLight3D.new()
	icon_light.rotation_degrees = Vector3(-35, -30, 0)
	icon_light.light_energy = 1.4
	icon_world.add_child(icon_light)
	dancer = preload("res://mu1_robot.tscn").instantiate()
	dancer.scale = Vector3.ONE * 0.48
	dancer.position.y = -0.38
	dancer.call("set_moving", true)
	icon_world.add_child(dancer)
	var icon_camera := Camera3D.new()
	icon_world.add_child(icon_camera)
	icon_camera.position = Vector3(1.8, 1.3, 3.8)
	icon_camera.look_at(Vector3(0, 0.1, 0))
	icon_camera.fov = 45
	icon_camera.current = true
	var title := Label.new()
	title.text = "CONGRATULATIONS"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 34)
	title.add_theme_color_override("font_color", Color("dfcf9e"))
	stack.add_child(title)
	var subtitle := Label.new()
	subtitle.text = "GENERATOR 04 REACHED · ROUTE LOGGED"
	subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	subtitle.add_theme_font_size_override("font_size", 14)
	subtitle.add_theme_color_override("font_color", Color("9ea790"))
	stack.add_child(subtitle)
	var restart := Button.new()
	restart.text = "RESTART DEMO"
	restart.pressed.connect(_restart_demo)
	stack.add_child(restart)
	var credits := Button.new()
	credits.text = "SEE CREDITS"
	credits.pressed.connect(_show_credits)
	stack.add_child(credits)
	var menu := Button.new()
	menu.text = "MAIN MENU"
	menu.pressed.connect(func(): get_tree().change_scene_to_file("res://main_menu.tscn"))
	stack.add_child(menu)
	credits_panel = PanelContainer.new()
	credits_panel.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	credits_panel.position = Vector2(-250, -150)
	credits_panel.size = Vector2(500, 300)
	credits_panel.hide()
	ending.add_child(credits_panel)
	var credits_text := VBoxContainer.new()
	credits_panel.add_child(credits_text)
	var heading := Label.new()
	heading.text = "SATURN STATION · CREDITS"
	heading.add_theme_font_size_override("font_size", 22)
	credits_text.add_child(heading)
	var credit_lines := Label.new()
	credit_lines.text = "A small, strange place among the rings.\n\nDesign, writing and world: Thetruenadia\nNative Godot port: Saturn Station contributors\n\nThank you for helping keep the station alive."
	credit_lines.add_theme_font_size_override("font_size", 16)
	credit_lines.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	credits_text.add_child(credit_lines)
	var back := Button.new()
	back.text = "BACK"
	back.pressed.connect(func(): credits_panel.hide())
	credits_text.add_child(back)

func _show_credits() -> void:
	credits_panel.show()

func _restart_demo() -> void:
	var save_path := ProjectSettings.globalize_path("user://saturn-station.save")
	if FileAccess.file_exists(save_path):
		DirAccess.remove_absolute(save_path)
	get_tree().change_scene_to_file("res://workshop.tscn")

func show_ending() -> void:
	if ended:
		return
	ended = true
	ending.show()
	credits_panel.hide()
	dancer.call("set_moving", true)

func _update_camera() -> void:
	if not player or not camera:
		return
	if isometric:
		camera.projection = Camera3D.PROJECTION_ORTHOGONAL
		camera.size = zoom
		var offset := Vector3(sin(orbit) * cos(elevation), sin(elevation), cos(orbit) * cos(elevation)) * zoom
		camera.position = player.position + Vector3(0, 1.0, 0) + offset
	else:
		camera.projection = Camera3D.PROJECTION_PERSPECTIVE
		camera.fov = 65
		camera.position = player.position + Vector3(0, 1.45, 0)
		camera.look_at(camera.position + Vector3(-sin(orbit), 0.0, -cos(orbit)))
