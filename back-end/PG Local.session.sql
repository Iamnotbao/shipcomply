SELECT 
        vw.id,
        vw.type,
        vw.order_date,
        vw.order_no,
        vw.order_seq,
        vw.vr_cfmday,
        vw.ac_code,

        -- Lấy tên item từ AC_ALLITEM_SRC (dùng trực tiếp từ JOIN)
        CASE
          WHEN 'en' = 'T' THEN ais.name_t
          WHEN 'en' = 'E' THEN ais.name_e
          ELSE ais.name_s
        END AS itemnm,

        -- Lấy unit name từ GF_CODE_NAME
        "Customs".gf_code_name(vw.factory_code, 'UNIT', vw.pr_unit, 'en') AS unitnm,

        -- Lấy tên item từ AC_ITEM_M (dùng trực tiếp từ JOIN)
        CASE
          WHEN 'en' = 'T' THEN aim.item_acname_t
          WHEN 'en' = 'E' THEN aim.item_acname_e
          ELSE aim.item_acname_l
        END AS itemnm1,

        -- Lấy unit name từ AC_ITEM_M
        "Customs".gf_code_name('2010', 'UNIT', aim.unit, 'en') AS unitnm1,

        vw.item_acno,
        vw.order_qty,
        vw.chge_ordqty,
        NULL AS plan_iqty,
        NULL AS bl_qty,
        NULL AS is_check,
        vw.cont_no,
        vw.order_acqty,
        vw.req_acqty,
        NULL AS ac_req,
        vw.plan_qty,
        vw.chge_qty,
        vw.factory_code,
        vw.ac_vend,
        vw.status,
        vw.order_type,
        vw.pr_unit
      FROM "Customs".vw_ac_srcorder vw
      LEFT JOIN "Customs".ac_allitem_src ais
        ON ais.ac_code = vw.ac_code
        AND factory_code = vw.factory_code
      LEFT JOIN "Customs".ac_item_m aim
        ON aim.item_acno = vw.item_acno
        AND factory_code = vw.factory_code
      WHERE
        1=1
        AND vw.factory_code = '2010'
        -- Filter by ORDER_NO (LIKE)
        AND (vw.order_no LIKE CONCAT('3', '%'))
        AND vw.ac_vend IS NOT NULL
      ORDER BY vw.order_date DESC, vw.order_no ASC
      LIMIT 10
      OFFSET 0;