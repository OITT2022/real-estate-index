import fs from "fs";
import path from "path";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  ImageRun, AlignmentType, ShadingType, PageBreak,
  TableLayoutType,
} from "docx";

const md = fs.readFileSync(path.resolve("docs/user-manual-en.md"), "utf-8");
const imgDir = path.resolve("docs/images");

// Parse markdown into structured blocks
function parseMd(text) {
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;
  let inTable = false;
  let tableRows = [];
  let inCode = false;
  let codeLines = [];

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith("```")) {
      if (inCode) {
        blocks.push({ type: "code", content: codeLines.join("\n") });
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      i++;
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      i++;
      continue;
    }

    // Flush table if we leave table area
    if (inTable && !line.startsWith("|")) {
      blocks.push({ type: "table", rows: tableRows });
      tableRows = [];
      inTable = false;
    }

    // Table rows
    if (line.startsWith("|")) {
      const cells = line.split("|").slice(1, -1).map(c => c.trim());
      // Skip separator rows
      if (cells.every(c => /^[-:]+$/.test(c))) {
        i++;
        continue;
      }
      tableRows.push(cells);
      inTable = true;
      i++;
      continue;
    }

    // Headings
    const hMatch = line.match(/^(#{1,4})\s+(.*)/);
    if (hMatch) {
      blocks.push({ type: "heading", level: hMatch[1].length, content: hMatch[2] });
      i++;
      continue;
    }

    // Images
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      blocks.push({ type: "image", alt: imgMatch[1], src: imgMatch[2] });
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // NEED FURTHER IMAGE marker
    if (line.includes("NEED FURTHER IMAGE")) {
      blocks.push({ type: "paragraph", content: line.replace(/\*\*/g, ""), bold: true });
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Regular paragraph / list item
    blocks.push({ type: "paragraph", content: line });
    i++;
  }

  // Flush trailing table
  if (inTable) {
    blocks.push({ type: "table", rows: tableRows });
  }

  return blocks;
}

// Convert inline markdown (bold, code, links) to TextRun array
function inlineRuns(text) {
  const runs = [];
  // Process bold, inline code, and plain text
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  for (const p of parts) {
    if (!p) continue;
    if (p.startsWith("**") && p.endsWith("**")) {
      runs.push(new TextRun({ text: p.slice(2, -2), bold: true, font: "Calibri", size: 22 }));
    } else if (p.startsWith("`") && p.endsWith("`")) {
      runs.push(new TextRun({ text: p.slice(1, -1), font: "Consolas", size: 20, color: "555555" }));
    } else if (p.match(/^\[([^\]]+)\]\(([^)]+)\)$/)) {
      const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      runs.push(new TextRun({ text: m[1], font: "Calibri", size: 22, color: "2563EB" }));
    } else {
      runs.push(new TextRun({ text: p, font: "Calibri", size: 22 }));
    }
  }
  return runs;
}

function headingLevel(n) {
  return [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4][n - 1] || HeadingLevel.HEADING_4;
}

// Build document children
const blocks = parseMd(md);
const children = [];

// Title page
children.push(new Paragraph({ spacing: { before: 4000 } }));
children.push(new Paragraph({
  children: [new TextRun({ text: "AradRe Real Estate Index", bold: true, font: "Calibri", size: 56, color: "0F766E" })],
  alignment: AlignmentType.CENTER,
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "User Manual", bold: true, font: "Calibri", size: 40, color: "334155" })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 400 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "April 2026", font: "Calibri", size: 28, color: "64748B" })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "Based on full analysis of the system as currently implemented", font: "Calibri", size: 22, color: "94A3B8", italics: true })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 400 },
}));
children.push(new Paragraph({
  children: [new PageBreak()],
}));

