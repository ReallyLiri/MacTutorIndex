import glob
import os


def fix_encoding(filename=None):
    """Fix encoding issues in markdown files where UTF-8 characters appear corrupted."""
    md_dir = os.path.join(os.path.dirname(__file__), "..", "store/md")

    # Common character replacements for UTF-8 misinterpreted as Latin-1
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

    if filename:
        # Fix a single file
        filepaths = [os.path.join(md_dir, filename)]
    else:
        # Fix all markdown files
        filepaths = glob.glob(os.path.join(md_dir, "*.md"))

    fixed_count = 0

    for filepath in filepaths:
        print(f"Processing {os.path.basename(filepath)}...")

        # Read the file content
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        original_content = content

        # Apply all replacements
        for wrong, correct in replacements.items():
            content = content.replace(wrong, correct)

        # Only write if changes were made
        if content != original_content:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Fixed encoding in {os.path.basename(filepath)}")
            fixed_count += 1

    print(f"Fixed {fixed_count} files out of {len(filepaths)} processed")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        fix_encoding(sys.argv[1])
    else:
        fix_encoding()
