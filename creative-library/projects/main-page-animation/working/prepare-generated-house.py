"""Run locally inside GIMP's python-fu-eval batch interpreter."""

from collections import deque
from pathlib import Path
from gi.repository import Gimp, Gegl, Gio

PROJECT = Path(__file__).resolve().parents[1]
ROOT = PROJECT.parents[2]
SOURCE = PROJECT / "originals" / "copilot-weathered-house-original.png"
OUTPUT = PROJECT / "working" / "copilot-weathered-house-cutout.png"
RUNTIME = ROOT / "assets" / "estate-generated-manor.png"
CROP = (48, 8, 1440, 996)

image = Gimp.file_load(Gimp.RunMode.NONINTERACTIVE, Gio.File.new_for_path(str(SOURCE)))
width, height = image.get_width(), image.get_height()
if (width, height) != (1536, 1024):
    raise ValueError("The accepted generated source dimensions changed.")
pixels = image.get_layers()[0].get_buffer().get(
    Gegl.Rectangle.new(0, 0, width, height), 1, "R'G'B'A u8", Gegl.AbyssPolicy.NONE
)
outside = bytearray(width * height)
queue = deque()


def add_background(x, y):
    index = y * width + x
    if outside[index]:
        return
    rgb = pixels[index * 4:index * 4 + 3]
    if min(rgb) >= 225 and max(rgb) - min(rgb) <= 22:
        outside[index] = 1
        queue.append((x, y))


for x in range(width):
    add_background(x, 0)
    add_background(x, height - 1)
for y in range(height):
    add_background(0, y)
    add_background(width - 1, y)
while queue:
    x, y = queue.popleft()
    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
        if 0 <= nx < width and 0 <= ny < height:
            add_background(nx, ny)

left, top, crop_width, crop_height = CROP
cutout = bytearray(crop_width * crop_height * 4)
for y in range(crop_height):
    for x in range(crop_width):
        source_index = (y + top) * width + x + left
        target = (y * crop_width + x) * 4
        if not outside[source_index]:
            cutout[target:target + 4] = pixels[source_index * 4:source_index * 4 + 4]
if not any(cutout[3::4]) or not any(alpha == 0 for alpha in cutout[3::4]):
    raise AssertionError("Expected both retained artwork and transparent background.")

candidate = Gimp.Image.new(crop_width, crop_height, Gimp.ImageBaseType.RGB)
layer = Gimp.Layer.new(candidate, "Accepted generated house - background cutout",
                       crop_width, crop_height, Gimp.ImageType.RGBA_IMAGE, 100, Gimp.LayerMode.NORMAL)
candidate.insert_layer(layer, None, 0)
layer.get_buffer().set(Gegl.Rectangle.new(0, 0, crop_width, crop_height), "R'G'B'A u8", bytes(cutout))
layer.update(0, 0, crop_width, crop_height)
procedure = Gimp.get_pdb().lookup_procedure("file-png-export")
config = procedure.create_config()
config.set_property("run-mode", Gimp.RunMode.NONINTERACTIVE)
config.set_property("image", candidate)
config.set_property("file", Gio.File.new_for_path(str(OUTPUT)))
result = procedure.run(config)
if result.index(0) != Gimp.PDBStatusType.SUCCESS:
    raise RuntimeError(f"PNG export failed: {result.index(0)}")
reopened = Gimp.file_load(Gimp.RunMode.NONINTERACTIVE, Gio.File.new_for_path(str(OUTPUT)))
saved = reopened.get_layers()[0].get_buffer().get(
    Gegl.Rectangle.new(0, 0, crop_width, crop_height), 1, "R'G'B'A u8", Gegl.AbyssPolicy.NONE
)
for index in range(0, len(cutout), 4):
    if saved[index + 3] != cutout[index + 3]:
        raise AssertionError("Export changed transparency.")
    if cutout[index + 3] and saved[index:index + 4] != cutout[index:index + 4]:
        raise AssertionError("Export changed retained artwork.")
print(f"Verified unscaled {crop_width} x {crop_height} cutout: {OUTPUT}")
reopened.delete()
candidate.scale(1080, 747)
expected = layer.get_buffer().get(
    Gegl.Rectangle.new(0, 0, 1080, 747), 1, "R'G'B'A u8", Gegl.AbyssPolicy.NONE
)
config.set_property("file", Gio.File.new_for_path(str(RUNTIME)))
result = procedure.run(config)
if result.index(0) != Gimp.PDBStatusType.SUCCESS:
    raise RuntimeError(f"Runtime PNG export failed: {result.index(0)}")
reopened = Gimp.file_load(Gimp.RunMode.NONINTERACTIVE, Gio.File.new_for_path(str(RUNTIME)))
saved = reopened.get_layers()[0].get_buffer().get(
    Gegl.Rectangle.new(0, 0, 1080, 747), 1, "R'G'B'A u8", Gegl.AbyssPolicy.NONE
)
for index in range(0, len(expected), 4):
    if saved[index + 3] != expected[index + 3]:
        raise AssertionError("Runtime export changed resized transparency.")
    if expected[index + 3] and saved[index:index + 4] != expected[index:index + 4]:
        raise AssertionError(f"Runtime export changed visible resized pixel at {index // 4}.")
print(f"Verified 1080 x 747 runtime derivative: {RUNTIME}")
reopened.delete()
candidate.delete()
image.delete()
