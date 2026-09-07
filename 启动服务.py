"""只分发密室游戏的局域网静态服务，不接收或集中保存学生记录。"""
import argparse
import gzip
import ipaddress
import platform
import socket
import subprocess
import threading
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


def lan_addresses():
    candidates = set()
    if platform.system() == "Darwin":
        for interface in ("en0", "en1", "en2", "en3", "en4", "en5"):
            result = subprocess.run(["/usr/sbin/ipconfig", "getifaddr", interface], capture_output=True, text=True, check=False)
            if result.returncode == 0:
                candidates.add(result.stdout.strip())
    try:
        candidates.update(item[4][0] for item in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET))
    except socket.gaierror:
        pass
    addresses = []
    for candidate in sorted(candidates):
        try:
            address = ipaddress.ip_address(candidate)
            if address.is_private and not address.is_loopback and not address.is_link_local:
                addresses.append(candidate)
        except ValueError:
            continue
    return addresses


def main():
    parser = argparse.ArgumentParser(description="机关密室 · 教室局域网服务")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error("端口必须在1到65535之间")
    content = Path(__file__).with_name("index.html").read_bytes()
    compressed = gzip.compress(content)

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            route = urlsplit(self.path).path
            if route == "/favicon.ico":
                self.send_response(204)
                self.end_headers()
                return
            if route not in ("/", "/index.html", "/health"):
                self.send_error(404, "Not found")
                return
            is_health = route == "/health"
            use_gzip = not is_health and "gzip" in self.headers.get("Accept-Encoding", "")
            payload = b"ok" if is_health else compressed if use_gzip else content
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8" if is_health else "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.send_header("Cache-Control", "no-cache")
            self.send_header("X-Content-Type-Options", "nosniff")
            if use_gzip:
                self.send_header("Content-Encoding", "gzip")
                self.send_header("Vary", "Accept-Encoding")
            self.end_headers()
            self.wfile.write(payload)

        def log_message(self, *unused):
            return

    try:
        server = ThreadingHTTPServer(("0.0.0.0", args.port), Handler)
    except OSError as error:
        parser.exit(1, "无法启动：端口可能已被占用。可使用 --port 8766 改用其他端口。\n" + str(error) + "\n")
    local = "http://127.0.0.1:" + str(args.port)
    print("\n机关密室已经启动。请保持本窗口开启。", flush=True)
    print("教师本机：" + local, flush=True)
    ips = lan_addresses()
    for address in ips:
        print("同网络学生可尝试：http://" + address + ":" + str(args.port), flush=True)
    if not ips:
        print("未自动取得局域网IP，请在系统网络设置中查看教师电脑IPv4地址。", flush=True)
    print("学生与教师需在同一可互访网络；关闭此窗口或按 Control+C 停止服务。", flush=True)
    print("本服务只提供游戏，不收集学生报告。", flush=True)
    if not args.no_browser:
        threading.Timer(0.5, lambda: webbrowser.open(local)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        print("服务已停止。", flush=True)


if __name__ == "__main__":
    main()
