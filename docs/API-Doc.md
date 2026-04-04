# AradRE Real Estate API Documentation

## Base URL

```
https://www.aradre.com/api/v1
```

## Authentication

All requests require a Bearer token in the `Authorization` header. You receive this token from the AradRE admin when your API client is created.

```
Authorization: Bearer YOUR_API_TOKEN
```

If the token is missing or invalid, you will receive a `401 Unauthorized` response:

```json
{ "error": "Unauthorized" }
```

---

## Endpoints

### 1. Get Properties

```
GET /api/v1/properties
```

Returns all published properties that are enabled for API access.

#### Query Parameters (all optional)

| Parameter      | Type   | Description                                          |
|----------------|--------|------------------------------------------------------|
| `city`         | string | Filter by city name (case-insensitive, partial match) |
| `propertyType` | string | Filter by type: Apartment, Penthouse, Duplex, etc.   |
| `page`         | number | Page number (default: 1)                              |
| `limit`        | number | Results per page (default: 50, max: 100)              |

#### Example Requests

```bash
# Get all properties
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://www.aradre.com/api/v1/properties

# Filter by city
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://www.aradre.com/api/v1/properties?city=Larnaca"

# Filter by type with pagination
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://www.aradre.com/api/v1/properties?propertyType=Apartment&page=1&limit=10"
```

#### Example Response

```json
{
  "data": [
    {
      "id": "abc123def456...",
      "title": "Sea View Penthouse",
      "slug": "sea-view-penthouse",
      "shortDescription": "Large penthouse overlooking the sea",
      "description": "Premium three-bedroom penthouse with wide open sea views, large terrace, high finish level, and parking.",
      "price": 820000,
      "currency": "EUR",
      "city": "Larnaca",
      "neighborhood": "Skala",
      "address": "Skala Area, Larnaca",
      "latitude": 34.9056,
      "longitude": 33.6232,
      "propertyType": "Penthouse",
      "bedrooms": 3,
      "bathrooms": 2,
      "areaSqm": 146,
      "floor": "5",
      "parking": true,
      "balcony": true,
      "videoUrl": "https://youtube.com/watch?v=...",
      "websiteUrl": "https://example.com",
      "sellerName": "Sales Office",
      "sellerEmail": "sales@example.com",
      "sellerPhone": "+357-99-123456",
      "status": "ACTIVE",
      "featured": true,
      "images": [
        {
          "url": "https://example.com/image1.jpg",
          "altText": "Living room",
          "isPrimary": true
        },
        {
          "url": "https://example.com/image2.jpg",
          "altText": "Terrace view",
          "isPrimary": false
        }
      ],
      "project": {
        "id": "def456ghi789...",
        "title": "Eden Project",
        "slug": "eden-project"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 4,
    "totalPages": 1
  }
}
```

---

### 2. Get Projects

```
GET /api/v1/projects
```

Returns all published projects that are enabled for API access, including their linked properties, images, and documents.

