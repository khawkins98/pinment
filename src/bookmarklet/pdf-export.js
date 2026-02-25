/**
 * PDF export module
 *
 * Generates a single-page PDF with a full-page screenshot (pin dots overlaid)
 * and a comment appendix below. Libraries (html2canvas + jsPDF) are loaded
 * from CDN on demand — zero npm dependencies.
 */

const HTML2CANVAS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
const JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/3.0.3/jspdf.umd.min.js';

const CATEGORY_LABELS = {
  text: 'Text issue',
  layout: 'Layout issue',
  missing: 'Missing content',
  question: 'Question',
};

const CATEGORY_COLORS = {
  text: [59, 130, 246],
  layout: [168, 85, 247],
  missing: [249, 115, 22],
  question: [20, 184, 166],
};

/**
 * Dynamically loads a script from a CDN URL.
 * Resolves immediately if window[globalName] already exists (idempotent).
 */
export function loadScript(url, globalName, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    // Check nested property (e.g. "jspdf.jsPDF")
    const value = globalName.split('.').reduce((obj, key) => obj && obj[key], window);
    if (value) {
      resolve(value);
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    const timer = setTimeout(() => {
      script.remove();
      reject(new Error(`Timeout loading ${url}`));
    }, timeoutMs);

    script.onload = () => {
      clearTimeout(timer);
      const loaded = globalName.split('.').reduce((obj, key) => obj && obj[key], window);
      if (loaded) {
        resolve(loaded);
      } else {
        reject(new Error(`${globalName} not found after loading ${url}`));
      }
    };

    script.onerror = () => {
      clearTimeout(timer);
      script.remove();
      reject(new Error(`Failed to load ${url}`));
    };

    document.head.appendChild(script);
  });
}

/**
 * Recalculates page-absolute coordinates for each pin from its element anchor.
 * Falls back to fx/fy if the selector doesn't match.
 */
export function resolvePinPositions(pins) {
  return pins.map(pin => {
    let x = pin.fx;
    let y = pin.fy;
    let resolved = false;

    if (pin.s) {
      try {
        const target = document.querySelector(pin.s);
        if (target) {
          const rect = target.getBoundingClientRect();
          const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
          const scrollY = window.pageYOffset || document.documentElement.scrollTop;
          x = rect.left + scrollX + (pin.ox != null ? pin.ox : 0.5) * rect.width;
          y = rect.top + scrollY + (pin.oy != null ? pin.oy : 0.5) * rect.height;
          resolved = true;
        }
      } catch { /* invalid selector */ }
    }

    return { id: pin.id, x, y, resolved };
  });
}

/**
 * Hides all Pinment UI elements, captures a full-page screenshot, then restores them.
 */
export async function capturePageScreenshot(html2canvas) {
  const selectors = [
    '#pinment-panel',
    '#pinment-overlay',
    '#pinment-pin-container',
    '#pinment-minimized-btn',
    '.pinment-modal-backdrop',
  ];

  // Save and hide
  const saved = [];
  for (const sel of selectors) {
    const els = document.querySelectorAll(sel);
    for (const el of els) {
      saved.push({ el, display: el.style.display });
      el.style.display = 'none';
    }
  }

  // Save scroll position, then scroll to top for reliable capture
  const prevScrollX = window.scrollX;
  const prevScrollY = window.scrollY;
  window.scrollTo(0, 0);

  const fullWidth = document.documentElement.scrollWidth;
  const fullHeight = document.documentElement.scrollHeight;

  try {
    const canvas = await html2canvas(document.body, {
      x: 0,
      y: 0,
      width: fullWidth,
      height: fullHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: fullWidth,
      windowHeight: fullHeight,
      scale: 1,
      useCORS: true,
      allowTaint: true,
      logging: false,
    });
    return canvas;
  } finally {
    // Restore scroll position and visibility
    window.scrollTo(prevScrollX, prevScrollY);
    for (const { el, display } of saved) {
      el.style.display = display;
    }
  }
}

