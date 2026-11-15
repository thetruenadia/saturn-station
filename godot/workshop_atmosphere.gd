extends Node3D
## Reusable ceiling and wall infrastructure for the service workshop.
## The exposed cable looms echo the observatory machinery reference while
## keeping the work floor, lockers, and service routes open.

func _ready() -> void:
	_add_ceiling_trays()
	_add_hanging_umbilicals()
	_add_wall_pipework()
	_add_distribution_cabinets()

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
