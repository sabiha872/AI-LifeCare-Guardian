import os
from pypdf import PdfReader
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai
from pypdf import PdfReader
from PIL import Image
import pytesseract


# ==========================================
# LOAD ENVIRONMENT
# ==========================================

load_dotenv()


# ==========================================
# FLASK APP
# ==========================================

app = Flask(__name__)

CORS(app)

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


# ==========================================
# GEMINI
# ==========================================

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("WARNING: GEMINI_API_KEY not found")

client = genai.Client(
    api_key=api_key
)


# ==========================================
# SYSTEM PROMPT
# ==========================================

SYSTEM_PROMPT = """
You are LifeCare Guardian, an AI health and wellness assistant.

Your purpose is to help users understand general health and
wellness information in simple language.

You can help with:

1. General health information
2. Healthy lifestyle
3. Food and nutrition
4. Exercise and fitness
5. Mental wellness
6. Medicine reminders and organization
7. Understanding medical reports
8. Preventive health habits

IMPORTANT SAFETY RULES:

- You are NOT a doctor.
- Do not diagnose diseases.
- Do not prescribe medicines.
- Do not recommend changing medicine dosage.
- Do not tell users to stop prescribed medicines.
- If symptoms sound like an emergency, recommend immediate
  professional medical/emergency help.
- Be empathetic and easy to understand.
"""


# ==========================================
# HOME
# ==========================================

@app.route("/")
def home():

    return jsonify({
        "message": "LifeCare Guardian Backend is working!"
    })


# ==========================================
# GENERAL CHAT
# ==========================================

@app.route("/api/chat", methods=["POST"])
def chat():

    try:

        data = request.get_json()

        message = data.get("message", "").strip()

        if not message:

            return jsonify({
                "reply": "Please tell me how you are feeling."
            }), 400


        prompt = f"""
{SYSTEM_PROMPT}

User:
{message}

Give a helpful, safe and concise response.
"""


        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )


        return jsonify({
            "reply": response.text
        })


    except Exception as e:

        print("Chat Error:", e)

        return jsonify({
            "reply": "Sorry, I am unable to connect to the AI assistant right now."
        }), 500


# ==========================================
# AI AVATAR
# ==========================================

@app.route("/api/avatar", methods=["POST"])
def avatar():

    try:

        data = request.get_json()

        user_message = data.get(
            "message",
            ""
        ).strip()


        if not user_message:

            return jsonify({
                "error": "Message is required"
            }), 400


        prompt = f"""
{SYSTEM_PROMPT}

You are also the AI Health Avatar of LifeCare Guardian.

The user says:

{user_message}

Respond as a friendly and responsible health assistant.

Rules:

- Be empathetic.
- Use simple language.
- Give general health and wellness information.
- Do not diagnose diseases.
- Do not prescribe medicines.
- Do not tell the user to stop or change medication.
- For serious symptoms, recommend professional medical help.
- For life-threatening emergencies, recommend immediate
  local emergency services.
- Keep the response concise.
"""


        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )


        return jsonify({
            "reply": response.text
        })


    except Exception as e:

        print("Avatar Error:", e)

        return jsonify({
            "error": "AI assistant unavailable"
        }), 500


# ==========================================
# PDF TEXT EXTRACTION
# ==========================================

def extract_pdf_text(file):

    reader = PdfReader(file)

    text = ""

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:

            text += page_text + "\n"


    return text


# ==========================================
# IMAGE OCR
# ==========================================

def extract_image_text(file):

    image = Image.open(file)

    text = pytesseract.image_to_string(image)

    return text


# ==========================================
# MEDICAL REPORT ANALYZER
# ==========================================

