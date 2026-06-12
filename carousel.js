// carousel.js — LinkedAgent Auto-Carousel PDF Generator v2
// Fixes: real content on every slide, image embeds, robust markdown parser

/**
 * generateCarouselPDF
 * @param {string} markdownSource  — raw draft text or extracted list/table
 * @param {string} title           — post title / technology name
 * @param {Array}  images          — array of { dataUrl, fileName } objects (optional)
 */
export function generateCarouselPDF(markdownSource, title = "LinkedIn Carousel", images = []) {
  if (!window.jspdf?.jsPDF) {
    alert("PDF library not loaded. Please wait a moment and try again.");
    return;
  }

  const { jsPDF } = window.jspdf;

  // ── LinkedIn carousel colours (dark, branded) ─────────────────
  const C = {
    bg:      [8,  14, 30],
    bg2:     [13, 22, 45],
    accent:  [10, 102, 194],   // LinkedIn blue
    accent2: [55, 143, 233],
    accent3: [112, 181, 249],
    violet:  [139, 92, 246],
    white:   [255, 255, 255],
    offwhite:[220, 232, 248],
    muted:   [100, 130, 175],
    green:   [34,  197, 94],
  };

  // ── Build slides ───────────────────────────────────────────────
  const slides = buildSlides(markdownSource, title, images);

  // A4 landscape (297×210 mm) — LinkedIn renders PDFs as carousels
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();   // 297 mm
  const H = doc.internal.pageSize.getHeight();  // 210 mm

  slides.forEach((slide, idx) => {
    if (idx > 0) doc.addPage();
    drawSlide(doc, slide, idx, slides.length, W, H, C, title);
  });

  const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40);
  doc.save(`${safeTitle || 'carousel'}_linkedagent.pdf`);
}

// ── SLIDE DISPATCHER ──────────────────────────────────────────────────────────
function drawSlide(doc, slide, idx, total, W, H, C, title) {
  // ── Background gradient simulation (two rects) ──
  doc.setFillColor(...C.bg);
  doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(...C.bg2);
  doc.rect(W * 0.45, 0, W * 0.55, H, 'F');

  // ── Left accent bar ──
  doc.setFillColor(...C.accent);
  doc.rect(0, 0, 5, H, 'F');

  // ── Top brand stripe ──
  doc.setFillColor(...C.accent);
  doc.setGState && doc.setGState(doc.GState({ opacity: 0.15 }));
  doc.rect(0, 0, W, 2, 'F');
  doc.setGState && doc.setGState(doc.GState({ opacity: 1 }));

  // ── LinkedAgent watermark (bottom left) ──
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.muted);
  doc.text('LinkedAgent · Foundry IQ', 10, H - 6);

  // ── Slide counter badge (bottom right) ──
  doc.setFillColor(...C.accent);
  doc.roundedRect(W - 32, H - 16, 26, 10, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.white);
  doc.text(`${idx + 1} / ${total}`, W - 19, H - 9, { align: 'center' });

  // ── Dispatch by type ──
  switch (slide.type) {
    case 'cover':      drawCoverSlide(doc, slide, W, H, C, title); break;
    case 'item':       drawItemSlide(doc, slide, W, H, C, title);  break;
    case 'image':      drawImageSlide(doc, slide, W, H, C, title); break;
    case 'table-intro':drawTableIntroSlide(doc, slide, W, H, C);   break;
    case 'table-row':  drawTableRowSlide(doc, slide, W, H, C);     break;
    case 'cta':        drawCTASlide(doc, slide, W, H, C);          break;
    default: break;
  }
}

// ── COVER SLIDE ───────────────────────────────────────────────────────────────
function drawCoverSlide(doc, slide, W, H, C, title) {
  // Large decorative circle
  doc.setFillColor(...C.accent);
  doc.setGState && doc.setGState(doc.GState({ opacity: 0.08 }));
  doc.circle(W - 40, H / 2, 90, 'F');
  doc.setGState && doc.setGState(doc.GState({ opacity: 1 }));

  // "LINKEDIN CAROUSEL" eyebrow
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.accent2);
  doc.text('LINKEDIN CAROUSEL', 18, 35);

  // Divider line
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(0.5);
  doc.line(18, 38, 80, 38);

  // Main title — large, wrapped
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.white);
  const titleLines = doc.splitTextToSize(slide.title || title, W * 0.6);
  doc.text(titleLines, 18, 58);

  // Subtitle / description
  if (slide.subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.offwhite);
    const subLines = doc.splitTextToSize(slide.subtitle, W * 0.55);
    doc.text(subLines, 18, 58 + titleLines.length * 14 + 6);
  }

  // Swipe hint
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.muted);
  doc.text('Swipe to explore →', 18, H - 22);
}