#### Example Request

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://www.aradre.com/api/v1/projects
```

#### Example Response

```json
{
  "data": [
    {
      "id": "def456ghi789...",
      "title": "Eden Project",
      "slug": "eden-project",
      "shortDescription": "Luxury residential complex in Larnaca",
      "description": "A premium development featuring modern apartments with high-quality finishes, landscaped gardens, and covered parking.",
      "city": "Larnaca",
      "address": "Aradipo, Larnaca",
      "latitude": 34.9056,
      "longitude": 33.6232,
      "developerName": "Manzur Eran",
      "completionDate": "Q4 2027",
      "totalUnits": 16,
      "videoUrl": "https://youtube.com/watch?v=...",
      "websiteUrl": "https://example.com",
      "status": "ACTIVE",
      "featured": true,
      "images": [
        {
          "url": "https://example.com/project-exterior.jpg",
          "altText": "Building exterior",
          "isPrimary": true
        }
      ],
      "documents": [
        {
          "url": "https://example.com/floorplan-2bed.pdf",
          "fileName": "floor-plan-2bed.pdf",
          "fileType": "plan"
        },
        {
          "url": "https://example.com/brochure.pdf",
          "fileName": "project-brochure.pdf",
          "fileType": "brochure"
        }
      ],
      "properties": [
        {
          "id": "abc123def456...",
          "title": "2-Bedroom Apartment",
          "slug": "eden-2-3-bedroom-apt",
          "price": 230000,
          "currency": "EUR",
          "city": "Larnaca",
          "bedrooms": 2,
          "bathrooms": 1,
          "areaSqm": 70,
          "images": [
            {
              "url": "https://example.com/apt-kitchen.jpg",
              "altText": "Kitchen",
              "isPrimary": true
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Response Codes

| Code | Meaning                                    |
|------|--------------------------------------------|
| 200  | Success                                    |
| 401  | Unauthorized — invalid or missing token    |

---

## Important Notes

### Field Availability

The fields returned in the response depend on your API client configuration. When the admin creates your API token, they select which fields your client can access. If a field is missing from the response, it was not enabled for your client.

The `id` field is always included in every object.

### Images

Images are included only if the "Include Images" option is enabled for your API client. Each image object contains:

| Field       | Type    | Description                  |
|-------------|---------|------------------------------|
| `url`       | string  | Direct URL to the image file |
| `altText`   | string  | Description of the image     |
| `isPrimary` | boolean | Whether this is the main image |

Images are sorted by display order. The primary image appears first.

### Documents

Documents (floor plans, brochures, PDFs) are included only if the "Include Documents" option is enabled for your API client. Each document object contains:

| Field      | Type   | Description                              |
|------------|--------|------------------------------------------|
| `url`      | string | Direct URL to download the file          |
| `fileName` | string | Original file name                       |
| `fileType` | string | Category: `plan`, `brochure`, or `other` |

### Nested Properties in Projects

The `/api/v1/projects` endpoint includes a `properties` array with all published, API-enabled properties linked to each project. These properties are filtered using the same field permissions as the `/api/v1/properties` endpoint.

### Data Freshness

All responses include `Cache-Control: no-store`. Data is always fetched live from the database.

### Visibility Rules

Only properties and projects that meet **all** of the following criteria are returned:
- **Published** by the admin
- **Status** is ACTIVE
- **API Enabled** flag is turned ON

---

## Property Fields Reference

| Field              | Type    | Description                        |
|--------------------|---------|------------------------------------|
| `id`               | string  | Unique identifier (always included)|
| `title`            | string  | Property title                     |
| `slug`             | string  | URL-friendly identifier            |
| `shortDescription` | string  | Brief summary                      |
| `description`      | string  | Full description                   |
| `price`            | number  | Price in the specified currency     |
| `currency`         | string  | Currency code (e.g. EUR)           |
| `city`             | string  | City name                          |
| `neighborhood`     | string  | Neighborhood name                  |
| `address`          | string  | Full address                       |
| `latitude`         | number  | GPS latitude                       |
| `longitude`        | number  | GPS longitude                      |
| `propertyType`     | string  | Type: Apartment, Penthouse, etc.   |
| `bedrooms`         | number  | Number of bedrooms                 |
| `bathrooms`        | number  | Number of bathrooms                |
| `areaSqm`          | number  | Area in square meters              |
| `floor`            | string  | Floor number or description        |
| `parking`          | boolean | Has parking                        |
| `balcony`          | boolean | Has balcony                        |
| `videoUrl`         | string  | Video tour URL                     |
| `websiteUrl`       | string  | External website URL               |
| `sellerName`       | string  | Contact person name                |
| `sellerEmail`      | string  | Contact email                      |
| `sellerPhone`      | string  | Contact phone number               |
| `status`           | string  | ACTIVE, SOLD, etc.                 |
| `featured`         | boolean | Featured listing flag              |

## Project Fields Reference

| Field            | Type    | Description                        |
|------------------|---------|------------------------------------|
| `id`             | string  | Unique identifier (always included)|
| `title`          | string  | Project title                      |
| `slug`           | string  | URL-friendly identifier            |
| `shortDescription` | string | Brief summary                    |
| `description`    | string  | Full description                   |
| `city`           | string  | City name                          |
| `address`        | string  | Full address                       |
| `latitude`       | number  | GPS latitude                       |
| `longitude`      | number  | GPS longitude                      |
| `developerName`  | string  | Developer or builder name          |
| `completionDate` | string  | Expected completion (e.g. Q4 2027) |
| `totalUnits`     | number  | Total number of units in project   |
| `videoUrl`       | string  | Video tour URL                     |
| `websiteUrl`     | string  | External website URL               |
| `status`         | string  | ACTIVE, COMPLETED, etc.            |
| `featured`       | boolean | Featured project flag              |

---

## Code Examples

### JavaScript (fetch)

```javascript
const API_URL = 'https://www.aradre.com/api/v1';
const TOKEN = 'YOUR_API_TOKEN';

// Get all properties
async function getProperties(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_URL}/properties?${params}`, {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// Get properties filtered by city
const { data, pagination } = await getProperties({ city: 'Larnaca', limit: '10' });
console.log(`Found ${pagination.total} properties`);
data.forEach(property => {
  console.log(`${property.title} - €${property.price}`);
});

// Get all projects with their apartments
async function getProjects() {
  const response = await fetch(`${API_URL}/projects`, {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });
  return response.json();
}

const { data: projects } = await getProjects();
projects.forEach(project => {
  console.log(`${project.title} (${project.properties?.length ?? 0} units)`);
});
```

### Python (requests)

```python
import requests

API_URL = 'https://www.aradre.com/api/v1'
TOKEN = 'YOUR_API_TOKEN'
HEADERS = {'Authorization': f'Bearer {TOKEN}'}

# Get all properties
response = requests.get(f'{API_URL}/properties', headers=HEADERS)
result = response.json()

for prop in result['data']:
    print(f"{prop['title']} - €{prop.get('price', 'N/A')}")

print(f"Page {result['pagination']['page']} of {result['pagination']['totalPages']}")

# Get properties in a specific city
response = requests.get(
    f'{API_URL}/properties',
    headers=HEADERS,
    params={'city': 'Larnaca', 'limit': 10}
)

# Get all projects
response = requests.get(f'{API_URL}/projects', headers=HEADERS)
projects = response.json()['data']

for project in projects:
    units = len(project.get('properties', []))
    print(f"{project['title']} - {units} apartments")
```

### PHP (cURL)

```php
<?php
$apiUrl = 'https://www.aradre.com/api/v1';
$token = 'YOUR_API_TOKEN';

function apiRequest($endpoint, $params = []) {
    global $apiUrl, $token;

    $url = $apiUrl . $endpoint;
    if (!empty($params)) {
        $url .= '?' . http_build_query($params);
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_HTTPHEADER => ["Authorization: Bearer $token"],
        CURLOPT_RETURNTRANSFER => true,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception("API error: HTTP $httpCode");
    }

    return json_decode($response, true);
}

// Get all properties
$result = apiRequest('/properties');
foreach ($result['data'] as $property) {
    echo $property['title'] . ' - €' . $property['price'] . "\n";
}

// Get properties by city
$result = apiRequest('/properties', ['city' => 'Larnaca', 'limit' => 10]);

// Get all projects
$result = apiRequest('/projects');
foreach ($result['data'] as $project) {
    $units = count($project['properties'] ?? []);
    echo $project['title'] . " - $units apartments\n";
}
?>
```

### C# (.NET HttpClient)

```csharp
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;

var client = new HttpClient();
client.BaseAddress = new Uri("https://www.aradre.com/api/v1/");
client.DefaultRequestHeaders.Authorization =
    new AuthenticationHeaderValue("Bearer", "YOUR_API_TOKEN");

// Get properties
var response = await client.GetAsync("properties?city=Larnaca");
response.EnsureSuccessStatusCode();

var json = await response.Content.ReadAsStringAsync();
var result = JsonSerializer.Deserialize<JsonElement>(json);

foreach (var property in result.GetProperty("data").EnumerateArray())
{
    Console.WriteLine($"{property.GetProperty("title")} - €{property.GetProperty("price")}");
}

// Get projects
var projectResponse = await client.GetAsync("projects");
var projectJson = await projectResponse.Content.ReadAsStringAsync();
```

---

## Support

For API access, token issues, or questions, contact the AradRE admin team.
