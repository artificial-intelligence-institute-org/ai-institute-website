import os
import re
import shutil
from datetime import datetime

try:
    import markdown
except ImportError:
    print("Error: 'markdown' package not found. Install it with: pip install markdown")
    exit(1)

BLOG_DIR = "_blog"
OUTPUT_DIR = "blog"
SCRIPTS_DIR = "_scripts"

SLUG_BLACKLIST = {"index"}


def slugify(filename):
    name, _ = os.path.splitext(filename)
    slug = name.strip().lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    if slug in SLUG_BLACKLIST:
        slug = f"post-{slug}"
    return slug if slug else "post"


def parse_markdown(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    front_matter = {
        "title": "Untitled",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "author": "AI Institute",
        "description": "",
    }

    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            raw_fm = parts[1].strip()
            body = parts[2].strip()
            for line in raw_fm.split("\n"):
                match = re.match(r"^\s*(\w+)\s*:\s*(.+?)\s*$", line)
                if match:
                    key = match.group(1).lower()
                    val = match.group(2).strip().strip('"').strip("'")
                    if key in front_matter:
                        front_matter[key] = val
        else:
            body = content
    else:
        body = content

    md = markdown.Markdown(extensions=["fenced_code", "codehilite", "nl2br"])
    html_body = md.convert(body)

    return front_matter, html_body


def load_template(filename):
    path = os.path.join(SCRIPTS_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def render_template(template, **kwargs):
    result = template
    for key, val in kwargs.items():
        result = result.replace("{{" + key + "}}", val)
    return result


def generate_post_html(post_template, slug, fm, body_html):
    return render_template(
        post_template,
        TITLE=fm["title"],
        DATE=fm["date"],
        AUTHOR=fm["author"],
        DESCRIPTION=fm["description"],
        SLUG=slug,
        CONTENT=body_html,
    )


def generate_index_html(index_template, posts):
    if not posts:
        posts_html = '<div class="no-posts"><p>No posts yet. Check back soon.</p></div>'
    else:
        cards = []
        for slug, fm in posts:
            excerpt = fm["description"] or ""
            card = f'''<article class="blog-post-card">
                <h2><a href="{slug}.html">{fm["title"]}</a></h2>
                <p class="meta">{fm["date"]} &middot; {fm["author"]}</p>
                <p class="excerpt">{excerpt}</p>
            </article>'''
            cards.append(card)
        posts_html = '<div class="blog-posts">\n' + "\n".join(cards) + '\n</div>'

    return index_template.replace("{{POSTS}}", posts_html)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    post_template = load_template("blog-template.html")
    index_template = load_template("blog-index-template.html")

    files = sorted(
        [f for f in os.listdir(BLOG_DIR) if f.endswith(".md")],
        reverse=True,
    )

    if not files:
        print("No markdown files found in _blog/")
        # Still generate an index
        html = generate_index_html(index_template, [])
        outpath = os.path.join(OUTPUT_DIR, "index.html")
        with open(outpath, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"Generated {outpath} (empty)")
        return

    posts = []

    for filename in files:
        filepath = os.path.join(BLOG_DIR, filename)
        slug = slugify(filename)
        fm, body_html = parse_markdown(filepath)
        html = generate_post_html(post_template, slug, fm, body_html)

        outpath = os.path.join(OUTPUT_DIR, f"{slug}.html")
        with open(outpath, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"Generated {outpath}")

        posts.append((datetime.strptime(fm["date"], "%Y-%m-%d"), slug, fm))

    posts.sort(key=lambda x: x[0], reverse=True)
    # Build list of (slug, fm) for index, keyed off the full list (which is already sorted by date due to reverse sort on files)
    index_posts = [(slug, fm) for _, slug, fm in posts]

    html = generate_index_html(index_template, index_posts)
    outpath = os.path.join(OUTPUT_DIR, "index.html")
    with open(outpath, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Generated {outpath}")


if __name__ == "__main__":
    main()
