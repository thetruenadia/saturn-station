extends Node3D
## Native reconstruction of the low, heavy MU-1 maintenance unit.
## Geometry follows the original Three.js silhouette and remains separated
## into named shell, arm, pelvis, and articulated leg nodes for editor work.

const SAGE := Color("667865")
const SAGE_LIGHT := Color("82917a")
const SAGE_DARK := Color("414d43")
const GUNMETAL := Color("242826")
const JOINT := Color("181a19")
const STEEL := Color("777c70")
const RUBBER := Color("0f1010")
const RUST := Color("70412b")
const BRASS := Color("987344")

var body: Node3D
var shell: Node3D
var original_arm: Node3D
var recovered_arm: Node3D
var access_probe: Node3D
var hips: Array[Node3D] = []
var knees: Array[Node3D] = []
var ankles: Array[Node3D] = []
var leg_states: Array[Dictionary] = []
var phase := 0.0
var stride := 0.0
var stride_target := 0.0
var reaching := 0.0
var servicing := false

func _ready() -> void:
	if has_node("Body"):
		return
	scale = Vector3.ONE * 0.84
	_build_chassis()
	_build_arms()
	_build_legs()
	_build_wear()

func mat(color: Color, metal := 0.2, rough := 0.8, glow := false) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.metallic = metal
	material.roughness = rough
	if glow:
		material.emission_enabled = true
		material.emission = color
		material.emission_energy_multiplier = 1.5
	return material

func box(parent: Node3D, node_name: String, position: Vector3, size: Vector3, color: Color, rotation := Vector3.ZERO, metal := 0.2, rough := 0.8) -> MeshInstance3D:
	var mesh_instance := MeshInstance3D.new()
	mesh_instance.name = node_name
	var shape := BoxMesh.new()
	shape.size = size
	mesh_instance.mesh = shape
	mesh_instance.material_override = mat(color, metal, rough)
	mesh_instance.position = position
	mesh_instance.rotation = rotation
	mesh_instance.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
	mesh_instance.gi_mode = GeometryInstance3D.GI_MODE_DISABLED
	parent.add_child(mesh_instance)
	return mesh_instance

func cylinder(parent: Node3D, node_name: String, position: Vector3, radius: float, length: float, color: Color, axis_x := false, axis_z := false, metal := 0.75, rough := 0.48) -> MeshInstance3D:
	var mesh_instance := MeshInstance3D.new()
	mesh_instance.name = node_name
	var shape := CylinderMesh.new()
	shape.top_radius = radius
	shape.bottom_radius = radius
	shape.height = length
	shape.radial_segments = 16
	mesh_instance.mesh = shape
	mesh_instance.material_override = mat(color, metal, rough)
	mesh_instance.position = position
	if axis_x:
		mesh_instance.rotation.z = PI * 0.5
	elif axis_z:
		mesh_instance.rotation.x = PI * 0.5
	mesh_instance.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
	parent.add_child(mesh_instance)
	return mesh_instance

func beam(parent: Node3D, node_name: String, a: Vector3, b: Vector3, width: float, depth: float, color: Color) -> MeshInstance3D:
	var delta := b - a
	var mesh_instance := box(parent, node_name, (a + b) * 0.5, Vector3(width, delta.length(), depth), color)
	mesh_instance.quaternion = Quaternion(Vector3.UP, delta.normalized())
	return mesh_instance

func tube(parent: Node3D, node_name: String, points: Array[Vector3], radius: float, color: Color, metal := 0.05) -> Node3D:
	var assembly := Node3D.new()
	assembly.name = node_name
	parent.add_child(assembly)
	for i in range(points.size()-1):
		var start := points[i]
		var finish := points[i+1]
		var delta := finish-start
		var segment := MeshInstance3D.new()
		segment.name = "Segment_%02d" % i
		var shape := CylinderMesh.new()
		shape.top_radius = radius
		shape.bottom_radius = radius
		shape.height = delta.length()
		shape.radial_segments = 8
		segment.mesh = shape
		segment.material_override = mat(color,metal,0.78)
		segment.position = (start+finish)*0.5
		segment.quaternion = Quaternion(Vector3.UP,delta.normalized())
		assembly.add_child(segment)
	return assembly

