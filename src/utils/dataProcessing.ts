import { format, parseISO } from 'date-fns';
import { BlueDartRaw, DelhiveryRaw, NormalizedShipment, KPIData, DashboardFilters } from '../types';

export const parseDate = (dateStr: string): Date => {
  // Handle empty or undefined input
  if (!dateStr || dateStr.trim() === '') {
    console.log('Empty date string, using current date');
    return new Date(); // Return current date as fallback
  }

  console.log(`Attempting to parse date: "${dateStr}"`);

  try {
    // Handle ISO format (e.g., "2025-07-07")
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.log(`Parsing ISO date format: "${dateStr}"`);
      const parsedDate = new Date(dateStr + 'T00:00:00.000Z');
      if (!isNaN(parsedDate.getTime())) {
        console.log(`✓ Successfully parsed ISO date: ${parsedDate}`);
        return parsedDate;
      }
    }
    
    // Handle Delhivery datetime format (e.g., "28-07-2025 07:48")
    if (dateStr.includes(' ') && dateStr.includes('-') && dateStr.split('-').length === 3) {
      const datePart = dateStr.split(' ')[0]; // Get "28-07-2025"
      const parts = datePart.split('-');
      
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        
        const isoDateStr = `${year}-${month}-${day}`;
        console.log(`Parsing Delhivery datetime: "${dateStr}" -> "${isoDateStr}"`);
        
        const parsedDate = new Date(isoDateStr + 'T00:00:00.000Z');
        if (!isNaN(parsedDate.getTime())) {
          console.log(`✓ Successfully parsed Delhivery date: ${parsedDate}`);
          return parsedDate;
        }
      }
    }
    
    // Handle BlueDart DD-MMM-YY format (e.g., "07-Jul-25")
    if (dateStr.includes('-') && !dateStr.includes(' ')) {
      const parts = dateStr.split('-');
      console.log('Date parts:', parts);
      
      if (parts.length === 3) {
        const day = parts[0].trim().padStart(2, '0');
        const monthStr = parts[1].trim();
        const year = parts[2].trim();
        
        console.log('Parsed parts:', { day, monthStr, year });
        
        // Month mapping
        const months: { [key: string]: string } = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
          'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
          'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        
        const month = months[monthStr];
        console.log('Month mapping result:', month);
        
        if (month) {
          // Handle 2-digit year (25 = 2025)
          const fullYear = year.length === 2 ? `20${year}` : year;
          const isoDateStr = `${fullYear}-${month}-${day}`;
          console.log(`Parsing BlueDart date: "${dateStr}" -> "${isoDateStr}"`);
          
          const parsedDate = new Date(isoDateStr + 'T00:00:00.000Z');
          console.log('Parsed date object:', parsedDate);
          
          if (!isNaN(parsedDate.getTime())) {
            console.log(`✓ Successfully parsed date: ${parsedDate}`);
            return parsedDate;
          } else {
            console.log('❌ Invalid date created from ISO string');
          }
        } else {
          console.log('❌ Month not found in mapping');
        }
      } else {
        console.log('❌ Date does not have 3 parts');
      }
    }
    
    // Handle ISO format
    const parsedDate = parseISO(dateStr);
    if (isNaN(parsedDate.getTime())) {
      console.log(`❌ Failed to parse as ISO: "${dateStr}"`);
      return new Date(); // Return current date as fallback
    }
    console.log(`✓ Successfully parsed as ISO: ${parsedDate}`);
    return parsedDate;
  } catch {
    console.log(`❌ Exception parsing date "${dateStr}":`, error);
    return new Date(); // Return current date as fallback
  }
};

export const detectWeightUnit = (weights: number[]): 'kg' | 'g' => {
  const validWeights = weights.filter(w => w > 0);
  if (validWeights.length === 0) return 'kg';
  
  const avg = validWeights.reduce((sum, w) => sum + w, 0) / validWeights.length;
  // If average weight is > 50 but < 2000, likely grams
  return (avg > 50 && avg < 2000) ? 'g' : 'kg';
};