// ── ITEM SLIDE (list point) ───────────────────────────────────────────────────
function drawItemSlide(doc, slide, W, H, C, title) {
  // Large point number — decorative background text
  doc.setFontSize(110);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(C.accent[0], C.accent[1], C.accent[2]);
  doc.setGState && doc.setGState(doc.GState({ opacity: 0.08 }));
  doc.text(String(slide.pointIndex).padStart(2, '0'), W - 55, H - 5);
  doc.setGState && doc.setGState(doc.GState({ opacity: 1 }));

  // Topic label (title in small caps)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.accent2);
  doc.text((title || 'KEY INSIGHT').toUpperCase().slice(0, 40), 18, 25);

  // Point number pill
  doc.setFillColor(...C.accent);
  doc.roundedRect(18, 32, 22, 10, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.white);
  doc.text(`#${slide.pointIndex}`, 29, 39, { align: 'center' });

  // Main heading
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.white);
  const headLines = doc.splitTextToSize(slide.heading || '', W - 40);
  doc.text(headLines, 18, 56);

  // Body text
  if (slide.body && slide.body.trim()) {
    const bodyY = 56 + headLines.length * 11 + 5;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.offwhite);
    const bodyLines = doc.splitTextToSize(slide.body, W - 40);
    doc.text(bodyLines.slice(0, 6), 18, bodyY); // cap at 6 lines
  }

  // Bottom accent line
  doc.setDrawColor(...C.accent2);
  doc.setLineWidth(0.3);
  doc.line(18, H - 24, 80, H - 24);
}

// ── IMAGE SLIDE ───────────────────────────────────────────────────────────────
function drawImageSlide(doc, slide, W, H, C, title) {
  // Caption area on left
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.accent2);
  doc.text((title || '').toUpperCase().slice(0, 35), 18, 25);

  // Image number
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.white);
  doc.text(`Image ${slide.imageIndex} of ${slide.totalImages}`, 18, 36);

  // Caption text
  if (slide.caption) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.offwhite);
    const capLines = doc.splitTextToSize(slide.caption, W * 0.38);
    doc.text(capLines, 18, 50);
  }

  // Embed image on right side
  if (slide.dataUrl) {
    try {
      const imgX = W * 0.42;
      const imgW = W * 0.54;
      const imgH = H * 0.80;
      const imgY = (H - imgH) / 2;

      // Image border/frame
      doc.setFillColor(...C.bg2);
      doc.roundedRect(imgX - 2, imgY - 2, imgW + 4, imgH + 4, 3, 3, 'F');

      // Determine format
      const fmt = slide.dataUrl.includes('data:image/png') ? 'PNG'
                : slide.dataUrl.includes('data:image/webp') ? 'WEBP'
                : 'JPEG';

      doc.addImage(slide.dataUrl, fmt, imgX, imgY, imgW, imgH, undefined, 'FAST');
    } catch (e) {
      // Image embed failed — show placeholder text
      doc.setFontSize(10);
      doc.setTextColor(...C.muted);
      doc.text('[Image could not be embedded]', W * 0.62, H / 2, { align: 'center' });
    }
  }
}

// ── TABLE INTRO SLIDE ─────────────────────────────────────────────────────────
function drawTableIntroSlide(doc, slide, W, H, C) {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.accent2);
  doc.text('DATA TABLE', 18, 30);

  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.white);
  doc.text('Key Metrics', 18, 50);

  // Column headers as pills
  const headers = slide.headers || [];
  const cellW = Math.min(55, (W - 36) / Math.max(headers.length, 1));
  headers.forEach((h, i) => {
    const x = 18 + i * (cellW + 4);
    doc.setFillColor(...C.accent);
    doc.roundedRect(x, 65, cellW, 10, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.white);
    const label = doc.splitTextToSize(String(h), cellW - 4);
    doc.text(label[0] || '', x + cellW / 2, 71.5, { align: 'center' });
  });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.muted);
  doc.text(`${slide.totalRows} rows follow →`, 18, 88);
}

// ── TABLE ROW SLIDE ───────────────────────────────────────────────────────────
function drawTableRowSlide(doc, slide, W, H, C) {
  const headers = slide.headers || [];
  const values  = slide.values  || [];
  const cellW   = Math.min(55, (W - 36) / Math.max(headers.length, 1));

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.muted);
  doc.text(`Row ${slide.rowIndex} of ${slide.totalRows}`, 18, 22);

  headers.forEach((h, i) => {
    const x = 18 + i * (cellW + 4);

    // Header pill
    doc.setFillColor(...C.bg2);
    doc.roundedRect(x, 28, cellW, 9, 1.5, 1.5, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.accent3);
    doc.text(doc.splitTextToSize(String(h), cellW - 3)[0] || '', x + cellW / 2, 34, { align: 'center' });

    // Value box
    doc.setFillColor(...C.bg2);
    doc.setDrawColor(...C.accent);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, 42, cellW, 28, 1.5, 1.5, 'FD');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.white);
    const valLines = doc.splitTextToSize(String(values[i] || '—'), cellW - 4);
    doc.text(valLines.slice(0, 3), x + cellW / 2, 52, { align: 'center' });
  });
}

