import {
  GridRowId,
  GridRowTreeConfig,
  GridRowTreeNodeConfig,
  GridFilterState,
} from '@mui/x-data-grid';
import { GridAggregatedFilterItemApplier } from '@mui/x-data-grid/internals';

interface FilterRowTreeFromTreeDataParams {
  rowTree: GridRowTreeConfig;
  disableChildrenFiltering: boolean;
  isRowMatchingFilters: GridAggregatedFilterItemApplier | null;
}

export const TREE_DATA_STRATEGY = 'tree-data';

/**
 * A node is visible if one of the following criteria is met:
 * - One of its children is passing the filter
 * - It is passing the filter
 */
export const filterRowTreeFromTreeData = (
  params: FilterRowTreeFromTreeDataParams,
): Omit<GridFilterState, 'filterModel'> => {
  const { rowTree, disableChildrenFiltering, isRowMatchingFilters } = params;
  const visibleRowsLookup: Record<GridRowId, boolean> = {};
  const filteredRowsLookup: Record<GridRowId, boolean> = {};
  const filteredDescendantCountLookup: Record<GridRowId, number> = {};

  const filterTreeNode = (
    node: GridRowTreeNodeConfig,
    isParentMatchingFilters: boolean,
    areAncestorsExpanded: boolean,
  ): number => {
    const shouldSkipFilters = disableChildrenFiltering && node.depth > 0;

    let isMatchingFilters: boolean | null;
    if (shouldSkipFilters) {
      isMatchingFilters = null;
    } else if (!isRowMatchingFilters) {
      isMatchingFilters = true;
    } else {
      isMatchingFilters = isRowMatchingFilters(node.id);
    }

    let filteredDescendantCount = 0;
    node.children?.forEach((childId) => {
      const childNode = rowTree[childId];
      const childSubTreeSize = filterTreeNode(
        childNode,
        isMatchingFilters ?? isParentMatchingFilters,
        areAncestorsExpanded && !!node.childrenExpanded,
      );

      filteredDescendantCount += childSubTreeSize;
    });

    let shouldPassFilters: boolean;
    switch (isMatchingFilters) {
      case true: {
        shouldPassFilters = true;
        break;
      }
      case false: {
        shouldPassFilters = filteredDescendantCount > 0;
        break;
      }
      default: {
        shouldPassFilters = isParentMatchingFilters;
        break;
      }
    }

    visibleRowsLookup[node.id] = shouldPassFilters && areAncestorsExpanded;
    filteredRowsLookup[node.id] = shouldPassFilters;

    if (!shouldPassFilters) {
      return 0;
    }

    filteredDescendantCountLookup[node.id] = filteredDescendantCount;
    return filteredDescendantCount + 1;
  };

  const nodes = Object.values(rowTree);
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    if (node.depth === 0) {
      filterTreeNode(node, true, true);
    }
  }

  return {
    visibleRowsLookup,
    filteredRowsLookup,
    filteredDescendantCountLookup,
  };
};
