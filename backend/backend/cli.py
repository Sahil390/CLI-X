import click
import json
import os
import sys
from backend.ai.generator import generate_site_contextual
import time

from backend.auth.oauth import authenticate
from backend.auth.session import SessionManager
from backend.build.engine import build_project
from backend.deploy.orchestrator import deploy_project
from backend.ai.generator import generate_site
from backend.config.loader import load_global_config, load_project_config, save_global_config


IS_TTY = sys.stdout.isatty()
class Exit: OK, GENERAL=0,1
@click.group()
def cli():
    """Website Builder - Python Backend"""
    pass

@cli.command()
@click.option('--provider', required=True, help='Auth provider (github, ssh, api-key)')
def login(provider):
    """Authenticate with a provider"""
    click.echo(f"Initiating OAuth for {provider}...")
    result = authenticate(provider)
    if result.get('success'):
        click.echo(click.style('Login successful', fg='green'))
        cfg = load_global_config()
        cfg['auth'][provider] = {
            'token': result.get('token', ''),
            'expires_at': result.get('expires_at', ''),
        }
        save_global_config(cfg)
    else:
        click.echo(click.style(f"Login failed: {result.get('error')}", fg='red'))
        sys.exit(Exit.GENERAL)

@cli.command()
@click.option('--target', required=True, help='Deployment target')
@click.option('--config', default=None, help='Project config path')
def deploy(target, config):
    """Deploy the site"""
    click.echo(f"Deploying to {target}...")
    if not config:
        config = os.path.join(os.getcwd(), 'website-builder.config.json')
    project_config = load_project_config(config)
    result = deploy_project(target, project_config)
    if result.get('success'):
        click.echo(click.style(f"Deployed: {result.get('url', 'N/A')}", fg='green'))
    else:
        click.echo(click.style(f"Failed: {result.get('message')}", fg='red'))
        sys.exit(Exit.GENERAL)

@cli.command()
@click.option('--input', required=True, help='Input directory')
@click.option('--output', required=True, help='Output directory')
@click.option('--template', default='default', help='Template name')
@click.option('--minify/--no-minify', default=True)
def build(input, output, template, minify):
    """Build the site"""
    start = time.time()
    result = build_project(input, output, template, minify)
    elapsed = time.time() - start
    click.echo(json.dumps({
        'files': result.get('files', 0),
        'sizeBytes': result.get('sizeBytes', 0),
        'duration': round(elapsed * 1000),
        'outputDir': output,
        'errors': result.get('errors', []),
    }))

@cli.command()
@click.option('--prompt', required=True, help='Generation prompt')
@click.option('--output', default='src', help='Output directory')
@click.option('--style', default='modern', help='Style')
@click.option('--template', default='default', help='Template')
def ai(prompt, output, style, template):
    """Generate site content with AI"""
    result = generate_site_contextual(prompt, output)
    click.echo(json.dumps(result))

@cli.command()
def init():
    """Initialize project"""
    click.echo("Use the TypeScript CLI for: wb init")

if __name__ == '__main__':
    cli()
