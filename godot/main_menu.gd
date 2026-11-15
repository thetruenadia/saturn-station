extends Node3D

const SAVE_PATH := "user://saturn-station.save"
const PREFS_PATH := "user://saturn-station-prefs.cfg"

var continue_button: Button
var primary_panel: PanelContainer
var settings_panel: PanelContainer
var credits_panel: PanelContainer
var music_player: AudioStreamPlayer
var menu_music_enabled := true

func _ready() -> void:
	var backdrop = preload("res://workshop.tscn").instantiate()
	add_child(backdrop)
	backdrop.call("prepare_menu_backdrop")
	music_player = AudioStreamPlayer.new()
	music_player.name = "MenuOnlyMusic"
	music_player.stream = load("res://assets/audio/main-menu.mp3")
	if music_player.stream is AudioStreamMP3:
		music_player.stream.loop = true
	add_child(music_player)
	menu_music_enabled = _load_music_enabled()
	if menu_music_enabled:
		music_player.play()
	_build_interface()

func _build_interface() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	var shade := ColorRect.new()
	shade.color = Color(0.015, 0.025, 0.025, 0.78)
	shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	layer.add_child(shade)
	primary_panel = PanelContainer.new()
	primary_panel.set_anchors_and_offsets_preset(Control.PRESET_CENTER_LEFT)
	primary_panel.position = Vector2(48, -240)
	primary_panel.size = Vector2(500, 480)
	layer.add_child(primary_panel)
	var content := VBoxContainer.new()
	content.add_theme_constant_override("separation", 14)
	primary_panel.add_child(content)
	var title := Label.new()
	title.text = "SATURN\nSTATION"
	title.add_theme_font_size_override("font_size", 52)
	title.add_theme_color_override("font_color", Color("d8c99c"))
	content.add_child(title)
	var subtitle := Label.new()
	subtitle.text = "B-7 SERVICE BAY     ·     LAST POWERED SHIFT: UNKNOWN"
	subtitle.add_theme_font_size_override("font_size", 14)
	subtitle.add_theme_color_override("font_color", Color("a0aa99"))
	content.add_child(subtitle)
	var rule := HSeparator.new()
	content.add_child(rule)
	var new_game := Button.new()
	new_game.text = "START NEW DEMO"
	new_game.pressed.connect(_start_new)
	content.add_child(new_game)
	continue_button = Button.new()
	continue_button.text = "CONTINUE SAVED SHIFT"
	continue_button.disabled = not FileAccess.file_exists(SAVE_PATH)
	continue_button.pressed.connect(_continue_game)
	content.add_child(continue_button)
	var options := Button.new()
	options.text = "SETTINGS"
	options.pressed.connect(func(): settings_panel.show(); primary_panel.hide())
	content.add_child(options)
	var credits := Button.new()
	credits.text = "CREDITS"
	credits.pressed.connect(func(): credits_panel.show(); primary_panel.hide())
	content.add_child(credits)
	settings_panel = _panel(layer, "SETTINGS")
	var settings := settings_panel.get_child(0) as VBoxContainer
	var volume_label := Label.new()
	volume_label.text = "MASTER VOLUME"
	settings.add_child(volume_label)
	var volume := HSlider.new()
	volume.min_value = 0.0
	volume.max_value = 1.0
	volume.step = 0.05
	volume.value = _load_volume()
	volume.value_changed.connect(_set_volume)
	settings.add_child(volume)
	var music := CheckButton.new()
	music.text = "MENU MUSIC"
	music.button_pressed = menu_music_enabled
	music.toggled.connect(_set_music_enabled)
	settings.add_child(music)
	var view := CheckButton.new()
	view.text = "Start in isometric view"
	view.button_pressed = _load_isometric()
	view.toggled.connect(_set_isometric)
	settings.add_child(view)
	var controls := Label.new()
	controls.text = "WASD move · E interact · I inventory · C fabricate\nV switch isometric / first person · drag to look · scroll to zoom"
	controls.add_theme_color_override("font_color", Color("a0aa99"))
	controls.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	settings.add_child(controls)
	_add_back_button(settings, settings_panel)
	credits_panel = _panel(layer, "CREDITS")
	var credits_content := credits_panel.get_child(0) as VBoxContainer
	var credits_text := Label.new()
	credits_text.text = "A personal science fiction game about a station built to keep tens of thousands alive, now limping along for a few hundred.\n\nDesign and world: Thetruenadia\nNative Godot port: in progress\n\nThank you for exploring Saturn Station."
	credits_text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	credits_text.add_theme_font_size_override("font_size", 16)
	credits_content.add_child(credits_text)
	_add_back_button(credits_content, credits_panel)
	settings_panel.hide()
	credits_panel.hide()

