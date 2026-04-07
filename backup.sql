--
-- PostgreSQL database dump
--

\restrict NGl3vfyNQBRliTy0jc2e1Ev9KReVtEwKaYDt7xI0R6QvUeNNMXVtJsCSlqBS85p

-- Dumped from database version 17.7
-- Dumped by pg_dump version 18.3

-- Started on 2026-04-05 19:08:06

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."Property" DROP CONSTRAINT IF EXISTS "Property_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."Property" DROP CONSTRAINT IF EXISTS "Property_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public."PropertyImage" DROP CONSTRAINT IF EXISTS "PropertyImage_propertyId_fkey";
ALTER TABLE IF EXISTS ONLY public."Project" DROP CONSTRAINT IF EXISTS "Project_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public."ProjectUnit" DROP CONSTRAINT IF EXISTS "ProjectUnit_propertyId_fkey";
ALTER TABLE IF EXISTS ONLY public."ProjectUnit" DROP CONSTRAINT IF EXISTS "ProjectUnit_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."ProjectImage" DROP CONSTRAINT IF EXISTS "ProjectImage_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."ProjectDocument" DROP CONSTRAINT IF EXISTS "ProjectDocument_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."Inquiry" DROP CONSTRAINT IF EXISTS "Inquiry_propertyId_fkey";
ALTER TABLE IF EXISTS ONLY public."Inquiry" DROP CONSTRAINT IF EXISTS "Inquiry_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."InquiryNote" DROP CONSTRAINT IF EXISTS "InquiryNote_inquiryId_fkey";
ALTER TABLE IF EXISTS ONLY public."EmailLog" DROP CONSTRAINT IF EXISTS "EmailLog_inquiryId_fkey";
ALTER TABLE IF EXISTS ONLY public."Appointment" DROP CONSTRAINT IF EXISTS "Appointment_inquiryId_fkey";
ALTER TABLE IF EXISTS ONLY public."ApiClient" DROP CONSTRAINT IF EXISTS "ApiClient_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public."AdminUser" DROP CONSTRAINT IF EXISTS "AdminUser_customerId_fkey";
DROP INDEX IF EXISTS public."Property_slug_key";
DROP INDEX IF EXISTS public."Property_published_status_idx";
DROP INDEX IF EXISTS public."Property_projectId_idx";
DROP INDEX IF EXISTS public."Property_featured_idx";
DROP INDEX IF EXISTS public."Property_customerId_idx";
DROP INDEX IF EXISTS public."Property_city_idx";
DROP INDEX IF EXISTS public."Property_apiEnabled_published_status_idx";
DROP INDEX IF EXISTS public."PropertyImage_propertyId_sortOrder_idx";
DROP INDEX IF EXISTS public."Project_slug_key";
DROP INDEX IF EXISTS public."Project_published_status_idx";
DROP INDEX IF EXISTS public."Project_customerId_idx";
DROP INDEX IF EXISTS public."Project_city_idx";
DROP INDEX IF EXISTS public."Project_apiEnabled_published_status_idx";
DROP INDEX IF EXISTS public."ProjectUnit_propertyId_idx";
DROP INDEX IF EXISTS public."ProjectUnit_projectId_building_entrance_floor_idx";
DROP INDEX IF EXISTS public."ProjectImage_projectId_sortOrder_idx";
DROP INDEX IF EXISTS public."ProjectDocument_projectId_sortOrder_idx";
DROP INDEX IF EXISTS public."Inquiry_status_idx";
DROP INDEX IF EXISTS public."Inquiry_propertyId_createdAt_idx";
DROP INDEX IF EXISTS public."Inquiry_projectId_idx";
DROP INDEX IF EXISTS public."InquiryNote_inquiryId_createdAt_idx";
DROP INDEX IF EXISTS public."HeroImage_active_sortOrder_idx";
DROP INDEX IF EXISTS public."EmailLog_inquiryId_sentAt_idx";
DROP INDEX IF EXISTS public."Customer_companyName_idx";
DROP INDEX IF EXISTS public."Appointment_inquiryId_dateTime_idx";
DROP INDEX IF EXISTS public."ApiClient_tokenHash_key";
DROP INDEX IF EXISTS public."ApiClient_customerId_idx";
DROP INDEX IF EXISTS public."AdminUser_email_key";
DROP INDEX IF EXISTS public."AdminUser_customerId_idx";
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public."SiteSetting" DROP CONSTRAINT IF EXISTS "SiteSetting_pkey";
ALTER TABLE IF EXISTS ONLY public."Property" DROP CONSTRAINT IF EXISTS "Property_pkey";
ALTER TABLE IF EXISTS ONLY public."PropertyImage" DROP CONSTRAINT IF EXISTS "PropertyImage_pkey";
ALTER TABLE IF EXISTS ONLY public."Project" DROP CONSTRAINT IF EXISTS "Project_pkey";
ALTER TABLE IF EXISTS ONLY public."ProjectUnit" DROP CONSTRAINT IF EXISTS "ProjectUnit_pkey";
ALTER TABLE IF EXISTS ONLY public."ProjectImage" DROP CONSTRAINT IF EXISTS "ProjectImage_pkey";
ALTER TABLE IF EXISTS ONLY public."ProjectDocument" DROP CONSTRAINT IF EXISTS "ProjectDocument_pkey";
ALTER TABLE IF EXISTS ONLY public."Inquiry" DROP CONSTRAINT IF EXISTS "Inquiry_pkey";
ALTER TABLE IF EXISTS ONLY public."InquiryNote" DROP CONSTRAINT IF EXISTS "InquiryNote_pkey";
ALTER TABLE IF EXISTS ONLY public."ImageBank" DROP CONSTRAINT IF EXISTS "ImageBank_pkey";
ALTER TABLE IF EXISTS ONLY public."HeroImage" DROP CONSTRAINT IF EXISTS "HeroImage_pkey";
ALTER TABLE IF EXISTS ONLY public."EmailLog" DROP CONSTRAINT IF EXISTS "EmailLog_pkey";
ALTER TABLE IF EXISTS ONLY public."Customer" DROP CONSTRAINT IF EXISTS "Customer_pkey";
ALTER TABLE IF EXISTS ONLY public."Appointment" DROP CONSTRAINT IF EXISTS "Appointment_pkey";
ALTER TABLE IF EXISTS ONLY public."ApiClient" DROP CONSTRAINT IF EXISTS "ApiClient_pkey";
ALTER TABLE IF EXISTS ONLY public."AdminUser" DROP CONSTRAINT IF EXISTS "AdminUser_pkey";
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TABLE IF EXISTS public."SiteSetting";
DROP TABLE IF EXISTS public."PropertyImage";
DROP TABLE IF EXISTS public."Property";
DROP TABLE IF EXISTS public."ProjectUnit";
DROP TABLE IF EXISTS public."ProjectImage";
DROP TABLE IF EXISTS public."ProjectDocument";
DROP TABLE IF EXISTS public."Project";
DROP TABLE IF EXISTS public."InquiryNote";
DROP TABLE IF EXISTS public."Inquiry";
DROP TABLE IF EXISTS public."ImageBank";
DROP TABLE IF EXISTS public."HeroImage";
DROP TABLE IF EXISTS public."EmailLog";
DROP TABLE IF EXISTS public."Customer";
DROP TABLE IF EXISTS public."Appointment";
DROP TABLE IF EXISTS public."ApiClient";
DROP TABLE IF EXISTS public."AdminUser";
DROP TYPE IF EXISTS public."PropertyStatus";
DROP TYPE IF EXISTS public."ProjectStatus";
--
-- TOC entry 883 (class 1247 OID 20584)
-- Name: ProjectStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProjectStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'COMPLETED',
    'ARCHIVED'
);


--
-- TOC entry 865 (class 1247 OID 20511)
-- Name: PropertyStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PropertyStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'SOLD',
    'ARCHIVED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 20519)
-- Name: AdminUser; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AdminUser" (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "allowedPages" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "isSuperAdmin" boolean DEFAULT false NOT NULL,
    "customerId" text,
    phone text,
    "profileImage" text
);


--
-- TOC entry 226 (class 1259 OID 20646)
-- Name: ApiClient; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ApiClient" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "tokenHash" text NOT NULL,
    "tokenPrefix" text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "allowedPropertyFields" jsonb NOT NULL,
    "allowedProjectFields" jsonb NOT NULL,
    "includeImages" boolean DEFAULT false NOT NULL,
    "includeDocuments" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "customerId" text,
    "scopeType" text DEFAULT 'all'::text NOT NULL
);


--
-- TOC entry 229 (class 1259 OID 20684)
-- Name: Appointment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Appointment" (
    id text NOT NULL,
    "inquiryId" text NOT NULL,
    "dateTime" timestamp(3) without time zone NOT NULL,
    summary text NOT NULL,
    status text DEFAULT 'scheduled'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 232 (class 1259 OID 24638)
-- Name: Customer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Customer" (
    id text NOT NULL,
    "companyName" text NOT NULL,
    "logoUrl" text,
    description text,
    "contactName" text,
    "contactEmail" text,
    "contactPhone" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 230 (class 1259 OID 20693)
-- Name: EmailLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EmailLog" (
    id text NOT NULL,
    "inquiryId" text NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    "sentTo" text NOT NULL,
    "sentAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 20660)
-- Name: HeroImage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."HeroImage" (
    id text NOT NULL,
    url text NOT NULL,
    "altText" text,
    active boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 231 (class 1259 OID 20726)
-- Name: ImageBank; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ImageBank" (
    id text NOT NULL,
    url text NOT NULL,
    "altText" text,
    tags text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 20551)
-- Name: Inquiry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Inquiry" (
    id text NOT NULL,
    "propertyId" text NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    phone text,
    message text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "projectId" text,
    status text DEFAULT 'new'::text NOT NULL
);


--
-- TOC entry 228 (class 1259 OID 20676)
-- Name: InquiryNote; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InquiryNote" (
    id text NOT NULL,
    "inquiryId" text NOT NULL,
    content text NOT NULL,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 20593)
