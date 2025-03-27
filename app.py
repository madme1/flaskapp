from flask import Flask, request, jsonify, send_file, render_template
from flask_sqlalchemy import SQLAlchemy
from PIL import Image, ImageDraw, ImageFont
import io
import base64
import logging
import json

app = Flask(__name__)

# Database configuration (SQLite)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///image_data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Enable logging
logging.basicConfig(level=logging.DEBUG)

# Database model
class ImageData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image = db.Column(db.Text, nullable=False)  # Base64 encoded image
    positions = db.Column(db.Text, nullable=False)  # JSON string of positions
    font_size_name_mobile = db.Column(db.String(50), nullable=False)
    font_size_maha_rara = db.Column(db.String(50), nullable=False)
    font_family = db.Column(db.String(100), nullable=False)
    font_color = db.Column(db.String(50), nullable=False)
# Create the database tables
with app.app_context():
    db.create_all()

def add_elements_to_image(
    image_data, name, mobile, maha_rara_no, logo_data, positions,
    font_size_name_mobile=22, font_size_maha_rara=20, font_family="fonts/Roboto-Regular.ttf", font_color="black"
):
    try:
        # Convert base64 image data to PIL Image
        image_bytes = base64.b64decode(image_data.split(',')[1])
        image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")  # Ensure image has alpha channel

        # Convert logo base64 data to PIL Image (if provided)
        if logo_data:
            logo_bytes = base64.b64decode(logo_data.split(',')[1])
            logo = Image.open(io.BytesIO(logo_bytes)).convert("RGBA")  # Ensure logo has alpha channel
            original_width, original_height = logo.size
            new_width = int(150)
            new_height = int((new_width / original_width) * original_height)
            logo = logo.resize((new_width, new_height))  # Resize logo to a fixed size (adjust as needed)
        else:
            logo = None

        # Create a drawing context
        draw = ImageDraw.Draw(image)
        font_size_name_mobile = int(font_size_name_mobile)
        font_size_maha_rara=int(font_size_maha_rara)
  
        # Load fonts
        try:
            font_name_mobile = ImageFont.truetype(font_family, font_size_name_mobile)
            font_maha_rara = ImageFont.truetype(font_family, font_size_maha_rara)
        except Exception as e:
            logging.error(f"Error loading font: {e}")
            # Fallback to default font
            font_name_mobile = ImageFont.load_default()
            font_maha_rara = ImageFont.load_default()

        # Overlay logo at the specified position
        if logo:
            logo_position = positions['logo']
            logo_x = int(logo_position['x'])
            logo_y = int(logo_position['y'])
            if (logo_x + logo.width <= image.width and logo_y + logo.height <= image.height):
                image.paste(logo, (logo_x, logo_y), logo)  # Use logo as mask for transparency
                logging.debug(f"Logo pasted at position: ({logo_x}, {logo_y})")
            else:
                logging.warning("Logo position is outside the image boundaries.")

        # Add name and mobile number at the specified position
        name_mobile_position = positions['name_mobile']
        name_mobile_x = int(name_mobile_position['x'])
        name_mobile_y = int(name_mobile_position['y'])
        name_mobile_text = f"{mobile}"
        draw.text((name_mobile_x, name_mobile_y), name_mobile_text, fill=font_color, font=font_name_mobile)
        logging.debug(f"Name and mobile added at position: ({name_mobile_x}, {name_mobile_y})")

        # Add Maha Rara No. at the specified position
        maha_rara_position = positions['maha_rara']
        maha_rara_x = int(maha_rara_position['x'])
        maha_rara_y = int(maha_rara_position['y'])
        maha_rara_text = f"{maha_rara_no}"
        draw.text((maha_rara_x, maha_rara_y), maha_rara_text, fill=font_color, font=font_maha_rara)

        # Save the edited image to a bytes buffer
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)

        # Log success
        logging.debug("Elements added to image successfully")

        return buffer
    except Exception as e:
        logging.error(f"Error in add_elements_to_image: {e}")
        raise

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/saved_images')
def saved_images():
    return render_template('saved_images.html')

