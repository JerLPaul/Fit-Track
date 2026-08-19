import os
import time
import requests
import xml.etree.ElementTree as ET
from flask_restx import Resource, fields, reqparse, abort
from src import app, api

nutrition_args = reqparse.RequestParser()
nutrition_args.add_argument("name", type=str, help="Food name is required", required=True)

nutrition_ns = api.namespace('nutrition', description='Nutrition API operations')

nutrition_model = nutrition_ns.model('Nutrition', {
    'name': fields.String(required=True, description='The food name')
    }
)

consumer_key = os.environ.get('API_KEY')
consumer_secret = os.environ.get('API_SECRET')

# --- FatSecret OAuth token cache -------------------------------------------------
# Bug fix: the previous implementation fetched a token once at import time and
# never refreshed it, so the service would start returning 401s as soon as that
# token expired. We now cache the token with its expiry and transparently
# refresh it whenever it's missing/expired, or if FatSecret rejects it.
_token_cache = {"access_token": None, "expires_at": 0}


def get_auth_token(force_refresh=False):
    """Return a valid FatSecret access token, refreshing it if needed."""
    now = time.time()
    if not force_refresh and _token_cache["access_token"] and now < _token_cache["expires_at"]:
        return _token_cache["access_token"]

    if not consumer_key or not consumer_secret:
        abort(500, message="Nutrition API is not configured (missing API_KEY/API_SECRET)")

    token_url = "https://oauth.fatsecret.com/connect/token"
    response = requests.post(token_url, data={
        'client_id': consumer_key,
        'client_secret': consumer_secret,
        'grant_type': 'client_credentials',
        'scope': 'basic',
    }, timeout=10)

    if response.status_code != 200:
        details = _extract_provider_error(response)
        abort(502, message=f"Unable to authenticate with the nutrition provider: {details}")

    payload = response.json()
    _token_cache["access_token"] = payload["access_token"]
    # Refresh a little early to avoid edge-of-expiry failures.
    _token_cache["expires_at"] = now + payload.get("expires_in", 3600) - 60
    return _token_cache["access_token"]


def _extract_provider_error(response):
    """Return a concise description of an upstream provider error payload.

    Tries common JSON fields, otherwise falls back to a text snippet.
    """
    try:
        payload = response.json()
    except ValueError:
        text = (response.text or "")[:500]
        code = getattr(response, "code", None)

        try:
            root = ET.fromstring(text)
            code_text = root.findtext("code") or root.findtext("{http://platform.fatsecret.com/api/1.0/}code")
            message_text = root.findtext("message") or root.findtext("{http://platform.fatsecret.com/api/1.0/}message")
            if code_text or message_text:
                return f"status={response.status_code}, code={code_text or code}, message={message_text or text}"
        except ET.ParseError:
            pass

        if code is not None:
            return f"status={response.status_code}, code={code}, body={text}"

        return f"status={response.status_code}, body={text}"

    if isinstance(payload, dict):
        error_code = None
        error_obj = payload.get("error")
        if isinstance(error_obj, dict):
            error_code = error_obj.get("code") or error_obj.get("error_code")

        if error_code is None:
            for key in ("error_code", "code", "errorCode"):
                if key in payload:
                    error_code = payload[key]
                    break

        for key in ("error", "error_description", "message", "messages", "errors"):
            if key in payload:
                msg = payload[key]
                if error_code is not None:
                    return f"status={response.status_code}, code={error_code}, {key}={msg}"
                return f"status={response.status_code}, {key}={msg}"

        if error_code is not None:
            return f"status={response.status_code}, code={error_code}, body={payload}"

    return f"status={response.status_code}, error= body={payload}"


@nutrition_ns.route('/')
@nutrition_ns.response(404, 'Nutrition not found')
class Nutrition(Resource):
    @nutrition_ns.expect(nutrition_model)
    def post(self):
        """Search for foods and return nutrition facts"""
        args = nutrition_args.parse_args()
        search_expression = (args.get('name') or '').strip()

        if not search_expression:
            # Bug fix: previously an empty search string was sent straight to
            # FatSecret on every keystroke, wasting API calls and returning a
            # confusing response. Just return an empty result set instead.
            return {"foods": {"food": []}}

        search_url = "https://platform.fatsecret.com/rest/server.api"
        params = {
            'method': 'foods.search',
            'search_expression': search_expression,
            'format': 'json',
        }

        token = get_auth_token()
        response = requests.get(
            search_url,
            headers={'Authorization': f'Bearer {token}'},
            params=params,
            timeout=10,
        )

        # If the cached token expired server-side, refresh once and retry.
        if response.status_code == 401:
            token = get_auth_token(force_refresh=True)
            response = requests.get(
                search_url,
                headers={'Authorization': f'Bearer {token}'},
                params=params,
                timeout=10,
            )

        if response.status_code != 200:
            details = _extract_provider_error(response)
            abort(response.status_code, message=f"Failed to fetch nutrition data: {details}")

        data = response.json()

        # FatSecret returns a single object (not a list) when there's exactly
        # one match. Normalize to a list so the frontend can always .map().
        foods = data.get('foods', {}).get('food')
        if isinstance(foods, dict):
            data['foods']['food'] = [foods]
        elif foods is None:
            data.setdefault('foods', {})['food'] = []

        return data


@app.route('/health')
def health():
    return {"status": "ok"}


@app.route('/')
def index():
    return {"service": "fit-track-nutrition-api", "status": "ok"}
