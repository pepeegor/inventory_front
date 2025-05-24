/**
 * Flattens a nested location tree into a single-level array
 * for use in select dropdowns
 * @param {Array} locations - The nested location tree
 * @param {Array} result - The result array (for recursion)
 * @param {Number} depth - The current depth level
 * @returns {Array} Flattened array of all locations
 */
export const flattenLocationTree = (locations, result = [], depth = 0) => {
  if (!locations || !Array.isArray(locations)) return result;
  
  for (const location of locations) {
    // Add indentation based on depth for visual hierarchy
    const prefix = depth > 0 ? '└ '.repeat(depth) : '';
    
    result.push({
      ...location,
      displayName: `${prefix}${location.name}` // Add display name with indentation
    });
    
    // Recursively process children
    if (location.children && location.children.length > 0) {
      flattenLocationTree(location.children, result, depth + 1);
    }
  }
  
  return result;
};


export const getTotalLocationsCount = (locations) => {
  if (!locations || !Array.isArray(locations)) return 0;
  
  let count = locations.length;
  
  for (const location of locations) {
    if (location.children && Array.isArray(location.children)) {
      count += getTotalLocationsCount(location.children);
    }
  }
  
  return count;
}; 