extends Node3D
## Reusable ceiling and wall infrastructure for the service workshop.
## The exposed cable looms echo the observatory machinery reference while
## keeping the work floor, lockers, and service routes open.

var work_fixture_lights: Array[OmniLight3D] = []
var work_fixture_emitters: Array[MeshInstance3D] = []
var emergency_lights: Array[OmniLight3D] = []
var emergency_emitters: Array[MeshInstance3D] = []
var powered := false
var ignition_elapsed := 0.0
var ignition_active := false

func _ready() -> void:
	_add_ceiling_trays()
	_add_hanging_umbilicals()
	_add_wall_pipework()
	_add_distribution_cabinets()
	_add_lighting_fixtures()
	set_power_state(false)

func _process(delta: float) -> void:
	if not ignition_active:
		return
	ignition_elapsed += delta
	var complete := true
	for index in range(work_fixture_lights.size()):
		var elapsed := ignition_elapsed-float(index)*0.18
		var level := 0.0
		if elapsed >= 0.0:
			if elapsed < 0.16:
				level = 0.65
			elif elapsed < 0.38:
				level = 0.08
			elif elapsed < 0.65:
				level = 0.85
			elif elapsed < 0.82:
				level = 0.35
			else:
				level = minf(1.0,0.6+(elapsed-0.82)*2.0)
		if level < 1.0:
			complete = false
		work_fixture_lights[index].light_energy = 2.1*level
		var emitter_material := work_fixture_emitters[index].material_override as StandardMaterial3D
		emitter_material.emission_energy_multiplier = 3.5*level
	if complete:
		ignition_active = false

func set_power_state(value: bool) -> void:
	powered = value
	ignition_elapsed = 0.0
	ignition_active = value
	for index in range(work_fixture_lights.size()):
		work_fixture_lights[index].light_energy = 0.0
		var emitter_material := work_fixture_emitters[index].material_override as StandardMaterial3D
		emitter_material.emission_energy_multiplier = 0.0
	for index in range(emergency_lights.size()):
		emergency_lights[index].light_energy = 0.08 if value else 0.58
		var emitter_material := emergency_emitters[index].material_override as StandardMaterial3D
		emitter_material.emission_energy_multiplier = 0.35 if value else 2.4

func _add_lighting_fixtures() -> void:
	var fixture_positions: Array[Vector3] = [Vector3(-9,4.5,6),Vector3(6,4.7,5),Vector3(-7,4.7,-4),Vector3(5,4.6,-7),Vector3(11.4,4,-9.5),Vector3(0,5,-1)]
	var fixture_colors: Array[Color] = [Color("ffd6a0"),Color("ffd6a0"),Color("ffd6a0"),Color("c5e5e8"),Color("e9edcc"),Color("e4dfbd")]
	for index in range(fixture_positions.size()):
		var position := fixture_positions[index]
		for side in [-1,1]:
			_pipe(self,"LightFixtureSuspension",Vector3(position.x+float(side)*0.55,5.9,position.z),Vector3(position.x+float(side)*0.55,position.y,position.z),0.022,Color("676356"))
		_box(self,"IndustrialLightHousing",position,Vector3(1.55,0.18,0.52),Color("383c35"))
		var emitter := _box(self,"WorkLightEmitter",position+Vector3(0,-0.105,0),Vector3(1.28,0.045,0.34),fixture_colors[index])
		var emitter_material := StandardMaterial3D.new()
		emitter_material.albedo_color = fixture_colors[index]
		emitter_material.emission_enabled = true
		emitter_material.emission = fixture_colors[index]
		emitter_material.emission_energy_multiplier = 0.0
		emitter.material_override = emitter_material
		var light := OmniLight3D.new()
		light.name = "StagedWorkLight_%02d" % index
		light.position = position+Vector3(0,-0.35,0)
		light.light_color = fixture_colors[index]
		light.omni_range = 11.0
		light.light_energy = 0.0
		light.shadow_enabled = false
		add_child(light)
		work_fixture_emitters.append(emitter)
		work_fixture_lights.append(light)
	# Emergency beacons sit directly on the wall structure; there are no freestanding light poles.
	var emergency_positions: Array[Vector3] = [Vector3(-13.55,4.1,6),Vector3(-13.55,3.0,-5),Vector3(-13.55,1.8,0),Vector3(13.55,4.1,-8),Vector3(13.55,2.9,5),Vector3(13.55,1.8,-2)]
	for index in range(emergency_positions.size()):
		var position := emergency_positions[index]
		var panel := _box(self,"EmergencyBeaconHousing",position,Vector3(0.14,0.44,0.52),Color("33362f"))
		panel.rotation.y = PI/2.0 if position.x < 0.0 else -PI/2.0
		var emitter := _box(self,"EmergencyBeaconEmitter",position+Vector3(0.05 if position.x < 0.0 else -0.05,0,0),Vector3(0.06,0.32,0.34),Color("a6190d"))
		emitter.rotation.y = panel.rotation.y
		var emitter_material := StandardMaterial3D.new()
		emitter_material.albedo_color = Color("a6190d")
		emitter_material.emission_enabled = true
		emitter_material.emission = Color("ff1608")
		emitter.material_override = emitter_material
		var light := OmniLight3D.new()
		light.name = "WallEmergencyLight_%02d" % index
		light.position = position+Vector3(0.34 if position.x < 0.0 else -0.34,0,0)
		light.light_color = Color("ff2410")
		light.omni_range = 8.0
		light.shadow_enabled = false
		add_child(light)
		emergency_emitters.append(emitter)
		emergency_lights.append(light)

