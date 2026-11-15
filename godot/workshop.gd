extends Node3D
# First native greybox: room-layout.js coordinates, prototype-3d.js palette and controls.
var player: CharacterBody3D
var visual: Node3D
var camera: Camera3D
var hud: Label
var prompt: Label
var power_lamp: MeshInstance3D
var amber_light: OmniLight3D
var yaw := PI / 4.0
var pitch := 0.72
var zoom := 15.0
var charge := 60.0
var powered := false
var paused := false
var inventory_open := false
var near_generator := false
var progression = preload("res://progression.gd").new()
var interface: PanelContainer
var menu: VBoxContainer
var mode := ""
var nearby := ""
var targets: Dictionary = {}
var shard: MeshInstance3D
var claw: MeshInstance3D
var note_visual: MeshInstance3D
var exit_door: MeshInstance3D
var probe_visual: Node3D
var message := ""
var dragging := false
var isometric := true
var terminal_booted := false
var terminal_section := "commands"
var terminal_file := ""
var observation_active := false
var observation_prompt: Label
var narration: Label
var directive: Label
var notice: Label
var notice_tween: Tween
var opening_active := false
var opening_started := false
var opening_elapsed := 0.0
var opening_finished := false
var opening_maker: Node3D
var opening_torso: Node3D
var opening_head: Node3D
var opening_arms: Array[Node3D] = []
var opening_legs: Array[Node3D] = []
var opening_black: ColorRect
var opening_caption: Label
var opening_button: Button
var opening_layer: CanvasLayer
var persistence_enabled := true
const SAVE_PATH := "user://saturn-station.save"
var room := [
	["Service case", -5.0, 2.0, 1.0, 0.73],
	["Auxiliary power", -10.8, -8.5, 1.15, 0.55],
	["ETNA terminal", 5.0, -5.5, 1.1, 0.6],
	["Maintenance arm", -9.0, 2.2, 1.05, 0.9],
	["Turbine", -11.0, -2.0, 1.05, 0.9],
	["Press", -11.4, 1.8, 0.95, 0.85],
	["Engine", -11.0, -5.7, 0.9, 0.8],
	["Exchanger", -5.5, -9.2, 4.3, 0.9],
	["Crew table", 8.3, -5.0, 0.7, 0.4],
	["Window shelf", 2.1, -9.0, 1.0, 0.35],
	["Seat", 7.5, -8.9, 0.4, 0.4],
	["Helmet stand", 11.2, -2.1, 0.35, 0.3]
]

func material(hex: String, emission := false) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = Color(hex)
	m.roughness = 0.88
	m.metallic = 0.15
	if emission:
		m.emission_enabled = true
		m.emission = Color(hex)
	return m

func block(parent: Node3D, pos: Vector3, size: Vector3, hex: String, solid := false) -> MeshInstance3D:
	var mesh := MeshInstance3D.new()
	var shape := BoxMesh.new()
	shape.size = size
	mesh.mesh = shape
	mesh.material_override = material(hex)
	parent.add_child(mesh)
	mesh.position = pos
	if solid:
		var body := StaticBody3D.new()
		var collision := CollisionShape3D.new()
		var box_shape := BoxShape3D.new()
		box_shape.size = size
		collision.shape = box_shape
		body.add_child(collision)
		mesh.add_child(body)
	return mesh

