import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Grid,
  Toolbar,
  TextField,
  MenuItem,
  Typography,
  Select,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import SearchBar from "../search/SearchBar";
import { CheckboxCell } from "../table/cells";
import Dropdown from "../dropdown/Dropdown";

const ToolbarKit = forwardRef(
  (
    {
      total = 0,
      onSearch,
      onCancel,
      onConfirm,
      onClose,
      onUnconfirm,
      onPDF,
      onCustomExport,
      onMaterialExport,
      onExcelWithCondition,
      onLink,
      table,
      onAdd,
      onEdit,
      onBom,
      onCopy,
      subTable,
      subTableName,
      getControlLabel,
      isPopup,
      isHide,
      onDirectImport,
      onVNImport,
      onCheckMax,
      isCheckMax,
      onExtend,
      onConfirmAll,
      onApprove,
      onAddContractNumber,
      isLoadingBom,
      language,
      onFetchData,
      dropDownValues,
      setDropdownValues,
      onAutoAdd,
      onExchangeRate,
      onPlanOrd,
      onPlanDate,
      onPDD,
      onDelete,
      onConfirmPD,
      onRefreshGW,
      onRefreshSeq,
      type,
      onGenerateGC,
      onTransfer,
      onRefreshPrice,
      onReport,
      onSelectCustoms,
      onUpdateNWGW,
      getFetchData = {},
      onInvoicePrint,
      onExcelDetail,
      onExcelSummary,
      onCalculateTrial,
      onUnclose,
      onOutExcel,
      onVerifyRemain,
      onRestoreStatus,
      onExcel2,
      onGenOrderMaterial,
      onCalculateWriteOff,
      onExcelShoe,
      onExcelWriteOff,
      onImportShipment,
      onExportSummary,
      onCustomReport,
      onImport,
      fileInputRef,
      importFileName,
      setImportFileName,
      onMaterialOut,
      onMaterialEnd,
      onShipOrder,
      onPp026Excel,
      onClearImport,
      onGeneratePM,
      onImportLink,
    },
    ref,
  ) => {
    const navigation = useNavigate();
    const { t } = useTranslation();
    const [searchValue, setSearchValue] = useState({});
    useImperativeHandle(
      ref,
      () => ({
        setSearchValue,
        setDropdownValues,
        getSearchValue: () => searchValue,
      }),
      [searchValue, setDropdownValues],
    );
    const statusMap = {
      Cancel: 0,
      New: 1,
      Confirm: 7,
      Close: 9,
    };

    const statusOptions = [
      { label: getControlLabel("ddl_New-1", "New-1") || "New-1", value: "New" },
      {
        label: getControlLabel("ddl_Cancel-0", "Cancel-0") || "Cancel-0",
        value: "Cancel",
      },
      {
        label: getControlLabel("ddl_Confirm-7", "Confirm-7") || "Confirm-7",
        value: "Confirm",
      },
      {
        label: getControlLabel("ddl_Close-9", "Close-9") || "Close-9",
        value: "Close",
      },
    ];
    const mapAdd = {
      FACTORY: {
        path: "/factory/add",
        filter: [
          {
            title: getControlLabel("lbl_factory_code", "factory_code"),
            name: "factory_code",
          },
          {
            title: getControlLabel("lbl_factory_name", "factory_name"),
            name: "factory_name",
          },
          {
            title: getControlLabel("lbl_status", "status"),
            name: "status",
            type: "dropdown",
          },
        ],
        size: {
          left: {
            xs: 6,
            md: 10,
          },
          right: {
            xs: 6,
            md: 2,
          },
        },
      },
      PERMISSION: {
        path: "/users_permission/add",
        hideButtons: [getControlLabel("btn_edit", "Edit")],
        filter: [
          {
            title: getControlLabel("lbl_factory_code", "factory_code"),
            name: "factory_code",
          },
          {
            title: getControlLabel("lbl_factory_name", "factory_name"),
            name: "factory_name",
          },
          {
            title: getControlLabel("lbl_user_code", "user_code"),
            name: "user_code",
          },
          {
            title: getControlLabel("lbl_user_name", "user_name"),
            name: "user_name",
          },
          {
            title: getControlLabel("lbl_program_code", "program_code"),
            name: "program_code",
          },
        ],
        size: {
          left: {
            xs: 6,
            md: 10,
          },
          right: {
            xs: 6,
            md: 2,
          },
        },
      },
      USER_PERMISSION: {
        path: "/users_permission/add",
        hideButtons: [getControlLabel("btn_search", "Search")],
        size: {
          left: {
            xs: 6,
            md: 10,
          },
          right: {
            xs: 6,
            md: 2,
          },
        },
      },
      USER: {
        path: "/user/add",
        filter: [
          {
            title: getControlLabel("lbl_factory_code", "factory_code"),
            name: "factory_code",
          },
          {
            title: getControlLabel("lbl_factory_name", "factory_name"),
            name: "factory_name",
          },
          {
            title: getControlLabel("lbl_department_code", "department_code"),
            name: "department_code",
          },
          {
            title: getControlLabel("lbl_user_code", "user_code"),
            name: "user_code",
          },
          {
            title: getControlLabel("lbl_user_name", "user_name"),
            name: "user_name",
          },
          {
            title: getControlLabel("lbl_supervisor_id", "supervisor_id"),
            name: "supervisor_id",
          },
          {
            title: getControlLabel(
              "lbl_allow_authorization",
              "allow_authorization",
            ),
            name: "allow_authorization",
          },
          {
            title: getControlLabel("lbl_status", "status"),
            name: "status",
            type: "dropdown",
          },
        ],
        size: {
          left: {
            xs: 6,
            md: 10,
          },
          right: {
            xs: 6,
            md: 2,
          },
        },
      },
      DEPARTMENTS: {
        path: "/departments/add",
        filter: [
          {
            title: getControlLabel("lbl_factory_code", "factory_code"),
            name: "factory_code",
          },
          {
            title: getControlLabel("lbl_factory_name", "factory_name"),
            name: "factory_name",
          },
          {
            title: getControlLabel("lbl_department_code", "department_code"),
            name: "department_code",
          },
          {
            title: getControlLabel("lbl_department_name", "department_name"),
            name: "department_name",
          },
          {
            title: getControlLabel("lbl_status", "status"),
            name: "status",
            type: "dropdown", // Đánh dấu là dropdown
          },
        ],
        size: {
          left: {
            xs: 6,
            md: 10,
          },
          right: {
            xs: 6,
            md: 2,
          },
        },
      },
      PROGRAM: {
        path: "/program/add",
        filter: [
          {
            title: getControlLabel("lbl_program_code", "program_code"),
            name: "program_code",
          },
          {
            title: getControlLabel("lbl_program_name", "program_name"),
            name: "program_name",
          },
          {
            title: getControlLabel("lbl_status", "status"),
            name: "status",
            type: "dropdown",
          },
        ],
        size: {
          left: {
            xs: 6,
            md: 10,
          },
          right: {
            xs: 6,
            md: 2,
          },
        },
      },
      PROGRAM_FIELD_TITLE: {
        filter: [
          {
            title: getControlLabel("lbl_program_code", "program_code"),
            name: "program_code",
          },
          {
            title: getControlLabel("lbl_program_name", "program_name"),
            name: "program_name",
          },
          {
            title: getControlLabel("lbl_field_code", "field_code"),
            name: "field_code",
          },
          {
            title: getControlLabel("lbl_title_name", "title_name"),
            name: "title_name",
          },
          {
            title: getControlLabel("lbl_status", "status"),
            name: "status",
            type: "dropdown",
          },
        ],
        size: {
          left: {
            xs: 6,
            md: 10,
          },
          right: {
            xs: 6,
            md: 2,
          },
        },
      },
      BASIC_DATA_CATEGORY: {
        filter: [
          {
            title: getControlLabel("lbl_category_code", "category_code"),
            name: "category_code",
          },
          {
            title: getControlLabel("lbl_category_name", "category_name"),
            name: "category_name",
          },
          {
            title: getControlLabel("lbl_code", "code_no"),
            name: "code_no",
          },
          {
            title: getControlLabel("lbl_name", "name"),
            name: "name",
          },
          {
            title: getControlLabel("lbl_status", "status"),
            name: "status",
            type: "dropdown",
          },
        ],
        size: {
          left: {
            xs: 6,
            md: 10,
          },
          right: {
            xs: 6,
            md: 2,
          },
        },
      },
      BASIC_DATA: {
        path: "/users_permission/add",
        hideButtons: [
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_export", "Export"),
        ],
        size: {
          left: {
            xs: 6,
            md: 10,
          },
          right: {
            xs: 6,
            md: 2,
          },
        },
      },
      AC_IMP_MATERIAL_TRACKING: {
        filter: [
          {
            title: getControlLabel("lbl_invoice_no", "invoice_no"),
            name: "invoice_no",
          },
          {
            title: getControlLabel(
              "lbl_declaration_category",
              "declaration_category",
            ),
            name: "declaration_category",
            type: "dropdown",
            fetchKey: "declaration_category",
            tableName: "BASIC_DATA",
          },
          {
            title: getControlLabel("lbl_loading_way", "loading_way"),
            name: "loading_way",
            type: "dropdown",
            fetchKey: "loading_way",
            tableName: "BASIC_DATA",
          },
          {
            title: getControlLabel("lbl_status", "status"),
            name: "status",
            type: "dropdown",
          },
          {
            title: getControlLabel("lbl_record_date", "Record Date"),
            name: "record_date",
            type: "date",
          },
          {
            title: getControlLabel(
              "lbl_estimated_delivery_date",
              "Est. Delivery Date ",
            ),
            name: "estimated_delivery_date",
            type: "date",
          },
          {
            title: getControlLabel(
              "lbl_actual_delivery_date",
              "Actual Delivery Date ",
            ),
            name: "actual_delivery_date",
            type: "date",
          },
          {
            title: getControlLabel(
              "lbl_declaration_retrieve_date",
              "Declaration Retrieve Date ",
            ),
            name: "declaration_retrieve_date",
            type: "date",
          },
        ],
        size: {
          left: {
            xs: 6,
            md: 10,
          },
          right: {
            xs: 6,
            md: 2,
          },
        },
      },
      AC_ITEM_M: {
        filter: [
          {
            title: getControlLabel("lbl_item_acno", "item_acno"),
            name: "item_acno",
          },
          {
            title: getControlLabel("lbl_item_no", "item_no"),
            name: "item_no",
            type: "dropdown",
          },
          {
            title: getControlLabel("lbl_ac_item", "ac_item"),
            name: "ac_item",
            type: "dropdown",
          },
          {
            title: getControlLabel("lbl_status", "status"),
            name: "status",
            type: "dropdown",
          },
        ],
        size: {
          left: {
            xs: 6,
            md: 10,
          },
          right: {
            xs: 6,
            md: 2,
          },
        },
      },
      AC_ITEM_REF: {
        hideButtons: !isPopup
          ? [
              getControlLabel("btn_search", "Search"),
              getControlLabel("btn_export", "Export"),
              getControlLabel("btn_cancel", "Cancel"),
            ]
          : [
              getControlLabel("btn_add", "Add"),
              getControlLabel("btn_edit", "Edit"),
              getControlLabel("btn_close", "Close"),
              getControlLabel("btn_confirm", "Confirm"),
              getControlLabel("btn_unconfirm", "Unconfirm"),
              getControlLabel("btn_cancel", "Cancel"),
            ],
        filter: isPopup
          ? [
              {
                title: getControlLabel("lbl_item_no", "item_no"),
                name: "item_no",
                type: "dropdown",
              },
              {
                title: getControlLabel("lbl_item_unit", "item_unit"),
                name: "item_unit",
                type: "dropdown",
              },
              {
                title: getControlLabel("lbl_formula", "formula"),
                name: "formula",
                typeInput: "number",
                type: "dropdown",
              },
              {
                title: getControlLabel("lbl_status", "status"),
                name: "status",
                type: "dropdown",
              },
            ]
          : [],
      },
      AC_BOM_M: {
        filter: [
          {
            title: getControlLabel("lbl_prod_acno", "prod_acno"),
            name: "prod_acno",
          },
          {
            title: getControlLabel("lbl_item_acno", "item_acno"),
            name: "item_acno",
          },
          {
            title: getControlLabel("lbl_status", "status"),
            name: "status",
            type: "dropdown",
          },
        ],
        size: {
          left: {
            xs: 6,
            md: 10,
          },
          right: {
            xs: 6,
            md: 2,
          },
        },
      },
      AC_SHOE_M: {
        filter: [
          {
            title: getControlLabel("lbl_customs_shoe_id", "customs_shoe_id"),
            name: "customs_shoe_id",
          },
          {
            title: getControlLabel("lbl_customs_tariff", "customs_tariff"),
            name: "customs_tariff",
          },
          {
            title: getControlLabel("lbl_status", "status"),
            name: "status",
            type: "dropdown",
          },
        ],
        size: {
          left: {
            xs: 6,
            md: 10,
          },
          right: {
            xs: 6,
            md: 2,
          },
        },
      },
      AC_SHOE_REF: {
        hideButtons: [
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_export", "Export"),
          getControlLabel("btn_cancel", "Cancel"),
        ],
      },
      AC_PROD_M: {
        hideButtons: [getControlLabel("btn_export", "Export")],
        filter: [
          {
            title: getControlLabel("lbl_prod_acno", "prod_acno"),
            name: "prod_acno",
          },
          {
            title: getControlLabel("lbl_status", "status"),
            name: "status",
            type: "dropdown",
          },
        ],
        size: {
          left: {
            xs: 6,
            md: 10,
          },
          right: {
            xs: 6,
            md: 2,
          },
        },
      },
      RD_SIZE_D: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_export", "Export"),
        ],
        filter: [
          {
            title: getControlLabel("lbl_size_no", "size_no"),
            name: "size_no",
          },
        ],
      },
      VW_AC_SHOEBOM: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_cancel", "Cancel"),
        ],
        filter: [
          {
            title: getControlLabel("lbl_customs_shoe_id", "customs_shoe_id"),
            name: "customs_shoe_id",
          },
          {
            title: getControlLabel("lbl_item_acno", "item_acno"),
            name: "item_acno",
          },
          {
            title: getControlLabel("lbl_prod_acno", "prod_acno"),
            name: "prod_acno",
          },
          {
            title: getControlLabel("lbl_size_type", "size_type"),
            name: "size_type",
          },
        ],
      },
      SE_PAY: {
        hideButtons: [
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      AC_VEND_BASE: {
        filter: [
          {
            title: getControlLabel("vend_no", "vend_no"),
            type: "dropdown",
            fetchKey: "vend_no",
            tableName: "AC_VEND_BASE",
            name: "vend_no",
          },
          {
            title: getControlLabel("ac_send", "ac_send"),
            type: "dropdown",
            fetchKey: "ac_send",
            tableName: "BASIC_DATA",
            name: "ac_send",
          },
        ],
        hideButtons: [getControlLabel("btn_export", "Export")],
      },
      AC_SEND_BASE: {
        hideButtons: [
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      AC_REQ_M: {
        filter: [
          {
            title: getControlLabel("req_no", "req_no"),
            name: "req_no",
          },
          {
            title: getControlLabel("invoice_no", "invoice_no"),
            name: "invoice_no",
          },
          {
            title: getControlLabel("vend_no", "vend_no"),
            type: "dropdown",
            fetchKey: "vend_no",
            tableName: "AC_VEND_BASE",
            name: "vend_no",
          },
          {
            title: getControlLabel("ac_type", "ac_type"),
            type: "dropdown",
            fetchKey: "ac_type",
            tableName: "BASIC_DATA",
            name: "ac_type",
          },
          {
            title: getControlLabel("order_no", "order_no"),
            name: "order_no",
            type: "dropdown",
          },
          {
            title: getControlLabel("req_date", "Req_date"),
            name: "req_date",
            type: "date",
          },
          {
            title: getControlLabel("lbl_status", "status"),
            name: "status",
            type: "dropdown",
          },
        ],
      },
      AC_SRCORDER_M: {
        filter: [
          {
            title: getControlLabel("vend_no", "vend_no"),
            name: "vend_no",
          },
          {
            title: getControlLabel("order_no", "order_no"),
            name: "order_no",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
          {
            title: getControlLabel("lbl_item_acno", "item_acno"),
            name: "item_acno",
          },
          {
            title: getControlLabel("lbl_status", "status"),
            name: "status",
            type: "dropdown",
          },
        ],
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      AC_REQ_ORDER: {
        hideButtons: !isHide
          ? [
              getControlLabel("btn_add", "Add"),
              getControlLabel("btn_export", "Export"),
              getControlLabel("btn_search", "Search"),
            ]
          : [
              getControlLabel("btn_add", "Add"),
              getControlLabel("btn_edit", "Edit"),
              getControlLabel("btn_close", "Close"),
              getControlLabel("btn_confirm", "Confirm"),
              getControlLabel("btn_unconfirm", "Unconfirm"),
              getControlLabel("btn_cancel", "Cancel"),
              getControlLabel("btn_export", "Export"),
              getControlLabel("btn_search", "Search"),
            ],
      },
      VW_AC_SRCORDER: {
        filter: [
          {
            title: getControlLabel("order_no", "order_no"),
            name: "order_no",
          },
          {
            title: getControlLabel("chk_no", "chk_no"),
            name: "chk_no",
          },
          {
            title: getControlLabel("ac_code", "ac_code"),
            name: "ac_code",
            type: "dropdown",
          },
          {
            title: getControlLabel("lbl_item_acno", "item_acno"),
            name: "item_acno",
            type: "dropdown",
          },
          {
            title: getControlLabel("lbl_status", "status"),
            name: "status",
            type: "dropdown",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
          {
            title: getControlLabel("lbl_is_max", "Is max"),
            name: "is_max",
            type: "checkbox",
          },
        ],
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_export", "Export"),
          getControlLabel("btn_cancel", "Cancel"),
        ],
      },
      VW_AC_ALLCHK: {
        filter: [
          {
            title: getControlLabel("chk_no", "chk_no"),
            name: "chk_no",
          },
          {
            title: getControlLabel("order_no", "order_no"),
            name: "order_no",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
          {
            title: getControlLabel("ac_type", "ac_type"),
            name: "ac_type",
          },
        ],
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      VW_CONT_IMP: {
        filter: [
          {
            title: getControlLabel("lbl_cont_no", "cont_no"),
            name: "cont_no",
          },
          {
            title: getControlLabel("lbl_status", "status"),
            name: "status",
            type: "dropdown",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
        ],
      },
      IV_TRANS_D_TW: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_cancel", "Search"),
          getControlLabel("btn_export", "Export"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
        ],
      },
      AC_INM_M: {
        filter: [
          {
            title: getControlLabel("lbl_inm_no", "inm_no"),
            name: "inm_no",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
          {
            title: getControlLabel("lbl_status", "status"),
            name: "status",
            type: "dropdown",
          },
        ],
      },
      AC_CONT_D: {
        hideButtons: [
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      VW_CONT_USE: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_export", "Export"),
          getControlLabel("btn_search", "Search"),
        ],
      },
      VW_CHG_EXMP: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_export", "Export"),
          getControlLabel("btn_search", "Search"),
        ],
      },
      VW_APDUE_ALL: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_search", "Search"),
        ],
      },
      AC_PLAN_ORD: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      AC_PLAN_SIZE: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      AC_PLAN_PACK: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      AC_INM_D: {
        hideButtons: [
          getControlLabel("btn_export", "Export"),
          getControlLabel("btn_search", "Search"),
        ],
      },
      VW_CHG_M: {
        filter: [
          {
            title: getControlLabel("ac_no", "ac_no"),
            name: "ac_no",
          },
          {
            title: getControlLabel("cont_no", "cont_no"),
            name: "cont_no",
          },
          {
            title: getControlLabel("com_invoice", "com_invoice"),
            name: "com_invoice",
          },
          {
            title: getControlLabel("vend_no", "vend_no"),
            name: "vend_no",
          },
          {
            title: getControlLabel("status", "status"),
            name: "status",
            type: "dropdown",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
        ],
      },
      AC_CHG_D:
        type === "2"
          ? {
              hideButtons: [
                getControlLabel("btn_export", "Export"),
                getControlLabel("btn_search", "Search"),
                getControlLabel("btn_add", "Add"),
              ],
            }
          : {
              hideButtons: [
                getControlLabel("btn_export", "Export"),
                getControlLabel("btn_search", "Search"),
              ],
            },
      VW_ACREQ_D: {
        hideButtons: [
          getControlLabel("btn_export", "Export"),
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      AC_CHG_A: {
        hideButtons: [
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      AC_DESC_CHG: {
        hideButtons: [
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      AC_PROC_D: {
        hideButtons: [
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      AC_DESC_PROC: {
        hideButtons: [
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      AC_PROC_M: {
        filter: [
          {
            title: getControlLabel("in_cont", "in_cont"),
            name: "in_cont",
          },
          {
            title: getControlLabel("ac_no", "ac_no"),
            name: "ac_no",
          },
          {
            title: getControlLabel("com_invoice", "com_invoice"),
            name: "com_invoice",
          },
          {
            title: getControlLabel("in_type", "in_type"),
            name: "in_type",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
          {
            title: getControlLabel("status", "status"),
            name: "status",
            type: "dropdown",
          },
        ],
      },
      AC_PROC_M_1: {
        filter: [
          {
            title: getControlLabel("in_cont", "in_cont"),
            name: "in_cont",
          },
          {
            title: getControlLabel("ac_no", "ac_no"),
            name: "ac_no",
          },
          {
            title: getControlLabel("in_type", "in_type"),
            name: "in_type",
          },
          {
            title: getControlLabel("com_invoice", "com_invoice"),
            name: "com_invoice",
          },
          {
            title: getControlLabel("rec_person", "rec_person"),
            name: "rec_person",
          },
          {
            title: getControlLabel("status", "status"),
            name: "status",
            type: "dropdown",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
        ],
      },
      SE_SHIPING_M: {
        filter: [
          {
            title: getControlLabel("cust_id", "cust_id"),
            name: "cust_id",
          },
          {
            title: getControlLabel("status", "Status"),
            name: "status",
            type: "dropdown",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
        ],
      },
      SE_SHIPING_D: {
        hideButtons: [
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      SE_PLAN_ORD: {
        filter: [
          {
            title: getControlLabel("cust_no", "cust_no"),
            name: "cust_no",
          },
          {
            title: getControlLabel("se_id", "se_id"),
            name: "se_id",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
          {
            title: getControlLabel("hg_stoc", "hg_stoc"),
            name: "hg_stoc",
          },
          {
            title: getControlLabel("agent", "agent"),
            name: "agent",
          },

          {
            title: getControlLabel("ex_status", "ex_status"),
            name: "ex_status",
          },

          {
            title: getControlLabel("status", "Status"),
            name: "status",
            type: "dropdown",
          },
        ],
        hideButtons: [getControlLabel("btn_cancel", "Cancel")],
      },
      SE_PLAN_SIZE: {
        hideButtons: [
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_export", "Export"),
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_cancel", "Cancel"),
        ],
      },
      SD_ORD_M_C: {
        filter: [
          {
            title: getControlLabel("cust_id", "cust_id"),
            name: "cust_id",
          },
          {
            title: getControlLabel("se_id", "se_id"),
            name: "se_id",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
        ],
        hideButtons: [
          getControlLabel("btn_export", "Export"),
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_cancel", "Cancel"),
        ],
      },
      VW_CONT_EXP: {
        filter: [
          {
            title: getControlLabel("lbl_cont_no", "cont_no"),
            name: "cont_no",
          },
          {
            title: getControlLabel("lbl_status", "status"),
            name: "status",
            type: "dropdown",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
        ],
      },
      SD_ORD_M: {
        filter: [
          {
            title: getControlLabel("se_id", "se_id"),
            name: "se_id",
          },
          {
            title: getControlLabel("se_custid", "se_custid"),
            name: "se_custid",
          },
          {
            title: getControlLabel("prod_no", "prod_no"),
            name: "prod_no",
          },
          {
            title: getControlLabel("price_status", "price_status"),
            name: "price_status",
          },
          {
            title: getControlLabel("status", "status"),
            name: "status",
            type: "dropdown",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
        ],
        hideButtons: [
          getControlLabel("btn_export", "Export"),
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      SD_PRICE_ITEM: {
        hideButtons: [
          getControlLabel("btn_export", "Export"),
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      VW_CHG_EXP: {
        filter: [
          {
            title: getControlLabel("ac_no", "ac_no"),
            name: "ac_no",
          },
          {
            title: getControlLabel("ac_chgno", "ac_chgno"),
            name: "ac_chgno",
          },
          {
            title: getControlLabel("chg_type", "chg_type"),
            name: "chg_type",
          },
          {
            title: getControlLabel("cont_no", "cont_no"),
            name: "cont_no",
          },
          {
            title: getControlLabel("se_id", "se_id"),
            name: "se_id",
          },
          {
            title: getControlLabel("ship_seq", "ship_seq"),
            name: "ship_seq",
          },
          {
            title: getControlLabel("status", "status"),
            name: "status",
            type: "dropdown",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
        ],
      },
      PLAN_ORD: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_export", "Export"),
        ],
        filter: [
          {
            title: getControlLabel("se_id", "se_id"),
            name: "se_id",
          },
          {
            title: getControlLabel("se_custid", "se_custid"),
            name: "se_custid",
          },
          {
            title: getControlLabel("agent", "agent"),
            name: "agent",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
        ],
      },
      CHG_M: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_export", "Export"),
        ],
        filter: [
          {
            title: getControlLabel("ac_chgno", "ac_chgno"),
            name: "ac_chgno",
            type: "dropdown",
            fetchKey: "ac_chgno",
            tableName: "CHG_M",
          },
          {
            title: getControlLabel("ac_no", "ac_no"),
            name: "ac_no",
            type: "dropdown",
            fetchKey: "ac_no",
            tableName: "CHG_M",
          },
          {
            title: getControlLabel("cont_no", "cont_no"),
            name: "cont_no",
            type: "dropdown",
            fetchKey: "cont_no",
            tableName: "CHG_M",
          },
          {
            title: getControlLabel("chg_type", "chg_type"),
            name: "chg_type",
            type: "dropdown",
            fetchKey: "chg_type",
            tableName: "BASIC_DATA",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
        ],
      },
      SE_INV_D: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_export", "Export"),
          getControlLabel("btn_search", "Search"),
        ],
      },
      SD_PRICE_ITEM_1: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_export", "Export"),
          getControlLabel("btn_search", "Search"),
        ],
      },
      SE_INV_M: {
        filter: [
          {
            title: getControlLabel("invoice_id", "invoice_id"),
            name: "invoice_id",
          },
          {
            title: "Number Range",
            name: "number_group",
            type: "numberRangeGroup",
          },
          {
            title: getControlLabel("ac_no", "ac_no"),
            name: "ac_no",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
          {
            title: getControlLabel("lbl_status", "status"),
            name: "status",
            type: "dropdown",
          },
        ],
        hideButtons: [getControlLabel("btn_add", "Add")],
      },
      PAKING_LIST_M: {
        filter: [
          {
            title: getControlLabel("invoice_no", "invoice_no"),
            name: "invoice_no",
            type: "dropdown",
            fetchKey: "invoice_no",
            tableName: "PAKING_LIST_M",
          },
          {
            title: getControlLabel("packing_seid", "packing_seid"),
            name: "packing_seid",
            type: "dropdown",
            fetchKey: "packing_seid",
            tableName: "SD_ORD_M_C_1",
          },
          {
            title: getControlLabel("se_seq", "se_seq"),
            name: "se_seq",
          },
          {
            title: getControlLabel("pack_gu", "pack_gu"),
            name: "pack_gu",
          },
          {
            title: getControlLabel("ship_seq", "ship_seq"),
            name: "ship_seq",
          },
        ],
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_edit", "Edit"),
        ],
      },
      PAKING_LIST_D: {
        hideButtons: [
          getControlLabel("btn_export", "Export"),
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_search", "Search"),
        ],
      },
      VW_AC_ISSUE_T: {
        hideButtons: [
          getControlLabel("btn_export", "Export"),
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_search", "Search"),
        ],
      },
      AC_ISSUE_M_T: {
        filter: [
          {
            title: getControlLabel("s_chgno", "s_chgno"),
            name: "s_chgno",
          },
          {
            title: getControlLabel("cont_no", "cont_no"),
            name: "cont_no",
          },
          {
            title: getControlLabel("se_id", "se_id"),
            name: "se_id",
          },
          {
            title: getControlLabel("status", "status"),
            name: "status",
            type: "dropdown",
          },
          {
            title: getControlLabel("ship_seq", "ship_seq"),
            name: "ship_seq",
          },
          {
            title: getControlLabel("com_invoice", "com_invoice"),
            name: "com_invoice",
          },
          {
            title: getControlLabel("vend_no", "vend_no"),
            name: "vend_no",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
        ],
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_cancel", "Cancel"),
        ],
      },
      AC_ISSUE_MATD_T: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_export", "Export"),
          getControlLabel("btn_search", "Search"),
        ],
      },
      AC_CHK_T: {
        hideButtons: [
          getControlLabel("btn_export", "Export"),
          getControlLabel("btn_search", "Search"),
        ],
      },
      VW_AC_SUM: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_cancel", "Cancel"),
        ],
        filter: [
          {
            title: getControlLabel("ac_itemno", "ac_itemno"),
            type: "dropdown",
            fetchKey: "ac_itemno",
            tableName: "VW_AC_CHG",
            name: "ac_itemno",
          },
          {
            title: getControlLabel("stoc_type", "stoc_type"),
            type: "dropdown",
            fetchKey: "stoc_type",
            tableName: "VW_AC_CHG",
            name: "stoc_type",
          },
        ],
      },
      VW_AC_CHGSUM: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_cancel", "Cancel"),
        ],
        filter: [
          {
            title: getControlLabel("src", "src"),
            type: "dropdown",
            fetchKey: "src",
            tableName: "VW_AC_CHG",
            name: "src",
          },
          {
            title: getControlLabel("ac_itemno", "ac_itemno"),
            type: "dropdown",
            fetchKey: "ac_itemno",
            tableName: "VW_AC_CHG",
            name: "ac_itemno",
          },
          {
            title: getControlLabel("ac_chgno", "ac_chgno"),
            type: "dropdown",
            fetchKey: "ac_chgno",
            tableName: "VW_AC_CHG",
            name: "ac_chgno",
          },
          {
            title: getControlLabel("cont_no", "cont_no"),
            type: "dropdown",
            fetchKey: "cont_no",
            tableName: "VW_CONT_IMP",
            name: "cont_no",
          },
          {
            title: getControlLabel("stoc_type", "stoc_type"),
            type: "dropdown",
            fetchKey: "stoc_type",
            tableName: "VW_AC_CHG",
            name: "stoc_type",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
        ],
      },
      VW_AC_CHK_T: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      SE_SALES: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_cancel", "Cancel"),
        ],
        filter: [
          {
            title: getControlLabel("sales_id", "sales_id"),
            type: "dropdown",
            fetchKey: "sales_no",
            tableName: "VW_SALES_SH",
            name: "sales_no",
          },
          {
            title: getControlLabel("send_type", "send_type"),
            type: "dropdown",
            fetchKey: "send_type",
            tableName: "VW_SALES_SH_1",
            name: "send_type",
          },
          {
            title: getControlLabel("send_corp", "send_corp"),
            type: "dropdown",
            fetchKey: "send_corp",
            tableName: "BASIC_DATA",
            name: "send_corp",
          },

          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
          {
            title: getControlLabel("se_id", "se_id"),
            name: "se_id",
          },
        ],
      },
      SE_SALES_D: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      AC_EXPECT_M: {
        hideButtons: [
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_cancel", "Cancel"),
        ],
        filter: [
          {
            title: getControlLabel("type", "type"),
            type: "dropdown",
            fetchKey: "type",
            tableName: "AC_EXPECT_M_1",
            name: "type",
          },
          {
            title: getControlLabel("expect_id", "expect_id"),
            type: "dropdown",
            fetchKey: "expect_id",
            tableName: "AC_EXPECT_M",
            name: "expect_id",
          },
        ],
      },
      AC_EXPECT_SE: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      AC_EXPECT_MATD: {
        hideButtons: [
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      AC_CO_M: {
        hideButtons: [
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_export", "Export"),
        ],
        filter: [
          {
            title: getControlLabel("cust_id", "cust_id"),
            type: "dropdown",
            fetchKey: "cust_id",
            tableName: "SE_CUST_M",
            name: "cust_id",
          },
          {
            title: getControlLabel("print_id", "print_id"),
            type: "dropdown",
            fetchKey: "print_id",
            tableName: "AC_CO_M",
            name: "print_id",
          },
          {
            title: getControlLabel("se_id", "se_id"),
            type: "dropdown",
            fetchKey: "se_id",
            tableName: "AC_CO_M",
            name: "se_id",
          },
          {
            title: getControlLabel("status", "Status"),
            name: "status",
            type: "dropdown",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
        ],
      },
      SE_PLAN_ORD_LINK: {
        hideButtons: [
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_export", "Export"),
        ],
        filter: [
          {
            title: getControlLabel("se_custid", "se_custid"),
            type: "dropdown",
            fetchKey: "se_custid",
            tableName: "SE_CUST",
            name: "se_custid",
          },
          {
            title: getControlLabel("agent", "agent"),
            type: "dropdown",
            fetchKey: "agent",
            tableName: "SE_PLAN_ORD",
            name: "agent",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
        ],
      },
      RD_TEMP: {
        hideButtons: [
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_export", "Export"),
        ],
        filter: [
          {
            title: getControlLabel("item_no", "item_no"),
            type: "dropdown",
            fetchKey: "item_no",
            tableName: "MM_ITEM",
            name: "item_no",
          },
          {
            title: "Date Range",
            name: "date_group",
            type: "dateRangeGroup",
          },
        ],
      },
      TEXT_IMPORT: {
        hideButtons: [
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_export", "Export"),
        ],
      },
      SAP_TRANS_TYPE: {
        hideButtons: [
          getControlLabel("btn_search", "Search"),
          getControlLabel("btn_close", "Close"),
          getControlLabel("btn_unconfirm", "Unconfirm"),
          getControlLabel("btn_confirm", "Confirm"),
          getControlLabel("btn_cancel", "Cancel"),
          getControlLabel("btn_add", "Add"),
          getControlLabel("btn_edit", "Edit"),
          getControlLabel("btn_export", "Export"),
        ],
      },
    };
    const tableConfig = table && mapAdd[table] ? mapAdd[table] : null;
    const handleSearch = () => {
      const updateSearch = { ...searchValue };
      if (updateSearch.status !== undefined && updateSearch.status !== "") {
        if (statusMap.hasOwnProperty(updateSearch.status)) {
          updateSearch.status = statusMap[updateSearch.status];
        } else {
          updateSearch.status = -1;
        }
      }
      if (updateSearch.formula !== undefined && updateSearch.formula !== "") {
        const numValue = Number(updateSearch.formula);
        updateSearch.formula = isNaN(numValue)
          ? updateSearch.formula
          : numValue;
      }
      Object.keys(updateSearch).forEach((key) => {
        if (
          updateSearch[key] === "" ||
          updateSearch[key] === null ||
          updateSearch[key] === undefined
        ) {
          delete updateSearch[key];
        }
      });
      onSearch({
        searchTable: table,
        search: updateSearch,
      });
    };

    const handleAddNavigation = () => {
      if (!subTable) {
        const direction = mapAdd[table];
        if (direction) {
          navigation(direction.path);
        }
      } else {
        const direction = mapAdd[subTableName];
        if (direction) {
          navigation(direction.path);
        }
      }
    };

    // Hàm render field dựa vào type
    const renderSearchField = (f, index) => {
      const fieldBoxStyles = {
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        minWidth: 150,
      };

      const labelStyles = {
        variant: "body2",
        fontWeight: "bold",
        fontSize: "12px",
      };
      if (f.type === "dropdown" && f.name === "status") {
        return (
          <Box key={index} sx={fieldBoxStyles}>
            <TextField
              select
              fullWidth
              label={f.title}
              size="small"
              value={searchValue[f.name] || ""}
              onChange={(e) => {
                setSearchValue((prev) => ({
                  ...prev,
                  [f.name]: e.target.value,
                }));
              }}
            >
              <MenuItem value="">
                {getControlLabel("ddl_None", "None")}
              </MenuItem>
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {t(option.label)}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );
      }
      const dateFields = [
        "actual_delivery_date",
        "estimated_delivery_date",
        "declaration_retrieve_date",
        "record_date",
        "req_date",
        "order_date",
        "s_date",
        "e_date",
      ];

      if (f.type === "date" && dateFields.includes(f.name)) {
        return (
          <Box key={index} sx={fieldBoxStyles}>
            <Typography {...labelStyles}>{f.title}</Typography>
            <TextField
              type="date"
              size="small"
              fullWidth
              value={searchValue[f.name] || ""}
              onChange={(e) => {
                setSearchValue((prev) => ({
                  ...prev,
                  [f.name]: e.target.value,
                }));
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        );
      }
      if (f.type === "dateRangeGroup") {
        const dateLabelMapping = {
          VW_AC_SRCORDER: {
            row1Label: getControlLabel("order_date", "Order Date"),
            row2Label: getControlLabel("vr_cfmday", "Vr Cfm"),
            hasRow2: true,
          },
          AC_SRCORDER_M: {
            row1Label: getControlLabel("order_date", "Order Date"),
            row2Label: getControlLabel("vr_cfmday", "Vr Cfm"),
            hasRow2: true,
          },
          VW_AC_ALLCHK: {
            row1Label: getControlLabel("rcpt_date", "Rcpt Date"),
            row2Label: getControlLabel("vr_cfmday", "Vr Cfm"),
            hasRow2: true,
          },
          VW_CONT_IMP: {
            row1Label: getControlLabel("lbl_issued_date", "Issued Date"),
            row2Label: getControlLabel("lbl_expire_date", "Expire Date"),
            hasRow2: true,
          },
          VW_CONT_EXP: {
            row1Label: getControlLabel("lbl_issued_date", "Issued Date"),
            row2Label: getControlLabel("lbl_expire_date", "Expire Date"),
            hasRow2: true,
          },
          AC_INM_M: {
            row1Label: getControlLabel("lbl_issued_date", "Issued Date"),
            row2Label: getControlLabel("lbl_expire_date", "Expire Date"),
            hasRow2: true,
          },
          VW_CHG_M: {
            row1Label: getControlLabel("out_date", "Out Date"),
            hasRow2: false,
          },
          VW_CHG_EXP: {
            row1Label: getControlLabel("out_date", "Out Date"),
            hasRow2: false,
          },
          AC_PROC_M: {
            row1Label: getControlLabel("ac_date", "Ac Date"),
            hasRow2: false,
          },
          AC_PROC_M_1: {
            row1Label: getControlLabel("ac_date", "Ac Date"),
            hasRow2: false,
          },
          SE_SHIPING_M: {
            row1Label: getControlLabel("start_date", "Start Date"),
            hasRow2: false,
          },
          SD_ORD_M_C: {
            row1Label: getControlLabel("nlt", "NLT"),
            hasRow2: false,
          },
          SD_ORD_M: {
            row1Label: getControlLabel("se_day", "Se Day"),
            row2Label: getControlLabel("nst", "NST"),
            row3Label: getControlLabel("nlt", "NLT"),
            hasRow2: true,
            hasRow3: true,
          },
          PLAN_ORD: {
            row1Label: getControlLabel("p_shipdate", "Ship Date"),
            hasRow2: false,
          },
          SE_INV_M: {
            row1Label: getControlLabel("invoice_date", "Invoice Date"),
            hasRow2: false,
          },
          CHG_M: {
            row1Label: getControlLabel("out_date", "Out Date"),
            hasRow2: false,
          },
          AC_ISSUE_M_T: {
            row1Label: getControlLabel("out_date", "Out Date"),
            row2Label: getControlLabel("col4", "Col 4"),
            row3Label: getControlLabel("col3", "Col 3"),
            hasRow2: true,
            hasRow3: true,
          },
          VW_AC_CHGSUM: {
            row1Label: getControlLabel("out_date", "Out Date"),
            row2Label: getControlLabel("fact_date", "Fact Date"),
            hasRow2: true,
          },
          SE_SALES: {
            row1Label: getControlLabel("sales_date", "Sales Date"),
            hasRow2: false,
          },
          AC_CO_M: {
            row1Label: getControlLabel("p_shipdate", "Start Ship Date"),
            row2Label: getControlLabel("board_date", "Board Date"),
            row3Label: getControlLabel("nlt", "nlt"),
            hasRow2: true,
            hasRow3: true,
          },
          SE_PLAN_ORD_LINK: {
            row1Label: getControlLabel("ship_date", "Ship Date"),
            hasRow2: false,
          },
          SE_PLAN_ORD: {
            row1Label: getControlLabel("p_shipdate", "Start Ship Date"),
            row2Label: getControlLabel("p_exdate", "Ex Date"),
            row3Label: getControlLabel("nst", "NST"),
            row4Label: getControlLabel("nlt", "NLT"),
            hasRow2: true,
            hasRow3: true,
            hasRow4: true,
          },
          RD_TEMP: {
            row1Label: getControlLabel("trans_date", "Trans Date"),
            hasRow2: false,
          },
        };

        const currentConfig =
          dateLabelMapping[table] || dateLabelMapping.VW_CONT_IMP;

        return (
          <Box
            key={index}
            sx={{
              flexBasis: "100%",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 1,
              alignItems: "center",
              flex: "1 1 auto",
              minWidth: 0,
            }}
          >
            {/* Hàng 1 */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Typography
                fontSize={"13px"}
                fontWeight={"bold"}
                sx={{ flexShrink: 0 }}
              >
                {currentConfig.row1Label}
              </Typography>
              <TextField
                type="date"
                size="small"
                sx={{ width: 140 }}
                value={searchValue.s_date_1 || ""}
                onChange={(e) =>
                  setSearchValue((prev) => ({
                    ...prev,
                    s_date_1: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
              />
              <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                -
              </Typography>
              <TextField
                type="date"
                size="small"
                sx={{ width: 140 }}
                value={searchValue.e_date_1 || ""}
                onChange={(e) =>
                  setSearchValue((prev) => ({
                    ...prev,
                    e_date_1: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* Hàng 2 - nằm ngay bên phải hàng 1 */}
            {currentConfig.hasRow2 && (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography
                  fontSize={"13px"}
                  fontWeight={"bold"}
                  sx={{ flexShrink: 0 }}
                >
                  {currentConfig.row2Label}
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  sx={{ width: 140 }}
                  value={searchValue.s_date_2 || ""}
                  onChange={(e) =>
                    setSearchValue((prev) => ({
                      ...prev,
                      s_date_2: e.target.value,
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
                <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                  -
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  sx={{ width: 140 }}
                  value={searchValue.e_date_2 || ""}
                  onChange={(e) =>
                    setSearchValue((prev) => ({
                      ...prev,
                      e_date_2: e.target.value,
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            )}

            {/* Hàng 3 */}
            {currentConfig.hasRow3 && (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography
                  fontSize={"13px"}
                  fontWeight={"bold"}
                  sx={{ flexShrink: 0 }}
                >
                  {currentConfig.row3Label}
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  sx={{ width: 140 }}
                  value={searchValue.s_date_3 || ""}
                  onChange={(e) =>
                    setSearchValue((prev) => ({
                      ...prev,
                      s_date_3: e.target.value,
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
                <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                  -
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  sx={{ width: 140 }}
                  value={searchValue.e_date_3 || ""}
                  onChange={(e) =>
                    setSearchValue((prev) => ({
                      ...prev,
                      e_date_3: e.target.value,
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            )}

            {/* Hàng 4 */}
            {currentConfig.hasRow4 && (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography
                  fontSize={"13px"}
                  fontWeight={"bold"}
                  sx={{ flexShrink: 0 }}
                >
                  {currentConfig.row4Label}
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  sx={{ width: 140 }}
                  value={searchValue.s_date_4 || ""}
                  onChange={(e) =>
                    setSearchValue((prev) => ({
                      ...prev,
                      s_date_4: e.target.value,
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
                <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                  -
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  sx={{ width: 140 }}
                  value={searchValue.e_date_4 || ""}
                  onChange={(e) =>
                    setSearchValue((prev) => ({
                      ...prev,
                      e_date_4: e.target.value,
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            )}
          </Box>
        );
      }
      if (f.name === "is_max") {
        return (
          <>
            <Typography display={"flex"} alignItems={"center"}>
              {f.title}
            </Typography>
            <Checkbox
              checked={isCheckMax === "Y"}
              onChange={(e) => {
                onCheckMax(e);
              }}
            />
          </>
        );
      }
      if (f.type === "dropdown" && f.fetchKey && getFetchData[f.fetchKey]) {
        const mapField = {
          invoice_no: ["invoice_no"],
          packing_seid: ["se_id"],
          ac_chgno: ["ac_chgno"],
          cont_no: ["cont_no"],
          ac_no: ["ac_no"],
          chg_type: ["code_no"],
          ac_itemno: ["ac_itemno"],
          stoc_type: ["code_no"],
          send_corp: ["code_no"],
          sales_no: ["col2"],
          send_type: ["code_no"],
          type: ["code_no"],
          expect_id: ["expect_id"],
          print_id: ["print_id"],
          se_id: ["se_id"],
          se_custid: ["cust_id"],
          agent: ["code_no"],
          item_no: ["item_no"],
          declaration_category: ["code_no"],
          loading_way: ["code_no"],
          vend_no: ["vend_no"],
          ac_send: ["code_no"],
          ac_type: ["code_no"],
        };

        return (
          <Box key={index} sx={fieldBoxStyles}>
            <Dropdown
              onFetchData={getFetchData[f.fetchKey]}
              onSelect={(selectedItem) => {
                const fields = mapField[f.name] || [];
                const value = fields
                  .filter((field) => selectedItem?.[field] !== undefined)
                  .map((field) => selectedItem[field])
                  .join("-");

                setSearchValue((prev) => ({
                  ...prev,
                  [f.name]: value,
                  ...(f.name === "packing_seid" && {
                    packing_seid: selectedItem?.se_id ?? "",
                    pack_gu: selectedItem?.pack_gu ?? "",
                    ship_seq: selectedItem?.ship_seq ?? "",
                  }),
                }));
                setDropdownValues((prev) => ({
                  ...prev,
                  [f.name]: value,
                }));
              }}
              defaultValue={""}
              select={dropDownValues?.[f.name] || ""}
              table={f.tableName}
              option={f.name}
              getControlLabel={getControlLabel}
              language={language || "E"}
              field={f.title}
              headerField={
                f.name === "cont_no" && f.tableName === "VW_CONT_IMP"
                  ? "cont_no_1"
                  : f.name
              }
              totalItems={0}
              pageSize={10}
              isSearchMode={true}
            />
          </Box>
        );
      }
      // Default: SearchBar
      return (
        <Box key={index} sx={fieldBoxStyles}>
          <SearchBar
            title={f.title}
            name={f.name}
            value={searchValue}
            onChange={setSearchValue}
            type={f.typeInput || "text"}
          />
        </Box>
      );
    };
    const getNonDateFields = () => {
      if (!tableConfig?.filter) return [];
      return tableConfig.filter.filter(
        (f) =>
          f.type !== "date" &&
          f.type !== "checkbox" &&
          f.type !== "dateRangeGroup",
      );
    };

    const getDateFields = () => {
      if (!tableConfig?.filter) return [];
      return tableConfig.filter.filter(
        (f) =>
          f.type === "date" ||
          f.type === "checkbox" ||
          f.type === "dateRangeGroup",
      );
    };
    const buttons = [
      {
        label: getControlLabel("btn_search", "Search"),
        color: "#686868",
        onClick: handleSearch,
      },
      {
        label: getControlLabel("btn_add", "Add"),
        color: "success",
        onClick: onAdd,
      },
      {
        label: getControlLabel("btn_edit", "Edit"),
        color: "warning",
        onClick: onEdit,
      },
      {
        label: getControlLabel("btn_confirm", "Confirm"),
        color: "primary",
        onClick: onConfirm,
      },
      {
        label: getControlLabel("btn_unconfirm", "Unconfirm"),
        color: "primary",
        onClick: onUnconfirm,
      },
      {
        label: getControlLabel("btn_export", "Export"),
        color: "secondary",
        onClick: onPDF,
      },
      {
        label: getControlLabel("btn_cancel", "Cancel"),
        color: "error",
        onClick: onCancel,
      },
      {
        label: getControlLabel("btn_close", "Close"),
        color: "error",
        onClick: onClose,
      },
      ...(table === "AC_IMP_MATERIAL_TRACKING"
        ? [
            {
              label: getControlLabel("btn_export_custom", "Export Custom"),
              color: "secondary",
              onClick: onCustomExport,
            },
            {
              label: getControlLabel("btn_export_material", "Export Material"),
              color: "secondary",
              onClick: onMaterialExport,
            },
            {
              label: getControlLabel("btn_import_link", "Import Link"),
              color: "primary",
              onClick: onImportLink,
            },
          ]
        : []),
      ...(table === "AC_ITEM_M"
        ? [
            {
              label: getControlLabel("btn_link", "Link"),
              color: "secondary",
              onClick: onLink,
            },
            {
              label: getControlLabel("btn_import", "Import Order"),
              onClick: () => fileInputRef.current?.click(),
            },
          ]
        : []),
      ...(table === "AC_ITEM_REF"
        ? [
            {
              label: getControlLabel("btn_delete", "Delete"),
              color: "error",
              onClick: onDelete,
            },
          ]
        : []),
      ...(table === "AC_SHOE_REF"
        ? [
            {
              label: getControlLabel("btn_delete", "Delete"),
              color: "error",
              onClick: onDelete,
            },
          ]
        : []),
      ...(table === "PERMISSION"
        ? [
            {
              label: getControlLabel("btn_copy", "Copy"),
              color: "secondary",
              onClick: onCopy,
            },
          ]
        : []),
      ...(table === "AC_PLAN_SIZE"
        ? [
            {
              label: getControlLabel("btn_generate_shoe", "Generate Shoe"),
              color: "success",
              onClick: onGeneratePM,
            },
          ]
        : []),
      ...(table === "AC_PROD_M"
        ? [
            {
              label: getControlLabel("btn_size_link", "Size Link"),
              color: "secondary",
              onClick: onLink,
            },
          ]
        : []),
      ...(table === "AC_SHOE_M"
        ? [
            {
              label: getControlLabel("btn_bom", "BOM"),
              color: "warning",
              onClick: onBom,
              isLoading: isLoadingBom,
            },
            {
              label: getControlLabel("btn_import", "Import Order"),
              color: "success",
              onClick: () => fileInputRef.current?.click(),
            },
          ]
        : []),
      ...(table === "AC_REQ_M"
        ? [
            {
              label: getControlLabel("btn_direct_import", "Direct Import(F3)"),
              color: "warning",
              onClick: () => onDirectImport(searchValue),
            },
            {
              label: getControlLabel("btn_vn_import", "Import VN(F3)"),
              color: "warning",
              onClick: () => onVNImport(searchValue),
            },
            {
              label: getControlLabel(
                "btn_add_contract_number",
                "add_contract_number",
              ),
              color: "success",
              onClick: onAddContractNumber,
            },
          ]
        : []),
      ...(table === "AC_SRCORDER_M"
        ? [
            {
              label: getControlLabel("btn_export_custom", "Export Custom"),
              color: "secondary",
              onClick: () => onExcelWithCondition(searchValue),
            },
          ]
        : []),
      ...(table === "VW_CONT_IMP"
        ? [
            {
              label: getControlLabel("btn_copy", "Copy"),
              color: "warning",
              onClick: onCopy,
            },
            {
              label: getControlLabel("btn_extend", "Extend"),
              color: "primary",
              onClick: onExtend,
            },
          ]
        : []),
      ...(table === "VW_CONT_EXP"
        ? [
            {
              label: getControlLabel("btn_copy", "Copy"),
              color: "warning",
              onClick: onCopy,
            },
            {
              label: getControlLabel("btn_extend", "Extend"),
              color: "primary",
              onClick: onExtend,
            },
          ]
        : []),
      ...(table === "IV_TRANS_D_TW"
        ? [
            {
              label: getControlLabel("btn_ok", "Confirm All"),
              color: "success",
              onClick: onConfirmAll,
            },
          ]
        : []),
      ...(table === "VW_AC_ALLCHK"
        ? [
            {
              label: getControlLabel("btn_ok", "Confirm All"),
              color: "success",
              onClick: onConfirmAll,
            },
          ]
        : []),
      ...(table === "AC_PROC_D" || table === "AC_CHG_D"
        ? type === "2"
          ? [
              {
                label: getControlLabel("btn_refresh_seq", "Refresh Seq"),
                color: "warning",
                onClick: onRefreshSeq,
              },
              {
                label: getControlLabel(
                  "btn_generate_gc",
                  "Genearate Goods Code",
                ),
                color: "primary",
                onClick: onGenerateGC,
              },
              {
                label: getControlLabel("btn_plan_date", "Plan Date"),
                color: "success",
                onClick: onPlanDate,
              },
              {
                label: getControlLabel("btn_refresh_price", "Refresh Price"),
                color: "warning",
                onClick: onRefreshPrice,
              },
            ]
          : [
              {
                label: getControlLabel("btn_auto_add", "Auto Add"),
                color: "warning",
                onClick: onAutoAdd,
                isLoading: isLoadingBom,
              },
            ]
        : []),
      ...(table === "AC_PROC_D_1"
        ? [
            {
              label: getControlLabel("btn_auto_add", "Auto Add"),
              color: "warning",
              onClick: onAutoAdd,
              isLoading: isLoadingBom,
            },
            {
              label: getControlLabel("btn_exchange_rate", "Exchange Rate"),
              color: "warning",
              onClick: onExchangeRate,
              isLoading: isLoadingBom,
            },
          ]
        : []),
      ...(table === "SE_PLAN_ORD"
        ? [
            {
              label: getControlLabel("btn_plan_order", "Plan Order"),
              color: "warning",
              onClick: onPlanOrd,
            },
            {
              label: getControlLabel(
                "btn_pdd",
                "Order PDD Update Planned Shipping Date(F4)",
              ),
              color: "primary",
              onClick: () => onPDD(searchValue),
            },
            {
              label: getControlLabel("btn_delete", "Delete"),
              color: "error",
              onClick: onDelete,
            },
            {
              label: getControlLabel("btn_import", "Import Link"),
              color: "primary",
              onClick: onImportLink,
            },
          ]
        : []),
      ...(table === "SE_PLAN_SIZE"
        ? [
            {
              label: getControlLabel("btn_delete", "Delete"),
              color: "error",
              onClick: onDelete,
            },
          ]
        : []),
      ...(table === "SD_ORD_M_C"
        ? [
            {
              label: getControlLabel("btn_plan_date", "Plan Date"),
              color: "warning",
              onClick: onPlanDate,
            },
          ]
        : []),
      ...(table === "AC_REQ_ORDER"
        ? [
            {
              label: getControlLabel("btn_delete", "Delete"),
              color: "error",
              onClick: onDelete,
            },
          ]
        : []),
      ...(table === "AC_CONT_D"
        ? [
            {
              label: getControlLabel("btn_delete", "Delete"),
              color: "error",
              onClick: onDelete,
            },
          ]
        : []),
      ...(table === "AC_INM_D"
        ? [
            {
              label: getControlLabel("btn_delete", "Delete"),
              color: "error",
              onClick: onDelete,
            },
          ]
        : []),
      ...(table === "VW_CHG_EXP"
        ? [
            {
              label: getControlLabel(
                "btn_confirm_pass_date",
                "Confirm Pass Date",
              ),
              color: "warning",
              onClick: onConfirmPD,
            },
            {
              label: getControlLabel(
                "btn_refresh_gross_weight",
                "Refresh Gross Weight",
              ),
              color: "success",
              onClick: onRefreshGW,
            },
            {
              label: getControlLabel("btn_report_choose", "Report Choose"),
              color: "warning",
              onClick: onReport,
            },
            {
              label: getControlLabel("btn_import_link", "Import Link"),
              color: "primary",
              onClick: onImportLink,
            },
          ]
        : []),
      ...(table === "VW_CHG_M"
        ? [
            {
              label: getControlLabel("btn_import_link", "Import Link"),
              color: "primary",
              onClick: onImportLink,
            },
          ]
        : []),
      ...(table === "AC_PROC_M_1"
        ? [
            {
              label: getControlLabel("btn_import_link", "Import Link"),
              color: "primary",
              onClick: onImportLink,
            },
          ]
        : []),
      ...(table === "AC_PROC_M"
        ? [
            {
              label: getControlLabel("btn_import_link", "Import Link"),
              color: "primary",
              onClick: onImportLink,
            },
          ]
        : []),
      ...(table === "PAKING_LIST_M"
        ? [
            {
              label: getControlLabel("btn_import_link", "Import Link"),
              color: "primary",
              onClick: onImportLink,
            },
          ]
        : []),
      ...(table === "PLAN_ORD"
        ? [
            {
              label: getControlLabel("btn_transfer", "Transfer"),
              color: "warning",
              onClick: onTransfer,
              isLoading: isLoadingBom,
            },
          ]
        : []),
      ...(table === "SE_INV_M"
        ? [
            {
              label: getControlLabel("btn_select_customs", "Select Customs"),
              color: "warning",
              onClick: onSelectCustoms,
            },
            {
              label: getControlLabel("btn_update_nw/gw", "Update N/W/GW"),
              color: "warning",
              onClick: onUpdateNWGW,
            },
            {
              label: getControlLabel("btn_invoice_print", "Invoice Print"),
              color: "success",
              onClick: onInvoicePrint,
            },
            {
              label: getControlLabel("btn_import_link", "Import Link"),
              color: "primary",
              onClick: onImportLink,
            },
          ]
        : []),
      ...(table === "CHG_M"
        ? [
            {
              label: getControlLabel("btn_auto_add", "Auto Add"),
              color: "warning",
              onClick: onAutoAdd,
            },
          ]
        : []),
      ...(table === "AC_ISSUE_M_T"
        ? [
            {
              label: getControlLabel("btn_calculate_trial", "Calculate Trial"),
              color: "success",
              onClick: onCalculateTrial,
            },
            {
              label: getControlLabel("btn_unclose", "Unclose"),
              color: "primary",
              onClick: onUnclose,
            },
            {
              label: getControlLabel("btn_excel_list", "Excel List"),
              color: "warning",
              onClick: onExcelDetail,
            },
            {
              label: getControlLabel(
                "btn_export_writting",
                "Export write-off summary listing",
              ),
              color: "success",
              onClick: onExcelSummary,
            },
            {
              label: getControlLabel("btn_import_link", "Import Link"),
              color: "primary",
              onClick: onImportLink,
            },
          ]
        : []),
      ...(table === "VW_AC_CHGSUM"
        ? [
            {
              label: getControlLabel("btn_out_excel", "Out Excel"),
              color: "warning",
              onClick: onOutExcel,
            },
            {
              label: getControlLabel("btn_verify_remain", "Verify Remain"),
              color: "success",
              onClick: onVerifyRemain,
            },
            {
              label: getControlLabel("btn_restore_status", "Restore Status"),
              color: "primary",
              onClick: onRestoreStatus,
            },
          ]
        : []),
      ...(table === "SE_SALES"
        ? [
            {
              label: getControlLabel("btn_excel_2", "Excel 2"),
              color: "warning",
              onClick: onExcel2,
            },
          ]
        : []),
      ...(table === "AC_CHK_T"
        ? [
            {
              label: getControlLabel("btn_delete", "Delete"),
              color: "error",
              onClick: onDelete,
            },
          ]
        : []),
      ...(table === "AC_EXPECT_M"
        ? [
            {
              label: getControlLabel(
                "btn_gen_order_material",
                "Generate Order",
              ),
              color: "success",
              onClick: onGenOrderMaterial,
            },
            {
              label: getControlLabel(
                "btn_calculate_write_off",
                "Calculate Write-Off",
              ),
              color: "primary",
              onClick: onCalculateWriteOff,
            },
            {
              label: getControlLabel("btn_export_shoe", "Export Shoe"),
              color: "success",
              onClick: onExcelShoe,
            },
            {
              label: getControlLabel(
                "btn_export_write_off",
                "Export Write Off",
              ),
              color: "warning",
              onClick: onExcelWriteOff,
            },
            {
              label: getControlLabel("btn_import_link", "Import Link"),
              color: "primary",
              onClick: onImportLink,
            },
          ]
        : []),
      ...(table === "AC_CO_M"
        ? [
            {
              label: getControlLabel(
                "btn_excel_sumary_order",
                "Shipment Order Summary Excel",
              ),
              color: "success",
              onClick: () => onExportSummary(searchValue),
            },
            {
              label: getControlLabel(
                "btn_import_shipment",
                "Import Shipment Plan",
              ),
              color: "primary",
              onClick: onImportShipment,
            },
            {
              label: getControlLabel("btn_customs_report", "Customs Reports"),
              color: "success",
              onClick: onCustomReport,
            },
          ]
        : []),
      ...(table === "SE_PLAN_ORD_LINK"
        ? [
            {
              label: getControlLabel("btn_ok", "Ok"),
              color: "success",
              onClick: onConfirmAll,
            },
          ]
        : []),
      ...(table === "AC_PLAN_ORD"
        ? [
            {
              label: getControlLabel("btn_delete", "Delete"),
              color: "error",
              onClick: onDelete,
            },
          ]
        : []),
      ...(table === "RD_TEMP"
        ? [
            {
              label: getControlLabel("btn_import", "Import Order"),
              color: "secondary",
              onClick: () => fileInputRef.current?.click(),
            },
            {
              label: getControlLabel("btn_clear_import", "Clear Import"),
              color: "warning",
              onClick: onClearImport,
            },
            {
              label: getControlLabel(
                "btn_rpt152_material_out",
                "152 Material Out",
              ),
              color: "success",
              onClick: () => onMaterialOut(searchValue),
            },
            {
              label: getControlLabel(
                "btn_rpt154155_period_end",
                "154 Period End",
              ),
              color: "primary",
              onClick: () => onMaterialEnd(searchValue),
            },
            {
              label: getControlLabel("btn_rpt152_shiporder", "152 Ship Order"),
              color: "error",
              onClick: () => onShipOrder(searchValue),
            },
            {
              label: getControlLabel(
                "btn_excel_production",
                "Export Production Excel",
              ),
              color: "secondary",
              onClick: onPp026Excel,
            },
          ]
        : []),
    ].filter((btn) => {
      const hideButtons = tableConfig?.hideButtons || [];
      return !hideButtons.includes(btn.label);
    });

    return (
      <Toolbar
        sx={{
          maxHeight: "250px",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          py: mapAdd[table]?.filter ? 1 : 0,
          minHeight: mapAdd[table]?.filter ? "auto" : "fit-content !important",
        }}
      >
        {!subTable ? (
          <Box
            sx={{
              display: "flex",
              width: "100%",
              gap: 2,
              alignItems: table === "SD_ORD_M" ? "center" : "flex-start",
              height: "100%",
            }}
          >
            {tableConfig?.filter && (
              <Box
                sx={{
                  flex: "1 1 auto",
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 1.5,
                  minWidth: 0,
                  alignItems: "center",
                }}
              >
                {tableConfig.filter.map((f, index) =>
                  renderSearchField(f, index),
                )}
              </Box>
            )}
            <Divider orientation="vertical" flexItem />
            <Box
              sx={{
                flex:
                  table === "USER_PERMISSION" ||
                  table === "BASIC_DATA" ||
                  table === "AC_VEND_BASE" ||
                  table === "AC_SEND_BASE" ||
                  table === "AC_REQ_ORDER" ||
                  table === "VW_AC_SRCORDER" ||
                  table === "VW_AC_ALLCHK" ||
                  table === "IV_TRANS_D_TW" ||
                  table === "AC_SHOE_REF" ||
                  table === "AC_REQ_M" ||
                  table === "AC_CONT_D" ||
                  table === "AC_INM_D" ||
                  table === "AC_INM_M" ||
                  table === "VW_CONT_USE" ||
                  table === "SE_PAY" ||
                  table === "VW_CHG_EXMP" ||
                  table === "AC_CHG_D" ||
                  table === "AC_CHG_A" ||
                  table === "AC_DESC_CHG" ||
                  table === "AC_PROC_D" ||
                  table === "AC_PROC_D_1" ||
                  table === "SE_SHIPING_D" ||
                  table === "SE_PLAN_SIZE" ||
                  table === "AC_DESC_PROC" ||
                  table === "SE_INV_D" ||
                  table === "AC_ISSUE_MATD_T" ||
                  table === "VW_AC_ISSUE_T" ||
                  table === "AC_CHK_T" ||
                  table === "AC_PLAN_SIZE" ||
                  table === "AC_PLAN_ORD" ||
                  table === "RD_TEMP"
                    ? "1 1 auto"
                    : "0 0 auto",
                display: "flex",
                flexShrink: 0,
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "flex-end",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 1,
                  maxWidth:
                    table !== "AC_SHOE_REF" &&
                    table !== "AC_SHOE_M" &&
                    table !== "AC_PROC_M" &&
                    table !== "AC_PROC_M_1" &&
                    table !== "VW_CHG_M" &&
                    table !== "IV_TRANS_D_TW" &&
                    table !== "AC_ISSUE_M_T" &&
                    table !== "AC_EXPECT_M" &&
                    table !== "RD_TEMP" &&
                    // table !== "AC_CHG_A" &&
                    // table !== "AC_CHG_D" &&
                    //   type === "2" &&
                    table !== "SE_PLAN_ORD" &&
                    table !== "VW_CHG_M" &&
                    table !== "VW_CHG_EXP" &&
                    table !== "SE_INV_M" &&
                    table !== "AC_IMP_MATERIAL_TRACKING" &&
                    table !== "AC_REQ_M" &&
                    table !== "VW_AC_CHGSUM" &&
                    table !== "AC_CO_M" &&
                    table !== "VW_CONT_IMP" &&
                    table !== "AC_INM_M" &&
                    table !== "VW_CONT_EXP"
                      ? "100%"
                      : table === "AC_PROC_M" || table === "AC_PROC_M_1"
                        ? "165px"
                        : table === "VW_CHG_M"
                          ? "160px"
                          : table === "VW_CHG_EXP"
                            ? "235px"
                            : table === "AC_EXPECT_M"
                              ? "600px"
                              : table === "SE_PLAN_ORD"
                                ? "400px"
                                : table === "AC_ISSUE_M_T"
                                  ? "80px"
                                  : table === "VW_AC_CHGSUM"
                                    ? "180px"
                                    : table === "AC_CO_M"
                                      ? "310px"
                                      : table === "VW_CONT_IMP"
                                        ? language === "zh"
                                          ? "360px"
                                          : "270px"
                                        : table === "VW_CONT_EXP"
                                          ? language === "zh"
                                            ? "360px"
                                            : "270px"
                                          : table === "AC_INM_M"
                                            ? language === "zh"
                                              ? "360px"
                                              : "270px"
                                            : "385px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {/* Nút Import + tên file tách riêng */}
                  {table === "RD_TEMP" && (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        color="secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {t(getControlLabel("btn_import", "Import Order"))}
                      </Button>
                      {importFileName && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            px: 1,
                            py: 0.3,
                            border: "1px solid #ccc",
                            borderRadius: 1,
                            backgroundColor: "#f5f5f5",
                            maxWidth: 180,
                          }}
                        >
                          <Typography
                            fontSize="12px"
                            color="text.secondary"
                            noWrap
                          >
                            📄 {importFileName}
                          </Typography>
                          <Typography
                            fontSize="12px"
                            color="error"
                            sx={{ cursor: "pointer", flexShrink: 0 }}
                            onClick={() => {
                              setImportFileName("");
                              if (fileInputRef.current)
                                fileInputRef.current.value = "";
                            }}
                          >
                            ✕
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* ButtonGroup giữ nguyên, chỉ filter bỏ nút Import ra */}
                  <ButtonGroup
                    variant="contained"
                    size="small"
                    sx={{
                      flexWrap: "wrap",
                      "& .MuiButton-root": {
                        flex: "1 1 auto",
                        minWidth: { xs: "100%", sm: "auto" },
                      },
                    }}
                  >
                    {buttons
                      .filter(
                        (btn) =>
                          btn.label !==
                          getControlLabel("btn_import_1", "Import Order"),
                      )
                      .map((btn, idx) => (
                        <Button
                          key={idx}
                          color={
                            btn.color !== "#686868" ? btn.color : "inherit"
                          }
                          onClick={btn.onClick}
                          disabled={btn.isLoading}
                          sx={{
                            ...(btn.color === "#686868" && {
                              color: "#686868",
                              border: "1px solid #686868",
                              backgroundColor: "transparent",
                              "&:hover": {
                                borderColor: "#484848",
                                color: "#484848",
                                backgroundColor: "#f5f5f5",
                              },
                            }),
                            position: "relative",
                          }}
                        >
                          {btn.isLoading && (
                            <CircularProgress
                              size={20}
                              sx={{
                                position: "absolute",
                                left: "50%",
                                marginLeft: "-10px",
                                color: "inherit",
                              }}
                            />
                          )}
                          <span
                            style={{
                              visibility: btn.isLoading ? "hidden" : "visible",
                            }}
                          >
                            {t(btn.label)}
                          </span>
                        </Button>
                      ))}
                  </ButtonGroup>
                </Box>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ flexGrow: 0.1 }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                handleAddNavigation();
              }}
            >
              {t("Add")}
            </Button>
          </Box>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) onImport?.(file);
            e.target.value = "";
          }}
        />
      </Toolbar>
    );
  },
);
export default ToolbarKit;
