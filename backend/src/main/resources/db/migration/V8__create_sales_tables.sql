-- Create sales_records table
CREATE TABLE sales_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sales_date DATE NOT NULL,
    store_id BIGINT,
    total_revenue DECIMAL(19, 2) NOT NULL DEFAULT 0.00,
    total_items_sold INT NOT NULL DEFAULT 0,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create sales_items table
CREATE TABLE sales_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sales_record_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    qty_sold INT NOT NULL,
    unit_price DECIMAL(19, 2) NOT NULL,
    line_total DECIMAL(19, 2) NOT NULL,
    FOREIGN KEY (sales_record_id) REFERENCES sales_records(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Index for faster date-range queries (analytics)
CREATE INDEX idx_sales_date ON sales_records(sales_date);
