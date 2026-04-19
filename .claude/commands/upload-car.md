# Upload Car Listing

Use this skill when the user pastes car listing details and wants them saved to the backend.
Always UPDATE if the vehicle already exists (match by stock_number or VIN) — never duplicate.

## Supabase project
Project ID: `tgeqaadacfwmfvweqlss`

---

## Section 1 — Core Details

| Listing field | DB column | Notes |
|---|---|---|
| Title | make, model, variant, year, body_type | Parse: `{year} {make} {model} {body} {variant}` |
| Price | price | Strip `$`, commas, ` Excl. Govt. Charges` → integer |
| Stock Number | stock_number | Store as-is (text) |
| VIN | vin | Store as-is |

---

## Section 2 — Specifications

| Listing field | DB column | Notes |
|---|---|---|
| Kilometers | kilometres | Strip commas → integer |
| Colour | colour | Store as-is |
| Transmission | transmission | Map to `'Automatic'` or `'Manual'` |
| Fuel | fuel_type | Map to `'Petrol'`, `'Diesel'`, `'Hybrid'`, or `'Electric'` |
| Body | body_type | Map to schema enum (see below) |
| Cylinders | cylinders | e.g. `T4` |
| Engine Size + Engine Type | engine | Combine: `{size} {type}` e.g. `2.0L TURBO DIRECT F/INJ` |
| Engine Capacity | engine_capacity | Integer (cc), e.g. `1969` |
| Seat Capacity | seats | Integer |
| Doors | doors | Integer |
| Reg Plate | reg_plate | Store as-is |
| Reg Expiry | reg_expiry | Store as-is (DD/MM/YYYY) |
| Short Description | short_description | Store as-is |

### Transmission mapping
- Contains `AUTOMATIC` → `'Automatic'`
- Contains `MANUAL` → `'Manual'`

### Fuel type mapping
- Contains `Petrol` or `ULP` → `'Petrol'`
- Contains `Diesel` → `'Diesel'`
- Contains `Hybrid` or `MHEV` or `PHEV` → `'Hybrid'`
- Contains `Electric` or `EV` → `'Electric'`

### Body type mapping
- `WAGON` → `'Wagon'`
- `SEDAN` → `'Sedan'`
- `SUV` or `4WD` → `'SUV'`
- `HATCHBACK` or `HATCH` → `'Hatchback'`
- `COUPE` or `COUPÉ` → `'Coupé'`
- `CONVERTIBLE` or `CABRIOLET` → `'Convertible'`
- `UTE` or `UTILITY` → `'Ute'`

---

## Section 3 — Description

Store the full description text in the `description` column as-is.
Always include `description` in both INSERT and UPDATE — never omit it.

---

## Section 4 — Features

Process every feature in the pasted list through two steps:

### Step 1 — Match against standard features

Check each pasted feature against the predefined standard list (`STANDARD_FEATURES` in `/lib/constants.ts`).
Use the mapping table below to normalise names. One pasted feature can produce multiple standard matches.

