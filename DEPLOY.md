# Cloudflare Pages deployment

1. In Workers & Pages, create a Pages application and connect GitHub.
2. Authorize only this repository, then select it.
3. Production branch: `main`.
4. Framework preset: None.
5. Build command: `npm test`.
6. Build output directory: `dist`.
7. Root directory: repository root (leave blank).
8. No environment variables or secrets are required.

Save and deploy. Later pushes to `main` automatically redeploy the site.
The published website is publicly accessible even if its GitHub repository is private.

To change graph data, run `python build_data.py`, then `npm test`,
and commit the edited Python sources and generated data/CSV files together.
To regenerate map outlines, run `python build_map.py`.

Review README's upstream attribution and data licenses before public distribution.
