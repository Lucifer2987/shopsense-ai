import logging

from flask import Flask
from flask_cors import CORS

from app.config import Config, validate_config
from app.utils.errors import register_error_handlers
from app.routes.health import health_bp
from app.routes.products import products_bp
from app.routes.shopping import shopping_bp
from app.routes.voice import voice_bp
from app.routes.recommendations import recommendations_bp
from app.routes.context import context_bp
from app.routes.history import history_bp
from app.routes.basket import basket_bp

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


def create_app() -> Flask:
    validate_config()

    app = Flask(__name__)
    CORS(app, origins=Config.CORS_ORIGINS)

    register_error_handlers(app)

    blueprints = [
        health_bp,
        products_bp,
        shopping_bp,
        voice_bp,
        recommendations_bp,
        context_bp,
        history_bp,
        basket_bp,
    ]
    for bp in blueprints:
        app.register_blueprint(bp, url_prefix="/api")

    return app