from PIL import Image

def remove_background(input_path, output_path, tolerance=220):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # Check if the pixel is near white
        if item[0] > tolerance and item[1] > tolerance and item[2] > tolerance:
            # Change all near white (also shades of whites)
            # to transparent
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Saved {output_path}")

# Also creating a slightly softer version using a library if available, 
# but thresholding is the simplest pure-Pillow way.

if __name__ == "__main__":
    remove_background("public/main-robot.png", "public/main-robot.png", tolerance=225)
