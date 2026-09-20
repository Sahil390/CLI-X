import litellm
import os
import re
import json
from pathlib import Path
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()


def generate_site(prompt: str, style: str = 'modern', template: str = 'default') -> Dict[str, Any]:
    html = _generate_html(prompt, style, template)
    css = _generate_css(style)
    js = _generate_js(template)

    return {
        'files': {
            'index.html': html,
            'style.css': css,
            'main.js': js,
        },
        'html': html,
        'css': css,
        'js': js,
    }


def _generate_html(prompt: str, style: str, template: str) -> str:
    title = prompt.capitalize()

    nav_items = '  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n    <a href="/contact">Contact</a>\n  </nav>'

    body_content = f'''  <header>
    <h1>{title}</h1>
    <p class="tagline">Built with AI for you</p>
  </header>

  <main>
    <section class="hero">
      <h2>Welcome</h2>
      <p>{prompt}</p>
      <a href="/get-started" class="cta">Get Started</a>
    </section>

    <section class="features">
      <div class="feature">
        <h3>Feature One</h3>
        <p>Description of feature one.</p>
      </div>
      <div class="feature">
        <h3>Feature Two</h3>
        <p>Description of feature two.</p>
      </div>
      <div class="feature">
        <h3>Feature Three</h3>
        <p>Description of feature three.</p>
      </div>
    </section>
  </main>

  <footer>
    <p>&copy; {Path(__file__).parent.parent and str(__import__('datetime').datetime.now().year)} {title}</p>
  </footer>'''

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
{nav_items}
{body_content}
  <script src="main.js"></script>
</body>
</html>'''


def _generate_css(style: str) -> str:
    if style == 'dark':
        return '''* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, -apple-system, sans-serif; background: #0f0f0f; color: #e0e0e0; line-height: 1.6; }
nav { padding: 1rem 2rem; display: flex; gap: 1rem; border-bottom: 1px solid #333; }
nav a { color: #4fc3f7; text-decoration: none; }
nav a:hover { text-decoration: underline; }
header { padding: 4rem 2rem; text-align: center; }
h1 { font-size: 2.5rem; color: #4fc3f7; }
.tagline { color: #aaa; font-size: 1.2rem; margin-top: 0.5rem; }
.hero { padding: 3rem 2rem; text-align: center; }
.hero h2 { font-size: 2rem; margin-bottom: 1rem; }
.cta { display: inline-block; padding: 0.75rem 2rem; background: #4fc3f7; color: #000; border-radius: 4px; text-decoration: none; margin-top: 1rem; }
.features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; padding: 2rem; }
.feature { padding: 1.5rem; background: #1a1a1a; border-radius: 8px; }
footer { text-align: center; padding: 2rem; border-top: 1px solid #333; color: #666; }'''

    return '''* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, -apple-system, sans-serif; background: #fff; color: #1a1a1a; line-height: 1.6; }
nav { padding: 1rem 2rem; display: flex; gap: 1rem; border-bottom: 1px solid #e0e0e0; }
nav a { color: #1976d2; text-decoration: none; }
nav a:hover { text-decoration: underline; }
header { padding: 4rem 2rem; text-align: center; }
h1 { font-size: 2.5rem; color: #1976d2; }
.tagline { color: #666; font-size: 1.2rem; margin-top: 0.5rem; }
.hero { padding: 3rem 2rem; text-align: center; }
.hero h2 { font-size: 2rem; margin-bottom: 1rem; }
.cta { display: inline-block; padding: 0.75rem 2rem; background: #1976d2; color: #fff; border-radius: 4px; text-decoration: none; margin-top: 1rem; }
.features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; padding: 2rem; }
.feature { padding: 1.5rem; background: #f5f5f5; border-radius: 8px; }
footer { text-align: center; padding: 2rem; border-top: 1px solid #e0e0e0; color: #999; }'''


def _generate_js(template: str) -> str:
    return '''// Auto-generated JavaScript
(function() {
  'use strict';

  console.log('Site loaded');

  document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('nav a');
    links.forEach(function(link) {
      link.addEventListener('click', function(e) {
        // Client-side routing placeholder
        console.log('Navigate to:', this.href);
      });
    });

    const cta = document.querySelector('.cta');
    if (cta) {
      cta.addEventListener('click', function(e) {
        console.log('CTA clicked');
      });
    }
  });
})();
'''


def generate_page(name: str, content: str, style: str = 'modern') -> Dict[str, Any]:
    css = _generate_css(style)
    js = _generate_js('default')
    return {
        'page': name,
        'html': content,
        'css': css,
        'js': js,
    }




def generate_site_contextual(prompt: str, output_dir: str = 'src', style: str = 'modern', template: str = 'default') -> Dict[str, Any]:
    import litellm
    import os
    import re
    from pathlib import Path

    provider = (os.environ.get("AI_PROVIDER") or "openai").lower()
    api_key = os.environ.get("AI_API_KEY") or ""

    if provider == "openai":
        os.environ["OPENAI_API_KEY"] = api_key
        chosen_model = "gpt-4o"
    elif provider == "anthropic":
        os.environ["ANTHROPIC_API_KEY"] = api_key
        chosen_model = "claude-3-5-sonnet-20240620"
    elif provider == "gemini":
        os.environ["GEMINI_API_KEY"] = api_key
        chosen_model = "gemini/gemini-1.5-pro"
    else:
        os.environ["OPENAI_API_KEY"] = api_key
        chosen_model = "gpt-4o"

    html_path = Path(output_dir) / 'index.html'
    css_path = Path(output_dir) / 'style.css'
    html_path.parent.mkdir(parents=True, exist_ok=True)

    current_html = html_path.read_text(encoding='utf-8') if html_path.exists() else ''
    current_css = css_path.read_text(encoding='utf-8') if css_path.exists() else ''

    system_prompt = (
        "You are an expert frontend developer. Output ONLY raw HTML/CSS. "
        "Do not wrap your response in markdown code blocks. Include all CSS inside a <style> tag in <head> if needed."
    )
    user_content = (
        f"Current HTML:\n{current_html}\n\nCurrent CSS:\n{current_css}\n\nRequest: {prompt}\n\nProvide the complete updated HTML file."
    )

    response = litellm.completion(
        model=chosen_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
    )
    raw_text = response.choices[0].message.content or ""
    clean = re.sub(r"```(?:html)?\n?|```", "", raw_text).strip()

    # Write HTML (with embedded style if separate CSS not extracted)
    html_path.write_text(clean if clean.startswith("<!DOCTYPE") or "<html" in clean else f"<!DOCTYPE html>\n<html><head><style>\n{current_css}\n</style></head><body>{clean}</body></html>", encoding='utf-8')
    # Try to extract CSS block if present
    css_match = re.search(r"<style>(.*?)</style>", clean, re.DOTALL)
    if css_match:
        css_path.write_text(css_match.group(1).strip(), encoding='utf-8')
    else:
        css_path.write_text(current_css or "", encoding='utf-8')

    return {'success': True, 'files': {'index.html': str(html_path), 'style.css': str(css_path)}}