func _build_chassis() -> void:
	body = Node3D.new()
	body.name = "Body"
	add_child(body)
	shell = Node3D.new()
	shell.name = "CastChassis"
	shell.position = Vector3(0, 2.48, 0)
	body.add_child(shell)
	_add_wedge(shell, "LowCastHull", [
		[-1.02,0.49,-0.23,0.26,-0.06],[-0.77,0.58,-0.27,0.35,-0.04],
		[-0.25,0.63,-0.29,0.39,-0.02],[0.18,0.62,-0.28,0.33,0.02],
		[0.60,0.55,-0.27,0.23,0.07],[1.03,0.45,-0.24,0.16,0.10],
		[1.18,0.34,-0.17,0.10,0.10]], SAGE)
	_add_wedge(shell, "RaisedRearFairing", [
		[-1.08,0.40,0.10,0.33,-0.09],[-0.84,0.48,0.12,0.47,-0.08],
		[-0.38,0.49,0.15,0.48,-0.07],[-0.11,0.38,0.13,0.40,-0.06]], SAGE_LIGHT)
	_add_wedge(shell, "OffsetServiceBoom", [
		[-1.42,0.18,0.15,0.34,-0.48],[-1.24,0.19,0.15,0.36,-0.49],
		[-0.77,0.18,0.17,0.37,-0.48],[-0.58,0.15,0.16,0.32,-0.48]], SAGE_LIGHT)
	_add_wedge(shell, "FrontOpticCheek", [
		[-0.32,0.25,-0.23,0.30,0.42],[0.22,0.28,-0.26,0.30,0.43],
		[0.70,0.25,-0.25,0.22,0.43],[1.11,0.18,-0.18,0.12,0.39],
		[1.24,0.12,-0.10,0.055,0.36]], SAGE_LIGHT)
	_add_wedge(shell, "ShortLeftCheek", [
		[-0.29,0.14,-0.21,0.30,-0.48],[0.22,0.17,-0.23,0.27,-0.48],
		[0.69,0.13,-0.21,0.19,-0.43],[1.02,0.09,-0.12,0.10,-0.39]], SAGE)
	box(shell, "TopServicePanel", Vector3(0.03,0.43,0.16), Vector3(0.70,0.04,0.76), GUNMETAL, Vector3(-0.10,0,0), 0.82, 0.4)
	box(shell, "RearCoolingRibs", Vector3(-0.47,0.30,-1.30), Vector3(0.60,0.15,0.21), SAGE_LIGHT)
	box(shell, "RearIdentificationPlate", Vector3(0.15,0.49,-0.68), Vector3(0.35,0.04,0.15), GUNMETAL)
	var optic := Node3D.new()
	optic.name = "PrimaryRedOptic"
	optic.position = Vector3(0.67,-0.065,0.94)
	optic.rotation.y = PI * 0.5
	shell.add_child(optic)
	cylinder(optic, "RecessedOpticCollar", Vector3.ZERO, 0.21, 0.16, JOINT, false, true, 0.9, 0.25)
	cylinder(optic, "RawSteelLensRim", Vector3(0,0,0.12), 0.15, 0.04, STEEL, false, true)
	var lens := MeshInstance3D.new()
	lens.name = "RedLens"
	var lens_mesh := SphereMesh.new()
	lens_mesh.radius = 0.105
	lens_mesh.height = 0.21
	lens.mesh = lens_mesh
	lens.position.z = 0.15
	lens.material_override = mat(Color("ff3518"), 0.0, 0.12, true)
	optic.add_child(lens)
	var pelvis := Node3D.new()
	pelvis.name = "Pelvis"
	body.add_child(pelvis)
	box(pelvis, "LoadBearingPelvis", Vector3(0,1.96,-0.035), Vector3(0.88,0.29,0.66), GUNMETAL, Vector3.ZERO, 0.85, 0.4)
	box(pelvis, "InnerPelvisPlate", Vector3(0,1.77,-0.02), Vector3(0.62,0.19,0.54), JOINT, Vector3.ZERO, 0.9, 0.28)
	box(pelvis, "LowerPelvisCap", Vector3(0,1.67,-0.02), Vector3(0.42,0.12,0.42), STEEL, Vector3.ZERO, 0.82, 0.46)
	for side in [-1, 1]:
		var x := float(side)
		cylinder(pelvis, "HipDrum_%s" % side, Vector3(x * 0.51,1.91,0), 0.29, 0.24, JOINT, true)
		cylinder(pelvis, "HipOuter_%s" % side, Vector3(x * 0.53,1.91,0), 0.225, 0.28, GUNMETAL, true, false, 0.85, 0.4)
		cylinder(pelvis, "HipPin_%s" % side, Vector3(x * 0.55,1.91,0), 0.125, 0.30, STEEL, true)
		box(pelvis, "OutboardServiceHousing_%s" % side, Vector3(x * 0.69,1.80,-0.025), Vector3(0.23,0.22,0.29), SAGE_DARK)
		for i in range(3):
			tube(pelvis, "BellyCable_%s_%s" % [side,i], [Vector3(x * 0.12,2.20,0.27),Vector3(x * 0.15,2.08,0.34),Vector3(x * 0.20,1.94,0.30),Vector3(x * 0.25,1.82,0.16)], 0.035, RUBBER)
		var hydraulic_points: Array[Vector3] = [Vector3(x*0.31,2.18,-0.43),Vector3(x*0.42,2.04,-0.53),Vector3(x*0.54,1.90,-0.47),Vector3(x*0.61,1.78,-0.34)]
		tube(pelvis, "BrassHydraulic_%s" % side, hydraulic_points, 0.022, BRASS, 0.75)
	var manipulator := Node3D.new()
	manipulator.name = "FoldedBellyManipulator"
	manipulator.position = Vector3(-0.05,1.70,-0.42)
	body.add_child(manipulator)
	box(manipulator, "ManipulatorMount", Vector3(0,0,-0.08), Vector3(0.20,0.13,0.34), GUNMETAL)
	box(manipulator, "ManipulatorForearm", Vector3(0,-0.02,-0.31), Vector3(0.13,0.11,0.27), STEEL, Vector3.ZERO, 0.82, 0.46)
	beam(manipulator, "ManipulatorLink", Vector3(0,-0.02,-0.40), Vector3(0,-0.02,-0.60), 0.045,0.045,GUNMETAL)
	for side in [-1,1]:
		beam(manipulator, "ManipulatorClaw_%s" % side, Vector3(0,-0.02,-0.60), Vector3(float(side)*0.085,-0.045,-0.76), 0.038,0.038,STEEL)

