#!/usr/bin/env python3
"""Validate static project data and local asset references."""

from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
SKIP_URL_PREFIXES = (
    "http://",
    "https://",
    "mailto:",
    "tel:",
    "javascript:",
    "#",
    "data:",
    "app:",
)


class ValidationError(Exception):
  pass


def load_json(path: Path) -> Any:
  try:
    return json.loads(path.read_text(encoding="utf-8"))
  except Exception as exc:  # pragma: no cover - CLI diagnostic
    raise ValidationError(f"{path.relative_to(ROOT)}: JSON invalido: {exc}") from exc


def require_unique(items: list[Any], key: str, label: str, errors: list[str]) -> set[Any]:
  seen: set[Any] = set()
  duplicates: set[Any] = set()
  for item in items:
    value = item.get(key) if isinstance(item, dict) else None
    if value in seen:
      duplicates.add(value)
    seen.add(value)
  for value in sorted(duplicates, key=str):
    errors.append(f"{label}: id duplicado {value!r}")
  return seen


def strip_url_fragment(value: str) -> str:
  return value.split("#", 1)[0].split("?", 1)[0].strip()


def resolve_local_path(base: Path, value: str) -> Path | None:
  value = value.strip()
  if not value or value.startswith(SKIP_URL_PREFIXES):
    return None
  raw = strip_url_fragment(value)
  if not raw:
    return None
  if raw.startswith("/"):
    return ROOT / raw.lstrip("/")
  return (base / raw).resolve()


def validate_json_files(errors: list[str]) -> dict[str, Any]:
  payloads: dict[str, Any] = {}
  for path in sorted(DATA.rglob("*.json")):
    try:
      payloads[str(path.relative_to(ROOT))] = load_json(path)
    except ValidationError as exc:
      errors.append(str(exc))
  return payloads


def normalize_number(value: Any) -> str:
  text = str(value).strip()
  if text.isdigit():
    return text.zfill(3)
  return text


def build_card_codes(errors: list[str]) -> tuple[set[str], dict[str, dict[str, Any]]]:
  cards_doc = load_json(DATA / "game" / "cards.json")
  types_doc = load_json(DATA / "refs" / "types.json")
  collections_doc = load_json(DATA / "refs" / "collections.json")
  cards = cards_doc.get("cards", [])
  types = {int(item["id"]): item for item in types_doc.get("types", [])}
  collections = {int(item["id"]): item for item in collections_doc.get("collections", [])}
  codes: set[str] = set()
  by_code: dict[str, dict[str, Any]] = {}

  for index, card in enumerate(cards, start=1):
    try:
      collection_id = int(card.get("collection", cards_doc.get("defaults", {}).get("collection", 1)))
      type_id = int((card.get("type") or [0])[0])
      collection_code = collections[collection_id].get("code", "FND")
      type_code = types[type_id].get("code", "CRD")
      number = normalize_number(card.get("number", index))
      code = f"{collection_code}-{type_code}-{number}"
    except Exception as exc:
      errors.append(f"data/game/cards.json: nao foi possivel derivar codigo da carta #{index}: {exc}")
      continue
    if code in codes:
      errors.append(f"data/game/cards.json: codigo derivado duplicado {code}")
    codes.add(code)
    by_code[code] = card
  return codes, by_code


def iter_deck_refs(section_value: Any) -> list[str]:
  items: list[Any] = []
  if isinstance(section_value, list):
    items.extend(section_value)
  elif isinstance(section_value, dict):
    for value in section_value.values():
      if isinstance(value, list):
        items.extend(value)
      elif value:
        items.append(value)
  refs: list[str] = []
  for item in items:
    if isinstance(item, dict):
      ref = item.get("cardId") or item.get("id") or item.get("code") or item.get("reference")
    else:
      ref = item
    if ref:
      refs.append(str(ref))
  return refs


def validate_game_data(errors: list[str]) -> None:
  card_codes, _ = build_card_codes(errors)
  cards_doc = load_json(DATA / "game" / "cards.json")
  decks_doc = load_json(DATA / "game" / "decks.json")
  virtues_doc = load_json(DATA / "game" / "virtues.json")

  require_unique(virtues_doc.get("virtues", []), "id", "virtues.id", errors)

  for deck in decks_doc.get("decks", []):
    deck_id = deck.get("id", "deck sem id")
    for section in ("identity", "main", "reserve", "sideboard"):
      for ref in iter_deck_refs(deck.get(section)):
        if ref not in card_codes:
          errors.append(f"data/game/decks.json: {deck_id}.{section} referencia carta inexistente {ref}")

  for card_code, card in build_card_codes(errors)[1].items():
    images = card.get("images") or {}
    for image_kind, image_path in images.items():
      if not isinstance(image_path, str):
        continue
      raw = strip_url_fragment(image_path)
      if raw.startswith("../assets/"):
        resolved = ROOT / raw[3:]
      elif raw.startswith("assets/"):
        resolved = ROOT / raw
      else:
        resolved = resolve_local_path(ROOT, image_path)
      if resolved and not resolved.exists():
        errors.append(f"data/game/cards.json: {card_code}.images.{image_kind} nao existe: {image_path}")