@app.route("/api/analyze-report", methods=["POST"])
def analyze_report():

    try:

        if "file" not in request.files:

            return jsonify({
                "error": "No file uploaded"
            }), 400


        file = request.files["file"]


        if file.filename == "":

            return jsonify({
                "error": "No file selected"
            }), 400


        filename = file.filename.lower()


        # --------------------------------
        # EXTRACT TEXT
        # --------------------------------

        if filename.endswith(".pdf"):

            extracted_text = extract_pdf_text(file)


        elif filename.endswith(
            (".jpg", ".jpeg", ".png")
        ):

            extracted_text = extract_image_text(file)


        else:

            return jsonify({
                "error": "Unsupported file format"
            }), 400


        if not extracted_text.strip():

            return jsonify({
                "error":
                "Could not extract readable text from this report."
            }), 400


        # Limit text

        extracted_text = extracted_text[:15000]


        # --------------------------------
        # GEMINI ANALYSIS
        # --------------------------------

        prompt = f"""
You are LifeCare Guardian's medical report
explanation assistant.

Below is text extracted from a medical report:

--------------------
{extracted_text}
--------------------

Explain the report in simple language.

Use this structure:

1. Report Summary

2. Important Findings

3. Important Values

4. What These Terms Mean

5. Questions to Ask Your Doctor

6. General Next Steps

IMPORTANT:

- Do not diagnose the patient.
- Do not prescribe medicines.
- Do not tell the patient to start, stop or change medication.
- Do not invent values.
- Explain medical terms simply.
- Mention when professional interpretation is needed.
- Laboratory reference ranges can differ.
- If something appears concerning, recommend discussing it
  promptly with a qualified healthcare professional.
"""


        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )


        return jsonify({

            "success": True,

            "filename": file.filename,

            "reply": response.text

        })


    except Exception as e:

        print("Report Error:", e)

        return jsonify({
            "error": "Unable to analyze the report"
        }), 500


# ==========================================
# MENTAL HEALTH
# ==========================================

@app.route("/api/mental-health", methods=["POST"])
def mental_health():

    try:

        data = request.get_json()

        mood = data.get("mood", "")

        answers = data.get(
            "answers",
            {}
        )


        prompt = f"""
You are LifeCare Guardian, a supportive mental wellness assistant.

The user completed a daily wellness check-in.

Mood:
{mood}

Sleep:
{answers.get("sleep", "Not answered")}

Stress:
{answers.get("stress", "Not answered")}

Energy:
{answers.get("energy", "Not answered")}

Concentration:
{answers.get("concentration", "Not answered")}

Provide a short, empathetic wellness response.

Include:

1. Acknowledge how they are feeling.
2. Give 2-3 practical wellness suggestions.
3. Encourage healthy sleep, hydration, movement,
   relaxation or talking to trusted people when appropriate.

IMPORTANT:

- Do not diagnose any mental-health condition.
- Do not assign psychiatric labels.
- Do not prescribe medication.
- Do not claim this questionnaire diagnoses anything.
- If the user mentions immediate danger or self-harm,
  encourage immediate professional/emergency help.
"""


        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )


        return jsonify({
            "reply": response.text
        })


    except Exception as e:

        print("Mental Health Error:", e)

        return jsonify({
            "error": "Unable to generate wellness response"
        }), 500


# ==========================================
# LIFESTYLE
# ==========================================

@app.route("/api/lifestyle", methods=["POST"])
def lifestyle():

    try:

        data = request.get_json()


        goal = data.get("goal", "")

        activity = data.get(
            "activity",
            ""
        )

        diet = data.get(
            "diet",
            ""
        )

        sleep = data.get(
            "sleep",
            ""
        )

        water = data.get(
            "water",
            ""
        )


        prompt = f"""
You are LifeCare Guardian, a general wellness assistant.

Create a practical daily wellness plan based on:

Goal:
{goal}

Activity level:
{activity}

Food preference:
{diet}

Sleep:
{sleep}

Water intake:
{water}

Provide:

1. Morning routine
2. Healthy food ideas
3. Lunch ideas
4. Dinner ideas
5. Healthy snack ideas
6. Simple physical activity
7. Sleep improvement tips
8. Hydration habits
9. Three habits to focus on this week

IMPORTANT:

- Give general wellness information only.
- Do not diagnose diseases.
- Do not prescribe medical diets.
- Do not recommend medicines as treatment.
- Do not make extreme calorie restrictions.
- Mention that allergies and medical conditions require
  professional dietary advice.
- Keep recommendations practical and affordable.
"""


        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )


        return jsonify({
            "reply": response.text
        })


    except Exception as e:

        print("Lifestyle Error:", e)

        return jsonify({
            "error": "Unable to generate lifestyle plan"
        }), 500


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )