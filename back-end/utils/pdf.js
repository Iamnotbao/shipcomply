const puppeteer = require("puppeteer");

async function generatePDF(data, filename = "output.pdf", header = "FACTORY") {
  if (!data || data.length === 0) {
    throw new Error("Không có dữ liệu để xuất PDF");
  }

  const columns = Object.keys(data[0]);
  const isLargeTable = header === "AC_IMP_MATERIAL_TRACKING";
  
  const fontSize = isLargeTable ? 6 : 9;
  const headerFontSize = isLargeTable ? 14 : 18;
  const cellPadding = isLargeTable ? '3px 2px' : '6px 4px';
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ 
      width: isLargeTable ? 1600 : 1200, 
      height: isLargeTable ? 1200 : 800 
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box;
            }
            
            @page {
              size: ${isLargeTable ? 'A3' : 'A4'} landscape;
              margin: ${isLargeTable ? '10mm 5mm' : '15mm 10mm'};
            }
            
            body { 
              font-family: Arial, sans-serif;
              padding: ${isLargeTable ? '5px' : '10px'};
              font-size: ${fontSize}px;
            }
            
            h2 { 
              text-align: center; 
              margin-bottom: ${isLargeTable ? '8px' : '15px'};
              font-size: ${headerFontSize}px;
              color: #333;
              text-transform: uppercase;
            }
            
            table { 
              width: 100%; 
              border-collapse: collapse;
              margin-top: ${isLargeTable ? '5px' : '10px'};
            }
            
            thead { 
              display: table-header-group;
            }
            
            th, td { 
              border: 1px solid #999; 
              padding: ${cellPadding}; 
              font-size: ${fontSize}px; 
              text-align: left; 
              word-wrap: break-word;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: ${isLargeTable ? '60px' : '120px'};
            }
            
            th { 
              background: #2c3e50; 
              color: white; 
              text-align: center;
              font-weight: bold;
              font-size: ${fontSize + 1}px;
              ${isLargeTable ? `
                writing-mode: vertical-rl;
                text-orientation: mixed;
                white-space: nowrap;
                height: 100px;
                vertical-align: bottom;
              ` : ''}
            }
            
            tr {
              page-break-inside: avoid;
            }
            
            tbody tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            
            td:first-child,
            th:first-child {
              text-align: center;
              font-weight: 500;
              width: ${isLargeTable ? '25px' : '40px'};
              ${isLargeTable ? 'writing-mode: horizontal-tb;' : ''}
            }
            
            td:empty::after {
              content: '-';
              color: #999;
            }
          </style>
        </head>
        <body>
          <h2>${escapeHtml(header)}</h2>
          <table>
            <thead>
              <tr>
                <th>No</th>
                ${columns.map(col => `<th title="${escapeHtml(col)}">${escapeHtml(col)}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${data.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  ${columns.map(col => {
                    let value = item[col];
                    
                    if (value === null || value === undefined) {
                      return '<td></td>';
                    }
                    
                    if (value instanceof Date || 
                        (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
                      try {
                        value = new Date(value).toLocaleDateString('en-GB');
                      } catch (e) {}
                    }
                    
                    if (typeof value === 'number' && !Number.isInteger(value)) {
                      value = value.toFixed(2);
                    }
                    
                    const strValue = escapeHtml(String(value));
                    return `<td title="${strValue}">${strValue}</td>`;
                  }).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
    
    const pdfBuffer = await page.pdf({ 
      path: filename, 
      format: isLargeTable ? "A3" : "A4", 
      landscape: true, 
      printBackground: true,
      margin: { 
        top: isLargeTable ? '10mm' : '15mm',
        bottom: isLargeTable ? '10mm' : '15mm',
        left: isLargeTable ? '5mm' : '10mm',
        right: isLargeTable ? '5mm' : '10mm'
      },
      scale: isLargeTable ? 0.7 : 1, // Scale nhỏ hơn để fit
      preferCSSPageSize: false,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: ${isLargeTable ? 6 : 8}px; text-align: center; width: 100%; color: #666;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `
    });
    
    return pdfBuffer;
    
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return String(text)
    .replace(/[&<>"']/g, m => map[m])
    .replace(/½/g, '1/2')
    .replace(/¼/g, '1/4')
    .replace(/¾/g, '3/4');
}

module.exports = { generatePDF };