from typing import Any


def success(data: Any = None, message: str = "", code: int = 200):
    body: dict = {"success": True}
    if message:
        body["message"] = message
    if data is not None:
        body["data"] = data
    return body, code


def error(message: str, error_code: str = "ERROR", http_code: int = 400):
    return {
        "success": False,
        "error": {"code": error_code, "message": message},
    }, http_code