func _material(color: Color, metal := 0.55, rough := 0.8) -> StandardMaterial3D:
	var result := StandardMaterial3D.new()
	result.albedo_color = color
	result.metallic = metal
	result.roughness = rough
	return result

func _box(parent: Node3D, name: String, position: Vector3, size: Vector3, color: Color) -> MeshInstance3D:
	var result := MeshInstance3D.new()
	result.name = name
	var mesh := BoxMesh.new()
	mesh.size = size
	result.mesh = mesh
	result.material_override = _material(color)
	result.position = position
	parent.add_child(result)
	return result

func _pipe(parent: Node3D, name: String, a: Vector3, b: Vector3, radius: float, color: Color) -> MeshInstance3D:
	var result := MeshInstance3D.new()
	result.name = name
	var mesh := CylinderMesh.new()
	mesh.top_radius = radius
	mesh.bottom_radius = radius
	mesh.height = a.distance_to(b)
	mesh.radial_segments = 10
	result.mesh = mesh
	result.material_override = _material(color,0.7,0.74)
	result.position = (a+b)*0.5
	result.quaternion = Quaternion(Vector3.UP,(b-a).normalized())
	parent.add_child(result)
	return result

func _wire(parent: Node3D, name: String, points: Array[Vector3], radius: float, color: Color) -> void:
	for i in range(points.size()-1):
		_pipe(parent,"%s_%02d" % [name,i],points[i],points[i+1],radius,color)

func _add_ceiling_trays() -> void:
	for z in [-5.0,-2.5,0.0,2.5,5.0]:
		_box(self,"CeilingCableTray",Vector3(0,5.75,z),Vector3(25.5,0.13,0.48),Color("465149"))
		for x in range(-12,13,3):
			_box(self,"TrayCrossRib",Vector3(float(x),5.64,z),Vector3(0.09,0.16,0.56),Color("73684f"))
	for x in [-10.0,-5.0,0.0,5.0,10.0]:
		_box(self,"OverheadGirder",Vector3(x,5.91,0),Vector3(0.22,0.20,20.0),Color("37423c"))
		_box(self,"GirderRustSeam",Vector3(x+0.13,5.80,0),Vector3(0.035,0.035,18.0),Color("70412b"))
	# Broad dull-steel exhaust runs tie the wall and overhead service routes together.
	for z in [-8.7,8.7]:
		_pipe(self,"MainExhaustRun",Vector3(-11,5.15,z),Vector3(11,5.15,z),0.22,Color("58574c"))
		for x in [-9.0,-3.0,3.0,9.0]:
			_pipe(self,"ExhaustHanger",Vector3(x,5.15,z),Vector3(x,5.78,z),0.035,Color("786a54"))