@app.route('/preview', methods=['POST'])
def preview():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Extract data
    image_data = data.get('image')
    name = data.get('name')
    mobile = data.get('mobile')
    maha_rara_no = data.get('maha_rara_no')
    logo_data = data.get('logo')
    positions = data.get('positions')
    font_size_name_mobile = data.get('fontSizeNameMobile', 22)  # Default to 22 if not provided
    font_size_maha_rara = data.get('fontSizeMahaRara', 20)  # Default to 20 if not provided
    font_family = data.get('fontFamily', "fonts/Roboto-Regular.ttf")  # Default to Roboto if not provided
    font_color = data.get('fontColor', "black")  # Default to black if not provided

    if not all([image_data, name, mobile, maha_rara_no, positions]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Add elements to the image
        buffer = add_elements_to_image(
            image_data, name, mobile, maha_rara_no, logo_data, positions,
            font_size_name_mobile, font_size_maha_rara, font_family, font_color
        )

        # Return the edited image as a response
        return send_file(buffer, mimetype='image/png')
    except Exception as e:
        logging.error(f"Error in /preview: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/add_text', methods=['POST'])
def add_text():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Extract data
    image_data = data.get('image')
    name = data.get('name')
    mobile = data.get('mobile')
    maha_rara_no = data.get('maha_rara_no')
    logo_data = data.get('logo')
    positions = data.get('positions')
    font_size_name_mobile = data.get('fontSizeNameMobile', 22)  # Default to 22 if not provided
    font_size_maha_rara = data.get('fontSizeMahaRara', 20)  # Default to 20 if not provided
    font_family = data.get('fontFamily', "fonts/Roboto-Regular.ttf")  # Default to Roboto if not provided
    font_color = data.get('fontColor', "black")  # Default to black if not provided

    if not all([image_data, name, mobile, maha_rara_no, positions]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Add elements to the image
        buffer = add_elements_to_image(
            image_data, name, mobile, maha_rara_no, logo_data, positions,
            font_size_name_mobile, font_size_maha_rara, font_family, font_color
        )

        # Return the edited image as a response
        return send_file(buffer, mimetype='image/png', as_attachment=True, download_name='edited_image.png')
    except Exception as e:
        logging.error(f"Error in /add_text: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/save', methods=['POST'])
def save():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Extract data
    image_data = data.get('image')
    positions = data.get('positions')
    font_size_name_mobile = data.get('fontSizeNameMobile')
    font_size_maha_rara = data.get('fontSizeMahaRara')
    font_family = data.get('fontFamily')
    font_color = data.get('fontColor')

    # Validate required fields
    if not all([image_data, positions, font_size_name_mobile, font_size_maha_rara, font_family, font_color]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Save data to the database
        new_image_data = ImageData(
            image=image_data,
            positions=json.dumps(positions),  # Convert positions to JSON string
            font_size_name_mobile=font_size_name_mobile,
            font_size_maha_rara=font_size_maha_rara,
            font_family=font_family,
            font_color=font_color
        )
        db.session.add(new_image_data)
        db.session.commit()

        return jsonify({"message": "Data saved successfully", "id": new_image_data.id}), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error in /save: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/get_saved_images', methods=['GET'])
def get_saved_images():
    try:
        # Fetch all saved images from the database
        saved_images = ImageData.query.all()

        # Prepare the response data
        saved_images_data = [
            {
                "id": img.id,
                "image": img.image,  # Base64 encoded image
                "positions": json.loads(img.positions),  # Convert JSON string to dictionary
                "font_size_name_mobile": img.font_size_name_mobile,
                "font_size_maha_rara": img.font_size_maha_rara,
                "font_family": img.font_family,
                "font_color": img.font_color
            }
            for img in saved_images
        ]

        return jsonify(saved_images_data), 200
    except Exception as e:
        logging.error(f"Error in /get_saved_images: {e}")
        return jsonify({"error": str(e)}), 500
@app.route('/edit/<int:image_id>', methods=['POST'])
def edit(image_id):
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Extract new text/logo data
    name = data.get('name')
    mobile = data.get('mobile')
    maha_rara_no = data.get('maha_rara_no')
    logo_data = data.get('logo')

    if not all([name, mobile, maha_rara_no]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Retrieve the saved image and positions from the database
        saved_image_data = ImageData.query.get(image_id)
        font_size_name_mobile = saved_image_data.font_size_name_mobile
        font_size_maha_rara =saved_image_data.font_size_maha_rara
        font_family = saved_image_data.font_family
        font_color =saved_image_data.font_color # Default to black if not provided
        if not saved_image_data:
            return jsonify({"error": "Image not found"}), 404

        image_data = saved_image_data.image
        positions = json.loads(saved_image_data.positions)  # Convert JSON string back to dict

        # Add elements to the image
        buffer = add_elements_to_image(
            image_data, name, mobile, maha_rara_no, logo_data, positions,
            font_size_name_mobile, font_size_maha_rara, font_family, font_color
        )

        # Return the edited image as a response
        return send_file(buffer, mimetype='image/png')
    except Exception as e:
        logging.error(f"Error in /edit: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)