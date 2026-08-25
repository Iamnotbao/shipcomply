import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  TextField,
  Box,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import SearchIcon from "@mui/icons-material/Search";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";

const Dropdown = ({
  data = [],
  onSelect,
  select = null,
  table = "FACTORY",
  option = "factory",
  isCentered = false,
  getControlLabel = (key, defaultValue) => defaultValue,
  language = "en",
  field = null,
  headerField = null,
  onFetchData,
  totalItems = 0,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  defaultValue = "",
  isSearchMode = false,
}) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [localData, setLocalData] = useState(data);
  const [isOpen, setIsOpen] = useState(false);
  const [apiTotalItems, setApiTotalItems] = useState(totalItems);
  const [apiPageSize, setApiPageSize] = useState(pageSize);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const selectRef = useRef(null);
  const menuItemRefs = useRef({});
  const itemWasSelectedRef = useRef(false);
  const enableApiSearch = !!onFetchData;

  
  console.log("log", getControlLabel("txt_level", "adudu"));
  

  const labelMap = {
    FACTORY: "factory_code",
    DEPARTMENTS: "department_code",
    USER: "user_code",
    PROGRAM: "program_code",
    USER_PERMISSION: "label",
    BASIC_DATA: "code_no",
    AC_SHOE_M: "size_no",
    AC_SHOE_REF: "prod_no",
    MM_ITEM: "item_no",
    AC_ITEM_M: "item_no",
    AC_CONT_M: "cont_no",
    AC_REQ_M: "declaration_category",
    AC_CONT_D: "goods_code",
  };

  const codeMap = {
    FACTORY: "factory_code",
    DEPARTMENTS: "department_code",
    USER: "user_code",
    PROGRAM: "program_code",
    USER_PERMISSION: "value",
    BASIC_DATA: "code_no",
    AC_SHOE_M: "size_no",
    AC_SHOE_M_1: "customs_shoe_id",
    AC_PROD_M_1: "prod_acno",
    AC_SHOE_REF: "prod_no",
    AC_PROD_M: "prod_acno",
    AC_VEND_BASE_1: "code_no",
    AC_VEND_BASE_2: "vend_no",
    AC_REQ_M_3: "invoice_no",
    AC_REQ_M_2: "ac_no",
    AC_SRCORDER_M: [headerField],
    MM_ITEM: "item_no",
    AC_ITEM_M: "item_acno",
    AC_ITEMUNIT: "unit_no",
    PO_VENDER_M: "vend_no",
    AC_CONT_M: "cont_no",
    AC_REQ_M: "declaration_category",
    AC_REQ_M_1: "ac_type",
    AC_CONT_D: "goods_code",
    VW_CONT_IMP: "cont_no",
    VW_CONT_EXP: "cont_no",
    SE_SHIPING_M: "cust_id",
    AC_VEND_BASE: "vend_no",
    SD_ORD_M_C: "value",
    SE_CUST: "cust_id",
    SE_PAY: "pay_no",
    PAKING_LIST_M: "invoice_no",
    SD_ORD_M_C_1: "ship_seq",
    CHG_M: headerField,
    VW_AC_CHG: headerField || "code_no",
    VW_SALES_SH: "col2",
    VW_SALES_SH_1: "code_no",
    AC_EXPECT_M_1: "code_no",
    AC_EXPECT_M: "expect_id",
    AC_CO_M: headerField,
    SE_PLAN_ORD: "se_id",
    VW_AC_ALLCHK: "__composite__",
    AC_IMP_MATERIAL_TRACKING: "invoice_no",
    AC_SEND_BASE: "stoc_type",
    AC_CONT_D_1: "__composite__",
    RD_SIZE_M: "size_type",
    SD_PACK_M: "__composite__",
    VW_AC_CHGSUM:"ac_no",
    USER_1:"supervisor_id",
  };

  const nameMap = {
    FACTORY: {
      en: "factory_name_e",
      vi: "factory_name_l",
      zh: "factory_name_t",
    },
    DEPARTMENTS: {
      en: "department_name_e",
      vi: "department_name_l",
      zh: "department_name_t",
    },
    USER: {
      en: "user_name_e",
      vi: "user_name_l",
      zh: "user_name_t",
    },
    PROGRAM: {
      en: "program_name_e",
      vi: "program_name_l",
      zh: "program_name_t",
    },
    BASIC_DATA: {
      en: "name_e",
      vi: "name_l",
      zh: "name_t",
    },
    AC_VEND_BASE: {
      en: "name",
      vi: "name",
      zh: "name",
    },
    MM_ITEM: {
      en: "name_e",
      vi: "name_l",
      zh: "name_t",
    },
    AC_SHOE_REF: {
      en: "name_e",
      vi: "name_s",
      zh: "name_t",
    },
    AC_ITEM_M: {
      en: "item_acname_e",
      vi: "item_acname_l",
      zh: "item_acname_t",
    },
  };

  const codeField = (() => {
    if (
      table === "VW_AC_ALLCHK" ||
      table === "AC_CONT_D_1" ||
      table === "SD_PACK_M"
    )
      return "__composite__";
    return codeMap[table] || "id";
  })();

  const title = {
    factory: getControlLabel("lddl_factory", "Factory"),
    status: t("Status"),
    department: getControlLabel("lddl_department", "Department"),
    user: field ||"user_code",
    user_1: getControlLabel("lddl_supervisor_id", "Supervisor"),
    users_permission: getControlLabel("txt_level", "adudu"),
    program: getControlLabel("lddl_program", "Program Code"),
    basic_data: field || "",
    ac_shoe_m: field || "",
    ac_shoe_ref: field || "",
    ac_vend_base: field || "",
    ac_req_m: field || "",
    ac_srcorder_m: field || "",
    mm_item: field || "",
    ac_item_m: getControlLabel("itemnm", "Item Name") || "",
    ac_item_m_1: field || "",
    unit: field || "",
    po_vender_m: field || "",
    ac_cont_m: field || "",
    bank_param: field || "",
    bvend_no: field || "",
    goods_code: field || "ac_itemno",
    min_cont: field || "",
    cust_id: field || "",
    se_id: field || "",
    se_ver: field || "",
    se_seq: field || "",
    pack_gu: field || "",
    send_addr: field || "",
    column2: field || "",
    se_cust: field || "",
    ac_itemno: field || "ac_itemno",
    ac_shoe_m_1: field || "ac_shoe_m_1",
    se_pay: field || "se_pay",
    invoice_no: field || "invoice_no",
    packing_seid: field || "packing_seid",
    chg_type: field || "chg_type",
    ac_chgno: field || "ac_chgno",
    ac_no: field || "ac_no",
    cont_no: field || "cont_no",
    stoc_type: field,
    sales_no: field,
    send_type: field,
    send_corp: field,
    type: field,
    expect_id: field,
    print_id: field,
    se_custid: field,
    agent: field,
    item_no: field,
    declaration_category: field,
    loading_way: field,
    vend_no: field,
    ac_send: field,
    ac_type: field,
    vw_ac_allchk: field || "",
    price: field || "",
    in_cont: field || "",
    ac_item: field || "",
    ac_prod_m_1: field || "",
    prod_acno: field || "",
    size_type: field || "",
    in_acno: field || "",
  };
  const normalizeSeq = (val) => {
    if (val === null || val === undefined) return "";
    return parseFloat(val).toFixed(2); // "9" → "9.00", "9.00" → "9.00"
  };
  // selectedCode
  const selectedCode = (() => {
    if (!select || (Array.isArray(select) && select.length === 0)) return "";
    if (table === "VW_AC_ALLCHK") {
      return typeof select === "object"
        ? `${select.chk_no}__${normalizeSeq(select.seq)}`
        : select; // nếu đã là string composite rồi
    }
    if (table === "AC_CONT_D_1") {
      return typeof select === "object"
        ? `${select.cont_no}__${normalizeSeq(select.seq)}`
        : select;
    }

    if (table === "SD_PACK_M") {
      return typeof select === "object"
        ? `${select.se_id}__${normalizeSeq(select.se_seq)}__${select.pack_gu}__${select.se_ver}`
        : select;
    }
    if (typeof select === "object" && !Array.isArray(select)) {
      return select[codeField] || "";
    }
    return select || "";
  })();

  useEffect(() => {
    if (isOpen && onFetchData) {
      setLoading(true);
      (table === "AC_VEND_BASE_2"
        ? onFetchData
        : onFetchData(currentPage, apiPageSize, searchText)
      )
        .then((result) => {
          const responseData = result.data?.data || result.data || result || [];
          const dataArray = Array.isArray(responseData) ? responseData : [];

          const responseTotal = result.data?.total || result.total || 0;
          const responsePageSize = result.data?.pageSize || apiPageSize;
          setLocalData(dataArray);
          setApiTotalItems(parseInt(responseTotal));
          setApiPageSize(parseInt(responsePageSize));
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching dropdown data:", err);
          setLocalData([]);
          setLoading(false);
        });
    }
  }, [currentPage, isOpen, onFetchData, apiPageSize, searchText]);

  //  Effect riêng cho static data (chỉ chạy khi data thay đổi thực sự)
  useEffect(() => {
    if (!onFetchData && data) {
      const dataArray = Array.isArray(data) ? data : [];
      setLocalData(dataArray);
    }
  }, [data, onFetchData]);

  useEffect(() => {
    if (enableApiSearch && searchText !== "") {
      setCurrentPage(1);
    }
  }, [searchText, enableApiSearch]);

  const getDisplayLabel = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;

    const code = item[codeField];

    if (table === "AC_ITEM_M") {
      const itemNo = item.item_acno || item.code_no;
      const itemName =
        item.itemnm ||
        item.item_acname_e ||
        item.item_acname_l ||
        item.item_acname_t ||
        null;
      const ac_item = item.ac_item;
      if (ac_item) {
        return `${ac_item} - ${itemNo} - ${itemName}`;
      }
      if (itemName && itemNo) {
        return `${itemNo} - ${itemName}`;
      }
      return itemNo || code || "";
    }
    if (table === "PAKING_LIST_M") {
      const invNo = item.invoice_no;
      return `${invNo}`;
    }
    if (table === "SD_ORD_M_C_1") {
      const se_id = item.se_id;
      const ship_seq = item.ship_seq;
      const se_custid = item.se_custid;
      return `${se_id}-${ship_seq}-${se_custid}`;
    }
    if (table === "AC_ITEMUNIT") {
      const unitCode = item.unit || item.unit_code || item.code_no;
      const unitName = item.unit_name;

      if (unitName && unitCode) {
        return `${unitCode} - ${unitName}`;
      }
      return unitCode || "";
    }
    if (table === "AC_VEND_BASE_2") {
      const vend_no = item.vend_no || item.code_no;
      const fullName = item.FULLNM_E || item.fullnm_e || item.name;

      if (fullName && vend_no) {
        return `${vend_no} - ${fullName}`;
      }
      return vend_no || code || "";
    }
    if (table === "VW_AC_ALLCHK") {
      return `${item?.chk_no || ""} - ${item?.chk_seq || ""}`;
    }
    if (table === "AC_CONT_D_1" && option === "price") {
      return `${item?.cont_no || ""}-${item?.seq || ""} - ${item?.price || ""}`;
    }
    if (table === "SD_PACK_M" && option === "se_id") {
      return `${item?.se_id || ""}-${item?.se_seq || ""} - ${item?.pack_gu || ""} - ${item?.se_ver || ""}`;
    }
    if (table === "AC_CONT_D_1" && option === "ac_itemno") {
      return `${item?.cont_no || ""}-${item?.seq || ""} - ${item?.goods_code || ""}`;
    }
    if (table === "AC_VEND_BASE_1") {
      const codeName = item.name;
      const codeNo = item.code_no;
      if (codeName && codeNo) return `${codeNo} - ${codeName}`;
      return codeNo || "";
    }
    if (table === "AC_CONT_D" && option === "price") {
      const codeName = item.cont_price;
      const codeNo = item.cont_no;
      const seqNo = item.seq;
      return `${codeNo} - ${codeName} - ${seqNo}`;
    }
    if (table === "BASIC_DATA") {
      const codeName = item.name || item.name_e || item.name_l || item.name_t;
      const codeNo = item.code_no;
      if (codeName && codeNo) return `${codeNo} - ${codeName}`;
      return codeNo || "";
    }
    if (table === "AC_SHOE_M") {
      const size_no = item.size_no;
      if (size_no) return `${size_no}`;
      return size_no || "";
    }
    if (table === "AC_CONT_M" && option === "big_contno") {
      const cont_no = item.cont_no;
      if (cont_no) return `${cont_no}`;
      return cont_no || "";
    }
    if (table === "AC_CONT_M" && option === "bank_param") {
      const bank = item[headerField];
      if (bank) return `${bank}`;
      return bank || "";
    }
    if (table === "AC_REQ_M") {
      const ac_type = item.ac_type;
      if (ac_type) return `${ac_type}`;
      return ac_type || "";
    }
    if (table === "AC_REQ_M_3") {
      const invoice_no = item[headerField];
      if (invoice_no) return `${invoice_no}`;
      return invoice_no || "";
    }
    if (table === "PO_VENDER_M" && option === "po_vender_m") {
      const vend_no = item.vend_no;
      const vend_name = item?.vend_name || "";
      if (vend_name && vend_no) return `${vend_no} - ${vend_name}`;
      return vend_no || "";
    }
    if (table === "AC_SRCORDER_M" && option === "ac_srcorder_m") {
      const ac_type = item[headerField];
      if (ac_type) return `${ac_type}`;
      return ac_type || "";
    }
    if (table === "CHG_M") {
      const val = item[headerField];
      if (val) return `${val}`;
      return val || "";
    }
    if (table === "VW_AC_CHG" && headerField === "stoc_type") {
      const val = item?.code_name;
      if (val) return `${val}`;    
      return val || "";
    }
    if (table === "VW_CONT_IMP" && headerField === "cont_no_1") {


      const val = `${item?.cont_no}-${item?.issued_date}-${item?.expire_date}`;
      if (val) return `${val}`;
      return val || "";
    }
    if (table === "VW_SALES_SH") {
      const val = `${item?.col2}-${item?.sales_date}`;
      if (val) return `${val}`;
      return val || "";
    }
    if (table === "VW_SALES_SH_1") {
      const val = `${item?.code_no}-${item?.name}`;
      if (val) return `${val}`;
      return val || "";
    }
    if (table === "AC_CO_M") {
      const val = item[headerField];
      if (val) return `${val}`;
      return val || "";
    }
    if (table === "SE_PLAN_ORD") {
      const val = `${item?.code_no}-${item?.name}`;
      if (val) return `${val}`;
      return val || "";
    }
    if (nameMap[table]) {
      const nameField = nameMap[table][language] || nameMap[table]["en"];
      const name = item[nameField];
      if (code && name) return `${code} - ${name}`;
      return code || name || "";
    }

    return item[labelMap[table]] || code || "";
  };

  const filteredData = enableApiSearch
    ? localData
    : localData.filter((item) => {
        if (!searchText) return true;
        const displayText = getDisplayLabel(item).toLowerCase();
        return displayText.includes(searchText.toLowerCase());
      });

  useEffect(() => {
    if (isOpen && filteredData.length > 0) {
      const selectedIndex = filteredData.findIndex(
        (d) => (typeof d === "string" ? d : d[codeField]) === selectedCode,
      );
      setFocusedIndex(selectedIndex !== -1 ? selectedIndex : 0);
    }
  }, [isOpen, filteredData.length, selectedCode, codeField]);

  //Auto-scroll khi focusedIndex thay đổi
  useEffect(() => {
    if (isOpen && menuItemRefs.current[focusedIndex]) {
      menuItemRefs.current[focusedIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [focusedIndex, isOpen]);

  const totalPages = onFetchData
    ? Math.ceil(apiTotalItems / apiPageSize)
    : Math.ceil(filteredData.length / pageSize);
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (!isOpen || filteredData.length === 0) return;

      if (!["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) return;

      e.preventDefault();
      e.stopPropagation();

      switch (e.key) {
        case "ArrowDown":
          if (focusedIndex === filteredData.length - 1) {
            if (currentPage < totalPages) {
              setCurrentPage((prev) => prev + 1);
              setFocusedIndex(0);
            }
          } else {
            setFocusedIndex((prev) => prev + 1);
          }
          break;

        case "ArrowUp":
          if (focusedIndex === 0) {
            if (currentPage > 1) {
              setCurrentPage((prev) => prev - 1);
            }
          } else {
            setFocusedIndex((prev) => prev - 1);
          }
          break;

        case "Enter":
          e.preventDefault();
          e.stopPropagation();

          if (
            filteredData[focusedIndex] &&
            menuItemRefs.current[focusedIndex]
          ) {
            menuItemRefs.current[focusedIndex].click();
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleGlobalKeyDown, true);
    }

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, [
    isOpen,
    filteredData,
    focusedIndex,
    currentPage,
    totalPages,
    codeField,
    onSelect,
  ]);

  //  Khi chuyển trang (từ arrow up), set focus vào item cuối
  useEffect(() => {
    if (filteredData.length > 0 && focusedIndex === 0 && currentPage > 1) {
      // Kiểm tra nếu vừa chuyển từ trang sau về (arrow up)
      // Có thể dùng flag hoặc logic phức tạp hơn nếu cần
    }
  }, [filteredData.length, currentPage]);

  const handlePageSizeChange = (e) => {
    e.stopPropagation();
    const newSize = parseInt(e.target.value);
    setApiPageSize(newSize);
    setCurrentPage(1);
    setFocusedIndex(0);
  };

  const handlePrevPage = (e) => {
    e.stopPropagation();
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      setFocusedIndex(0);
    }
  };

  const handleNextPage = (e) => {
    e.stopPropagation();
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      setFocusedIndex(0);
    }
  };

  const pageStartIndex = (currentPage - 1) * apiPageSize;
  const globalFocusedIndex = pageStartIndex + focusedIndex + 1;
  if (onSelect) {
    return (
      <FormControl
        sx={{
          minWidth: 110,
          width: table === "USER_PERMISSION" ? 100 : (table === "USER") ? 380 : (table === "FACTORY"|| table === "DEPARTMENTS") ? 360 : 250,
          display: "flex",
          marginLeft: "auto",
          marginTop: isCentered ? "6px" : "",
        }}
        size="small"
      >
        <InputLabel id="dropdown-select-label">{title[option]}</InputLabel>
        <Select
          ref={selectRef}
          labelId="dropdown-select-label"
          value={selectedCode}
          label={title[option]}
          onOpen={() => setIsOpen(true)}
          onClose={() => {
            if (
              isSearchMode &&
              searchText.trim() !== "" &&
              !itemWasSelectedRef.current
            ) {
              onSelect?.({ [codeField]: searchText.trim() });
            }
            itemWasSelectedRef.current = false; // reset
            setIsOpen(false);
            setSearchText("");
            setCurrentPage(1);
            setFocusedIndex(0);
          }}
          onChange={(e) => {
            const code = e.target.value;
            if (code === "__search__" || code === "__pagination__") return;

            itemWasSelectedRef.current = true; // ← đánh dấu
            const item = localData.find((d) =>
              table === "VW_AC_ALLCHK"
                ? `${d.chk_no}__${d.chk_seq}` === code
                : table === "AC_CONT_D_1"
                  ? `${d.cont_no}__${normalizeSeq(d.seq)}` === code
                  : table === "SD_PACK_M"
                    ? `${d.se_id}__${normalizeSeq(d.se_seq)}__${d.pack_gu}__${d.se_ver}` ===
                      code
                    : d[codeField] === code,
            );
            onSelect(item || { [codeField]: code });
          }}
          renderValue={(selected) => {
            if (
              !selected ||
              selected === "__search__" ||
              selected === "__pagination__"
            )
              return "";

            if (table === "VW_AC_ALLCHK") {
              // selected là string "chkNo__chkSeq"
              const [chkNo, chkSeq] = selected.split("__");
              return `${chkNo} - ${chkSeq}`; // ← hiển thị đúng, không bị [object Object]
            }
            if (table === "AC_CONT_D_1") {
              const parts = selected.split("__");
              const found = (localData.length > 0 ? localData : data).find(
                (d) => `${d.cont_no}__${normalizeSeq(d.seq)}` === selected,
              );
              if (!found) return parts[0];

              // ← phân biệt theo option
              if (option === "price") return String(found.price ?? "");
              if (option === "ac_itemno") return String(found.goods_code ?? "");
              return parts[0];
            }

            if (table === "SD_PACK_M") {
              const parts = selected.split("__");
              const found = (localData.length > 0 ? localData : data).find(
                (d) =>
                  `${d.se_id}__${normalizeSeq(d.se_seq)}__${d.pack_gu}__${d.se_ver}` ===
                  selected,
              );
              if (!found) return parts[0];
              return parts[0];
            }
            const allData =
              Array.isArray(localData) && localData.length > 0
                ? localData
                : Array.isArray(data)
                  ? data
                  : [];

            const selectedItem = allData.find((d) => {
              const itemCode =
                table === "VW_AC_ALLCHK"
                  ? `${d.chk_no}__${d.chk_seq}`
                  : table === "AC_CONT_D_1"
                    ? `${item.cont_no}__${normalizeSeq(item.seq)}`
                    : typeof d === "string"
                      ? d
                      : table === "SD_PACK_M"
                        ? `${d.se_id}__${normalizeSeq(d.se_seq)}__${d.pack_gu}__${d.se_ver}`
                        : d[codeField];
              return itemCode === selected;
            });

            if (!selectedItem) {
              return selected;
            }

            return getDisplayLabel(selectedItem);
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: {
                  xs: "calc(100vh - 100px)", // Mobile: nhiều space hơn
                  sm: "calc(100vh - 96px)", // Desktop
                },
                "& .MuiList-root": {
                  padding: 0,
                },
              },
            },
            autoFocus: false,
            // Thêm marginThreshold nếu cần custom margin
            marginThreshold: 48, // Default là 16, tăng lên nếu cần space
          }}
        >
          {/* Search Box */}
          <MenuItem
            value="__search__"
            disableRipple
            onKeyDown={(e) => {
              if (!["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
                e.stopPropagation();
              }
            }}
            onMouseDown={(e) => e.preventDefault()}
            sx={{
              position: "sticky",
              top: 0,
              backgroundColor: "white !important",
              zIndex: 10,
              padding: "8px",
              borderBottom: "1px solid #e0e0e0",
              "&:hover": {
                backgroundColor: "white !important",
              },
              "&.Mui-selected": {
                backgroundColor: "white !important",
              },
              "&.Mui-focusVisible": {
                backgroundColor: "white !important",
              },
            }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder={t("Search...") || "Search..."}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (!["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
                  e.stopPropagation();
                }
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              inputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </MenuItem>

          {/* Items List */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : filteredData.length > 0 ? (
            filteredData.map((item, index) => {
              const itemCode =
                table === "VW_AC_ALLCHK"
                  ? `${item.chk_no}__${item.chk_seq}`
                  : table === "AC_CONT_D_1"
                    ? `${item.cont_no}__${normalizeSeq(item.seq)}`
                    : typeof item === "string"
                      ? item
                      : table === "SD_PACK_M"
                        ? `${item.se_id}__${normalizeSeq(item.se_seq)}__${item.pack_gu}__${item.se_ver}`
                        : item[codeField];
              const isSelected = itemCode === selectedCode;
              const isFocused = index === focusedIndex;

              return (
                <MenuItem
                  key={`${itemCode}-${index}`}
                  value={itemCode}
                  ref={(el) => {
                    if (el) {
                      menuItemRefs.current[index] = el;
                    }
                  }}
                  // onMouseEnter={() => setFocusedIndex(index)}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  sx={{
                    backgroundColor: isFocused
                      ? "#fff59d !important"
                      : isSelected
                        ? "#e0e0e0 !important"
                        : "transparent",
                    "&:hover": {
                      backgroundColor: "#fff176 !important",
                    },
                  }}
                >
                  {getDisplayLabel(item)}
                </MenuItem>
              );
            })
          ) : (
            <MenuItem disabled>
              <Typography>{t("No results found") || "No results"}</Typography>
            </MenuItem>
          )}

          {/* Pagination */}
          {onFetchData && totalPages > 0 && (
            <MenuItem
              value="__pagination__"
              disableRipple
              onKeyDown={(e) => {
                //  Cho phép arrow keys bubble up
                if (!["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
                  e.stopPropagation();
                }
              }}
              onMouseDown={(e) => e.preventDefault()}
              sx={{
                position: "sticky",
                bottom: 0,
                backgroundColor: "white !important",
                borderTop: "1px solid #e0e0e0",
                padding: "8px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                zIndex: 10,
                gap: 1,
                "&:hover": {
                  backgroundColor: "white !important",
                },
                "&.Mui-selected": {
                  backgroundColor: "white !important",
                },
                "&.Mui-focusVisible": {
                  backgroundColor: "white !important",
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={0.5}>
                <Select
                  size="small"
                  value={apiPageSize}
                  onChange={handlePageSizeChange}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    //  Cho phép arrow keys bubble up
                    if (!["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
                      e.stopPropagation();
                    }
                  }}
                  sx={{
                    minWidth: "60px",
                    height: "28px",
                    "& .MuiSelect-select": {
                      padding: "4px 8px",
                      fontSize: "0.75rem",
                    },
                  }}
                >
                  {pageSizeOptions.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevPage(e);
                  }}
                  disabled={currentPage === 1 || loading}
                >
                  <NavigateBeforeIcon fontSize="small" />
                </IconButton>

                <Typography
                  variant="caption"
                  sx={{
                    minWidth: "100px",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {globalFocusedIndex} / {apiTotalItems}
                </Typography>

                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextPage(e);
                  }}
                  disabled={currentPage === totalPages || loading}
                >
                  <NavigateNextIcon fontSize="small" />
                </IconButton>
              </Box>
            </MenuItem>
          )}
        </Select>
      </FormControl>
    );
  } else {
    return (
      <TextField
        fullWidth
        value={
          selectedCode
            ? getDisplayLabel(
                localData.find((d) => d[codeField] === selectedCode),
              )
            : ""
        }
        label={title[option]}
        inputProps={{ readOnly: true }}
      />
    );
  }
};

export default Dropdown;
