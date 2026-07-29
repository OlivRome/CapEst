#!/usr/bin/env python3
"""Serveur de développement pour la preview CAPEX Suite.

Identique à `python3 -m http.server` mais ajoute des en-têtes anti-cache
(Cache-Control: no-store) afin que le navigateur recharge toujours la
dernière version des fichiers (HTML/JS/CSS) pendant le développement.
Sans cela, les modules ES et le JavaScript restent en cache et masquent
les modifications récentes.

Usage : python3 scripts/dev-server.py [port] [--directory DIR]
"""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    """Ajoute des en-têtes anti-cache à chaque réponse."""

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description="Serveur de dev anti-cache.")
    parser.add_argument("port", nargs="?", type=int, default=8080, help="Port d'écoute (défaut : 8080).")
    parser.add_argument("--directory", default="frontend", help="Dossier servi (défaut : frontend).")
    args = parser.parse_args()

    handler = partial(NoCacheHandler, directory=args.directory)
    server = ThreadingHTTPServer(("0.0.0.0", args.port), handler)
    print(f"Serveur de dev (anti-cache) sur le port {args.port}, dossier « {args.directory} »")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()


if __name__ == "__main__":
    main()