/**
 * Draws numbered circles at each pin position on the canvas.
 * Red for open pins, gray for resolved.
 */
export function drawPinsOnCanvas(canvas, resolvedPositions) {
  const ctx = canvas.getContext('2d');
  const radius = 18;
  const borderWidth = 3;

  for (const pos of resolvedPositions) {
    // Circle fill — gray for resolved, red for open
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = pos.resolved ? '#9ca3af' : '#e53e3e';
    ctx.fill();

    // White border
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Number
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(pos.id), pos.x, pos.y);
  }
}

function pxToMm(px) {
  return px * 25.4 / 96;
}

const DEFAULT_FONT = 'helvetica';

/**
 * Measures how much vertical space the appendix will need using a temporary jsPDF.
 */
export function measureAppendix(jsPDF, pins, stateData, pageWidthMm) {
  const marginMm = 10;
  const contentWidth = pageWidthMm - marginMm * 2;
  const tmp = new jsPDF({ unit: 'mm', format: [pageWidthMm, 1000] });
  let y = 0;
  const sections = [];

  // Title
  y += 8;
  sections.push({ type: 'title', y });
  y += 10;

  // URL + date
  sections.push({ type: 'meta', y, url: stateData.url, date: new Date().toISOString().slice(0, 10) });
  y += 8;

  for (const pin of pins) {
    // Separator
    y += 4;
    sections.push({ type: 'separator', y });
    y += 6;

    // Pin header line
    sections.push({ type: 'pin-header', y, pin });
    y += 7;

    // Comment text
    if (pin.text) {
      tmp.setFont(DEFAULT_FONT, 'normal');
      tmp.setFontSize(11);
      const lines = tmp.splitTextToSize(pin.text, contentWidth - 10);
      sections.push({ type: 'pin-text', y, lines });
      y += lines.length * 5;
    }
    y += 2;

    // Replies
    if (pin.replies && pin.replies.length > 0) {
      for (const reply of pin.replies) {
        const replyAuthor = reply.author ? `${reply.author}: ` : '';
        const replyText = replyAuthor + (reply.text || '');
        tmp.setFont(DEFAULT_FONT, 'normal');
        tmp.setFontSize(10);
        const replyLines = tmp.splitTextToSize(replyText, contentWidth - 20);
        sections.push({ type: 'reply', y, lines: replyLines, author: reply.author });
        y += replyLines.length * 4.5 + 2;
      }
    }
  }

  y += 10;
  return { heightMm: y, sections };
}

/**
 * Renders the pre-measured appendix onto the final PDF.
 */
