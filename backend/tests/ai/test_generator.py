import sys
import os
import re

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from backend.ai.generator import generate_site


class TestGenerateSite:
    def test_returns_html_css_js(self):
        result = generate_site("test prompt")

        assert "html" in result
        assert "css" in result
        assert "js" in result
        assert "files" in result

    def test_html_contains_prompt(self):
        prompt = "a landing page for my coffee shop"
        result = generate_site(prompt)

        assert prompt in result["html"]
        assert result["html"].startswith("<!DOCTYPE html>")

    def test_generated_html_has_structure(self):
        result = generate_site("test")

        html = result["html"]
        assert "<html" in html.lower()
        assert "<head>" in html.lower() or "<head>" in html
        assert "<body>" in html.lower() or "<body>" in html

    def test_generated_css_has_styles(self):
        result = generate_site("test")

        css = result["css"]
        assert len(css) > 0
        assert "body" in css

    def test_dark_style_generates_dark_css(self):
        result = generate_site("test", style="dark")

        css = result["css"]
        assert "#0f0f0f" in css or "#0f0f0f" in css  # dark background
        assert "#e0e0e0" in css or "#e0e0e0" in css  # light text

    def test_modern_style_generates_light_css(self):
        result = generate_site("test", style="modern")

        css = result["css"]
        assert "#fff" in css or "#ffffff" in css or "background: #fff" in css

    def test_default_template_js(self):
        result = generate_site("test")

        js = result["js"]
        assert "DOMContentLoaded" in js
        assert "console.log" in js

    def test_files_dict_has_correct_paths(self):
        result = generate_site("test")

        files = result["files"]
        assert "index.html" in files
        assert "style.css" in files
        assert "main.js" in files

    def test_different_prompts_produce_different_titles(self):
        result1 = generate_site("coffee shop")
        result2 = generate_site("portfolio")

        assert "Coffee shop" in result1["html"] or "Coffee Shop" in result1["html"]
        assert "Portfolio" in result2["html"] or "portfolio" in result2["html"]
