# Doppel Beh Feature Implementation Task List

## Status: In Progress
**Current Session Date**: [Current Date]
**File Location**: `src/app/wireframes/drafts/doppel-beh/page.tsx`

---

## Task Breakdown

### 1. Data Structure Updates
- [x] **1.1** Add `doppelBeh?: boolean` field to Patient type (for modal state)
- [x] **1.2** Add `isDoppelBeh?: boolean` field to TreatmentEntry type (for history tracking)
- [x] **1.3** Add `doppelBehGroup?: string` field to TreatmentEntry type (for calendar grouping)
- [x] **1.4** Add `doppelBehGroup?: string` field to Patient type (for calendar operations)

### 2. UI Component Updates
- [x] **2.1** Add "Doppel Beh" checkbox before "Patient Rejected Treatment" checkbox
- [x] **2.2** Implement conditional hiding of "Patient Rejected Treatment" when Doppel Beh is checked
- [x] **2.3** Add logic to disable Doppel Beh checkbox when only 1 treatment remaining
- [x] **2.4** Add state management functions for Doppel Beh checkbox

### 3. Treatment Documentation Logic
- [x] **3.1** Modify `handleSave` function to detect Doppel Beh treatments
- [x] **3.2** Create double treatment entries when Doppel Beh is checked
- [x] **3.3** Increment `completedTreatments` by 2 instead of 1 for Doppel Beh
- [x] **3.4** Generate unique group ID for Doppel Beh treatment pairs
- [x] **3.5** Ensure both entries have same notes and date but different session numbers

### 4. Calendar View Updates
- [ ] **4.1** Update calendar item rendering to show Doppel Beh indicators
- [ ] **4.2** Implement grouped dragging for Doppel Beh treatment pairs
- [ ] **4.3** Update drag start/end logic to handle grouped items
- [ ] **4.4** Visual indication for grouped Doppel Beh treatments
- [ ] **4.5** Update calendar item sorting to keep Doppel Beh pairs together

### 5. Treatment History Display
- [x] **5.1** Update treatment history modal to show Doppel Beh indicators
- [x] **5.2** Display session numbers with Doppel Beh labels (e.g., "Session 1 (Doppel Beh)", "Session 2 (Doppel Beh)")
- [x] **5.3** Ensure Doppel Beh treatments are visually grouped in history
- [x] **5.4** Update treatment count display logic

### 8. Documentation Column Fix (BONUS)
- [x] **8.1** Add missing "Dokumentation" column header to table
- [x] **8.2** Update table grid from cols-10 to cols-11 
- [x] **8.3** Add eye icon button for patients with treatment history
- [x] **8.4** Connect eye icon to toggleDocumentationModal function

### 6. Validation and Edge Cases
- [ ] **6.1** Disable Doppel Beh when `totalTreatments - completedTreatments <= 1`
- [ ] **6.2** Prevent Doppel Beh when patient has rejected treatment
- [ ] **6.3** Handle edge case where Doppel Beh would exceed total treatments
- [ ] **6.4** Add proper error handling and user feedback

### 7. Testing and Verification
- [ ] **7.1** Test Doppel Beh checkbox functionality
- [ ] **7.2** Verify double treatment creation in documentation
- [ ] **7.3** Test calendar grouping and dragging behavior
- [ ] **7.4** Verify treatment history display shows Doppel Beh indicators
- [ ] **7.5** Test edge cases and validation rules
- [ ] **7.6** Verify treatment count increments correctly

---

## Implementation Notes

### Key Requirements Recap:
- **Doppel Beh Level**: Per-treatment, not per-patient/VO
- **Double Entries**: Same notes/content, separate calendar items
- **Calendar Behavior**: Grouped dragging of paired treatments
- **History Display**: Two sessions with Doppel Beh indicator
- **Edge Case**: Disable when only 1 treatment remaining

### Technical Considerations:
- Need to maintain referential integrity between paired treatments
- Calendar drag operations must handle grouped items
- Treatment history sorting should keep pairs together
- Session numbering needs to account for Doppel Beh treatments

---

## Completed Tasks
✅ **Tasks 1-3 Complete**: Data structure updates, UI components, and core treatment documentation logic  
✅ **Task 5 Complete**: Treatment history display updates (Doppel Beh indicators work automatically via session labels)  
✅ **Task 8 Complete**: Documentation column fix (BONUS - restored missing eye icon column)

## Current Focus  
**Ready for Testing**: Core Doppel Beh functionality is complete and Documentation column restored!

## Next Steps After Current Session
- Task 4: Calendar View Updates (grouped dragging)
- Task 6: Validation and Edge Cases  
- Task 7: Testing and Verification 