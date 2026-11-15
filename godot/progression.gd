extends RefCounted
const RECIPE = {"motor":1,"gear":2,"chip":1,"plate":1,"wire":2}
var inventory: Dictionary = {}
var lockers: Array = [{"card":1,"camera":1,"tin":1},{"motor":1,"plate":1,"wire":1},{"gear":1,"wire":1},{"wire":1,"plate":1}]
var staged: Dictionary = {}
var cells := 0
var case_open := false
var cell_taken := false
var powered := false
var authenticated := false
var spec_released := false
var spec_unlocked := false
var claw_salvaged := false
var probe_crafted := false
var probe_installed := false
var install_placed := false
var door_open := false
var finished := false

func add(type: String, count := 1) -> void:
	inventory[type] = inventory.get(type,0)+count

func item_count() -> int:
	var count := 0
	for n in inventory.values():
		count += int(n)
	return count

func take(index: int,type: String) -> bool:
	if index < 0 or index >= lockers.size() or lockers[index].get(type,0) <= 0 or item_count() >= 20:
		return false
	lockers[index][type] -= 1
	add(type)
	return true

func salvage_claw() -> bool:
	if claw_salvaged or item_count() > 16:
		return false
	claw_salvaged = true
	for type in ["gear","chip","wire"]:
		add(type)
	return true

func use_case() -> String:
	if not case_open:
		case_open = true
		return "Service case released. Interact again to recover cell."
	if not cell_taken:
		cell_taken = true
		cells += 1
		return "Portable power cell recovered."
	return "Case empty."

func login(password: String) -> String:
	authenticated = powered and password.strip_edges().to_upper() == "ETNA"
	return "Authenticated." if authenticated else "Access denied."

func release_spec() -> bool:
	if not powered or not authenticated or spec_unlocked or spec_released:
		return false
	spec_released = true
	return true

func collect_spec() -> bool:
	if not spec_released or spec_unlocked:
		return false
	spec_released = false
	spec_unlocked = true
	return true

func can_stage(type: String) -> bool:
	return RECIPE.has(type) and staged.get(type,0) < RECIPE[type] and staged.get(type,0) < inventory.get(type,0)

func stage(type: String) -> bool:
	if not can_stage(type) or probe_crafted:
		return false
	staged[type] = staged.get(type,0)+1
	return true

func cancel_staging() -> void:
	staged.clear()
	install_placed = false

func can_fabricate(at_station: bool) -> bool:
	if not powered or not at_station or not spec_unlocked or probe_crafted or probe_installed:
		return false
	for type in RECIPE:
		if staged.get(type,0) != RECIPE[type] or inventory.get(type,0) < RECIPE[type]:
			return false
	return true

func fabricate(at_station: bool) -> bool:
	if not can_fabricate(at_station):
		return false
	for type in RECIPE:
		inventory[type] -= RECIPE[type]
		if inventory[type] == 0:
			inventory.erase(type)
	staged.clear()
	probe_crafted = true
	return true

func install(at_station: bool) -> bool:
	if not probe_crafted or probe_installed or not install_placed or not powered or not at_station:
		return false
	probe_installed = true
	install_placed = false
	return true

func use_exit() -> String:
	if not powered:
		return "Restore auxiliary power."
	if not probe_installed:
		return "Exit requires installed access probe."
	if door_open:
		finished = true
		return "Workshop complete."
	door_open = true
	return "Access probe engaged. Interact again to exit."

func snapshot() -> Dictionary:
	return {
		"inventory": inventory.duplicate(true), "lockers": lockers.duplicate(true),
		"staged": staged.duplicate(true), "cells": cells, "case_open": case_open,
		"cell_taken": cell_taken, "powered": powered, "authenticated": authenticated,
		"spec_released": spec_released, "spec_unlocked": spec_unlocked,
		"claw_salvaged": claw_salvaged, "probe_crafted": probe_crafted,
		"probe_installed": probe_installed, "install_placed": install_placed,
		"door_open": door_open, "finished": finished
	}

func restore(data: Dictionary) -> void:
	inventory = data.get("inventory", {}).duplicate(true)
	lockers = data.get("lockers", [{"card":1,"camera":1,"tin":1},{"motor":1,"plate":1,"wire":1},{"gear":1,"wire":1},{"wire":1,"plate":1}]).duplicate(true)
	staged = data.get("staged", {}).duplicate(true)
	cells = int(data.get("cells", 0))
	case_open = bool(data.get("case_open", false))
	cell_taken = bool(data.get("cell_taken", false))
	powered = bool(data.get("powered", false))
	authenticated = bool(data.get("authenticated", false))
	spec_released = bool(data.get("spec_released", false))
	spec_unlocked = bool(data.get("spec_unlocked", false))
	claw_salvaged = bool(data.get("claw_salvaged", false))
	probe_crafted = bool(data.get("probe_crafted", false))
	probe_installed = bool(data.get("probe_installed", false))
	install_placed = bool(data.get("install_placed", false))
	door_open = bool(data.get("door_open", false))
	finished = bool(data.get("finished", false))
