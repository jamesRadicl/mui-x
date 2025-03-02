import * as React from 'react';
import { useThemeProps } from '@mui/material/styles';
import {
  DATA_GRID_DEFAULT_SLOTS_COMPONENTS,
  GRID_DEFAULT_LOCALE_TEXT,
  GridSlotsComponent,
  DATA_GRID_PROPS_DEFAULT_VALUES,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { buildWarning } from '@mui/x-data-grid/internals';
import {
  DataGridProProps,
  DataGridProProcessedProps,
  DataGridProPropsWithDefaultValue,
} from '../models/dataGridProProps';

/**
 * The default values of `DataGridProPropsWithDefaultValue` to inject in the props of DataGridPro.
 */
export const DATA_GRID_PRO_PROPS_DEFAULT_VALUES: DataGridProPropsWithDefaultValue = {
  ...DATA_GRID_PROPS_DEFAULT_VALUES,
  scrollEndThreshold: 80,
  treeData: false,
  defaultGroupingExpansionDepth: 0,
  disableColumnPinning: false,
  disableChildrenFiltering: false,
  disableChildrenSorting: false,
  rowReordering: false,
  getDetailPanelHeight: () => 500,
  disableRowGrouping: false,
  rowGroupingColumnMode: 'single',
};

const rowGroupingWarning = buildWarning(
  [
    'MUI: The row grouping has been moved to the new `@mui/x-data-grid-premium` package.',
    'The feature is deprecated in `@mui/x-data-grid-pro`, and it will soon be removed from this package.',
  ],
  'error',
);

export const useDataGridProProps = <R extends GridValidRowModel>(inProps: DataGridProProps<R>) => {
  const themedProps = useThemeProps({ props: inProps, name: 'MuiDataGrid' });

  const localeText = React.useMemo(
    () => ({ ...GRID_DEFAULT_LOCALE_TEXT, ...themedProps.localeText }),
    [themedProps.localeText],
  );

  const components = React.useMemo<GridSlotsComponent>(() => {
    const overrides = themedProps.components;

    if (!overrides) {
      return { ...DATA_GRID_DEFAULT_SLOTS_COMPONENTS };
    }

    const mergedComponents = {} as GridSlotsComponent;

    type GridSlots = keyof GridSlotsComponent;
    Object.entries(DATA_GRID_DEFAULT_SLOTS_COMPONENTS).forEach(([key, defaultComponent]) => {
      mergedComponents[key as GridSlots] =
        overrides[key as GridSlots] === undefined ? defaultComponent : overrides[key as GridSlots];
    });

    return mergedComponents;
  }, [themedProps.components]);

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      if (themedProps.experimentalFeatures?.rowGrouping) {
        rowGroupingWarning();
      }
    }, [themedProps.experimentalFeatures]);
  }

  return React.useMemo<DataGridProProcessedProps<R>>(
    () => ({
      ...DATA_GRID_PRO_PROPS_DEFAULT_VALUES,
      ...themedProps,
      disableRowGrouping:
        themedProps.disableRowGrouping || !themedProps.experimentalFeatures?.rowGrouping,
      localeText,
      components,
      signature: 'DataGridPro',
    }),
    [themedProps, localeText, components],
  );
};