func _ready() -> void:
	var preferences := ConfigFile.new()
	if preferences.load("user://saturn-station-prefs.cfg") == OK:
		isometric = bool(preferences.get_value("view", "isometric", true))
	var env := WorldEnvironment.new()
	var atmosphere := Environment.new()
	atmosphere.background_mode = Environment.BG_COLOR
	atmosphere.background_color = Color("242923")
	atmosphere.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	atmosphere.ambient_light_color = Color("c9c4aa")
	atmosphere.ambient_light_energy = 0.65
	env.environment = atmosphere
	add_child(env)
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-55, -35, 0)
	sun.light_color = Color("f1d9b1")
	sun.light_energy = 1.2
	sun.shadow_enabled = true
	add_child(sun)
	amber_light = OmniLight3D.new()
	add_child(amber_light)
	amber_light.position = Vector3(4, 4, -3)
	amber_light.light_color = Color("c87937")
	amber_light.omni_range = 15
	amber_light.light_energy = 1.8
	block(self, Vector3(0,-0.2,0), Vector3(28,0.35,22), "555346", true)
	block(self, Vector3(-14,3,-0), Vector3(0.55,6,22), "171f1d", true)
	block(self, Vector3(-7.15,3,-11), Vector3(13.7,6,0.55), "171f1d", true)
	block(self, Vector3(7.1,3,-11), Vector3(5.2,6,0.55), "171f1d", true)
	block(self, Vector3(2.1,5.3,-11), Vector3(4.8,1.4,0.55), "171f1d", true)
	block(self, Vector3(2.1,0.65,-11), Vector3(4.8,1.3,0.55), "171f1d", true)
	_build_observation_port()
	block(self, Vector3(13.8,3,-11), Vector3(0.4,6,0.55), "171f1d", true)
	exit_door = block(self, Vector3(11.4,1.5,-10.6), Vector3(3.8,3,0.4), "88876a", true)
	for x in range(-12,13,4):
		block(self, Vector3(x,0.4,10.9), Vector3(0.38,0.85,0.38), "4a4a38")
	for z in range(-9,10,4):
		block(self, Vector3(13.9,0.4,z), Vector3(0.38,0.85,0.38), "4a4a38")
	for x in range(-12,13,2):
		block(self, Vector3(x,0.0,0), Vector3(0.025,0.025,20), "35382f")
	for z in range(-10,11,2):
		block(self, Vector3(0,0.0,z), Vector3(26,0.025,0.025), "35382f")
	var infrastructure := preload("res://workshop_atmosphere.tscn").instantiate()
	infrastructure.name = "ExposedStationInfrastructure"
	add_child(infrastructure)
	for item in room:
		var station := Node3D.new()
		add_child(station)
		station.position = Vector3(item[1],0,item[2])
		block(station, Vector3(0,0.5,0), Vector3(item[3]*2,1,item[4]*2), "505a53", true)
		block(station, Vector3(0,1.06,0), Vector3(item[3]*1.8,0.12,item[4]*1.8), "a3987b")
		var sign := Label3D.new()
		sign.text = item[0]
		sign.font_size = 42
		sign.pixel_size = 0.009
		sign.billboard = BaseMaterial3D.BILLBOARD_ENABLED
		station.add_child(sign)
		sign.position.y = 1.6
		if item[0] == "Auxiliary power":
			power_lamp = block(station, Vector3(0,1.3,0.45), Vector3(0.5,0.25,0.1), "70412a")
	for n in range(4):
		block(self, Vector3(-13.4,2.2+n*0.25,0), Vector3(0.13,0.13,20), "655347")
	player = CharacterBody3D.new()
	add_child(player)
	player.position = Vector3(-9,0,6)
	var collider := CollisionShape3D.new()
	var capsule := CapsuleShape3D.new()
	capsule.radius = 0.42
	capsule.height = 2.0
	collider.shape = capsule
	collider.position.y = 1
	player.add_child(collider)
	visual = preload("res://mu1_robot.tscn").instantiate()
	player.add_child(visual)
	camera = Camera3D.new()
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.current = true
	add_child(camera)
	var layer := CanvasLayer.new()
	layer.name = "WorkshopHUD"
	add_child(layer)
	hud = Label.new()
	layer.add_child(hud)
	hud.position = Vector2(24,20)
	hud.add_theme_font_size_override("font_size",20)
	prompt = Label.new()
	layer.add_child(prompt)
	prompt.position = Vector2(24,110)
	prompt.add_theme_font_size_override("font_size",17)
	directive = Label.new()
	layer.add_child(directive)
	directive.set_anchors_and_offsets_preset(Control.PRESET_CENTER_TOP)
	directive.position = Vector2(-390, 20)
	directive.size = Vector2(780, 38)
	directive.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	directive.add_theme_font_size_override("font_size", 19)
	directive.add_theme_color_override("font_color", Color("e3c985"))
	directive.add_theme_color_override("font_shadow_color", Color(0,0,0,0.8))
	directive.add_theme_constant_override("shadow_offset_x", 2)
	directive.add_theme_constant_override("shadow_offset_y", 2)
	notice = Label.new()
	layer.add_child(notice)
	notice.set_anchors_and_offsets_preset(Control.PRESET_CENTER_BOTTOM)
	notice.position = Vector2(-300,-110)
	notice.size = Vector2(600,42)
	notice.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	notice.add_theme_font_size_override("font_size",21)
	notice.add_theme_color_override("font_color",Color("f0d496"))
	notice.hide()
	narration = Label.new()
	layer.add_child(narration)
	narration.set_anchors_and_offsets_preset(Control.PRESET_CENTER_TOP)
	narration.position = Vector2(-360, 84)
	narration.size = Vector2(720, 72)
	narration.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	narration.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	narration.add_theme_font_size_override("font_size", 20)
	narration.add_theme_color_override("font_color", Color("dfcf9e"))
	narration.hide()
	observation_prompt = Label.new()
	layer.add_child(observation_prompt)
	observation_prompt.text = "E / ESC  ·  RETURN TO STATION"
	observation_prompt.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	observation_prompt.offset_bottom = -30
	observation_prompt.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	observation_prompt.add_theme_font_size_override("font_size", 15)
	observation_prompt.add_theme_color_override("font_color", Color("d6d2bf"))
	observation_prompt.hide()
	setup_progression(layer)
	if persistence_enabled:
		_load_progress()
	update_camera()
	if get_tree().has_meta("start_maker_opening") and bool(get_tree().get_meta("start_maker_opening")):
		get_tree().remove_meta("start_maker_opening")
		call_deferred("start_maker_opening")

func _process(delta: float) -> void:
	if not opening_active:
		return
	if opening_started and not opening_finished:
		opening_elapsed = minf(opening_elapsed + delta, 30.0)
		_update_maker_opening()

func update_camera() -> void:
	if observation_active:
		return
	var focus := player.position + Vector3(0,1.3,0)
	if isometric:
		camera.projection = Camera3D.PROJECTION_ORTHOGONAL
		camera.size = zoom
		var offset := Vector3(sin(yaw)*cos(pitch),sin(pitch),cos(yaw)*cos(pitch))*20.0
		camera.position = focus + offset
		camera.look_at(focus)
	else:
		camera.projection = Camera3D.PROJECTION_PERSPECTIVE
		camera.fov = 65.0
		camera.position = player.position + Vector3(0,1.55,0)
		var look_direction := Vector3(-sin(yaw)*cos(pitch),sin(pitch),-cos(yaw)*cos(pitch))
		camera.look_at(camera.position + look_direction)

func _opening_box(parent: Node3D, position: Vector3, size: Vector3, color: String) -> MeshInstance3D:
	var mesh := MeshInstance3D.new()
	var shape := BoxMesh.new()
	shape.size = size
	mesh.mesh = shape
	mesh.material_override = material(color)
	mesh.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
	parent.add_child(mesh)
	mesh.position = position
	return mesh