func _add_wedge(parent: Node3D, node_name: String, rings: Array, color: Color) -> void:
	var vertices := PackedVector3Array()
	var indices := PackedInt32Array()
	for ring in rings:
		var z: float = ring[0]
		var half_width: float = ring[1]
		var bottom: float = ring[2]
		var top: float = ring[3]
		var offset: float = ring[4]
		vertices.append_array(PackedVector3Array([Vector3(offset-half_width,bottom,z),Vector3(offset+half_width,bottom,z),Vector3(offset+half_width,top,z),Vector3(offset-half_width,top,z)]))
	indices.append_array(PackedInt32Array([0,3,2,0,2,1]))
	for i in range(rings.size()-1):
		for side in range(4):
			var a := i*4+side
			var b := i*4+((side+1)%4)
			indices.append_array(PackedInt32Array([a,b,b+4,a,b+4,a+4]))
	var end := (rings.size()-1)*4
	indices.append_array(PackedInt32Array([end,end+1,end+2,end,end+2,end+3]))
	var arrays := []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = vertices
	arrays[Mesh.ARRAY_INDEX] = indices
	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
	mesh.surface_set_material(0, mat(color,0.18,0.72))
	var instance := MeshInstance3D.new()
	instance.name = node_name
	instance.mesh = mesh
	instance.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
	parent.add_child(instance)

