import webbrowser
import http.server
import threading
import json
import urllib.parse
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()


def open_browser(url: str) -> None:
    webbrowser.open(url)


def get_auth_url(provider: str, state: str = '') -> str:
    if provider == 'github':
        base = 'https://github.com/login/oauth/authorize'
        params = {
            'client_id': os.getenv('GITHUB_CLIENT_ID', 'demo-client-id'),
            'redirect_uri': 'http://localhost:8080/callback',
            'scope': 'repo read:user',
            'state': state,
        }
        return f"{base}?{urllib.parse.urlencode(params)}"
    return ''


def start_callback_server(port: int = 8080, timeout: int = 120) -> Optional[str]:
    code_holder = []

    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path == '/callback':
                params = urllib.parse.parse_qs(parsed.query)
                code_holder.append(params.get('code', [''])[0])
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                self.wfile.write(b'<html><body><h1>Authorization complete! You can close this tab.</h1></body></html>')
            else:
                self.send_response(404)
                self.end_headers()

        def log_message(self, *args):
            pass

    server = http.server.HTTPServer(('localhost', port), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    import time
    start = time.time()
    while time.time() - start < timeout:
        if code_holder:
            server.shutdown()
            return code_holder[0]
        time.sleep(0.1)

    server.shutdown()
    return None
