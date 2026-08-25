# Sửa Search + Confirm - Giữ Nguyên Kết Quả Search

## Vấn đề

Khi search/filter xong ở các bảng, sau khi nhấn **Confirm**, các bảng đang **gọi lại API** và làm **mất kết quả search**.

## Giải pháp

Sau khi confirm, các bảng sẽ:

1.  **Giữ nguyên kết quả search** trong `searchData`
2. **Chỉ update status trong local state**, không fetch lại từ server
3. **Merge dữ liệu mới vào `searchData`** thay vì replace

---

## Các File Đã Sửa

### 1. **AC_SHOE_M** - `src/Dashboard/actf_020_2/AcShoeM.jsx`

#### `handleUpdateConfirm()` - Dòng 564-647

**Trước:**

- Fetch lại AC_PROD_M và AC_SHOE_REF từ server
- Không lưu vào `searchData` khi đang search
- Replace toàn bộ data con

**Sau:**

```javascript
if (isSearch && searchData.length > 0) {
  const selectedParent = selectRows[0];

  // Filter AC_PROD_M theo searchData
  const filteredAcProdM = acProdMResponse?.data?.filter((item) =>
    searchData.some(...)
  ) || [];

  // Filter AC_SHOE_REF theo searchData
  const filteredAcShoeRef = acShoeRefResponse?.data?.filter((item) =>
    searchData.some(...)
  ) || [];

  setSearchData((prevSearchData) => {
    // Xóa data cũ của cha này
    const otherParentsData = prevSearchData.filter(...)
    // Merge AC_PROD_M và AC_SHOE_REF mới
    return [...otherParentsData, ...filteredAcProdM, ...filteredAcShoeRef];
  });
}
```

---

### 2. **AC_PROD_M** - `src/features/bom_2/component/AcProdM.jsx`

#### `handleStatusChange()` - Dòng 420-438

**Trước:**

```javascript
if (response.success) {
  toast.success(`${actionName} success!`);
  await fetchDataByShoe().then(() => { 
    setData(...)
  });
}
```

**Sau:**

```javascript
if (response.success) {
  toast.success(`${actionName} success!`);

  //  Update local data, không fetch lại
  setData((prevData) => {
    return prevData.map((table) => ({
      ...table,
      data: table.data.map((item) =>
        item matches updateData ? updateData : item
      ),
    }));
  });
  setSelectAcProdM([updateData]);
  setJumpToRow(updateData);
}
```

#### Các hàm khác đã sửa:

- `handleEditClose()` - Dòng 181-216: Bỏ `fetchDataByShoe()`, update local data
- `handleOpenEdit()` - Dòng 218-308: Bỏ `fetchDataByShoe()`, update local data
- `handleStatusChange()` - Dòng 328-443: Bỏ `fetchDataByShoe()`, update local data

---

### 3. **AC_SHOE_REF** - `src/features/bom_2/component/AcShoeRef.jsx`

#### Các hàm đã sửa:

- `handleEditClose()` - Dòng 142-177: Bỏ `fetchDataByShoe()`, update local data
- `handleOpenEdit()` - Dòng 179-268: Bỏ `fetchDataByShoe()`, update local data
- `handleStatusChange()` - Dòng 289-403: Bỏ `fetchDataByShoe()`, update local data (đã đúng từ trước)

**Sau:**

```javascript
//  Update local data, không fetch lại
setData((prevData) => {
  return prevData.map((table) => ({
    ...table,
    data: table.data.map((item) =>
      item matches updateData ? updateData : item
    ),
  }));
});
setSelectAcShoeRef([updateData]);
setJumpToRow(updateData);
```

---

## Kiểm Tra

### Test Case 1: Search + Confirm

1.  Search theo filter bất kỳ (ví dụ: prod_acno contains "A")
2.  Chọn 1 record → Confirm
3.  Kiểm tra: Kết quả search vẫn còn, không load lại toàn bộ data
4.  Kiểm tra: Status đã chuyển sang "Confirmed" (7)

### Test Case 2: Search + Edit + Save

1.  Search theo filter
2.  Chọn 1 record → Edit → Thay đổi field → Save
3.  Kiểm tra: Kết quả search vẫn còn
4.  Kiểm tra: Dữ liệu đã được update

### Test Case 3: Multiple Parents + Search + Confirm

1.  Search có nhiều parent records
2.  Chọn parent 1 → Confirm
3.  Chọn parent 2 → Confirm
4.  Kiểm tra: searchData chứa data của cả 2 parents

---

## Kết Quả
-  **Không gọi lại API** sau confirm/edit/cancel
-  **Giữ nguyên kết quả search** trong `searchData`
-  **Update local state** thay vì fetch lại
-  **Performance tốt hơn** - giảm số lần call API

---
const handleCheckBox=(e)=>{
  const b = e.target.current;
  if(b.value !== null){
    setMoment(b);
    console.log("b is max!")
  }
  else{
    b=b-a+d;
  }
}
const onClick =()=>
## Note

- Code pattern này có thể apply cho các bảng khác nếu cần
- Nếu cần refresh data từ server, user có thể clear search filter để reload




 
 