func _build_arms() -> void:
	var olive := mat(Color("697663"), 0.18, 0.9)
	var factory_yellow := mat(Color("b49a57"), 0.3, 0.83)
	original_arm = Node3D.new()
	original_arm.name = "OriginalMaintenanceArm"
	original_arm.position = Vector3(-0.94,-0.17,0.12)
	shell.add_child(original_arm)
	cylinder(original_arm,"ShoulderBearing",Vector3.ZERO,0.16,0.32,JOINT,true)
	var upper := box(original_arm,"UpperLink",Vector3(-0.13,-0.35,0),Vector3(0.19,0.58,0.23),Color("313731"),Vector3(0,0,-0.22))
	upper.material_override = olive
	cylinder(original_arm,"ElbowBearing",Vector3(-0.22,-0.65,0),0.14,0.25,JOINT,true)
	var fore := box(original_arm,"ForearmLink",Vector3(-0.27,-0.94,0.05),Vector3(0.17,0.55,0.18),Color("697663"),Vector3(0,0,0.12))
	fore.material_override = olive
	box(original_arm,"GripperPalm",Vector3(-0.30,-1.24,0.06),Vector3(0.25,0.17,0.2),GUNMETAL)
	for side in [-1,1]:
		box(original_arm,"GripperJaw_%s" % side,Vector3(-0.3+float(side)*0.1,-1.4,0.06),Vector3(0.07,0.24,0.09),GUNMETAL)
	recovered_arm = Node3D.new()
	recovered_arm.name = "RecoveredYellowServiceArm"
	recovered_arm.position = Vector3(0.91,-0.13,0.33)
	shell.add_child(recovered_arm)
	cylinder(recovered_arm,"YellowArmBearing",Vector3.ZERO,0.21,0.35,GUNMETAL,true)
	box(recovered_arm,"ShoulderArmor",Vector3(0,-0.1,0),Vector3(0.31,0.18,0.31),Color("c69a3d"))
	var upper_arm := box(recovered_arm,"UpperArm",Vector3(0.12,-0.38,0.02),Vector3(0.26,0.55,0.3),Color("c69a3d"),Vector3(0,0,0.28))
	upper_arm.material_override = factory_yellow
	cylinder(recovered_arm,"SteelElbow",Vector3(0.23,-0.66,0.05),0.18,0.33,STEEL,true)
	var forearm := box(recovered_arm,"YellowForearm",Vector3(0.30,-0.98,0.1),Vector3(0.3,0.58,0.27),Color("c69a3d"),Vector3(0,0,-0.12))
	forearm.material_override = factory_yellow
	for i in range(4):
		var stripe := box(recovered_arm,"SafetyStripe_%02d" % i,Vector3(0.30,-0.78-i*0.13,0.1),Vector3(0.32,0.075,0.3),Color("222521"))
		stripe.rotation.z = -0.12
	box(recovered_arm,"HeavyGripperPalm",Vector3(0.34,-1.33,0.13),Vector3(0.38,0.2,0.31),GUNMETAL)
	for side in [-1,1]:
		box(recovered_arm,"SteelJaw_%s" % side,Vector3(0.34+float(side)*0.17,-1.55,0.13),Vector3(0.085,0.33,0.12),STEEL)
	recovered_arm.hide()
	access_probe = Node3D.new()
	access_probe.name = "WristAccessProbe"
	access_probe.position = Vector3(0.35,-1.58,0.16)
	recovered_arm.add_child(access_probe)
	box(access_probe,"ProbeBody",Vector3(0,-0.1,0.10),Vector3(0.09,0.20,0.52),BRASS)
	box(access_probe,"ProbeTip",Vector3(0,-0.1,0.40),Vector3(0.06,0.11,0.13),STEEL)
	access_probe.hide()

