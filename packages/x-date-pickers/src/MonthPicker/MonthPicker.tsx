import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { SxProps } from '@mui/system';
import { styled, useThemeProps, Theme } from '@mui/material/styles';
import { unstable_composeClasses as composeClasses } from '@mui/material';
import { PickersMonth } from './PickersMonth';
import { useUtils, useNow } from '../internals/hooks/useUtils';
import { PickerOnChangeFn } from '../internals/hooks/useViews';
import { MonthPickerClasses, getMonthPickerUtilityClass } from './monthPickerClasses';

export interface ExportedMonthPickerProps<TDate> {
  /**
   * Callback firing on month change @DateIOType.
   * @template TDate
   * @param {TDate} month The new year.
   * @returns {void|Promise} -
   */
  onMonthChange?: (month: TDate) => void | Promise<void>;
  /**
   * Disable specific months dynamically.
   * Works like `shouldDisableDate` but for month selection view @DateIOType.
   * @template TDate
   * @param {TDate} month The month to check.
   * @returns {boolean} If `true` the month will be disabled.
   */
  shouldDisableMonth?: (month: TDate) => boolean;
}

export interface MonthPickerProps<TDate> extends ExportedMonthPickerProps<TDate> {
  /**
   * className applied to the root element.
   */
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<MonthPickerClasses>;

  /** Date value for the MonthPicker */
  date: TDate | null;
  /** If `true` picker is disabled */
  disabled?: boolean;
  /** If `true` past days are disabled. */
  disablePast?: boolean | null;
  /** If `true` future days are disabled. */
  disableFuture?: boolean | null;
  /** Minimal selectable date. */
  minDate: TDate;
  /** Maximal selectable date. */
  maxDate: TDate;
  /** Callback fired on date change. */
  onChange: PickerOnChangeFn<TDate>;

  /** If `true` picker is readonly */
  readOnly?: boolean;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
}

const useUtilityClasses = (ownerState: MonthPickerProps<any>) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getMonthPickerUtilityClass, classes);
};

const MonthPickerRoot = styled('div', {
  name: 'MuiMonthPicker',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})<{ ownerState: MonthPickerProps<any> }>({
  width: 310,
  display: 'flex',
  flexWrap: 'wrap',
  alignContent: 'stretch',
  margin: '0 4px',
});

type MonthPickerComponent = (<TDate>(
  props: MonthPickerProps<TDate> & React.RefAttributes<HTMLDivElement>,
) => JSX.Element) & { propTypes?: any };

export const MonthPicker = React.forwardRef(function MonthPicker<TDate>(
  inProps: MonthPickerProps<TDate>,
  ref: React.Ref<HTMLDivElement>,
) {
  const props = useThemeProps<Theme, MonthPickerProps<TDate>, 'MuiMonthPicker'>({
    props: inProps,
    name: 'MuiMonthPicker',
  });

  const {
    className,
    date,
    disabled,
    disableFuture,
    disablePast,
    maxDate,
    minDate,
    onChange,
    onMonthChange,
    shouldDisableMonth,
    readOnly,
    ...other
  } = props;
  const ownerState = props;
  const classes = useUtilityClasses(ownerState);

  const utils = useUtils<TDate>();
  const now = useNow<TDate>();
  const currentMonth = utils.getMonth(date || now);

  const isMonthDisabled = (month: TDate) => {
    const firstEnabledMonth = utils.startOfMonth(
      disablePast && utils.isAfter(now, minDate) ? now : minDate,
    );

    const lastEnabledMonth = utils.startOfMonth(
      disableFuture && utils.isBefore(now, maxDate) ? now : maxDate,
    );

    if (utils.isBefore(month, firstEnabledMonth)) {
      return true;
    }

    if (utils.isAfter(month, lastEnabledMonth)) {
      return true;
    }

    if (!shouldDisableMonth) {
      return false;
    }

    return shouldDisableMonth(month);
  };

  const onMonthSelect = (month: number) => {
    if (readOnly) {
      return;
    }

    const newDate = utils.setMonth(date || now, month);

    onChange(newDate, 'finish');
    if (onMonthChange) {
      onMonthChange(newDate);
    }
  };

  return (
    <MonthPickerRoot
      ref={ref}
      className={clsx(classes.root, className)}
      ownerState={ownerState}
      {...other}
    >
      {utils.getMonthArray(date || now).map((month) => {
        const monthNumber = utils.getMonth(month);
        const monthText = utils.format(month, 'monthShort');

        return (
          <PickersMonth
            key={monthText}
            value={monthNumber}
            selected={monthNumber === currentMonth}
            onSelect={onMonthSelect}
            disabled={disabled || isMonthDisabled(month)}
          >
            {monthText}
          </PickersMonth>
        );
      })}
    </MonthPickerRoot>
  );
}) as MonthPickerComponent;

MonthPicker.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * className applied to the root element.
   */
  className: PropTypes.string,
  /**
   * Date value for the MonthPicker
   */
  date: PropTypes.any,
  /**
   * If `true` picker is disabled
   */
  disabled: PropTypes.bool,
  /**
   * If `true` future days are disabled.
   */
  disableFuture: PropTypes.bool,
  /**
   * If `true` past days are disabled.
   */
  disablePast: PropTypes.bool,
  /**
   * Maximal selectable date.
   */
  maxDate: PropTypes.any.isRequired,
  /**
   * Minimal selectable date.
   */
  minDate: PropTypes.any.isRequired,
  /**
   * Callback fired on date change.
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Callback firing on month change @DateIOType.
   * @template TDate
   * @param {TDate} month The new year.
   * @returns {void|Promise} -
   */
  onMonthChange: PropTypes.func,
  /**
   * If `true` picker is readonly
   */
  readOnly: PropTypes.bool,
  /**
   * Disable specific months dynamically.
   * Works like `shouldDisableDate` but for month selection view @DateIOType.
   * @template TDate
   * @param {TDate} month The month to check.
   * @returns {boolean} If `true` the month will be disabled.
   */
  shouldDisableMonth: PropTypes.func,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
} as any;
