import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ API KEY NOT FOUND")
    exit()

print("✅ API key found")

client = genai.Client(api_key=api_key)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Say hello to my AI LifeCare Guardian project in one sentence."
)

print("\nGemini response:")
print(response.text)