func _build_legs() -> void:
	for side in [-1,1]:
		var s := float(side)
		var hip := Node3D.new()
		hip.name = "LeftHip" if side < 0 else "RightHip"
		hip.position = Vector3(s*0.53,1.88,0)
		add_child(hip)
		cylinder(hip,"HipAxle",Vector3.ZERO,0.23,0.22,JOINT,true)
		cylinder(hip,"HipDrum",Vector3(s*0.015,0,0),0.17,0.25,GUNMETAL,true)
		cylinder(hip,"AxlePin",Vector3(s*0.025,0,0),0.085,0.28,STEEL,true)
		var knee_pos := Vector3(s*0.28,-0.77,-0.39)
		beam(hip,"ArmoredThigh",Vector3(0,-0.10,0),knee_pos,0.27,0.34,SAGE_DARK)
		beam(hip,"ThighEnamelFace",Vector3(s*0.015,-0.15,0.12),Vector3(s*0.13,-0.61,-0.045),0.20,0.075,SAGE)
		beam(hip,"ThighPistonGuide",Vector3(s*0.02,-0.17,-0.14),Vector3(s*0.14,-0.61,-0.30),0.055,0.06,STEEL)
		var knee := Node3D.new()
		knee.name = "LeftReverseKnee" if side < 0 else "RightReverseKnee"
		knee.position = knee_pos
		hip.add_child(knee)
		var knee_sphere := MeshInstance3D.new()
		knee_sphere.name = "ReverseKneeCore"
		var sphere := SphereMesh.new()
		sphere.radius = 0.145
		sphere.height = 0.29
		knee_sphere.mesh = sphere
		knee_sphere.material_override = mat(JOINT,0.9,0.25)
		knee.add_child(knee_sphere)
		cylinder(knee,"KneePin",Vector3.ZERO,0.12,0.29,STEEL,true)
		for cheek_side in [-1,1]:
			var cheek := box(knee,"Clevis_%s" % cheek_side,Vector3(float(cheek_side)*0.13,0,-0.015),Vector3(0.055,0.25,0.23),GUNMETAL,Vector3(0,0,-0.12))
			cylinder(knee,"ClevisPin_%s" % cheek_side,Vector3(float(cheek_side)*0.17,0,0),0.045,0.045,STEEL,true)
		var shin_end := Vector3(-s*0.18,-0.88,0.58)
		beam(knee,"ForwardReturnShin",Vector3(0,-0.04,0),shin_end,0.13,0.16,GUNMETAL)
		beam(knee,"RemovableGreenShinArmor",Vector3(s*0.015,-0.12,0.075),Vector3(-s*0.035,-0.62,0.38),0.23,0.20,SAGE)
		beam(knee,"ShinRaisedRib",Vector3(s*0.015,-0.12,0.18),Vector3(-s*0.035,-0.60,0.47),0.17,0.045,SAGE_LIGHT)
		beam(knee,"HydraulicPiston",Vector3(-s*0.11,-0.12,0.14),Vector3(-s*0.07,-0.59,0.43),0.035,0.035,STEEL)
		beam(knee,"DarkActuatorRod",Vector3(-s*0.11,-0.12,0.14),Vector3(-s*0.10,-0.43,0.29),0.052,0.052,JOINT)
		tube(knee,"KneeFluidLine",[Vector3(-s*0.04,-0.16,-0.08),Vector3(-s*0.08,-0.34,-0.10),Vector3(-s*0.06,-0.53,0.02),Vector3(-s*0.03,-0.66,0.26)],0.014,RUBBER)
		for i in range(3):
			cylinder(knee,"BrassTubeClip_%02d" % i,Vector3(-s*0.02,-0.25-i*0.14,0.12+i*0.055),0.035,0.045,BRASS)
		var ankle := Node3D.new()
		ankle.name = "LeftAnkle" if side < 0 else "RightAnkle"
		ankle.position = shin_end
		knee.add_child(ankle)
		cylinder(ankle,"AnklePivot",Vector3(0,-0.015,0),0.105,0.20,JOINT,true)
		box(ankle,"BroadFootPlate",Vector3(0,-0.12,0.08),Vector3(0.34,0.10,0.34),GUNMETAL)
		box(ankle,"SteelSole",Vector3(0,-0.06,0.09),Vector3(0.29,0.035,0.28),STEEL)
		for toe_side in [-1,1]:
			box(ankle,"ForwardToe_%s" % toe_side,Vector3(float(toe_side)*0.105,-0.17,0.32),Vector3(0.105,0.075,0.37),STEEL,Vector3(-0.12,0,0))
			box(ankle,"ToeCap_%s" % toe_side,Vector3(float(toe_side)*0.105,-0.205,0.55),Vector3(0.11,0.07,0.13),SAGE_DARK,Vector3(-0.20,0,0))
		box(ankle,"RearHeel",Vector3(0,-0.16,-0.17),Vector3(0.22,0.08,0.23),SAGE_DARK)
		hips.append(hip)
		knees.append(knee)
		ankles.append(ankle)
		leg_states.append({"hip":hip,"knee":knee,"ankle":ankle,"side":side,"thigh_b":knee_pos,"shin_b":shin_end})

func _build_wear() -> void:
	for i in range(15):
		var x := -0.76 + float((i*17)%150)/100.0
		var z := -0.47 + float((i*29)%90)/100.0
		box(shell,"ExposedEdgeWear_%02d" % i,Vector3(x,0.20+(i%4)*0.045,z),Vector3(0.025+(i%3)*0.012,0.014,0.035+(i%2)*0.02),RUST if i%4==0 else STEEL,Vector3(0,float((i%5)*0.17),0),0.65,0.92)

func set_recovered_arm(value: bool) -> void:
	if is_instance_valid(recovered_arm):
		recovered_arm.visible = value