func start_maker_opening() -> void:
	if opening_active:
		return
	opening_active = true
	opening_started = false
	opening_finished = false
	opening_elapsed = 0.0
	paused = true
	player.velocity = Vector3.ZERO
	visual.hide()
	var original_projection := camera.projection
	camera.projection = Camera3D.PROJECTION_PERSPECTIVE
	camera.fov = 66.0
	camera.position = player.position + Vector3(0, 0.92, 0)
	camera.look_at(Vector3(2, 1.35, -3.5))
	camera.rotate_z(-0.075)
	opening_maker = Node3D.new()
	opening_maker.name = "MakerOpeningCharacter"
	add_child(opening_maker)
	opening_maker.position = Vector3(-7.6, 0, 4.8)
	opening_torso = Node3D.new()
	opening_maker.add_child(opening_torso)
	_opening_box(opening_torso, Vector3(0,1.2,0), Vector3(0.7,0.85,0.42), "c4b895")
	_opening_box(opening_torso, Vector3(0,0.91,0), Vector3(0.73,0.1,0.46), "9a5838")
	_opening_box(opening_torso, Vector3(0,1.68,0), Vector3(0.5,0.17,0.51), "9a5838")
	opening_head = Node3D.new()
	opening_head.position.y = 1.9
	opening_torso.add_child(opening_head)
	_opening_box(opening_head, Vector3(0,0,0.03), Vector3(0.38,0.4,0.35), "b89172")
	_opening_box(opening_head, Vector3(0,0.22,0), Vector3(0.58,0.29,0.54), "c4b895")
	_opening_box(opening_head, Vector3(0,0.12,0.02), Vector3(0.65,0.08,0.62), "9a5838")
	_opening_box(opening_head, Vector3(0,0.12,0.22), Vector3(0.39,0.12,0.08), "302e29")
	for side in [-1.0, 1.0]:
		var arm := Node3D.new()
		arm.position = Vector3(side*0.43,1.52,0)
		opening_torso.add_child(arm)
		_opening_box(arm, Vector3(0,-0.25,0), Vector3(0.24,0.57,0.26), "c4b895")
		_opening_box(arm, Vector3(0,-0.6,0.03), Vector3(0.22,0.22,0.24), "302e29")
		opening_arms.append(arm)
		var leg := Node3D.new()
		leg.position = Vector3(side*0.21,0.83,0)
		opening_maker.add_child(leg)
		_opening_box(leg, Vector3(0,-0.29,0), Vector3(0.27,0.66,0.29), "302e29")
		_opening_box(leg, Vector3(0,-0.74,0.1), Vector3(0.32,0.2,0.52), "9a5838")
		opening_legs.append(leg)
	var layer := get_node_or_null("WorkshopHUD") as CanvasLayer
	if layer:
		hud.hide()
		prompt.hide()
		directive.hide()
	opening_layer = CanvasLayer.new()
	opening_layer.layer = 8
	add_child(opening_layer)
	opening_black = ColorRect.new()
	opening_black.color = Color(0,0,0,1)
	opening_black.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	opening_layer.add_child(opening_black)
	opening_caption = Label.new()
	opening_caption.set_anchors_and_offsets_preset(Control.PRESET_CENTER_TOP)
	opening_caption.position = Vector2(-460,90)
	opening_caption.size = Vector2(920,75)
	opening_caption.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	opening_caption.add_theme_font_size_override("font_size",22)
	opening_caption.add_theme_color_override("font_color",Color("d6cfb8"))
	opening_layer.add_child(opening_caption)
	opening_button = Button.new()
	opening_button.text = "BEGIN BOOT SEQUENCE"
	opening_button.set_anchors_and_offsets_preset(Control.PRESET_CENTER_BOTTOM)
	opening_button.position = Vector2(-145,-95)
	opening_button.size = Vector2(290,52)
	opening_button.pressed.connect(_begin_maker_timeline)
	opening_layer.add_child(opening_button)
	var skip := Button.new()
	skip.text = "Y  ·  SKIP CUTSCENE"
	skip.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_RIGHT)
	skip.position = Vector2(-220,-38)
	skip.size = Vector2(200,32)
	skip.pressed.connect(_finish_maker_opening)
	opening_layer.add_child(skip)
	opening_caption.text = "MAINTENANCE UNIT  //  MOTOR CONTROL OFFLINE"
	if original_projection == Camera3D.PROJECTION_ORTHOGONAL:
		camera.fov = 66.0

func _begin_maker_timeline() -> void:
	if opening_started:
		_finish_maker_opening()
		return
	opening_started = true
	opening_button.hide()
	opening_elapsed = 0.0

func _opening_fade(time: float) -> float:
	var keys := [[0.0,1.0],[1.2,1.0],[1.65,0.0],[2.2,0.0],[2.4,1.0],[3.2,1.0],[3.7,0.0],[5.8,0.0],[6.0,1.0],[6.5,1.0],[6.85,0.0],[8.8,0.0],[9.0,1.0],[9.35,1.0],[9.7,0.0],[25.8,0.0],[26.8,0.85],[27.2,0.2],[28.5,1.0],[30.0,1.0]]
	for i in range(1,keys.size()):
		if time <= float(keys[i][0]):
			var from: Array = keys[i-1]
			var to: Array = keys[i]
			var blend := clampf((time-float(from[0]))/(float(to[0])-float(from[0])),0.0,1.0)
			return lerpf(float(from[1]),float(to[1]),blend)
	return 1.0