func _panel(parent: Node, heading_text: String) -> PanelContainer:
	var panel := PanelContainer.new()
	panel.set_anchors_and_offsets_preset(Control.PRESET_CENTER_LEFT)
	panel.position = Vector2(48, -210)
	panel.size = Vector2(500, 420)
	parent.add_child(panel)
	var content := VBoxContainer.new()
	content.add_theme_constant_override("separation", 14)
	panel.add_child(content)
	var heading := Label.new()
	heading.text = heading_text
	heading.add_theme_font_size_override("font_size", 32)
	content.add_child(heading)
	return panel

func _add_back_button(parent: VBoxContainer, panel: Control) -> void:
	var back := Button.new()
	back.text = "BACK"
	back.pressed.connect(func(): panel.hide(); primary_panel.show())
	parent.add_child(back)

func _start_new() -> void:
	_stop_menu_music()
	get_tree().set_meta("start_maker_opening", true)
	if FileAccess.file_exists(SAVE_PATH):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(SAVE_PATH))
	get_tree().change_scene_to_file("res://workshop.tscn")

func _continue_game() -> void:
	_stop_menu_music()
	get_tree().set_meta("start_maker_opening", false)
	var save := ConfigFile.new()
	if save.load(SAVE_PATH) == OK:
		var snapshot: Variant = save.get_value("progress", "snapshot", {})
		if snapshot is Dictionary and bool(snapshot.get("finished", false)):
			get_tree().change_scene_to_file("res://generator_hall.tscn")
			return
	get_tree().change_scene_to_file("res://workshop.tscn")

func _stop_menu_music() -> void:
	if music_player and music_player.playing:
		music_player.stop()

func _load_music_enabled() -> bool:
	var prefs := ConfigFile.new()
	if prefs.load(PREFS_PATH) != OK:
		return true
	return bool(prefs.get_value("sound", "menu_enabled", true))

func _set_music_enabled(value: bool) -> void:
	menu_music_enabled = value
	if music_player:
		if value:
			music_player.play()
		else:
			music_player.stop()
	var prefs := ConfigFile.new()
	prefs.load(PREFS_PATH)
	prefs.set_value("sound", "menu_enabled", value)
	prefs.save(PREFS_PATH)

func _load_volume() -> float:
	var prefs := ConfigFile.new()
	if prefs.load(PREFS_PATH) != OK:
		return 0.8
	return float(prefs.get_value("sound", "volume", 0.8))

func _set_volume(value: float) -> void:
	var bus := AudioServer.get_bus_index("Master")
	if bus >= 0:
		AudioServer.set_bus_volume_db(bus, linear_to_db(maxf(value, 0.001)))
	var prefs := ConfigFile.new()
	prefs.load(PREFS_PATH)
	prefs.set_value("sound", "volume", value)
	prefs.save(PREFS_PATH)

func _load_isometric() -> bool:
	var prefs := ConfigFile.new()
	if prefs.load(PREFS_PATH) != OK:
		return true
	return bool(prefs.get_value("view", "isometric", true))

func _set_isometric(value: bool) -> void:
	var prefs := ConfigFile.new()
	prefs.load(PREFS_PATH)
	prefs.set_value("view", "isometric", value)
	prefs.save(PREFS_PATH)