-- Name: Project; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Project" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    "shortDescription" text,
    description text NOT NULL,
    city text NOT NULL,
    address text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    "developerName" text NOT NULL,
    "completionDate" text,
    "totalUnits" integer,
    "videoUrl" text,
    "websiteUrl" text,
    status public."ProjectStatus" DEFAULT 'DRAFT'::public."ProjectStatus" NOT NULL,
    published boolean DEFAULT false NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    "metaTitle" text,
    "metaDescription" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "apiEnabled" boolean DEFAULT false NOT NULL,
    "customerId" text
);


--
-- TOC entry 225 (class 1259 OID 20629)
-- Name: ProjectDocument; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProjectDocument" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    url text NOT NULL,
    "fileName" text NOT NULL,
    "fileType" text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 224 (class 1259 OID 20604)
-- Name: ProjectImage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProjectImage" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    url text NOT NULL,
    "altText" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 233 (class 1259 OID 24706)
-- Name: ProjectUnit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProjectUnit" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    building text DEFAULT '1'::text NOT NULL,
    entrance text DEFAULT 'A'::text NOT NULL,
    floor integer DEFAULT 0 NOT NULL,
    "unitNumber" text NOT NULL,
    "propertyId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 20527)
-- Name: Property; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Property" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    "shortDescription" text,
    description text NOT NULL,
    price numeric(14,2) NOT NULL,
    currency text DEFAULT 'EUR'::text NOT NULL,
    city text NOT NULL,
    neighborhood text,
    address text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    "propertyType" text,
    bedrooms integer,
    bathrooms integer,
    "areaSqm" double precision,
    parking boolean DEFAULT false NOT NULL,
    balcony boolean DEFAULT false NOT NULL,
    "videoUrl" text,
    "sellerName" text NOT NULL,
    "sellerEmail" text NOT NULL,
    "sellerPhone" text NOT NULL,
    status public."PropertyStatus" DEFAULT 'DRAFT'::public."PropertyStatus" NOT NULL,
    published boolean DEFAULT false NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    "metaTitle" text,
    "metaDescription" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "websiteUrl" text,
    "projectId" text,
    "apiEnabled" boolean DEFAULT false NOT NULL,
    "customerId" text,
    floor integer,
    "unitNumber" text
);


--
-- TOC entry 220 (class 1259 OID 20541)
-- Name: PropertyImage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PropertyImage" (
    id text NOT NULL,
    "propertyId" text NOT NULL,
    url text NOT NULL,
    "altText" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 222 (class 1259 OID 20576)
-- Name: SiteSetting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SiteSetting" (
    key text NOT NULL,
    value text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 217 (class 1259 OID 20501)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- TOC entry 4487 (class 0 OID 20519)
-- Dependencies: 218
-- Data for Name: AdminUser; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AdminUser" (id, name, email, "passwordHash", "createdAt", "updatedAt", active, "allowedPages", "isSuperAdmin", "customerId", phone, "profileImage") FROM stdin;
cmnk9394g0001l81fvwjk0syn	Robert	Landsworthy100@gmail.com	$2a$10$ghzJlzRQdvHjdGeC5baTuOkDw6E9mj24GY71PQcCCNeXAicI8bzv2	2026-04-04 11:29:55.696	2026-04-04 11:29:55.696	t	["dashboard", "properties", "projects"]	f	cmnk7m5mm0001l51fauznilwd	\N	\N
cmnb2e28p0000s1igz9lyst4e	Avi Arad	avi@oitt.co.il	$2a$10$EGcxpubDdEVwHw//8Nm6..y4Rtuv0KUF8Q4NqxF8oJx3YCdwg6BUe	2026-03-29 04:12:27.097	2026-04-05 11:56:37.769	t	[]	t	\N	\N	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775390190057-feidn3.png
\.


--
-- TOC entry 4495 (class 0 OID 20646)
-- Dependencies: 226
-- Data for Name: ApiClient; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ApiClient" (id, name, description, "tokenHash", "tokenPrefix", active, "allowedPropertyFields", "allowedProjectFields", "includeImages", "includeDocuments", "createdAt", "updatedAt", "customerId", "scopeType") FROM stdin;
cmnkcop9w0003jv1fdmjdr9gs	Landsworthy Real Estate	\N	$2a$10$rnVEI5ulihQ8prHDmNhBueQVggQbOa6fZ1tArwcrVxeuW52w6ytF.	ac7b740c	t	["title", "slug", "shortDescription", "description", "price", "currency", "city", "neighborhood", "address", "latitude", "longitude", "propertyType", "bedrooms", "bathrooms", "areaSqm", "floor", "parking", "balcony", "videoUrl", "websiteUrl", "sellerName", "sellerEmail", "sellerPhone", "status", "featured"]	["title", "slug", "shortDescription", "description", "city", "address", "latitude", "longitude", "developerName", "completionDate", "totalUnits", "videoUrl", "websiteUrl", "status", "featured"]	t	t	2026-04-04 13:10:35.25	2026-04-04 13:18:46.713	cmnk7m5mm0001l51fauznilwd	customer
cmnkcp6dj0001jr1fdzb9yu7u	Avi Test	\N	$2a$10$5GnilfyTmKQhsv3rQKnVqu/21jmGhWBxMJCojkHe0.DWAxi/iEB96	02ee9369	t	["title", "slug", "shortDescription", "description", "price", "currency", "city", "neighborhood", "address", "latitude", "longitude", "propertyType", "bedrooms", "bathrooms", "areaSqm", "floor", "parking", "balcony", "videoUrl", "websiteUrl", "sellerName", "sellerEmail", "sellerPhone", "status", "featured"]	["title", "slug", "shortDescription", "description", "city", "address", "latitude", "longitude", "developerName", "completionDate", "totalUnits", "videoUrl", "websiteUrl", "status", "featured"]	t	t	2026-04-04 13:10:57.415	2026-04-04 13:19:46.218	cmnkcmbth0001jv1fbhyvgfhj	customer
cmnkcpnjc0001ju1fbnj1zery	All Properties and project	\N	$2a$10$r2kEyr3cpLmP1fBfzgO64eiqE5ipPhBqOURVUR598FQveZpq3rHrS	f085939e	t	["title", "slug", "shortDescription", "description", "price", "currency", "city", "neighborhood", "address", "latitude", "longitude", "propertyType", "bedrooms", "bathrooms", "areaSqm", "floor", "parking", "balcony", "videoUrl", "websiteUrl", "sellerName", "sellerEmail", "sellerPhone", "status", "featured"]	["title", "slug", "shortDescription", "description", "city", "address", "latitude", "longitude", "developerName", "completionDate", "totalUnits", "videoUrl", "websiteUrl", "status", "featured"]	t	t	2026-04-04 13:11:19.614	2026-04-04 13:22:42.387	\N	all
\.


--
-- TOC entry 4498 (class 0 OID 20684)
-- Dependencies: 229
-- Data for Name: Appointment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Appointment" (id, "inquiryId", "dateTime", summary, status, "createdAt") FROM stdin;
\.


--
-- TOC entry 4501 (class 0 OID 24638)
-- Dependencies: 232
-- Data for Name: Customer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Customer" (id, "companyName", "logoUrl", description, "contactName", "contactEmail", "contactPhone", "createdAt", "updatedAt") FROM stdin;
cmnk7m5mm0001l51fauznilwd	Landsworthy Real Estate	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775299654481-w43wwo.jpg	Developer based in Larnaca with the following facilities:\n1. Permanent residency for the owner and all his family members.\n2. Cypriot medical card.\n3. Cypriot Bank Account	Robert	Landsworthy100@gmail.com	+357 95 100000	2026-04-04 10:48:38.399	2026-04-04 10:48:38.399
cmnkcmbth0001jv1fbhyvgfhj	Avi Test	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775308105078-z6h4h1.png	\N	Avi Arad	avi.ha@hotmail.com	\N	2026-04-04 13:08:44.501	2026-04-04 13:08:44.501
\.


--
-- TOC entry 4499 (class 0 OID 20693)
-- Dependencies: 230
-- Data for Name: EmailLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."EmailLog" (id, "inquiryId", subject, body, "sentTo", "sentAt") FROM stdin;
\.


--
-- TOC entry 4496 (class 0 OID 20660)
-- Dependencies: 227
-- Data for Name: HeroImage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."HeroImage" (id, url, "altText", active, "sortOrder", "createdAt") FROM stdin;
cmnk53tkz000hle1f8rfs1lof	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775295503696-ieaxbx.jpg	eden-roof	t	5	2026-04-04 09:38:23.748
cmnk558x2000jle1fqr2syqbo	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775295570196-k3ihah.jpeg	WhatsApp Image 2025-11-30 at 12.31.04 (1)	t	6	2026-04-04 09:39:30.279
cmnk55jvn000kle1f86facmkm	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775295584400-nboyqi.jpeg	WhatsApp Image 2025-11-30 at 12.31.05 (1)	t	7	2026-04-04 09:39:44.484
\.


--
-- TOC entry 4500 (class 0 OID 20726)
-- Dependencies: 231
-- Data for Name: ImageBank; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ImageBank" (id, url, "altText", tags, "createdAt") FROM stdin;
cmnk7ksiv0000l51fk9x5hmkm	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775299654481-w43wwo.jpg	Landsworthy		2026-04-04 10:47:34.756
cmnkclx490000jv1fdpcm60fr	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775308105078-z6h4h1.png	Oitt-Logo		2026-04-04 13:08:25.417
cmnlpha6e0000js1fudcbwya7	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775390190057-feidn3.png	BUBU		2026-04-05 11:56:30.236
\.


--
-- TOC entry 4490 (class 0 OID 20551)
-- Dependencies: 221
-- Data for Name: Inquiry; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Inquiry" (id, "propertyId", "fullName", email, phone, message, "createdAt", "projectId", status) FROM stdin;
cmnkcv34q0001kt1f4i30oo7v	cmnb2e35d0003s1igk9h0x7es	sadsad	asdsad@asda.com	3525424	dsfdsfdsfdsf	2026-04-04 13:15:33.147	cmnkcjh3p0001js1ffakj0wte	new
\.


--
-- TOC entry 4497 (class 0 OID 20676)
-- Dependencies: 228
-- Data for Name: InquiryNote; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InquiryNote" (id, "inquiryId", content, "createdBy", "createdAt") FROM stdin;
\.


