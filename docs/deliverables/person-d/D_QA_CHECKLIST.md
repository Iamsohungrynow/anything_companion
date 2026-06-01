# Person D Reliability QA Checklist

## Automated Regression

- [ ] Run `npm run test:all`.
- [ ] Run `git diff --check`.
- [ ] Run `git ls-files .env` and confirm it prints nothing.
- [ ] Scan tracked files for accidental API keys before push.

## Main Demo Path

- [ ] Open `http://127.0.0.1:3017`.
- [ ] Choose Study Start, keep the default Coffee Cup, and generate Cappu without uploading a file.
- [ ] Send `I have a finance quiz but I am tired and stuck.`.
- [ ] Confirm Encourage Mode, structured tiny steps, Sprint, countdown, check-in, memory, and runtime trace.
- [ ] Submit one check-in option and confirm the Memory page shows the synced result.

## Backup And Failure Paths

- [ ] Repeat the complete Study flow at `http://127.0.0.1:3017/?runtime=local`.
- [ ] Confirm the trace labels the local or deterministic fallback.
- [ ] Reject microphone permission and confirm text input still sends messages.
- [ ] Upload an invalid file and confirm the default Coffee Cup remains usable.
- [ ] Confirm unsupported TTS does not affect text input.

## Browser Review

- [ ] Check the Study path at desktop width with no unhandled console errors.
- [ ] Check the Study path at `390px` width with no horizontal overflow.
- [ ] Before push, fetch `origin/main`, inspect changed files, rebase if needed, and rerun all regression commands.
- [ ] Confirm any key previously shared in chat or documents has been revoked and rotated before using the deployed URL.
