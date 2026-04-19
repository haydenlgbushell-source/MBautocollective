'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VehicleCombobox from './VehicleCombobox';

const MAKES = [
  'Alfa Romeo', 'Alpina', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'BYD',
  'Caterham', 'Chevrolet', 'Chrysler', 'Citroen', 'Cupra',
  'Daihatsu', 'Dodge',
  'Ferrari', 'Fiat', 'Ford',
  'Genesis', 'GWM',
  'Haval', 'Honda', 'Hyundai',
  'Infiniti', 'Isuzu',
  'Jaguar', 'Jeep',
  'Kia',
  'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln', 'Lotus',
  'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz', 'MG', 'MINI', 'Mitsubishi', 'Morgan',
  'Nissan',
  'Peugeot', 'Porsche',
  'Ram', 'Renault', 'Rolls-Royce',
  'Skoda', 'Smart', 'SsangYong', 'Subaru', 'Suzuki',
  'Tesla', 'Toyota',
  'Volkswagen', 'Volvo',
];

const MODELS_BY_MAKE: Record<string, string[]> = {
  'Alfa Romeo': ['Giulia', 'Giulietta', 'Stelvio', 'Tonale'],
  'Aston Martin': ['DB11', 'DB12', 'DBS', 'DBX', 'V8 Vantage', 'Vanquish', 'Vantage'],
  'Audi': [
    'A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8',
    'e-tron', 'e-tron GT',
    'Q2', 'Q3', 'Q4 e-tron', 'Q5', 'Q6 e-tron', 'Q7', 'Q8',
    'R8', 'RS 3', 'RS 4', 'RS 5', 'RS 6', 'RS 7',
    'S3', 'S4', 'S5', 'S6', 'SQ5', 'SQ7', 'SQ8',
    'TT', 'TT RS', 'TTS',
  ],
  'Bentley': ['Bentayga', 'Continental GT', 'Flying Spur', 'Mulsanne'],
  'BMW': [
    '1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series',
    'i3', 'i4', 'i5', 'i7', 'iX', 'iX1', 'iX3',
    'M2', 'M3', 'M4', 'M5', 'M8',
    'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'XM', 'Z4',
  ],
  'BYD': ['Atto 3', 'Dolphin', 'Seal', 'Shark', 'Sealion 6'],
  'Chevrolet': ['Camaro', 'Corvette', 'Silverado', 'Tahoe'],
  'Citroen': ['C3', 'C3 Aircross', 'C5 Aircross'],
  'Cupra': ['Born', 'Formentor', 'Leon'],
  'Dodge': ['Challenger', 'Charger', 'Durango'],
  'Ferrari': [
    '296 GTB', '296 GTS', '488 GTB', '488 Pista',
    '812 Competizione', '812 Superfast',
    'California T', 'F8 Spider', 'F8 Tributo',
    'GTC4Lusso', 'Portofino', 'Roma', 'SF90 Stradale',
  ],
  'Fiat': ['124 Spider', '500', '500L', '500X'],
  'Ford': ['Bronco', 'EcoSport', 'Escape', 'Everest', 'Explorer', 'F-150', 'Focus', 'Mustang', 'Puma', 'Ranger'],
  'Genesis': ['G70', 'G80', 'G90', 'GV70', 'GV80'],
  'GWM': ['Cannon', 'Haval H6', 'Ora', 'Tank 300'],
  'Haval': ['H2', 'H6', 'H9', 'Jolion'],
  'Honda': ['Accord', 'Civic', 'Civic Type R', 'CR-V', 'HR-V', 'Jazz', 'Legend', 'NSX', 'Odyssey', 'ZR-V'],
  'Hyundai': [
    'Elantra', 'i20', 'i20 N', 'i30', 'i30 N',
    'Ioniq 5', 'Ioniq 6', 'Ioniq 9',
    'Kona', 'Palisade', 'Santa Fe', 'Sonata', 'Tucson', 'Veloster',
  ],
  'Infiniti': ['Q50', 'Q60', 'Q70', 'QX50', 'QX60', 'QX70', 'QX80'],
  'Isuzu': ['D-Max', 'MU-X'],
  'Jaguar': ['E-Pace', 'F-Pace', 'F-Type', 'I-Pace', 'XE', 'XF'],
  'Jeep': ['Cherokee', 'Compass', 'Gladiator', 'Grand Cherokee', 'Renegade', 'Wrangler'],
  'Kia': ['Carnival', 'EV6', 'EV9', 'K5', 'Niro', 'Seltos', 'Sorento', 'Sportage', 'Stinger', 'Telluride'],
  'Lamborghini': ['Aventador', 'Huracán', 'Revuelto', 'Urus'],
  'Land Rover': [
    'Defender', 'Discovery', 'Discovery Sport',
    'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar',
  ],
  'Lexus': ['CT', 'ES', 'GS', 'GX', 'IS', 'LC', 'LX', 'NX', 'RC', 'RX', 'UX'],
  'Lotus': ['Eletre', 'Emira', 'Evija', 'Exige'],
  'Maserati': ['Ghibli', 'GranTurismo', 'Grecale', 'Levante', 'MC20', 'Quattroporte'],
  'Mazda': ['CX-30', 'CX-5', 'CX-60', 'CX-70', 'CX-8', 'CX-9', 'MX-5', 'MX-30', 'Mazda3', 'Mazda6'],
  'McLaren': ['540C', '570GT', '570S', '600LT', '620R', '650S', '675LT', '720S', '765LT', 'Artura', 'GT'],
  'Mercedes-Benz': [
    'A-Class', 'AMG GT', 'B-Class', 'C-Class', 'CLA', 'CLE', 'CLS',
    'E-Class', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS',
    'G-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS',
    'S-Class', 'SL', 'V-Class',
  ],
  'MG': ['3', '4', 'HS', 'MG ZS', 'ZST'],
  'MINI': ['Clubman', 'Convertible', 'Countryman', 'Hatch', 'Paceman'],
  'Mitsubishi': ['ASX', 'Eclipse Cross', 'Lancer', 'Outlander', 'Outlander PHEV', 'Pajero', 'Triton'],
  'Nissan': ['350Z', '370Z', 'Ariya', 'GT-R', 'Juke', 'Leaf', 'Navara', 'Pathfinder', 'Patrol', 'X-Trail', 'Z'],
  'Peugeot': ['2008', '3008', '408', '5008', '508'],
  'Porsche': ['718 Boxster', '718 Cayman', '911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
  'Ram': ['1500', '2500', 'TRX'],
  'Renault': ['Arkana', 'Austral', 'Clio', 'Koleos', 'Master', 'Megane', 'Trafic'],
  'Rolls-Royce': ['Cullinan', 'Dawn', 'Ghost', 'Phantom', 'Spectre', 'Wraith'],
  'Skoda': ['Fabia', 'Kamiq', 'Karoq', 'Kodiaq', 'Octavia', 'Superb'],
  'Smart': ['#1', '#3', 'Fortwo'],
  'SsangYong': ['Korando', 'Musso', 'Rexton', 'Tivoli'],
  'Subaru': ['BRZ', 'Forester', 'Impreza', 'Levorg', 'Liberty', 'Outback', 'WRX', 'XV'],
  'Suzuki': ['Across', 'Baleno', 'Jimny', 'S-Cross', 'Swift', 'Vitara'],
  'Tesla': ['Cybertruck', 'Model 3', 'Model S', 'Model X', 'Model Y'],
  'Toyota': [
    '86', 'C-HR', 'Camry', 'Corolla',
    'GR Supra', 'GR Yaris', 'GR86',
    'Hilux', 'Kluger', 'Land Cruiser', 'Land Cruiser 300', 'Prado', 'RAV4', 'Supra', 'Yaris',
  ],
  'Volkswagen': [
    'Amarok', 'Arteon', 'California', 'Golf', 'Golf R', 'GTI',
    'ID.3', 'ID.4', 'ID.5',
    'Multivan', 'Passat', 'Polo', 'T-Cross', 'T-Roc', 'Tiguan', 'Touareg',
  ],
  'Volvo': ['C40', 'EX30', 'EX90', 'S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90'],
};

const BUDGETS = [
  { label: 'Any Price', value: '' },
  { label: 'Under $80K',    value: 'under-80' },
  { label: '$80K – $150K',  value: '80-150' },
  { label: '$150K – $300K', value: '150-300' },
  { label: '$300K+',        value: 'over-300' },
];

const BODY_TYPES_SEARCH = [
  'Sedan', 'Coupe', 'SUV', 'Convertible', 'Wagon', 'Hatchback', 'Ute',
];

const FILTER_TAGS = [
  { label: 'All',             bodyType: '' },
  { label: 'Under 20,000 km', param: 'low-km' },
  { label: 'Recent Arrivals', param: 'recent' },
  { label: 'AMG / M Sport',   param: '' },
  { label: 'Convertibles',    bodyType: 'Convertible' },
  { label: 'Under $100K',     param: 'budget' },
  { label: 'Finance Ready',   param: '' },
];

export default function SearchSection() {
  const router = useRouter();
  const [search, setSearch]     = useState('');
  const [make, setMake]         = useState('');
  const [model, setModel]       = useState('');
  const [budget, setBudget]     = useState('');
  const [bodyType, setBodyType] = useState('');
  const [activeTag, setActiveTag] = useState('All');

  const models = make ? (MODELS_BY_MAKE[make] ?? []) : [];

  function handleMakeChange(v: string) {
    setMake(v);
    setModel('');
  }

  function buildSearch(overrides?: { make?: string; bodyType?: string; q?: string }) {
    const params = new URLSearchParams();
    const m = overrides?.make     ?? make;
    const b = overrides?.bodyType ?? bodyType;
    const q = overrides?.q        ?? search;
    if (q)      params.set('q', q);
    if (m)      params.set('make', m);
    if (model)  params.set('model', model);
    if (b)      params.set('body', b);
    if (budget) params.set('budget', budget);
    router.push(`/stock${params.size ? '?' + params.toString() : ''}`);
  }

  function handleTagClick(tag: typeof FILTER_TAGS[number]) {
    setActiveTag(tag.label);
    const params = new URLSearchParams();
    if ('bodyType' in tag && tag.bodyType) params.set('body', tag.bodyType);
    router.push(`/stock${params.size ? '?' + params.toString() : ''}`);
  }

  return (
    <section
      className="px-[60px] py-[80px] border-b max-md:px-6 max-md:py-12"
      style={{ background: '#1c1c1e', borderColor: 'rgba(184,150,62,0.2)' }}
    >
      {/* Label */}
      <div className="flex items-center gap-[16px] mb-9">
        <span className="font-mono-custom text-[10px] tracking-[0.3em] uppercase text-gold">
          Find Your Vehicle
        </span>
        <div className="h-px w-[80px]" style={{ background: 'rgba(184,150,62,0.3)' }} />
      </div>

      {/* Filter bar */}
      <div
        className="grid gap-[1px] mb-8 max-lg:grid-cols-1"
        style={{
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
          background: 'rgba(184,150,62,0.2)',
        }}
      >
        {/* Search input */}
        <div className="bg-bg-3 px-6 py-5">
          <div className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-text-3 mb-[6px]">
            Search
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buildSearch()}
            placeholder="e.g. Porsche 911, AMG C63..."
            className="w-full bg-transparent border-none text-text font-body text-[14px] outline-none placeholder:text-text-3 font-[300]"
          />
        </div>

        {/* Make */}
        <div className="bg-bg-3 px-6 py-5">
          <VehicleCombobox
            label="Make"
            options={MAKES}
            value={make}
            onChange={handleMakeChange}
            placeholder="All Makes"
          />
        </div>

        {/* Model */}
        <div className="bg-bg-3 px-6 py-5">
          <VehicleCombobox
            label="Model"
            options={models}
            value={model}
            onChange={setModel}
            placeholder={make ? 'All Models' : 'Select Make First'}
            disabled={!make}
          />
        </div>

        {/* Budget */}
        <div className="bg-bg-3 px-6 py-5">
          <div className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-text-3 mb-[6px]">
            Budget
          </div>
          <select
            value={budget}
            onChange={e => setBudget(e.target.value)}
            className="w-full bg-transparent border-none text-text font-body text-[13px] outline-none appearance-none font-[300]"
          >
            {BUDGETS.map(b => (
              <option key={b.value} value={b.value} style={{ background: '#1c1c1e' }}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        {/* Body Style */}
        <div className="bg-bg-3 px-6 py-5">
          <VehicleCombobox
            label="Body Style"
            options={BODY_TYPES_SEARCH}
            value={bodyType}
            onChange={setBodyType}
            placeholder="All Types"
          />
        </div>

        {/* Search button */}
        <button
          onClick={() => buildSearch()}
          className="bg-gold text-bg font-body text-[10px] font-[600] tracking-[0.2em] uppercase px-10 hover:bg-gold-hi transition-colors max-lg:py-4"
        >
          Search
        </button>
      </div>

      {/* Filter tags */}
      <div className="flex flex-wrap gap-[10px]">
        {FILTER_TAGS.map(tag => (
          <button
            key={tag.label}
            onClick={() => handleTagClick(tag)}
            className="font-mono-custom text-[10px] tracking-[0.15em] uppercase px-4 py-[7px] transition-all duration-200"
            style={{
              border: activeTag === tag.label
                ? '1px solid #b8963e'
                : '1px solid rgba(245,242,237,0.12)',
              color: activeTag === tag.label ? '#b8963e' : '#6b6b6b',
            }}
            onMouseEnter={e => {
              if (activeTag !== tag.label) {
                (e.currentTarget as HTMLElement).style.borderColor = '#b8963e';
                (e.currentTarget as HTMLElement).style.color = '#b8963e';
              }
            }}
            onMouseLeave={e => {
              if (activeTag !== tag.label) {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,242,237,0.12)';
                (e.currentTarget as HTMLElement).style.color = '#6b6b6b';
              }
            }}
          >
            {tag.label}
          </button>
        ))}
      </div>
    </section>
  );
}
