# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.2] - 2025-07-18

### Added ⭐
- **🔧 Custom Functions System**: New `setFunctions()` method allows injecting custom business logic
  - Support for all function syntaxes: `@`, `!@`, `#@`, `##@`
  - Ability to override built-in functions with custom implementations
  - Context-aware functions with access to data objects
  - Array processing functions for complex data manipulation
- **⚡ Intelligent Cache System**: Progressive caching for object navigation performance
  - Object identity-based caching to prevent cross-contamination
  - Configurable cache with constructor parameter `enableCache` (default: true)
  - Complete cache management API: `cleanCache()`, `isCacheEnabled()`, `getCacheSize()`, `getCacheKeys()`, `disableCache()`, `enableCache()`
  - Automatic fallback for disabled cache scenarios
- **📚 Comprehensive Documentation**: 
  - `CUSTOM_FUNCTIONS.md` - Complete guide for custom function development
  - `CACHE.md` - Detailed cache system documentation
  - Practical examples with real-world business scenarios

### Enhanced 🔄
- **Error Handling**: Robust error management for missing or malformed custom functions
  - Missing functions return original placeholder with warning
  - Graceful handling of runtime errors in custom functions
  - Improved debugging with informative console warnings
- **Performance**: Optimized object navigation with intelligent progressive caching
  - Significant performance improvements for complex nested object access
  - Memory-efficient cache implementation with object identity tracking
- **API Expansion**: Extended functionality while maintaining full backward compatibility
  - Constructor now accepts `enableCache` parameter: `new TsTemplater(lang, enableCache)`
  - New `evaluate()` method preserves original data types (vs `parse()` string output)

### Examples 🎯
- **Business Functions**: Pre-built examples for common business scenarios
  - Customer discount calculations
  - Phone number formatting (Italian style)
  - Time-based greetings
  - Star rating displays
  - Order status with emoji indicators
- **Real-world Templates**: Email templates, dashboard views, and dynamic reports
- **Performance Demos**: Cache system examples showing navigation optimization

### Technical Improvements 🔧
- ✅ Expanded test suite from 115 to **135 tests** (100% pass rate)
- ✅ New test categories: `setFunctions.test.ts`, `cache.test.ts`
- ✅ Comprehensive error handling and edge case testing
- ✅ Performance and memory usage validation
- ✅ Multi-instance isolation testing
- ✅ Cache system stress testing with large datasets

### Fixed 🐛
- **Template Parsing**: Improved function call recognition and parameter processing
- **Type Conversion**: Enhanced string conversion in `parse()` method for consistent output
- **Cache Conflicts**: Resolved array processing conflicts with object identity system
- **Function Registration**: Better handling of function parameter validation

## [0.2.1] - 2025-07-18

### Security 🔒
- **CRITICAL**: Fixed 11 security vulnerabilities (1 high, 10 moderate)
- Updated build tools to secure versions: Vite 4.5.14 → 6.3.5
- Resolved DOM Clobbering, XSS, and ReDoS vulnerabilities in development dependencies
- All security audits now pass with 0 vulnerabilities

### Changed 🔄
- **Dependencies**: Updated runtime dependencies to latest secure versions:
  - bignumber.js: 9.1.2 → 9.3.1
  - dayjs: 1.11.10 → 1.11.13
  - tslib: 2.6.2 → 2.8.1
- **Build System**: Upgraded Vite to v6.3.5 for enhanced security and performance
- **Security**: Applied security patches across all development dependencies

### Technical Improvements 🔧
- ✅ Maintained 115/115 test coverage (100% pass rate)
- ✅ Build system compatibility verified with new Vite version
- ✅ No breaking changes to library functionality
- ✅ All vulnerability scanners report clean status

## [0.2.0] - 2025-07-18

### Added ⭐
- **NEW**: `Split` function for JSON string array parsing (`{#@Split|jsonString|delimiter}`)
- Enhanced README with modern visual design including:
  - Animated typing SVG header
  - Gradient backgrounds and colored badges
  - Interactive collapsible sections (Property Access, Array Search, Advanced Examples)
  - Professional two-column layout for Functions Showcase
  - Visual emoji indicators and improved typography
  - Comprehensive examples with real-world use cases (Email templates, Dynamic reports)

### Changed 🔄
- **Documentation**: Complete README modernization with visual enhancements
- **Examples**: Updated all code examples with emoji-enhanced data for better visual appeal
- **Structure**: Improved README organization with better sectioning and navigation
- **Styling**: Enhanced badge styling with `for-the-badge` format and custom colors
- **Content**: Added comprehensive advanced examples showing real-world usage patterns

