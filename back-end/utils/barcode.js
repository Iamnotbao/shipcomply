const bwipjs = require("bwip-js")
const generateBarCode =async(data)=>{
    try {
        const text = `${data.factory_code}-${data.customs_shoe_id}`;
        const png = await bwipjs.toBuffer({
            bcid: 'code128',
            text: text,
            scale : 2,
            height: 8,
            // includetext :true,
            textxalign: 'center'
        })
        return `data:image/png;base64,${png.toString('base64')}`;
    } catch (error) {
        console.log("Error when generate barcode ", error);
        throw error;
    }
}
module.exports=generateBarCode