"""Tests for the .env loading and the prediction endpoint.

These cover the two config bugs that stopped the service starting or silently
changed its data source, plus the endpoint contract the React app relies on.
"""
import json
import os
import tempfile

from django.test import Client, SimpleTestCase

from ml.env import load_env_file, parse_env_file
from ml.property_data import BACKEND_ENV_PATH, BASE_DIR


def _write(contents):
    handle = tempfile.NamedTemporaryFile('w', suffix='.env', delete=False, encoding='utf-8')
    handle.write(contents)
    handle.close()
    return handle.name


class ParseEnvFileTests(SimpleTestCase):
    def test_missing_file_is_not_an_error(self):
        self.assertEqual(parse_env_file('/nope/does-not-exist.env'), {})
        self.assertEqual(parse_env_file(None), {})

    def test_parses_pairs_and_ignores_noise(self):
        path = _write(
            '# a comment\n'
            '\n'
            'PLAIN=value\n'
            'SPACED =  padded  \n'
            'no_equals_sign\n'
            'EMPTY=\n'
        )
        try:
            values = parse_env_file(path)
        finally:
            os.unlink(path)

        self.assertEqual(values['PLAIN'], 'value')
        self.assertEqual(values['SPACED'], 'padded')
        self.assertEqual(values['EMPTY'], '')
        self.assertNotIn('no_equals_sign', values)

    def test_strips_quotes_export_prefix_and_keeps_inner_equals(self):
        path = _write(
            'QUOTED="quoted value"\n'
            "SINGLE='single'\n"
            'export EXPORTED=exported\n'
            'URI=mongodb://user:pw@host:27017/?opt=1\n'
        )
        try:
            values = parse_env_file(path)
        finally:
            os.unlink(path)

        self.assertEqual(values['QUOTED'], 'quoted value')
        self.assertEqual(values['SINGLE'], 'single')
        self.assertEqual(values['EXPORTED'], 'exported')
        # Splitting on the first '=' only, so query strings survive intact.
        self.assertEqual(values['URI'], 'mongodb://user:pw@host:27017/?opt=1')


class LoadEnvFileTests(SimpleTestCase):
    def test_real_environment_wins_unless_overridden(self):
        key = 'FLAT_AI_TEST_ENV_KEY'
        path = _write(f'{key}=from-file\n')
        self.addCleanup(os.unlink, path)
        self.addCleanup(os.environ.pop, key, None)

        os.environ[key] = 'from-shell'
        load_env_file(path)
        self.assertEqual(os.environ[key], 'from-shell', 'a real env var must not be clobbered')

        load_env_file(path, override=True)
        self.assertEqual(os.environ[key], 'from-file')

    def test_sets_keys_that_are_absent(self):
        key = 'FLAT_AI_TEST_ABSENT_KEY'
        os.environ.pop(key, None)
        path = _write(f'{key}=from-file\n')
        self.addCleanup(os.unlink, path)
        self.addCleanup(os.environ.pop, key, None)

        load_env_file(path)
        self.assertEqual(os.environ[key], 'from-file')


class BackendEnvPathTests(SimpleTestCase):
    def test_points_at_the_backend_beside_this_service(self):
        # Regression: an extra '..' resolved to <repo>/Backend/.env, so the Mongo
        # URI never loaded and ML_PREFER_MONGO quietly fell back to the pickle.
        expected = os.path.abspath(os.path.join(BASE_DIR, '..', 'Backend', '.env'))
        self.assertEqual(BACKEND_ENV_PATH, expected)
        self.assertTrue(BACKEND_ENV_PATH.endswith(os.path.join('Website', 'Backend', '.env')))


class SubmitEndpointTests(SimpleTestCase):
    def setUp(self):
        self.client = Client()

    def test_returns_a_prediction_and_session_id(self):
        response = self.client.post(
            '/api/submit/',
            data=json.dumps({
                'location': 'Madhyamgram', 'bedroom': 2, 'balcony': 1, 'area': 920,
                'age': 'Relatively New', 'furnish': 'Semi Furnished',
                'amenity': 'Medium', 'floor': 'Mid Floor',
            }),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIn('session_id', body)
        self.assertGreater(body['prediction'], 0)

    def test_fetchdata_requires_a_known_session_id(self):
        self.assertEqual(self.client.get('/api/fetchdata/').status_code, 404)
        self.assertEqual(self.client.get('/api/fetchdata/?session_id=nope').status_code, 404)

    def test_fetchdata_returns_a_stored_prediction(self):
        submitted = self.client.post(
            '/api/submit/',
            data=json.dumps({'location': 'Madhyamgram', 'bedroom': 2, 'area': 920}),
            content_type='application/json',
        ).json()

        response = self.client.get(f"/api/fetchdata/?session_id={submitted['session_id']}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['prediction'], submitted['prediction'])
