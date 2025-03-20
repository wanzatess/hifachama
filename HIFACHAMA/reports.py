from django.http import HttpResponse

def generate_pdf_report(request):
    return HttpResponse("PDF report generated successfully!")

def generate_excel_report(request):
    return HttpResponse("Excel report generated successfully!")