func _update_maker_opening() -> void:
	var time := opening_elapsed
	var route := [Vector3(-7.6,0,4.8),Vector3(-3.5,0,5.3),Vector3(2,0,1),Vector3(2,0,-6.8),Vector3(4,0,-7.2),Vector3(9,0,-7.4),Vector3(11.4,0,-9.3),Vector3(11.4,0,-14.5)]
	var movement := clampf((time-19.0)/5.5,0.0,1.0)
	var total := 0.0
	var lengths: Array[float] = []
	for i in range(route.size()-1):
		var length: float = route[i].distance_to(route[i+1])
		lengths.append(length)
		total += length
	var remaining := movement * total
	var segment := 0
	while segment < lengths.size()-1 and remaining > lengths[segment]:
		remaining -= lengths[segment]
		segment += 1
	var segment_length: float = lengths[segment]
	var along := clampf(remaining/segment_length,0.0,1.0)
	opening_maker.position = route[segment].lerp(route[segment+1],along)
	opening_maker.rotation.y = atan2(route[segment+1].x-route[segment].x,route[segment+1].z-route[segment].z)
	var crouch := 1.0 - clampf((time-17.0)/2.0,0.0,1.0)
	opening_maker.position.y = -0.48*crouch
	opening_torso.rotation.x = 0.3*crouch
	opening_head.rotation.x = 0.22 if time < 11.0 else (-0.12 if time < 13.0 else 0.0)
	var running := time >= 19.0 and time < 24.5
	for i in opening_arms.size():
		var arm: Node3D = opening_arms[i]
		arm.rotation.x = -1.1 + sin(time*7.0+float(i))*0.12 if time < 13.0 else (sin(time*12.0+float(i)*PI)*0.85 if running else 0.0)
	for i in opening_legs.size():
		var leg: Node3D = opening_legs[i]
		leg.rotation.x = sin(time*12.0+float(i)*PI)*0.85 if running else -0.7*crouch
	opening_maker.visible = time < 24.5
	var door_fraction := 1.0-clampf((time-24.8)/1.4,0.0,1.0)
	exit_door.position.y = lerpf(1.5,4.8,1.0-door_fraction)
	opening_black.color.a = _opening_fade(time)
	if time < 11.0:
		opening_caption.text = "[MECHANICAL TINKERING]"
	elif time < 13.0:
		opening_caption.text = "OPTICAL SENSOR  //  ACTIVE"
	elif time < 17.0:
		opening_caption.text = "[DISTANT METALLIC IMPACTS]"
	elif time < 19.0:
		opening_caption.text = "MOTOR CONTROL  //  RESTORED"
	elif time < 24.5:
		opening_caption.text = "MU-1  //  DEPARTURE"
	elif time < 26.2:
		opening_caption.text = "[AUTOMATIC BULKHEAD CLOSING]"
	else:
		opening_caption.text = "OPTICAL SIGNAL LOST"
	if time >= 30.0 and not opening_finished:
		opening_finished = true
		opening_caption.text = "MU-1  //  INITIALISING"
		opening_button.text = "REBOOT  ·  ENTER WORKSHOP"
		opening_button.show()

func _finish_maker_opening() -> void:
	if not opening_active:
		return
	opening_active = false
	paused = false
	exit_door.position.y = 1.5
	if opening_layer:
		opening_layer.queue_free()
	if opening_maker:
		opening_maker.queue_free()
	visual.show()
	var layer := get_node_or_null("WorkshopHUD") as CanvasLayer
	if layer:
		hud.show()
		prompt.show()
		directive.show()
	update_camera()

func _build_observation_port() -> void:
	for x in [ -2.35, 2.35 ]:
		block(self, Vector3(2.1 + x, 3.0, -10.62), Vector3(0.16, 4.2, 0.2), "60695f")
	for y in [0.95, 5.05]:
		block(self, Vector3(2.1, y, -10.62), Vector3(4.85, 0.16, 0.2), "60695f")
	var glass := MeshInstance3D.new()
	var glass_shape := BoxMesh.new()
	glass_shape.size = Vector3(4.55, 3.9, 0.1)
	glass.mesh = glass_shape
	var pane := StandardMaterial3D.new()
	pane.albedo_color = Color(0.12, 0.28, 0.31, 0.32)
	pane.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	pane.emission_enabled = true
	pane.emission = Color("132b30")
	pane.emission_energy_multiplier = 0.2
	pane.roughness = 0.25
	glass.material_override = pane
	glass.position = Vector3(2.1, 3.0, -10.8)
	add_child(glass)
	var moon := MeshInstance3D.new()
	var globe := SphereMesh.new()
	globe.radius = 2.45
	globe.height = 4.9
	globe.radial_segments = 40
	globe.rings = 24
	moon.mesh = globe
	moon.position = Vector3(2.1, 3.0, -18.2)
	moon.material_override = material("a8b2af")
	add_child(moon)
	for i in 9:
		var mark := MeshInstance3D.new()
		var crater := SphereMesh.new()
		crater.radius = 0.12 + float(i % 3) * 0.07
		crater.height = crater.radius * 2.0
		mark.mesh = crater
		mark.material_override = material("8e9a98")
		var angle := float(i) * TAU / 9.0
		mark.position = Vector3(2.1 + sin(angle) * 1.55, 3.0 + cos(angle) * 1.35, -20.35)
		add_child(mark)
	var plume_material := material("c4d6d1", true)
	for x in [-0.36, 0.18, 0.7]:
		var plume := MeshInstance3D.new()
		var plume_shape := CylinderMesh.new()
		plume_shape.top_radius = 0.025
		plume_shape.bottom_radius = 0.16
		plume_shape.height = 3.2 + absf(x) * 1.4
		plume.mesh = plume_shape
		plume.material_override = plume_material
		plume.position = Vector3(2.1 + x, 5.8, -18.2)
		add_child(plume)
	for i in 34:
		var star := MeshInstance3D.new()
		var dot := SphereMesh.new()
		dot.radius = 0.025 + float(i % 3) * 0.012
		dot.height = dot.radius * 2.0
		star.mesh = dot
		star.material_override = material("d0d1b9", true)
		star.position = Vector3(-11.0 + float((i * 13) % 29) * 0.94, 0.4 + float((i * 7) % 11) * 0.57, -28.0)
		add_child(star)

