import React, { useEffect, Fragment, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { formatDate, parseDate } from 'react-day-picker/moment';
import classnames from 'classnames';

import Checkbox from 'components/common/FormElements/Checkbox';
import SelectNew from 'components/common/FormComponentsNew/Select';
import Context from 'components/common/Context';

import iconCross from 'assets/icon-cross-red.svg';
import iconArrow from 'assets/expand-grey.svg';
import iconFilter from 'assets/icon-filter-cm.svg';

import './style.scss';

export const FilteringContext = ({
  productionType,
  setFilterListByProdType,
  updateFilterListByProdType,
  getFilterCategoryData,
  filteringEpisodesByParams,
  currentTitle,
  searchActive,
  channelsFilter,
  filterList,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [openContextFIlter, setOpenContextFilter] = useState(false);
  const [filtersData, setFilters] = useState({
    filters: {
      status: [],
      channels: [],
      specificDays: [],
      from: null,
      to: null,
    },
    filtersFields: {},
  });
  useEffect(() => {
    setFilterListByProdType();
  }, [productionType]);

  useEffect(() => {
    if (isMounted) {
      filteringEpisodesByParams({ currentTitle, productionType }, filtersData.filtersFields, filtersData.filters);
      updateFilterListByProdType({ name: 'Channels', value: 'channels', checked: true, items: channelsFilter, oldField: true },)
    } else {
      setIsMounted(true);
    }
  }, [filtersData]);

  const from = useRef(null);
  const to = useRef(null);
  const modifiers = {
    start: filtersData.filters.from,
    end: filtersData.filters.to,
  };
  const FORMAT = 'D MMM YYYY';
  const focusedFrom = from && from !== '';

  const getSection = {
    0: 'PROGRAM',
    4: 'BLOCK',
    5: 'NEWID',
  }[productionType];
  const handleChangeAndFetchOptions = (data) => {
    const getActiveFields = filterList.filter((item) => item.checked);
    if (!data.checked && getActiveFields.length < 4) {
      if (!data.oldField) {
        getFilterCategoryData(data.value, getSection).then((res) => {
          updateFilterListByProdType({
            ...data,
            checked: true,
            items: res.map((i) => ({ name: i, value: i })),
          });
        });
      } else {
        updateFilterListByProdType({ ...data, checked: true });
      }
    } else {
      const isOld = data.oldField;
      updateFilterListByProdType({ ...data, checked: false });
      let currentFilterFields = { ...filtersData.filtersFields };
      delete currentFilterFields[data.value];
      setFilters((st) => ({
        ...st,
        [isOld ? 'filters' : 'filtersFields']: isOld
          ? {
              ...st.filters,
              [data.value]: null,
            }
          : currentFilterFields,
      }));
    }
  };

  const renderFilterItems = () => {
    return filterList.map((itm, idx) => (
      <Checkbox
        onChange={() => handleChangeAndFetchOptions(itm)}
        labelClassName={classnames('', { checked: itm.checked})}
        key={`${itm.value}-${idx}`}
        value={itm.name}
        name={itm.vlaue}
        checked={itm.checked}
      />
    ));
  };

  const openCalendarFrom = () => {
    from.current.handleInputClick();
  };

  const openCalendarTo = () => {
    to.current.handleInputClick();
  };

  const selectFilterValues = (value, data, isOld) => {
    const getKey = isOld ? 'filters' : 'filtersFields';
    setFilters((st) => ({
      ...st,
      [getKey]: {
        ...st[getKey],
        [data]: value,
      },
    }))

  };

  const openFilter = () => {
    setOpenContextFilter(true);
  };

  const closeFilter = () => {
    setOpenContextFilter(false);
  };

  const renderField = (ordinalNumber) => {
    const getActiveFields = filterList.filter((item) => item.checked);
    if (!getActiveFields[ordinalNumber]) {
      return <div></div>;
    }
    const fieldValue = (
      getActiveFields[ordinalNumber].oldField
        ? filtersData.filters
        : filtersData.filtersFields
    )[getActiveFields[ordinalNumber].value];
    if (getActiveFields[ordinalNumber].type === 'date') {
      return (
        <div className="content-manager__date-filter-wrapper-from">
          <div className="date-filter">
            <div
              className={classnames('date-filter__label', {
                'date-filter__label-focused': focusedFrom,
              })}
            >
              {filtersData.filters[getActiveFields[ordinalNumber].value] ===
                '' ||
              filtersData.filters[getActiveFields[ordinalNumber].value] === null
                ? ''
                : getActiveFields[ordinalNumber].name}
            </div>
            <DayPickerInput
              ref={from}
              value={filtersData.filters[getActiveFields[ordinalNumber].value]}
              placeholder={[getActiveFields[ordinalNumber].name]}
              format={FORMAT}
              formatDate={formatDate}
              parseDate={parseDate}
              dayPickerProps={{
                modifiers,
                numberOfMonths: 1,
                firstDayOfWeek: 1,
              }}
              inputProps={{
                readOnly: true,
              }}
              onDayChange={(item) =>
                selectFilterValues(
                  item,
                  getActiveFields[ordinalNumber].value,
                  getActiveFields[ordinalNumber].oldField
                )
              }
            />
            <button
              className={classnames('date-filter', {
                'date-filter__clear-date':
                  filtersData.filters[getActiveFields[ordinalNumber].value],
                'date-filter__arrow-icon':
                  !filtersData.filters[getActiveFields[ordinalNumber].value],
              })}
              onClick={() =>
                filtersData.filters[getActiveFields[ordinalNumber].value]
                  ? selectFilterValues(
                      null,
                      getActiveFields[ordinalNumber].value,
                      getActiveFields[ordinalNumber].oldField
                    )
                  : openCalendarFrom()
              }
            >
              <img
                src={
                  filtersData.filters[getActiveFields[ordinalNumber].value]
                    ? iconCross
                    : iconArrow
                }
                alt="Cross"
              />
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="content-manager__filter">
          <SelectNew
            multiselect
            search={true}
            placeholder={getActiveFields[ordinalNumber].name}
            items={getActiveFields[ordinalNumber]?.items || []}
            value={fieldValue || []}
            onSelect={(item) =>
              selectFilterValues(
                item,
                getActiveFields[ordinalNumber].value,
                getActiveFields[ordinalNumber].oldField
              )
            }
            isSelectAllOption
          />
        </div>
      );
    }
  };

  return (
    <div className="content-manager__selectors">
      {!searchActive && (
        <Fragment>
          {renderField(0)}
          {renderField(1)}
          {renderField(2)}
          {renderField(3)}

          <button className="filter-cm" onClick={() => openFilter()}>
            <img width="24px" src={iconFilter} alt="filter" />
            {openContextFIlter && (
              <Context handleClick={() => closeFilter()}>
                {renderFilterItems()}
              </Context>
            )}
          </button>
        </Fragment>
      )}
    </div>
  );
};

FilteringContext.propTypes = {
  productionType: PropTypes.number.isRequired,
  filterContextVisible: PropTypes.bool.isRequired,
  getFilterCategoryData: PropTypes.func.isRequired,
  filteringEpisodesByParams: PropTypes.func.isRequired,
  currentTitle: PropTypes.objectOf().isRequired,
  searchActive: PropTypes.bool.isRequired,
  channelsFilter: PropTypes.arrayOf().isRequired,
  setFilterListByProdType: PropTypes.func.isRequired,
  updateFilterListByProdType: PropTypes.func.isRequired,
};

export default FilteringContext;