export const getValueBucket = (value: number): string => {
  if (value <= 500) return '≤500';
  if (value <= 1000) return '501-1000';
  if (value <= 2000) return '1001-2000';
  return '>2000';
};

export const deriveZoneFromDestination = (destination: string): string => {
  const zoneMapping: { [key: string]: string } = {
    'MAA': 'South', 'BLR': 'South', 'TJV': 'South', 'NAM': 'South',
    'CJB': 'South', 'DEL': 'North', 'MUM': 'West', 'KOL': 'East'
  };
  
  const prefix = destination.split('-')[0];
  return zoneMapping[prefix] || 'Unknown';
};

export const normalizeBlueDart = (data: BlueDartRaw[]): NormalizedShipment[] => {
  console.log('Starting BlueDart normalization with', data.length, 'records');
  
  if (data.length === 0) {
    console.log('No BlueDart data to normalize');
    return [];
  }
  
  console.log('Sample BlueDart record:', data[0]);
  console.log('Available columns:', Object.keys(data[0] || {}));
  
  return data.map(row => {
    // Handle BlueDart CSV columns - your format has specific column names
    const actualWeight = parseFloat(String(row.ACT_WT || row['ACT_WT'] || '0')) || 0;
    const chargedWeight = parseFloat(String(row.CHRG_WT || row['CHRG_WT'] || '0')) || (actualWeight > 0 ? actualWeight : 0.5);
    const awbNumber = String(row.AWB_NO || row['AWB_NO'] || row.AWB || '');
    const pickupDate = String(row.PICKUP_DT || row['PICKUP_DT'] || '');
    const lineAmount = parseFloat(String(row.AMOUNT || row['AMOUNT'] || '0')) || 0;
    const productValue = parseFloat(String(row.VALUE || row['VALUE'] || '0')) || 0;
    const pieces = parseInt(String(row.PCS || row['PCS'] || '1')) || 1;
    const origin = String(row.ORIGIN || row['ORIGIN'] || '');
    const destination = String(row.DESTINATION || row['DESTINATION'] || '');
    const pinCode = String(row['PIN CODE'] || row.PIN_CODE || row['PIN_CODE'] || '');
    const service = String(row.SVC || row['SVC'] || 'Standard');
    
    console.log('Processing AWB:', row.AWB_NO, {
      rawActualWeight: row.ACT_WT,
      rawChargedWeight: row.CHRG_WT,
      rawAmount: row.AMOUNT,
      rawValue: row.VALUE,
      parsedActualWeight: actualWeight,
      parsedChargedWeight: chargedWeight,
      parsedAmount: lineAmount,
      awbNumber: awbNumber
    });
    
    const weightDiff = chargedWeight - actualWeight;
    const weightDiffPercent = actualWeight > 0 ? (weightDiff / actualWeight) * 100 : 0;
    const perKgRate = chargedWeight > 0 ? lineAmount / chargedWeight : 0;
    
    const normalized: NormalizedShipment = {
      originalData: row,
      carrier: 'BlueDart',
      awb: awbNumber,
      pickup_date: parseDate(pickupDate),
      origin: origin,
      destination: destination,
      pin: pinCode,
      actual_weight_kg: actualWeight,
      charged_weight_kg: chargedWeight,
      line_amount: lineAmount,
      product_value: productValue,
      pieces: pieces,
      service: service,
      zone: deriveZoneFromDestination(destination),
      status: 'Delivered', // Default for BlueDart
      
      weight_diff_kg: weightDiff,
      weight_diff_percent: weightDiffPercent,
      is_overbilled: weightDiff > 0.1,
      is_underbilled: weightDiff < -0.1,
      per_kg_rate: perKgRate,
      value_bucket: getValueBucket(productValue),
      
      flag_high_uplift: chargedWeight >= actualWeight + 0.5,
      flag_roundup_jump: actualWeight < 1.0 && chargedWeight >= 1.5,
      flag_value_weight_mismatch: productValue >= 1000 && actualWeight < 0.5,
      flag_charge_outlier: false, // Will be calculated later
      flag_missing_actual: !actualWeight || actualWeight === 0,
      flag_miscalculated: false // Will be calculated later
    };
    
    console.log('Normalized BlueDart record:', {
      awb: normalized.awb,
      actualWeight: normalized.actual_weight_kg,
      chargedWeight: normalized.charged_weight_kg,
      lineAmount: normalized.line_amount,
      perKgRate: normalized.per_kg_rate
    });
    
    return normalized;
  });
};

