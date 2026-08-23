from flask import jsonify


class APIError(Exception):
    def __init__(self, message: str, code: str = "ERROR", status: int = 400):
        self.message = message
        self.code = code
        self.status = status
        super().__init__(message)


def register_error_handlers(app):
    @app.errorhandler(APIError)
    def handle_api_error(exc: APIError):
        return jsonify({
            "success": False,
            "error": {"code": exc.code, "message": exc.message},
        }), exc.status

    @app.errorhandler(404)
    def handle_404(_):
        return jsonify({
            "success": False,
            "error": {"code": "NOT_FOUND", "message": "Endpoint not found."},
        }), 404

    @app.errorhandler(405)
    def handle_405(_):
        return jsonify({
            "success": False,
            "error": {"code": "METHOD_NOT_ALLOWED", "message": "Method not allowed."},
        }), 405

    @app.errorhandler(500)
    def handle_500(_):
        return jsonify({
            "success": False,
            "error": {"code": "INTERNAL_ERROR", "message": "An internal error occurred."},
        }), 500