for (const block of blocks) {
  if (block.type === "heading") {
    // Page break before H1 sections (except first)
    if (block.level === 1) continue; // Skip the title, we made our own
    if (block.level === 2 && !block.content.includes("Table of Contents")) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
    children.push(new Paragraph({
      children: [new TextRun({
        text: block.content.replace(/[*`]/g, ""),
        bold: true,
        font: "Calibri",
        size: block.level === 2 ? 36 : block.level === 3 ? 28 : 24,
        color: block.level === 2 ? "0F766E" : "1E293B",
      })],
      heading: headingLevel(block.level),
      spacing: { before: block.level === 2 ? 400 : 200, after: 100 },
    }));
  } else if (block.type === "paragraph") {
    const text = block.content;
    // List items
    if (text.startsWith("- ") || text.startsWith("* ")) {
      const content = text.replace(/^[-*]\s+/, "");
      children.push(new Paragraph({
        children: inlineRuns(content),
        bullet: { level: 0 },
        spacing: { after: 60 },
      }));
    } else if (text.match(/^\d+\.\s/)) {
      const content = text.replace(/^\d+\.\s+/, "");
      children.push(new Paragraph({
        children: [new TextRun({ text: "  " }), ...inlineRuns(content)],
        spacing: { after: 60 },
      }));
    } else {
      children.push(new Paragraph({
        children: block.bold
          ? [new TextRun({ text: text, bold: true, font: "Calibri", size: 22, color: "DC2626" })]
          : inlineRuns(text),
        spacing: { after: 80 },
      }));
    }
  } else if (block.type === "code") {
    for (const codeLine of block.content.split("\n")) {
      children.push(new Paragraph({
        children: [new TextRun({ text: codeLine || " ", font: "Consolas", size: 18, color: "1E293B" })],
        shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
        spacing: { after: 0 },
      }));
    }
    children.push(new Paragraph({ spacing: { after: 100 } }));
  } else if (block.type === "table" && block.rows.length > 0) {
    const colCount = block.rows[0].length;
    const isHeader = true;
    const rows = block.rows.map((cells, ri) => {
      return new TableRow({
        children: cells.map(cell =>
          new TableCell({
            children: [new Paragraph({
              children: inlineRuns(cell),
              spacing: { after: 0 },
            })],
            shading: ri === 0 ? { type: ShadingType.CLEAR, fill: "F0FDFA" } : undefined,
            width: { size: Math.floor(9000 / colCount), type: WidthType.DXA },
          })
        ),
      });
    });
    children.push(new Table({
      rows,
      width: { size: 9000, type: WidthType.DXA },
      layout: TableLayoutType.AUTOFIT,
    }));
    children.push(new Paragraph({ spacing: { after: 100 } }));
  } else if (block.type === "image") {
    // Try to load the image
    const imgName = block.src.split("/").pop();
    const imgPath = path.join(imgDir, imgName);
    if (fs.existsSync(imgPath)) {
      try {
        const imgBuf = fs.readFileSync(imgPath);
        children.push(new Paragraph({
          children: [
            new ImageRun({
              data: imgBuf,
              transformation: { width: 580, height: 340 },
              type: imgName.endsWith(".png") ? "png" : "jpg",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 60 },
        }));
        // Caption
        children.push(new Paragraph({
          children: [new TextRun({ text: block.alt || imgName, font: "Calibri", size: 18, italics: true, color: "64748B" })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }));
      } catch (e) {
        children.push(new Paragraph({
          children: [new TextRun({ text: `[Image: ${imgName}]`, font: "Calibri", size: 20, italics: true, color: "94A3B8" })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }));
      }
    } else {
      children.push(new Paragraph({
        children: [new TextRun({ text: `[Image not found: ${imgName}]`, font: "Calibri", size: 20, italics: true, color: "DC2626" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }));
    }
  } else if (block.type === "hr") {
    // Skip, we use page breaks for sections
  }
}

const doc = new Document({
  creator: "AradRe Platform",
  title: "AradRe Real Estate Index — User Manual",
  description: "Complete user manual for the AradRe real estate platform",
  sections: [{
    properties: {
      page: {
        margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 },
      },
    },
    children,
  }],
});

const buf = await Packer.toBuffer(doc);
fs.writeFileSync(path.resolve("docs/AradRe-User-Manual.docx"), buf);
console.log("DOCX created: docs/AradRe-User-Manual.docx (" + Math.round(buf.length / 1024) + " KB)");
