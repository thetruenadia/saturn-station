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
var exit_door: MeshInstance3D
var probe_visual: MeshInstance3D
var message := ""
var dragging := false
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
	block(self, Vector3(-2.15,3,-11), Vector3(23.7,6,0.55), "171f1d", true)
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
	visual = Node3D.new()
	player.add_child(visual)
	block(visual,Vector3(0,2.05,0),Vector3(1.15,0.72,2.4),"667865")
	block(visual,Vector3(0.18,2.16,1.25),Vector3(0.48,0.43,0.2),"242826")
	var optic := block(visual,Vector3(0.18,2.16,1.37),Vector3(0.18,0.18,0.05),"b84c38")
	optic.material_override = material("b84c38",true)
	block(visual,Vector3(-0.3,2.48,-0.3),Vector3(0.38,0.19,0.65),"82917a")
	for side in [-1,1]:
		var thigh := block(visual,Vector3(side*0.72,1.45,-0.22),Vector3(0.28,0.95,0.35),"414d43")
		thigh.rotation.x = -0.35
		var shin := block(visual,Vector3(side*0.84,0.65,-0.03),Vector3(0.22,1.03,0.27),"777c70")
		shin.rotation.x = 0.44
		block(visual,Vector3(side*0.84,0.13,0.32),Vector3(0.37,0.22,0.9),"242826")
	camera = Camera3D.new()
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.current = true
	add_child(camera)
	var layer := CanvasLayer.new()
	add_child(layer)
	hud = Label.new()
	layer.add_child(hud)
	hud.position = Vector2(24,20)
	hud.add_theme_font_size_override("font_size",20)
	prompt = Label.new()
	layer.add_child(prompt)
	prompt.position = Vector2(24,110)
	prompt.add_theme_font_size_override("font_size",17)
	setup_progression(layer)
	update_camera()

func update_camera() -> void:
	var focus := player.position + Vector3(0,1.3,0)
	var offset := Vector3(sin(yaw)*cos(pitch),sin(pitch),cos(yaw)*cos(pitch))*20.0
	camera.position = focus + offset
	camera.look_at(focus)
	camera.size = zoom

func _unhandled_input(event: InputEvent) -> void:
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
	player.position.x = clampf(player.position.x,-12.5,12.5)
	player.position.z = clampf(player.position.z,-9.5,9.5)
	nearby = nearest_target()
	update_camera()
	hud.text = "SATURN STATION  /  GODOT FOUNDATION\nMU-1   |   CHARGE %03d%%   |   GRID %s" % [int(ceil(charge)), "ONLINE" if powered else "OFFLINE"]
	prompt.text = "WASD move  /  Drag orbit  /  Wheel zoom  /  R reset  /  I inventory  /  Esc pause"
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

func setup_progression(layer: CanvasLayer) -> void:
	targets = {"Service case":Vector2(-5,2),"Auxiliary power":Vector2(-10.8,-8.5),"ETNA terminal":Vector2(5,-5.5),"Maintenance station":Vector2(-9,2.2),"Broken claw":Vector2(-7.2,3),"Specification shard":Vector2(5.4,-3.95),"Maintenance exit":Vector2(11.4,-10.6)}
	claw = block(self,Vector3(-7.2,0.25,3),Vector3(0.65,0.3,0.42),"68765b")
	for side in [-1,1]:
		var finger := block(claw,Vector3(side*0.21,0,0.34),Vector3(0.1,0.16,0.46),"777c70")
		finger.rotation.y = side*0.25
	shard = block(self,Vector3(5.4,0.65,-3.95),Vector3(0.35,0.48,0.12),"69bc9c")
	shard.material_override = material("69bc9c",true)
	shard.hide()
	probe_visual = block(visual,Vector3(0.65,1.7,1.1),Vector3(0.12,0.15,0.65),"987344")
	probe_visual.hide()
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
			message = progression.use_case()
		"Auxiliary power":
			powered = true
			progression.powered = true
			power_lamp.material_override = material("72ff92",true)
			amber_light.light_color = Color("d4b56d")
			message = "Auxiliary grid online."
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
				message = "Claw dismantled: gears, chip, wire."
		"Specification shard":
			if progression.collect_spec():
				shard.hide()
				message = "Fabrication specification recovered."
		"Maintenance exit":
			message = progression.use_exit()
			if progression.door_open:
				exit_door.position.y = 4.8
		_:
			if nearby.begins_with("Locker "):
				open_menu(nearby)

func open_menu(next: String) -> void:
	mode = next
	dragging = false
	interface.show()
	refresh_menu()

func close_menu() -> void:
	mode = ""
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
	refresh_menu()

func take_part(index: int, type: String) -> void:
	progression.take(index,type)
	refresh_menu()

func authenticate(password: LineEdit) -> void:
	message = progression.login(password.text)
	refresh_menu()

func export_spec() -> void:
	if progression.release_spec():
		shard.show()
	close_menu()

func fabricate_probe() -> void:
	progression.fabricate(at_bench())
	refresh_menu()

func place_probe() -> void:
	progression.install_placed = true
	refresh_menu()

func install_probe() -> void:
	if progression.install(at_bench()):
		probe_visual.show()
	refresh_menu()

func refresh_menu() -> void:
	for child in menu.get_children():
		menu.remove_child(child)
		child.queue_free()
	line("SATURN STATION / " + mode.to_upper())
	match mode:
		"inventory":
			for item in progression.inventory:
				line(item.capitalize() + " × " + str(progression.inventory[item]))
			line("Power cells: " + str(progression.cells))
			if progression.inventory.get("card",0) > 0:
				action("Inspect worker card",open_menu.bind("card"))
			if progression.probe_crafted:
				line("Access probe: " + ("installed" if progression.probe_installed else "stowed"))
		"card":
			line("Mara Venn / Staff access card")
			line("Handwritten note: ETNA")
		"terminal":
			if not progression.authenticated:
				var password := LineEdit.new()
				password.placeholder_text = "Password"
				menu.add_child(password)
				action("Authenticate",authenticate.bind(password))
			else:
				line("ETNA / auxiliary grid online")
				action("Export access probe specification",export_spec,not progression.spec_unlocked and not progression.spec_released)
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
