import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function AnimatedContainer({
    children,
    delay = 0,
    direction = 'up',
    ...props
}) {
    const directions = {
        up: { y: 20 },
        down: { y: -20 },
        left: { x: 20 },
        right: { x: -20 },
    };

    return (
        <MotionBox
            initial={{ opacity: 0, ...directions[direction] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{
                duration: 0.5,
                delay,
                ease: [0.4, 0, 0.2, 1],
            }}
            {...props}
        >
            {children}
        </MotionBox>
    );
}