### Fixed 🐛
- **README**: Resolved formatting issues and broken HTML structure
- **Code Display**: Fixed centered code alignment for better readability
- **Visual**: Corrected corrupted emoji characters in documentation
- **Structure**: Fixed duplicated sections and malformed markup

### Technical Improvements 🔧
- Enhanced testing coverage to 115/115 tests (100% pass rate)
- Improved Split function implementation with robust JSON parsing
- Better error handling for malformed JSON strings in Split function
- Comprehensive test cases for Split function with various delimiters

## [Previous Releases]

### Added
- New `evaluate()` method for type-preserving expression evaluation
- Enhanced function system with comprehensive data type support  
- JSON parsing and stringifying capabilities via `intJson` function
- Modern `intCurrency` function using Intl.NumberFormat API with multi-currency support
- BigNumber.js integration for precise mathematical operations in ArraySum
- Comprehensive test coverage reaching 107/107 tests (100% pass rate)
- Extensive edge case testing for error handling and robustness
- Advanced features testing including complex nested templating
- Configuration and state management testing for multi-instance scenarios

### Changed
- Updated Jest configuration to use modern transform syntax instead of deprecated globals
- Improved TypeScript configurations for better build compatibility
- Translated Italian comments to English for better international collaboration
- Enhanced array function parameter handling (#@ functions now preserve raw templates)
- Optimized parsing logic to differentiate between simple (@) and array (#@) functions

### Fixed
- **Critical**: Fixed syntax error in `fromContext` method array handling (missing closing brace)
- **Critical**: Corrected assignment vs comparison operator in boolean conditions
- **Critical**: Resolved ArrayConcat and ArraySum functions not working with template parameters
- **Critical**: Fixed Json Stringify function to work with actual objects instead of string representations
- Fixed number format functions to properly resolve template parameters
- Fixed Currency function to handle complex template expressions like `{prices[supplier,kind].price}`
- Fixed floating-point precision issues in mathematical operations using BigNumber
- Resolved TypeScript compilation warnings and build errors
- Fixed parameter resolution for all @ function variants (@, #@, ##@)

### Technical Improvements
- Implemented intelligent parameter parsing: simple functions (@) get resolved parameters, array functions (#@) get raw templates
- Enhanced error handling and debugging capabilities with graceful fallbacks
- Improved function registration and initialization process
- Better separation between string templating (parse) and type preservation (evaluate) methods
- Comprehensive test suite with 107 tests covering all functionality and edge cases
- Added tests for invalid inputs, malformed syntax, error recovery, and robustness
- Performance testing with large datasets to ensure scalability
- Multi-instance testing to verify thread safety and isolation

## [0.1.0] - 2025-07-18

### Added
- Initial release of ts-templater
- Core templating engine with recursive parsing
- Support for nested field access and array manipulation  
- Date formatting with dayjs integration
- Mathematical operations and boolean logic
- String manipulation functions (PadStart, PadEnd, Contains)
- Array operations (ArrayConcat, ArraySum)
- JSON operations (Json Parse, Json Stringify)
- Currency formatting with international locale support
- Dynamic locale support for international date formatting
- Comprehensive test suite with 107 passing tests (100% coverage)
- TypeScript support with full type declarations
- Vite-based build system for ES modules and UMD bundles
- Jest testing framework with ts-jest integration

### Features
- Template syntax: `{field}`, `{nested.field}`, `{array[index]}`, `{array[key,field]}`
- Function calls: `{@Function|param1|param2}`, `{#@Function|param1}`, `{##@Function|param1}`
- Conditional logic: `{@If|condition|trueValue|falseValue}`
- Mathematical operations: `{@Math|+|num1|num2}`, `{@Sum|num1|num2}`
- Date formatting: `{@Date|date|format}` with dayjs integration
- Currency formatting: `{@Currency|amount|currency|locale}` with Intl.NumberFormat
- Number conversion: `{@Number|value}` with BigNumber precision
- Boolean operations: `{@Bool|value}`, `{@Not|value}`
- Null checking: `{@IsNull|value|alternative}`, `{@IsNull|value|ifNotNull|ifNull}`
- String utilities: `{@Contains|text|search|ifFound|ifNotFound}`, `{@PadStart|text|length|fill}`, `{@PadEnd|text|length|fill}`
- Switch statements: `{@Switch|value|case1:result1|case2:result2|default:defaultResult}`
- Case-insensitive switch: `{@SwitchInsensitive|value|case1:result1}`
- Array processing: `{#@ArraySum|arrayField|{template}}`, `{#@ArrayConcat|arrayField|{template}}`
- JSON operations: `{#@Json|parse|jsonString}`, `{#@Json|stringify|{object}}`
- Type-preserving evaluation: `evaluate(expression, data)` method for non-string results