--
-- TOC entry 4492 (class 0 OID 20593)
-- Dependencies: 223
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Project" (id, title, slug, "shortDescription", description, city, address, latitude, longitude, "developerName", "completionDate", "totalUnits", "videoUrl", "websiteUrl", status, published, featured, "metaTitle", "metaDescription", "createdAt", "updatedAt", "apiEnabled", "customerId") FROM stdin;
cmnk5wyia000xjr1fxjhzv3t1	Iconic	iconic	iCONIC – Your New Home in Aradipou	Your new project in Aradipo	Larnaca	Aradipo	0	0	Worthy Real Estate	Q4 2029	18			ACTIVE	t	t			2026-04-04 10:01:03.106	2026-04-04 13:09:37.894	t	cmnk7m5mm0001l51fauznilwd
cmnk5bkme0000jr1f93h2fz1k	Eden House	eden-house	Eden House – Your New Home in Aradipou	1–3 bedroom apartments in a modern complex with swimming pool, private roof gardens, gym and landscaped gardens – just minutes from Larnaca city and the sea.\nModern layouts for families and professionals – open and bright living spaces.\nEasy access to malls, restaurants, beaches and leading private schools.\nGated community with pool, gym, parking and green walking paths.	Larnaca	Aradipo	34.9251	33.6233	Eran Manzur	Q4 2027	16			ACTIVE	t	t			2026-04-04 09:44:25.38	2026-04-04 13:09:38.838	t	cmnk7m5mm0001l51fauznilwd
cmnkcjh3p0001js1ffakj0wte	Avi Test	avi-test	Modern apartment in a prime urban location	Modern apartment in a prime urban location	Larnaca	City Center	34.9218	33.6232	Avi Test Real Estate		24	https://youtu.be/TQSHVgLDgNY		ACTIVE	t	t			2026-04-04 13:06:31.382	2026-04-04 13:15:06.636	t	cmnkcmbth0001jv1fbhyvgfhj
cmnkf8mzm0001jo1fpuggmxhd	Zamir 12	zamir-12	Zamir 12 – Your New Home in Shikun Vatikim	The best area in the center.\nGardens and parks close to Tel Aviv city	Ramat-Gan	12 Hazamir Street	32.0946	34.8168	Avi Arad	Q4 2027	6			ACTIVE	t	t			2026-04-04 14:22:04.643	2026-04-04 14:27:23.269	t	cmnkcmbth0001jv1fbhyvgfhj
cmnkgqw9o0001ky1ffdq7bhou	sadsadsadsa	sadsadsadsa		sadsadsdsadsad	asdsadsad	asdsadsa	0	0	sadsadsa		0			ACTIVE	t	t			2026-04-04 15:04:16.092	2026-04-04 15:04:16.092	f	\N
cmnkjjhps0001jm1f2xd3lsly	dssfdsfdsfsd	dssfdsfdsfsdsdfds		sdfdsfdsfdsf	sdfdsfdsf	dsfdsf	0	0	sdfdsfdsf		0			ACTIVE	t	t			2026-04-04 16:22:29.489	2026-04-04 16:22:29.489	f	cmnkcmbth0001jv1fbhyvgfhj
\.


--
-- TOC entry 4494 (class 0 OID 20629)
-- Dependencies: 225
-- Data for Name: ProjectDocument; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProjectDocument" (id, "projectId", url, "fileName", "fileType", "sortOrder", "createdAt") FROM stdin;
cmnk5yyyl0003k41fzf3d80hu	cmnk5wyia000xjr1fxjhzv3t1	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775296956734-29x7o7.pdf	plans.pdf	plan	0	2026-04-04 10:02:37.054
\.


