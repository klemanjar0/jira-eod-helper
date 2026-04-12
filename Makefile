.PHONY: dev prod build lint format install clean db-push gen-types

# Development
dev:
	npm run dev

# Production
prod: build
	npm run start

build:
	npm run build

# Utilities
lint:
	npm run lint

format:
	npm run format

install:
	npm install

db-push:
	bash scripts/db-push.sh

gen-types:
	bash scripts/gen-types.sh

clean:
	rm -rf .next node_modules
