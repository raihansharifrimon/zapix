# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and [Semantic Versioning](https://semver.org/).

## [Unreleased]
- Planned features and improvements


## [0.1.9] - 2025-12-18
### Added
- Global middleware support
- Updated documentation with usage examples of global middleware.

### Changed
- n/a

## [0.1.8] - 2025-11-29
### Added
- Improved `Response()` utility:
  - Automatically detects success vs error based on the parameters.
  - Supports strings, JS `Error` instances, arrays of validation errors, and generic objects.
- Updated documentation with usage examples.

### Changed
- Improved type safety and developer experience for `Response()`.

## [0.1.7] - 2025-08-23
### Added
- Global error handler: `router.useError` for centralized error handling, similar to Express.js.
- Express.js-like middleware chaining: Middleware functions (e.g., validation, authentication) can be chained before controllers.
- Utilities:
  - `safeJsonParse` utility for safe JSON parsing.
  - `Response` utility for consistent HTTP responses.

### Changed
- Improved documentation with detailed usage examples for middleware, error handling, and utilities.
- Enhanced type safety and developer experience.

### Fixed
- Minor internal improvements and bug fixes.


## [0.1.6] - 2025-08-22
### Added
- Initial public release of Zapix, a lightweight router library for AWS Lambda (similar to Express).
- Built-in TypeScript support with full type safety and IntelliSense.
- Features:
  - Minimal router with `get`, `post`, `put`, `patch`, `delete`, `options`, `all` methods.
  - Middleware + handler chaining support.
  - Strongly typed `RequestHandler`, `RouteHandler`, and `RouteMiddleware`.
  - Distributed with bundled `.d.ts` files for npm type support.
  - Works seamlessly with aws-lambda event/response objects.

### Notes
- Version: 0.1.0 (initial release)
- Expect breaking changes until v1.0.0
- Feedback and contributions are welcome 🙌


**Thanks for using Zapix!**

[Unreleased]: https://github.com/username/repo/compare/v0.1.7...HEAD
[0.1.7]: https://github.com/raihansharifrimon/zapix/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/raihansharifrimon/zapix/releases/tag/v0.1.6
