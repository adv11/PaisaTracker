#!/usr/bin/env python3
"""PaisaTracker Dev Server — serves with no-cache headers."""
import http.server
import socketserver
import sys

PORT = 4321


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    """SimpleHTTPRequestHandler that disables all caching."""

    def end_headers(self) -> None:
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Service-Worker-Allowed', '/')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
        super().end_headers()

    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        # Only print error responses (≥400) to keep the terminal clean.
        try:
            code = int(str(args[1]))
            if code >= 400:
                super().log_message(format, *args)
        except (IndexError, ValueError):
            pass


class ReuseAddrServer(socketserver.TCPServer):
    """TCPServer with SO_REUSEADDR so restarts don't hit 'Address in use'."""
    allow_reuse_address = True


if __name__ == '__main__':
    try:
        with ReuseAddrServer(('', PORT), NoCacheHandler) as httpd:
            print(f'\n\033[92m🚀  PaisaTracker dev server → http://localhost:{PORT}\033[0m')
            print('    No-cache headers ON  |  Ctrl+C to stop\n')
            httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n\033[93mServer stopped.\033[0m')
        sys.exit(0)
    except OSError as exc:
        print(f'\033[91mCannot start: {exc}\033[0m')
        print(f'Port {PORT} may be in use. Try: pkill -f server.py')
        sys.exit(1)
