import os
import json
from concurrent.futures import ThreadPoolExecutor
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from tqdm import tqdm

from utils.workers import get_worker_count

MD_DIR = os.path.join(os.path.dirname(__file__), "..", "store/md")
L1_DIR = os.path.join(os.path.dirname(__file__), "..", "store/json/l1")
L2_DIR = os.path.join(os.path.dirname(__file__), "..", "store/json/l2")

WORKERS = get_worker_count()
os.environ.get("WORKER_COUNT", WORKERS)

cred = credentials.Certificate(
    os.path.join(os.path.dirname(__file__), "..", "gcloud-sa.json")
)
firebase_admin.initialize_app(cred)
db = firestore.client()


def upload_md_file(filename):
    try:
        file_path = os.path.join(MD_DIR, filename)
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        doc_id = filename.replace(".md", "")
        db.collection("md").document(doc_id).set({"md": content})
        return True, filename, None
    except Exception as e:
        return False, filename, str(e)


def upload_json_file(filename, collection):
    try:
        if collection == "l1":
            file_path = os.path.join(L1_DIR, filename)
        else:
            file_path = os.path.join(L2_DIR, filename)

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        doc_id = filename.replace(".json", "")
        db.collection(collection).document(doc_id).set(data)
        return True, filename, None
    except Exception as e:
        return False, filename, str(e)


def parallel_upload(files, upload_func, desc, collection=None):
    success_count = 0
    error_count = 0

    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        with tqdm(total=len(files), desc=desc) as pbar:
            futures = []

            for filename in files:
                if collection:
                    future = executor.submit(upload_func, filename, collection)
                else:
                    future = executor.submit(upload_func, filename)
                futures.append((future, filename))

            for future, filename in futures:
                try:
                    success, file, error = future.result()
                    if success:
                        success_count += 1
                    else:
                        error_count += 1
                        print(f"\nError processing {file}: {error}")
                except Exception as exc:
                    error_count += 1
                    print(f"\nException processing {filename}: {exc}")

                pbar.update(1)

    print(f"Completed: {success_count} succeeded, {error_count} failed")
    return success_count, error_count


def upload_all_data():
    md_files = [f for f in os.listdir(MD_DIR) if f.endswith(".md")]
    print(f"Found {len(md_files)} markdown files to upload")
    parallel_upload(md_files, upload_md_file, "Uploading markdown files")

    l1_files = [f for f in os.listdir(L1_DIR) if f.endswith(".json")]
    print(f"Found {len(l1_files)} L1 JSON files to upload")
    parallel_upload(
        l1_files, upload_json_file, "Uploading L1 JSON files", "l1"
    )

    l2_files = [f for f in os.listdir(L2_DIR) if f.endswith(".json")]
    print(f"Found {len(l2_files)} L2 JSON files to upload")
    parallel_upload(
        l2_files, upload_json_file, "Uploading L2 JSON files", "l2"
    )


if __name__ == "__main__":
    upload_all_data()
