# Issue Dimentions

### 1. **Issue Type** (already present, but can be more granular)
- Order Packing Issues
- Inventory Sync Issues
- Return Issues
- Data Request/Correction
- Internal Error Issues
- Manifest Issues
- Picklist Issues
- Order Update Issues
- WMS/OMS-Order Sync Issues
- Posting Issues
- Master Update Issues
- Slowness Issues
- Other Issues

### 2. **Priority/Urgency**
- 1-Critical
- 2-High
- 3-Medium
- 4-Low

### 3. **System/Process Component**
- Integration/API (e.g., sync, posting, API errors)
- UI/UX (e.g., missing images, dropdowns not populating)
- Hardware (e.g., printing, scanning)
- Data/Configuration (e.g., incorrect mappings, missing data)
- Workflow/Process (e.g., delays, stuck orders, incorrect routing)

### 4. **Client/Channel/Location**
- Specific client or brand (e.g., Puma, Miniklub, Meesho)
- Channel (e.g., Amazon, Flipkart, Magento, DHL)
- Warehouse location (e.g., wms_gurugram, wms_blr online)

### 5. **Order/Item Context**
- B2B vs B2C
- Bulk vs Single order
- Special handling (e.g., perishable, gift note, returns)

### 6. **Status/Stage of Issue**
- In Progress
- Closed
- Accepted for Dev
- Revert Awaited
- Triage

### 7. **Error/Failure Mode** (from descriptions)
- System error (500, internal error)
- Data mismatch (duplicate, missing, incorrect)
- Process stuck (order not moving, picklist not released)
- Permission/authorization issues
- Performance (slowness, delays)
- UI/UX (not visible, not accessible)

---

**Example of a multi-dimensional tuple for evaluation:**
- Issue Type: Inventory Sync Issue
- Priority: Critical
- System Component: Integration/API
- Client: Miniklub
- Order Context: B2C, Bulk
- Status: In Progress
- Failure Mode: Data mismatch