// ── CTA SLIDE ─────────────────────────────────────────────────────────────────
function drawCTASlide(doc, slide, W, H, C) {
  // Decorative circles
  doc.setFillColor(...C.violet);
  doc.setGState && doc.setGState(doc.GState({ opacity: 0.1 }));
  doc.circle(W / 2, H / 2, 70, 'F');
  doc.setFillColor(...C.accent2);
  doc.circle(W / 2, H / 2, 50, 'F');
  doc.setGState && doc.setGState(doc.GState({ opacity: 1 }));

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.accent3);
  doc.text('SHARE YOUR THOUGHTS', W / 2, H / 2 - 28, { align: 'center' });

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.white);
  doc.text('What do you think?', W / 2, H / 2 - 8, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.offwhite);
  doc.text('Drop a comment below  ↓', W / 2, H / 2 + 12, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text('Follow for more insights like this', W / 2, H / 2 + 26, { align: 'center' });
}

// ── SLIDE BUILDER ─────────────────────────────────────────────────────────────
function buildSlides(source, title, images = []) {
  const slides = [];

  // ── 1. Parse text content ──
  const textSlides = parseTextToSlides(source, title);

  // ── 2. Cover always first ──
  const coverSubtitle = textSlides.length > 0
    ? `${textSlides.length} key insights inside`
    : images.length > 0 ? `${images.length} visuals` : '';

  slides.push({ type: 'cover', title, subtitle: coverSubtitle });

  // ── 3. Text content slides ──
  textSlides.forEach(s => slides.push(s));

  // ── 4. Image slides (one per image) ──
  images.forEach((img, i) => {
    slides.push({
      type: 'image',
      imageIndex: i + 1,
      totalImages: images.length,
      dataUrl: img.dataUrl,
      caption: img.caption || img.fileName || `Visual ${i + 1}`
    });
  });

  // ── 5. CTA always last ──
  slides.push({ type: 'cta' });

  return slides;
}

// ── MARKDOWN → SLIDES PARSER ──────────────────────────────────────────────────
function parseTextToSlides(source, title) {
  if (!source || source.trim().length < 5) return [];

  const lines = source
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  // ── Detect markdown table ──
  const tableLines = lines.filter(l => l.startsWith('|'));
  if (tableLines.length >= 3) {
    const headers = tableLines[0]
      .split('|').map(h => h.trim()).filter(Boolean);
    // Row 1 is headers, row 2 is separator (---)
    const dataRows = tableLines.slice(2)
      .filter(l => !l.replace(/[|\s-]/g, '').length === 0) // skip pure separator rows
      .map(row => row.split('|').map(c => c.trim()).filter(Boolean))
      .filter(r => r.length > 0);

    if (headers.length > 0 && dataRows.length > 0) {
      const result = [];
      result.push({ type: 'table-intro', headers, totalRows: dataRows.length });
      dataRows.forEach((values, i) => {
        result.push({ type: 'table-row', headers, values, rowIndex: i + 1, totalRows: dataRows.length });
      });
      return result;
    }
  }

  // ── Parse as list / plain text ──
  const items = [];
  lines.forEach(line => {
    // Skip H1/H2 headings — use as cover title instead
    if (/^#{1,2}\s/.test(line)) return;

    // Strip list markers
    const clean = line
      .replace(/^#{1,6}\s+/, '')         // headings
      .replace(/^[-*•+]\s+/, '')          // unordered list
      .replace(/^\d+[.)]\s+/, '')         // ordered list
      .replace(/\*\*(.*?)\*\*/g, '$1')    // bold
      .replace(/\*(.*?)\*/g, '$1')        // italic
      .replace(/`(.*?)`/g, '$1')          // inline code
      .trim();

    if (clean.length > 0) items.push(clean);
  });

  // Group into slides: heading + optional body
  const slides = [];
  items.forEach((item, i) => {
    const colonIdx = item.indexOf(':');
    if (colonIdx > 0 && colonIdx < 60) {
      slides.push({
        type: 'item',
        heading: item.slice(0, colonIdx).trim(),
        body: item.slice(colonIdx + 1).trim(),
        pointIndex: slides.length + 1
      });
    } else if (item.length > 80) {
      // Long sentence — use first 60 chars as heading, rest as body
      const words = item.split(' ');
      const h = words.slice(0, 8).join(' ');
      const b = words.slice(8).join(' ');
      slides.push({ type: 'item', heading: h, body: b, pointIndex: slides.length + 1 });
    } else {
      slides.push({ type: 'item', heading: item, body: '', pointIndex: slides.length + 1 });
    }
  });

  return slides;
}
