--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3 (Debian 16.3-1.pgdg120+1)
-- Dumped by pg_dump version 16.3

-- Started on 2024-08-13 10:36:08

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 6 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: appavicola_admin
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO appavicola_admin;

--
-- TOC entry 2 (class 3079 OID 16399)
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- TOC entry 3516 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- TOC entry 254 (class 1255 OID 16605)
-- Name: get_deuda_actual(integer, date); Type: FUNCTION; Schema: public; Owner: appavicola_admin
--

CREATE FUNCTION public.get_deuda_actual(cliente_id integer, fecha_actual date) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (
        WITH Sales_Calculated AS (
            SELECT 
                S.CLIENTE_ID,
                SUM(S.preciokilo * (S.canastas_llenas[i] - S.canastas_vacias[i])) AS TOTAL_SALES
            FROM 
                SALES S,
                generate_series(array_lower(S.canastas_vacias, 1), array_upper(S.canastas_vacias, 1)) AS i
            GROUP BY 
                S.CLIENTE_ID
        ),
        Payments_Calculated AS (
            SELECT 
                P.CLIENTE_ID,
                P.FECHA,
                SUM(P.VALOR) OVER (PARTITION BY P.CLIENTE_ID ORDER BY P.FECHA) AS TOTAL_PAYMENTS,
                SUM(P.VALOR) OVER (PARTITION BY P.CLIENTE_ID ORDER BY P.FECHA ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS PREVIOUS_TOTAL_PAYMENTS
            FROM 
                PAYMENTS P
        ),
        Customer_Balance AS (
            SELECT
                C.ID AS CLIENTE_ID,
                COALESCE(SUM(SC.TOTAL_SALES), 0) AS TOTAL_SALES,
                COALESCE(MAX(PC.TOTAL_PAYMENTS), 0) AS TOTAL_PAYMENTS,
                COALESCE(MAX(PC.PREVIOUS_TOTAL_PAYMENTS), 0) AS PREVIOUS_TOTAL_PAYMENTS
            FROM 
                CUSTOMERS C
            LEFT JOIN 
                Sales_Calculated SC ON C.ID = SC.CLIENTE_ID
            LEFT JOIN 
                Payments_Calculated PC ON C.ID = PC.CLIENTE_ID
            WHERE
                C.ID = cliente_id
            GROUP BY 
                C.ID
        )
        SELECT
            CASE 
                WHEN CB.TOTAL_SALES > CB.PREVIOUS_TOTAL_PAYMENTS THEN CB.TOTAL_SALES - CB.PREVIOUS_TOTAL_PAYMENTS
                ELSE CB.PREVIOUS_TOTAL_PAYMENTS - CB.TOTAL_SALES
            END AS DEUDA_ACTUAL
        FROM 
            Customer_Balance CB
    );
END;
$$;


ALTER FUNCTION public.get_deuda_actual(cliente_id integer, fecha_actual date) OWNER TO appavicola_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 233 (class 1259 OID 16570)
-- Name: buys; Type: TABLE; Schema: public; Owner: appavicola_admin
--

CREATE TABLE public.buys (
    id integer NOT NULL,
    fecha date NOT NULL,
    proveedor_id integer NOT NULL,
    procedencia character varying(255) NOT NULL,
    tipo_purina character varying(255) NOT NULL,
    cantidad_bultos integer NOT NULL,
    valor_unitario numeric(10,2) NOT NULL,
    valor_flete numeric(10,2) NOT NULL,
    valor_bultos numeric(10,2) NOT NULL,
    valor_con_flete numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    lote_id integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.buys OWNER TO appavicola_admin;

--
-- TOC entry 232 (class 1259 OID 16569)
-- Name: buys_id_seq; Type: SEQUENCE; Schema: public; Owner: appavicola_admin
--

CREATE SEQUENCE public.buys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.buys_id_seq OWNER TO appavicola_admin;

--
-- TOC entry 3519 (class 0 OID 0)
-- Dependencies: 232
-- Name: buys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appavicola_admin
--

ALTER SEQUENCE public.buys_id_seq OWNED BY public.buys.id;


--
-- TOC entry 223 (class 1259 OID 16449)
-- Name: customers; Type: TABLE; Schema: public; Owner: appavicola_admin
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    telefono character varying(20) NOT NULL,
    documento character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customers OWNER TO appavicola_admin;

--
-- TOC entry 222 (class 1259 OID 16448)
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: appavicola_admin
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO appavicola_admin;

--
-- TOC entry 3520 (class 0 OID 0)
-- Dependencies: 222
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appavicola_admin
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- TOC entry 239 (class 1259 OID 16648)
-- Name: discounts; Type: TABLE; Schema: public; Owner: appavicola_admin
--

CREATE TABLE public.discounts (
    id integer NOT NULL,
    cliente_id integer NOT NULL,
    lote_id integer NOT NULL,
    valor integer NOT NULL,
    descripcion character varying(255) NOT NULL,
    fecha date NOT NULL,
    numerofactura character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.discounts OWNER TO appavicola_admin;

--
-- TOC entry 238 (class 1259 OID 16647)
-- Name: discounts_id_seq; Type: SEQUENCE; Schema: public; Owner: appavicola_admin
--

CREATE SEQUENCE public.discounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.discounts_id_seq OWNER TO appavicola_admin;

--
-- TOC entry 3521 (class 0 OID 0)
-- Dependencies: 238
-- Name: discounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appavicola_admin
--

ALTER SEQUENCE public.discounts_id_seq OWNED BY public.discounts.id;


--
-- TOC entry 237 (class 1259 OID 16632)
-- Name: events; Type: TABLE; Schema: public; Owner: appavicola_admin
--

CREATE TABLE public.events (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    start_date date NOT NULL,
    end_date date,
    description character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.events OWNER TO appavicola_admin;

--
-- TOC entry 236 (class 1259 OID 16631)
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: appavicola_admin
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_id_seq OWNER TO appavicola_admin;

--
-- TOC entry 3522 (class 0 OID 0)
-- Dependencies: 236
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appavicola_admin
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- TOC entry 219 (class 1259 OID 16431)
-- Name: food; Type: TABLE; Schema: public; Owner: appavicola_admin
--

CREATE TABLE public.food (
    id integer NOT NULL,
    cantidadhembra integer NOT NULL,
    cantidadmacho integer NOT NULL,
    fecha date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    lote_id integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.food OWNER TO appavicola_admin;

--
-- TOC entry 218 (class 1259 OID 16430)
-- Name: food_id_seq; Type: SEQUENCE; Schema: public; Owner: appavicola_admin
--

CREATE SEQUENCE public.food_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.food_id_seq OWNER TO appavicola_admin;

--
-- TOC entry 3523 (class 0 OID 0)
-- Dependencies: 218
-- Name: food_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appavicola_admin
--

ALTER SEQUENCE public.food_id_seq OWNED BY public.food.id;


--
-- TOC entry 231 (class 1259 OID 16556)
-- Name: lote; Type: TABLE; Schema: public; Owner: appavicola_admin
--

CREATE TABLE public.lote (
    id integer NOT NULL,
    fecha_llegada date NOT NULL,
    proveedor_id integer NOT NULL,
    descripcion character varying(255) NOT NULL,
    cantidad_aves integer NOT NULL,
    precio numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado character varying(255) DEFAULT 'activo'::character varying,
    CONSTRAINT estado_check CHECK (((estado)::text = ANY ((ARRAY['activo'::character varying, 'inactivo'::character varying])::text[])))
);


ALTER TABLE public.lote OWNER TO appavicola_admin;

--
-- TOC entry 230 (class 1259 OID 16555)
-- Name: lote_id_seq; Type: SEQUENCE; Schema: public; Owner: appavicola_admin
--

CREATE SEQUENCE public.lote_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lote_id_seq OWNER TO appavicola_admin;

--
-- TOC entry 3524 (class 0 OID 0)
-- Dependencies: 230
-- Name: lote_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appavicola_admin
--

ALTER SEQUENCE public.lote_id_seq OWNED BY public.lote.id;


--
-- TOC entry 221 (class 1259 OID 16440)
-- Name: mortality; Type: TABLE; Schema: public; Owner: appavicola_admin
--

CREATE TABLE public.mortality (
    id integer NOT NULL,
    cantidadhembra integer NOT NULL,
    cantidadmacho integer NOT NULL,
    fecha date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    lote_id integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.mortality OWNER TO appavicola_admin;

--
-- TOC entry 220 (class 1259 OID 16439)
-- Name: mortality_id_seq; Type: SEQUENCE; Schema: public; Owner: appavicola_admin
--

CREATE SEQUENCE public.mortality_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mortality_id_seq OWNER TO appavicola_admin;

--
-- TOC entry 3525 (class 0 OID 0)
-- Dependencies: 220
-- Name: mortality_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appavicola_admin
--

ALTER SEQUENCE public.mortality_id_seq OWNED BY public.mortality.id;


--
-- TOC entry 235 (class 1259 OID 16586)
-- Name: payments; Type: TABLE; Schema: public; Owner: appavicola_admin
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    cliente_id integer NOT NULL,
    lote_id integer NOT NULL,
    valor integer NOT NULL,
    fecha date NOT NULL,
    numerofactura character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    metodo_pago character varying(255) DEFAULT 'Efectivo'::character varying NOT NULL
);


ALTER TABLE public.payments OWNER TO appavicola_admin;

--
-- TOC entry 234 (class 1259 OID 16585)
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: appavicola_admin
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO appavicola_admin;

--
-- TOC entry 3526 (class 0 OID 0)
-- Dependencies: 234
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appavicola_admin
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- TOC entry 227 (class 1259 OID 16511)
-- Name: sales; Type: TABLE; Schema: public; Owner: appavicola_admin
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    cliente_id integer NOT NULL,
    lote_id integer NOT NULL,
    cantidadaves integer NOT NULL,
    canastas_vacias numeric[] NOT NULL,
    canastas_llenas numeric[] NOT NULL,
    preciokilo numeric(10,2) NOT NULL,
    fecha date NOT NULL,
    numerofactura character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sales OWNER TO appavicola_admin;

--
-- TOC entry 226 (class 1259 OID 16510)
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: appavicola_admin
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_id_seq OWNER TO appavicola_admin;

--
-- TOC entry 3527 (class 0 OID 0)
-- Dependencies: 226
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appavicola_admin
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- TOC entry 225 (class 1259 OID 16458)
-- Name: suppliers; Type: TABLE; Schema: public; Owner: appavicola_admin
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    telefono character varying(20) NOT NULL,
    documento character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.suppliers OWNER TO appavicola_admin;

--
-- TOC entry 224 (class 1259 OID 16457)
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: appavicola_admin
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suppliers_id_seq OWNER TO appavicola_admin;

--
-- TOC entry 3528 (class 0 OID 0)
-- Dependencies: 224
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appavicola_admin
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- TOC entry 229 (class 1259 OID 16542)
-- Name: supplies; Type: TABLE; Schema: public; Owner: appavicola_admin
--

CREATE TABLE public.supplies (
    id integer NOT NULL,
    fecha date NOT NULL,
    proveedor_id integer NOT NULL,
    descripcioncompra character varying(255) NOT NULL,
    preciocompra numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    lote_id integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.supplies OWNER TO appavicola_admin;

--
-- TOC entry 228 (class 1259 OID 16541)
-- Name: supplies_id_seq; Type: SEQUENCE; Schema: public; Owner: appavicola_admin
--

CREATE SEQUENCE public.supplies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.supplies_id_seq OWNER TO appavicola_admin;

--
-- TOC entry 3529 (class 0 OID 0)
-- Dependencies: 228
-- Name: supplies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appavicola_admin
--

ALTER SEQUENCE public.supplies_id_seq OWNED BY public.supplies.id;


--
-- TOC entry 3295 (class 2604 OID 16573)
-- Name: buys id; Type: DEFAULT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.buys ALTER COLUMN id SET DEFAULT nextval('public.buys_id_seq'::regclass);


--
-- TOC entry 3278 (class 2604 OID 16452)
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- TOC entry 3306 (class 2604 OID 16651)
-- Name: discounts id; Type: DEFAULT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.discounts ALTER COLUMN id SET DEFAULT nextval('public.discounts_id_seq'::regclass);


--
-- TOC entry 3303 (class 2604 OID 16635)
-- Name: events id; Type: DEFAULT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- TOC entry 3270 (class 2604 OID 16434)
-- Name: food id; Type: DEFAULT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.food ALTER COLUMN id SET DEFAULT nextval('public.food_id_seq'::regclass);


--
-- TOC entry 3291 (class 2604 OID 16559)
-- Name: lote id; Type: DEFAULT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.lote ALTER COLUMN id SET DEFAULT nextval('public.lote_id_seq'::regclass);


--
-- TOC entry 3274 (class 2604 OID 16443)
-- Name: mortality id; Type: DEFAULT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.mortality ALTER COLUMN id SET DEFAULT nextval('public.mortality_id_seq'::regclass);


--
-- TOC entry 3299 (class 2604 OID 16589)
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- TOC entry 3284 (class 2604 OID 16514)
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- TOC entry 3281 (class 2604 OID 16461)
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- TOC entry 3287 (class 2604 OID 16545)
-- Name: supplies id; Type: DEFAULT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.supplies ALTER COLUMN id SET DEFAULT nextval('public.supplies_id_seq'::regclass);


--
-- TOC entry 3504 (class 0 OID 16570)
-- Dependencies: 233
-- Data for Name: buys; Type: TABLE DATA; Schema: public; Owner: appavicola_admin
--

COPY public.buys (id, fecha, proveedor_id, procedencia, tipo_purina, cantidad_bultos, valor_unitario, valor_flete, valor_bultos, valor_con_flete, created_at, updated_at, lote_id) FROM stdin;
4	2024-06-06	7	Ocana	P	50	112000.00	40000.00	5600000.00	5640000.00	2024-07-21 18:17:09.04	2024-07-21 18:17:09.04	1
5	2024-06-13	7	Ocana	P	50	112000.00	40000.00	5600000.00	5640000.00	2024-07-21 18:19:53.049	2024-07-21 18:19:53.049	1
6	2024-06-17	7	Ocana	P	60	112000.00	50000.00	6720000.00	6770000.00	2024-07-21 18:21:10.009	2024-07-21 18:21:10.009	1
8	2024-06-20	8	Bucaramanga	Q	200	89387.00	760000.00	17877400.00	18637400.00	2024-07-21 18:27:54.214	2024-07-21 18:27:54.214	1
9	2024-06-28	8	Bucaramanga	E	200	89387.00	760000.00	17877400.00	18637400.00	2024-07-21 18:29:09.53	2024-07-21 18:29:09.53	1
10	2024-07-05	8	Bucaramanga	E	201	89387.00	760000.00	17966787.00	18726787.00	2024-07-21 18:30:10.866	2024-07-21 18:30:10.866	1
11	2024-07-10	8	Bucaramanga	E	200	89387.00	760000.00	17877400.00	18637400.00	2024-07-21 18:31:37.311	2024-07-21 18:31:37.311	1
12	2024-07-14	8	Bucaramanga	E	193	89387.00	950000.00	17251691.00	18201691.00	2024-07-21 18:32:47.742	2024-07-21 18:32:47.742	1
\.


--
-- TOC entry 3494 (class 0 OID 16449)
-- Dependencies: 223
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: appavicola_admin
--

COPY public.customers (id, nombre, telefono, documento, created_at, updated_at) FROM stdin;
11	Miller Alvarez	3107672929	88285511	2024-07-20 19:08:51.83	2024-07-20 19:08:51.83
12	Julian Sanchez 	3112940293	1091665880	2024-07-20 19:09:31.507	2024-07-20 19:09:31.507
15	Torcoroma Prado	3144610457	37337230	2024-07-20 19:19:46.873	2024-07-20 19:19:46.873
16	Granja Avícola Santa Catalina 	3138166374	901587502-3	2024-07-20 19:20:55.401	2024-07-20 19:20:55.401
17	Julio Chamorro	3186448060	85152230	2024-07-20 19:21:40.729	2024-07-20 19:21:40.729
18	Lucy Pacheco	3164373247	37180583	2024-07-20 19:22:32.186	2024-07-20 19:22:32.186
19	Jhon Pineda	3103182288	8827730	2024-07-20 19:23:28.4	2024-07-20 19:23:28.4
20	Jesus Rodriguez	3208287874	1090365869	2024-07-20 19:24:58.043	2024-07-20 19:24:58.043
21	Bladimir Carvajal 	3245144814	88228768	2024-07-20 20:07:10.483	2024-07-20 20:07:10.483
13	Yeigny Sanchez 	3162376763	1064878012	2024-07-20 19:18:15.055	2024-07-20 19:18:15.055
14	Yimmi Navarro	3125404306	1064841994	2024-07-20 19:19:02.895	2024-07-20 19:19:02.895
22	Particular	3216549870	1234567890	2024-07-27 14:11:21.361	2024-07-27 14:11:21.361
23	Ilder Garcia	3202011199	1091677351	2024-07-27 14:12:50.304	2024-07-27 14:12:50.304
\.


--
-- TOC entry 3510 (class 0 OID 16648)
-- Dependencies: 239
-- Data for Name: discounts; Type: TABLE DATA; Schema: public; Owner: appavicola_admin
--

COPY public.discounts (id, cliente_id, lote_id, valor, descripcion, fecha, numerofactura, created_at, updated_at) FROM stdin;
1	15	1	18310	Descuento por pollo en mal estado	2024-08-01	1260	2024-08-01 16:33:17.933	2024-08-01 16:33:17.933
\.


--
-- TOC entry 3508 (class 0 OID 16632)
-- Dependencies: 237
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: appavicola_admin
--

COPY public.events (id, title, start_date, end_date, description, created_at, updated_at) FROM stdin;
4	VACUNA	2024-07-01	2024-07-01	\N	2024-07-21 11:18:11.283	2024-07-21 11:18:11.283
11	vacuna	2024-07-09	2024-07-09	\N	2024-07-21 11:36:12.879	2024-07-21 11:36:12.879
14	Pesar pollos	2024-07-25	2024-07-25	\N	2024-07-22 20:14:58.117	2024-07-22 20:14:58.117
\.


--
-- TOC entry 3490 (class 0 OID 16431)
-- Dependencies: 219
-- Data for Name: food; Type: TABLE DATA; Schema: public; Owner: appavicola_admin
--

COPY public.food (id, cantidadhembra, cantidadmacho, fecha, created_at, updated_at, lote_id) FROM stdin;
41	4	4	2024-06-09	2024-07-19 21:54:07.05	2024-07-22 20:11:21.481	1
86	6	7	2024-07-17	2024-07-30 16:47:51.293	2024-07-30 16:48:35.401	1
87	11	10	2024-07-18	2024-07-30 16:49:11.448	2024-07-30 16:49:11.448	1
88	4	6	2024-07-19	2024-07-30 16:49:35.035	2024-07-30 16:49:35.035	1
89	6	10	2024-07-20	2024-07-30 16:49:49.872	2024-07-30 16:49:49.872	1
65	17	22	2024-07-02	2024-07-19 21:58:28.449	2024-07-19 21:58:28.449	1
66	18	25	2024-07-03	2024-07-19 21:58:38.382	2024-07-19 21:58:38.382	1
68	14	17	2024-07-05	2024-07-19 21:58:59.139	2024-07-19 21:58:59.139	1
69	21	26	2024-07-06	2024-07-19 21:59:12.421	2024-07-19 21:59:12.421	1
70	20	25	2024-07-07	2024-07-19 21:59:33.25	2024-07-19 21:59:33.25	1
73	17	23	2024-07-10	2024-07-19 22:00:08.055	2024-07-19 22:00:08.055	1
74	18	24	2024-07-11	2024-07-19 22:00:17.111	2024-07-19 22:00:17.111	1
75	24	30	2024-07-12	2024-07-19 22:00:30.791	2024-07-19 22:00:30.791	1
76	21	20	2024-07-13	2024-07-19 22:00:43.93	2024-07-19 22:00:43.93	1
71	20	26	2024-07-08	2024-07-19 21:59:43.738	2024-07-19 21:59:43.738	1
40	3	3	2024-06-08	2024-07-19 21:53:53.532	2024-07-19 21:53:53.532	1
42	4	4	2024-06-10	2024-07-19 21:54:12.766	2024-07-19 21:54:12.766	1
43	4	4	2024-06-11	2024-07-19 21:54:18.138	2024-07-19 21:54:18.138	1
44	5	5	2024-06-12	2024-07-19 21:54:25.143	2024-07-19 21:54:25.143	1
45	5	5	2024-06-13	2024-07-19 21:54:34.83	2024-07-19 21:54:34.83	1
46	6	6	2024-06-14	2024-07-19 21:54:52.678	2024-07-19 21:54:52.678	1
47	6	7	2024-06-15	2024-07-19 21:55:00.024	2024-07-19 21:55:00.024	1
48	6	7	2024-06-16	2024-07-19 21:55:10.393	2024-07-19 21:55:10.393	1
49	15	15	2024-06-17	2024-07-19 21:55:18.667	2024-07-19 21:55:18.667	1
50	4	7	2024-06-18	2024-07-19 21:55:38.664	2024-07-19 21:55:38.664	1
52	5	7	2024-06-19	2024-07-19 21:55:56.606	2024-07-19 21:55:56.606	1
53	7	6	2024-06-20	2024-07-19 21:56:18.903	2024-07-19 21:56:18.903	1
54	11	14	2024-06-21	2024-07-19 21:56:28.889	2024-07-19 21:56:28.889	1
55	12	12	2024-06-22	2024-07-19 21:56:38.991	2024-07-19 21:56:38.991	1
56	12	12	2024-06-23	2024-07-19 21:56:42.135	2024-07-19 21:56:42.135	1
57	12	12	2024-06-24	2024-07-19 21:56:48.207	2024-07-19 21:56:48.207	1
58	9	13	2024-06-25	2024-07-19 21:56:59.063	2024-07-19 21:56:59.063	1
59	11	15	2024-06-26	2024-07-19 21:57:12.068	2024-07-19 21:57:12.068	1
60	15	21	2024-06-27	2024-07-19 21:57:20.77	2024-07-19 21:57:20.77	1
61	12	17	2024-06-28	2024-07-19 21:57:30.457	2024-07-19 21:57:30.457	1
62	13	17	2024-06-29	2024-07-19 21:57:52.053	2024-07-19 21:57:52.053	1
63	12	16	2024-06-30	2024-07-19 21:58:02.2	2024-07-19 21:58:02.2	1
64	12	19	2024-07-01	2024-07-19 21:58:19.96	2024-07-19 21:58:19.96	1
67	16	25	2024-07-04	2024-07-19 21:58:49.283	2024-07-19 21:58:49.283	1
72	24	32	2024-07-09	2024-07-19 21:59:53.122	2024-07-19 21:59:53.122	1
77	18	24	2024-07-14	2024-07-19 22:00:59.9	2024-07-19 22:00:59.9	1
78	12	16	2024-07-15	2024-07-19 22:01:10.119	2024-07-19 22:01:10.119	1
79	24	16	2024-07-16	2024-07-19 22:01:19.019	2024-07-19 22:01:19.019	1
39	3	3	2024-06-07	2024-07-19 21:53:45.753	2024-07-19 22:04:49.825	1
\.


--
-- TOC entry 3502 (class 0 OID 16556)
-- Dependencies: 231
-- Data for Name: lote; Type: TABLE DATA; Schema: public; Owner: appavicola_admin
--

COPY public.lote (id, fecha_llegada, proveedor_id, descripcion, cantidad_aves, precio, created_at, updated_at, estado) FROM stdin;
1	2024-06-07	4	LOTE BERMEJAL JUNIO 7 DE 2024	10870	25425191.00	2024-07-19 00:22:23.112	2024-08-01 15:10:36.409	activo
\.


--
-- TOC entry 3492 (class 0 OID 16440)
-- Dependencies: 221
-- Data for Name: mortality; Type: TABLE DATA; Schema: public; Owner: appavicola_admin
--

COPY public.mortality (id, cantidadhembra, cantidadmacho, fecha, created_at, updated_at, lote_id) FROM stdin;
11	3	5	2024-06-07	2024-07-20 21:28:15.598	2024-07-20 21:28:15.598	1
12	2	8	2024-06-08	2024-07-20 21:28:36.322	2024-07-20 21:28:36.322	1
13	20	4	2024-06-09	2024-07-20 21:28:54.006	2024-07-20 21:28:54.006	1
14	4	6	2024-06-10	2024-07-20 21:29:09.476	2024-07-20 21:29:09.476	1
15	5	7	2024-06-11	2024-07-20 21:32:27.172	2024-07-20 21:32:27.172	1
16	5	4	2024-06-12	2024-07-20 21:32:45.653	2024-07-20 21:32:45.653	1
17	4	2	2024-06-13	2024-07-20 21:33:13.75	2024-07-20 21:33:13.75	1
18	2	1	2024-06-14	2024-07-20 21:33:33.778	2024-07-20 21:33:33.778	1
19	2	1	2024-06-15	2024-07-20 21:33:48.799	2024-07-20 21:33:48.799	1
20	2	1	2024-06-16	2024-07-20 21:34:06.099	2024-07-20 21:34:06.099	1
21	6	3	2024-06-17	2024-07-20 21:34:24.337	2024-07-20 21:34:24.337	1
22	1	9	2024-06-18	2024-07-20 21:36:16.808	2024-07-20 21:36:16.808	1
23	1	6	2024-06-19	2024-07-20 21:36:42.83	2024-07-20 21:36:42.83	1
24	5	11	2024-06-20	2024-07-20 21:37:01.381	2024-07-20 21:37:01.381	1
25	15	10	2024-06-21	2024-07-20 21:37:15.652	2024-07-20 21:37:15.652	1
26	5	18	2024-06-22	2024-07-20 21:37:40.43	2024-07-20 21:37:40.43	1
27	13	5	2024-06-23	2024-07-20 21:38:03.17	2024-07-20 21:38:03.17	1
28	12	6	2024-06-24	2024-07-20 21:38:16.289	2024-07-20 21:38:16.289	1
29	1	3	2024-06-25	2024-07-20 21:38:55.223	2024-07-20 21:38:55.223	1
30	2	3	2024-06-26	2024-07-20 21:39:14.082	2024-07-20 21:39:14.082	1
31	1	4	2024-06-27	2024-07-20 21:39:35.034	2024-07-20 21:39:35.034	1
32	2	2	2024-06-28	2024-07-20 21:39:51.646	2024-07-20 21:39:51.646	1
33	1	5	2024-06-29	2024-07-20 21:40:14.06	2024-07-20 21:40:14.06	1
34	3	3	2024-06-30	2024-07-20 21:40:34.252	2024-07-20 21:40:34.252	1
35	3	2	2024-07-01	2024-07-20 21:40:48.432	2024-07-20 21:40:48.432	1
37	4	7	2024-07-03	2024-07-20 21:41:24.685	2024-07-20 21:41:24.685	1
39	4	6	2024-07-05	2024-07-20 21:42:42.997	2024-07-20 21:42:42.997	1
36	7	3	2024-07-02	2024-07-20 21:41:04.842	2024-07-20 21:43:55.357	1
38	5	6	2024-07-04	2024-07-20 21:42:22.28	2024-07-20 21:44:28.526	1
40	8	7	2024-07-06	2024-07-20 21:45:26.647	2024-07-20 21:45:26.647	1
41	7	10	2024-07-07	2024-07-20 21:45:45.446	2024-07-20 21:45:45.446	1
42	6	12	2024-07-08	2024-07-20 21:46:03.847	2024-07-20 21:46:03.847	1
43	5	3	2024-07-09	2024-07-20 21:46:24.42	2024-07-20 21:46:24.42	1
44	3	5	2024-07-10	2024-07-20 21:46:37.746	2024-07-20 21:46:37.746	1
45	3	10	2024-07-11	2024-07-20 21:46:54.199	2024-07-20 21:46:54.199	1
46	3	17	2024-07-12	2024-07-20 21:47:07.695	2024-07-20 21:47:07.695	1
47	7	2	2024-07-13	2024-07-20 21:47:27.119	2024-07-20 21:47:27.119	1
48	9	10	2024-07-14	2024-07-20 21:47:46.321	2024-07-20 21:47:46.321	1
49	7	4	2024-07-15	2024-07-20 21:48:11.409	2024-07-20 21:48:11.409	1
50	10	8	2024-07-16	2024-07-20 21:48:25.512	2024-07-20 21:48:25.512	1
51	10	5	2024-07-17	2024-07-30 16:52:03.634	2024-07-30 16:52:03.634	1
52	2	5	2024-07-18	2024-07-30 16:52:17.088	2024-07-30 16:52:17.088	1
53	2	5	2024-07-19	2024-07-30 16:52:32.003	2024-07-30 16:52:32.003	1
54	2	5	2024-07-20	2024-07-30 16:52:48.678	2024-07-30 16:52:48.678	1
55	3	12	2024-07-21	2024-07-30 16:53:02.667	2024-07-30 16:53:02.667	1
56	0	7	2024-07-22	2024-07-30 16:53:19.934	2024-07-30 16:53:19.934	1
57	28	25	2024-08-23	2024-08-01 15:11:54.183	2024-08-01 15:11:54.183	1
\.


--
-- TOC entry 3506 (class 0 OID 16586)
-- Dependencies: 235
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: appavicola_admin
--

COPY public.payments (id, cliente_id, lote_id, valor, fecha, numerofactura, created_at, updated_at, metodo_pago) FROM stdin;
3	21	1	3888540	2024-07-16	5634	2024-07-20 22:11:55.805	2024-07-20 22:11:55.805	Efectivo
4	21	1	14000000	2024-07-18	2667	2024-07-20 22:15:33.761	2024-07-20 22:15:33.761	Efectivo
5	11	1	3500000	2024-07-18	7508	2024-07-20 22:16:08.294	2024-07-20 22:16:08.294	Efectivo
6	16	1	1606000	2024-07-18	9493	2024-07-20 22:16:50.58	2024-07-20 22:16:50.58	Efectivo
7	21	1	1485000	2024-07-18	6459	2024-07-20 22:17:45.135	2024-07-20 22:17:45.135	Efectivo
8	15	1	3729000	2024-07-20	8277	2024-07-20 22:18:12.228	2024-07-20 22:18:12.228	Efectivo
9	11	1	500000	2024-07-20	4549	2024-07-20 19:30:05.516	2024-07-20 19:30:05.516	Efectivo
10	11	1	4000000	2024-07-21	4112	2024-07-21 22:27:25.278	2024-07-21 22:27:25.278	Efectivo
11	11	1	3000000	2024-07-22	7442	2024-07-22 20:59:21.128	2024-07-22 20:59:21.128	Efectivo
12	14	1	22634200	2024-07-22	4376	2024-07-23 01:37:05.863	2024-07-23 01:37:05.863	Efectivo
14	13	1	10000000	2024-07-24	5915	2024-07-24 11:05:38.691	2024-07-24 11:05:38.691	Efectivo
15	15	1	5000000	2024-07-24	8349	2024-07-25 15:40:05.681	2024-07-25 15:40:05.681	Efectivo
16	20	1	3181750	2024-07-27	9601	2024-07-27 18:10:31.891	2024-07-27 18:10:31.891	Transferencia
17	22	1	767650	2024-07-27	7138	2024-07-27 21:38:55.607	2024-07-27 21:38:55.607	Efectivo
18	11	1	7000000	2024-07-27	7502	2024-07-27 21:40:03.161	2024-07-27 21:40:03.161	Efectivo
19	22	1	1337000	2024-07-27	4535	2024-07-27 21:42:03.406	2024-07-27 21:42:03.406	Efectivo
20	22	1	30870	2024-07-27	9214	2024-07-27 21:47:43.991	2024-07-27 21:47:43.991	Efectivo
21	22	1	186000	2024-07-27	727	2024-07-27 22:16:33.691	2024-07-27 22:16:33.691	Efectivo
22	19	1	22434550	2024-07-29	3429	2024-07-29 19:50:04.614	2024-07-29 19:50:04.614	Efectivo
23	14	1	7000000	2024-07-29	396	2024-07-29 22:51:59.348	2024-07-29 22:51:59.348	Transferencia
24	11	1	4274000	2024-07-29	1030	2024-07-30 19:41:27.722	2024-07-30 19:41:27.722	Efectivo
25	18	1	1743000	2024-07-30	7472	2024-07-30 19:42:15.973	2024-07-30 19:42:15.973	Transferencia
26	15	1	6281000	2024-07-30	1517	2024-07-30 19:43:14.148	2024-07-30 19:43:14.148	Efectivo
27	13	1	6300000	2024-08-01	8601	2024-08-01 18:06:13.478	2024-08-01 18:06:13.478	Efectivo
28	23	1	4812610	2024-08-01	4001	2024-08-01 18:07:11.055	2024-08-01 18:07:11.055	Efectivo
29	14	1	8000320	2024-08-02	493	2024-08-06 13:07:32.823	2024-08-06 13:07:32.823	Transferencia
30	11	1	3000000	2024-08-03	2927	2024-08-06 13:08:23.247	2024-08-06 13:08:23.247	Transferencia
31	13	1	3000000	2024-08-05	47	2024-08-06 13:08:57.645	2024-08-06 13:08:57.645	Efectivo
32	17	1	806400	2024-08-07	2840	2024-08-07 17:21:54.055	2024-08-07 17:21:54.055	Efectivo
33	12	1	16245950	2024-08-08	878	2024-08-08 22:24:17.797	2024-08-08 22:24:17.797	Efectivo
\.


--
-- TOC entry 3498 (class 0 OID 16511)
-- Dependencies: 227
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: appavicola_admin
--

COPY public.sales (id, cliente_id, lote_id, cantidadaves, canastas_vacias, canastas_llenas, preciokilo, fecha, numerofactura, created_at, updated_at) FROM stdin;
9	12	1	90	{32.2,40}	{110.9,109.4,88.1}	5700.00	2024-07-12	754	2024-07-20 19:31:05.037	2024-07-20 19:31:05.037
11	11	1	24	{12.7}	{65.6}	5800.00	2024-07-12	4741	2024-07-20 19:34:25.331	2024-07-20 19:34:25.331
12	11	1	140	{32,30.8,23.7}	{129.9,130.5,129.5,66}	5800.00	2024-07-13	8046	2024-07-20 19:46:48.251	2024-07-20 19:46:48.251
17	13	1	200	{29,29.7,29.8,30.5}	{131.9,131.4,130.1,131.3,129.1}	5800.00	2024-07-13	1601	2024-07-20 20:00:18.666	2024-07-20 20:00:18.666
18	12	1	210	{32.2,32.5,46.3,19.7}	{143.5,133.1,137.7,182.1,100.4}	5700.00	2024-07-13	1635	2024-07-20 20:03:09.481	2024-07-20 20:03:09.481
19	21	1	249	{30,29.6,28.6,29.8,29.9}	{167.2,164.8,167.2,165,165.9}	5700.00	2024-07-15	4522	2024-07-20 20:09:07.577	2024-07-20 20:09:07.577
20	12	1	55	{44.5}	{112,86.2}	5700.00	2024-07-15	2038	2024-07-20 20:12:11.537	2024-07-20 20:12:11.537
21	11	1	30	{18.9}	{102.5}	5800.00	2024-07-15	3907	2024-07-20 20:14:21.506	2024-07-20 20:14:21.506
22	13	1	20	{11.6}	{67}	5800.00	2024-07-15	4803	2024-07-20 20:15:32.856	2024-07-20 20:15:32.856
23	11	1	90	{23.9,29.1}	{164.6,132.2}	5800.00	2024-07-16	7256	2024-07-20 20:20:16.464	2024-07-20 20:20:16.464
24	13	1	70	{42.1}	{133.9,102.2}	5800.00	2024-07-16	5553	2024-07-20 20:21:47.772	2024-07-20 20:21:47.772
25	12	1	99	{33.2,31.6}	{165.7,174.9}	5700.00	2024-07-16	7028	2024-07-20 20:23:32.938	2024-07-20 20:23:32.938
26	21	1	960	{780}	{147,149.2,149.7,146.3,153.6,147.8,146.2,147,147.2,146.2,145.1,147.1,144.1,144.9,144.6,142.4,147,141.8,144,143.4,143.9,144.8,143,140.3}	5700.00	2024-07-17	7222	2024-07-20 20:31:04.891	2024-07-20 20:31:04.891
27	11	1	100	{31.4,29.2}	{162.2,163.5}	5800.00	2024-07-17	9724	2024-07-20 20:33:14.568	2024-07-20 20:33:14.568
28	13	1	60	{35.1}	{196.2}	5800.00	2024-07-17	5254	2024-07-20 20:34:22.535	2024-07-20 20:34:22.535
29	15	1	120	{37.7,36.8}	{193.7,195.6}	5800.00	2024-07-17	9393	2024-07-20 20:35:56.398	2024-07-20 20:35:56.398
30	12	1	96	{37.2,40.5}	{109.5,110.1,109}	5700.00	2024-07-17	6312	2024-07-20 20:37:11.99	2024-07-20 20:37:11.99
31	16	1	100	{24,23.1,30.1}	{109.5,109,131}	5900.00	2024-07-17	8039	2024-07-20 20:38:32.223	2024-07-20 20:38:32.223
32	14	1	1106	{30.6,33.2,29.3,31.8,31.8,31.4,30.4,33.4,30.1,31.3,32.1,31.2,31.4,31.9,31.2,32,29.8,34.2,32.8,30.8,30.6,31.1,35.7,32.4,33.2,33.3,31.5,30.9,33.7,32.4,33.6,18.9}	{131.1,131.9,129.9,128.7,129.1,127.8,129,125.6,128.9,131.6,127.8,127,132.5,125.9,126.1,125.3,126.1,124.8,125.9,123.3,129.9,121.4,121.9,124.8,127.6,123.9,124.6,124.8,127.3,127.8,124.9,72.4}	5700.00	2024-07-17	1717	2024-07-20 20:51:02.337	2024-07-20 20:51:02.337
33	11	1	210	{29,29.6,31.2,29.7,23.9}	{140.9,144.1,150.7,150.9,118.1}	6000.00	2024-07-18	3298	2024-07-20 20:54:00.927	2024-07-20 20:54:00.927
34	11	1	70	{40.9}	{129.1,96.2}	6000.00	2024-07-18	5846	2024-07-20 20:55:05.814	2024-07-20 20:55:05.814
35	13	1	60	{35.9}	{99.7,98.8}	6000.00	2024-07-18	1636	2024-07-20 20:56:34.708	2024-07-20 20:56:34.708
36	15	1	130	{31.7,24.9,19.1}	{130.8,98.8,163.3}	6000.00	2024-07-18	3775	2024-07-20 20:58:45.867	2024-07-20 20:58:45.867
38	12	1	150	{31.6,33.5,47.6}	{135.6,141,129.7,100.8}	5700.00	2024-07-18	9676	2024-07-20 21:00:28.288	2024-07-20 21:00:28.288
39	17	1	50	{37.5}	{89.6,82.3}	6000.00	2024-07-18	5296	2024-07-20 21:01:57.011	2024-07-20 21:01:57.011
40	11	1	80	{23.9,23.8}	{133.3,132.4}	6000.00	2024-07-19	7945	2024-07-20 21:19:26.678	2024-07-20 21:19:26.678
41	18	1	30	{18}	{100.5}	6000.00	2024-07-19	5705	2024-07-20 21:20:12.008	2024-07-20 21:20:12.008
42	13	1	80	{23.5,24.8}	{133.6,134.4}	6000.00	2024-07-19	8484	2024-07-20 21:21:20.224	2024-07-20 21:21:20.224
43	19	1	275	{23.3,29.3,29.9,30.6,29.3,30.7,30.4}	{120.3,136.9,136.6,140,132,132.9,137}	6000.00	2024-07-19	6159	2024-07-20 21:23:31.818	2024-07-20 21:23:31.818
44	12	1	160	{33.5,31.1,54}	{163.9,164.3,111.5,108.5}	5900.00	2024-07-19	9780	2024-07-20 21:24:57.56	2024-07-20 21:24:57.56
45	15	1	125	{37.3,18.9,18.1}	{197.9,111.3,97.9}	6000.00	2024-07-19	900	2024-07-20 21:26:32.63	2024-07-20 21:26:32.63
46	20	1	180	{30.7,24.8,30.5,25.4}	{167,167.4,133.5,133}	6500.00	2024-07-20	5628	2024-07-20 21:28:58.969	2024-07-20 21:28:58.969
47	15	1	210	{32.1,28.1,29.9,37.9}	{170.9,167.6,170.4,204.1}	6500.00	2024-07-20	8430	2024-07-20 21:31:05.587	2024-07-20 21:31:05.587
48	13	1	140	{29.4,28.5,24.7}	{137,169.3,167.4}	6400.00	2024-07-20	3666	2024-07-20 21:35:14.662	2024-07-20 21:35:14.662
49	11	1	130	{35.6,42.7}	{168.5,137.7,138}	6400.00	2024-07-20	4081	2024-07-20 21:38:08.935	2024-07-20 21:38:08.935
50	14	1	1200	{33.7,31.2,34.3,30.9,31.2,32.1,35.5,34.5,30.7,30.7,33,30.4,34.3,32.5,31.3,33.7,32.9,33.5,32.1,33.3,32.1,33.1,33.2,31.9,32.4,32,32.2,34.3,31.4,32.4,31.1,32.4,33.5,32.4,11.8}	{126.6,126.8,128.3,127.7,128.4,127.1,128.8,130.2,125.8,126.9,126.8,128.7,130.5,125.7,127.9,128.6,131.5,125.7,127,128.6,127,127.5,123.3,127.3,125.5,127,127,126.2,129.7,124.9,128,122.3,125.7,126.4,50.6}	6300.00	2024-07-20	5583	2024-07-20 22:07:25.734	2024-07-20 22:07:25.734
51	12	1	80	{34.5,30.9}	{142.1,142.9}	6400.00	2024-07-20	2876	2024-07-20 22:56:22.285	2024-07-20 22:56:22.285
52	19	1	545	{24.5,18.4,30.6,29.2,30.1,30.3,18.1,29.5,30,28.8,29.7,18.2,11.3}	{135,94.1,161,161.8,162.8,161.3,95.9,163,161,165.1,160.5,164}	6500.00	2024-07-20	6888	2024-07-20 23:05:07.459	2024-07-20 23:05:07.459
53	12	1	90	{48,31.4}	{174.1,156.3}	6400.00	2024-07-22	4737	2024-07-22 23:02:04.831	2024-07-22 23:02:04.831
54	18	1	70	{24.1,35.9}	{125,127}	6500.00	2024-07-21	6924	2024-07-23 01:48:10.352	2024-07-23 01:48:10.352
55	11	1	50	{31.1}	{171.6}	6400.00	2024-07-22	959	2024-07-23 01:50:31.926	2024-07-23 01:50:31.926
56	13	1	70	{41.7}	{134.9,102.2}	6400.00	2024-07-22	9443	2024-07-23 01:53:15.747	2024-07-23 01:53:15.747
57	19	1	260	{24.1,29.9,30,29.6,17.5,23.1}	{141.6,175.9,171.3,174.3,134.9,95.7}	6500.00	2024-07-22	4264	2024-07-23 02:00:23.831	2024-07-23 02:00:23.831
58	15	1	100	{30,30.6}	{174.1,168.2}	6500.00	2024-07-22	2424	2024-07-23 02:04:10.242	2024-07-23 02:04:10.242
59	13	1	100	{30.1,30.4}	{162,165.3}	6700.00	2024-07-23	6548	2024-07-23 23:38:50.358	2024-07-23 23:38:50.358
60	11	1	60	{35.9}	{201.1}	6700.00	2024-07-23	1815	2024-07-24 02:24:06.144	2024-07-24 02:24:06.144
61	15	1	100	{30,30.5}	{162.5,168.2}	6700.00	2024-07-23	8745	2024-07-24 02:25:03.634	2024-07-24 02:25:03.634
62	19	1	200	{35.3,30.7,30.1,24}	{135.1,138,130.2,137.1,141.7}	6700.00	2024-07-23	9638	2024-07-24 02:26:50.423	2024-07-24 02:26:50.423
65	11	1	70	{44.1}	{142.1,105.5}	6700.00	2024-07-24	2828	2024-07-26 20:52:31.204	2024-07-26 20:52:31.204
66	13	1	100	{30,29.1}	{174,173.5}	6700.00	2024-07-24	9246	2024-07-27 13:54:08.553	2024-07-27 13:54:08.553
68	11	1	50	{30.9}	{178.9}	6700.00	2024-07-25	2015	2024-07-27 14:09:36.189	2024-07-27 14:09:36.189
69	15	1	100	{31.2,30}	{169.6,169}	6700.00	2024-07-25	3009	2024-07-27 14:10:34.564	2024-07-27 14:10:34.564
67	13	1	100	{29,31.2}	{173.5,172.1}	6700.00	2024-07-25	1199	2024-07-27 14:08:55.23	2024-07-27 14:08:55.23
70	23	1	250	{32.5,31.7,35.4,33.8,34.4}	{178.2,179.1,177.7,179.2,171.9}	6700.00	2024-07-25	3241	2024-07-27 14:14:41.253	2024-07-27 14:14:41.253
71	13	1	100	{29.2,32.3}	{167.3,169.3}	6700.00	2024-07-26	7148	2024-07-27 14:15:57.522	2024-07-27 14:15:57.522
72	11	1	200	{29.9,30.7,30.5,28.5,23.1}	{144.9,148.2,151.1,152.6,127.1}	6700.00	2024-07-26	2947	2024-07-27 14:18:34.735	2024-07-27 14:18:34.735
73	11	1	49	{30.2}	{170.5}	6700.00	2024-07-26	46	2024-07-27 14:19:43.848	2024-07-27 14:19:43.848
75	22	1	60	{12.3,24.2}	{72,141.8}	6700.00	2024-07-27	4793	2024-07-27 21:24:33.221	2024-07-27 21:24:33.221
76	22	1	3	{0}	{1}	54000.00	2024-07-27	1561	2024-07-27 22:00:44.833	2024-07-27 22:00:44.833
77	11	1	150	{29.9,29.2,17.6,12.2}	{158,62,101.3,104.4,67.8}	6700.00	2024-07-27	6106	2024-07-27 22:03:03.845	2024-07-27 22:03:03.845
78	13	1	150	{31,31.3,28.6}	{164.7,171.6,167.6}	6700.00	2024-07-27	9367	2024-07-27 22:04:19.125	2024-07-27 22:04:19.125
79	13	1	12	{0}	{28}	6500.00	2024-07-29	5484	2024-07-30 19:45:33.386	2024-07-30 19:45:33.386
80	13	1	34	{}	{75}	4500.00	2024-07-29	4334	2024-07-30 19:46:31.975	2024-07-30 19:46:31.975
74	22	1	60	{24.2,12.1}	{142.3,68.4}	6500.00	2024-07-27	469	2024-07-27 21:22:34.648	2024-07-27 21:22:34.648
\.


--
-- TOC entry 3496 (class 0 OID 16458)
-- Dependencies: 225
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: appavicola_admin
--

COPY public.suppliers (id, nombre, telefono, documento, created_at, updated_at) FROM stdin;
5	ITALCOL	3219876540	1237894560	2024-07-19 00:24:17.42	2024-07-19 15:57:03.141
7	FREDY TRIGOS	3102075562	1084332532	2024-07-21 18:15:33.562	2024-07-21 18:15:33.562
8	BIOCONCENTRADOS S.A.S	3125875496	455841269	2024-07-21 18:18:13.018	2024-07-21 18:18:13.018
4	SAN MARINO	3216548970	1234567891	2024-07-19 00:18:10.975	2024-07-22 14:32:52.836
9	SERVICIOS PUBLICOS 	312581746	124785558	2024-07-30 20:03:33.703	2024-07-30 20:03:33.703
\.


--
-- TOC entry 3500 (class 0 OID 16542)
-- Dependencies: 229
-- Data for Name: supplies; Type: TABLE DATA; Schema: public; Owner: appavicola_admin
--

COPY public.supplies (id, fecha, proveedor_id, descripcioncompra, preciocompra, created_at, updated_at, lote_id) FROM stdin;
3	2024-06-01	8	CRIADORAS	4520184.00	2024-07-22 07:39:43.247	2024-07-22 09:04:39.191	1
5	2024-06-18	4	ANTIBIOTICO	102000.00	2024-07-23 10:04:50.515	2024-07-23 10:04:50.515	1
6	2024-06-14	4	VACUNA	277000.00	2024-07-23 10:05:12.562	2024-07-23 10:05:12.562	1
7	2024-07-29	9	Recibos 	1703000.00	2024-07-30 20:04:52.607	2024-07-30 20:04:52.607	1
\.


--
-- TOC entry 3530 (class 0 OID 0)
-- Dependencies: 232
-- Name: buys_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appavicola_admin
--

SELECT pg_catalog.setval('public.buys_id_seq', 14, true);


--
-- TOC entry 3531 (class 0 OID 0)
-- Dependencies: 222
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appavicola_admin
--

SELECT pg_catalog.setval('public.customers_id_seq', 23, true);


--
-- TOC entry 3532 (class 0 OID 0)
-- Dependencies: 238
-- Name: discounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appavicola_admin
--

SELECT pg_catalog.setval('public.discounts_id_seq', 1, true);


--
-- TOC entry 3533 (class 0 OID 0)
-- Dependencies: 236
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appavicola_admin
--

SELECT pg_catalog.setval('public.events_id_seq', 14, true);


--
-- TOC entry 3534 (class 0 OID 0)
-- Dependencies: 218
-- Name: food_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appavicola_admin
--

SELECT pg_catalog.setval('public.food_id_seq', 89, true);


--
-- TOC entry 3535 (class 0 OID 0)
-- Dependencies: 230
-- Name: lote_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appavicola_admin
--

SELECT pg_catalog.setval('public.lote_id_seq', 4, true);


--
-- TOC entry 3536 (class 0 OID 0)
-- Dependencies: 220
-- Name: mortality_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appavicola_admin
--

SELECT pg_catalog.setval('public.mortality_id_seq', 57, true);


--
-- TOC entry 3537 (class 0 OID 0)
-- Dependencies: 234
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appavicola_admin
--

SELECT pg_catalog.setval('public.payments_id_seq', 33, true);


--
-- TOC entry 3538 (class 0 OID 0)
-- Dependencies: 226
-- Name: sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appavicola_admin
--

SELECT pg_catalog.setval('public.sales_id_seq', 80, true);


--
-- TOC entry 3539 (class 0 OID 0)
-- Dependencies: 224
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appavicola_admin
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 9, true);


--
-- TOC entry 3540 (class 0 OID 0)
-- Dependencies: 228
-- Name: supplies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appavicola_admin
--

SELECT pg_catalog.setval('public.supplies_id_seq', 7, true);


--
-- TOC entry 3325 (class 2606 OID 16579)
-- Name: buys buys_pkey; Type: CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.buys
    ADD CONSTRAINT buys_pkey PRIMARY KEY (id);


--
-- TOC entry 3315 (class 2606 OID 16456)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 3331 (class 2606 OID 16655)
-- Name: discounts discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_pkey PRIMARY KEY (id);


--
-- TOC entry 3329 (class 2606 OID 16641)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 3311 (class 2606 OID 16438)
-- Name: food food_pkey; Type: CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.food
    ADD CONSTRAINT food_pkey PRIMARY KEY (id);


--
-- TOC entry 3323 (class 2606 OID 16563)
-- Name: lote lote_pkey; Type: CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.lote
    ADD CONSTRAINT lote_pkey PRIMARY KEY (id);


--
-- TOC entry 3313 (class 2606 OID 16447)
-- Name: mortality mortality_pkey; Type: CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.mortality
    ADD CONSTRAINT mortality_pkey PRIMARY KEY (id);


--
-- TOC entry 3327 (class 2606 OID 16593)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 3319 (class 2606 OID 16520)
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- TOC entry 3317 (class 2606 OID 16465)
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- TOC entry 3321 (class 2606 OID 16549)
-- Name: supplies supplies_pkey; Type: CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.supplies
    ADD CONSTRAINT supplies_pkey PRIMARY KEY (id);


--
-- TOC entry 3338 (class 2606 OID 16580)
-- Name: buys buys_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.buys
    ADD CONSTRAINT buys_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.suppliers(id);


--
-- TOC entry 3342 (class 2606 OID 16656)
-- Name: discounts discounts_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.customers(id);


--
-- TOC entry 3343 (class 2606 OID 16661)
-- Name: discounts discounts_lote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_lote_id_fkey FOREIGN KEY (lote_id) REFERENCES public.lote(id);


--
-- TOC entry 3339 (class 2606 OID 16608)
-- Name: buys fk_lote; Type: FK CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.buys
    ADD CONSTRAINT fk_lote FOREIGN KEY (lote_id) REFERENCES public.lote(id);


--
-- TOC entry 3332 (class 2606 OID 16614)
-- Name: food fk_lote; Type: FK CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.food
    ADD CONSTRAINT fk_lote FOREIGN KEY (lote_id) REFERENCES public.lote(id);


--
-- TOC entry 3333 (class 2606 OID 16620)
-- Name: mortality fk_lote; Type: FK CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.mortality
    ADD CONSTRAINT fk_lote FOREIGN KEY (lote_id) REFERENCES public.lote(id);


--
-- TOC entry 3335 (class 2606 OID 16626)
-- Name: supplies fk_lote; Type: FK CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.supplies
    ADD CONSTRAINT fk_lote FOREIGN KEY (lote_id) REFERENCES public.lote(id);


--
-- TOC entry 3337 (class 2606 OID 16564)
-- Name: lote lote_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.lote
    ADD CONSTRAINT lote_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.suppliers(id);


--
-- TOC entry 3340 (class 2606 OID 16594)
-- Name: payments payments_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.customers(id);


--
-- TOC entry 3341 (class 2606 OID 16599)
-- Name: payments payments_lote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_lote_id_fkey FOREIGN KEY (lote_id) REFERENCES public.lote(id);


--
-- TOC entry 3334 (class 2606 OID 16521)
-- Name: sales sales_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.customers(id);


--
-- TOC entry 3336 (class 2606 OID 16550)
-- Name: supplies supplies_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appavicola_admin
--

ALTER TABLE ONLY public.supplies
    ADD CONSTRAINT supplies_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.suppliers(id);


--
-- TOC entry 3517 (class 0 OID 0)
-- Dependencies: 253
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT blk_read_time double precision, OUT blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT blk_read_time double precision, OUT blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision) TO appavicola_admin;


--
-- TOC entry 3518 (class 0 OID 0)
-- Dependencies: 252
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO appavicola_admin;


--
-- TOC entry 2102 (class 826 OID 16391)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO appavicola_admin;


--
-- TOC entry 2104 (class 826 OID 16393)
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO appavicola_admin;


--
-- TOC entry 2103 (class 826 OID 16392)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO appavicola_admin;


--
-- TOC entry 2101 (class 826 OID 16390)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO appavicola_admin;


-- Completed on 2024-08-13 10:37:17

--
-- PostgreSQL database dump complete
--

