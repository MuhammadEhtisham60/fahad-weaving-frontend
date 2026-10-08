import { buildPurchaseReceiptHtml, createPurchaseReceiptPdf } from "./receiptTemplate.js";
import logoUrl from "../../../assets/branding/pdflogo.png";

export { buildPurchaseReceiptHtml, createPurchaseReceiptPdf, getReceiptData, receiptBrand } from "./receiptTemplate.js";

export async function downloadPurchaseOrderPdf(purchase) {
  // Load logo image and convert to JPEG bytes for PDF embedding
  async function loadLogoAsJpeg(url, size = 36) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = async () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, 0, 0, size, size);
          const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.9));
          const buf = await blob.arrayBuffer();
          resolve({ data: new Uint8Array(buf), width: size, height: size });
        } catch (e) {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  const logo = await loadLogoAsJpeg(logoUrl, 36);
  const pdfBuf = await createPurchaseReceiptPdf(purchase, { logo });
  const blob = new Blob([pdfBuf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${purchase.id}-purchase-receipt.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function buildPurchaseOrderPrintHtml(purchase) {
  return buildPurchaseReceiptHtml(purchase, { fullDocument: true });
}

export function printPurchaseOrder(purchase) {
  const html = buildPurchaseReceiptHtml(purchase, { fullDocument: true });
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.onload = () => {
    win.print();
    win.onafterprint = () => win.close();
  };
}

// Backward-compatible export name
export const createPurchaseOrderPdf = createPurchaseReceiptPdf;
