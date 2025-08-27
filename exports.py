from fastapi import HTTPException, Response
from sqlmodel import Session, select
from database import engine
from models import Employee, OvertimeRequest, OvertimePayment, TravelcostRequest, TravelcostPayment, ExamParticipation, ExamPayment
from io import BytesIO 
import xml.etree.ElementTree as ET


# This function is used to export the exam participations to an XML file
async def export_exam_participations(exampayment_id: int, session : Session):
    statement = select(ExamPayment).where(ExamPayment.id == exampayment_id)
    payment = session.exec(statement).first()

    statement2 = select(ExamParticipation).where(ExamParticipation.payment_id == exampayment_id).where(ExamParticipation.paid == 1)
    participations =  session.exec(statement2).all()

    ns = "http://www.gsis.gr/psp/2.3"
    ET.register_namespace("ns", ns)

    psp = ET.Element(f"{{{ns}}}psp")

    header = ET.SubElement(psp, f"{{{ns}}}header")
    ET.SubElement(header, f"{{{ns}}}schemaVersion", attrib={"value": "2.3"})

    transaction = ET.SubElement(header, f"{{{ns}}}transaction")
    ET.SubElement(transaction, f"{{{ns}}}id").text = str(payment.id)
    month_mapping = {
        "Ιανουάριος": "1",
        "Φεβρουάριος": "2",
        "Μάρτιος": "3",
        "Απρίλιος": "4",
        "Μάιος": "5",
        "Ιούνιος": "6",
        "Ιούλιος": "7",
        "Αύγουστος": "8",
        "Σεπτέμβριος": "9",
        "Οκτώβριος": "10",
        "Νοέμβριος": "11",
        "Δεκέμβριος": "12"
    }
    month_number = month_mapping.get(payment.month, "0")  # Default to "0" if month not found

    ET.SubElement(transaction, f"{{{ns}}}period", attrib={
        "month": month_number,
        "year": f"{payment.year}+03:00"
    })
    ET.SubElement(transaction, f"{{{ns}}}periodType", attrib={"value": "3"})
    ET.SubElement(transaction, f"{{{ns}}}appType").text = "initial"

    orders = ET.SubElement(transaction, f"{{{ns}}}orders")
    ET.SubElement(orders, f"{{{ns}}}type").text = "2"
    ET.SubElement(orders, f"{{{ns}}}deptName").text = "ΔΙΕΥΘΥΝΣΗ Β/ΘΜΙΑΣ ΕΚΠΑΙΔΕΥΣΗΣ ΣΤΟ ΝΟΜΟ ΧΑΝΙΩΝ [9054-182]"
    ET.SubElement(orders, f"{{{ns}}}startDate").text = "2025-05-31+03:00"
    ET.SubElement(orders, f"{{{ns}}}endDate").text = "2025-06-30+03:00"

    editor = ET.SubElement(orders, f"{{{ns}}}editor")
    ET.SubElement(editor, f"{{{ns}}}editorName").text = "ΤΡΙΑΝΤΑΦΥΛΛΟΥ ΘΕΟΔΩΡΟΣ"
    ET.SubElement(editor, f"{{{ns}}}editorTel").text = "2821000000"
    ET.SubElement(editor, f"{{{ns}}}editorEmail").text = "admin@test.com"

    order_additional_data = ET.SubElement(orders, f"{{{ns}}}orderAdditionalData")
    ET.SubElement(order_additional_data, f"{{{ns}}}title").text = payment.name
    ET.SubElement(order_additional_data, f"{{{ns}}}city").text = "Χανιά"
    ET.SubElement(order_additional_data, f"{{{ns}}}affirmText").text = """Θεωρείται και 
        Αναγνωρίζεται η δαπάνη για το ποσό των          Ευρώ.

           /   /2025

        Ο Διευθυντής της Δευτεροβάθμιας Εκπ/σης 

        """
   
    ET.SubElement(orders, f"{{{ns}}}ydeId").text = "6666666"

    body = ET.SubElement(psp, f"{{{ns}}}body")
    organizations  = ET.SubElement(body, f"{{{ns}}}organizations")

    # Create one <organization>
    organization = ET.SubElement(organizations, f"{{{ns}}}organization", attrib={
    "id": "0000000",
    "ikaAME": "0000000000",
    "tsmedeAME": "000000",
    "tsayAME": "0000",
    "employerVAT": "000000000"
    })

    # Add employees
    employees = ET.SubElement(organization, f"{{{ns}}}employees")

    for p in participations:
        statement3 = select(Employee).where(Employee.afm == p.afm)
        curr_employee = session.exec(statement3).first()
        if not curr_employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        employee = ET.SubElement(employees, f"{{{ns}}}employee")

        identification = ET.SubElement(employee, f"{{{ns}}}identification")
        ET.SubElement(identification, f"{{{ns}}}firstName").text = p.first_name
        ET.SubElement(identification, f"{{{ns}}}lastName").text = p.last_name
        ET.SubElement(identification, f"{{{ns}}}tin").text = str(p.afm)
        ET.SubElement(identification, f"{{{ns}}}amm").text = str(p.am)
        ET.SubElement(identification, f"{{{ns}}}category", attrib={"value": p.category})
        
        scale = ET.SubElement(identification, f"{{{ns}}}scale")
        ET.SubElement(scale, f"{{{ns}}}mk").text = str(p.mk)

        ET.SubElement(identification, f"{{{ns}}}bankAccount", attrib={"iban": p.iban})

        # Payment details
        payment_tag = ET.SubElement(employee, f"{{{ns}}}payment", attrib={"contractType": "1"})
        income = ET.SubElement(payment_tag, f"{{{ns}}}income", attrib={
            "type": "4",
            "startDate": "2025-05-31+03:00",
            "endDate": "2025-06-30+03:00"
        })

        if p.type == "Αποζημίωση Εξαιρέσιμων Ημερών":
            kae = "2120202001" if p.contract == "Μόνιμος" else "2130202001"
        else:
            kae = "2020207001" if p.contract == "Μόνιμος" else "2130205001"
        
        if p.type == "Αποζημίωση Επιτροπών":
            days = 1
        else:
            days = p.number_of_exams
        
        ET.SubElement(income, f"{{{ns}}}gr", attrib={
            "code": "34",
            "kae": kae,
            "amount": f"{p.compensation:.2f}",
            "units": str(days),
            "payPerUnit": f"{p.compensation / days:.2f}",
            "description": p.role
        })

        ET.SubElement(income, f"{{{ns}}}de", attrib={"code": "3011300", "amount": str(p.foros)})
        
        # Deductions - adjust as needed
        if p.contract == "Μόνιμος":
            ET.SubElement(income, f"{{{ns}}}de", attrib={"code": "4003107", "amount": str(p.mtpy)})
            ET.SubElement(income, f"{{{ns}}}de", attrib={"code": "3082800", "amount": str(p.eisfora)})

        ET.SubElement(payment_tag, f"{{{ns}}}netAmount1", attrib={"value": "0"})
        ET.SubElement(payment_tag, f"{{{ns}}}netAmount2", attrib={"value": "0"})

    # Totals — static or computed
    ET.SubElement(organization, f"{{{ns}}}totals", attrib={
    "deduction": "0", "employerTax": "0",
    "gross": "0", "netAmount1": "0", "netAmount2": "0"
    })

    # Serialize XML
    xml_bytes = BytesIO()
    ET.ElementTree(psp).write(xml_bytes, encoding="utf-8", xml_declaration=True)

    return Response(
        content=xml_bytes.getvalue(),
        media_type="application/xml",
        headers={"Content-Disposition": f"attachment; filename=payment_{exampayment_id}.xml"}
    )


