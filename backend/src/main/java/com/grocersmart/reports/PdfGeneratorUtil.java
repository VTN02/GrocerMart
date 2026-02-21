package com.grocersmart.reports;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class PdfGeneratorUtil {

    // Colors
    private static final Color BRAND_COLOR = new Color(11, 110, 79); // #0B6E4F
    private static final Color HEADER_BG = new Color(245, 245, 245);
    private static final Color ALT_ROW_BG = new Color(248, 249, 250);
    private static final Color BORDER_COLOR = new Color(220, 220, 220);

    // Fonts
    private static final Font REPORT_TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BRAND_COLOR);
    private static final Font SUBTITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
    private static final Font TABLE_HEADER_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
    private static final Font CELL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);
    private static final Font FOOTER_FONT = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, Color.GRAY);
    private static final Font BRAND_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.BLACK);
    private static final Font INFO_FONT = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);

    public static byte[] generatePdf(String title, String[] headers, List<String[]> data, String summary) {
        Document document = new Document(PageSize.A4.rotate(), 20, 20, 90, 50); // Landscape for more columns
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new HeaderFooterPageEvent());

            document.open();

            // 1. Report Title Section
            Paragraph reportTitle = new Paragraph(title.toUpperCase(), REPORT_TITLE_FONT);
            reportTitle.setAlignment(Element.ALIGN_CENTER);
            document.add(reportTitle);

            Paragraph reportSubtitle = new Paragraph("Detailed Confidential Report", SUBTITLE_FONT);
            reportSubtitle.setAlignment(Element.ALIGN_CENTER);
            reportSubtitle.setSpacingAfter(20);
            document.add(reportSubtitle);

            // 2. Data Table
            if (headers != null && headers.length > 0) {
                PdfPTable table = new PdfPTable(headers.length);
                table.setWidthPercentage(100);
                table.setHeaderRows(1);

                // Table Header
                for (String columnTitle : headers) {
                    PdfPCell cell = new PdfPCell(new Phrase(columnTitle, TABLE_HEADER_FONT));
                    cell.setBackgroundColor(BRAND_COLOR);
                    cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                    cell.setPadding(8);
                    cell.setBorderColor(Color.WHITE);
                    table.addCell(cell);
                }

                // Table Data
                boolean alternate = false;
                if (data != null) {
                    for (String[] row : data) {
                        // Ensure row length matches header length to avoid misalignment
                        for (int i = 0; i < headers.length; i++) {
                            String cellData = (i < row.length) ? row[i] : "";
                            PdfPCell cell = new PdfPCell(new Phrase(cellData != null ? cellData : "-", CELL_FONT));
                            cell.setPadding(6);
                            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                            cell.setBorderColor(BORDER_COLOR);

                            if (alternate) {
                                cell.setBackgroundColor(ALT_ROW_BG);
                            }
                            table.addCell(cell);
                        }
                        alternate = !alternate;
                    }
                }
                document.add(table);
            } else {
                // Fallback for empty data
                Paragraph p = new Paragraph("\nNo records found for this report section.", INFO_FONT);
                p.setAlignment(Element.ALIGN_CENTER);
                document.add(p);
            }

            // 3. Summary Section (Bottom)
            if (summary != null && !summary.isEmpty()) {
                PdfPTable summaryTable = new PdfPTable(1);
                summaryTable.setWidthPercentage(100);
                summaryTable.setSpacingBefore(15);

                PdfPCell summaryCell = new PdfPCell(
                        new Phrase(summary, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BRAND_COLOR)));
                summaryCell.setBackgroundColor(new Color(235, 247, 242));
                summaryCell.setBorderColor(BRAND_COLOR);
                summaryCell.setPadding(10);
                summaryCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

                summaryTable.addCell(summaryCell);
                document.add(summaryTable);
            }

            document.close();

        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    // Inner class for Header and Footer
    static class HeaderFooterPageEvent extends PdfPageEventHelper {

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            addHeader(writer, document);
            addFooter(writer, document);
        }

        private void addHeader(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            float topY = document.getPageSize().getHeight() - 30;
            float marginX = 20;

            try {
                PdfPTable headerTable = new PdfPTable(3);
                headerTable.setTotalWidth(document.getPageSize().getWidth() - 40);
                headerTable.setLockedWidth(true);
                headerTable.setWidths(new float[] { 1, 4, 1 });

                // Logo
                PdfPCell logoCell = new PdfPCell(
                        new Phrase("GROCERSMART", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BRAND_COLOR)));
                logoCell.setBorder(Rectangle.NO_BORDER);
                logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                headerTable.addCell(logoCell);

                // Company Info
                PdfPCell infoCell = new PdfPCell(new Phrase("Ambal Stores | Retail Operations Platform", INFO_FONT));
                infoCell.setBorder(Rectangle.NO_BORDER);
                infoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                infoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                headerTable.addCell(infoCell);

                // Date
                String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));
                PdfPCell dateCell = new PdfPCell(new Phrase(dateStr, INFO_FONT));
                dateCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                dateCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                dateCell.setBorder(Rectangle.NO_BORDER);
                headerTable.addCell(dateCell);

                headerTable.writeSelectedRows(0, -1, marginX, topY, cb);

                cb.setLineWidth(1f);
                cb.setColorStroke(Color.LIGHT_GRAY);
                cb.moveTo(marginX, topY - 15);
                cb.lineTo(document.getPageSize().getWidth() - marginX, topY - 15);
                cb.stroke();

            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        private void addFooter(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            float bottomY = 20;

            ColumnText.showTextAligned(cb, Element.ALIGN_CENTER,
                    new Phrase("Generated by GrocerSmart AI Reporting Engine | Confidential", FOOTER_FONT),
                    (document.getPageSize().getWidth()) / 2, bottomY, 0);

            ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                    new Phrase(String.format("Page %d", writer.getPageNumber()), FOOTER_FONT),
                    document.getPageSize().getWidth() - 20, bottomY, 0);
        }
    }
}
