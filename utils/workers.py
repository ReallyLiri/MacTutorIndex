import os
import multiprocessing


def get_worker_count(default_workers=None, max_workers=None):
    if default_workers is None:
        default_workers = max(1, multiprocessing.cpu_count() - 1)

    worker_count = int(os.environ.get("WORKER_COUNT", default_workers))

    if max_workers is not None:
        worker_count = min(worker_count, max_workers)

    return max(1, worker_count)
