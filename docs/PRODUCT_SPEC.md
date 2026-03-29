# Product Spec — Real Estate Index

## Goal
Build a real estate website that showcases all marketed properties in a clean gallery, lets visitors open a detailed property page, view full information and location, and contact the seller. The system also includes an admin panel for managing property content, images, videos, and publication state.

## Users

### Public visitor
- Browses all properties from the homepage
- Filters properties
- Opens a property page
- Views images, video, specs, and map
- Contacts the seller

### Admin
- Logs into admin panel
- Creates and updates properties
- Uploads and orders images
- Adds video
- Sets coordinates
- Publishes or unpublishes listings
- Reviews inquiries

## Public pages

### Home page
- Hero area
- Gallery of all active properties
- Filters:
  - city
  - property type
  - min/max price
  - bedrooms
- Featured listings
- Latest listings

### Property details page
- Property title
- Gallery
- Price
- Short summary
- Description
- Specs:
  - rooms
  - bathrooms
  - area
  - floor
  - parking
  - balcony
  - status
- Video section
- Map section
- Seller contact form
- Related properties

## Admin pages
- Login
- Dashboard
- Property list
- New property
- Edit property
- Media manager
- Inquiry list

## Core entities
- Property
- PropertyImage
- Inquiry
- AdminUser

## SEO requirements
- Clean slugs
- Dynamic metadata per property
- Open Graph image support
- Sitemap
- Robots.txt
- Index only published properties

## MVP success definition
- Visitor can browse all active properties
- Visitor can open any property page
- Visitor can submit seller inquiry
- Admin can manage listings and media
- Data is stored in PostgreSQL through Prisma
