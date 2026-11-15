extends Node3D
# First native greybox: room-layout.js coordinates, prototype-3d.js palette and controls.
class ComponentDragButton extends Button:
	var part_type := ""
	func _get_drag_data(_at_position: Vector2) -> Variant:
		var preview := Label.new()
		preview.text = part_type.to_upper()
		preview.add_theme_color_override("font_color",Color("e3c985"))
		set_drag_preview(preview)
		return {"part_type":part_type}

class FabricationTray extends PanelContainer:
	var host
	func _can_drop_data(_at_position: Vector2, data: Variant) -> bool:
		if host == null or not data is Dictionary:
			return false
		var part_type := str(data.get("part_type",""))
		return host.progression.can_stage(part_type)
	func _drop_data(_at_position: Vector2, data: Variant) -> void:
		if _can_drop_data(_at_position,data):
			host.load_part(str(data.get("part_type","")))

class ProbeSocketTarget extends PanelContainer:
	var host
	func _can_drop_data(_at_position: Vector2, data: Variant) -> bool:
		return host != null and data is Dictionary and str(data.get("part_type","")) == "access_probe" and host.progression.probe_crafted and not host.progression.probe_installed and host.powered and host.at_bench()
	func _drop_data(_at_position: Vector2, data: Variant) -> void:
		if _can_drop_data(_at_position,data):
			host.install_probe()

class ItemPreview extends SubViewportContainer:
	var stage: Node3D
	var rotating := false
	func _gui_input(event: InputEvent) -> void:
		if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
			rotating = event.pressed
			accept_event()
		elif event is InputEventMouseMotion and rotating and stage:
			stage.rotate_y(-event.relative.x*0.012)
			stage.rotation.x = clampf(stage.rotation.x-event.relative.y*0.009,-0.9,0.9)
			accept_event()

var player: CharacterBody3D
var visual: Node3D
var camera: Camera3D
var hud: Label
var prompt: Label
var controls_hint: Label
var hotbar: HBoxContainer
var hotbar_slots: Array[PanelContainer] = []
var hotbar_labels: Array[Label] = []
var hotbar_selected := -1
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
var fabrication_tray: FabricationTray
var mode := ""
var nearby := ""
var selected_target := ""
var move_target := Vector2.ZERO
var mouse_down_position := Vector2.ZERO
var mouse_dragged := false
var targets: Dictionary = {}
var observation_counts: Dictionary = {}
var shard: MeshInstance3D
var claw: MeshInstance3D
var recovered_arm: Node3D
var inventory_inspection := ""
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
var sound_player: AudioStreamPlayer
var ambient_player: AudioStreamPlayer
var world_environment: WorldEnvironment
var pause_overlay: ColorRect
var pause_content: VBoxContainer
var death_overlay: ColorRect
var death_active := false
var pause_settings_active := false
var master_volume := 0.8
var brightness := 1.0
var sound_enabled := true
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

func play_tone(frequency: float, duration: float, volume := 0.06) -> void:
	if not sound_player or duration <= 0.0:
		return
	const sample_rate := 22050
	var frames := maxi(1, int(sample_rate * duration))
	var samples := PackedByteArray()
	samples.resize(frames * 2)
	for i in range(frames):
		var t := float(i) / float(sample_rate)
		var envelope := pow(1.0 - float(i) / float(frames), 1.8)
		var sweep := frequency * (1.0 - 0.14 * float(i) / float(frames))
		var sample := int(clampf(sin(TAU * sweep * t) * envelope * volume, -1.0, 1.0) * 32767.0)
		samples[i*2] = sample & 0xff
		samples[i*2+1] = (sample >> 8) & 0xff
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = sample_rate
	stream.stereo = false
	stream.data = samples
	sound_player.stop()
	sound_player.stream = stream
	sound_player.play()

func make_room_ambience() -> AudioStreamWAV:
	const sample_rate := 22050
	const frames := sample_rate * 2
	var samples := PackedByteArray()
	samples.resize(frames * 2)
	for i in range(frames):
		var t := float(i) / float(sample_rate)
		var breath := 0.68 + 0.32 * (0.5 - 0.5 * cos(PI * t))
		var drone := sin(TAU * 50.0 * t) * 0.62 + sin(TAU * 73.0 * t) * 0.38
		var sample := int(clampf(drone * breath * 0.035, -1.0, 1.0) * 32767.0)
		samples[i*2] = sample & 0xff
		samples[i*2+1] = (sample >> 8) & 0xff
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = sample_rate
	stream.stereo = false
	stream.data = samples
	stream.loop_mode = AudioStreamWAV.LOOP_FORWARD
	stream.loop_end = frames
	return stream

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
		master_volume = float(preferences.get_value("sound", "volume", 0.8))
		brightness = float(preferences.get_value("display", "brightness", 1.0))
		sound_enabled = bool(preferences.get_value("sound", "enabled", true))
	var master_bus := AudioServer.get_bus_index("Master")
	if master_bus >= 0:
		AudioServer.set_bus_volume_db(master_bus,linear_to_db(maxf(master_volume,0.001)))
		AudioServer.set_bus_mute(master_bus,not sound_enabled)
	world_environment = WorldEnvironment.new()
	var atmosphere := Environment.new()
	atmosphere.background_mode = Environment.BG_COLOR
	atmosphere.background_color = Color("242923")
	atmosphere.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	atmosphere.ambient_light_color = Color("c9c4aa")
	atmosphere.ambient_light_energy = 0.65
	atmosphere.tonemap_exposure = brightness
	world_environment.environment = atmosphere
	add_child(world_environment)
	sound_player = AudioStreamPlayer.new()
	sound_player.name = "WorkshopSoundEffects"
	add_child(sound_player)
	ambient_player = AudioStreamPlayer.new()
	ambient_player.name = "WorkshopRoomAmbience"
	ambient_player.stream = make_room_ambience()
	ambient_player.volume_db = -10.0
	add_child(ambient_player)
	ambient_player.play()
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
	_build_room_story_props()
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
	controls_hint = Label.new()
	layer.add_child(controls_hint)
	controls_hint.text = "WASD MOVE  ·  CLICK + E APPROACH  ·  DRAG LOOK\nWHEEL ZOOM  ·  E INTERACT  ·  1–5 ITEMS  ·  Q CELL"
	controls_hint.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_LEFT)
	controls_hint.position = Vector2(24,-72)
	controls_hint.size = Vector2(540,58)
	controls_hint.add_theme_font_size_override("font_size",15)
	controls_hint.add_theme_color_override("font_color",Color("c4c6b6"))
	_build_hotbar(layer)
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
	_build_pause_screen(layer)
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