# This function is used to export the overtime requests to an XML file
async def export_overtime_requests(overtimepayment_id: int, session : Session):
    statement = select(OvertimePayment).where(OvertimePayment.id == overtimepayment_id)
    payment = session.exec(statement).first()

    statement2 = select(OvertimeRequest).where(OvertimeRequest.payment_id == overtimepayment_id).where(OvertimeRequest.paid == 1)
    overtimerequests =  session.exec(statement2).all()

    ns = "http://www.gsis.gr/psp/2.3"
    ET.register_namespace("ns", ns)

    psp = ET.Element(f"{{{ns}}}psp")

    header = ET.SubElement(psp, f"{{{ns}}}header")
    ET.SubElement(header, f"{{{ns}}}schemaVersion", attrib={"value": "2.3"})

    transaction = ET.SubElement(header, f"{{{ns}}}transaction")
    ET.SubElement(transaction, f"{{{ns}}}id").text = str(payment.id)
    month_mapping = {
        "Ιανουάριος": "1",
        "Φεβρουάριος": "2",
        "Μάρτιος": "3",
        "Απρίλιος": "4",
        "Μάιος": "5",
        "Ιούνιος": "6",
        "Ιούλιος": "7",
        "Αύγουστος": "8",
        "Σεπτέμβριος": "9",
        "Οκτώβριος": "10",
        "Νοέμβριος": "11",
        "Δεκέμβριος": "12"
    }
    month_number = month_mapping.get(payment.month, "0")  # Default to "0" if month not found

    ET.SubElement(transaction, f"{{{ns}}}period", attrib={
        "month": month_number,
        "year": f"{payment.year}+03:00"
    })
    ET.SubElement(transaction, f"{{{ns}}}periodType", attrib={"value": "3"})
    ET.SubElement(transaction, f"{{{ns}}}appType").text = "initial"
    
    startDate_mapping = {
        "Ιανουάριος": "2025-01-01",
        "Φεβρουάριος": "2025-02-01",
        "Μάρτιος": "2025-03-01",
        "Απρίλιος": "2025-04-01",
        "Μάιος": "2025-05-01",
        "Ιούνιος": "2025-06-01",
        "Ιούλιος": "2025-07-01",
        "Αύγουστος": "2025-08-01",
        "Σεπτέμβριος": "2025-09-01",
        "Οκτώβριος": "2025-10-01",
        "Νοέμβριος": "2025-11-01",
        "Δεκέμβριος": "2025-12-01"
    }
    startDate = startDate_mapping.get(payment.month, "0")  # Default to "0" if month not found
    
    endDate_mapping = {
        "Ιανουάριος": "2025-01-31",
        "Φεβρουάριος": "2025-02-28",
        "Μάρτιος": "2025-03-31",
        "Απρίλιος": "2025-04-30",
        "Μάιος": "2025-05-31",
        "Ιούνιος": "2025-06-30",
        "Ιούλιος": "2025-07-31",
        "Αύγουστος": "2025-08-31",
        "Σεπτέμβριος": "2025-09-30",
        "Οκτώβριος": "2025-10-31",
        "Νοέμβριος": "2025-11-30",
        "Δεκέμβριος": "2025-12-31"
    }
    endDate = endDate_mapping.get(payment.month, "0")  # Default to "0" if month not found

    orders = ET.SubElement(transaction, f"{{{ns}}}orders")
    ET.SubElement(orders, f"{{{ns}}}type").text = "2"
    ET.SubElement(orders, f"{{{ns}}}deptName").text = "ΔΙΕΥΘΥΝΣΗ Β/ΘΜΙΑΣ ΕΚΠΑΙΔΕΥΣΗΣ ΣΤΟ ΝΟΜΟ ΧΑΝΙΩΝ [9054-182]"
    ET.SubElement(orders, f"{{{ns}}}startDate").text = startDate
    ET.SubElement(orders, f"{{{ns}}}endDate").text = endDate
    
    editor = ET.SubElement(orders, f"{{{ns}}}editor")
    ET.SubElement(editor, f"{{{ns}}}editorName").text = "ΤΡΙΑΝΤΑΦΥΛΛΟΥ ΘΕΟΔΩΡΟΣ"
    ET.SubElement(editor, f"{{{ns}}}editorTel").text = "2821011111"
    ET.SubElement(editor, f"{{{ns}}}editorEmail").text = "admin@test.com"

    order_additional_data = ET.SubElement(orders, f"{{{ns}}}orderAdditionalData")
    ET.SubElement(order_additional_data, f"{{{ns}}}title").text = payment.name
    ET.SubElement(order_additional_data, f"{{{ns}}}city").text = "Χανιά"
    ET.SubElement(order_additional_data, f"{{{ns}}}affirmText").text = """Θεωρείται και 
        Αναγνωρίζεται η δαπάνη για το ποσό των          Ευρώ.

           /   /2025

        Ο Διευθυντής της Δευτεροβάθμιας Εκπ/σης 

    """

    ET.SubElement(orders, f"{{{ns}}}ydeId").text = "6666666"

    body = ET.SubElement(psp, f"{{{ns}}}body")
    organizations  = ET.SubElement(body, f"{{{ns}}}organizations")

    # Create one <organization>
    organization = ET.SubElement(organizations, f"{{{ns}}}organization", attrib={
    "id": "6666666",
    "ikaAME": "6666666666",
    "tsmedeAME": "6666666",
    "tsayAME": "6666",
    "employerVAT": "666666666"
    }) 

    # Add employees
    employees = ET.SubElement(organization, f"{{{ns}}}employees")

    for ovr in overtimerequests:
        statement3 = select(Employee).where(Employee.afm == ovr.afm)
        curr_employee = session.exec(statement3).first()
        if not curr_employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        else:

            employee = ET.SubElement(employees, f"{{{ns}}}employee")

            identification = ET.SubElement(employee, f"{{{ns}}}identification")
            ET.SubElement(identification, f"{{{ns}}}firstName").text = ovr.first_name
            ET.SubElement(identification, f"{{{ns}}}lastName").text = ovr.last_name
            ET.SubElement(identification, f"{{{ns}}}tin").text = str(ovr.afm)
            ET.SubElement(identification, f"{{{ns}}}amm").text = str(curr_employee.am)
            ET.SubElement(identification, f"{{{ns}}}category", attrib={"value": curr_employee.category})
        
            scale = ET.SubElement(identification, f"{{{ns}}}scale")
            ET.SubElement(scale, f"{{{ns}}}mk").text = str(curr_employee.mk)

            ET.SubElement(identification, f"{{{ns}}}bankAccount", attrib={"iban": curr_employee.iban})

            # Payment details
            payment_tag = ET.SubElement(employee, f"{{{ns}}}payment", attrib={"contractType": "1"})
            income = ET.SubElement(payment_tag, f"{{{ns}}}income", attrib={
            "type": "4",
            "startDate": startDate,
            "endDate": endDate
            })

            ET.SubElement(income, f"{{{ns}}}gr", attrib={
            "code": "155",
            "kae": "2120201017",
            "amount": f"{ovr.compensation:.2f}",
            "units": str(ovr.number_of_overtimes),
            "payPerUnit": "10.00",
            "description": "Υπερωρίες Εκπαιδευτικών"
            })

        # Deductions - adjust as needed
        ET.SubElement(income, f"{{{ns}}}de", attrib={"code": "3011300", "amount": str(ovr.foros)})
        ET.SubElement(income, f"{{{ns}}}de", attrib={"code": "4003107", "amount": str(ovr.mtpy)})
        ET.SubElement(income, f"{{{ns}}}de", attrib={"code": "3082800", "amount": str(ovr.eisfora)})

        ET.SubElement(payment_tag, f"{{{ns}}}netAmount1", attrib={"value": str(ovr.payable)})
        ET.SubElement(payment_tag, f"{{{ns}}}netAmount2", attrib={"value": "0"})

    # Totals — static or computed
    ET.SubElement(organization, f"{{{ns}}}totals", attrib={
    "deduction": "0", "employerTax": "0",
    "gross": "0", "netAmount1": "0", "netAmount2": "0"
    })
 
    # Serialize XML
    xml_bytes = BytesIO()
    ET.ElementTree(psp).write(xml_bytes, encoding="utf-8", xml_declaration=True)

    return Response(
        content=xml_bytes.getvalue(),
        media_type="application/xml",
        headers={"Content-Disposition": f"attachment; filename=payment_{overtimepayment_id}.xml"}
    )