export const normalizeDelhivery = (data: DelhiveryRaw[]): NormalizedShipment[] => {
  console.log('Starting Delhivery normalization with', data.length, 'records');
  
  if (data.length === 0) {
    console.log('No Delhivery data to normalize');
    return [];
  }
  
  console.log('Sample Delhivery record:', data[0]);
  
  // Detect if weights are in grams
  const chargedWeights = data.map(row => parseFloat(String(row.charged_weight || 0))).filter(w => w > 0);
  
  const isChargedInGrams = detectWeightUnit(chargedWeights) === 'g';
  
  console.log('Weight unit detection:', {
    chargedInGrams: isChargedInGrams
  });
  
  return data.map(row => {
    // Use product_value as actual weight: 360 = 450 grams
    const productValue = parseFloat(String(row.product_value || 0)) || 0;
    const actualWeight = productValue > 0 ? (productValue * 450 / 360) / 1000 : 0; // Convert to kg
    const chargedWeight = isChargedInGrams ? (parseFloat(String(row.charged_weight || 0)) || 0) / 1000 : (parseFloat(String(row.charged_weight || 0)) || 0);
    const lineAmount = parseFloat(String(row.total_amount || 0)) || 0;
    const pieces = parseInt(String(row.item_shipped || 1)) || 1;
    
    console.log('Delhivery weight calculation:', {
      productValue: productValue,
      calculatedActualWeight: actualWeight,
      chargedWeight: chargedWeight
    });
    
    const weightDiff = chargedWeight - actualWeight;
    const weightDiffPercent = actualWeight > 0 ? (weightDiff / actualWeight) * 100 : 0;
    const perKgRate = chargedWeight > 0 ? lineAmount / chargedWeight : 0;
    
    const normalized: NormalizedShipment = {
      originalData: row,
      carrier: 'Delhivery',
      awb: row.waybill_num,
      pickup_date: parseDate(row.pickup_date),
      origin: row.origin_center,
      destination: row.destination_pin,
      pin: row.destination_pin,
      actual_weight_kg: actualWeight,
      charged_weight_kg: chargedWeight,
      line_amount: lineAmount,
      product_value: productValue,
      pieces: pieces,
      service: row.package_type,
      zone: row.zone || 'Unknown',
      status: row.status,
      
      weight_diff_kg: weightDiff,
      weight_diff_percent: weightDiffPercent,
      is_overbilled: weightDiff > 0.1,
      is_underbilled: weightDiff < -0.1,
      per_kg_rate: perKgRate,
      value_bucket: getValueBucket(productValue),
      
      flag_high_uplift: chargedWeight >= actualWeight + 0.5,
      flag_roundup_jump: actualWeight < 1.0 && chargedWeight >= 1.5,
      flag_value_weight_mismatch: productValue >= 1000 && actualWeight < 0.5,
      flag_charge_outlier: false,
      flag_missing_actual: !actualWeight || actualWeight === 0,
      flag_miscalculated: false
    };
    
    console.log('Normalized Delhivery record:', {
      awb: normalized.awb,
      actualWeight: normalized.actual_weight_kg,
      chargedWeight: normalized.charged_weight_kg,
      lineAmount: normalized.line_amount,
      perKgRate: normalized.per_kg_rate
    });
    
    return normalized;
  });
};