func _story_cable(a: Vector3, b: Vector3, radius: float, color: String) -> void:
	var delta := b-a
	var cable := MeshInstance3D.new()
	var shape := CylinderMesh.new()
	shape.top_radius = radius
	shape.bottom_radius = radius
	shape.height = delta.length()
	shape.radial_segments = 7
	cable.mesh = shape
	cable.material_override = material(color)
	add_child(cable)
	cable.position = (a+b)*0.5
	cable.quaternion = Quaternion(Vector3.UP,delta.normalized())

func _build_room_story_props() -> void:
	# Crew details sit on the existing table and wall-connected utility route.
	var cup := MeshInstance3D.new()
	var cup_shape := CylinderMesh.new()
	cup_shape.top_radius = 0.095
	cup_shape.bottom_radius = 0.075
	cup_shape.height = 0.19
	cup.mesh = cup_shape
	cup.material_override = material("837d66")
	add_child(cup)
	cup.position = Vector3(8.16,1.21,-5.0)
	var handle := MeshInstance3D.new()
	var handle_shape := TorusMesh.new()
	handle_shape.inner_radius = 0.055
	handle_shape.outer_radius = 0.075
	handle.mesh = handle_shape
	handle.material_override = material("9f8652")
	add_child(handle)
	handle.position = Vector3(8.27,1.22,-5.0)
	handle.rotation.x = PI/2.0
	var ring := MeshInstance3D.new()
	var ring_shape := TorusMesh.new()
	ring_shape.inner_radius = 0.09
	ring_shape.outer_radius = 0.098
	ring.mesh = ring_shape
	ring.material_override = material("6b5941")
	add_child(ring)
	ring.position = Vector3(8.16,1.115,-5.0)
	var handover := block(self,Vector3(8.54,1.13,-4.98),Vector3(0.42,0.018,0.31),"b5ad91")
	handover.rotation.y = -0.12
	for i in range(4):
		block(self,Vector3(8.53,1.142,-5.08+i*0.055),Vector3(0.27,0.004,0.008),"4d5147")
	# A seat faces the moon; the pressure helmet remains on its service stand.
	block(self,Vector3(7.5,0.72,-8.9),Vector3(0.68,0.12,0.64),"8c8872")
	block(self,Vector3(7.5,1.08,-9.17),Vector3(0.68,0.66,0.12),"464c45")
	for x in [7.25,7.75]:
		for z in [-9.12,-8.68]:
			block(self,Vector3(x,0.34,z),Vector3(0.07,0.58,0.07),"494d43")
	var helmet := MeshInstance3D.new()
	var helmet_shape := SphereMesh.new()
	helmet_shape.radius = 0.23
	helmet_shape.height = 0.46
	helmet.mesh = helmet_shape
	helmet.material_override = material("9a9a83")
	add_child(helmet)
	helmet.position = Vector3(11.2,1.33,-2.1)
	block(self,Vector3(11.2,1.32,-1.87),Vector3(0.34,0.13,0.08),"272c28")
	# Rejected claw parts are sorted beside the service station, not scattered through the aisle.
	block(self,Vector3(-5.35,1.13,3.7),Vector3(1.05,0.08,0.65),"424940")
	for i in range(3):
		var reject := block(self,Vector3(-5.7+i*0.3,1.27,3.7),Vector3(0.14,0.1,0.36),"858575")
		reject.rotation.y = float(i-1)*0.06
	for pair in [
		[Vector3(-10.8,0.18,-8.5),Vector3(-11.0,0.18,-5.7)],
		[Vector3(-11.0,0.18,-5.7),Vector3(-11.0,0.18,-2.0)],
		[Vector3(-11.0,0.18,-2.0),Vector3(-11.4,0.18,1.8)],
		[Vector3(-10.8,0.16,-8.5),Vector3(-5.5,0.16,-8.5)],
		[Vector3(-5.5,0.16,-8.5),Vector3(2.1,0.16,-8.5)]]:
		_story_cable(pair[0],pair[1],0.035,"88794e")
	for pair in [[Vector3(-6,0.075,5),Vector3(-3,0.075,5)],[Vector3(-3,0.075,5),Vector3(-3,0.075,-3)],[Vector3(-3,0.075,-3),Vector3(5,0.075,-3)],[Vector3(-3,0.075,-3),Vector3(-6,0.075,-6)]]:
		_story_cable(pair[0],pair[1],0.014,"71745e")

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
	hotbar.hide()
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
		controls_hint.hide()
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
		controls_hint.show()
	hotbar.show()
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
	hotbar.hide()
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
	hotbar.show()
	update_camera()

func show_narration(text: String) -> void:
	narration.text = text
	narration.modulate.a = 1.0
	narration.show()
	var tween := create_tween()
	tween.tween_interval(3.2)
	tween.tween_property(narration, "modulate:a", 0.0, 0.8)
	tween.tween_callback(narration.hide)

func show_observation(id: String, heading: String, lines: Array[String]) -> void:
	var count := int(observation_counts.get(id,0))
	observation_counts[id] = count + 1
	show_narration(heading.to_upper() + "\n" + lines[mini(count,lines.size()-1)])

