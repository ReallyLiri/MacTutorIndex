import json
import os

from parser.query import query_llm, extract_json_from_response

MD_INPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "store/md")
L1_INPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "store/json/l1")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "store/json/l2")

os.makedirs(OUTPUT_DIR, exist_ok=True)

def extract_biography_data(text, l1_data):
    bio_prompt = """Given the markdown-formatted biography text, extract the following structured JSON fields:
- lived_in: list of places they lived at (array of strings)
- worked_in: list of places they worked at (array of strings)
- religions: specify any religions mentioned (array of strings, or null if none)
- profession: list of professions (array of strings)
- institution_affiliation: list of affiliations (array of strings)

Return ONLY a JSON object with those fields, ensure it's valid JSON without comments."""

    l2_data_str = query_llm(text, bio_prompt, max_tokens=2000)
    if not l2_data_str:
        print("Failed to get biography data")
        return json.dumps(l1_data, indent=4, ensure_ascii=False)

    try:
        l2_data_str = extract_json_from_response(l2_data_str)
        l2_data = json.loads(l2_data_str)

        result_data = l1_data.copy()
        result_data.update(l2_data)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON from response ({e}): {l2_data_str}")
        return json.dumps(l1_data, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Unexpected error processing biography data: {e}")
        return json.dumps(l1_data, indent=4, ensure_ascii=False)

    connections_prompt = f"""Given the markdown-formatted biography text, and the following connections:
[{", ".join(l1_data["connections"])}]
find for each connection the relationship type (e.g., "student of", "influenced by", "collaborator with").

Extract the following structured JSON fields:
- connections: list of objects with fields:
    - person: name of a connected person
    - connection_type: relationship (e.g., "student of", "influenced by", "collaborator with")

Return ONLY a valid JSON object with those fields, ensure it's proper JSON format."""

    connections_str = query_llm(text, connections_prompt, max_tokens=2000)
    if connections_str:
        try:
            connections_str = extract_json_from_response(connections_str)
            connections_data = json.loads(connections_str)
            result_data.update(connections_data)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON from connections response ({e}): {connections_str}")
        except Exception as e:
            print(f"Unexpected error processing connections data: {e}")

    return json.dumps(result_data, indent=4, ensure_ascii=False)

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