func _add_hanging_umbilicals() -> void:
	var cable_colors := [Color("171d1b"),Color("262c29"),Color("65513a"),Color("3c4940"),Color("181817")]
	for cable_index in range(cable_colors.size()):
		var x := -1.25+float(cable_index)*0.62
		var offset := float(cable_index%2)*0.24
		var start := Vector3(x,5.65,-4.3+offset)
		var sag := Vector3(x+0.24,3.35+float(cable_index%3)*0.16,-2.8+offset)
		var return_point := Vector3(x+0.62,3.12+float(cable_index%3)*0.16,-0.8+offset)
		var rise := Vector3(x+0.92,5.62,1.6+offset)
		_wire(self,"HangingPowerUmbilical_%02d" % cable_index,[start,sag,return_point,rise],0.035+float(cable_index%2)*0.012,cable_colors[cable_index])
		_pipe(self,"CableGland",start-Vector3(0,0.03,0),start+Vector3(0,0.11,0),0.10,Color("777261"))
	# Several separate service bundles hang nearer each wall, like old veins.
	for side in [-1,1]:
		for i in range(4):
			var x := float(side)*(8.6+float(i)*0.34)
			_wire(self,"WallDrop_%s_%s" % [side,i],[Vector3(x,5.5,-1.0),Vector3(x,4.55,-0.7),Vector3(x+float(side)*0.28,3.9,-0.3)],0.025,Color("302f29") if i%2==0 else Color("6b5941"))

func _add_wall_pipework() -> void:
	for side in [-1,1]:
		var x := float(side)*13.45
		for i in range(4):
			var y := 1.65+float(i)*0.78
			_pipe(self,"WallReturnPipe",Vector3(x,y,-9.6),Vector3(x,y,9.6),0.055+float(i%2)*0.025,Color("676356") if i%2==0 else Color("4e594f"))
			for z in [-8.0,-2.0,4.0,8.0]:
				_pipe(self,"WallPipeClamp",Vector3(x,y,z-0.13),Vector3(x,y,z+0.13),0.12,Color("302e29"))
		_pipe(self,"UprightServiceManifold",Vector3(x,0.5,-8.9),Vector3(x,5.5,-8.9),0.17,Color("5a5b4e"))
		for y in [1.2,2.5,3.8,5.0]:
			_pipe(self,"ManifoldBranch",Vector3(x,y,-8.9),Vector3(x-float(side)*1.1,y,-8.9),0.07,Color("655542"))
	# Service conduits run across the back wall to the cabinets and generator rack.
	for y in [2.0,2.35,2.72,3.12]:
		_pipe(self,"BackWallConduit",Vector3(-12.8,y,-10.62),Vector3(12.8,y,-10.62),0.045,Color("373d36") if y<2.7 else Color("614a36"))
	for x in [-11.0,-6.0,1.5,7.5,11.0]:
		_pipe(self,"BackWallConduitDrop",Vector3(x,1.0,-10.62),Vector3(x,3.2,-10.62),0.04,Color("373d36"))

func _add_distribution_cabinets() -> void:
	var cabinet_color := Color("56594a")
	for index in range(5):
		var x := -3.8+float(index)*1.75
		_box(self,"WallDistributionCabinet_%02d" % index,Vector3(x,3.95,-10.30),Vector3(1.48,2.25,0.42),cabinet_color)
		_box(self,"CabinetInsetDoor",Vector3(x,3.95,-10.07),Vector3(1.24,1.95,0.045),Color("626454"))
		_box(self,"CabinetRustedHinge",Vector3(x-0.57,3.95,-10.02),Vector3(0.055,1.80,0.06),Color("70412b"))
		_box(self,"CabinetWarningStripe",Vector3(x-0.39,4.70,-10.00),Vector3(0.40,0.10,0.045),Color("b29252"))
		for lamp in range(3):
			var indicator := MeshInstance3D.new()
			indicator.name = "CabinetStatusLamp"
			var sphere := SphereMesh.new()
			sphere.radius = 0.045
			sphere.height = 0.09
			indicator.mesh = sphere
			indicator.material_override = _material(Color("796148") if lamp==0 else Color("46473b"),0.1,0.3)
			indicator.position = Vector3(x+0.40,4.48-float(lamp)*0.20,-9.96)
			add_child(indicator)
