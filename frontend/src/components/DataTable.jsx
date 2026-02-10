import React, { useState } from 'react';
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
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import EmptyState from './EmptyState';

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
    maxHeight = '70vh',  // Dynamic default height
}) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = searchKey && searchTerm
        ? data.filter((row) => {
            const searchStr = searchTerm.toLowerCase();
            const mainFieldMatch = String(row[searchKey] || '').toLowerCase().includes(searchStr);
            const idMatch = String(row.id || '').toLowerCase().includes(searchStr);
            return mainFieldMatch || idMatch;
        })
        : data;

    const paginatedData = filteredData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Loading skeleton
    if (loading) {
        return (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                {searchKey && (
                    <Box p={2}>
                        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
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
                                        <Skeleton />
                                    </TableCell>
                                ))}
                                {actions && <TableCell><Skeleton /></TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...Array(5)].map((_, index) => (
                                <TableRow key={index}>
                                    {columns.map((column) => (
                                        <TableCell key={column.id}>
                                            <Skeleton />
                                        </TableCell>
                                    ))}
                                    {actions && (
                                        <TableCell>
                                            <Skeleton />
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
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            {searchKey && (
                <Box p={2} pb={0}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder={`Search by ${searchKey}...`}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(0);
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 2 }}
                    />
                </Box>
            )}

            {filteredData.length === 0 ? (
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
                                            style={{
                                                minWidth: column.minWidth,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {column.label}
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
                                {paginatedData.map((row, rowIndex) => (
                                    <TableRow
                                        hover
                                        key={row.id || rowIndex}
                                        onClick={() => onRowClick && onRowClick(row)}
                                        sx={{
                                            cursor: onRowClick ? 'pointer' : 'default',
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
                        count={filteredData.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </>
            )}
        </Paper>
    );
}
