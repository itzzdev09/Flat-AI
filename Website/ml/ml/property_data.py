import os
from functools import lru_cache

import pandas as pd
from pymongo import MongoClient


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PICKLE_DATA_PATH = os.path.abspath(os.path.join(BASE_DIR, 'pkl', 'prediction_df.pkl'))
BACKEND_ENV_PATH = os.path.abspath(os.path.join(BASE_DIR, '..', '..', 'Backend', '.env'))


def _read_backend_env():
    values = {}
    if not os.path.exists(BACKEND_ENV_PATH):
        return values

    with open(BACKEND_ENV_PATH, 'r', encoding='utf-8') as env_file:
        for line in env_file:
            stripped = line.strip()
            if not stripped or stripped.startswith('#') or '=' not in stripped:
                continue
            key, value = stripped.split('=', 1)
            values[key.strip()] = value.strip()
    return values


@lru_cache(maxsize=1)
def get_mongodb_uri():
    return os.getenv('MONGODB_URI') or _read_backend_env().get('MONGODB_URI')


def _load_pickle_data():
    dataframe = pd.read_pickle(PICKLE_DATA_PATH)
    return dataframe.to_dict(orient='records')


@lru_cache(maxsize=1)
def get_property_data():
    mongo_uri = get_mongodb_uri()
    if mongo_uri:
        client = None
        try:
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
            database = client.get_default_database()
            if database is None:
                db_name = mongo_uri.rsplit('/', 1)[-1].split('?', 1)[0] or 'realestate'
                database = client[db_name]
            data = list(database['Flat_Data'].find({}, {'_id': 0}))
            if data:
                return data
        except Exception as exc:
            print(f'Could not load MongoDB property data, falling back to pickle: {exc}')
        finally:
            if client is not None:
                client.close()

    return _load_pickle_data()


def reset_property_data_cache():
    get_property_data.cache_clear()
    get_mongodb_uri.cache_clear()
