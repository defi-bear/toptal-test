import React from 'react';
import { useFlexLayout, useResizeColumns, useTable } from 'react-table';
import { Box, Flex, Text, useColorMode } from '@chakra-ui/react';

const getStyles = (props, align = 'left') => [
  props,
  {
    style: {
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      alignItems: 'flex-start',
      display: 'flex',
    },
  },
];

const headerProps = (props, { column }) => getStyles(props, column.align);

const cellProps = (props, { cell }) => getStyles(props, cell.column.align);

const resizerProps = {
  position: 'absolute',
  top: 0,
  right: 0,
  width: '10px',
  height: '100%',
  zIndex: 1,
  style: { touchAction: 'none' },
};

const Table = (
  {
    columns,
    data,
    emptyMessage = 'No records',
    onRowClick,
    selectedIndex,
    children,
    ...rest
  } /*: {
  columns: Array,
  data: Object,
  emptyMessage?: String,
  onRowClick?: Function,
  children?: any
} */
) => {
  const { colorMode } = useColorMode();
  const defaultColumn = React.useMemo(
    () => ({
      // When using the useFlexLayout:
      minWidth: 30, // minWidth is only used as a limit for resizing
      width: 150, // width is used for both the flex-basis and flex-grow
      maxWidth: 200, // maxWidth is only used as a limit for resizing
    }),
    []
  );

  const { getTableProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      defaultColumn,
    },
    useResizeColumns,
    useFlexLayout,
    hooks => {
      hooks.allColumns.push(clmns => clmns);
    }
  );

  return (
    <Box {...getTableProps()} flex={1} fontSize="sm" mt={1} {...rest}>
      <Box overflowY="auto" overflowX="hidden">
        {headerGroups.map(headerGroup => (
          <Flex
            flex={1}
            key={headerGroup}
            {...headerGroup.getHeaderGroupProps({})}
            borderBottom="1px solid"
            borderColor="gray.300"
          >
            {headerGroup.headers.map((column, j, cols) => (
              <Text
                as="div"
                key={column}
                {...column.getHeaderProps(headerProps)}
                textAlign="left"
                minHeight="24px"
                fontSize="md"
                fontWeight="600"
              >
                {column.render('Header')}
                {column.canResize && j < cols.length - 1 && (
                  <Box {...resizerProps} {...column.getResizerProps()} />
                )}
              </Text>
            ))}
          </Flex>
        ))}
      </Box>
      <Box overflowX="hidden">
        {rows.length ? (
          rows.map((row, i) => {
            prepareRow(row);
            return (
              <Box
                display="flex"
                flex={1}
                key={row.id}
                data-rowindex={row.index}
                {...row.getRowProps()}
                onClick={() => onRowClick(i)}
                cursor={onRowClick ? 'pointer' : undefined}
                _hover={{ bg: colorMode === 'dark' ? 'gray.700' : 'gray.100' }}
                minHeight="24px"
                lineHeight="24px"
                backgroundColor={selectedIndex === i ? 'gray.200' : 'white'}
              >
                {row.cells.map((cell, j) => (
                  <Text
                    as="div"
                    key={`${row.id}_${cell.index}`}
                    wordBreak="break-all"
                    fontSize="md"
                    {...cell.getCellProps(cellProps)}
                  >
                    {(() => {
                      if (columns[j].accessor === 'color') {
                        return (
                          <Box
                            backgroundColor={cell.value}
                            width="15px"
                            height="15px"
                            mt={1}
                          />
                        );
                      }
                      if (columns[j].accessor === 'type') {
                        return cell.value === '0' ? 'User' : 'Manager';
                      }
                      if (
                        columns[j].accessor === 'startDate' ||
                        columns[j].accessor === 'endDate'
                      ) {
                        return new Date(
                          cell.value.seconds * 1000
                        ).toLocaleDateString();
                      }
                      return cell.value;
                    })()}
                  </Text>
                ))}
              </Box>
            );
          })
        ) : (
          <Text as="div" p="4px 24px" fontSize="md">
            {emptyMessage}
          </Text>
        )}
      </Box>
      {children}
    </Box>
  );
};

export default Table;
