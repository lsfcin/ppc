# Verification contract — see code/VERIFY.md G5.
# No build tooling. verify-fast is syntax only; verify-full adds the node:test
# suite over the real scripts loaded in a vm (tests/harness.js).
verify-fast:
	for f in *.js partials/*.js; do node --check "$$f" || exit 1; done

verify-full:
	for f in *.js partials/*.js; do node --check "$$f" || exit 1; done
	node --test tests/*.test.js

.PHONY: verify-fast verify-full
