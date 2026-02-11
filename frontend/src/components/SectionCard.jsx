import React from 'react';
import { Card, CardContent, CardHeader, Divider, Box } from '@mui/material';

export default function SectionCard({ title, subtitle, actions, children, sx, contentSx, ...props }) {
    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                ...sx
            }}
            {...props}
        >
            {(title || actions) && (
                <>
                    <CardHeader
                        title={title}
                        subheader={subtitle}
                        action={actions}
                        titleTypographyProps={{
                            variant: 'h6',
                            fontWeight: 600,
                        }}
                        subheaderTypographyProps={{
                            variant: 'body2',
                        }}
                        sx={{ pb: 1 }}
                    />
                    <Divider />
                </>
            )}
            <CardContent sx={{ flexGrow: 1, p: 3, ...contentSx }}>
                {children}
            </CardContent>
        </Card>
    );
}
