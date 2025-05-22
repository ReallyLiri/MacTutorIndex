import json
import os
import re

INPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "store/md")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "store/json/l1")

os.makedirs(OUTPUT_DIR, exist_ok=True)


def extract_name(text):
    lines = text.split("\n")
    if lines and lines[0].startswith("# "):
        return lines[0][2:].strip()
    return ""


def extract_summary(text):
    summary_match = re.search(r"Summary\s+(.+?)(?=\[|$)", text, re.DOTALL | re.MULTILINE)
    if summary_match:
        summary_text = summary_match.group(1).strip()
        return re.sub(r"\*\*(.+?)\*\*", r"\1", summary_text)
    return ""


def extract_picture(text):
    picture_match = re.search(r"!\[Thumbnail of .+?\]\((.+?)\)", text)
    if picture_match:
        return picture_match.group(1).strip()
    return None


def extract_date_info(text_section):
    info = {"year": None, "approx": False, "place": None, "link": None}

    if not text_section:
        return info

    year_match = re.search(r"(\d{1,2}\s+\w+\s+)?(\d{4})", text_section)
    if year_match:
        try:
            info["year"] = int(year_match.group(2))
            has_month_day = year_match.group(1) is not None
            info["approx"] = "approx" in text_section.lower() or "about" in text_section.lower() or not has_month_day
        except ValueError:
            pass

    place_link_match = re.search(r"\[(.*?)\]\((.*?)\)", text_section)
    if place_link_match:
        info["place"] = place_link_match.group(1).strip()
        info["link"] = place_link_match.group(2).strip()
    else:
        place_match = re.search(r"\d{4}\s+(.+)", text_section)
        if place_match:
            info["place"] = place_match.group(1).strip()
        elif not year_match:
            info["place"] = text_section.strip()

    return info


def extract_birth_info(text):
    born_section = re.search(r"Born\s+(.+?)(?=Died|$)", text, re.DOTALL)
    if born_section:
        return extract_date_info(born_section.group(1).strip())
    return {"year": None, "approx": None, "place": None, "link": None}


def extract_death_info(text):
    died_section = re.search(r"Died\s+(.+?)(?=\*\s\*\s\*|$)", text, re.DOTALL)
    if died_section:
        return extract_date_info(died_section.group(1).strip())
    return {"year": None, "approx": None, "place": None, "link": None}


def extract_connections(text, id):
    connections = re.findall(
        r"\[.+?]\((https?://mathshistory\.st-andrews\.ac\.uk/Biographies/[^#)]+?)/?\)",
        text,
    )
    if connections:
        unique_connections = []
        prefix = "https://mathshistory.st-andrews.ac.uk/Biographies/"
        for link in connections:
            clean_link = link.rstrip("/")
            # Skip self-links (links to the current biography)
            if (
                f"Biographies/{id}" not in clean_link
                and "#reference-" not in clean_link
                and "/quotations" not in clean_link
                and "/poster/" not in clean_link
            ):
                # Remove the prefix
                if clean_link.startswith(prefix):
                    clean_link = clean_link[len(prefix) :]
                    # Add to unique connections if not already there
                    if clean_link not in unique_connections:
                        unique_connections.append(clean_link)
        return unique_connections
    return []


def extract_biography_data(id, text):
    data = {
        "id": id,
        "name": extract_name(text),
        "summary": extract_summary(text),
        "born": extract_birth_info(text),
        "died": extract_death_info(text),
        "picture": f"https://mathshistory.st-andrews.ac.uk/Biographies/{id}/{extract_picture(text)}",
        "connections": extract_connections(text, id),
    }
    return json.dumps(data, indent=4, ensure_ascii=False)


for file in os.listdir(INPUT_DIR):
    try:
        if not file.endswith(".md"):
            continue
        with open(os.path.join(INPUT_DIR, file), "r", encoding="utf-8") as f:
            markdown_text = f.read()

        print("Processing file:", file)
        result = extract_biography_data(file.replace(".md", ""), markdown_text)
        with open(
            os.path.join(OUTPUT_DIR, file.replace(".md", ".json")),
            "w",
            encoding="utf-8",
        ) as f:
            f.write(result)
    except Exception as ex:
        raise Exception(f"Error processing file {file}: {ex}") from ex
