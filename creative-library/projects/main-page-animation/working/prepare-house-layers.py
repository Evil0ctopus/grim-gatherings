"""Preserve the approved house as editable GIMP layers without changing pixels.

Run this script inside GIMP's python-fu-eval batch interpreter.
"""

from pathlib import Path
from gi.repository import Gimp, Gegl, Gio

ROOT = Path(__file__).resolve().parents[4]
SOURCE = ROOT / "assets" / "estate-cartoon-manor.png"
OUTPUT = Path(__file__).with_name("first-house-components.xcf")


def bounds(width, height):
    return Gegl.Rectangle.new(0, 0, width, height)


source = Gimp.file_load(Gimp.RunMode.NONINTERACTIVE, Gio.File.new_for_path(str(SOURCE)))
width, height = source.get_width(), source.get_height()
if (width, height) != (776, 900):
    raise ValueError("The approved source dimensions changed.")

pixels = source.get_layers()[0].get_buffer().get(
    bounds(width, height), 1, "R'G'B'A u8", Gegl.AbyssPolicy.NONE
)
names = [
    "Left gable and visible roof",
    "Central gable and visible roof",
    "Right gable, chimney and visible roof",
    "Left facade, windows and masonry",
    "Central balcony, doors and carved columns",
    "Right facade, windows and masonry",
    "Left fence, branches and foreground",
    "Central entrance steps and foreground",
    "Right fence, branches and foreground",
]
parts = [bytearray(len(pixels)) for _ in names]
for y in range(height):
    left = 303 if y >= 318 else round(371 - max(0, y - 77) * .34)
    right = 475 if y >= 340 else round(509 - max(0, y - 71) * .275)
    floor = 0 if y < 340 else 1 if y < 780 else 2
    for x in range(width):
        index = (y * width + x) * 4
        side = 0 if x < left else 1 if x < right else 2
        parts[floor * 3 + side][index:index + 4] = pixels[index:index + 4]

layered = Gimp.Image.new(width, height, Gimp.ImageBaseType.RGB)
for name, part in zip(names, parts):
    layer = Gimp.Layer.new(
        layered, name, width, height, Gimp.ImageType.RGBA_IMAGE, 100, Gimp.LayerMode.NORMAL
    )
    layered.insert_layer(layer, None, 0)
    layer.get_buffer().set(bounds(width, height), "R'G'B'A u8", bytes(part))
    layer.update(0, 0, width, height)

def verify_pixels(image):
    verification = image.duplicate()
    flattened = verification.merge_visible_layers(Gimp.MergeType.CLIP_TO_IMAGE)
    restored = flattened.get_buffer().get(
        bounds(width, height), 1, "R'G'B'A u8", Gegl.AbyssPolicy.NONE
    )
    # Transparent pixels may have irrelevant RGB values changed by compositing.
    for index in range(0, len(pixels), 4):
        if pixels[index + 3] != restored[index + 3]:
            raise AssertionError(f"Alpha changed at pixel {index // 4}")
        if pixels[index + 3] and pixels[index:index + 4] != restored[index:index + 4]:
            raise AssertionError(f"Visible source pixel changed at pixel {index // 4}")
    verification.delete()


verify_pixels(layered)

procedure = Gimp.get_pdb().lookup_procedure("gimp-xcf-save")
config = procedure.create_config()
config.set_property("run-mode", Gimp.RunMode.NONINTERACTIVE)
config.set_property("image", layered)
config.set_property("file", Gio.File.new_for_path(str(OUTPUT)))
result = procedure.run(config)
if result.index(0) != Gimp.PDBStatusType.SUCCESS:
    raise RuntimeError(f"XCF save failed: {result.index(0)}")
reopened = Gimp.file_load(Gimp.RunMode.NONINTERACTIVE, Gio.File.new_for_path(str(OUTPUT)))
if len(reopened.get_layers()) != len(names):
    raise AssertionError("Saved architectural layers did not survive reopening.")
verify_pixels(reopened)
reopened.delete()
print(f"Saved {len(names)} layers; visible pixels and alpha match the approved original: {OUTPUT}")
layered.delete()
source.delete()