--
-- TOC entry 4493 (class 0 OID 20604)
-- Dependencies: 224
-- Data for Name: ProjectImage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProjectImage" (id, "projectId", url, "altText", "sortOrder", "isPrimary", "createdAt") FROM stdin;
cmnk5c8jm0002jr1fdokhrcrq	cmnk5bkme0000jr1f93h2fz1k	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775295896276-gk6pvo.jpg	eden-1	0	t	2026-04-04 09:44:56.387
cmnk5c8w80004jr1fhiapzvdc	cmnk5bkme0000jr1f93h2fz1k	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775295896783-o5539w.jpg	eden-2	1	f	2026-04-04 09:44:56.84
cmnk5c9910006jr1fcs0llxkv	cmnk5bkme0000jr1f93h2fz1k	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775295897243-w8n2dy.jpg	eden-3	2	f	2026-04-04 09:44:57.301
cmnk5c9in0008jr1fi2d67229	cmnk5bkme0000jr1f93h2fz1k	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775295897586-7ag3q2.jpg	eden-hero	3	f	2026-04-04 09:44:57.647
cmnk5c9x9000ajr1fijswp06y	cmnk5bkme0000jr1f93h2fz1k	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775295898086-n36zo4.jpg	eden-int-bath-1	4	f	2026-04-04 09:44:58.173
cmnk5caat000cjr1fvdk4on78	cmnk5bkme0000jr1f93h2fz1k	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775295898599-ifh2u3.jpg	eden-int-bath-2	5	f	2026-04-04 09:44:58.661
cmnk5cb1i000ejr1fztg4zzm5	cmnk5bkme0000jr1f93h2fz1k	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775295899382-9l9ryx.jpg	eden-int-bedroom-1	6	f	2026-04-04 09:44:59.622
cmnk5cbfg000gjr1f910bx16s	cmnk5bkme0000jr1f93h2fz1k	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775295900052-ux5t5u.jpg	eden-int-bedroom-2	7	f	2026-04-04 09:45:00.124
cmnk5cbuk000ijr1fx87dh0e0	cmnk5bkme0000jr1f93h2fz1k	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775295900597-jsq0tl.jpg	eden-int-bedroom-3	8	f	2026-04-04 09:45:00.668
cmnk5cc6q000kjr1fw5t5ou4h	cmnk5bkme0000jr1f93h2fz1k	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775295901050-yn1vks.jpg	eden-int-kitchen-1	9	f	2026-04-04 09:45:01.107
cmnk5cci9000mjr1f7j60zgnj	cmnk5bkme0000jr1f93h2fz1k	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775295901471-ll389s.jpg	eden-pool-1	10	f	2026-04-04 09:45:01.522
cmnk5cctv000ojr1f4y0vz2av	cmnk5bkme0000jr1f93h2fz1k	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775295901880-1g3n8j.jpg	eden-pool-2	11	f	2026-04-04 09:45:01.94
cmnk5cd5d000qjr1f3nyi37wu	cmnk5bkme0000jr1f93h2fz1k	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775295902303-0j0rpt.jpg	eden-roof	12	f	2026-04-04 09:45:02.353
cmnk5cdp3000sjr1fkj0r4hkp	cmnk5bkme0000jr1f93h2fz1k	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775295903009-ilpln9.jpeg	WhatsApp Image 2025-11-30 at 12.31.03 (1)	13	f	2026-04-04 09:45:03.064
cmnk5ce3b000ujr1fb04fiy8l	cmnk5bkme0000jr1f93h2fz1k	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775295903522-fx9wkc.jpeg	WhatsApp Image 2025-11-30 at 12.31.04 (1)	14	f	2026-04-04 09:45:03.575
cmnk5cecv000wjr1f2dm6zdri	cmnk5bkme0000jr1f93h2fz1k	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775295903841-ugsq98.jpeg	WhatsApp Image 2025-11-30 at 12.31.05 (1)	15	f	2026-04-04 09:45:03.92
cmnk5xc13000zjr1fl0sisirb	cmnk5wyia000xjr1fxjhzv3t1	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775296880548-u7g392.jpeg	WhatsApp Image 2025-10-22 at 16.15.46 (1)	0	t	2026-04-04 10:01:20.68
cmnk5xcg70011jr1f9io0hf7j	cmnk5wyia000xjr1fxjhzv3t1	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775296881119-5zgjrt.jpeg	WhatsApp Image 2025-10-22 at 16.15.46	1	f	2026-04-04 10:01:21.223
cmnk5xcuc0013jr1fre0o4wul	cmnk5wyia000xjr1fxjhzv3t1	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775296881677-jupj76.jpeg	WhatsApp Image 2025-10-22 at 16.15.47	2	f	2026-04-04 10:01:21.733
cmnk5xd7s0015jr1fn3uwzjnu	cmnk5wyia000xjr1fxjhzv3t1	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775296882143-dwjn0k.jpeg	WhatsApp Image 2025-10-22 at 16.15.49	3	f	2026-04-04 10:01:22.216
cmnk5xdl30017jr1f2s3hw3lr	cmnk5wyia000xjr1fxjhzv3t1	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775296882632-d44e95.jpeg	WhatsApp Image 2025-10-22 at 16.15.50 (1)	4	f	2026-04-04 10:01:22.696
cmnk5xdwo0019jr1fxiy03i9p	cmnk5wyia000xjr1fxjhzv3t1	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775296883047-flby6f.jpeg	WhatsApp Image 2025-10-22 at 16.15.50 (2)	5	f	2026-04-04 10:01:23.112
cmnk5xe9e001bjr1fxkye0ltg	cmnk5wyia000xjr1fxjhzv3t1	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775296883501-p8fwlg.jpeg	WhatsApp Image 2025-10-22 at 16.15.50	6	f	2026-04-04 10:01:23.571
cmnk5xemk001djr1flkjzs006	cmnk5wyia000xjr1fxjhzv3t1	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775296883971-8l60oz.jpeg	WhatsApp Image 2025-10-22 at 16.15.51 (1)	7	f	2026-04-04 10:01:24.044
cmnk5xf07001fjr1fkrpplcnd	cmnk5wyia000xjr1fxjhzv3t1	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775296884461-p0k00m.jpeg	WhatsApp Image 2025-10-22 at 16.15.51	8	f	2026-04-04 10:01:24.536
cmnk5xfae001hjr1ff1t9djib	cmnk5wyia000xjr1fxjhzv3t1	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775296884851-uwzxro.jpeg	WhatsApp Image 2025-10-22 at 16.20.09	9	f	2026-04-04 10:01:24.903
cmnkckpqr0003js1fx17nf76p	cmnkcjh3p0001js1ffakj0wte	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775308049017-twu77q.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (1)	0	f	2026-04-04 13:07:29.235
cmnkckpzx0005js1fh6fa4sv5	cmnkcjh3p0001js1ffakj0wte	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775308049514-ivxj1x.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (2)	1	f	2026-04-04 13:07:29.565
cmnkckq7p0007js1forf9o8zl	cmnkcjh3p0001js1ffakj0wte	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775308049802-oah5n9.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (3)	2	f	2026-04-04 13:07:29.846
cmnkckqg80009js1fyqfdioum	cmnkcjh3p0001js1ffakj0wte	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775308050105-uep5ji.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (4)	3	f	2026-04-04 13:07:30.153
cmnkckqy0000djs1fnwo2a5w6	cmnkcjh3p0001js1ffakj0wte	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775308050745-edae3z.jpeg	WhatsApp Image 2024-12-15 at 17.27.59	5	f	2026-04-04 13:07:30.792
cmnkcrliz0005jv1fyuakpl4x	cmnkcjh3p0001js1ffakj0wte	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775308370127-as9qdj.jpeg	WhatsApp Image 2025-01-09 at 21.24.25	6	f	2026-04-04 13:12:50.364
cmnkckqp3000bjs1f8l4v8ahr	cmnkcjh3p0001js1ffakj0wte	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775308050419-da9apt.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (5)	4	t	2026-04-04 13:07:30.471
cmnkf96e80003jo1fof3intvq	cmnkf8mzm0001jo1fpuggmxhd	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775312549597-zponqy.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (1)	0	t	2026-04-04 14:22:29.792
cmnkf96pk0005jo1f3oamt03o	cmnkf8mzm0001jo1fpuggmxhd	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775312550149-mmxmsf.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (2)	1	f	2026-04-04 14:22:30.2
cmnkf96xo0007jo1ftze4nwr3	cmnkf8mzm0001jo1fpuggmxhd	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775312550447-9olylc.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (3)	2	f	2026-04-04 14:22:30.493
cmnkf975n0009jo1f35qls14u	cmnkf8mzm0001jo1fpuggmxhd	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775312550729-icnye6.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (4)	3	f	2026-04-04 14:22:30.779
cmnkf97fs000bjo1fl9ffhc7i	cmnkf8mzm0001jo1fpuggmxhd	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775312551078-b41pv9.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (5)	4	f	2026-04-04 14:22:31.144
cmnkf97ob000djo1frz6l85kx	cmnkf8mzm0001jo1fpuggmxhd	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775312551404-acdb08.jpeg	WhatsApp Image 2024-12-15 at 17.27.59	5	f	2026-04-04 14:22:31.452
cmnkgr30a0003ky1fyqa15vfz	cmnkgqw9o0001ky1ffdq7bhou	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775315064658-p6d8z4.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (2)	0	t	2026-04-04 15:04:24.826
cmnkgr3gw0005ky1feycj54yp	cmnkgqw9o0001ky1ffdq7bhou	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775315065382-b1que2.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (3)	1	f	2026-04-04 15:04:25.425
cmnkjjp1k0003jm1fb88bv317	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775319758768-5thpab.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (1)	0	t	2026-04-04 16:22:38.985
cmnkjjpf70005jm1f2mpr6qj5	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775319759421-oa9g03.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (2)	1	f	2026-04-04 16:22:39.475
cmnkjjpoi0007jm1f2ofo9txp	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775319759768-r2o9rh.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (3)	2	f	2026-04-04 16:22:39.81
cmnkjjpwa0009jm1flug1wvpp	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775319760043-bdign6.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (4)	3	f	2026-04-04 16:22:40.091
cmnkjjq51000bjm1fln2pt194	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775319760353-g6x2uh.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (5)	4	f	2026-04-04 16:22:40.406
cmnkjjqcy000djm1fqg6825gf	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775319760642-gact5l.jpeg	WhatsApp Image 2024-12-15 at 17.27.59	5	f	2026-04-04 16:22:40.69
cmnl0ho930001l51fev6py1k9	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775348217773-pwetuc.jpg	eden-hero	6	f	2026-04-05 00:16:58.12
cmnl0hyeh0001la1fycdvxlo2	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775348230932-vmpbgm.jpg	eden-3	7	f	2026-04-05 00:17:11.274
cmnl0i8lf0003la1fvg1wvgbq	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775348244387-s7q1yu.jpg	eden-1	8	f	2026-04-05 00:17:24.483
cmnl0ilk40005la1fnuw3robw	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775348261184-i7pwez.jpeg	WhatsApp Image 2025-11-30 at 12.31.03 (1)	9	f	2026-04-05 00:17:41.285
cmnl0j6u60007la1f66zg1w49	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775348288769-jvoa2p.jpg	eden-3	10	f	2026-04-05 00:18:08.862
cmnldccyj0001ky1fgk9fizql	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775369805011-ywms5m.jpg	eden-1	11	f	2026-04-05 06:16:45.211
cmnldckid0003ky1fqob80qgt	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775369814853-1jk3yi.jpg	eden-3	12	f	2026-04-05 06:16:54.998
cmnldd0df0005ky1f0b5vrppu	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775369835460-f43uuu.jpg	eden-1	13	f	2026-04-05 06:17:15.555
cmnldd87n0007ky1fbtnlmvks	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775369845631-8zcmiv.jpg	eden-hero	14	f	2026-04-05 06:17:25.715
cmnlddk4q0009ky1fgmpibfu2	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775369861086-9x52uv.jpeg	WhatsApp Image 2025-11-30 at 12.31.03 (1)	15	f	2026-04-05 06:17:41.162
cmnlienqz0001l21f3w6un3wk	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775378310413-cvi2kn.jpg	eden-hero	16	f	2026-04-05 08:38:30.587
cmnlieuvj0003l21f1fsuia12	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775378319736-n9t60j.jpg	eden-3	17	f	2026-04-05 08:38:39.823
cmnlif1rl0005l21fj8ijm5u2	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775378328547-hzoo8o.jpg	eden-1	18	f	2026-04-05 08:38:48.753
cmnlifch20007l21fid2xsio0	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775378342472-oajy94.jpeg	WhatsApp Image 2025-11-30 at 12.31.03 (1)	19	f	2026-04-05 08:39:02.631
cmnligkcw0001l51fx97efy75	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775378399312-ntkgc6.jpg	eden-hero	20	f	2026-04-05 08:39:59.504
cmnligpmm0003l51fznkus8pm	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775378406237-hk96s5.jpg	eden-3	21	f	2026-04-05 08:40:06.335
cmnliguwo0005l51f66xzi4sl	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775378413071-jgtxas.jpg	eden-1	22	f	2026-04-05 08:40:13.176
cmnlih1l10007l51fk78sya5s	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775378421735-mjfjk6.jpeg	WhatsApp Image 2025-11-30 at 12.31.03 (1)	23	f	2026-04-05 08:40:21.83
cmnljc7ds0001l41fqo9416rr	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775379875451-w8sptn.jpg	eden-hero	24	f	2026-04-05 09:04:35.681
cmnljch660003l41fh5ckeu8g	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775379888270-v2mipq.jpg	eden-3	25	f	2026-04-05 09:04:48.366
cmnljcq260005l41fapdlkhp2	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775379899790-4413t4.jpg	eden-1	26	f	2026-04-05 09:04:59.887
cmnljd2ch0007l41fy0ui1hlk	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775379915727-npzcz0.jpeg	WhatsApp Image 2025-11-30 at 12.31.03 (1)	27	f	2026-04-05 09:05:15.81
cmnlk1dw30001la1f42vsexjh	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775381050147-7mcn0j.jpg	eden-hero	28	f	2026-04-05 09:24:10.516
cmnlk1n650003la1f6ey23oke	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775381062327-r08cr8.jpg	eden-3	29	f	2026-04-05 09:24:22.541
cmnlk1tbg0005la1fg4ybvbcd	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775381070327-e4ntu8.jpg	eden-1	30	f	2026-04-05 09:24:30.508
cmnlk20ue0007la1fsufulxrz	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775381080164-hsv1xr.jpeg	WhatsApp Image 2025-11-30 at 12.31.03 (1)	31	f	2026-04-05 09:24:40.263
cmnlksiwf0001jp1fakvjbipm	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775382316370-vtetjr.jpg	eden-hero	32	f	2026-04-05 09:45:16.719
cmnlksont0003jp1fqh1xqz7t	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775382324007-d9w6ne.jpg	eden-3	33	f	2026-04-05 09:45:24.186
cmnlkstzh0005jp1fdfo5opvm	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775382330977-8k5ucm.jpg	eden-1	34	f	2026-04-05 09:45:31.086
cmnlkt3ir0007jp1fplqmftmz	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775382343351-btgfqt.jpeg	WhatsApp Image 2025-11-30 at 12.31.03 (1)	35	f	2026-04-05 09:45:43.444
cmnll9pvc0001jo1fhpesjinp	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775383118690-ru8ba1.jpg	eden-hero	36	f	2026-04-05 09:58:38.905
cmnll9sij0003jo1f9qrc8ufk	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775383122250-qm9t7b.jpg	eden-3	37	f	2026-04-05 09:58:42.331
cmnll9w4t0005jo1fvcw0k7ct	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775383126966-436fex.jpg	eden-1	38	f	2026-04-05 09:58:47.022
cmnlla4990007jo1fqx4fwwt8	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775383137429-tfga4b.jpeg	WhatsApp Image 2025-11-30 at 12.31.03 (1)	39	f	2026-04-05 09:58:57.549
cmnllawkn0009jo1f5adp57ov	cmnkjjhps0001jm1f2xd3lsly	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775383174150-hebq9f.jpg	eden-hero	40	f	2026-04-05 09:59:34.248
\.


