# Cache System Documentation

TsTemplater includes an intelligent cache system **enabled by default** that significantly improves performance, especially when processing complex templates with recursive object access.

## Initial Configuration

```typescript
// Cache enabled by default
const templater = new TsTemplater();

// Cache explicitly enabled  
const templaterWithCache = new TsTemplater('en', true);

// Cache disabled from the start
const templaterWithoutCache = new TsTemplater('en', false);
```

## How It Works

The cache uses a progressive key system that represents the navigation path through objects. When accessing a path like `office.rooms[last].table.computers[first].name`, the system creates cache keys for each level:

- `office` → main property
- `office.rooms` → rooms array
- `office.rooms[last]` → last element of the rooms array  
- `office.rooms[last].table` → table object
- `office.rooms[last].table.computers` → computers array
- `office.rooms[last].table.computers[first]` → first computer
- `office.rooms[last].table.computers[first].name` → computer name

## Benefits

1. **Intelligent Reuse**: If you subsequently access `office.rooms[last].table.computers[last].name`, the system reuses all the cached path up to `computers` and only calculates the final access.

2. **Distinct Object Management**: The system uses a unique identity for each object to avoid conflicts when processing different elements of an array.

3. **Performance**: Drastically reduces the number of recursive traversals needed.

## Cache API

```typescript
const templater = new TsTemplater();

// Check if cache is active
templater.isCacheEnabled(); // true

// Get the number of entries in the cache
templater.getCacheSize(); // 0

// Get cache keys (useful for debugging)
templater.getCacheKeys(); // []

// Clear the cache
templater.cleanCache();

// Disable cache (improves memory but reduces performance)
templater.disableCache();

// Re-enable cache
templater.enableCache();
```

## Usage Examples

### Basic Example
```typescript
const data = {
    office: {
        rooms: [
            { number: 1, table: { computers: [{ name: 'PC1' }, { name: 'PC2' }] } },
            { number: 2, table: { computers: [{ name: 'PC3' }, { name: 'PC4' }] } }
        ]
    }
};

const templater = new TsTemplater();

// First call - populates the cache
const result1 = templater.evaluate('office.rooms[last].table.computers[first].name', data);
console.log(result1); // 'PC3'

// Second call - reuses the cache
const result2 = templater.evaluate('office.rooms[last].table.computers[last].name', data);
console.log(result2); // 'PC4' (reuses the path up to 'computers')
```

### With Templates
```typescript
const template = 'The computer is named: {office.rooms[last].table.computers[first].name}';

// First processing - populates the cache
const result1 = templater.parse(template, data);

// Subsequent processing benefits from the cache
const result2 = templater.parse(template, data);
```

### Cache Management in Memory-Limited Environments
```typescript
// Disable cache to save memory
templater.disableCache();

// Now all operations work without cache
const result = templater.parse(template, data);

// Re-enable when performance is more important
templater.enableCache();
```

## Technical Notes

- Cache is automatically initialized in the constructor
- Cache keys include an object identifier to avoid conflicts
- Cache properly handles `null`, `undefined`, and circular objects
- Disabling cache doesn't cause loss of functionality, only performance reduction

## Performance Benefits

With complex datasets and templates with multiple accesses to the same base path, the cache can reduce processing times by 60-80%, especially in scenarios with:

- Arrays with many elements
- Deeply nested objects
- Templates that reuse the same base path with different indices
- Batch processing of many similar templates
