from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import xlsxwriter

from HIFACHAMA.utils.reports import get_transaction_data  # Replace with the actual location of your function if it's different

def generate_pdf_report(request):
    # Assuming get_transaction_data() returns a valid transaction dataframe.
    transactions = get_transaction_data()

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="transaction_report.pdf"'

    pdf = canvas.Canvas(response, pagesize=letter)
    pdf.setTitle("Transaction Report")

    pdf.drawString(100, 750, "Transaction Report")
    pdf.drawString(100, 730, "----------------------")

    y_position = 700
    for index, row in transactions.iterrows():
        pdf.drawString(100, y_position, f"{row['member__username']} | {row['transaction_type']} | KES {row['amount']} | {row['timestamp']}")
        y_position -= 20

    pdf.save()
    return response


def generate_excel_report(request):
    # Assuming get_transaction_data() returns a valid transaction dataframe.
    transactions = get_transaction_data()

    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename="transaction_report.xlsx"'

    workbook = xlsxwriter.Workbook(response, {'in_memory': True})
    worksheet = workbook.add_worksheet()

    headers = ["Member", "Transaction Type", "Amount", "Timestamp"]
    for col_num, header in enumerate(headers):
        worksheet.write(0, col_num, header)

    for row_num, row in enumerate(transactions.itertuples(), start=1):
        worksheet.write(row_num, 0, row.member__username)
        worksheet.write(row_num, 1, row.transaction_type)
        worksheet.write(row_num, 2, row.amount)
        worksheet.write(row_num, 3, str(row.timestamp))

    workbook.close()
    return response