func _unhandled_input(event: InputEvent) -> void:
	if death_active:
		return
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
		if event.button_index == MOUSE_BUTTON_LEFT:
			if event.pressed:
				mouse_down_position = event.position
				mouse_dragged = false
				dragging = true
			elif dragging:
				dragging = false
				if not mouse_dragged and mode == "" and not paused:
					_select_target_at(event.position)
		elif event.button_index == MOUSE_BUTTON_RIGHT:
			dragging = event.pressed
		if event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_UP:
			zoom = clampf(zoom-1.0,5.0,26.0)
		if event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			zoom = clampf(zoom+1.0,5.0,26.0)
	if event is InputEventMouseMotion and dragging:
		if mouse_down_position.distance_to(event.position) > 5.0:
			mouse_dragged = true
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
					set_paused(not paused)
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
			KEY_1:
				if mode == "terminal" and progression.authenticated:
					run_terminal_command("1")
				else:
					select_hotbar_slot(0)
			KEY_2:
				if mode == "terminal" and progression.authenticated:
					run_terminal_command("2")
				else:
					select_hotbar_slot(1)
			KEY_3:
				if mode == "terminal" and progression.authenticated:
					run_terminal_command("3")
				else:
					select_hotbar_slot(2)
			KEY_4:
				select_hotbar_slot(3)
			KEY_5:
				select_hotbar_slot(4)
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
	if charge <= 0.0 and not death_active:
		_show_death_screen()
	var active: bool = not paused and mode == "" and charge > 0 and not progression.finished
	var direction := Vector3.ZERO
	if active:
		var forward := Vector3(-sin(yaw),0,-cos(yaw))
		var right := Vector3(cos(yaw),0,-sin(yaw))
		direction = forward*(float(Input.is_physical_key_pressed(KEY_W))-float(Input.is_physical_key_pressed(KEY_S))) + right*(float(Input.is_physical_key_pressed(KEY_D))-float(Input.is_physical_key_pressed(KEY_A)))
		direction = direction.normalized()
		if direction.length_squared() > 0.01:
			move_target = Vector2.ZERO
		elif move_target != Vector2.ZERO:
			var to_target := Vector2(move_target.x-player.position.x,move_target.y-player.position.z)
			if to_target.length() <= 1.45:
				move_target = Vector2.ZERO
			else:
				direction = Vector3(to_target.x,0,to_target.y).normalized()
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
	elif selected_target != "" and _target_available(selected_target) and Vector2(player.position.x,player.position.z).distance_to(targets[selected_target]) <= 2.4:
		prompt.text = "E — " + _interaction_hint(selected_target)
	elif nearby != "":
		prompt.text = "E — " + _interaction_hint(nearby)
	if move_target != Vector2.ZERO and not paused and mode == "":
		prompt.text = "AUTO WALK  ·  " + selected_target.to_upper() + "  ·  WASD TO INTERRUPT"
	prompt.text += "\n" + message + "\nCells: " + str(progression.cells) + "  |  Q use cell"
	directive.text = _current_directive()
	directive.visible = mode == "" and not paused and not opening_active
	controls_hint.visible = not opening_active
	_refresh_hotbar()
	hotbar.visible = not opening_active and not observation_active

func _current_directive() -> String:
	if not progression.manipulator_recovered:
		return "DIRECTIVE 01  /  RECOVER THE LOCK-SERVICE MANIPULATOR"
	if not progression.arm_equipped:
		return "DIRECTIVE 02  /  INSPECT AND FIT THE RECOVERED MANIPULATOR"
	if not powered:
		return "DIRECTIVE 03  /  RESTORE AUXILIARY POWER"
	if not progression.authenticated:
		return "DIRECTIVE 04  /  FIND THE ACCESS NOTE · POWER THE TERMINAL"
	if not progression.spec_unlocked and not progression.spec_released:
		return "DIRECTIVE 05  /  TERMINAL · RUN SPEC"
	if progression.spec_released:
		return "DIRECTIVE 06  /  RECOVER THE RELEASED SPECIFICATION"
	if not progression.probe_crafted:
		return "DIRECTIVE 07  /  STAGE COMPONENTS AT THE MAINTENANCE BENCH"
	if not progression.probe_installed:
		return "DIRECTIVE 08  /  FIT THE ACCESS PROBE TO MU-1'S WRIST SOCKET"
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
	play_tone(620.0,0.075,0.045)

func _build_hotbar(layer: CanvasLayer) -> void:
	hotbar = HBoxContainer.new()
	hotbar.name = "FiveSlotHotbar"
	hotbar.set_anchors_and_offsets_preset(Control.PRESET_CENTER_BOTTOM)
	hotbar.position = Vector2(-250,-116)
	hotbar.size = Vector2(500,64)
	hotbar.add_theme_constant_override("separation",7)
	layer.add_child(hotbar)
	for i in range(5):
		var slot := PanelContainer.new()
		slot.custom_minimum_size = Vector2(94,58)
		hotbar.add_child(slot)
		var label := Label.new()
		label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		label.add_theme_font_size_override("font_size",13)
		slot.add_child(label)
		hotbar_slots.append(slot)
		hotbar_labels.append(label)
	_refresh_hotbar()

func _hotbar_items() -> Array[String]:
	var items: Array[String] = []
	for type in ["note","card","camera","manipulator","motor","gear","chip","plate","wire","tin"]:
		if progression.inventory.get(type,0) > 0:
			items.append(type.capitalize() + " ×" + str(progression.inventory[type]))
	if progression.probe_crafted:
		items.append("Access probe")
	if progression.cells > 0:
		items.append("Power cell ×" + str(progression.cells))
	return items

func select_hotbar_slot(index: int) -> void:
	if index < 0 or index >= 5:
		return
	hotbar_selected = index
	var items := _hotbar_items()
	if index < items.size():
		show_notice("SELECTED  ·  " + items[index].to_upper())
	_refresh_hotbar()

func _build_pause_screen(layer: CanvasLayer) -> void:
	var settings_button := Button.new()
	settings_button.name = "GameplaySettingsButton"
	settings_button.text = "SETTINGS"
	settings_button.set_anchors_and_offsets_preset(Control.PRESET_TOP_RIGHT)
	settings_button.position = Vector2(-138,20)
	settings_button.size = Vector2(116,40)
	settings_button.pressed.connect(_open_pause_settings)
	layer.add_child(settings_button)
	pause_overlay = ColorRect.new()
	pause_overlay.name = "PauseScreen"
	pause_overlay.color = Color(0.015,0.02,0.018,0.82)
	pause_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	pause_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	layer.add_child(pause_overlay)
	pause_overlay.hide()
	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	pause_overlay.add_child(center)
	var card := PanelContainer.new()
	card.name = "PauseCard"
	card.custom_minimum_size = Vector2(430,0)
	center.add_child(card)
	pause_content = VBoxContainer.new()
	pause_content.add_theme_constant_override("separation",12)
	card.add_child(pause_content)
	_refresh_pause_screen(false)
	death_overlay = ColorRect.new()
	death_overlay.name = "PowerDepletedScreen"
	death_overlay.color = Color(0.015,0.02,0.018,0.92)
	death_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	death_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	layer.add_child(death_overlay)
	death_overlay.hide()
	var death_center := CenterContainer.new()
	death_center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	death_overlay.add_child(death_center)
	var death_card := PanelContainer.new()
	death_card.custom_minimum_size = Vector2(430,0)
	death_center.add_child(death_card)
	var death_content := VBoxContainer.new()
	death_content.add_theme_constant_override("separation",12)
	death_card.add_child(death_content)
	var failure_code := Label.new()
	failure_code.text = "SRV-09 / CRITICAL FAILURE"
	failure_code.add_theme_color_override("font_color",Color("c6b97f"))
	death_content.add_child(failure_code)
	var failure_title := Label.new()
	failure_title.text = "POWER DEPLETED"
	failure_title.add_theme_font_size_override("font_size",34)
	death_content.add_child(failure_title)
	var failure_note := Label.new()
	failure_note.text = "MU-1 has shut down. Restart the demo to begin a fresh shift."
	failure_note.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	death_content.add_child(failure_note)
	var reboot := Button.new()
	reboot.name = "RebootUnitButton"
	reboot.text = "REBOOT UNIT"
	reboot.pressed.connect(restart_demo)
	death_content.add_child(reboot)