func begin_observation() -> void:
	if observation_active:
		return
	observation_active = true
	paused = true
	dragging = false
	camera.projection = Camera3D.PROJECTION_PERSPECTIVE
	camera.fov = 48.0
	camera.position = Vector3(2.1, 2.75, -8.8)
	camera.look_at(Vector3(2.1, 3.0, -22.0))
	observation_prompt.show()
	prompt.text = "E / ESC — return to the station"

func close_observation() -> void:
	observation_active = false
	paused = false
	observation_prompt.hide()
	update_camera()

func show_narration(text: String) -> void:
	narration.text = text
	narration.modulate.a = 1.0
	narration.show()
	var tween := create_tween()
	tween.tween_interval(3.2)
	tween.tween_property(narration, "modulate:a", 0.0, 0.8)
	tween.tween_callback(narration.hide)

func _unhandled_input(event: InputEvent) -> void:
	if opening_active:
		if event is InputEventKey and event.pressed and event.physical_keycode == KEY_Y:
			_finish_maker_opening()
			get_viewport().set_input_as_handled()
		return
	if observation_active:
		if event is InputEventMouseMotion and dragging:
			camera.rotate_y(-event.relative.x * 0.002)
			camera.rotate_object_local(Vector3.RIGHT, -event.relative.y * 0.002)
		if event is InputEventKey and event.pressed and (event.physical_keycode == KEY_E or event.physical_keycode == KEY_ESCAPE):
			close_observation()
		return
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT or event.button_index == MOUSE_BUTTON_RIGHT:
			dragging = event.pressed
		if event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_UP:
			zoom = clampf(zoom-1.0,5.0,26.0)
		if event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			zoom = clampf(zoom+1.0,5.0,26.0)
	if event is InputEventMouseMotion and dragging:
		yaw -= event.relative.x*0.007
		pitch = clampf(pitch+event.relative.y*0.005,0.35,1.05)
	if event is InputEventKey and event.pressed and not event.echo:
		match event.physical_keycode:
			KEY_V, KEY_SECTION:
				isometric = not isometric
				update_camera()
			KEY_ESCAPE:
				if mode != "":
					close_menu()
				elif inventory_open:
					inventory_open = false
				else:
					paused = not paused
			KEY_I:
				if not paused and charge > 0:
					if mode == "inventory":
						close_menu()
					elif mode == "":
						open_menu("inventory")
			KEY_R:
				yaw = PI/4.0
				pitch = 0.72
				zoom = 15.0
			KEY_E:
				if not paused and mode == "" and charge > 0 and not progression.finished:
					interact()
			KEY_Q:
				if not paused and mode == "" and charge > 0 and not progression.finished and progression.cells > 0:
					progression.cells -= 1
					charge = minf(100.0, charge + 55.0)
					message = "Power cell consumed."
			KEY_C:
				if not paused and mode == "" and charge > 0 and not progression.finished and at_bench():
					open_menu("bench")

func _physics_process(delta: float) -> void:
	if observation_active:
		return
	var active: bool = not paused and mode == "" and charge > 0 and not progression.finished
	var direction := Vector3.ZERO
	if active:
		var forward := Vector3(-sin(yaw),0,-cos(yaw))
		var right := Vector3(cos(yaw),0,-sin(yaw))
		direction = forward*(float(Input.is_physical_key_pressed(KEY_W))-float(Input.is_physical_key_pressed(KEY_S))) + right*(float(Input.is_physical_key_pressed(KEY_D))-float(Input.is_physical_key_pressed(KEY_A)))
		direction = direction.normalized()
		charge = maxf(0.0,charge-delta*0.1)
	player.velocity = direction*3.4
	if direction.length_squared() > 0.01:
		visual.rotation.y = lerp_angle(visual.rotation.y,atan2(direction.x,direction.z),minf(delta*10,1.0))
	player.move_and_slide()
	visual.call("set_moving", active and direction.length_squared() > 0.01)
	player.position.x = clampf(player.position.x,-12.5,12.5)
	player.position.z = clampf(player.position.z,-9.5,9.5)
	nearby = nearest_target()
	update_camera()
	hud.text = "SATURN STATION  /  GODOT FOUNDATION\nMU-1   |   CHARGE %03d%%   |   GRID %s" % [int(ceil(charge)), "ONLINE" if powered else "OFFLINE"]
	prompt.text = "WASD move  /  Drag orbit  /  Wheel zoom  /  V isometric  /  R reset  /  I inventory  /  Esc pause"
	if paused:
		prompt.text = "PAUSED — Esc to resume"
	elif mode != "":
		prompt.text = "Esc — close panel"
	elif charge <= 0:
		prompt.text = "POWER DEPLETED — restart the scene to retry."
	elif progression.finished:
		prompt.text = "WORKSHOP COMPLETE — restart the scene to replay."
	elif nearby != "":
		prompt.text = "E — " + nearby
	prompt.text += "\n" + message + "\nCells: " + str(progression.cells) + "  |  Q use cell"
	directive.text = _current_directive()
	directive.visible = mode == "" and not paused and not opening_active

