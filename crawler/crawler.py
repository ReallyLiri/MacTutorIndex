import concurrent.futures
import os
from concurrent.futures import ProcessPoolExecutor
from urllib.parse import urljoin, urlparse

import html2text
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

from utils.workers import get_worker_count

BASE_URL = "https://mathshistory.st-andrews.ac.uk/Biographies/"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "store/md")

WORKERS = get_worker_count()

os.makedirs(OUTPUT_DIR, exist_ok=True)


def get_biography_links(letter_url):
    session = requests.Session()
    resp = session.get(letter_url)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    bio_links = []
    for a in soup.select("a[href^='../']"):
        href = a.get("href")
        if (
            href == "../"
            or href.startswith("../../")
            or href.startswith("../letter-")
            or href.startswith("../category-")
            or "/chronological/" in href
        ):
            continue
        full_url = urljoin(letter_url, href)
        bio_links.append(full_url)
    return bio_links


def convert_html_to_markdown(html):
    h = html2text.HTML2Text()
    h.ignore_links = False
    h.body_width = 0
    md = h.handle(html).strip()
    while "\n\n" in md:
        md = md.replace("\n\n", "\n")
    return md


def save_markdown(url, markdown):
    path = urlparse(url).path
    filename = os.path.basename(path.strip("/")) + ".md"
    filepath = os.path.join(OUTPUT_DIR, filename)

    replacements = {
        "Ã¶": "ö",
        "Ã¤": "ä",
        "Ã¼": "ü",
        "Ã": "Ä",
        "Ã©": "é",
        "Ã¨": "è",
        "Ã¡": "á",
        "Ã ": "à",
        "Ã¢": "â",
        "Ã®": "î",
        "Ã´": "ô",
        "Ã»": "û",
        "Ã§": "ç",
        "Ã±": "ñ",
    }

    for wrong, correct in replacements.items():
        markdown = markdown.replace(wrong, correct)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(markdown)

    return filename


def clean_html(html: str) -> str:
    while "<!--noindex-->" in html and "<!--endnoindex-->" in html:
        start = html.find("<!--noindex-->")
        end = html.find("<!--endnoindex-->", start) + len("<!--endnoindex-->")
        if end > start:
            html = html[:start] + html[end:]
        else:
            break

    lines = html.splitlines()
    filtered = []

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("Written by") or stripped.startswith("Last Update"):
            continue
        filtered.append(line)

    return "\n".join(filtered)


def process_biography(bio_url):
    try:
        session = requests.Session()
        resp = session.get(bio_url)
        resp.raise_for_status()

        if resp.encoding.lower() != "utf-8":
            resp.encoding = "utf-8"

        html = clean_html(resp.text)
        soup = BeautifulSoup(html, "html.parser")

        meta_tag = soup.new_tag("meta")
        meta_tag.attrs["charset"] = "utf-8"
        if soup.head is None:
            head_tag = soup.new_tag("head")
            head_tag.append(meta_tag)
            if soup.html is None:
                html_tag = soup.new_tag("html")
                html_tag.append(head_tag)
                soup.append(html_tag)
            else:
                soup.html.insert(0, head_tag)
        else:
            soup.head.insert(0, meta_tag)

        for a in soup.find_all("a", href=True):
            a["href"] = urljoin(bio_url, a["href"])

        markdown = convert_html_to_markdown(str(soup))
        filename = save_markdown(bio_url, markdown)
        return True, filename
    except Exception as e:
        return False, f"Error processing {bio_url}: {str(e)}"


def crawl_biographies():
    letters = [chr(letter) for letter in range(ord("a"), ord("z") + 1)]
    all_bio_links = []
    for letter in letters:
        letter_url = f"{BASE_URL}letter-{letter}/"
        print(f"Processing letter page: {letter_url}")
        try:
            bio_links = get_biography_links(letter_url)
            all_bio_links.extend(bio_links)
            print(f"Found {len(bio_links)} biographies for letter '{letter}'")
        except Exception as e:
            print(f"Error getting links for letter {letter}: {str(e)}")

    print(f"Processing {len(all_bio_links)} biographies with {WORKERS} workers")

    success_count = 0
    error_count = 0

    with ProcessPoolExecutor(max_workers=WORKERS) as executor:
        with tqdm(total=len(all_bio_links), desc="Fetching biographies") as pbar:
            future_to_url = {
                executor.submit(process_biography, url): url for url in all_bio_links
            }
            for future in concurrent.futures.as_completed(future_to_url):
                url = future_to_url[future]
                try:
                    success, result = future.result()
                    if success:
                        success_count += 1
                    else:
                        error_count += 1
                        print(f"\n{result}")
                except Exception as exc:
                    print(f"\nError processing {url}: {exc}")
                    error_count += 1

                pbar.update(1)

    print(f"Completed: {success_count} succeeded, {error_count} failed")
    return success_count, error_count


if __name__ == "__main__":
    crawl_biographies()
