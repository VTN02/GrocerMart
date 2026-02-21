import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    TextField,
    InputAdornment,
    Box,
    Skeleton,
    IconButton,
    Tooltip,
    TableSortLabel,
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import EmptyState from './EmptyState';
import debounce from 'lodash/debounce';

export default function DataTable({
    columns,
    data = [],
    searchKey,
    actions,
    loading = false,
    emptyTitle = 'No records found',
    emptyDescription = 'There are no items to display at the moment.',
    emptyAction,
    onRowClick,
    stickyHeader = true,
    maxHeight = '70vh',
    // Server-side props
    serverSide = false,
    page: externalPage = 0,
    rowsPerPage: externalRowsPerPage = 10,
    totalCount = 0,
    onPageChange,
    onRowsPerPageChange,
    onSearchChange,
    // Sorting
    orderBy,
    orderDirection = 'asc',
    onSortChange,
}) {
    const [page, setInternalPage] = useState(0);
    const [rowsPerPage, setInternalRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const currentPage = serverSide ? externalPage : page;
    const currentRowsPerPage = serverSide ? externalRowsPerPage : rowsPerPage;

    // Debounced search for server-side
    const debouncedSearch = useCallback(
        debounce((val) => {
            if (onSearchChange) onSearchChange(val);
        }, 500),
        [onSearchChange]
    );

    const handleSearchChange = (event) => {
        const val = event.target.value;
        setSearchTerm(val);
        if (serverSide) {
            debouncedSearch(val);
        } else {
            setInternalPage(0);
        }
    };

    const handleChangePage = (event, newPage) => {
        if (serverSide) {
            onPageChange && onPageChange(newPage);
        } else {
            setInternalPage(newPage);
        }
    };

    const handleChangeRowsPerPage = (event) => {
        const newRows = parseInt(event.target.value, 10);
        if (serverSide) {
            onRowsPerPageChange && onRowsPerPageChange(newRows);
        } else {
            setInternalRowsPerPage(newRows);
            setInternalPage(0);
        }
    };

    const filteredData = (!serverSide && searchKey && searchTerm)
        ? data.filter((row) => {
            const searchStr = searchTerm.toLowerCase();
            const mainFieldMatch = String(row[searchKey] || '').toLowerCase().includes(searchStr);
            const idMatch = String(row.id || '').toLowerCase().includes(searchStr);
            const publicIdMatch = String(row.publicId || '').toLowerCase().includes(searchStr);
            return mainFieldMatch || idMatch || publicIdMatch;
        })
        : data;

    const displayData = serverSide
        ? data
        : filteredData.slice(currentPage * currentRowsPerPage, currentPage * currentRowsPerPage + currentRowsPerPage);

    const count = serverSide ? totalCount : filteredData.length;

    // Loading skeleton
    if (loading) {
        return (
            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
                {searchKey && (
                    <Box p={2}>
                        <Skeleton variant="rectangular" height={45} sx={{ borderRadius: 1 }} />
                    </Box>
                )}

                <TableContainer sx={{ maxHeight, maxWidth: '100%', overflowX: 'auto' }}>
                    <Table stickyHeader={stickyHeader}>
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        <Skeleton width="60%" />
                                    </TableCell>
                                ))}
                                {actions && <TableCell><Skeleton width="40%" /></TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...Array(5)].map((_, index) => (
                                <TableRow key={index}>
                                    {columns.map((column) => (
                                        <TableCell key={column.id}>
                                            <Skeleton width="80%" />
                                        </TableCell>
                                    ))}
                                    {actions && (
                                        <TableCell align="right">
                                            <Skeleton width="40%" sx={{ ml: 'auto' }} />
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        );
    }

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
            {searchKey && (
                <Box p={2} pb={0}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder={`Search...`}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 2 }}
                    />
                </Box>
            )}

            {displayData.length === 0 ? (
                <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                />
            ) : (
                <>
                    <TableContainer sx={{ maxHeight, maxWidth: '100%', overflowX: 'auto' }}>
                        <Table stickyHeader={stickyHeader}>
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            align={column.align || 'left'}
                                            sortDirection={orderBy === column.id ? orderDirection : false}
                                            style={{
                                                minWidth: column.minWidth,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {serverSide && column.sortable !== false ? (
                                                <TableSortLabel
                                                    active={orderBy === column.id}
                                                    direction={orderBy === column.id ? orderDirection : 'asc'}
                                                    onClick={() => onSortChange && onSortChange(column.id)}
                                                >
                                                    {column.label}
                                                </TableSortLabel>
                                            ) : (
                                                column.label
                                            )}
                                        </TableCell>
                                    ))}
                                    {actions && (
                                        <TableCell align="right" style={{ minWidth: 120, fontWeight: 600 }}>
                                            Actions
                                        </TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayData.map((row, rowIndex) => (
                                    <TableRow
                                        hover
                                        key={row.id || row.publicId || rowIndex}
                                        onClick={() => onRowClick && onRowClick(row)}
                                        sx={{
                                            cursor: onRowClick ? 'pointer' : 'default',
                                            transition: 'background-color 0.2s',
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                            },
                                        }}
                                    >
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align || 'left'}>
                                                    {column.render ? column.render(value, row) : value}
                                                </TableCell>
                                            );
                                        })}
                                        {actions && (
                                            <TableCell align="right">
                                                <Box
                                                    display="flex"
                                                    gap={0.5}
                                                    justifyContent="flex-end"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {actions(row)}
                                                </Box>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={count}
                        rowsPerPage={currentRowsPerPage}
                        page={currentPage}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{ borderTop: 1, borderColor: 'divider' }}
                    />
                </>
            )}
        </Paper>
    );
}

