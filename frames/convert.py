import os
from PIL import Image

directory = os.path.dirname(os.path.abspath(__file__))

print("Scanning for PNG files...")
for filename in os.listdir(directory):
    if filename.lower().endswith(".png"):
        input_path = os.path.join(directory, filename)
        output_filename = filename[:-4] + ".webp"
        output_path = os.path.join(directory, output_filename)
        
        try:
            # Open the image and convert it
            img = Image.open(input_path)
            img.save(output_path, "webp", quality=80)
            print(f"Converted: {filename} -> {output_filename}")
        except Exception as e:
            print(f"Error converting {filename}: {e}")

print("All done!")
