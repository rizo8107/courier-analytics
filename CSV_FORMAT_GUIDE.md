# CSV Format Guide for Courier Weight & Cost Validation

## BlueDart CSV Format

### Required Columns (Exact Names):
```
AWB_NO,PICKUP_DT,ACT_WT,CHRG_WT,AMOUNT,ORIGIN,DESTINATION,PIN_CODE,VALUE,PCS,SVC
```

### Column Descriptions:
- **AWB_NO**: Airway Bill Number (e.g., "90128761682")
- **PICKUP_DT**: Pickup Date in DD-MMM-YY format (e.g., "07-Jul-25")
- **ACT_WT**: Actual Weight in kg (e.g., 0.94)
- **CHRG_WT**: Charged Weight in kg (e.g., 1.0)
- **AMOUNT**: Total Amount in rupees (e.g., 87.43)
- **ORIGIN**: Origin location (e.g., "CJB-COIMBATORE")
- **DESTINATION**: Destination location (e.g., "MAA-CHENNAI")
- **PIN_CODE**: PIN Code (e.g., "600045")
- **VALUE**: Product Value in rupees (e.g., 720)
- **PCS**: Number of pieces (e.g., 1)
- **SVC**: Service type (e.g., "PPM")

### Sample BlueDart CSV:
```csv
AWB_NO,PICKUP_DT,ACT_WT,CHRG_WT,AMOUNT,ORIGIN,DESTINATION,PIN_CODE,VALUE,PCS,SVC
90128761682,07-Jul-25,0.94,1,87.43,CJB-COIMBATORE,MAA-CHENNAI,600045,720,1,PPM
90135232982,07-Jul-25,1.4,1.5,132,CJB-COIMBATORE,TJV-THANJAVUR,613007,1080,1,PPM
90135233226,07-Jul-25,0.94,1,87.43,CJB-COIMBATORE,BLR-BENGALURU,560070,720,1,PPM
```

---

## Delhivery CSV Format

### Required Columns (Exact Names):
```
waybill_num,pickup_date,charged_weight,total_amount,product_value,item_shipped,package_type,zone,status,destination_pin,origin_center,ctlg_dead_wt,ctlg_vl_wt
```

### Column Descriptions:
- **waybill_num**: Waybill Number (e.g., "40127410025852")
- **pickup_date**: Pickup Date in DD-MM-YYYY HH:MM format (e.g., "28-07-2025 07:48")
- **charged_weight**: Charged Weight in grams (e.g., 500)
- **total_amount**: Total Amount in rupees (e.g., 31.86)
- **product_value**: Product Value in rupees (e.g., 360)
- **item_shipped**: Number of items (e.g., 1)
- **package_type**: Package Type (e.g., "Pre-paid")
- **zone**: Zone (e.g., "B")
- **status**: Delivery Status (e.g., "Delivered")
- **destination_pin**: Destination PIN (e.g., "624601")
- **origin_center**: Origin Center (e.g., "Coimbatore_ShobhaNagar_C (Tamil Nadu)")
- **ctlg_dead_wt**: Catalog Dead Weight in grams (e.g., 0)
- **ctlg_vl_wt**: Catalog Volumetric Weight in grams (e.g., 0)

### Sample Delhivery CSV:
```csv
waybill_num,pickup_date,charged_weight,total_amount,product_value,item_shipped,package_type,zone,status,destination_pin,origin_center,ctlg_dead_wt,ctlg_vl_wt
40127410025852,28-07-2025 07:48,500,31.86,360,1,Pre-paid,B,Delivered,624601,Coimbatore_ShobhaNagar_C (Tamil Nadu),0,0
40127410019294,21-07-2025 07:27,480,31.86,360,1,Pre-paid,B,Delivered,600077,Coimbatore_Vellakinar_C (Tamil Nadu),0,0
```

---

## Important Notes:

### For BlueDart:
1. **Date Format**: Must be DD-MMM-YY (e.g., "07-Jul-25", "15-Aug-25")
2. **Weights**: Should be in kilograms (kg)
3. **No spaces in column names**: Use underscores (PIN_CODE not "PIN CODE")

### For Delhivery:
1. **Date Format**: Must be DD-MM-YYYY HH:MM (e.g., "28-07-2025 07:48")
2. **Weights**: Should be in grams (will be auto-converted to kg)
3. **All lowercase**: Column names should be lowercase with underscores

### General:
- Save files as CSV format
- Use UTF-8 encoding
- No extra spaces in column headers
- Numeric values should not have currency symbols or commas
- Empty cells should be left blank (not "N/A" or "-")

---

## Quick Conversion Tips:

### From your current BlueDart format:
1. Remove extra columns (CODE, TYPE, REF NO, FREIGHT, FS, CAF, IDC)
2. Rename "PIN CODE" to "PIN_CODE" (remove space)
3. Keep: AWB_NO, PICKUP_DT, ACT_WT, CHRG_WT, AMOUNT, ORIGIN, DESTINATION, PIN_CODE, VALUE, PCS, SVC

### From your current Delhivery format:
1. Keep the main columns as listed above
2. Remove extra charge columns (charge_POD, charge_COVID, etc.)
3. Ensure weights are in grams (not kg)

Once you convert your files to these exact formats, the system will work perfectly!