export function renderAppendix(pdf, layout, startY, pageWidthMm) {
  const marginMm = 10;
  const contentWidth = pageWidthMm - marginMm * 2;

  // White background for the appendix area
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, startY, pageWidthMm, layout.heightMm, 'F');

  for (const section of layout.sections) {
    const y = startY + section.y;

    switch (section.type) {
      case 'title':
        pdf.setFontSize(16);
        pdf.setFont(DEFAULT_FONT, 'bold');
        pdf.setTextColor(26, 32, 44);
        pdf.text('Pinment Annotations', marginMm, y);
        break;

      case 'meta':
        pdf.setFontSize(9);
        pdf.setFont(DEFAULT_FONT, 'normal');
        pdf.setTextColor(113, 128, 150);
        pdf.text(`${section.url}  |  ${section.date}`, marginMm, y);
        break;

      case 'separator':
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.3);
        pdf.line(marginMm, y, marginMm + contentWidth, y);
        break;

      case 'pin-header': {
        const pin = section.pin;
        // Circle with number — gray for resolved, red for open
        const circleR = 3.5;
        const circleX = marginMm + circleR;
        const circleY = y - 1.5;
        pdf.setFillColor(pin.resolved ? 156 : 229, pin.resolved ? 163 : 62, pin.resolved ? 175 : 62);
        pdf.circle(circleX, circleY, circleR, 'F');
        pdf.setFontSize(8);
        pdf.setFont(DEFAULT_FONT, 'bold');
        pdf.setTextColor(255, 255, 255);
        pdf.text(String(pin.id), circleX, circleY + 0.5, { align: 'center' });

        // Author
        let headerX = marginMm + circleR * 2 + 3;
        if (pin.author) {
          pdf.setFontSize(11);
          pdf.setFont(DEFAULT_FONT, 'bold');
          pdf.setTextColor(26, 32, 44);
          pdf.text(pin.author, headerX, y);
          headerX += pdf.getTextWidth(pin.author) + 3;
        }

        // Category badge
        if (pin.c && CATEGORY_LABELS[pin.c]) {
          const colors = CATEGORY_COLORS[pin.c] || [100, 100, 100];
          pdf.setFontSize(8);
          pdf.setFont(DEFAULT_FONT, 'normal');
          pdf.setTextColor(colors[0], colors[1], colors[2]);
          pdf.text(CATEGORY_LABELS[pin.c], headerX, y);
          headerX += pdf.getTextWidth(CATEGORY_LABELS[pin.c]) + 3;
        }

        // Resolved badge
        if (pin.resolved) {
          pdf.setFontSize(8);
          pdf.setFont(DEFAULT_FONT, 'normal');
          pdf.setTextColor(34, 197, 94);
          pdf.text('Resolved', headerX, y);
        }
        break;
      }

      case 'pin-text':
        pdf.setFontSize(11);
        pdf.setFont(DEFAULT_FONT, 'normal');
        pdf.setTextColor(45, 55, 72);
        pdf.text(section.lines, marginMm + 10, y);
        break;

      case 'reply':
        pdf.setFontSize(10);
        pdf.setFont(DEFAULT_FONT, 'normal');
        pdf.setTextColor(74, 85, 104);
        pdf.text(section.lines, marginMm + 20, y);
        break;
    }
  }
}

/**
 * Main export function. Generates and downloads a PDF with annotated screenshot.
 */
export async function exportPdf(pins, stateData, onProgress) {
  try {
    onProgress('Loading PDF libraries...');
    const html2canvas = await loadScript(HTML2CANVAS_URL, 'html2canvas');
    await loadScript(JSPDF_URL, 'jspdf');
    const jsPDF = window.jspdf.jsPDF;

    onProgress('Capturing page...');
    const positions = resolvePinPositions(pins);
    const canvas = await capturePageScreenshot(html2canvas);
    drawPinsOnCanvas(canvas, positions.map(pos => {
      const pin = pins.find(p => p.id === pos.id);
      return { ...pos, resolved: !!(pin && pin.resolved) };
    }));

    onProgress('Building PDF...');
    let dataUrl;
    try {
      dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    } catch {
      dataUrl = canvas.toDataURL();
    }

    const imgWidthMm = pxToMm(canvas.width);
    const imgHeightMm = pxToMm(canvas.height);

    // Two-pass: measure appendix, then create final PDF
    const appendixLayout = measureAppendix(jsPDF, pins, stateData, imgWidthMm);
    const totalHeightMm = imgHeightMm + appendixLayout.heightMm;

    const pdf = new jsPDF({
      unit: 'mm',
      format: [imgWidthMm, totalHeightMm],
    });

    pdf.addImage(dataUrl, 'JPEG', 0, 0, imgWidthMm, imgHeightMm);
    renderAppendix(pdf, appendixLayout, imgHeightMm, imgWidthMm);

    const filename = `pinment-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(filename);
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    if (msg.includes('Timeout') || msg.includes('Failed to load')) {
      throw new Error('Failed to load PDF libraries. Check your internet connection or CSP settings.');
    }
    throw err;
  }
}