| Pasted feature | Standard feature(s) |
|---|---|
| Adaptive Cruise Control | Adaptive Cruise Control |
| Airbag - Knee Driver | Driver Knee Airbag |
| Auto Climate Control with Dual Temp Zones | Auto Climate Control, Dual Zone Climate Control |
| Blind Spot Information System | Blind Spot Monitoring |
| Bluetooth Connectivity | Bluetooth |
| Cross Traffic Alert | Cross Traffic Alert |
| Curtain Airbags | Curtain Airbags |
| Digital Audio Broadcast Radio | DAB Digital Radio |
| Dual Front Airbags Package | Dual Front Airbags |
| Forward Collision Mitigation | Autonomous Emergency Braking |
| Gloss Black Roof Rails / Roof Rails * | Roof Rails |
| High Performance Sound System | Premium Sound System |
| Hill Descent Control | Hill Descent Control |
| Hill Start Assist | Hill Start Assist |
| Instrument Cluster Display - * Inch | Digital Instrument Cluster |
| Keyless Entry | Keyless Entry |
| Lane Keeping Assist | Lane Keeping Assist |
| LED Headlights | LED Headlights |
| Multi-media System with * Touchscreen | Touchscreen Infotainment |
| Park Assist Front & Rear | Park Assist (Front & Rear) |
| Power front seat Driver/memory | Power Driver Seat, Driver Memory Seat |
| Power front seat Passenger | Power Passenger Seat |
| Power Lumbar Support Driver * | Power Lumbar Support (Driver) |
| Power Lumbar Support Passenger * | Power Lumbar Support (Passenger) |
| Power Tailgate | Power Tailgate |
| Rain Sensor | Rain Sensing Wipers |
| Rear Collision Warning | Rear Collision Warning |
| Remote Engine Start System | Remote Start |
| Road Sign Information | Traffic Sign Recognition |
| Side Airbags | Side Airbags |
| Surround Camera System | Surround View Camera |
| Telematics | Telematics |
| Trailer Module Preparation | Tow Bar Preparation |
| Traffic Jam Assist | Traffic Jam Assist |
| Tyre Pressure Monitoring System | Tyre Pressure Monitoring |
| USB Input Socket / USB Charging Port* | USB Ports |
| Voice Recognition System | Voice Recognition |
| Wireless Phone Charge | Wireless Charging |
| 18 Inch Alloy Wheels | 18 Inch Alloy Wheels |
| 19 Inch Alloy Wheels | 19 Inch Alloy Wheels |
| 20 Inch Alloy Wheels | 20 Inch Alloy Wheels |
| 21 Inch Alloy Wheels | 21 Inch Alloy Wheels |
| Apple CarPlay | Apple CarPlay |
| Android Auto | Android Auto |
| Heated Front Seats / Heated Seat Front* | Heated Front Seats |
| Heated Rear Seats | Heated Rear Seats |
| Heated Steering Wheel | Heated Steering Wheel |
| Navigation / Satellite Navigation | Navigation System |
| Reversing Camera / Rear View Camera | Reversing Camera |
| Panoramic Sunroof / Panoramic Roof | Panoramic Sunroof |
| Sunroof / Glass Roof | Sunroof |
| Tow Bar / Tow Pack | Tow Bar Preparation |
| Ventilated Seats / Cooled Seats | Ventilated Front Seats |
| LED Tail Lights | LED Tail Lights |
| Power Folding Mirrors | Power Folding Mirrors |

### Step 2 — Handle unmatched features

Any pasted feature that does NOT match a standard feature must be stored as-is in the `features` array as a **custom feature** — do NOT discard it.

### Step 3 — Build the final features array

Combine: `[...matched_standard_features, ...unmatched_custom_features]`
Store the full combined array in the `features` column.

---

## Workflow

### 1. Check if vehicle already exists
```sql
SELECT id, slug FROM vehicles WHERE stock_number = '{stock_number}' OR vin = '{vin}' LIMIT 1;
```

### 2a. If vehicle EXISTS — UPDATE (never insert a duplicate)
```sql
UPDATE vehicles SET
  make = '...', model = '...', variant = '...', year = ..., price = ...,
  kilometres = ..., colour = '...', transmission = '...', body_type = '...',
  engine = '...', engine_capacity = ..., cylinders = '...', fuel_type = '...',
  seats = ..., doors = ...,
  description = '...',
  short_description = '...',
  stock_number = '...', vin = '...', reg_plate = '...', reg_expiry = '...',
  features = ARRAY['...', '...']
WHERE id = '{existing_id}';
```

### 2b. If vehicle does NOT exist — INSERT
Generate slug: `{year}-{make}-{model}-{variant}` → lowercase, spaces→hyphens, remove special chars.
Check slug uniqueness; append `-2`, `-3` etc. if already taken.

```sql
INSERT INTO vehicles (
  slug, make, model, variant, year, price, kilometres, colour,
  transmission, body_type, engine, engine_capacity, cylinders, fuel_type,
  seats, doors, description, short_description, features,
  status, featured, stock_number, vin, reg_plate, reg_expiry
) VALUES (
  '...', '...', '...', '...', ..., ..., ..., '...',
  '...', '...', '...', ..., '...', '...',
  ..., ..., '...', '...', ARRAY['...', '...'],
  'available', false, '...', '...', '...', '...'
);
```

### 3. Verify
```sql
SELECT id, slug, make, model, year, price, stock_number, vin,
       array_length(features, 1) AS feature_count
FROM vehicles WHERE stock_number = '...' OR vin = '...';
```
Report the result to the user confirming what was saved.

---

## Schema columns reference
id, slug, make, model, variant, year, price, kilometres, colour, transmission, body_type,
engine, engine_capacity, cylinders, fuel_type, seats, doors, description, short_description,
features, photos, status, featured, stock_number, vin, reg_plate, reg_expiry, created_at, updated_at
