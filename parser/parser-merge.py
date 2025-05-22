import json
import os
import glob
import unicodedata

from requests import delete

L1_DIR = os.path.join(os.path.dirname(__file__), "..", "store/json/l1")
L2_DIR = os.path.join(os.path.dirname(__file__), "..", "store/json/l2")


def merge_json_files():
    os.makedirs(L2_DIR, exist_ok=True)

    for l1_file_path in glob.glob(os.path.join(L1_DIR, "*.json")):
        filename = os.path.basename(l1_file_path)
        l2_file_path = os.path.join(L2_DIR, filename)

        with open(l1_file_path, 'r', encoding='utf-8') as f:
            l1_data = json.load(f)

        if os.path.exists(l2_file_path):
            with open(l2_file_path, 'r', encoding='utf-8') as f:
                l2_data = json.load(f)

            for key, value in l1_data.items():
                if key != "connections":
                    l2_data[key] = value
                else:
                    l2_connections = l2_data.get("connections", [])
                    for conn in l2_connections:
                        conn.pop("key", None)
                    for connection in value:
                        l2_connection = next(
                            (
                                conn
                                for conn in l2_connections
                                if connection.split("_")[0]
                                in unicodedata.normalize("NFKD", conn["person"]).encode("ascii", "ignore").decode()
                            ),
                            None,
                        )
                        if l2_connection:
                            l2_connection["key"] = connection
                        else:
                            l2_connections.append({"person": connection, "key": connection, "connection_type": "Other"})

            with open(l2_file_path, 'w', encoding='utf-8') as f:
                f.write(json.dumps(l2_data, indent=4, ensure_ascii=False))

            print(f"Updated: {filename}")
        else:
            with open(l2_file_path, 'w', encoding='utf-8') as f:
                f.write(json.dumps(l1_data, indent=4, ensure_ascii=False))

            print(f"Created: {filename}")


if __name__ == "__main__":
    print("Merging L1 data into L2 data...")
    merge_json_files()
    print("Merge complete!")
