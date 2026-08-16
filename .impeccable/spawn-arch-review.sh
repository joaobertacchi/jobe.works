#!/bin/zsh
set -e
cd /Users/joaobertacchi/Documents/repos/jobe.works
PROMPT="You are the architecture-review subagent. Your full instructions are in .codex/agents/architecture-review.toml (developer_instructions). Required inputs are in .impeccable/arch-review-input.md. Review the JOBE site change and return ONLY the YAML contract (status + findings) from your instructions."
codex exec -C /Users/joaobertacchi/Documents/repos/jobe.works -s read-only -m gpt-5.6-sol -c model_reasoning_effort=medium -o /tmp/arch-review-output.txt "$PROMPT" > /tmp/arch-review-run.log 2>&1
echo EXIT=$?

