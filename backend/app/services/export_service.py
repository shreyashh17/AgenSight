import io
import re
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

class ExportService:
    @staticmethod
    def generate_markdown(report_title: str, content: str, score: float = None, verdict: str = None, sources: list = None) -> str:
        date_str = datetime.utcnow().strftime("%B %d, %Y")
        md_lines = [
            f"# {report_title}",
            f"\n*Synthesized by AgentSight Autonomous Intelligence on {date_str}*\n",
            "---",
            "\n" + content.strip() + "\n"
        ]

        if score or verdict:
            md_lines.append("\n## Critic Agent Evaluation\n")
            if score is not None:
                md_lines.append(f"- **Rubric Score:** {score}/10")
            if verdict:
                md_lines.append(f"- **Verdict:** {verdict}")

        if sources and len(sources) > 0:
            md_lines.append("\n## Verified Sources & Citations\n")
            for idx, s in enumerate(sources, 1):
                title = s.get("title", s.get("url", "Source"))
                url = s.get("url", "#")
                domain = s.get("domain", "")
                md_lines.append(f"{idx}. [{title}]({url}) - `{domain}`")

        return "\n".join(md_lines)

    @staticmethod
    def generate_pdf(report_title: str, content: str, score: float = None, verdict: str = None, sources: list = None) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=45,
            leftMargin=45,
            topMargin=45,
            bottomMargin=45
        )

        styles = getSampleStyleSheet()

        # AgentSight Brand Color Palette for PDF
        brand_purple = colors.HexColor("#6C35F7")
        deep_space_black = colors.HexColor("#1A1C22")
        galactic_gray = colors.HexColor("#555560")
        subtle_bg = colors.HexColor("#F7F6FD")

        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontSize=20,
            leading=24,
            textColor=deep_space_black,
            fontName="Helvetica-Bold",
            spaceAfter=6
        )

        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontSize=8.5,
            leading=11,
            textColor=brand_purple,
            fontName="Helvetica-Bold",
            spaceAfter=12
        )

        h1_style = ParagraphStyle(
            'SectionH1',
            parent=styles['Heading2'],
            fontSize=13,
            leading=17,
            textColor=deep_space_black,
            fontName="Helvetica-Bold",
            spaceBefore=12,
            spaceAfter=6
        )

        h2_style = ParagraphStyle(
            'SectionH2',
            parent=styles['Heading3'],
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#2d3748"),
            fontName="Helvetica-Bold",
            spaceBefore=8,
            spaceAfter=4
        )

        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontSize=9.5,
            leading=14,
            textColor=colors.HexColor("#2B2D33"),
            spaceAfter=8
        )

        bullet_style = ParagraphStyle(
            'Bullet',
            parent=styles['Normal'],
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#2B2D33"),
            leftIndent=12,
            spaceAfter=4
        )

        story = []

        # Header Badge / Eyebrow
        story.append(Paragraph("AGENTSIGHT · AUTONOMOUS MULTI-AGENT INTELLIGENCE", subtitle_style))
        story.append(Paragraph(report_title, title_style))
        date_str = datetime.utcnow().strftime("%B %d, %Y")
        story.append(Paragraph(f"<font color='{galactic_gray.hexval()}'>Verified Autonomous Synthesis · {date_str}</font>", body_style))
        
        story.append(Spacer(1, 6))
        story.append(HRFlowable(width="100%", thickness=1, color=brand_purple, spaceAfter=12))

        # Critic Score Card if present
        if score is not None or verdict:
            verdict_text = f"<b>Critic Score:</b> {score}/10 | <b>Evaluation:</b> {verdict or 'N/A'}"
            critic_table = Table(
                [[Paragraph(verdict_text, ParagraphStyle('CriticP', parent=body_style, fontSize=9, textColor=brand_purple))]],
                colWidths=['100%']
            )
            critic_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), subtle_bg),
                ('BOX', (0,0), (-1,-1), 1, brand_purple),
                ('PADDING', (0,0), (-1,-1), 6),
            ]))
            story.append(critic_table)
            story.append(Spacer(1, 10))

        # Parse basic markdown into story elements
        lines = content.split("\n")
        for raw_line in lines:
            line = raw_line.strip()
            if not line:
                story.append(Spacer(1, 3))
                continue
            
            # Clean html tags for safe reportlab parsing
            safe_line = line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            safe_line = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", safe_line)
            safe_line = re.sub(r"\*([^*]+)\*", r"<i>\1</i>", safe_line)

            if safe_line.startswith("# "):
                story.append(Paragraph(safe_line[2:], h1_style))
            elif safe_line.startswith("## "):
                story.append(Paragraph(safe_line[3:], h1_style))
            elif safe_line.startswith("### "):
                story.append(Paragraph(safe_line[4:], h2_style))
            elif safe_line.startswith("- ") or safe_line.startswith("* "):
                story.append(Paragraph(f"• {safe_line[2:]}", bullet_style))
            elif re.match(r"^\d+\.\s", safe_line):
                story.append(Paragraph(safe_line, bullet_style))
            else:
                story.append(Paragraph(safe_line, body_style))

        # Sources Section
        if sources and len(sources) > 0:
            story.append(Spacer(1, 8))
            story.append(Paragraph("Verified Citations", h1_style))
            for idx, s in enumerate(sources, 1):
                title = (s.get("title") or s.get("url") or "Source").replace("&", "&amp;")
                url = s.get("url", "#")
                domain = s.get("domain", "")
                src_p = Paragraph(f"<b>[{idx}] {title}</b><br/><font color='#6C35F7'>{url}</font> · <i>{domain}</i>", bullet_style)
                story.append(src_p)
                story.append(Spacer(1, 2))

        doc.build(story)
        pdf_data = buffer.getvalue()
        buffer.close()
        return pdf_data

export_service = ExportService()
