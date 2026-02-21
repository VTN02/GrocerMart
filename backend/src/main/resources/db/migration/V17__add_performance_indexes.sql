-- USERS
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- PRODUCTS
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);

-- SALES RECORDS
-- public_id and sales_date are already handled or requested.
-- idx_sales_date already exists from V8.
-- Adding store_id index if analytics often group by it.
CREATE INDEX idx_sales_store ON sales_records(store_id);

-- CREDIT CUSTOMERS
CREATE INDEX idx_customers_status ON credit_customers(status);

-- CHEQUES
CREATE INDEX idx_cheques_status ON cheques(status);
CREATE INDEX idx_cheques_due_date ON cheques(due_date);

-- ORDERS
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_invoice ON orders(invoice_no);

-- SUPPLIERS
CREATE INDEX idx_suppliers_status ON suppliers(status);

-- PURCHASE ORDERS
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_date ON purchase_orders(po_date);