func _current_directive() -> String:
	if not powered:
		return "DIRECTIVE 01  /  RESTORE AUXILIARY POWER"
	if not progression.authenticated:
		return "DIRECTIVE 02  /  FIND THE ACCESS NOTE · POWER THE TERMINAL"
	if not progression.spec_unlocked and not progression.spec_released:
		return "DIRECTIVE 03  /  TERMINAL · RUN SPEC"
	if progression.spec_released:
		return "DIRECTIVE 04  /  RECOVER THE RELEASED SPECIFICATION"
	if not progression.probe_crafted:
		return "DIRECTIVE 05  /  STAGE COMPONENTS AT THE MAINTENANCE BENCH"
	if not progression.probe_installed:
		return "DIRECTIVE 06  /  PLACE THE ACCESS PROBE IN MU-1'S WRIST SLOT"
	if not progression.door_open:
		return "EXIT  /  USE THE PROBE AT THE PRESSURE DOOR"
	return "EXIT  /  PASS THROUGH THE OPEN PRESSURE DOOR"

func show_notice(text: String) -> void:
	if notice_tween and notice_tween.is_running():
		notice_tween.kill()
	notice.text = text
	notice.modulate.a = 1.0
	notice.show()
	notice_tween = create_tween()
	notice_tween.tween_interval(2.4)
	notice_tween.tween_property(notice,"modulate:a",0.0,0.45)
	notice_tween.tween_callback(notice.hide)

func setup_progression(layer: CanvasLayer) -> void:
	targets = {
		"Service case":Vector2(-5,2), "Auxiliary power":Vector2(-10.8,-8.5),
		"ETNA terminal":Vector2(5,-5.5), "Maintenance station":Vector2(-9,2.2),
		"Broken claw":Vector2(-7.2,3), "Specification shard":Vector2(5.4,-3.95),
		"Maintenance exit":Vector2(11.4,-10.6), "Observation window":Vector2(2.1,-9.0),
		"Handwritten note":Vector2(2.1,-7.7), "Crew table":Vector2(8.3,-5.0),
		"Exchanger":Vector2(-5.5,-9.2), "Turbine":Vector2(-11,-2),
		"Press":Vector2(-11.4,1.8), "Engine":Vector2(-11,-5.7),
		"Helmet stand":Vector2(11.2,-2.1)
	}
	note_visual = block(self,Vector3(2.1,0.58,-7.7),Vector3(0.46,0.04,0.3),"d5c17a")
	var note_label := Label3D.new()
	note_label.text = "ETNA"
	note_label.font_size = 30
	note_label.pixel_size = 0.004
	note_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	note_visual.add_child(note_label)
	if progression.note_taken:
		note_visual.hide()
	claw = block(self,Vector3(-7.2,0.25,3),Vector3(0.65,0.3,0.42),"68765b")
	for side in [-1,1]:
		var finger := block(claw,Vector3(side*0.21,0,0.34),Vector3(0.1,0.16,0.46),"777c70")
		finger.rotation.y = side*0.25
	shard = block(self,Vector3(5.4,0.65,-3.95),Vector3(0.35,0.48,0.12),"69bc9c")
	shard.material_override = material("69bc9c",true)
	shard.hide()
	probe_visual = visual.get_node("Body/CastChassis/RecoveredYellowServiceArm/WristAccessProbe")
	for i in range(4):
		var x := 6.8+i*0.98
		block(self,Vector3(x,1.12,-2),Vector3(0.96,2.24,0.7),"b2ad97",true)
		targets["Locker "+str(106+i)] = Vector2(x,-2)
	interface = PanelContainer.new()
	layer.add_child(interface)
	interface.set_anchors_and_offsets_preset(Control.PRESET_CENTER_RIGHT)
	interface.offset_left = -420
	interface.offset_right = -20
	interface.offset_top = -260
	interface.offset_bottom = 260
	var scroll := ScrollContainer.new()
	interface.add_child(scroll)
	menu = VBoxContainer.new()
	menu.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(menu)
	interface.hide()

func at_bench() -> bool:
	return Vector2(player.position.x+9,player.position.z-2.2).length() < 2.5

func nearest_target() -> String:
	var best := 2.4
	var result := ""
	for key in targets:
		if key == "Broken claw" and progression.claw_salvaged:
			continue
		if key == "Handwritten note" and progression.note_taken:
			continue
		if key == "Specification shard" and not progression.spec_released:
			continue
		var distance := Vector2(player.position.x,player.position.z).distance_to(targets[key])
		if distance < best:
			best = distance
			result = key
	return result

