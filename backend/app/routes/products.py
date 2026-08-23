import logging

from flask import Blueprint, request

from app.schemas.common import error, success
from app.services import product_service

logger = logging.getLogger(__name__)
products_bp = Blueprint("products", __name__)


@products_bp.get("/products")
def list_products():
    try:
        params = request.args
        max_price = float(params["max_price"]) if params.get("max_price") else None
        min_price = float(params["min_price"]) if params.get("min_price") else None
        in_stock_raw = params.get("in_stock", "").lower()
        in_stock = True if in_stock_raw == "true" else (False if in_stock_raw == "false" else None)

        products = product_service.get_products(
            search=params.get("search"),
            category=params.get("category"),
            brand=params.get("brand"),
            max_price=max_price,
            min_price=min_price,
            in_stock=in_stock,
        )
        return success(data={"products": products, "count": len(products)})
    except ValueError:
        return error("Invalid price filter value.", "INVALID_PARAM")
    except Exception as exc:
        logger.error("Products fetch error: %s", exc)
        return error("Failed to fetch products.", "DB_ERROR", 503)


@products_bp.get("/products/<product_id>")
def get_product(product_id: str):
    try:
        product = product_service.get_product_by_id(product_id)
        if not product:
            return error("Product not found.", "PRODUCT_NOT_FOUND", 404)
        return success(data=product)
    except Exception as exc:
        logger.error("Product fetch error: %s", exc)
        return error("Failed to fetch product.", "DB_ERROR", 503)


@products_bp.get("/products/search")
def search_products():
    query = request.args.get("q", "").strip()
    if not query:
        return error("Query parameter 'q' is required.", "MISSING_PARAM")
    try:
        products = product_service.get_products(search=query)
        return success(data={"products": products, "count": len(products), "query": query})
    except Exception as exc:
        logger.error("Product search error: %s", exc)
        return error("Search failed.", "DB_ERROR", 503)