func set_paused(value: bool) -> void:
	if death_active and value:
		return
	paused = value
	if pause_overlay:
		pause_overlay.visible = value
	if value:
		move_target = Vector2.ZERO
	else:
		pause_settings_active = false

func _open_pause_settings() -> void:
	set_paused(true)
	_refresh_pause_screen(true)

func _refresh_pause_screen(show_settings: bool) -> void:
	pause_settings_active = show_settings
	if not pause_content:
		return
	for child in pause_content.get_children():
		pause_content.remove_child(child)
		child.queue_free()
	var heading := Label.new()
	heading.text = "MU-1 / PREFERENCES" if show_settings else "SRV-09 / SYSTEM INTERRUPT"
	heading.add_theme_font_size_override("font_size",13)
	heading.add_theme_color_override("font_color",Color("c6b97f"))
	pause_content.add_child(heading)
	var title := Label.new()
	title.text = "SETTINGS" if show_settings else "PAUSED"
	title.add_theme_font_size_override("font_size",34)
	pause_content.add_child(title)
	if show_settings:
		var volume_label := Label.new()
		volume_label.text = "MASTER VOLUME  ·  %.0f%%" % (master_volume*100.0)
		pause_content.add_child(volume_label)
		var volume_slider := HSlider.new()
		volume_slider.name = "MasterVolumeSlider"
		volume_slider.min_value = 0.0
		volume_slider.max_value = 1.0
		volume_slider.step = 0.05
		volume_slider.value = master_volume
		volume_slider.value_changed.connect(func(value: float) -> void:
			_set_master_volume(value)
			volume_label.text = "MASTER VOLUME  ·  %.0f%%" % (master_volume*100.0)
		)
		pause_content.add_child(volume_slider)
		var sound_toggle := CheckButton.new()
		sound_toggle.name = "SoundEnabledToggle"
		sound_toggle.text = "SOUND ENABLED"
		sound_toggle.button_pressed = sound_enabled
		sound_toggle.toggled.connect(_set_sound_enabled)
		pause_content.add_child(sound_toggle)
		var brightness_label := Label.new()
		brightness_label.text = "BRIGHTNESS  ·  %.0f%%" % (brightness*100.0)
		pause_content.add_child(brightness_label)
		var brightness_slider := HSlider.new()
		brightness_slider.name = "BrightnessSlider"
		brightness_slider.min_value = 0.5
		brightness_slider.max_value = 1.8
		brightness_slider.step = 0.05
		brightness_slider.value = brightness
		brightness_slider.value_changed.connect(func(value: float) -> void:
			_set_brightness(value)
			brightness_label.text = "BRIGHTNESS  ·  %.0f%%" % (brightness*100.0)
		)
		pause_content.add_child(brightness_slider)
		var back := Button.new()
		back.text = "BACK TO PAUSE MENU"
		back.pressed.connect(func() -> void: _refresh_pause_screen(false))
		pause_content.add_child(back)
		return
	var subtitle := Label.new()
	subtitle.text = "Unit processes suspended."
	pause_content.add_child(subtitle)
	var resume := Button.new()
	resume.text = "RESUME"
	resume.pressed.connect(func() -> void: set_paused(false))
	pause_content.add_child(resume)
	var settings := Button.new()
	settings.text = "SETTINGS"
	settings.pressed.connect(_open_pause_settings)
	pause_content.add_child(settings)
	var restart := Button.new()
	restart.text = "RESTART DEMO"
	restart.pressed.connect(restart_demo)
	pause_content.add_child(restart)

func _save_game_preferences() -> void:
	if not persistence_enabled:
		return
	var preferences := ConfigFile.new()
	preferences.load("user://saturn-station-prefs.cfg")
	preferences.set_value("sound","volume",master_volume)
	preferences.set_value("sound","enabled",sound_enabled)
	preferences.set_value("display","brightness",brightness)
	preferences.save("user://saturn-station-prefs.cfg")

func _set_master_volume(value: float) -> void:
	master_volume = clampf(value,0.0,1.0)
	var bus := AudioServer.get_bus_index("Master")
	if bus >= 0:
		AudioServer.set_bus_volume_db(bus,linear_to_db(maxf(master_volume,0.001)))
	_save_game_preferences()

func _set_sound_enabled(value: bool) -> void:
	sound_enabled = value
	var bus := AudioServer.get_bus_index("Master")
	if bus >= 0:
		AudioServer.set_bus_mute(bus,not sound_enabled)
	_save_game_preferences()

func _set_brightness(value: float) -> void:
	brightness = clampf(value,0.5,1.8)
	if world_environment and world_environment.environment:
		world_environment.environment.tonemap_exposure = brightness
	_save_game_preferences()

func restart_demo() -> void:
	if FileAccess.file_exists(SAVE_PATH):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(SAVE_PATH))
	get_tree().set_meta("start_maker_opening",true)
	get_tree().change_scene_to_file("res://workshop.tscn")

func _show_death_screen() -> void:
	death_active = true
	paused = false
	move_target = Vector2.ZERO
	if pause_overlay:
		pause_overlay.hide()
	if death_overlay:
		death_overlay.show()
	visual.call("set_moving",false)
	message = "CRITICAL: UNIT POWER DEPLETED."

func _refresh_hotbar() -> void:
	if hotbar_labels.size() != 5:
		return
	var items := _hotbar_items()
	for i in range(5):
		var label := hotbar_labels[i]
		label.text = "%02d\n%s" % [i+1,items[i] if i < items.size() else "—"]
		var style := StyleBoxFlat.new()
		style.bg_color = Color("252b25",0.93)
		style.border_color = Color("d6bb75") if hotbar_selected == i else Color("737969")
		style.set_border_width_all(2 if hotbar_selected == i else 1)
		style.set_corner_radius_all(3)
		hotbar_slots[i].add_theme_stylebox_override("panel",style)

