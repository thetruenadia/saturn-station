extends SceneTree

func _initialize() -> void:
	call_deferred("run_menu_test")

func run_menu_test() -> void:
	var menu = load("res://main_menu.tscn").instantiate()
	root.add_child(menu)
	await process_frame
	var hud := menu.find_child("WorkshopHUD", true, false) as CanvasLayer
	assert(hud != null and not hud.visible)
	assert(menu.continue_button != null)
	assert(menu.primary_panel.visible)
	assert(menu.settings_panel != null and menu.credits_panel != null)
	assert(menu.music_player != null and menu.music_player.stream is AudioStreamMP3)
	assert(menu.menu_music_enabled and menu.music_player.playing)
	menu._set_music_enabled(false)
	assert(not menu.music_player.playing)
	menu._set_music_enabled(true)
	assert(menu.music_player.playing)
	menu._stop_menu_music()
	assert(not menu.music_player.playing)
	print("Main menu, menu-only music control, settings, credits, and continue availability passed")
	menu.queue_free()
	await process_frame
	quit()