--
-- TOC entry 4502 (class 0 OID 24706)
-- Dependencies: 233
-- Data for Name: ProjectUnit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProjectUnit" (id, "projectId", building, entrance, floor, "unitNumber", "propertyId", "createdAt", "updatedAt") FROM stdin;
cmnkgnozw0001l61fyazh1gt5	cmnkf8mzm0001jo1fpuggmxhd	1	A	0	2	\N	2026-04-04 15:01:46.7	2026-04-04 15:01:46.7
cmnkgnozw0004l61fktjfuce3	cmnkf8mzm0001jo1fpuggmxhd	1	A	2	5	\N	2026-04-04 15:01:46.7	2026-04-04 15:01:46.7
cmnkgnozw0005l61ff99ti9y0	cmnkf8mzm0001jo1fpuggmxhd	1	A	2	6	\N	2026-04-04 15:01:46.7	2026-04-04 15:01:46.7
cmnkgnozw0006l61fnw10bxoo	cmnkf8mzm0001jo1fpuggmxhd	1	B	0	7	\N	2026-04-04 15:01:46.7	2026-04-04 15:01:46.7
cmnkgnozw0007l61fy6q2js7w	cmnkf8mzm0001jo1fpuggmxhd	1	B	0	8	\N	2026-04-04 15:01:46.7	2026-04-04 15:01:46.7
cmnkgnozw0008l61fj14jzfbb	cmnkf8mzm0001jo1fpuggmxhd	1	B	1	9	\N	2026-04-04 15:01:46.7	2026-04-04 15:01:46.7
cmnkgnozw0009l61f6ose8zvk	cmnkf8mzm0001jo1fpuggmxhd	1	B	1	10	\N	2026-04-04 15:01:46.7	2026-04-04 15:01:46.7
cmnkgnozw000al61fh8wkmkve	cmnkf8mzm0001jo1fpuggmxhd	1	B	2	11	\N	2026-04-04 15:01:46.7	2026-04-04 15:01:46.7
cmnkgnozw000bl61fmifx58or	cmnkf8mzm0001jo1fpuggmxhd	1	B	2	12	\N	2026-04-04 15:01:46.7	2026-04-04 15:01:46.7
cmnkgpi8f000cl61fmqfas9n1	cmnkf8mzm0001jo1fpuggmxhd	1	A	3	301	\N	2026-04-04 15:03:11.246	2026-04-04 15:03:11.246
cmnkgpi8f000dl61f6xphrqru	cmnkf8mzm0001jo1fpuggmxhd	1	A	3	302	\N	2026-04-04 15:03:11.246	2026-04-04 15:03:11.246
cmnkgpl4b000el61fxvdmy5bu	cmnkf8mzm0001jo1fpuggmxhd	1	A	4	401	\N	2026-04-04 15:03:14.987	2026-04-04 15:03:14.987
cmnkgpl4b000fl61fyzpbadyc	cmnkf8mzm0001jo1fpuggmxhd	1	A	4	402	\N	2026-04-04 15:03:14.987	2026-04-04 15:03:14.987
cmnkivyog0000l51feqk6yglf	cmnkgqw9o0001ky1ffdq7bhou	1	B	0	001	\N	2026-04-04 16:04:11.728	2026-04-04 16:04:11.728
cmnkivyog0001l51f3id4i8ht	cmnkgqw9o0001ky1ffdq7bhou	1	B	0	002	\N	2026-04-04 16:04:11.728	2026-04-04 16:04:11.728
cmnkivyog0002l51fspz5id7e	cmnkgqw9o0001ky1ffdq7bhou	1	B	0	003	\N	2026-04-04 16:04:11.728	2026-04-04 16:04:11.728
cmnkiy3rx000al51f0jg37xhs	cmnkgqw9o0001ky1ffdq7bhou	1	A	1	103	\N	2026-04-04 16:05:51.645	2026-04-04 16:05:51.645
cmnkiy3rx000bl51fnjvpzxxl	cmnkgqw9o0001ky1ffdq7bhou	1	A	1	104	\N	2026-04-04 16:05:51.645	2026-04-04 16:05:51.645
cmnkiy7ns000cl51f45vtx7gp	cmnkgqw9o0001ky1ffdq7bhou	1	C	1	101	\N	2026-04-04 16:05:56.68	2026-04-04 16:05:56.68
cmnkiy7ns000dl51f1bv5ae03	cmnkgqw9o0001ky1ffdq7bhou	1	C	1	102	\N	2026-04-04 16:05:56.68	2026-04-04 16:05:56.68
cmnkiy7ns000el51fs7lbvup5	cmnkgqw9o0001ky1ffdq7bhou	1	C	1	103	\N	2026-04-04 16:05:56.68	2026-04-04 16:05:56.68
cmnkiy7ns000fl51faaa2p8o7	cmnkgqw9o0001ky1ffdq7bhou	1	C	1	104	\N	2026-04-04 16:05:56.68	2026-04-04 16:05:56.68
cmnkiyfst000gl51fe8vxeoml	cmnkgqw9o0001ky1ffdq7bhou	1	C	2	201	\N	2026-04-04 16:06:07.228	2026-04-04 16:06:07.228
cmnkiyfst000hl51fs8kz9mds	cmnkgqw9o0001ky1ffdq7bhou	1	C	2	202	\N	2026-04-04 16:06:07.228	2026-04-04 16:06:07.228
cmnkiyfst000il51fll0cm2bu	cmnkgqw9o0001ky1ffdq7bhou	1	C	2	203	\N	2026-04-04 16:06:07.228	2026-04-04 16:06:07.228
cmnkiyfst000jl51ft65ron6q	cmnkgqw9o0001ky1ffdq7bhou	1	C	2	204	\N	2026-04-04 16:06:07.228	2026-04-04 16:06:07.228
cmnkiyivq000kl51fr1squnip	cmnkgqw9o0001ky1ffdq7bhou	1	C	3	301	\N	2026-04-04 16:06:11.222	2026-04-04 16:06:11.222
cmnkiyivq000ll51fbk90croq	cmnkgqw9o0001ky1ffdq7bhou	1	C	3	302	\N	2026-04-04 16:06:11.222	2026-04-04 16:06:11.222
cmnkiyivq000ml51f3t26xe8d	cmnkgqw9o0001ky1ffdq7bhou	1	C	3	303	\N	2026-04-04 16:06:11.222	2026-04-04 16:06:11.222
cmnkiyivq000nl51fc3va49xs	cmnkgqw9o0001ky1ffdq7bhou	1	C	3	304	\N	2026-04-04 16:06:11.222	2026-04-04 16:06:11.222
cmnkiy3rx0008l51f0w4nssgd	cmnkgqw9o0001ky1ffdq7bhou	1	A	1	101	cmnkj19og000pl51fj0nz4q2h	2026-04-04 16:05:51.645	2026-04-04 16:08:19.661
cmnkj27ru000ql51fwbj3f9ic	cmnkgqw9o0001ky1ffdq7bhou	1	B	1	101	\N	2026-04-04 16:09:03.449	2026-04-04 16:09:03.449
cmnkj27ru000rl51f58sjd8ot	cmnkgqw9o0001ky1ffdq7bhou	1	B	1	102	\N	2026-04-04 16:09:03.449	2026-04-04 16:09:03.449
cmnkj27ru000sl51f69i3333l	cmnkgqw9o0001ky1ffdq7bhou	1	B	1	103	\N	2026-04-04 16:09:03.449	2026-04-04 16:09:03.449
cmnkj4t0k0001lb1ft7e0pc58	cmnkgqw9o0001ky1ffdq7bhou	1	B	1	104	\N	2026-04-04 16:11:04.293	2026-04-04 16:11:04.293
cmnkkmk290008kz1fqnzk5wfk	cmnkjjhps0001jm1f2xd3lsly	1	A	0	1	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk290009kz1fnkq5i52l	cmnkjjhps0001jm1f2xd3lsly	1	A	0	2	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000akz1f4wqz919h	cmnkjjhps0001jm1f2xd3lsly	1	A	1	3	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000bkz1f8ns9eemu	cmnkjjhps0001jm1f2xd3lsly	1	A	1	4	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000ckz1fngln13ik	cmnkjjhps0001jm1f2xd3lsly	1	A	2	5	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000dkz1f3xs9nhvs	cmnkjjhps0001jm1f2xd3lsly	1	A	2	6	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000ekz1fd0gp4f2z	cmnkjjhps0001jm1f2xd3lsly	1	A	3	7	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000fkz1fhpb4cmgo	cmnkjjhps0001jm1f2xd3lsly	1	A	3	8	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000gkz1flvvk5ydu	cmnkjjhps0001jm1f2xd3lsly	1	B	0	9	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000hkz1fs90rsvyn	cmnkjjhps0001jm1f2xd3lsly	1	B	0	10	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000ikz1fpkgq4vk3	cmnkjjhps0001jm1f2xd3lsly	1	B	1	11	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000jkz1frl93bq0l	cmnkjjhps0001jm1f2xd3lsly	1	B	1	12	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000kkz1fqboe5xdp	cmnkjjhps0001jm1f2xd3lsly	1	B	2	13	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000lkz1f4q2kmdlj	cmnkjjhps0001jm1f2xd3lsly	1	B	2	14	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000mkz1frw5yr33j	cmnkjjhps0001jm1f2xd3lsly	1	B	3	15	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000nkz1fiwsr3clf	cmnkjjhps0001jm1f2xd3lsly	1	B	3	16	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000okz1fc4tgzu0z	cmnkjjhps0001jm1f2xd3lsly	1	C	0	17	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000pkz1fpk63ojhn	cmnkjjhps0001jm1f2xd3lsly	1	C	0	18	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000qkz1fturdo7y0	cmnkjjhps0001jm1f2xd3lsly	1	C	1	19	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000rkz1f444tdal3	cmnkjjhps0001jm1f2xd3lsly	1	C	1	20	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000skz1fjjt9o94e	cmnkjjhps0001jm1f2xd3lsly	1	C	2	21	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000tkz1ffe5hy45u	cmnkjjhps0001jm1f2xd3lsly	1	C	2	22	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000ukz1f2k4eruqh	cmnkjjhps0001jm1f2xd3lsly	1	C	3	23	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000vkz1fgpp8ipih	cmnkjjhps0001jm1f2xd3lsly	1	C	3	24	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000wkz1ft61u7ndk	cmnkjjhps0001jm1f2xd3lsly	1	D	0	25	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000xkz1f30kq8ffi	cmnkjjhps0001jm1f2xd3lsly	1	D	0	26	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000ykz1fz3wi5l1w	cmnkjjhps0001jm1f2xd3lsly	1	D	1	27	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk290010kz1f4nrseru5	cmnkjjhps0001jm1f2xd3lsly	1	D	2	29	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk290011kz1f5ytycpav	cmnkjjhps0001jm1f2xd3lsly	1	D	2	30	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkgnozw0000l61fmznhwa0y	cmnkf8mzm0001jo1fpuggmxhd	1	A	0	1	\N	2026-04-04 15:01:46.7	2026-04-04 17:21:12.688
cmnkgnozw0002l61fimpu8jdp	cmnkf8mzm0001jo1fpuggmxhd	1	A	1	3	cmnkff5di0003lb1fgoru84fn	2026-04-04 15:01:46.7	2026-04-04 17:47:45.457
cmnkgnozw0003l61fh5yb4ye6	cmnkf8mzm0001jo1fpuggmxhd	1	A	1	4	cmnkfdo240001lb1f7axdzbyv	2026-04-04 15:01:46.7	2026-04-04 17:47:51.943
cmnkkmk290012kz1fjvm5wiow	cmnkjjhps0001jm1f2xd3lsly	1	D	3	31	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk290013kz1f1pjlgxoh	cmnkjjhps0001jm1f2xd3lsly	1	D	3	32	\N	2026-04-04 16:52:52.113	2026-04-04 16:52:52.113
cmnkkmk29000zkz1f3ay0q56l	cmnkjjhps0001jm1f2xd3lsly	1	D	1	28	cmnkkes7n0001kz1fdj5esxaa	2026-04-04 16:52:52.113	2026-04-04 16:53:28.526
cmnkzshig0001js1fdvedcocc	cmnkf8mzm0001jo1fpuggmxhd	2	A	0	1	\N	2026-04-04 23:57:22.984	2026-04-04 23:57:43.804
cmnkzsiyv0003js1fjf0zja9v	cmnkf8mzm0001jo1fpuggmxhd	2	A	0	2	\N	2026-04-04 23:57:24.872	2026-04-04 23:57:45.321
cmnkzsl2v0005js1fwbbn4yca	cmnkf8mzm0001jo1fpuggmxhd	2	A	0	3	\N	2026-04-04 23:57:27.608	2026-04-04 23:57:47.467
cmnkzs8580001ky1f8j03lms2	cmnkf8mzm0001jo1fpuggmxhd	2	A	0	4	\N	2026-04-04 23:57:10.833	2026-04-04 23:57:51.318
\.


