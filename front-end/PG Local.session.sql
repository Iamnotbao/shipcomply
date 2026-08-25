INSERT INTO "Custom".ac_chg_d(factory_code,ac_no,seq,ac_itemno,unit,tax,add_tax,"money","status")
VALUES('2010','20260100001',2,'AC002','KG',10,11,12,1);


-- INSERT INTO "Customs".ac_chg_m(factory_code,ac_no)
-- VALUES('2010','20260100001');

UPDATE "Customs".ac_chg_m SET ac_type='1' WHERE factory_code='2010';