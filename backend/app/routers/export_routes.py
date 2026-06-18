from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, cast
from app.database import get_db
from app import auth
from app.models import Company
import pandas as pd
import xlsxwriter
import io
from urllib.parse import quote

router = APIRouter()

@router.get("") 
def export_to_excel(
    keywords: List[str] = Query(None, alias="keywords[]"),
    filename: str = Query("companies.xlsx"),
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    query = db.query(Company).filter(Company.user_id == current_user.id)
    
    if keywords:
        query = query.filter(Company.keyword.in_(keywords))

    data = query.all()

    df_data = []
    for c in data:
        email_str = ", ".join(c.email) if isinstance(c.email, list) else str(c.email or "")
        
        df_data.append({
            "Name": c.company_name,
            "Keyword": c.keyword,
            "Phone": c.phone,
            "Email": email_str,
            "Location": c.location,
            "URL": c.maps_link,
            "WebSite": c.website,
            "Raw_URL": c.maps_link,
            "Raw_WebSite": c.website
        })
    
    df = pd.DataFrame(df_data)

    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='xlsxwriter') as writer:
        workbook = cast(xlsxwriter.Workbook, writer.book)
        worksheet = workbook.add_worksheet('Companies')
        
        header_format = workbook.add_format({
            'bold': True, 'bg_color': '#2C3E50', 'font_color': '#FFFFFF',
            'border': 1, 'align': 'center', 'valign': 'vcenter'
        })
        cell_format = workbook.add_format({
            'border': 1, 'align': 'center', 'valign': 'vcenter', 'text_wrap': True
        })
        link_format = workbook.add_format({
            'font_color': 'blue', 'underline': 1, 'border': 1, 'align': 'center', 'valign': 'vcenter'
        })

        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_format)

        for row_idx in range(len(df)):
            for i, col in enumerate(df.columns):
                val = df.iloc[row_idx, i]
                clean_val = str(val) if pd.notnull(val) else ""
                
                if col in ['Raw_URL', 'Raw_WebSite']:
                    continue
                elif col in ['URL', 'WebSite']:
                    if clean_val.startswith('http'):
                        worksheet.write_url(row_idx + 1, i, clean_val, link_format, string="Open Link")
                    else:
                        worksheet.write(row_idx + 1, i, clean_val, cell_format)
                else:
                    worksheet.write(row_idx + 1, i, clean_val, cell_format)

        for i, col in enumerate(df.columns):
            if col in ['Raw_URL', 'Raw_WebSite']:
                worksheet.set_column(i, i, None, None, {'hidden': True})
            elif col == 'Email':
                worksheet.set_column(i, i, 40, cell_format)
            elif col in ['URL', 'WebSite']:
                worksheet.set_column(i, i, 15, cell_format)
            else:
                worksheet.set_column(i, i, 20, cell_format)

        for row_idx in range(len(df)):
            worksheet.set_row(row_idx + 1, None)

    buffer.seek(0)

    final_filename = filename if filename.endswith('.xlsx') else f"{filename}.xlsx"
    safe_filename = quote(final_filename)
    
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{safe_filename}"}
    )