func interact() -> void:
	match nearby:
		"Service case":
			var previous_cells: int = progression.cells
			message = progression.use_case()
			if progression.cells > previous_cells:
				show_notice("ITEM RECOVERED  ·  PORTABLE POWER CELL")
			_save_progress()
		"Auxiliary power":
			powered = true
			progression.powered = true
			power_lamp.material_override = material("72ff92",true)
			amber_light.light_color = Color("d4b56d")
			message = "Auxiliary grid online."
			show_notice("POWER RESTORED  ·  AUXILIARY GRID ONLINE")
			_save_progress()
		"ETNA terminal":
			if powered:
				open_menu("terminal")
			else:
				message = "Terminal offline."
		"Maintenance station":
			open_menu("bench")
		"Broken claw":
			if progression.salvage_claw():
				claw.hide()
				visual.call("set_recovered_arm", true)
				message = "Claw dismantled: gears, chip, wire."
				show_notice("SALVAGED  ·  MOTOR / CHIP / WIRE")
				_save_progress()
		"Specification shard":
			if progression.collect_spec():
				shard.hide()
				message = "Fabrication specification recovered."
				show_notice("ITEM RECOVERED  ·  ACCESS PROBE SPECIFICATION")
				_save_progress()
		"Observation window":
			begin_observation()
		"Handwritten note":
			if not progression.note_taken:
				progression.note_taken = true
				progression.add("note")
				note_visual.hide()
				message = "Access note recovered. The handwritten password reads ETNA."
				show_narration("A note caught beneath the window frame. Four letters, written in a hurried hand: ETNA.")
				show_notice("ITEM RECOVERED  ·  ETNA ACCESS NOTE")
				_save_progress()
		"Crew table":
			show_narration("Two mugs. One chair pulled back. The shift log stops halfway through a sentence.")
		"Exchanger":
			show_narration("Heat exchanger C-2. Its return line still ticks as the metal cools.")
		"Turbine":
			show_narration("A bearing knocks somewhere inside the turbine housing. The sound travels through the floor.")
		"Press":
			show_narration("The service press is locked at the bottom of its stroke. Someone left the work half-finished.")
		"Engine":
			show_narration("A sealed drive unit. The casing is cold, but a faint vibration remains in its mounts.")
		"Helmet stand":
			show_narration("A pressure helmet, visor turned toward the station window.")
		"Maintenance exit":
			message = progression.use_exit()
			if progression.door_open:
				exit_door.position.y = 4.8
				_save_progress()
			if progression.finished:
				open_menu("generator_hall")
		_:
			if nearby.begins_with("Locker "):
				open_menu(nearby)

func open_menu(next: String) -> void:
	mode = next
	dragging = false
	visual.call("set_servicing", next == "bench")
	if next == "terminal":
		terminal_booted = false
		terminal_section = "commands"
		terminal_file = ""
	interface.show()
	refresh_menu()
	if next == "terminal":
		_boot_terminal()

func close_menu() -> void:
	mode = ""
	visual.call("set_servicing", false)
	progression.cancel_staging()
	interface.hide()

func line(value: String) -> void:
	var label := Label.new()
	label.text = value
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	menu.add_child(label)

func action(label: String, callback: Callable, enabled := true) -> void:
	var button := Button.new()
	button.text = label
	button.disabled = not enabled
	button.pressed.connect(callback)
	menu.add_child(button)

func load_part(type: String) -> void:
	progression.stage(type)
	_save_progress()
	refresh_menu()

func take_part(index: int, type: String) -> void:
	if progression.take(index,type):
		show_notice("ITEM RECOVERED  ·  " + type.to_upper())
	_save_progress()
	refresh_menu()

func authenticate(password: LineEdit) -> void:
	message = progression.login(password.text)
	if progression.authenticated:
		terminal_section = "commands"
	_save_progress()
	refresh_menu()

func _boot_terminal() -> void:
	await get_tree().create_timer(1.25).timeout
	if mode == "terminal":
		terminal_booted = true
		message = "Terminal ready. Enter access password."
		refresh_menu()

func select_terminal_section(section: String) -> void:
	terminal_section = section
	terminal_file = ""
	refresh_menu()

func run_terminal_command(command: String) -> void:
	match command:
		"HELP":
			message = "AVAILABLE: STATUS · POWER · SPEC · LOG · HELP"
		"STATUS":
			message = "GRID %s · PROBE %s · RECORD %s" % ["ONLINE" if powered else "OFFLINE", "INSTALLED" if progression.probe_installed else "ABSENT", "SAVED" if progression.record_entry != "" else "EMPTY"]
		"POWER":
			message = "AUXILIARY DISTRIBUTION: ONLINE" if powered else "AUXILIARY DISTRIBUTION: OFFLINE"
		"SPEC":
			if progression.release_spec():
				shard.show()
				message = "WRIST ACCESS PROBE SPECIFICATION RELEASED. RECOVER THE SHARD."
			else:
				message = "SPECIFICATION LOCKED. AUTHENTICATE AND RESTORE AUXILIARY POWER."
		"LOG":
			terminal_section = "record"
			message = "RECORD ENTRY TERMINAL READY."
	_save_progress()
	refresh_menu()

func show_terminal_file(name: String) -> void:
	terminal_file = name
	refresh_menu()

func save_record_entry(editor: TextEdit) -> void:
	progression.record_entry = editor.text.strip_edges()
	_save_progress()
	message = "Record entry saved to the station log."
	refresh_menu()

func export_spec() -> void:
	if progression.release_spec():
		shard.show()
	_save_progress()
	close_menu()

func fabricate_probe() -> void:
	progression.fabricate(at_bench())
	_save_progress()
	refresh_menu()

func place_probe() -> void:
	progression.install_placed = true
	_save_progress()
	refresh_menu()

func install_probe() -> void:
	if progression.install(at_bench()):
		visual.call("set_probe_installed", true)
	_save_progress()
	refresh_menu()

func _save_progress() -> void:
	if not persistence_enabled:
		return
	var save := ConfigFile.new()
	save.set_value("progress", "snapshot", progression.snapshot())
	save.save(SAVE_PATH)

func _load_progress() -> void:
	var save := ConfigFile.new()
	if save.load(SAVE_PATH) != OK:
		return
	var snapshot: Variant = save.get_value("progress", "snapshot", {})
	if not snapshot is Dictionary:
		return
	progression.restore(snapshot)
	powered = progression.powered
	if progression.note_taken:
		note_visual.hide()
	if powered:
		power_lamp.material_override = material("72ff92", true)
		amber_light.light_color = Color("d4b56d")
	if progression.claw_salvaged:
		claw.hide()
		visual.call("set_recovered_arm", true)
	if progression.spec_released:
		shard.show()
	if progression.probe_installed:
		visual.call("set_probe_installed", true)
	if progression.door_open:
		exit_door.position.y = 4.8