--
-- TOC entry 4488 (class 0 OID 20527)
-- Dependencies: 219
-- Data for Name: Property; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Property" (id, title, slug, "shortDescription", description, price, currency, city, neighborhood, address, latitude, longitude, "propertyType", bedrooms, bathrooms, "areaSqm", parking, balcony, "videoUrl", "sellerName", "sellerEmail", "sellerPhone", status, published, featured, "metaTitle", "metaDescription", "createdAt", "updatedAt", "websiteUrl", "projectId", "apiEnabled", "customerId", floor, "unitNumber") FROM stdin;
cmnkff5di0003lb1fgoru84fn	3-Bedroom Penthouse	3-bedroom-penthouse		asdsadsadsadd	278000.00	EUR	Ramat-Gan		Hazamir 12	34.9056	33.6232	1st floor	3	3	98	t	t		Sales Office	sales@example.com	+357-99-123456	ACTIVE	t	f			2026-04-04 14:27:08.407	2026-04-04 14:28:05.412		cmnkf8mzm0001jo1fpuggmxhd	f	\N	3	301B
cmnb2e35d0002s1igc0l7rp2e	Modern City Apartment	modern-city-apartment	Modern apartment in a prime urban location	Bright apartment near cafes, shopping, and transit. Ideal for living or investment.	285000.00	EUR	Nicosia	Center	City Center	35.1856	33.3823	Apartment	2	2	88	t	t		Sales Office	sales@example.com	+357-99-123456	ACTIVE	t	t	Modern City Apartment	Modern apartment in a prime city location.	2026-03-29 04:12:28.273	2026-04-04 13:02:52.653		cmnk5wyia000xjr1fxjhzv3t1	t	\N	3	\N
cmnb2e35d0001s1igrdbod6ba	Sea View Penthouse	sea-view-penthouse	Large penthouse overlooking the sea	Premium three-bedroom penthouse with wide open sea views, large terrace, high finish level, and parking.	820000.00	EUR	Larnaca	Skala	Skala Area, Larnaca	34.9056	33.6232	Penthouse	3	2	146	t	t	https://example.com/video/sea-view-penthouse	Sales Office	sales@example.com	+357-99-123456	ACTIVE	t	t	Sea View Penthouse in Larnaca	Premium penthouse for sale in Larnaca with sea views.	2026-03-29 04:12:28.273	2026-04-04 13:09:11.263	\N	cmnkcjh3p0001js1ffakj0wte	t	\N	5	\N
cmnb2e35d0003s1igk9h0x7es	Garden Duplex Residence	garden-duplex-residence	Spacious duplex with private garden	Luxurious four-bedroom duplex featuring a large private garden, modern kitchen, double parking, and quiet residential neighborhood. Perfect for families.	465000.00	EUR	Limassol	Mesa Geitonia	Residential Quarter, Limassol	34.6841	33.0379	Duplex	4	3	172	t	t		Sales Office	sales@example.com	+357-99-123456	ACTIVE	t	t	Garden Duplex in Limassol	Spacious duplex for sale in Limassol with private garden.	2026-03-29 04:12:28.273	2026-04-04 14:18:49.215		cmnkcjh3p0001js1ffakj0wte	t	\N	2	201A
cmnk5gbqi0001l51f1wcz5z8a	2 Bed Apartment	2-bed-apartment	Spacious duplex with private garden	Diverse apartment mix\n1, 2 and 3 bedroom apartments with functional layouts, open-plan living rooms, modern kitchens and generous balconies or private gardens.	230000.00	EUR	Larnaca	Mesa Geitonia	Aradipo	34.9056	33.6232	Apartment	2	1	78	t	t	https://youtu.be/TQSHVgLDgNY	Arad Real Estate	info@aradre.com	+972544519999	ACTIVE	t	t	Garden Duplex in Limassol	Spacious duplex for sale in Limassol with private garden.	2026-04-04 09:48:07.146	2026-04-04 14:19:27.167		cmnk5bkme0000jr1f93h2fz1k	t	\N	2	201A
cmnkfbnsv0001jv1fnhyhgyzd	2-Bedroom Apr	2-bedroom-apr		Nice appartment	190000.00	Shekel	Ramat-Gan		Hazamir 12	34.9056	33.6232	Gound Floor	4	3	87	t	t		Sales Office	sales@example.com	+357-99-123456	ACTIVE	t	t			2026-04-04 14:24:25.663	2026-04-04 14:24:48.892		cmnkf8mzm0001jo1fpuggmxhd	f	\N	0	
cmnkfdo240001lb1f7axdzbyv	3-Bedroom Apr	3-bedroom-apr	\N	sadsadsadsada	250000.00	EUR	Ramat-Gan	\N	Hazamir 12	34.9056	33.6232	1st floor	3	3	120	t	t	\N	Sales Office	sales@example.com	+357-99-123456	ACTIVE	t	f	\N	\N	2026-04-04 14:25:59.308	2026-04-04 14:25:59.308	\N	cmnkf8mzm0001jo1fpuggmxhd	f	\N	3	\N
cmnkj19og000pl51fj0nz4q2h	sdfds	sdfds	\N	dsadsadsadsadsa	435435435.00	EUR	fdgfdg	\N	dfgfdg	34.9056	33.6232		0	0	0	t	t	\N	dfgfdgfd	dsgfds@dsdsada.com	4354543545	ACTIVE	t	f	\N	\N	2026-04-04 16:08:19.264	2026-04-04 16:08:19.264	\N	cmnkgqw9o0001ky1ffdq7bhou	f	\N	1	101
cmnkkes7n0001kz1fdj5esxaa	22222222222222	222222222222223		dsfsfdsfdsf	324343.00	EUR	dsafsadda		dsffdsds	0	0		0	0	0	t	t		dsfd	sdfds@fdads.com	4323242	ACTIVE	t	t			2026-04-04 16:46:49.428	2026-04-04 16:53:22.64		cmnkjjhps0001jm1f2xd3lsly	f	cmnkcmbth0001jv1fbhyvgfhj	0	
cmnkltdzy0001l51frxhn55y8	999999999999	dsfdssf		dsfsfsfgds	454353535.00	EUR	dsfdsfs		sdfsd	34.9056	33.6232		0	0	0	t	t		sdfdsfdsf	fdsf@dssad.com	5345353	ACTIVE	t	t			2026-04-04 17:26:10.462	2026-04-04 17:26:24.743		cmnkf8mzm0001jo1fpuggmxhd	f	\N	0	
\.