export const calculateOutliers = (shipments: NormalizedShipment[]): NormalizedShipment[] => {
  console.log('Starting outlier calculation for', shipments.length, 'shipments');
  
  // Group by carrier + zone + service
  const groups: { [key: string]: NormalizedShipment[] } = {};
  
  shipments.forEach(shipment => {
    const key = `${shipment.carrier}_${shipment.zone}_${shipment.service}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(shipment);
  });
  
  console.log('Created', Object.keys(groups).length, 'groups for outlier analysis');
  
  // Calculate outliers for each group
  Object.values(groups).forEach(group => {
    const rates = group.map(s => s.per_kg_rate).filter(r => r > 0).sort((a, b) => a - b);
    if (rates.length < 5) return;
    
    const p5 = rates[Math.floor(rates.length * 0.05)];
    const p95 = rates[Math.floor(rates.length * 0.95)];
    
    group.forEach(shipment => {
      shipment.flag_charge_outlier = shipment.per_kg_rate < p5 || shipment.per_kg_rate > p95;
      shipment.flag_miscalculated = shipment.is_overbilled || 
                                   shipment.flag_roundup_jump || 
                                   shipment.flag_charge_outlier;
    });
  });
  
  const flaggedCount = shipments.filter(s => s.flag_miscalculated).length;
  console.log('Outlier calculation complete.', flaggedCount, 'shipments flagged');
  
  return shipments;
};

export const calculateKPIs = (shipments: NormalizedShipment[]): KPIData => {
  console.log('Calculating KPIs for', shipments.length, 'shipments');
  
  const total = shipments.length;
  
  if (total === 0) {
    console.log('No shipments to calculate KPIs for');
    return {
      totalShipments: 0,
      totalAmount: 0,
      suspectedOverbillingCount: 0,
      suspectedOverbillingValue: 0,
      avgActualWeight: 0,
      avgChargedWeight: 0,
      overbillingRateByCarrier: {},
      overbillingRateByZone: {},
      topProblematicPins: []
    };
  }
  
  const totalAmount = shipments.reduce((sum, s) => sum + s.line_amount, 0);
  const overbilled = shipments.filter(s => s.is_overbilled);
  const overbillingValue = overbilled.reduce((sum, s) => sum + s.line_amount, 0);
  
  const validWeights = shipments.filter(s => s.actual_weight_kg > 0 && s.charged_weight_kg > 0);
  const avgActual = validWeights.length > 0 ? validWeights.reduce((sum, s) => sum + s.actual_weight_kg, 0) / validWeights.length : 0;
  const avgCharged = validWeights.length > 0 ? validWeights.reduce((sum, s) => sum + s.charged_weight_kg, 0) / validWeights.length : 0;
  
  // Overbilling rate by carrier
  const carrierGroups = shipments.reduce((acc, s) => {
    if (!acc[s.carrier]) acc[s.carrier] = { total: 0, overbilled: 0 };
    acc[s.carrier].total++;
    if (s.is_overbilled) acc[s.carrier].overbilled++;
    return acc;
  }, {} as { [key: string]: { total: number; overbilled: number } });
  
  const overbillingRateByCarrier = Object.entries(carrierGroups).reduce((acc, [carrier, data]) => {
    acc[carrier] = (data.overbilled / data.total) * 100;
    return acc;
  }, {} as { [key: string]: number });
  
  // Overbilling rate by zone
  const zoneGroups = shipments.reduce((acc, s) => {
    if (!acc[s.zone]) acc[s.zone] = { total: 0, overbilled: 0 };
    acc[s.zone].total++;
    if (s.is_overbilled) acc[s.zone].overbilled++;
    return acc;
  }, {} as { [key: string]: { total: number; overbilled: number } });
  
  const overbillingRateByZone = Object.entries(zoneGroups).reduce((acc, [zone, data]) => {
    acc[zone] = (data.overbilled / data.total) * 100;
    return acc;
  }, {} as { [key: string]: number });
  
  // Top problematic PINs
  const pinGroups = overbilled.reduce((acc, s) => {
    if (!acc[s.pin]) acc[s.pin] = { count: 0, totalValue: 0 };
    acc[s.pin].count++;
    acc[s.pin].totalValue += s.line_amount;
    return acc;
  }, {} as { [key: string]: { count: number; totalValue: number } });
  
  const topProblematicPins = Object.entries(pinGroups)
    .map(([pin, data]) => ({ pin, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  console.log('Calculated KPIs:', {
    totalShipments: total,
    totalAmount,
    suspectedOverbillingCount: overbilled.length,
    avgActual,
    avgCharged
  });
  
  return {
    totalShipments: total,
    totalAmount,
    suspectedOverbillingCount: overbilled.length,
    suspectedOverbillingValue: overbillingValue,
    avgActualWeight: avgActual,
    avgChargedWeight: avgCharged,
    overbillingRateByCarrier,
    overbillingRateByZone,
    topProblematicPins
  };
};

export const applyFilters = (shipments: NormalizedShipment[], filters: DashboardFilters): NormalizedShipment[] => {
  console.log('Applying filters to', shipments.length, 'shipments');
  console.log('Date range filter:', filters.dateRange);
  
  const filtered = shipments.filter(shipment => {
    // TEMPORARILY DISABLE DATE FILTER TO DEBUG
    const shipmentDate = shipment.pickup_date;
    const startDate = filters.dateRange.start;
    const endDate = filters.dateRange.end;
    
    console.log('Checking date:', shipmentDate, 'against range:', startDate, 'to', endDate);
    
    if (shipmentDate < startDate || shipmentDate > endDate) {
      console.log('Date filter excluded shipment');
      return false;
    }
    
    // Carriers
    if (filters.carriers.length > 0 && !filters.carriers.includes(shipment.carrier)) {
      return false;
    }
    
    // Zones
    if (filters.zones.length > 0 && !filters.zones.includes(shipment.zone)) {
      return false;
    }
    
    // PINs
    if (filters.pins.length > 0 && !filters.pins.some(pin => shipment.pin.includes(pin))) {
      return false;
    }
    
    // Services
    if (filters.services.length > 0 && !filters.services.includes(shipment.service)) {
      return false;
    }
    
    // Statuses
    if (filters.statuses.length > 0 && !filters.statuses.includes(shipment.status)) {
      return false;
    }
    
    // Weight difference
    if (shipment.weight_diff_kg < filters.minWeightDiff) {
      return false;
    }
    
    // Show delivered only
    if (filters.showDeliveredOnly && !shipment.status.toLowerCase().includes('deliver')) {
      return false;
    }
    
    // Search text
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      const searchableText = `${shipment.awb} ${shipment.pin} ${shipment.destination} ${shipment.origin}`.toLowerCase();
      if (!searchableText.includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });
  
  console.log('Filtered result:', filtered.length, 'shipments');
  return filtered;
};

export const exportToCSV = (shipments: NormalizedShipment[], filename: string = 'courier-analysis') => {
  const headers = [
    'Pickup Date', 'Carrier', 'AWB', 'Origin', 'Destination', 'PIN', 'Pieces',
    'Actual Weight (kg)', 'Charged Weight (kg)', 'Weight Diff (kg)', 'Weight Diff (%)',
    'Line Amount', 'Per Kg Rate', 'Product Value', 'Service', 'Zone', 'Status',
    'High Uplift', 'Roundup Jump', 'Value-Weight Mismatch', 'Charge Outlier', 'Missing Actual'
  ];
  
  const csvContent = [
    headers.join(','),
    ...shipments.map(s => [
      format(s.pickup_date, 'yyyy-MM-dd'),
      s.carrier,
      s.awb,
      `"${s.origin}"`,
      `"${s.destination}"`,
      s.pin,
      s.pieces,
      s.actual_weight_kg.toFixed(3),
      s.charged_weight_kg.toFixed(3),
      s.weight_diff_kg.toFixed(3),
      s.weight_diff_percent.toFixed(2),
      s.line_amount.toFixed(2),
      s.per_kg_rate.toFixed(2),
      s.product_value.toFixed(2),
      `"${s.service}"`,
      s.zone,
      `"${s.status}"`,
      s.flag_high_uplift ? 'Y' : 'N',
      s.flag_roundup_jump ? 'Y' : 'N',
      s.flag_value_weight_mismatch ? 'Y' : 'N',
      s.flag_charge_outlier ? 'Y' : 'N',
      s.flag_missing_actual ? 'Y' : 'N'
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const finalFilename = `${filename.toLowerCase().replace(/\s+/g, '-')}-export-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
    link.setAttribute('download', finalFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};