func setup_progression(layer: CanvasLayer) -> void:
	targets = {
		"Service case":Vector2(-5,2), "Auxiliary power":Vector2(-10.8,-8.5),
		"ETNA terminal":Vector2(5,-5.5), "Maintenance station":Vector2(-9,2.2),
		"Lock-service manipulator":Vector2(-7.2,3), "Specification shard":Vector2(5.4,-3.95),
		"Maintenance exit":Vector2(11.4,-10.6), "Observation window":Vector2(2.1,-9.0),
		"Handwritten note":Vector2(2.1,-7.7), "Crew table":Vector2(8.3,-5.0),
		"Exchanger":Vector2(-5.5,-9.2), "Turbine":Vector2(-11,-2),
		"Press":Vector2(-11.4,1.8), "Engine":Vector2(-11,-5.7),
		"Helmet stand":Vector2(11.2,-2.1), "Window seat":Vector2(7.5,-8.9),
		"Mara's cup":Vector2(7.9,-5.45), "Unfinished handover":Vector2(8.9,-5.0),
		"Sorted rejects":Vector2(-5.35,3.7)
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
	block(claw,Vector3(0,0.22,0),Vector3(0.2,0.22,0.22),"b49a57")
	block(claw,Vector3(-0.02,0.39,0.02),Vector3(0.17,0.36,0.18),"697663")
	block(claw,Vector3(0.05,0.58,0.06),Vector3(0.14,0.34,0.14),"b49a57")
	block(claw,Vector3(0.05,0.77,0.12),Vector3(0.23,0.11,0.12),"777c70")
	for side in [-1,1]:
		var finger := block(claw,Vector3(0.05+side*0.13,0.76,0.22),Vector3(0.07,0.2,0.08),"777c70")
		finger.rotation.y = side*0.25
	shard = block(self,Vector3(5.4,0.65,-3.95),Vector3(0.35,0.48,0.12),"69bc9c")
	shard.material_override = material("69bc9c",true)
	shard.hide()
	recovered_arm = visual.get_node("Body/CastChassis/RecoveredYellowServiceArm")
	recovered_arm.hide()
	probe_visual = recovered_arm.get_node("WristAccessProbe")
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
		if key == "Lock-service manipulator" and progression.claw_salvaged:
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

func _interaction_hint(target_name: String) -> String:
	match target_name:
		"Service case":
			if not progression.arm_equipped:
				return "MANIPULATOR REQUIRED"
			if not progression.case_open:
				return "RELEASE SERVICE CASE"
			if not progression.cell_taken:
				return "RECOVER POWER CELL"
			return "CASE EMPTY"
		"Auxiliary power":
			if not progression.arm_equipped:
				return "MANIPULATOR REQUIRED"
			return "POWER ONLINE" if powered else "RESTORE AUXILIARY POWER"
		"ETNA terminal":
			return "OPEN CONTROL TERMINAL" if powered else "POWER REQUIRED"
		"Maintenance station":
			return "OPEN FABRICATION BENCH"
		"Lock-service manipulator":
			return "RECOVER MANIPULATOR"
		"Specification shard":
			return "RECOVER PROBE SPECIFICATION"
		"Maintenance exit":
			if progression.door_open:
				return "PASS THROUGH OPEN PRESSURE DOOR"
			if not powered:
				return "RESTORE POWER FIRST"
			if not progression.probe_installed:
				return "ACCESS PROBE REQUIRED"
			return "ENGAGE EXIT SOCKET"
		"Observation window":
			return "VIEW ENCELADUS"
		"Handwritten note":
			return "RECOVER ETNA ACCESS NOTE"
		_:
			return "INSPECT " + target_name.to_upper()

func _target_available(target_name: String) -> bool:
	if target_name == "Lock-service manipulator" and progression.claw_salvaged:
		return false
	if target_name == "Handwritten note" and progression.note_taken:
		return false
	if target_name == "Specification shard" and not progression.spec_released:
		return false
	return targets.has(target_name)

func _select_target_at(screen_position: Vector2) -> String:
	var selected := ""
	var nearest_pixels := 58.0
	for target_name in targets:
		if not _target_available(target_name):
			continue
		var ground: Vector2 = targets[target_name]
		var world_position := Vector3(ground.x,0.85,ground.y)
		if camera.is_position_behind(world_position):
			continue
		var screen_target := camera.unproject_position(world_position)
		var pixel_distance := screen_target.distance_to(screen_position)
		if pixel_distance < nearest_pixels:
			nearest_pixels = pixel_distance
			selected = str(target_name)
	if selected != "":
		selected_target = selected
		message = selected + " selected. Press E to interact or approach."
		show_notice("SELECTED  ·  " + selected.to_upper() + "  ·  PRESS E")
	return selected

func interact() -> void:
	var target_name := selected_target if selected_target != "" and _target_available(selected_target) else nearby
	if target_name == "":
		message = "No service object in reach. Click an object, then press E to approach it."
		return
	var target_point: Vector2 = targets.get(target_name,Vector2(player.position.x,player.position.z))
	if Vector2(player.position.x,player.position.z).distance_to(target_point) > 2.4:
		selected_target = target_name
		move_target = target_point
		message = "Moving to " + target_name + "."
		show_notice("MOVING TO  ·  " + target_name.to_upper())
		return
	move_target = Vector2.ZERO
	selected_target = ""
	nearby = target_name
	match nearby:
		"Service case":
			if not progression.arm_equipped:
				message = "The mechanical latch needs a fitted manipulator."
				return
			var previous_cells: int = progression.cells
			message = progression.use_case()
			if progression.cells > previous_cells:
				show_notice("ITEM RECOVERED  ·  PORTABLE POWER CELL")
			_save_progress()
		"Auxiliary power":
			if not progression.arm_equipped:
				message = "The switch is too stiff to move by hand. Fit the recovered manipulator first."
				return
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
		"Lock-service manipulator":
			if progression.salvage_claw():
				claw.hide()
				message = "The loose manipulator is free. Gears, a chip and wire came away with it."
				show_notice("MANIPULATOR RECOVERED  ·  I TO INSPECT AND EQUIP")
				_refresh_hotbar()
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
		"Window seat":
			show_observation("seat","Window seat",["The deck coating is worn away beneath the front legs. This chair was pulled up to the glass, again and again."])
		"Mara's cup":
			show_observation("cup","Mara's cup",["A pale ring marks the shelf beneath the cup. Whoever sat here watched the plumes for a long time.","Cold. The handle has been repaired rather than replaced."])
		"Unfinished handover":
			show_observation("handover","Unfinished handover",["Converter vibration steady. Claw still binding. Tell the next shift— The last line stops there.","There is no signature in the handover box."])
		"Sorted rejects":
			show_observation("tray","Sorted rejects",["Failed gripper jaws, sorted by fracture. These were kept for comparison, not thrown away."])
		"Exchanger":
			show_observation("exchanger","Coolant exchanger",["Fresh bolts interrupt the old rust. The repair sleeve is newer than anything connected to it."])
		"Turbine":
			show_observation("converter","Rotary converter",["The converter feeds the exchanger through the west-wall bus. Every cable here has a destination.","A service date has been scratched over three times. This unit outlived its planned replacement."])
		"Press":
			show_observation("press","Workshop press",["A jaw-shaped mark remains in the press bed. Someone tried to straighten the claw before giving up.","The tooling is worn smooth where a hand would steady it. This bay was used every shift."])
		"Engine":
			show_observation("compressor","Auxiliary compressor",["A cloth tied around the coupling catches the last drops of oil. Someone kept running it instead of fixing the seal."])
		"Helmet stand":
			show_observation("helmet","Crew helmet",["The seal is intact. The faceplate is polished on the inside, scratched on the outside."])
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
	move_target = Vector2.ZERO
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
	button.pressed.connect(func() -> void:
		play_tone(480.0,0.028,0.025)
		callback.call()
	)
	menu.add_child(button)

func _worker_portrait() -> Texture2D:
	var image := Image.create(96,128,false,Image.FORMAT_RGBA8)
	image.fill(Color("aaa99c"))
	for y in range(128):
		for x in range(96):
			var dx := float(x-48)
			var dy := float(y-48)
			if y >= 83 and pow((dx/39.0),2.0)+pow(((float(y)-119.0)/36.0),2.0) < 1.0:
				image.set_pixel(x,y,Color("716e61"))
			elif pow(dx/20.0,2.0)+pow(dy/27.0,2.0) < 1.0:
				image.set_pixel(x,y,Color("b49d7e"))
			if y < 43 and pow(dx/22.0,2.0)+pow(((float(y)-37.0)/18.0),2.0) < 1.0:
				image.set_pixel(x,y,Color("4f4a3e"))
	for eye_x in [41,55]:
		for y in range(47,50):
			image.set_pixel(eye_x,y,Color("48453d"))
	for x in range(44,53):
		image.set_pixel(x,70,Color("777164"))
	for x in range(35,62):
		image.set_pixel(x,77,Color("6d594a"))
	var texture := ImageTexture.create_from_image(image)
	return texture

func _add_worker_card() -> void:
	var card := PanelContainer.new()
	card.name = "WorkerAccessCard"
	card.custom_minimum_size = Vector2(340,210)
	var style := StyleBoxFlat.new()
	style.bg_color = Color("b5ad91")
	style.border_color = Color("625d4e")
	style.set_border_width_all(2)
	style.set_corner_radius_all(4)
	card.add_theme_stylebox_override("panel",style)
	menu.add_child(card)
	var body := VBoxContainer.new()
	body.add_theme_constant_override("separation",5)
	card.add_child(body)
	var header := Label.new()
	header.text = "S A T U R N   S T A T I O N   /   B-7"
	header.add_theme_font_size_override("font_size",12)
	header.add_theme_color_override("font_color",Color("514d42"))
	body.add_child(header)
	var details := HBoxContainer.new()
	details.add_theme_constant_override("separation",12)
	body.add_child(details)
	var portrait := TextureRect.new()
	portrait.name = "WorkerPortrait"
	portrait.texture = _worker_portrait()
	portrait.custom_minimum_size = Vector2(86,116)
	portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	details.add_child(portrait)
	var text_column := VBoxContainer.new()
	details.add_child(text_column)
	var name_label := Label.new()
	name_label.text = "MARA VENN"
	name_label.add_theme_font_size_override("font_size",20)
	name_label.add_theme_color_override("font_color",Color("35342f"))
	text_column.add_child(name_label)
	var faded := Label.new()
	faded.text = "SERVICE CREW\nLOWER EXCHANGER BAY\nAUTHORIZATION: LIMITED"
	faded.modulate = Color(0.38,0.37,0.33,0.64)
	faded.add_theme_font_size_override("font_size",12)
	text_column.add_child(faded)
	var password := Label.new()
	password.text = "PASSWORD  /  ETNA"
	password.add_theme_font_size_override("font_size",16)
	password.add_theme_color_override("font_color",Color("6e492a"))
	body.add_child(password)

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
	play_tone(92.0,0.32,0.055)
	await get_tree().create_timer(0.28).timeout
	play_tone(174.0,0.1,0.045)
	await get_tree().create_timer(0.36).timeout
	play_tone(390.0,0.06,0.035)
	await get_tree().create_timer(0.61).timeout
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
		"1":
			message = "ERROR: AUXILIARY GRID OFFLINE" if not powered else "AUTOMATIC DOOR LINK ISOLATED · USE LOCAL EXIT SOCKET WITH ACCESS PROBE"
		"2":
			progression.door_open = false
			exit_door.position.y = 1.5
			message = "COMMAND 02 / DOOR SEALED"
			_save_progress()
		"3":
			powered = false
			progression.powered = false
			progression.authenticated = false
			terminal_booted = false
			power_lamp.material_override = material("70412a")
			amber_light.light_color = Color("c87937")
			message = "AUXILIARY POWER OFF"
			_save_progress()
			show_notice("POWER OFF  ·  AUXILIARY GRID DISABLED")
			close_menu()
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

func install_probe() -> void:
	progression.install_placed = true
	if progression.install(at_bench()):
		visual.call("set_probe_installed", true)
		message = "Access probe seated in MU-1's wrist socket."
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
	if progression.arm_equipped:
		recovered_arm.show()
	else:
		recovered_arm.hide()
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
	if ambient_player:
		ambient_player.stop()
	var layer := get_node_or_null("WorkshopHUD") as CanvasLayer
	if layer:
		layer.hide()

func refresh_menu() -> void:
	for child in menu.get_children():
		menu.remove_child(child)
		child.queue_free()
	var panel_width := 420.0
	if mode == "inventory":
		panel_width = minf(780.0,maxf(340.0,get_viewport().get_visible_rect().size.x-40.0))
	interface.offset_left = -panel_width
	interface.offset_right = -20
	line("SATURN STATION / " + mode.to_upper())
	match mode:
		"generator_hall":
			line("Beyond this pressure door: Generator 04.")
			line("One of several machines that once kept a city alive.")
			action("Enter Generator 04", enter_generator_hall)
		"inventory":
			line("EQUIPMENT STORAGE  ·  %d / 20 SLOTS" % progression.item_count())
			var grid := GridContainer.new()
			grid.name = "InventoryGrid"
			grid.columns = 5 if panel_width >= 560.0 else 4
			grid.add_theme_constant_override("h_separation",5)
			grid.add_theme_constant_override("v_separation",5)
			menu.add_child(grid)
			var items := _inventory_items()
			for i in range(20):
				var slot := Button.new()
				slot.name = "InventorySlot%02d" % i
				slot.custom_minimum_size = Vector2(68,48)
				if i < items.size():
					var item_type: String = items[i]
					slot.text = "%02d\n%s" % [i+1,item_type.capitalize().substr(0,8)]
					slot.pressed.connect(select_inventory_item.bind(item_type))
					slot.tooltip_text = _inventory_item_description(item_type)
				else:
					slot.text = "%02d\n—" % (i+1)
					slot.disabled = true
				grid.add_child(slot)
			var inspection_row := HBoxContainer.new()
			inspection_row.name = "InventoryInspectionRow"
			inspection_row.add_theme_constant_override("separation",12)
			menu.add_child(inspection_row)
			var item_preview := _make_inventory_preview(inventory_inspection,panel_width)
			inspection_row.add_child(item_preview)
			var selected := PanelContainer.new()
			selected.name = "InventoryInspection"
			selected.custom_minimum_size = Vector2(0,160)
			selected.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			inspection_row.add_child(selected)
			var selected_text := Label.new()
			selected_text.text = "SELECT AN ITEM TO INSPECT" if inventory_inspection == "" else inventory_inspection.to_upper() + "\n" + _inventory_item_description(inventory_inspection)
			selected_text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
			selected.add_child(selected_text)
			if progression.manipulator_recovered:
				line("WRIST MOUNT  ·  " + ("MANIPULATOR FITTED" if progression.arm_equipped else "EMPTY"))
				if progression.arm_equipped:
					action("STOW MANIPULATOR", equip_or_stow_manipulator)
				else:
					action("EQUIP RECOVERED MANIPULATOR", equip_or_stow_manipulator)
			line("Portable power cells: " + str(progression.cells) + "  ·  Press Q to use one")
			if progression.inventory.get("note",0) > 0:
				action("Inspect access note",open_menu.bind("note"))
			if progression.inventory.get("card",0) > 0:
				action("Inspect worker card",open_menu.bind("card"))
			if progression.probe_crafted:
				line("Access probe: " + ("installed" if progression.probe_installed else "stowed"))
		"card":
			_add_worker_card()
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
				password.text_changed.connect(func(_value: String) -> void: play_tone(730.0,0.018,0.018))
				menu.add_child(password)
				action("Authenticate",authenticate.bind(password))
			else:
				line("ETNA / LOCAL STATION BROWSER")
				for section in ["commands", "files", "record"]:
					action(section.to_upper(), select_terminal_section.bind(section), terminal_section != section)
				match terminal_section:
					"commands":
						line("COMMAND DIRECTORY")
						action("1 · CHECK DOOR LINK", run_terminal_command.bind("1"))
						action("2 · CLOSE EXIT DOOR", run_terminal_command.bind("2"))
						action("3 · TURN OFF AUXILIARY POWER", run_terminal_command.bind("3"))
						action("HELP", run_terminal_command.bind("HELP"))
						action("STATUS", run_terminal_command.bind("STATUS"))
						action("POWER", run_terminal_command.bind("POWER"))
						action("SPEC", run_terminal_command.bind("SPEC"), not progression.spec_unlocked and not progression.spec_released)
						action("LOG", run_terminal_command.bind("LOG"))
					"files":
						if terminal_file == "":
							line("STATION FILES")
							for file_name in ["B7-STATION-STATUS.LOG", "STAFF-ACCESS-CARD.TXT", "ACCESS-PROBE.SPEC", "GENERATOR 04 MAINTENANCE", "INCIDENT LOG"]:
								action(file_name, show_terminal_file.bind(file_name))
							action("EXPORT ACCESS-PROBE.SPEC → PHYSICAL SHARD", run_terminal_command.bind("SPEC"), not progression.spec_released and not progression.spec_unlocked)
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
					var part_button := ComponentDragButton.new()
					part_button.part_type = type
					part_button.text = "GRAB  %s  ·  %d / %d" % [type.to_upper(),progression.staged.get(type,0),progression.RECIPE[type]]
					part_button.tooltip_text = "Drag this component into the fabrication tray."
					part_button.disabled = progression.probe_crafted or not progression.can_stage(type)
					menu.add_child(part_button)
				fabrication_tray = FabricationTray.new()
				fabrication_tray.name = "FabricationTray"
				fabrication_tray.host = self
				fabrication_tray.custom_minimum_size = Vector2(0,92)
				menu.add_child(fabrication_tray)
				var tray_label := Label.new()
				tray_label.text = "FABRICATION TRAY\nDROP COMPONENTS HERE"
				tray_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
				tray_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
				tray_label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
				fabrication_tray.add_child(tray_label)
				line("Staged: " + str(progression.staged))
				action("Fabricate access probe",fabricate_probe,progression.can_fabricate(at_bench()))
				if progression.probe_crafted and not progression.probe_installed:
					line("INSTALLATION GUIDE")
					line("Drag the finished probe into MU-1's open wrist socket.")
					var probe_button := ComponentDragButton.new()
					probe_button.part_type = "access_probe"
					probe_button.text = "GRAB  FINISHED ACCESS PROBE"
					probe_button.tooltip_text = "Drag this probe onto MU-1's open wrist socket."
					menu.add_child(probe_button)
					var socket := ProbeSocketTarget.new()
					socket.name = "MU1ProbeSocket"
					socket.host = self
					socket.custom_minimum_size = Vector2(0,86)
					menu.add_child(socket)
					var socket_label := Label.new()
					socket_label.text = "MU-1 WRIST SOCKET\nDROP PROBE HERE"
					socket_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
					socket_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
					socket_label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
					socket.add_child(socket_label)
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
		"B7-STATION-STATUS.LOG":
			return "SATURN STATION / B-7 SERVICE LOG\n\nAuxiliary grid: %s\nDoor: %s\nMU-1 local service link: active\nDoor network isolated. Use a keyed Access Probe at the physical exit socket." % ["online" if powered else "offline", "open" if progression.door_open else "sealed"]
		"STAFF-ACCESS-CARD.TXT":
			if progression.inventory.get("card",0) > 0:
				return "WORKER ACCESS CARD / PERSONAL ACCESS RECORD\n\nMara Venn · B-7 service crew\nHandwritten code on reverse: ETNA."
			return "ACCESS RECORD UNAVAILABLE\nRecover the worker access card."
		"ACCESS-PROBE.SPEC":
			return "ACCESS PROBE / FABRICATION SPECIFICATION\n\nThird contact finger for the existing manipulator.\n1 servo motor · 2 reduction gears · 1 control chip · 1 armour plate · 2 wiring looms.\n\nCollect the physical shard, then fabricate at the powered maintenance station."
		"SYSTEM STATUS":
			return "Auxiliary grid: %s\nProbe socket: %s\nStaff access: authenticated" % ["online" if powered else "offline", "occupied" if progression.probe_installed else "empty"]
		"GENERATOR 04 MAINTENANCE":
			return "Auxiliary route only. Main vessel remains isolated.\nInspection crew count: 2.\nLast entry: 18 months ago."
		"STAFF DIRECTORY":
			return "MARA VENN · service crew · B-7\nCurrent assignment: lower exchanger bay."
		"INCIDENT LOG":
			return progression.record_entry if progression.record_entry != "" else "No local record entries saved."
	return "File could not be read."

func _make_inventory_preview(item_type: String, available_width: float) -> ItemPreview:
	var preview := ItemPreview.new()
	preview.name = "ItemModelPreview"
	preview.custom_minimum_size = Vector2(minf(230.0,maxf(120.0,available_width*0.42)),160.0)
	preview.mouse_filter = Control.MOUSE_FILTER_STOP
	preview.stretch = true
	var viewport := SubViewport.new()
	viewport.name = "ItemPreviewViewport"
	viewport.size = Vector2i(320,220)
	viewport.own_world_3d = true
	viewport.transparent_bg = true
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	preview.add_child(viewport)
	var stage := Node3D.new()
	stage.name = "RotatingItemModel"
	viewport.add_child(stage)
	preview.stage = stage
	var world := WorldEnvironment.new()
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("20251f")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("c7c0a3")
	environment.ambient_light_energy = 0.8
	world.environment = environment
	stage.add_child(world)
	var camera_node := Camera3D.new()
	camera_node.position = Vector3(2.4,1.65,3.4)
	camera_node.basis = Basis.looking_at(-camera_node.position,Vector3.UP)
	camera_node.current = true
	stage.add_child(camera_node)
	var key_light := OmniLight3D.new()
	key_light.position = Vector3(1.2,2.2,2.0)
	key_light.light_color = Color("f4d8a0")
	key_light.light_energy = 3.2
	key_light.omni_range = 8.0
	stage.add_child(key_light)
	if item_type == "manipulator" and recovered_arm:
		var manipulator := recovered_arm.duplicate() as Node3D
		stage.add_child(manipulator)
		manipulator.show()
		manipulator.position = Vector3(0,0.78,0)
		manipulator.scale = Vector3(1.1,1.1,1.1)
	else:
		var model := MeshInstance3D.new()
		var model_material := StandardMaterial3D.new()
		model_material.albedo_color = Color("b7a477")
		model_material.metallic = 0.28
		model_material.roughness = 0.62
		match item_type:
			"cell":
				var mesh := CylinderMesh.new()
				mesh.top_radius = 0.3
				mesh.bottom_radius = 0.34
				mesh.height = 0.92
				model.mesh = mesh
				model_material.albedo_color = Color("73816d")
			"card":
				var mesh := BoxMesh.new()
				mesh.size = Vector3(0.82,1.12,0.055)
				model.mesh = mesh
				model_material.albedo_color = Color("b5ad91")
			"note":
				var mesh := BoxMesh.new()
				mesh.size = Vector3(0.85,0.58,0.025)
				model.mesh = mesh
				model_material.albedo_color = Color("d5c17a")
			"gear":
				var mesh := TorusMesh.new()
				mesh.inner_radius = 0.22
				mesh.outer_radius = 0.43
				model.mesh = mesh
				model_material.albedo_color = Color("868675")
			"motor":
				var mesh := CylinderMesh.new()
				mesh.top_radius = 0.24
				mesh.bottom_radius = 0.24
				mesh.height = 0.86
				model.mesh = mesh
				model_material.albedo_color = Color("697663")
			"wire":
				var mesh := TorusMesh.new()
				mesh.inner_radius = 0.19
				mesh.outer_radius = 0.27
				model.mesh = mesh
				model_material.albedo_color = Color("b5884e")
			_:
				var mesh := BoxMesh.new()
				mesh.size = Vector3(0.72,0.5,0.42)
				model.mesh = mesh
		model.material_override = model_material
		stage.add_child(model)
	return preview

func _inventory_items() -> Array[String]:
	var result: Array[String] = []
	for item_type in progression.inventory:
		for _i in range(int(progression.inventory[item_type])):
			result.append(str(item_type))
	return result

func _inventory_item_description(item_type: String) -> String:
	match item_type:
		"manipulator":
			return "Lock-service tool arm. Heavy gripper can release the service case and throw the stiff auxiliary switch."
		"cell":
			return "Portable power cell. Press Q to restore 55% of MU-1's internal charge."
		"card":
			return "Mara Venn's faded B-7 service card. The reverse carries the terminal password."
		"note":
			return "A damp note recovered from the window frame. The handwritten access code is ETNA."
		"motor":
			return "Small servo motor recovered from the maintenance lockers. Required for the access probe."
		"gear":
			return "Reduction gear salvaged from the seized maintenance gripper. Required for the access probe."
		"chip":
			return "Control chip recovered from the manipulator assembly. Required for the access probe."
		"plate":
			return "Armour plate recovered from the maintenance stores. Required for the access probe."
		"wire":
			return "Flexible wiring loom salvaged from the gripper or stores. Required for the access probe."
		_:
			return "Recovered station equipment."

func select_inventory_item(item_type: String) -> void:
	inventory_inspection = item_type
	play_tone(610.0,0.025,0.02)
	refresh_menu()

func equip_or_stow_manipulator() -> void:
	var changed := progression.stow_manipulator() if progression.arm_equipped else progression.equip_manipulator()
	if changed:
		recovered_arm.visible = progression.arm_equipped
		message = "Manipulator %s." % ("stowed" if not progression.arm_equipped else "fitted to MU-1's wrist mount")
		show_notice("MANIPULATOR " + ("STOWED" if not progression.arm_equipped else "EQUIPPED"))
		_save_progress()
	refresh_menu()

func enter_generator_hall() -> void:
	get_tree().change_scene_to_file("res://generator_hall.tscn")