--
-- TOC entry 4489 (class 0 OID 20541)
-- Dependencies: 220
-- Data for Name: PropertyImage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PropertyImage" (id, "propertyId", url, "altText", "sortOrder", "isPrimary", "createdAt") FROM stdin;
cmnb2e4270004s1igj1wxygsh	cmnb2e35d0001s1igrdbod6ba	https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80	Penthouse exterior with sea view	0	t	2026-03-29 04:12:29.455
cmnb2e4270005s1igbyj5dxwf	cmnb2e35d0001s1igrdbod6ba	https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80	Modern living room	1	f	2026-03-29 04:12:29.455
cmnb2e4270006s1igjm12eiqn	cmnb2e35d0001s1igrdbod6ba	https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80	Spacious terrace	2	f	2026-03-29 04:12:29.455
cmnb2e4270007s1igmk3lfayr	cmnb2e35d0001s1igrdbod6ba	https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80	Luxury bedroom	3	f	2026-03-29 04:12:29.455
cmnb2e4270008s1ignme4pmn3	cmnb2e35d0001s1igrdbod6ba	https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&q=80	Designer bathroom	4	f	2026-03-29 04:12:29.455
cmnb2e4mg0009s1igd0aqwovs	cmnb2e35d0002s1igc0l7rp2e	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Bright apartment living room	0	t	2026-03-29 04:12:30.184
cmnb2e4mg000as1ig29vi1cdx	cmnb2e35d0002s1igc0l7rp2e	https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80	Modern apartment interior	1	f	2026-03-29 04:12:30.184
cmnb2e4mg000bs1igwm0j4fxw	cmnb2e35d0002s1igc0l7rp2e	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Contemporary kitchen	2	f	2026-03-29 04:12:30.184
cmnb2e4mg000cs1igly9ybl72	cmnb2e35d0002s1igc0l7rp2e	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80	Cozy bedroom	3	f	2026-03-29 04:12:30.184
cmnb2e56p000ds1igte9uu0nj	cmnb2e35d0003s1igk9h0x7es	https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80	Duplex exterior with garden	0	t	2026-03-29 04:12:30.913
cmnb2e56p000es1igec1ylix8	cmnb2e35d0003s1igk9h0x7es	https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80	Open plan living area	1	f	2026-03-29 04:12:30.913
cmnb2e56p000fs1iguo9v7n5c	cmnb2e35d0003s1igk9h0x7es	https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80	Modern kitchen	2	f	2026-03-29 04:12:30.913
cmnb2e56p000gs1ig4bj6xavf	cmnb2e35d0003s1igk9h0x7es	https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80	Garden view	3	f	2026-03-29 04:12:30.913
cmnb2e56p000hs1ig5gn61ty9	cmnb2e35d0003s1igk9h0x7es	https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80	Master bedroom	4	f	2026-03-29 04:12:30.913
cmnk5ifn00003l51f4a9d6zn2	cmnk5gbqi0001l51f1wcz5z8a	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775296185320-t6ea9h.jpg	eden-1	0	t	2026-04-04 09:49:45.516
cmnk5ig5i0005l51falibmec4	cmnk5gbqi0001l51f1wcz5z8a	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775296186089-k6y9b1.jpg	eden-int-bath-1	1	f	2026-04-04 09:49:46.182
cmnk5igov0007l51f48hupzc4	cmnk5gbqi0001l51f1wcz5z8a	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775296186665-a34slv.jpg	eden-int-bedroom-1	2	f	2026-04-04 09:49:46.88
cmnk5igza0009l51fy59u941i	cmnk5gbqi0001l51f1wcz5z8a	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775296187201-bdho30.jpg	eden-roof	3	f	2026-04-04 09:49:47.254
cmnk5ihd0000bl51f8vwci1kf	cmnk5gbqi0001l51f1wcz5z8a	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775296187684-8x5393.jpeg	WhatsApp Image 2025-11-30 at 12.31.03 (2)	4	f	2026-04-04 09:49:47.748
cmnkfc0xs0003jv1ff140829p	cmnkfbnsv0001jv1fnhyhgyzd	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775312682502-ia8562.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (1)	0	t	2026-04-04 14:24:42.688
cmnkfc18z0005jv1f4o3qsyxd	cmnkfbnsv0001jv1fnhyhgyzd	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775312683044-5njwyh.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (2)	1	f	2026-04-04 14:24:43.091
cmnkffvit0001kz1fzsayfy1p	cmnkff5di0003lb1fgoru84fn	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775312862113-us062q.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (1)	0	t	2026-04-04 14:27:42.293
cmnkffvzv0003kz1fl5qicima	cmnkff5di0003lb1fgoru84fn	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775312862864-dzymg9.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (2)	1	f	2026-04-04 14:27:42.907
cmnkffw7n0005kz1f5fyuod2i	cmnkff5di0003lb1fgoru84fn	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775312863150-gztdnr.jpeg	WhatsApp Image 2024-12-15 at 17.27.59 (3)	2	f	2026-04-04 14:27:43.187
cmnkkf0xz0003kz1f0a76yl1c	cmnkkes7n0001kz1fdj5esxaa	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775321220534-jhnlb2.jpg	eden-1	0	t	2026-04-04 16:47:00.743
cmnkkf18t0005kz1fqa6t8767	cmnkkes7n0001kz1fdj5esxaa	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775321221077-h1kv8i.jpg	eden-2	1	f	2026-04-04 16:47:01.133
cmnkkf1hv0007kz1fpwib2w51	cmnkkes7n0001kz1fdj5esxaa	https://aradre-assets.s3.eu-north-1.amazonaws.com/uploads/1775321221405-nbio7r.jpg	eden-3	2	f	2026-04-04 16:47:01.459
\.


--
-- TOC entry 4491 (class 0 OID 20576)
-- Dependencies: 222
-- Data for Name: SiteSetting; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SiteSetting" (key, value, "updatedAt") FROM stdin;
\.


--
-- TOC entry 4486 (class 0 OID 20501)
-- Dependencies: 217
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
9da0b344-6ef3-4bff-ac33-b5ca33470b0b	75c6294c1dd836f71babec1d43097fb779deed7333efafc05c93581984ac9543	2026-04-03 23:25:36.796814+00	20260329001039_init	\N	\N	2026-04-03 23:25:36.177818+00	1
b1a56a59-ab4d-438c-b4b0-718a3a211fd8	67be28352601cdf661d115d612095d0926c7483c3322deeed8baea5dc0070329	2026-04-04 12:20:24.180279+00	20260404121245_add_api_client_scope	\N	\N	2026-04-04 12:20:24.105275+00	1
6a70e915-d2e7-44f5-a7a9-8393668e4be8	06b4ab5eaa6a950adfa2328a978e3e250bd1138546ac30fd4103999430d98728	2026-04-03 23:25:37.436346+00	20260329083357_add_site_settings	\N	\N	2026-04-03 23:25:36.975783+00	1
70b1835e-df12-4636-a181-b69a29bd1755	f85b170bd70d561dbe61797fdbfc3caf910e89661260e4555ff8d09dedb63347	2026-04-03 23:25:38.076498+00	20260329185009_add_website_url	\N	\N	2026-04-03 23:25:37.6103+00	1
5c4de9e0-6565-4787-aa0a-69132744d277	c6ef167045dd28400971225442e2a95b0781d1b319573b63911adf62a2a33d9b	2026-04-03 23:25:38.757871+00	20260329211815_add_projects	\N	\N	2026-04-03 23:25:38.263642+00	1
9f1b09a6-674e-4c5f-95b2-312e66d7d6d4	3e7552d7e6682cdc462130a7f0efda47574c4d2e90abd85daeaa22e434af57e8	2026-04-04 14:10:49.095542+00	20260404140000_change_floor_to_int_add_unit_number	\N	\N	2026-04-04 14:10:49.024514+00	1
0ba06aa2-2cb2-4440-8c82-a6ad205e8fcf	a4b1aac652a9dad6c6198c4587cdfc60a88d47e6b6dbde549edb707bc52b9fef	2026-04-03 23:25:39.439415+00	20260329214344_add_project_documents	\N	\N	2026-04-03 23:25:38.945671+00	1
336e1340-ce7c-4dd7-b7b5-ef4e2244e21e	39d6e2f83f2787a749d56a2a0f555c820d5b7c7a16ba14ab809a4d07ebdcd56a	2026-04-03 23:25:40.088231+00	20260329223209_add_api_system	\N	\N	2026-04-03 23:25:39.616213+00	1
a3c50b5a-c631-4a8e-95b6-785eb7e8b847	9b16af126772ac79de9157cbf5ab4623f70e469fbabd593b1bcf45dfc1d01be7	2026-04-03 23:25:40.7751+00	20260329232022_add_hero_images	\N	\N	2026-04-03 23:25:40.264199+00	1
658d33e7-989f-4871-932f-6cb534663865	4a18ec0547401a1d2189b0b83badbf700af4b2df7f3e5cca37915c2f5bd35310	2026-04-04 14:57:37.672422+00	20260404160000_add_project_units	\N	\N	2026-04-04 14:57:37.55258+00	1
c6c0c025-c28a-4b31-82ec-e5637a54c5c9	12a2c2e05395394c85345c9d215d4880c42418d65bff16f640c83f658906dcbf	2026-04-03 23:25:41.434154+00	20260329232829_add_user_permissions	\N	\N	2026-04-03 23:25:40.95715+00	1
e8343247-1409-4570-baa5-08512a032076	139088cc5cc7441ceb73146b07e5f00907e4e2296c50caddeaddea74056a0e07	2026-04-03 23:25:42.156763+00	20260329234018_add_crm_models	\N	\N	2026-04-03 23:25:41.615947+00	1
28d716d5-07a8-4053-8aea-1c15fba704b9	99a89504a8ad19481b2dbaceaaf63b32be6a0febbcbd3eee70bfd059a53fcc77	2026-04-03 23:25:42.814319+00	20260330000627_add_image_bank	\N	\N	2026-04-03 23:25:42.35752+00	1
b200c182-d925-4944-8e80-5346774809bb	ed8b79f5e5eb7f273ea7f03222a80efd72b31213e36d2771aabea3a1f164ba4d	2026-04-04 17:00:24.321372+00	20260404180000_allow_multi_unit_property_link	\N	\N	2026-04-04 17:00:24.285175+00	1
30f3409c-d859-4221-8f55-c193078f4afa	e3efe8803e84609f6dff16dec0d6bf83cf153e6871e8a54744d939ca8e5f43ba	2026-04-04 10:42:27.4601+00	20260404103543_add_customers	\N	\N	2026-04-04 10:42:27.317707+00	1
1afb907d-9c0a-4d1a-a020-cadb70cbd711	dfca007b650e9f046507204c56a14222ae708404148d6768d87fec32cc96cb3a	2026-04-04 11:00:07.945445+00	20260404105212_add_customer_relations	\N	\N	2026-04-04 11:00:07.855719+00	1
846fa9c3-64c5-4219-adde-e749eb70ab42	fa17d13209c67639694ba4286923e47d067880ffe018cac5db413867a1b00160	2026-04-04 11:22:29.647918+00	20260404110922_add_customer_manager_role	\N	\N	2026-04-04 11:22:29.595685+00	1
984193bb-ed5f-4507-814f-77fb77311d56	3980b90ad7322844a072b681f45d15a1d846f721bd7202751fde0ff0c9c14b51	2026-04-05 11:46:07.362146+00	20260405114005_add_phone_profileimage_to_adminuser	\N	\N	2026-04-05 11:46:07.336844+00	1
\.


--
-- TOC entry 4268 (class 2606 OID 20526)
-- Name: AdminUser AdminUser_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminUser"
    ADD CONSTRAINT "AdminUser_pkey" PRIMARY KEY (id);


--
-- TOC entry 4303 (class 2606 OID 20656)
-- Name: ApiClient ApiClient_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApiClient"
    ADD CONSTRAINT "ApiClient_pkey" PRIMARY KEY (id);


--
-- TOC entry 4313 (class 2606 OID 20692)
-- Name: Appointment Appointment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_pkey" PRIMARY KEY (id);


--
-- TOC entry 4321 (class 2606 OID 24645)
-- Name: Customer Customer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_pkey" PRIMARY KEY (id);


