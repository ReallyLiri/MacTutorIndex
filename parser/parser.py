import os

from openai import OpenAI

openai_client = OpenAI()

INPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "store/md")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "store/json")

os.makedirs(OUTPUT_DIR, exist_ok=True)

def openai_query(question, text, instructions, max_tokens=50, creativity=0):
    if not openai_client:
        return ""
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": question},
                {"role": "user", "content": text},
                {"role": "system", "content": instructions},
            ],
            max_tokens=max_tokens,
            temperature=creativity
        )
        if len(response.choices) != 1:
            print("!!! Unexpected response from OpenAI", response)
        if response.choices[0].finish_reason != 'stop':
            print("!!! OpenAI did not finish processing the request", response)
        return response.choices[0].message.content
    except Exception as e:
        print("!!! Error querying OpenAI", e)


def extract_biography_data(text):
    return openai_query(
        text,
        """Given the markdown-formatted biography text, extract the following structured JSON fields:
- born_in: a year
- died_in: a year
- worked_in: list of places they worked
- religion: if any is specified
- profession: list of professions
- institution_affiliation: list of affiliations
- connections: list of objects with fields:
    - person: name of a connected person
    - connection_type: relationship (e.g., "student of", "influenced by", "collaborator with")

Return ONLY a JSON object with those fields.""",
        "You are a data extraction assistant.",
        max_tokens=None
    ).lstrip("```json").rstrip("```").strip()


for file in os.listdir(INPUT_DIR):
    try:
        if not file.endswith(".md"):
            continue
        with open(os.path.join(INPUT_DIR, file), 'r', encoding='utf-8') as f:
            markdown_text = f.read()

        print("Processing file:", file)
        result = extract_biography_data(markdown_text)
        with open(os.path.join(OUTPUT_DIR, file.replace(".md", ".json")), 'w', encoding='utf-8') as f:
            f.write(result)
    except Exception as ex:
        raise Exception(f"Error processing file {file}: {ex}") from ex
