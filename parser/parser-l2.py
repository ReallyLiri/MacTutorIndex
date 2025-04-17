import json
import os

from openai import OpenAI

openai_client = OpenAI()

MD_INPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "store/md")
L1_INPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "store/json/l1")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "store/json/l2")

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
        return response.choices[0].message.content.lstrip("```json").rstrip("```").strip()
    except Exception as e:
        print("!!! Error querying OpenAI", e)


def extract_biography_data(text, l1_data):
    l2_data = openai_query(
        text,
        """Given the markdown-formatted biography text, extract the following structured JSON fields:
- born_in: a year
- died_in: a year
- lived_in: list of places they lived at
- worked_in: list of places they worked at
- religions: specify any religions mentioned
- profession: list of professions
- institution_affiliation: list of affiliations

Return ONLY a JSON object with those fields.""",
        "You are a data extraction assistant.",
        max_tokens=None
    )
    l2_data = json.loads(l2_data)
    l2_data.update(l1_data)

    connections = openai_query(
        text,
        f"""Given the markdown-formatted biography text, and the following connections:
[{", ".join(l1_data["connections"])}]
find for each connection the relationship type (e.g., "student of", "influenced by", "collaborator with")
extract the following structured JSON fields:
- connections: list of objects with fields:
    - person: name of a connected person
    - connection_type: relationship (e.g., "student of", "influenced by", "collaborator with")
Return ONLY a JSON object with those fields.""",
        "You are a data extraction assistant.",
        max_tokens=None
    )
    l2_data.update(json.loads(connections))

    return json.dumps(l2_data, indent=4, ensure_ascii=False)


#for file in os.listdir(MD_INPUT_DIR):
for file in ["Al-Tusi_Nasir.md", "Euclid.md", "Godel.md", "Leibniz.md", "Newton.md"]:
    try:
        if not file.endswith(".md"):
            continue
        with open(os.path.join(MD_INPUT_DIR, file), 'r', encoding='utf-8') as f:
            markdown_text = f.read()
        with open(os.path.join(L1_INPUT_DIR, file.replace(".md", ".json")), 'r', encoding='utf-8') as f:
            l1_json_text = f.read()

        print("Processing file:", file)
        result = extract_biography_data(markdown_text, json.loads(l1_json_text))
        with open(os.path.join(OUTPUT_DIR, file.replace(".md", ".json")), 'w', encoding='utf-8') as f:
            f.write(result)
    except Exception as ex:
        raise Exception(f"Error processing file {file}: {ex}") from ex
