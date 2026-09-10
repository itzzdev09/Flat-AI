"""Minimal .env loading, without adding a dependency.

`property_data.py` already hand-rolled a parser for the backend's .env file, so
the same approach is kept here rather than pulling in python-dotenv. Sharing it
means both readers agree on what a .env file looks like.
"""
import os


def parse_env_file(path):
    """Return the key/value pairs in a .env file, or {} when it is absent."""
    values = {}
    if not path or not os.path.exists(path):
        return values

    with open(path, 'r', encoding='utf-8-sig') as env_file:
        for line in env_file:
            stripped = line.strip()
            if not stripped or stripped.startswith('#') or '=' not in stripped:
                continue

            key, value = stripped.split('=', 1)
            key = key.strip()
            if key.startswith('export '):
                key = key[len('export '):].strip()

            value = value.strip()
            # Strip one matching pair of surrounding quotes, if present.
            if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
                value = value[1:-1]

            if key:
                values[key] = value
    return values


def load_env_file(path, override=False):
    """Load a .env file into os.environ.

    Real environment variables win by default: a value exported by the shell,
    a container or the hosting platform should not be silently replaced by a
    checked-out development file.
    """
    values = parse_env_file(path)
    for key, value in values.items():
        if override or key not in os.environ:
            os.environ[key] = value
    return values