def walk_effects(value: Any) -> list[str]:
  effects: list[str] = []
  if isinstance(value, dict):
    if isinstance(value.get("effect"), str):
      effects.append(value["effect"])
    for child in value.values():
      effects.extend(walk_effects(child))
  elif isinstance(value, list):
    for child in value:
      effects.extend(walk_effects(child))
  return effects


def validate_engine_data(errors: list[str]) -> None:
  abilities_doc = load_json(DATA / "engine" / "abilities.json")
  links_doc = load_json(DATA / "engine" / "ability_links.json")
  actions_doc = load_json(DATA / "engine" / "effect_actions.json")
  triggers_doc = load_json(DATA / "engine" / "triggers.json")
  virtues_doc = load_json(DATA / "game" / "virtues.json")
  card_codes, _ = build_card_codes(errors)

  abilities = abilities_doc.get("abilities", [])
  links = links_doc.get("links", [])
  actions = actions_doc.get("actions", [])
  triggers = triggers_doc.get("triggers", [])
  ability_ids = require_unique(abilities, "id", "abilities.id", errors)
  action_ids = require_unique(actions, "id", "actions.id", errors)
  trigger_ids = require_unique(triggers, "id", "triggers.id", errors)
  virtue_ids = {item.get("id") for item in virtues_doc.get("virtues", [])}

  for ability in abilities:
    ability_id = ability.get("id", "ability sem id")
    trigger = ability.get("trigger") or ability.get("triggerId")
    if trigger and trigger not in trigger_ids:
      errors.append(f"data/engine/abilities.json: {ability_id} usa trigger inexistente {trigger}")
    for effect in walk_effects(ability):
      if effect not in action_ids:
        errors.append(f"data/engine/abilities.json: {ability_id} usa action inexistente {effect}")

  for link in links:
    ability_id = link.get("abilityId")
    source_type = link.get("sourceType")
    source_id = link.get("sourceId")
    if ability_id not in ability_ids:
      errors.append(f"data/engine/ability_links.json: link usa ability inexistente {ability_id}")
    if source_type == "card" and source_id not in card_codes:
      errors.append(f"data/engine/ability_links.json: link usa carta inexistente {source_id}")
    if source_type == "virtue" and source_id not in virtue_ids:
      errors.append(f"data/engine/ability_links.json: link usa virtude inexistente {source_id}")


class LocalReferenceParser(HTMLParser):
  def __init__(self, path: Path, errors: list[str]) -> None:
    super().__init__()
    self.path = path
    self.errors = errors

  def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
    for key, value in attrs:
      if key not in {"href", "src", "poster", "data-src"} or not value:
        continue
      resolved = resolve_local_path(self.path.parent, value)
      if resolved and not resolved.exists():
        rel = self.path.relative_to(ROOT)
        self.errors.append(f"{rel}: referencia local inexistente em {key}={value!r}")


def validate_static_refs(errors: list[str]) -> None:
  for path in sorted(ROOT.rglob("*.html")):
    if ".git" in path.parts:
      continue
    LocalReferenceParser(path, errors).feed(path.read_text(encoding="utf-8", errors="ignore"))

  url_re = re.compile(r"url\\(([^)]+)\\)")
  for path in sorted(ROOT.rglob("*.css")):
    if ".git" in path.parts:
      continue
    text = path.read_text(encoding="utf-8", errors="ignore")
    if text.count("{") != text.count("}"):
      errors.append(f"{path.relative_to(ROOT)}: quantidade de chaves CSS divergente")
    for match in url_re.finditer(text):
      value = match.group(1).strip().strip("\"'")
      resolved = resolve_local_path(path.parent, value)
      if resolved and not resolved.exists():
        errors.append(f"{path.relative_to(ROOT)}: url local inexistente {value!r}")


def main() -> int:
  errors: list[str] = []
  payloads = validate_json_files(errors)
  if not errors:
    validate_game_data(errors)
    validate_engine_data(errors)
    validate_static_refs(errors)

  if errors:
    print(f"VALIDACAO FALHOU: {len(errors)} erro(s)")
    for error in errors:
      print(f"- {error}")
    return 1

  print("VALIDACAO OK")
  print(f"- JSONs em data/: {len(payloads)}")
  print(f"- Cartas: {len(load_json(DATA / 'game' / 'cards.json').get('cards', []))}")
  print(f"- Decks: {len(load_json(DATA / 'game' / 'decks.json').get('decks', []))}")
  print(f"- Habilidades: {len(load_json(DATA / 'engine' / 'abilities.json').get('abilities', []))}")
  return 0


if __name__ == "__main__":
  raise SystemExit(main())
