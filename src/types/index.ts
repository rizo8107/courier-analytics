export interface BlueDartRaw {
  CODE: string;
  SVC: string;
  PROD: string;
  TYPE: string;
  AWB_NO: string;
  REF_NO: string;
  PICKUP_DT: string;
  ORIGIN: string;
  DESTINATION: string;
  ACT_WT: number;
  CHRG_WT: number;
  PCS: number;
  FREIGHT: number;
  FS: number;
  CAF: number;
  IDC: number;
  AMOUNT: number;
  PIN_CODE: string;
  VALUE: number;
}

export interface DelhiveryRaw {
  waybill_num: string;
  client: string;
  pickup_date: string;
  serial_number: string;
  origin_center: string;
  client_gstin: string;
  delhivery_gstin: string;
  package_type: string;
  product_value: number;
  cod_amount: number;
  status: string;
  charged_weight: number;
  zone: string;
  payment_mode: string;
  payment_mode_type: string;
  issuing_bank: string;
  charge_POD: number;
  charge_COVID: number;
  charge_FSC: number;
  charge_DL: number;
  charge_RTO: number;
  charge_DTO: number;
  charge_COD: number;
  charge_FS: number;
  charge_FOV: number;
  charge_CCOD: number;
  charge_WOD: number;
  charge_AIR: number;
  charge_pickup: number;
  charge_DPH: number;
  charge_QC: number;
  charge_CWH: number;
  charge_E2E: number;
  charge_LM: number;
  charge_DEMUR: number;
  charge_LABEL: number;
  charge_REATTEMPT: number;
  charge_DOCUMENT: number;
  charge_ROV: number;
  IGST: number;
  CGST: number;
  'SGST/UGST': number;
  gross_amount: number;
  total_amount: number;
  destination_pin: string;
  order_id: string;
  item_shipped: number;
  fpd: string;
  atc: number;
  mcount: number;
  pdd: string;
  frd: string;
  qc_pass: boolean;
  qc_atc: number;
  fuel_base_rate: number;
  avg_fuel_rate: number;
  fuel_hike: number;
  packaging_type: string;
  ctlg_dead_wt: number;
  ctlg_vl_wt: number;
}

export interface NormalizedShipment {
  // Original data preserved
  originalData: BlueDartRaw | DelhiveryRaw;
  
  // Common schema
  carrier: 'BlueDart' | 'Delhivery';
  awb: string;
  pickup_date: Date;
  origin: string;
  destination: string;
  pin: string;
  actual_weight_kg: number;
  charged_weight_kg: number;
  line_amount: number;
  product_value: number;
  pieces: number;
  service: string;
  zone: string;
  status: string;
  
  // Calculated fields
  weight_diff_kg: number;
  weight_diff_percent: number;
  is_overbilled: boolean;
  is_underbilled: boolean;
  per_kg_rate: number;
  value_bucket: string;
  
  // Flags
  flag_high_uplift: boolean;
  flag_roundup_jump: boolean;
  flag_value_weight_mismatch: boolean;
  flag_charge_outlier: boolean;
  flag_missing_actual: boolean;
  flag_miscalculated: boolean;
}

export interface DashboardFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  carriers: string[];
  zones: string[];
  pins: string[];
  services: string[];
  statuses: string[];
  minWeightDiff: number;
  showDeliveredOnly: boolean;
  searchText: string;
  upliftThreshold: number;
}

export interface KPIData {
  totalShipments: number;
  totalAmount: number;
  suspectedOverbillingCount: number;
  suspectedOverbillingValue: number;
  avgActualWeight: number;
  avgChargedWeight: number;
  overbillingRateByCarrier: { [key: string]: number };
  overbillingRateByZone: { [key: string]: number };
  topProblematicPins: Array<{ pin: string; count: number; totalValue: number }>;
}