func prepare_menu_backdrop() -> void:
	paused = true
	set_process(false)
	set_physics_process(false)
	var layer := get_node_or_null("WorkshopHUD") as CanvasLayer
	if layer:
		layer.hide()

func refresh_menu() -> void:
	for child in menu.get_children():
		menu.remove_child(child)
		child.queue_free()
	line("SATURN STATION / " + mode.to_upper())
	match mode:
		"generator_hall":
			line("Beyond this pressure door: Generator 04.")
			line("One of several machines that once kept a city alive.")
			action("Enter Generator 04", enter_generator_hall)
		"inventory":
			for item in progression.inventory:
				line(item.capitalize() + " × " + str(progression.inventory[item]))
			line("Power cells: " + str(progression.cells))
			if progression.inventory.get("note",0) > 0:
				action("Inspect access note",open_menu.bind("note"))
			if progression.inventory.get("card",0) > 0:
				action("Inspect worker card",open_menu.bind("card"))
			if progression.probe_crafted:
				line("Access probe: " + ("installed" if progression.probe_installed else "stowed"))
		"card":
			line("Mara Venn / Staff access card")
			line("Handwritten note: ETNA")
		"note":
			line("RECOVERED NOTE / WINDOW FRAME")
			line("The paper is damp at the edges. The pencil marks are still legible:")
			line("ETNA")
		"terminal":
			if not terminal_booted:
				line("PSP-6 WAVE TERMINAL / SELF TEST")
				line("Checking CRT phosphor ... OK")
				line("Checking aux bus ... " + ("OK" if powered else "WAITING FOR POWER"))
				line("Loading station directory ...")
			elif not progression.authenticated:
				line("RESTRICTED SERVICE CONSOLE")
				line("Enter the handwritten access password.")
				var password := LineEdit.new()
				password.placeholder_text = "Password"
				menu.add_child(password)
				action("Authenticate",authenticate.bind(password))
			else:
				line("ETNA / LOCAL STATION BROWSER")
				for section in ["commands", "files", "record"]:
					action(section.to_upper(), select_terminal_section.bind(section), terminal_section != section)
				match terminal_section:
					"commands":
						line("COMMAND DIRECTORY")
						action("HELP", run_terminal_command.bind("HELP"))
						action("STATUS", run_terminal_command.bind("STATUS"))
						action("POWER", run_terminal_command.bind("POWER"))
						action("SPEC", run_terminal_command.bind("SPEC"), not progression.spec_unlocked and not progression.spec_released)
						action("LOG", run_terminal_command.bind("LOG"))
					"files":
						if terminal_file == "":
							line("STATION FILES")
							for file_name in ["SYSTEM STATUS", "GENERATOR 04 MAINTENANCE", "STAFF DIRECTORY", "INCIDENT LOG"]:
								action(file_name, show_terminal_file.bind(file_name))
						else:
							line("/STATION/" + terminal_file.replace(" ", "_") + ".TXT")
							line(_terminal_file_text(terminal_file))
							action("BACK TO FILES", show_terminal_file.bind(""))
					"record":
						line("PERSONAL RECORD ENTRY · SAVES WITH THIS SHIFT")
						var editor := TextEdit.new()
						editor.custom_minimum_size = Vector2(0, 110)
						editor.placeholder_text = "Type a short station log entry..."
						editor.text = progression.record_entry
						menu.add_child(editor)
						action("SAVE RECORD", save_record_entry.bind(editor))
		"bench":
			if not progression.spec_unlocked:
				line("Specification required.")
			else:
				for type in progression.RECIPE:
					line("%s   %s / %s staged   (%s owned)" % [type.capitalize(),progression.staged.get(type,0),progression.RECIPE[type],progression.inventory.get(type,0)])
					action("Load "+type,load_part.bind(type),not progression.probe_crafted and progression.can_stage(type))
				action("Fabricate access probe",fabricate_probe,progression.can_fabricate(at_bench()))
				if progression.probe_crafted and not progression.probe_installed:
					action("Place probe in wrist slot",place_probe,powered and at_bench())
					action("Confirm installation",install_probe,progression.install_placed and powered and at_bench())
				if progression.probe_installed:
					line("Probe installed. Use the local exit socket.")
		_:
			if mode.begins_with("Locker "):
				var index := int(mode.get_slice(" ",1))-106
				for item in progression.lockers[index].keys():
					action("Recover "+item.capitalize(),take_part.bind(index,item),progression.lockers[index].get(item,0)>0)
	line(message)
	action("Close",close_menu)

func _terminal_file_text(file_name: String) -> String:
	match file_name:
		"SYSTEM STATUS":
			return "Auxiliary grid: %s\nProbe socket: %s\nStaff access: authenticated" % ["online" if powered else "offline", "occupied" if progression.probe_installed else "empty"]
		"GENERATOR 04 MAINTENANCE":
			return "Auxiliary route only. Main vessel remains isolated.\nInspection crew count: 2.\nLast entry: 18 months ago."
		"STAFF DIRECTORY":
			return "MARA VENN · service crew · B-7\nCurrent assignment: lower exchanger bay."
		"INCIDENT LOG":
			return progression.record_entry if progression.record_entry != "" else "No local record entries saved."
	return "File could not be read."

func enter_generator_hall() -> void:
	get_tree().change_scene_to_file("res://generator_hall.tscn")
