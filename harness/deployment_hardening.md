# Deployment Hardening Checklist

## Runtime Baseline
- Build image using repository `Dockerfile`.
- Run container with managed `DATABASE_URL` secret.
- Confirm service starts on configured `PORT`.
- Verify `GET /api/health` returns `200` and JSON status payload.

## Secrets and Configuration
- Inject runtime secrets only through managed environment configuration.
- Do not commit production secrets to source control.
- Rotate database credentials and session/auth secrets according to environment policy.

## Deployment Confidence
- Run `npm test`, `npm run lint`, and `npm run build` before publishing image tags.
- Smoke test container startup after each deployment artifact build.
- Keep rollback-ready tags for previously known-good builds.