# This function is used to export the travel cost requests to an XML file
async def export_travelcost_requests(travelcostpayment_id: int, session : Session):
    statement = select(TravelcostPayment).where(TravelcostPayment.id == travelcostpayment_id)
    payment = session.exec(statement).first()

    statement2 = select(TravelcostRequest).where(TravelcostRequest.payment_id == travelcostpayment_id).where(TravelcostRequest.paid == 1)
    travelcostrequests =  session.exec(statement2).all()

    ns = "http://www.gsis.gr/psp/2.3"
    ET.register_namespace("ns", ns)

    psp = ET.Element(f"{{{ns}}}psp")

    header = ET.SubElement(psp, f"{{{ns}}}header")
    ET.SubElement(header, f"{{{ns}}}schemaVersion", attrib={"value": "2.3"})

    transaction = ET.SubElement(header, f"{{{ns}}}transaction")
    ET.SubElement(transaction, f"{{{ns}}}id").text = str(payment.id)
    month_mapping = {
        "Ιανουάριος": "1",
        "Φεβρουάριος": "2",
        "Μάρτιος": "3",
        "Απρίλιος": "4",
        "Μάιος": "5",
        "Ιούνιος": "6",
        "Ιούλιος": "7",
        "Αύγουστος": "8",
        "Σεπτέμβριος": "9",
        "Οκτώβριος": "10",
        "Νοέμβριος": "11",
        "Δεκέμβριος": "12"
    }
    month_number = month_mapping.get(payment.month, "0")  # Default to "0" if month not found

    ET.SubElement(transaction, f"{{{ns}}}period", attrib={
        "month": month_number,
        "year": f"{payment.year}+03:00"
    })
    ET.SubElement(transaction, f"{{{ns}}}periodType", attrib={"value": "3"})
    ET.SubElement(transaction, f"{{{ns}}}appType").text = "initial"

    startDate_mapping = {
        "Ιανουάριος": "2025-01-01",
        "Φεβρουάριος": "2025-02-01",
        "Μάρτιος": "2025-03-01",
        "Απρίλιος": "2025-04-01",
        "Μάιος": "2025-05-01",
        "Ιούνιος": "2025-06-01",
        "Ιούλιος": "2025-07-01",
        "Αύγουστος": "2025-08-01",
        "Σεπτέμβριος": "2025-09-01",
        "Οκτώβριος": "2025-10-01",
        "Νοέμβριος": "2025-11-01",
        "Δεκέμβριος": "2025-12-01"
    }
    startDate = startDate_mapping.get(payment.month, "0")  # Default to "0" if month not found
    
    endDate_mapping = {
        "Ιανουάριος": "2025-01-31",
        "Φεβρουάριος": "2025-02-28",
        "Μάρτιος": "2025-03-31",
        "Απρίλιος": "2025-04-30",
        "Μάιος": "2025-05-31",
        "Ιούνιος": "2025-06-30",
        "Ιούλιος": "2025-07-31",
        "Αύγουστος": "2025-08-31",
        "Σεπτέμβριος": "2025-09-30",
        "Οκτώβριος": "2025-10-31",
        "Νοέμβριος": "2025-11-30",
        "Δεκέμβριος": "2025-12-31"
    }
    endDate = endDate_mapping.get(payment.month, "0")  # Default to "0" if month not found

    orders = ET.SubElement(transaction, f"{{{ns}}}orders")
    ET.SubElement(orders, f"{{{ns}}}type").text = "2"
    ET.SubElement(orders, f"{{{ns}}}deptName").text = "ΔΙΕΥΘΥΝΣΗ Β/ΘΜΙΑΣ ΕΚΠΑΙΔΕΥΣΗΣ ΣΤΟ ΝΟΜΟ ΧΑΝΙΩΝ [9054-182]"
    ET.SubElement(orders, f"{{{ns}}}startDate").text = startDate
    ET.SubElement(orders, f"{{{ns}}}endDate").text = endDate

    editor = ET.SubElement(orders, f"{{{ns}}}editor")
    ET.SubElement(editor, f"{{{ns}}}editorName").text = "ΤΡΙΑΝΤΑΦΥΛΛΟΥ ΘΕΟΔΩΡΟΣ"
    ET.SubElement(editor, f"{{{ns}}}editorTel").text = "2821000000"
    ET.SubElement(editor, f"{{{ns}}}editorEmail").text = "admin@test.com"

    order_additional_data = ET.SubElement(orders, f"{{{ns}}}orderAdditionalData")
    ET.SubElement(order_additional_data, f"{{{ns}}}title").text = payment.name
    ET.SubElement(order_additional_data, f"{{{ns}}}city").text = "Χανιά"
    ET.SubElement(order_additional_data, f"{{{ns}}}affirmText").text = """Θεωρείται και 
        Αναγνωρίζεται η δαπάνη για το ποσό των          Ευρώ.

           /   /2025

        Ο Διευθυντής της Δευτεροβάθμιας Εκπ/σης 

        """

    ET.SubElement(orders, f"{{{ns}}}ydeId").text = "6666666"

    body = ET.SubElement(psp, f"{{{ns}}}body")
    organizations  = ET.SubElement(body, f"{{{ns}}}organizations")

    # Create one <organization>
    organization = ET.SubElement(organizations, f"{{{ns}}}organization", attrib={
    "id": "6666666",
    "ikaAME": "6666666666",
    "tsmedeAME": "6666666",
    "tsayAME": "6666",
    "employerVAT": "666666666"
    }) 

    # Add employees
    employees = ET.SubElement(organization, f"{{{ns}}}employees")

    for tr in travelcostrequests:
        statement3 = select(Employee).where(Employee.afm == tr.afm)
        curr_employee = session.exec(statement3).first()
        if not curr_employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        else:
            employee = ET.SubElement(employees, f"{{{ns}}}employee")

            identification = ET.SubElement(employee, f"{{{ns}}}identification")
            ET.SubElement(identification, f"{{{ns}}}firstName").text = tr.first_name
            ET.SubElement(identification, f"{{{ns}}}lastName").text = tr.last_name
            ET.SubElement(identification, f"{{{ns}}}tin").text = str(tr.afm)
            ET.SubElement(identification, f"{{{ns}}}amm").text = str(curr_employee.am)
            ET.SubElement(identification, f"{{{ns}}}category", attrib={"value": curr_employee.category})
        
            scale = ET.SubElement(identification, f"{{{ns}}}scale")
            ET.SubElement(scale, f"{{{ns}}}mk").text = str(curr_employee.mk)

            ET.SubElement(identification, f"{{{ns}}}bankAccount", attrib={"iban": curr_employee.iban})

            # Payment details
            payment_tag = ET.SubElement(employee, f"{{{ns}}}payment", attrib={"contractType": "1"})
            income = ET.SubElement(payment_tag, f"{{{ns}}}income", attrib={
            "type": "4",
            "startDate": startDate,
            "endDate": endDate
            })

            ET.SubElement(income, f"{{{ns}}}gr", attrib={
                "code": "15",
                "kae": "2420404001",
                "amount": f"{tr.compensation:.2f}",
                "description": "Οδοιπορικά Εκπαιδευτικών"
            })

            ET.SubElement(payment_tag, f"{{{ns}}}netAmount1", attrib={"value": "0"})
            ET.SubElement(payment_tag, f"{{{ns}}}netAmount2", attrib={"value": "0"})

    # Totals — static or computed
    ET.SubElement(organization, f"{{{ns}}}totals", attrib={
    "deduction": "0", "employerTax": "0",
    "gross": "0", "netAmount1": "0", "netAmount2": "0"
    })

    # Serialize XML
    xml_bytes = BytesIO()
    ET.ElementTree(psp).write(xml_bytes, encoding="utf-8", xml_declaration=True)

    return Response(
        content=xml_bytes.getvalue(),
        media_type="application/xml",
        headers={"Content-Disposition": f"attachment; filename=payment_{travelcostpayment_id}.xml"}
    )