# Verification contract — see code/VERIFY.md G5.
# T0-only stub: no build tooling, no test suite. node --check is the honest
# floor (syntax only) — promote to a real test setup incrementally.
verify-fast:
	for f in *.js partials/*.js; do node --check "$$f" || exit 1; done

verify-full:
	for f in *.js partials/*.js; do node --check "$$f" || exit 1; done

.PHONY: verify-fast verify-full