--
-- TOC entry 4316 (class 2606 OID 20700)
-- Name: EmailLog EmailLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailLog"
    ADD CONSTRAINT "EmailLog_pkey" PRIMARY KEY (id);


--
-- TOC entry 4307 (class 2606 OID 20669)
-- Name: HeroImage HeroImage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."HeroImage"
    ADD CONSTRAINT "HeroImage_pkey" PRIMARY KEY (id);


--
-- TOC entry 4318 (class 2606 OID 20733)
-- Name: ImageBank ImageBank_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ImageBank"
    ADD CONSTRAINT "ImageBank_pkey" PRIMARY KEY (id);


--
-- TOC entry 4310 (class 2606 OID 20683)
-- Name: InquiryNote InquiryNote_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InquiryNote"
    ADD CONSTRAINT "InquiryNote_pkey" PRIMARY KEY (id);


--
-- TOC entry 4282 (class 2606 OID 20558)
-- Name: Inquiry Inquiry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inquiry"
    ADD CONSTRAINT "Inquiry_pkey" PRIMARY KEY (id);


--
-- TOC entry 4299 (class 2606 OID 20637)
-- Name: ProjectDocument ProjectDocument_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProjectDocument"
    ADD CONSTRAINT "ProjectDocument_pkey" PRIMARY KEY (id);


--
-- TOC entry 4296 (class 2606 OID 20613)
-- Name: ProjectImage ProjectImage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProjectImage"
    ADD CONSTRAINT "ProjectImage_pkey" PRIMARY KEY (id);


--
-- TOC entry 4323 (class 2606 OID 24716)
-- Name: ProjectUnit ProjectUnit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProjectUnit"
    ADD CONSTRAINT "ProjectUnit_pkey" PRIMARY KEY (id);


--
-- TOC entry 4292 (class 2606 OID 20603)
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- TOC entry 4279 (class 2606 OID 20550)
-- Name: PropertyImage PropertyImage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PropertyImage"
    ADD CONSTRAINT "PropertyImage_pkey" PRIMARY KEY (id);


--
-- TOC entry 4274 (class 2606 OID 20540)
-- Name: Property Property_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Property"
    ADD CONSTRAINT "Property_pkey" PRIMARY KEY (id);


--
-- TOC entry 4287 (class 2606 OID 20582)
-- Name: SiteSetting SiteSetting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SiteSetting"
    ADD CONSTRAINT "SiteSetting_pkey" PRIMARY KEY (key);


--
-- TOC entry 4264 (class 2606 OID 20509)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4265 (class 1259 OID 24659)
-- Name: AdminUser_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminUser_customerId_idx" ON public."AdminUser" USING btree ("customerId");


--
-- TOC entry 4266 (class 1259 OID 20559)
-- Name: AdminUser_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AdminUser_email_key" ON public."AdminUser" USING btree (email);


--
-- TOC entry 4301 (class 1259 OID 24672)
-- Name: ApiClient_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApiClient_customerId_idx" ON public."ApiClient" USING btree ("customerId");


--
-- TOC entry 4304 (class 1259 OID 20657)
-- Name: ApiClient_tokenHash_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ApiClient_tokenHash_key" ON public."ApiClient" USING btree ("tokenHash");


--
-- TOC entry 4311 (class 1259 OID 20702)
-- Name: Appointment_inquiryId_dateTime_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Appointment_inquiryId_dateTime_idx" ON public."Appointment" USING btree ("inquiryId", "dateTime");


--
-- TOC entry 4319 (class 1259 OID 24646)
-- Name: Customer_companyName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Customer_companyName_idx" ON public."Customer" USING btree ("companyName");


--
-- TOC entry 4314 (class 1259 OID 20703)
-- Name: EmailLog_inquiryId_sentAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "EmailLog_inquiryId_sentAt_idx" ON public."EmailLog" USING btree ("inquiryId", "sentAt");


--
-- TOC entry 4305 (class 1259 OID 20670)
-- Name: HeroImage_active_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "HeroImage_active_sortOrder_idx" ON public."HeroImage" USING btree (active, "sortOrder");


--
-- TOC entry 4308 (class 1259 OID 20701)
-- Name: InquiryNote_inquiryId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InquiryNote_inquiryId_createdAt_idx" ON public."InquiryNote" USING btree ("inquiryId", "createdAt");


--
-- TOC entry 4283 (class 1259 OID 20704)
-- Name: Inquiry_projectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Inquiry_projectId_idx" ON public."Inquiry" USING btree ("projectId");


--
-- TOC entry 4284 (class 1259 OID 20565)
-- Name: Inquiry_propertyId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Inquiry_propertyId_createdAt_idx" ON public."Inquiry" USING btree ("propertyId", "createdAt");


--
-- TOC entry 4285 (class 1259 OID 20705)
-- Name: Inquiry_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Inquiry_status_idx" ON public."Inquiry" USING btree (status);


--
-- TOC entry 4300 (class 1259 OID 20638)
-- Name: ProjectDocument_projectId_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProjectDocument_projectId_sortOrder_idx" ON public."ProjectDocument" USING btree ("projectId", "sortOrder");


--
-- TOC entry 4297 (class 1259 OID 20617)
-- Name: ProjectImage_projectId_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProjectImage_projectId_sortOrder_idx" ON public."ProjectImage" USING btree ("projectId", "sortOrder");


--
-- TOC entry 4324 (class 1259 OID 24718)
-- Name: ProjectUnit_projectId_building_entrance_floor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProjectUnit_projectId_building_entrance_floor_idx" ON public."ProjectUnit" USING btree ("projectId", building, entrance, floor);


--
-- TOC entry 4325 (class 1259 OID 24719)
-- Name: ProjectUnit_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProjectUnit_propertyId_idx" ON public."ProjectUnit" USING btree ("propertyId");


--
-- TOC entry 4288 (class 1259 OID 20658)
-- Name: Project_apiEnabled_published_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Project_apiEnabled_published_status_idx" ON public."Project" USING btree ("apiEnabled", published, status);


--
-- TOC entry 4289 (class 1259 OID 20615)
-- Name: Project_city_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Project_city_idx" ON public."Project" USING btree (city);


--
-- TOC entry 4290 (class 1259 OID 24647)
-- Name: Project_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Project_customerId_idx" ON public."Project" USING btree ("customerId");


--
-- TOC entry 4293 (class 1259 OID 20616)
-- Name: Project_published_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Project_published_status_idx" ON public."Project" USING btree (published, status);


--
-- TOC entry 4294 (class 1259 OID 20614)
-- Name: Project_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Project_slug_key" ON public."Project" USING btree (slug);


--
-- TOC entry 4280 (class 1259 OID 20564)
-- Name: PropertyImage_propertyId_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyImage_propertyId_sortOrder_idx" ON public."PropertyImage" USING btree ("propertyId", "sortOrder");


--
-- TOC entry 4269 (class 1259 OID 20659)
-- Name: Property_apiEnabled_published_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_apiEnabled_published_status_idx" ON public."Property" USING btree ("apiEnabled", published, status);


--
-- TOC entry 4270 (class 1259 OID 20561)
-- Name: Property_city_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_city_idx" ON public."Property" USING btree (city);


--
-- TOC entry 4271 (class 1259 OID 24648)
-- Name: Property_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_customerId_idx" ON public."Property" USING btree ("customerId");


--
-- TOC entry 4272 (class 1259 OID 20563)
-- Name: Property_featured_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_featured_idx" ON public."Property" USING btree (featured);


--
-- TOC entry 4275 (class 1259 OID 20618)
-- Name: Property_projectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_projectId_idx" ON public."Property" USING btree ("projectId");


--
-- TOC entry 4276 (class 1259 OID 20562)
-- Name: Property_published_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_published_status_idx" ON public."Property" USING btree (published, status);


--
-- TOC entry 4277 (class 1259 OID 20560)
-- Name: Property_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Property_slug_key" ON public."Property" USING btree (slug);


--
-- TOC entry 4326 (class 2606 OID 24660)
-- Name: AdminUser AdminUser_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminUser"
    ADD CONSTRAINT "AdminUser_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4335 (class 2606 OID 24673)
-- Name: ApiClient ApiClient_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApiClient"
    ADD CONSTRAINT "ApiClient_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4337 (class 2606 OID 20716)
-- Name: Appointment Appointment_inquiryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES public."Inquiry"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4338 (class 2606 OID 20721)
-- Name: EmailLog EmailLog_inquiryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailLog"
    ADD CONSTRAINT "EmailLog_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES public."Inquiry"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4336 (class 2606 OID 20711)
-- Name: InquiryNote InquiryNote_inquiryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InquiryNote"
    ADD CONSTRAINT "InquiryNote_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES public."Inquiry"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4330 (class 2606 OID 20706)
-- Name: Inquiry Inquiry_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inquiry"
    ADD CONSTRAINT "Inquiry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4331 (class 2606 OID 20571)
-- Name: Inquiry Inquiry_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inquiry"
    ADD CONSTRAINT "Inquiry_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4334 (class 2606 OID 20639)
-- Name: ProjectDocument ProjectDocument_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProjectDocument"
    ADD CONSTRAINT "ProjectDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4333 (class 2606 OID 20624)
-- Name: ProjectImage ProjectImage_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProjectImage"
    ADD CONSTRAINT "ProjectImage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4339 (class 2606 OID 24720)
-- Name: ProjectUnit ProjectUnit_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProjectUnit"
    ADD CONSTRAINT "ProjectUnit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4340 (class 2606 OID 24725)
-- Name: ProjectUnit ProjectUnit_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProjectUnit"
    ADD CONSTRAINT "ProjectUnit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4332 (class 2606 OID 24654)
-- Name: Project Project_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4329 (class 2606 OID 20566)
-- Name: PropertyImage PropertyImage_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PropertyImage"
    ADD CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4327 (class 2606 OID 24649)
-- Name: Property Property_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Property"
    ADD CONSTRAINT "Property_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4328 (class 2606 OID 20619)
-- Name: Property Property_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Property"
    ADD CONSTRAINT "Property_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE SET NULL;


-- Completed on 2026-04-05 19:08:20

--
-- PostgreSQL database dump complete
--

\unrestrict NGl3vfyNQBRliTy0jc2e1Ev9KReVtEwKaYDt7xI0R6QvUeNNMXVtJsCSlqBS85p

