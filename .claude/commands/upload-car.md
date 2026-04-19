# Upload Car Listing

Use this skill when the user pastes car listing details and wants them saved to the backend.

## Supabase project
Project ID: `tgeqaadacfwmfvweqlss`

## Field mapping

Map the pasted listing fields to database columns as follows:

| Listing field | DB column | Notes |
|---|---|---|
| Title | make, model, variant, year, body_type | Parse: `{year} {make} {model} {body} {variant}` |
| Price | price | Strip `$`, commas, and ` Excl. Govt. Charges` → integer |
| Kilometers | kilometres | Strip commas → integer |
| Colour | colour | Store as-is |
| Transmission | transmission | Map to `'Automatic'` or `'Manual'` |
| Fuel | fuel_type | Map to `'Petrol'`, `'Diesel'`, `'Hybrid'`, or `'Electric'` |
| Body | body_type | Map to schema enum: Sedan, SUV, Coupé, Convertible, Wagon, Hatchback, Ute |
| Cylinders | cylinders | e.g. `T4` |
| Engine Size | engine | Combine with Engine Type: `{size} {type}` e.g. `2.0L TURBO DIRECT F/INJ` |
| Engine Capacity | engine_capacity | Integer (cc), e.g. `1969` |
| Engine Type | engine | Combined into engine field with Engine Size |
| VIN | vin | Store as-is |
| Reg Plate | reg_plate | Store as-is |
| Reg Expiry | reg_expiry | Store as-is (DD/MM/YYYY) |
| Seat Capacity | seats | Integer |
| Doors | doors | Integer |
| Stock Number | stock_number | Store as-is (text) |
| Short Description | short_description | Store as-is |

## Transmission mapping
- Contains `AUTOMATIC` → `'Automatic'`
- Contains `MANUAL` → `'Manual'`

## Fuel type mapping
- Contains `Petrol` or `ULP` → `'Petrol'`
- Contains `Diesel` → `'Diesel'`
- Contains `Hybrid` or `MHEV` or `PHEV` → `'Hybrid'`
- Contains `Electric` or `EV` → `'Electric'`

## Body type mapping
- `WAGON` → `'Wagon'`
- `SEDAN` → `'Sedan'`
- `SUV` or `4WD` → `'SUV'`
- `HATCHBACK` or `HATCH` → `'Hatchback'`
- `COUPE` or `COUPÉ` → `'Coupé'`
- `CONVERTIBLE` or `CABRIOLET` → `'Convertible'`
- `UTE` or `UTILITY` → `'Ute'`

## Features

The Features section uses a predefined checkbox list defined in `STANDARD_FEATURES` in `/lib/constants.ts`.

**Step 1 — Match standard features**: For each item in the pasted Features list, check if it maps to a predefined standard feature name. Common mappings:

| Pasted feature | Standard feature |
|---|---|
| Blind Spot Information System | Blind Spot Monitoring |
| Forward Collision Mitigation | Autonomous Emergency Braking |
| Dual Front Airbags Package | Dual Front Airbags |
| Airbag - Knee Driver | Driver Knee Airbag |
| Instrument Cluster Display - * Inch | Digital Instrument Cluster |
| Multi-media System with * Touchscreen | Touchscreen Infotainment |
| High Performance Sound System | Premium Sound System |
| Digital Audio Broadcast Radio | DAB Digital Radio |
| Remote Engine Start System | Remote Start |
| Surround Camera System | Surround View Camera |
| Park Assist Front & Rear | Park Assist (Front & Rear) |
| Road Sign Information | Traffic Sign Recognition |
| Tyre Pressure Monitoring System | Tyre Pressure Monitoring |
| Wireless Phone Charge | Wireless Charging |
| USB Input Socket / USB Charging Port* | USB Ports |
| Voice Recognition System | Voice Recognition |
| Power front seat Driver/memory | Power Driver Seat + Driver Memory Seat |
| Power front seat Passenger | Power Passenger Seat |
| Power Lumbar Support Driver * | Power Lumbar Support (Driver) |
| Power Lumbar Support Passenger * | Power Lumbar Support (Passenger) |
| Auto Climate Control with Dual Temp Zones | Auto Climate Control + Dual Zone Climate Control |
| Rain Sensor | Rain Sensing Wipers |
| Gloss Black Roof Rails / Roof Rails * | Roof Rails |
| Trailer Module Preparation | Tow Bar Preparation |
| Bluetooth Connectivity | Bluetooth |
| 20 Inch Alloy Wheels | 20 Inch Alloy Wheels |
| LED Headlights | LED Headlights |
| Adaptive Cruise Control | Adaptive Cruise Control |
| Cross Traffic Alert | Cross Traffic Alert |
| Curtain Airbags | Curtain Airbags |
| Side Airbags | Side Airbags |
| Hill Descent Control | Hill Descent Control |
| Hill Start Assist | Hill Start Assist |
| Lane Keeping Assist | Lane Keeping Assist |
| Rear Collision Warning | Rear Collision Warning |
| Traffic Jam Assist | Traffic Jam Assist |
| Keyless Entry | Keyless Entry |
| Power Tailgate | Power Tailgate |
| Telematics | Telematics |

**Step 2 — Store**: Save only the matched standard feature names (not the raw pasted names) in the `features` array. Any pasted feature that has no standard match is discarded (not stored as custom).

## Workflow

### 1. Check if vehicle already exists
```sql
SELECT id, slug FROM vehicles WHERE stock_number = '{stock_number}' OR vin = '{vin}';
```

### 2a. If vehicle exists — UPDATE
```sql
UPDATE vehicles SET
  make = '...', model = '...', variant = '...', year = ..., price = ...,
  kilometres = ..., colour = '...', transmission = '...', body_type = '...',
  engine = '...', engine_capacity = ..., cylinders = '...', fuel_type = '...',
  seats = ..., doors = ..., short_description = '...',
  stock_number = '...', vin = '...', reg_plate = '...', reg_expiry = '...',
  features = ARRAY['...', '...']
WHERE id = '...';
```

### 2b. If vehicle does not exist — INSERT
Generate a slug: `{year}-{make}-{model}-{variant}` lowercased, spaces→hyphens, special chars removed.
Check for slug uniqueness and append `-2`, `-3` etc. if needed.

```sql
INSERT INTO vehicles (slug, make, model, variant, year, price, kilometres, colour,
  transmission, body_type, engine, engine_capacity, cylinders, fuel_type,
  seats, doors, description, short_description, features, status, featured,
  stock_number, vin, reg_plate, reg_expiry)
VALUES ('...', ...);
```

### 3. Verify
After the upsert, run:
```sql
SELECT id, slug, make, model, year, price, stock_number, vin, array_length(features, 1) AS feature_count
FROM vehicles WHERE stock_number = '...' OR vin = '...';
```
Report back the result to the user.

## Schema columns reference
id, slug, make, model, variant, year, price, kilometres, colour, transmission, body_type,
engine, engine_capacity, cylinders, fuel_type, seats, doors, description, short_description,
features, photos, status, featured, stock_number, vin, reg_plate, reg_expiry, created_at, updated_at