func set_probe_installed(value: bool) -> void:
	if is_instance_valid(access_probe):
		access_probe.visible = value

func set_servicing(value: bool) -> void:
	servicing = value

func set_moving(value: bool) -> void:
	stride_target = 1.0 if value else 0.0

func _solve_leg_ik(leg: Dictionary, target: Vector3, delta: float) -> void:
	var hip: Node3D = leg["hip"]
	var knee: Node3D = leg["knee"]
	var ankle: Node3D = leg["ankle"]
	var thigh_b: Vector3 = leg["thigh_b"]
	var shin_b: Vector3 = leg["shin_b"]
	var upper_length := Vector2(thigh_b.y,thigh_b.z).length()
	var lower_length := Vector2(shin_b.y,shin_b.z).length()
	var dy := target.y-hip.position.y
	var dz := target.z-hip.position.z
	var actual := Vector2(dy,dz).length()
	var reach := clampf(actual,0.18,upper_length+lower_length-0.035)
	var unit_y := dy/maxf(0.0001,actual)
	var unit_z := dz/maxf(0.0001,actual)
	var along := (upper_length*upper_length-lower_length*lower_length+reach*reach)/(2.0*reach)
	var perpendicular := sqrt(maxf(0.0,upper_length*upper_length-along*along))
	# Keep the reverse knee behind the shin line, matching the browser solver's branch.
	var knee_y := along*unit_y-perpendicular*unit_z
	var knee_z := along*unit_z+perpendicular*unit_y
	var shin_y := reach*unit_y-knee_y
	var shin_z := reach*unit_z-knee_z
	var rest_upper := atan2(thigh_b.z,thigh_b.y)
	var rest_lower := atan2(shin_b.z,shin_b.y)
	var upper_angle := atan2(knee_z,knee_y)-rest_upper
	var lower_angle := atan2(shin_z,shin_y)-rest_lower-upper_angle
	var blend := minf(1.0,delta*14.0)
	hip.rotation.x = lerp_angle(hip.rotation.x,upper_angle,blend)
	knee.rotation.x = lerp_angle(knee.rotation.x,lower_angle,blend)
	ankle.rotation.x = lerp_angle(ankle.rotation.x,-hip.rotation.x-knee.rotation.x,blend)
	hip.rotation.z = lerpf(hip.rotation.z,0.0,blend)
	knee.rotation.z = lerpf(knee.rotation.z,0.0,blend)

func _process(delta: float) -> void:
	stride = lerpf(stride,stride_target,minf(delta*7.0,1.0))
	phase += delta * 4.8 * lerpf(0.15, 1.0, stride)
	var blend := clampf(stride,0.0,1.0)
	for leg in leg_states:
		var side_phase := fposmod(phase/TAU+(0.5 if int(leg["side"]) > 0 else 0.0),1.0)
		var forward: float
		var lift := 0.0
		if side_phase < 0.62:
			var stance_phase := side_phase/0.62
			forward = 0.24*(1.0-2.0*stance_phase)
		else:
			var swing_phase := (side_phase-0.62)/0.38
			var eased := swing_phase*swing_phase*(3.0-2.0*swing_phase)
			forward = -0.24+0.48*eased
			lift = 0.105*sin(PI*swing_phase)
		var hip: Node3D = leg["hip"]
		var thigh_b: Vector3 = leg["thigh_b"]
		var shin_b: Vector3 = leg["shin_b"]
		var foot_target := Vector3(hip.position.x+thigh_b.x+shin_b.x,0.155+lift*blend,0.09+forward*blend)
		_solve_leg_ik(leg,foot_target,delta)
	var transfer := sin(phase)
	body.position.y = lerpf(body.position.y,-0.025+0.013*absf(transfer),minf(delta*8.0,1.0)) * blend
	body.rotation.z = lerpf(body.rotation.z,0.018*transfer*blend,minf(delta*7.0,1.0))
	var reach_target := 0.0 if not servicing else 0.25
	reaching = lerpf(reaching,reach_target,minf(delta*8.0,1.0))
	if is_instance_valid(original_arm):
		original_arm.rotation.x = -reaching*0.9
		original_arm.rotation.z = -reaching*0.3
	if is_instance_valid(recovered_arm):
		recovered_arm.rotation.x = -reaching*1.1
		recovered_arm.rotation.z = reaching*0.3
