CREATE TABLE food (
    id SERIAL PRIMARY KEY,
    lote_id INTEGER NOT NULL,
    cantidadhembra INTEGER NOT NULL,
    cantidadmacho INTEGER NOT NULL,
    fecha DATE NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lote_id) REFERENCES lote(id)
);

CREATE TABLE mortality (
    id SERIAL PRIMARY KEY,
    lote_id INTEGER NOT NULL,
    cantidadhembra INTEGER NOT NULL,
    cantidadmacho INTEGER NOT NULL,
    fecha DATE NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lote_id) REFERENCES lote(id)
);

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    documento VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    documento VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE supplies (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    lote_id INTEGER NOT NULL,
    proveedor_id INTEGER NOT NULL,
    descripcioncompra VARCHAR(255) NOT NULL,
    preciocompra DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES suppliers(id),
    FOREIGN KEY (lote_id) REFERENCES lote(id)
);

CREATE TABLE lote (
    id SERIAL PRIMARY KEY,
    fecha_llegada DATE NOT NULL,
    proveedor_id INTEGER NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    cantidad_aves INTEGER NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES suppliers(id)
);

CREATE TABLE buys (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    lote_id INTEGER NOT NULL,
    proveedor_id INTEGER NOT NULL,
    procedencia VARCHAR(255) NOT NULL,
    tipo_purina VARCHAR(255) NOT NULL,
    cantidad_bultos INTEGER NOT NULL,
    valor_unitario DECIMAL(10, 2) NOT NULL,
    valor_flete DECIMAL(10, 2) NOT NULL,
    valor_bultos DECIMAL(10, 2) NOT NULL,
    valor_con_flete DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES suppliers(id),
    FOREIGN KEY (lote_id) REFERENCES lote(id)
);

CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    lote_id INTEGER NOT NULL,
    user_id  VARCHAR(255) NOT NULL,
    cantidadaves INTEGER NOT NULL,
    canastas_vacias NUMERIC[] NOT NULL,
    canastas_llenas NUMERIC[] NOT NULL,
    preciokilo DECIMAL(10, 2) NOT NULL,
    fecha DATE NOT NULL,
    numerofactura VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES customers(id),
    FOREIGN KEY (lote_id) REFERENCES lote(id)
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    lote_id INTEGER NOT NULL,
    valor INTEGER NOT NULL,
    metodo_pago VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    numerofactura VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES customers(id),
    FOREIGN KEY (lote_id) REFERENCES lote(id)
);






