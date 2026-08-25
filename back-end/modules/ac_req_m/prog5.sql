-- SELECT "Customs".gf_chkseq_req('2010', 'CHK001', '1.00')

-- "Customs".gf_orderseq_send('2010','', vw.ORDER_SEQ)

-- SELECT COUNT(*), CHK_NO, CHK_SEQ 
-- FROM "Customs".AC_REQ_ORDER 
-- WHERE CHK_NO = 'CHK001' 
--   AND CHK_SEQ = 1.00
-- GROUP BY CHK_NO, CHK_SEQ;

-- SELECT 
--     n.nspname AS schema_name,
--     p.proname AS function_name,
--     p.proargnames AS parameter_names,
--     p.proargtypes AS parameter_type_oids,
--     pg_catalog.pg_get_function_arguments(p.oid) AS parameters,
--     pg_catalog.pg_get_function_identity_arguments(p.oid) AS parameter_signature,
--     p.prosrc AS source_code
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE p.proname = 'gf_chkseq_req'
--   AND n.nspname = 'Customs'

-- DELETE FROM "Customs".ac_req_order
-- WHERE factory_code ='2010'

-- UPDATE "Customs".ac_srcorder_m
-- SET chge_ordqty=0
-- WHERE factory_code='2010' AND id = 3 

-- SELECT "Customs".get_ac_i_exp_qty(
--                  '2010',
--                  '3',
--                  '1.00'
--                )