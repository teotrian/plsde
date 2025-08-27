from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select, delete
from typing import List
from datetime import datetime, timedelta
from database import engine
from models import User, Employee, School, Compensation, RegisterRequest, OvertimeRequest, OvertimeInventory, OvertimePayment, TravelcostRequest, TravelcostInventory, TravelcostPayment, ExamParticipation, ExamInventory, ExamPayment
from functions import  get_session, create_user, authenticate_user, create_token, send_email, get_current_user, get_user_by_email, get_expiration_time, get_month_order, overtime_request_selector, travelcost_request_selector, submit_overtime_requests, submit_overtime_requests_to_payment, calculate_overtime_compensations, submit_travelcost_requests, submit_travelcost_requests_to_payment, calculate_travelcost_compensations, exam_participation_selector, submit_exam_participations_to_payment, calculate_exam_compensations
from exports import export_overtime_requests, export_travelcost_requests, export_exam_participations
from passlib.hash import bcrypt
from pathlib import Path
import pandas as pd
import shutil

app = FastAPI()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Mount the uploads directory to serve static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Creates an API endpoint for the root that returns a message
@app.get("/api")
async def root():
    return {"message": "Σύστημα Διαχείρισης Έκτακτων Αποζημιώσεων Εκπαιδευτικών"}


# Creates an API endpoint for creating a new register request 
@app.post("/api/registerrequests")
async def create_register_request(registerrequest: RegisterRequest , session : Session=Depends(get_session)):  
    new_request = RegisterRequest(category=registerrequest.category, afm=registerrequest.afm, kodikos=registerrequest.kodikos, email=registerrequest.email, hashed_password=bcrypt.hash(registerrequest.hashed_password), submitted=1, stimestamp=datetime.utcnow())
    session.add(new_request)
    session.commit()
    session.refresh(new_request)    
    to_email = "admin@test.com"
    subject = "Μια νέα αίτηση εγγραφής υποβλήθηκε"
    body = f"Ένας χρήστης με το email {registerrequest.email} έχει κάνει αίτηση εγγραφής. Μπορείτε να συνδεθείτε για να απορρίψετε ή να εγκρίνετε το αίτημα."
    await send_email(to_email, subject, body)
    return {"message", "Το αίτημα εγγραφής υποβλήθηκε επιτυχώς"}

# Creates an API endpoint for generating a token
@app.post("/api/token")
async def generate_token(form_data: OAuth2PasswordRequestForm = Depends(), session : Session=Depends(get_session)):
    user = await authenticate_user(form_data.username, form_data.password, session)

    if not user:
        raise HTTPException(status_code=401, detail="Έχετε εισάγει λανθασμένα διαπιστευτήρια")
    access_token = await create_token(data= {"id" : user.id, "role" : user.role} )
    return {"access_token": access_token, "token_type": "bearer"}

# Creates an API endpoint for getting the remaining time of the token   
@app.get("/api/token_expiration")
async def get_token_expiration(expiration_time: int = Depends(get_expiration_time)):
    
    return {"expiration_time": expiration_time}

# Creates an API endpoint for getting the current user     
@app.get("/api/users/me", response_model=User)
async def get_user(user: User = Depends(get_current_user)):
    return user

# Creates an API endpoint for getting the employee from the current user    
@app.get("/api/employees/me", response_model=Employee)
async def get_employee(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(Employee).where(Employee.user_id == user.id)
    current_employee =  session.exec(statement).first()
    return Employee.from_orm(current_employee)

# Creates an API endpoint for getting the employees of the current school    
@app.get("/api/employees/school/{school}", response_model=List[Employee])
async def get_employees_of_school(school: str, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(School).where(School.name == school)
    curr_school =  session.exec(statement).first()
    new_statement = select(Employee).where(Employee.school_id==curr_school.id)
    results = session.exec(new_statement).all()
    return results

# Creates an API endpoint for getting the schools
@app.get("/api/schools", response_model=List[School])
async def get_schools(session : Session=Depends(get_session)):
    statement = select(School)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for getting the schools
@app.get("/api/schools/me", response_model=School)
async def get_school(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(School).where(School.email == user.email)
    current_school =  session.exec(statement).first()
    return School.from_orm(current_school)

# Creates an API endpoint for creating a new overtime request for the current user
@app.post("/api/overtimerequests", response_model=OvertimeRequest)
async def create_overtime_request(overtimerequest: OvertimeRequest , user: User = Depends(get_current_user), session : Session=Depends(get_session)):  
    new_request = OvertimeRequest(owner_id=user.id, first_name=overtimerequest.first_name, last_name=overtimerequest.last_name, afm=overtimerequest.afm, school=overtimerequest.school, month=overtimerequest.month, year=overtimerequest.year, number_of_overtimes=overtimerequest.number_of_overtimes, assignment=None, final=0, ftimestamp=None)
    session.add(new_request)
    session.commit()
    session.refresh(new_request)
    return OvertimeRequest.from_orm(new_request)

# Creates an API endpoint for getting the overtime requests of the current user
@app.get("/api/overtimerequests", response_model=List[OvertimeRequest])
async def get_overtime_requests(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeRequest).where(OvertimeRequest.owner_id == user.id).order_by(OvertimeRequest.year, get_month_order(OvertimeRequest.month))
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for getting the selected overtime request
@app.get("/api/overtimerequests/{overtimerequest_id}", status_code=200)
async def get_overtime_request(overtimerequest_id: int, user: User = Depends(get_current_user),session : Session=Depends(get_session)):
    curr_request = await overtime_request_selector(overtimerequest_id, user, session)
    return OvertimeRequest.from_orm(curr_request)

# Creates an API endpoint for deleting the selected overtime request
@app.delete("/api/overtimerequests/{overtimerequest_id}", status_code=204)
async def delete_overtime_request(overtimerequest_id: int, user: User = Depends(get_current_user),session : Session=Depends(get_session)):
    curr_request = await overtime_request_selector(overtimerequest_id, user, session)
    session.delete(curr_request)
    session.commit()
    return {"message", "Το αίτημα υπερωριών διαγράφηκε επιτυχώς"}

# Creates an API endpoint for updating the selected overtime request
@app.put("/api/overtimerequests/{overtimerequest_id}", status_code=200)
async def update_overtime_request(overtimerequest_id: int, overtimerequest: OvertimeRequest, user: User = Depends(get_current_user),session : Session=Depends(get_session)):
    curr_request = await overtime_request_selector(overtimerequest_id, user, session)
    curr_request.owner_id = user.id
    curr_request.first_name = overtimerequest.first_name 
    curr_request.last_name = overtimerequest.last_name
    curr_request.school = overtimerequest.school
    curr_request.month = overtimerequest.month
    curr_request.year = overtimerequest.year
    curr_request.number_of_overtimes = overtimerequest.number_of_overtimes
    
    session.commit()
    session.refresh(curr_request)
    return {"message", "Το αίτημα υπερωριών ενημερώθηκε επιτυχώς"}

# Creates an API endpoint for updloading the assignment for the selected overtime request
@app.put("/api/overtimerequests/uploadassignment/{overtimerequest_id}", status_code=200)
async def upload_overtime_assignment(overtimerequest_id: int, file: UploadFile = File(...), last_name: str = Form(...),first_name: str = Form(), user: User = Depends(get_current_user),session : Session=Depends(get_session)):
    
    # Create filename in format: name_lastName_firstName.ext
    original_extension = Path(file.filename).suffix
    whole_filename = f"ΑΠΟΦΑΣΗ ΑΝΑΘΕΣΗΣ ΥΠΕΡΩΡΙΩΝ_{last_name}_{first_name}{original_extension}"
    file_path = UPLOAD_DIR / f"{last_name} {first_name}" / whole_filename
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    relative_path = Path(f"{last_name} {first_name}") / whole_filename
    curr_request = await overtime_request_selector(overtimerequest_id, user, session)
    curr_request.assignment = relative_path.as_posix()
    session.commit()
    session.refresh(curr_request)
    return {"message", "Η απόφαση ανάθεσης υπερωριών ανέβηκε επιτυχώς"}

# Creates an API endpoint for finalising the selected overtime request   
@app.put("/api/overtimerequests/final/{overtimerequest_id}", status_code=200)
async def finalise_overtime_request(overtimerequest_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    curr_request = await overtime_request_selector(overtimerequest_id, user, session)
    curr_request.final = 1
    curr_request.ftimestamp = datetime.utcnow()
    
    session.commit()
    session.refresh(curr_request)
    return {"message", "To αίτημα υπερωριών οριστικοποιήθηκε επιτυχώς"}

# Creates an API endpoint for updloading the schedule for the selected overtime request
@app.put("/api/overtimerequests/uploadschedule/{overtimerequest_id}", status_code=200)
async def upload_overtime_schedule(overtimerequest_id: int, file: UploadFile = File(...), user: User = Depends(get_current_user),session : Session=Depends(get_session)):
    
    # Create filename in format: name_lastName_firstName.ext
    original_extension = Path(file.filename).suffix
    statement = select(OvertimeRequest).where(OvertimeRequest.id == overtimerequest_id)
    curr_request =  session.exec(statement).first()
    last_name = curr_request.last_name
    first_name = curr_request.first_name
    whole_filename = f"ΠΡΟΓΡΑΜΜΑ ΥΠΕΡΩΡΙΩΝ_{last_name}_{first_name}{original_extension}"
    file_path = UPLOAD_DIR / f"{last_name} {first_name}" / whole_filename
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    relative_path = Path(f"{last_name} {first_name}") / whole_filename
    curr_request.schedule = relative_path.as_posix()

    session.commit()
    session.refresh(curr_request)
    return {"message", "Το πρόγραμμα ανέβηκε επιτυχώς"}

# Creates an API endpoint for approving the selected overtime request   
@app.put("/api/overtimerequests/approve/{overtimerequest_id}", status_code=200)
async def approve_overtime_request(overtimerequest_id: int, flag : int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeRequest).where(OvertimeRequest.id == overtimerequest_id)
    curr_request =  session.exec(statement).first()
    curr_request.approved = flag
    curr_request.atimestamp = datetime.utcnow()
    session.commit()
    session.refresh(curr_request)
    return {"message", "To αίτημα υπερωριών εγκρίθηκε επιτυχώς"}



#Travelcost Requests

# Creates an API endpoint for creating a new travelcost request for the current user
@app.post("/api/travelcostrequests", response_model=TravelcostRequest)
async def create_travelcost_request(travelcostrequest: TravelcostRequest , user: User = Depends(get_current_user), session : Session=Depends(get_session)):  
    new_request = TravelcostRequest(owner_id=user.id, first_name=travelcostrequest.first_name, last_name=travelcostrequest.last_name, afm=travelcostrequest.afm, start_school=travelcostrequest.start_school, destination_school=travelcostrequest.destination_school, month=travelcostrequest.month, year=travelcostrequest.year, number_of_travels=travelcostrequest.number_of_travels, distribution=None, license=None, final=0, ftimestamp=None)
    session.add(new_request)
    session.commit()
    session.refresh(new_request)
    #return {"message", "The request Successfully Created"}
    return TravelcostRequest.from_orm(new_request)

# Creates an API endpoint for getting the travelcost requests of the current user
@app.get("/api/travelcostrequests", response_model=List[TravelcostRequest])
async def get_travelcost_requests(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    # Use the global month_case for ordering
    statement = select(TravelcostRequest).where(TravelcostRequest.owner_id == user.id).order_by(TravelcostRequest.year,get_month_order(TravelcostRequest.month) )
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for getting the selected travelcost request
@app.get("/api/travelcostrequests/{travelcostrequest_id}", status_code=200)
async def get_travelcost_request(travelcostrequest_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    curr_request = await travelcost_request_selector(travelcostrequest_id, user, session)
    return TravelcostRequest.from_orm(curr_request)

# Creates an API endpoint for deleting the selected travelcost request
@app.delete("/api/travelcostrequests/{travelcostrequest_id}", status_code=204)
async def delete_travelcost_request(travelcostrequest_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    curr_request = await travelcost_request_selector(travelcostrequest_id, user, session)
    session.delete(curr_request)
    session.commit()
    return {"message", "Το αίτημα οδοιπορικών διαγράφηκε επιτυχώς"}

# Creates an API endpoint for updating the selected travelcost request
@app.put("/api/travelcostrequests/{travelcostrequest_id}", status_code=200)
async def update_travelcost_request(travelcostrequest_id: int, travelcostrequest: TravelcostRequest, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    curr_request = await travelcost_request_selector(travelcostrequest_id, user, session)
    curr_request.owner_id = user.id
    curr_request.first_name = travelcostrequest.first_name 
    curr_request.last_name = travelcostrequest.last_name
    curr_request.start_school = travelcostrequest.start_school
    curr_request.destination_school = travelcostrequest.destination_school
    curr_request.month = travelcostrequest.month
    curr_request.year = travelcostrequest.year
    curr_request.number_of_travels = travelcostrequest.number_of_travels
    
    session.commit()
    session.refresh(curr_request)
    return {"message", "Το αίτημα οδοιπορικών ενημερώθηκε επιτυχώς"}

# Creates an API endpoint for uploading the distribution for the selected travelcost request
@app.put("/api/travelcostrequests/uploaddistribution/{travelcostrequest_id}", status_code=200)
async def upload_travelcost_distribution(travelcostrequest_id: int, files: List[UploadFile] = File(...), last_name: str = Form(...),first_name: str = Form(), user: User = Depends(get_current_user), session : Session=Depends(get_session)):

    curr_request = await travelcost_request_selector(travelcostrequest_id, user, session)

    for index, file in enumerate(files):
        if index == 0:
            original_extension = Path(file.filename).suffix
            first_filename = f"ΑΠΟΦΑΣΗ ΔΙΑΘΕΣΗΣ ΟΔΟΙΠΟΡΙΚΩΝ_{last_name}_{first_name}{original_extension}"
            file_path = UPLOAD_DIR / f"{last_name} {first_name}" / first_filename
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            relative_path = Path(f"{last_name} {first_name}") / first_filename
            curr_request.distribution = relative_path.as_posix()
        elif index == 1:
            original_extension = Path(file.filename).suffix
            second_filename = f"ΑΔΕΙΑ ΟΔΗΓΗΣΗΣ_{last_name}_{first_name}{original_extension}"
            file_path = UPLOAD_DIR / f"{last_name} {first_name}" / second_filename
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            relative_path = Path(f"{last_name} {first_name}") / second_filename
            curr_request.license = relative_path.as_posix()
   
    session.commit()
    session.refresh(curr_request)
    return {"message", "τα αρχεία οδοιπορικών ανέβηκαν επιτυχώς"}

# Creates an API endpoint for finalising the selected travelcost request   
@app.put("/api/travelcostrequests/final/{travelcostrequest_id}", status_code=200)
async def finalise_travelcost_request(travelcostrequest_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    curr_request = await travelcost_request_selector(travelcostrequest_id, user, session)
    curr_request.final = 1
    curr_request.ftimestamp = datetime.utcnow()
    
    session.commit()
    session.refresh(curr_request)
    return {"message", "To αίτημα οδοιπορικών οριστικοποιήθηκε επιτυχώς"}

# Creates an API endpoint for updloading the schedule for the selected travelcost request
@app.put("/api/travelcostrequests/uploadschedule/{travelcostrequest_id}", status_code=200)
async def upload_travelcost_schedule(travelcostrequest_id: int, file: UploadFile = File(...), user: User = Depends(get_current_user),session : Session=Depends(get_session)):
    
    # Create filename in format: name_lastName_firstName.ext
    original_extension = Path(file.filename).suffix
    statement = select(TravelcostRequest).where(TravelcostRequest.id == travelcostrequest_id)
    curr_request =  session.exec(statement).first()
    last_name = curr_request.last_name
    first_name = curr_request.first_name
    whole_filename = f"ΠΡΟΓΡΑΜΜΑ ΟΔΟΙΠΟΡΙΚΩΝ_{last_name}_{first_name}{original_extension}"
    file_path = UPLOAD_DIR / f"{last_name} {first_name}" / whole_filename
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    relative_path = Path(f"{last_name} {first_name}") / whole_filename
    curr_request.schedule = relative_path.as_posix()

    session.commit()
    session.refresh(curr_request)
    return {"message", "Το πρόγραμμα οδοιπορικών ανέβηκε επιτυχώς"}

# Creates an API endpoint for approving the selected travelcost request   
@app.put("/api/travelcostrequests/approve/{travelcostrequest_id}", status_code=200)
async def approve_travelcost_request(travelcostrequest_id: int, flag : int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostRequest).where(TravelcostRequest.id == travelcostrequest_id)
    curr_request =  session.exec(statement).first()
    curr_request.approved = flag
    curr_request.atimestamp = datetime.utcnow()
    session.commit()
    session.refresh(curr_request)
    return {"message", "To αίτημα οδοιπορικών εγκρίθηκε επιτυχώς"}


#School Overtime API's

# Creates an API endpoint for getting the count of the new overtime requests of the school
@app.get("/api/school/countovertimerequests/{school}")
async def get_count_school_overtime_requests(school:str, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeRequest).where(OvertimeRequest.school == school).where(OvertimeRequest.final == 1).where(OvertimeRequest.approved == 0)
    results = session.exec(statement).all()
    count = len(results)
    return count

# Creates an API endpoint for getting the new overtime requests of the school
@app.get("/api/school/overtimerequests/{school}", response_model=List[OvertimeRequest])
async def get_school_overtime_requests(school:str, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeRequest).where(OvertimeRequest.school == school).where(OvertimeRequest.final == 1).where(OvertimeRequest.approved == 0).order_by(OvertimeRequest.year, get_month_order(OvertimeRequest.month), OvertimeRequest.last_name, OvertimeRequest.first_name)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for getting the approved overtime requests of the school
@app.get("/api/school/overtimerequests/approved/{school}", response_model=List[OvertimeRequest])
async def get_school_approved_overtime_requests(school:str, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeRequest).where(OvertimeRequest.school == school).where(OvertimeRequest.approved == 1).where(OvertimeRequest.inserted != 1).order_by(OvertimeRequest.year, get_month_order(OvertimeRequest.month), OvertimeRequest.last_name, OvertimeRequest.first_name)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for getting the matched approved overtime requests of the school
@app.get("/api/school/overtimerequests/matchedapproved/{school}", response_model=List[OvertimeRequest])
async def get_school_matched_approved_overtime_requests(school:str, month:str, year: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeRequest).where(OvertimeRequest.school == school).where(OvertimeRequest.month == month).where(OvertimeRequest.year==year).where(OvertimeRequest.approved == 1).where(OvertimeRequest.inserted != 1).order_by(OvertimeRequest.last_name, OvertimeRequest.first_name)
    results =  session.exec(statement).all()
    return results


# Creates an API endpoint for creating a new overtime inventory for the current school
@app.post("/api/school/overtimeinventories", response_model=OvertimeInventory)
async def create_overtime_inventory(overtimeinventory: OvertimeInventory , user: User = Depends(get_current_user), session : Session=Depends(get_session)):  
    new_inventory = OvertimeInventory(school=overtimeinventory.school, month=overtimeinventory.month, year=overtimeinventory.year, submitted=0, stimestamp=None)
    session.add(new_inventory)
    session.commit()
    session.refresh(new_inventory)
    return OvertimeInventory.from_orm(new_inventory)

# Creates an API endpoint for getting the overtime inventories of the current school
@app.get("/api/school/overtimeinventories/{school}", response_model=List[OvertimeInventory])
async def get_overtime_inventories(school: str, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeInventory).where(OvertimeInventory.school == school).order_by(OvertimeInventory.year, get_month_order(OvertimeInventory.month))
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for getting the selected overtime inventory
@app.get("/api/school/overtimeinventory/{overtimeinventory_id}", response_model=OvertimeInventory, status_code=200)
async def get_overtime_inventory(overtimeinventory_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeInventory).where(OvertimeInventory.id == overtimeinventory_id)
    curr_inventory =  session.exec(statement).first()
    return OvertimeInventory.from_orm(curr_inventory)

# Creates an API endpoint for inserting requests in overtime inventory
@app.post("/api/school/overtimeinventory/{overtimeinventory_id}/insertrequests", status_code=200)
async def insert_overtime_requests(overtimeinventory_id: int, request_ids:List[int], user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    for req_id in request_ids:
        statement = select(OvertimeRequest).where(OvertimeRequest.id == req_id)
        curr_request = session.exec(statement).first()
        if curr_request:
            curr_request.inventory_id = overtimeinventory_id
            curr_request.inserted = 1
            curr_request.itimestamp = datetime.utcnow()
            session.commit()
            session.refresh(curr_request)
    return {"message", "Tα αιτήματα των υπερωριών εισήχθησαν επιτυχώς"}

# Creates an API endpoint for getting the inserted requests in  overtime inventory
@app.get("/api/school/overtimeinventory/{overtimeinventory_id}/insertedrequests", response_model=List[OvertimeRequest])
async def get_inserted_overtime_requests(overtimeinventory_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeRequest).where(OvertimeRequest.inventory_id == overtimeinventory_id).where(OvertimeRequest.inserted == 1).order_by(OvertimeRequest.year, get_month_order(OvertimeRequest.month), OvertimeRequest.last_name, OvertimeRequest.first_name)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for removing requests from the overtime inventory
@app.post("/api/school/overtimeinventory/{overtimerequest_id}/removerequest", status_code=200)
async def remove_inserted_overtime_request(overtimerequest_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeRequest).where(OvertimeRequest.id == overtimerequest_id)
    curr_request = session.exec(statement).first()
    curr_request.inventory_id = 0
    curr_request.inserted = 0
    curr_request.itimestamp = None
    session.commit()
    session.refresh(curr_request)
    return {"message", "Tο αίτημα των υπερωριών αφαιρέθηκε επιτυχώς"}

# Creates an API endpoint for updating the selected overtime inventory
@app.put("/api/school/overtimeinventory/{overtimeinventory_id}", status_code=200)
async def update_overtime_inventory(overtimeinventory_id: int, overtimeinventory: OvertimeInventory, user: User = Depends(get_current_user),session : Session=Depends(get_session)):
    statement = select(OvertimeInventory).where(OvertimeInventory.id == overtimeinventory_id)
    curr_inventory =  session.exec(statement).first()
    curr_inventory.school = overtimeinventory.school
    curr_inventory.month = overtimeinventory.month
    curr_inventory.year = overtimeinventory.year

    session.commit()
    session.refresh(curr_inventory)
    return {"message", "Η κατάσταση πληρωμής υπερωριών ενημερώθηκε επιτυχώς"}

# Creates an API endpoint for deleting the selected overtime inventory
@app.delete("/api/school/overtimeinventory/{overtimeinventory_id}", status_code=204)
async def delete_overtime_inventory(overtimeinventory_id: int, user: User = Depends(get_current_user),session : Session=Depends(get_session)):
    statement = select(OvertimeInventory).where(OvertimeInventory.id == overtimeinventory_id)
    curr_inventory =  session.exec(statement).first()
    session.delete(curr_inventory)
    session.commit()
    return {"message", "Η κατάσταση πληρωμής υπερωριών διαγράφηκε επιτυχώς"}

# Creates an API endpoint for submitting the selected overtime inventory  
@app.put("/api/school/overtimeinventory/submitted/{overtimeinventory_id}", status_code=200)
async def submit_overtime_inventory(overtimeinventory_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeInventory).where(OvertimeInventory.id == overtimeinventory_id)
    curr_inventory =  session.exec(statement).first()
    curr_inventory.submitted = 1
    curr_inventory.stimestamp = datetime.utcnow()

    session.commit()
    session.refresh(curr_inventory)
    await submit_overtime_requests(overtimeinventory_id, user, session)
    return {"message", "Η κατάσταση πληρωμής υπερωριών υποβλήθηκε επιτυχώς"}



#School Travelcost API's

# Creates an API endpoint for getting the count of the new travelcot requests of the school
@app.get("/api/school/counttravelcostrequests/{school}")
async def get_count_school_travelcost_requests(school:str, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostRequest).where(TravelcostRequest.destination_school == school).where(TravelcostRequest.final == 1).where(TravelcostRequest.approved == 0)
    results = session.exec(statement).all()
    count = len(results)
    return count

# Creates an API endpoint for getting the new travelcost requests of the school
@app.get("/api/school/travelcostrequests/{school}", response_model=List[TravelcostRequest])
async def get_school_travelcost_requests(school:str, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostRequest).where(TravelcostRequest.destination_school == school).where(TravelcostRequest.final == 1).where(TravelcostRequest.approved == 0).order_by(TravelcostRequest.year, get_month_order(TravelcostRequest.month), TravelcostRequest.last_name, TravelcostRequest.first_name)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for getting the travelcost requests of the school
@app.get("/api/school/travelcostrequests/approved/{school}", response_model=List[TravelcostRequest])
async def get_school_approved_travelcost_requests(school:str, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostRequest).where(TravelcostRequest.destination_school == school).where(TravelcostRequest.approved == 1).where(TravelcostRequest.inserted != 1).order_by(TravelcostRequest.year, get_month_order(TravelcostRequest.month), TravelcostRequest.last_name, TravelcostRequest.first_name)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for getting the matched approved travelcost requests of the school
@app.get("/api/school/travelcostrequests/matchedapproved/{school}", response_model=List[TravelcostRequest])
async def get_school_matched_approved_travelcost_requests(school:str, month:str, year:int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostRequest).where(TravelcostRequest.destination_school == school).where(TravelcostRequest.month == month).where(TravelcostRequest.year == year).where(TravelcostRequest.approved == 1).where(TravelcostRequest.inserted != 1).order_by(TravelcostRequest.last_name, TravelcostRequest.first_name)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for creating a new travelcost inventory for the current school
@app.post("/api/school/travelcostinventories", response_model=TravelcostInventory)
async def create_travelcost_inventory(travelcostinventory: TravelcostInventory , user: User = Depends(get_current_user), session : Session=Depends(get_session)):  
    new_inventory = TravelcostInventory(school=travelcostinventory.school, month=travelcostinventory.month, year=travelcostinventory.year, submitted=0, stimestamp=None)
    session.add(new_inventory)
    session.commit()
    session.refresh(new_inventory)
    return TravelcostInventory.from_orm(new_inventory)

# Creates an API endpoint for getting the travelcost inventories of the current school
@app.get("/api/school/travelcostinventories/{school}", response_model=List[TravelcostInventory])
async def get_travelcost_inventories(school: str, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostInventory).where(TravelcostInventory.school == school).order_by(TravelcostInventory.year, get_month_order(TravelcostInventory.month))
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for getting the selected travelcost inventory
@app.get("/api/school/travelcostinventory/{travelcostinventory_id}", response_model=TravelcostInventory, status_code=200)
async def get_travelcost_inventory(travelcostinventory_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostInventory).where(TravelcostInventory.id == travelcostinventory_id)
    curr_inventory =  session.exec(statement).first()
    return TravelcostInventory.from_orm(curr_inventory)

# Creates an API endpoint for inserting requests in travelcost inventory
@app.post("/api/school/travelcostinventory/{travelcostinventory_id}/insertrequests", status_code=200)
async def insert_travelcost_requests(travelcostinventory_id: int, request_ids:List[int], user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    for req_id in request_ids:
        statement = select(TravelcostRequest).where(TravelcostRequest.id == req_id)
        curr_request = session.exec(statement).first()
        if curr_request:
            curr_request.inventory_id = travelcostinventory_id
            curr_request.inserted = 1
            curr_request.itimestamp = datetime.utcnow()
            session.commit()
            session.refresh(curr_request)
    return {"message", "Tα αιτήματα των οδοιπορικών εισήχθησαν επιτυχώς"}

# Creates an API endpoint for getting the inserted requests in  travelcost inventory
@app.get("/api/school/travelcostinventory/{travelcostinventory_id}/insertedrequests", response_model=List[TravelcostRequest])
async def get_inserted_travelcost_requests(travelcostinventory_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostRequest).where(TravelcostRequest.inventory_id == travelcostinventory_id).where(TravelcostRequest.inserted == 1).order_by(TravelcostRequest.year, get_month_order(TravelcostRequest.month), TravelcostRequest.last_name, TravelcostRequest.first_name)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for removing requests from the travelcost inventory
@app.post("/api/school/travelcostinventory/{travelcostrequest_id}/removerequest", status_code=200)
async def remove_inserted_travelcost_request(travelcostrequest_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostRequest).where(TravelcostRequest.id == travelcostrequest_id)
    curr_request = session.exec(statement).first()
    curr_request.inventory_id = 0
    curr_request.inserted = 0
    curr_request.itimestamp = None
    session.commit()
    session.refresh(curr_request)
    return {"message", "Tο αίτημα των οδοιπορικών αφαιρέθηκε επιτυχώς"}

# Creates an API endpoint for updating the selected travelcost inventory
@app.put("/api/school/travelcostinventory/{travelcostinventory_id}", status_code=200)
async def update_travelcost_inventory(travelcostinventory_id: int, travelcostinventory: TravelcostInventory, user: User = Depends(get_current_user),session : Session=Depends(get_session)):
    statement = select(TravelcostInventory).where(TravelcostInventory.id == travelcostinventory_id)
    curr_inventory =  session.exec(statement).first()
    curr_inventory.school = travelcostinventory.school
    curr_inventory.month = travelcostinventory.month
    curr_inventory.year = travelcostinventory.year

    session.commit()
    session.refresh(curr_inventory)
    return {"message", "Η κατάσταση πληρωμής οδοιπορικών ενημερώθηκε επιτυχώς"}

# Creates an API endpoint for deleting the selected travelcost inventory
@app.delete("/api/school/travelcostinventory/{travelcostinventory_id}", status_code=204)
async def delete_travelcost_inventory(travelcostinventory_id: int, user: User = Depends(get_current_user),session : Session=Depends(get_session)):
    statement = select(TravelcostInventory).where(TravelcostInventory.id == travelcostinventory_id)
    curr_inventory =  session.exec(statement).first()
    session.delete(curr_inventory)
    session.commit()
    return {"message", "Η κατάσταση πληρωμής οδοιπορικών διαγράφηκε επιτυχώς"}

# Creates an API endpoint for finalising the selected travelcost inventory  
@app.put("/api/school/travelcostinventory/submitted/{travelcostinventory_id}", status_code=200)
async def submit_travelcost_inventory(travelcostinventory_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostInventory).where(TravelcostInventory.id == travelcostinventory_id)
    curr_inventory =  session.exec(statement).first()
    curr_inventory.submitted = 1
    curr_inventory.stimestamp = datetime.utcnow()

    session.commit()
    session.refresh(curr_inventory)
    await submit_travelcost_requests(travelcostinventory_id, user, session)
    return {"message", "Η κατάσταση πληρωμής οδοιπορικών υποβλήθηκε επιτυχώς"}





#Exams API's

# Creates an API endpoint for creating a new exam inventory for the current school
@app.post("/api/school/examinventories", response_model=ExamInventory)
async def create_exam_inventory(examinventory: ExamInventory , user: User = Depends(get_current_user), session : Session=Depends(get_session)):  
    new_inventory = ExamInventory(name=examinventory.name, type=examinventory.type, school=examinventory.school, month=examinventory.month, year=examinventory.year)
    session.add(new_inventory)
    session.commit()
    session.refresh(new_inventory)
    return ExamInventory.from_orm(new_inventory)

# Creates an API endpoint for getting the exam inventories of the current school
@app.get("/api/school/examinventories/{school}", response_model=List[ExamInventory])
async def get_exam_inventories(school: str, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(ExamInventory).where(ExamInventory.school == school).order_by(ExamInventory.year, get_month_order(ExamInventory.month))
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for getting the selected exam inventory
@app.get("/api/school/examinventory/{examinventory_id}", response_model=ExamInventory, status_code=200)
async def get_exam_inventory(examinventory_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(ExamInventory).where(ExamInventory.id == examinventory_id)
    curr_inventory =  session.exec(statement).first()
    return ExamInventory.from_orm(curr_inventory)

# Creates an API endpoint for updating the selected exam inventory
@app.put("/api/school/examinventory/{examinventory_id}", status_code=200)
async def update_exam_inventory(examinventory_id: int, examinventory: ExamInventory, user: User = Depends(get_current_user),session : Session=Depends(get_session)):
    statement = select(ExamInventory).where(ExamInventory.id == examinventory_id)
    curr_inventory =  session.exec(statement).first()
    curr_inventory.name = examinventory.name
    curr_inventory.school = examinventory.school
    curr_inventory.month = examinventory.month
    curr_inventory.year = examinventory.year

    session.commit()
    session.refresh(curr_inventory)
    return {"message", "Η κατάσταση πληρωμής πανελλαδικών ενημερώθηκε επιτυχώς"}

# Creates an API endpoint for deleting the selected exam inventory
@app.delete("/api/school/examinventory/{examinventory_id}", status_code=204)
async def delete_exam_inventory(examinventory_id: int, user: User = Depends(get_current_user),session : Session=Depends(get_session)):
    statement = select(ExamInventory).where(ExamInventory.id == examinventory_id)
    curr_inventory =  session.exec(statement).first()
    session.delete(curr_inventory)
    session.commit()
    return {"message", "Η κατάσταση πληρωμής πανελλαδικών διαγράφηκε επιτυχώς"}

# Creates an API endpoint for uploading the distribution for the selected travelcost request
@app.put("/api/school/examinventory/uploadfiles/{examinventory_id}", status_code=200)
async def upload_exam_files(examinventory_id: int, files: List[UploadFile] = File(...), user: User = Depends(get_current_user), session : Session=Depends(get_session)):

    statement = select(ExamInventory).where(ExamInventory.id == examinventory_id)
    curr_inventory =  session.exec(statement).first()
    
    for index, file in enumerate(files):
        if index == 0:
            original_extension = Path(file.filename).suffix
            first_filename = f"ΑΠΟΦΑΣΗ ΟΡΙΣΜΟΥ ΠΑΝΕΛΛΑΔΙΚΩΝ_{curr_inventory.school}_{curr_inventory.name}{original_extension}"
            file_path = UPLOAD_DIR / curr_inventory.school / first_filename
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            relative_path = Path(f"{curr_inventory.school}") / first_filename
            curr_inventory.decree = relative_path.as_posix()
        elif index == 1:
            original_extension = Path(file.filename).suffix
            second_filename = f"ΒΕΒΑΙΩΣΗ ΣΥΜΜΕΤΟΧΗΣ ΠΑΝΕΛΛΑΔΙΚΩΝ_{curr_inventory.school}_{curr_inventory.name}{original_extension}"
            file_path = UPLOAD_DIR / curr_inventory.school / second_filename
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            relative_path = Path(f"{curr_inventory.school}") / second_filename
            curr_inventory.affirmation = relative_path.as_posix()
   
    session.commit()
    session.refresh(curr_inventory)
    return {"message", "τα αρχεία της κατάστασης Πανελλαδικών ανέβηκαν επιτυχώς"}

# Creates an API endpoint for finalising the selected exam inventory  
@app.put("/api/school/examinventory/submitted/{examinventory_id}", status_code=200)
async def submit_exam_inventory(examinventory_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(ExamInventory).where(ExamInventory.id == examinventory_id)
    curr_inventory =  session.exec(statement).first()
    curr_inventory.submitted = 1
    curr_inventory.stimestamp = datetime.utcnow()

    session.commit()
    session.refresh(curr_inventory)
    return {"message", "Η κατάσταση πανελλαδικών υποβλήθηκε επιτυχώς"}


# Creates an API endpoint for creating a new exam participation for the current inventroy of the school 
@app.post("/api/school/examinventory/{examinventory_id}/createparticipation", status_code=200)
async def create_exam_participation(examinventory_id, examparticipation: ExamParticipation , user: User = Depends(get_current_user), session : Session=Depends(get_session)):  
    new_participation = ExamParticipation(owner_id=user.id, last_name=examparticipation.last_name, first_name=examparticipation.first_name, afm=examparticipation.afm, type=examparticipation.type, role=examparticipation.role, inventory_id= examinventory_id, month=examparticipation.month, year=examparticipation.year, number_of_exams=examparticipation.number_of_exams )
    new_participation.inserted = 1
    new_participation.itimestamp = datetime.utcnow()
    statement = select(Employee).where(Employee.afm == examparticipation.afm)
    curr_employee = session.exec(statement).first()
    new_participation.am = curr_employee.am
    new_participation.category = curr_employee.category
    new_participation.contract = curr_employee.contract
    new_participation.mk = curr_employee.mk
    new_participation.iban = curr_employee.iban
    session.add(new_participation)
    session.commit()
    session.refresh(new_participation)
    return ExamParticipation.from_orm(new_participation)

# Creates an API endpoint for getting the inserted participations of the exam inventory
@app.get("/api/school/examinventory/{examinventory_id}/insertedparticipations", response_model=List[ExamParticipation])
async def get_inserted_exam_participations(examinventory_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(ExamParticipation).where(ExamParticipation.inventory_id == examinventory_id).where(ExamParticipation.inserted == 1).order_by(ExamParticipation.year, get_month_order(ExamParticipation.month), ExamParticipation.last_name, ExamParticipation.first_name)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for removing participation from the exam inventory of the school
@app.post("/api/school/examinventory/{examparticipation_id}/removeparticipation", status_code=200)
async def remove_inserted_exam_participation(examparticipation_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(ExamParticipation).where(ExamParticipation.id == examparticipation_id)
    curr_participation = session.exec(statement).first()
    curr_participation.inventory_id = 0
    curr_participation.inserted = 0
    curr_participation.itimestamp = None
    session.commit()
    session.refresh(curr_participation)
    return {"message", "Η συμμετοχή του εκπαιδευτικού αφαιρέθηκε επιτυχώς"}

# Creates an API endpoint for deleting the selected exam participation of the current school
@app.delete("/api/school/examparticipations/{examparticipation_id}", status_code=204)
async def delete_exam_participation(examparticipation_id: int, user: User = Depends(get_current_user),session : Session=Depends(get_session)):
    curr_participation = await exam_participation_selector(examparticipation_id, user, session)
    session.delete(curr_participation)
    session.commit()
    return {"message", "Η εγγραφή συμμετοχής πανελλαδικών διαγράφηκε επιτυχώς"}


### Admin API's ###

###Admin Register API's ###
# Creates an API endpoint for getting the count of the new register requests
@app.get("/api/admin/countregisterrequests")
async def get_count_register_requests(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(RegisterRequest).where(RegisterRequest.submitted == 1).where(RegisterRequest.approved == 0)
    results = session.exec(statement).all()
    count = len(results)
    return count

# Creates an API endpoint for getting the new register requests
@app.get("/api/admin/registerrequests", response_model=List[RegisterRequest])
async def get_register_requests(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(RegisterRequest).where(RegisterRequest.submitted == 1).where(RegisterRequest.approved == 0).order_by(RegisterRequest.stimestamp)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for checking the selected register request   
@app.get("/api/admin/registerrequests/check/{registerrequest_id}")
async def check_register_request(registerrequest_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(RegisterRequest).where(RegisterRequest.id == registerrequest_id)
    curr_request =  session.exec(statement).first()
    if curr_request.category == "Υπάλληλος" :
        statement2 = select(Employee).where(Employee.afm == curr_request.afm).where(Employee.email == curr_request.email)
        curr_employee = session.exec(statement2).first()
        if curr_employee:
            curr_request.check_result = f"Υπάρχει ο Υπάλληλος {curr_employee.last_name} {curr_employee.first_name} με τα ζητούμενα κριτήρια στην βάση δεδομένων"
        else:
            curr_request.check_result =  "Δεν υπάρχει υπάλληλος με τα ζητούμενα κριτήρια στην βάση δεδομένων"
    elif curr_request.category == "Σχολείο" :
        statement3 = select(School).where(School.kodikos == curr_request.kodikos).where(School.email == curr_request.email)
        curr_school = session.exec(statement3).first()
        if curr_school:
            curr_request.check_result = "Υπάρχει σχολείο με τα ζητούμενα κριτήρια στην βάση δεδομένων"
        else:
            curr_request.check_result = "Δεν υπάρχει σχολείο με τα ζητούμενα κριτήρια στην βάση δεδομένων"
    session.commit()
    session.refresh(curr_request)
    return {"message": curr_request.check_result}


# Creates an API endpoint for approving the selected register request   
@app.put("/api/admin/registerrequests/approve/{registerrequest_id}", status_code=200)
async def approve_register_request(registerrequest_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(RegisterRequest).where(RegisterRequest.id == registerrequest_id)
    curr_request =  session.exec(statement).first()
    curr_request.approved = 1
    curr_request.atimestamp = datetime.utcnow()
    session.commit()
    session.refresh(curr_request)
    await create_user(curr_request, session)
    subject = "Η αίτηση εγγραφής σας ελέγχθηκε"
    body = "Η αίτηση σας για εγγραφή έχει ελεγχθεί και έχει εγκριθεί. Μπορείτε να συνδεθείτε πλέον στο σύστημα."
    await send_email(curr_request.email, subject, body)
    return {"message", "Το αίτημα εγγραφής χρήστη εγκρίθηκε επιτυχώς"}

# Creates an API endpoint for disapproving the selected register request     
@app.put("/api/admin/registerrequests/disapprove/{registerrequest_id}", status_code=200)
async def disapprove_register_request(registerrequest_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(RegisterRequest).where(RegisterRequest.id == registerrequest_id)
    curr_request =  session.exec(statement).first()
    curr_request.approved = -1
    curr_request.atimestamp = datetime.utcnow()
    session.commit()
    session.refresh(curr_request)
    subject = "Η αίτηση εγγραφής σας ελέγχθηκε"
    body = "Η αίτηση σας για εγγραφή έχει ελεγχθεί και έχει απορριφθεί. Μπορείτε να επικοινωνήσετε με τον Διαχειριστή για πληροφορίες."
    await send_email(curr_request.email, subject, body)
    return {"message", "Το αίτημα εγγραφής χρήστη απορρίφθηκε επιτυχώς"}



### Admin Overtime API's ###
# Creates an API endpoint for getting the count of the new overtime inventories
@app.get("/api/admin/countovertimeinventories")
async def get_count_overtime_inventories(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeInventory).where(OvertimeInventory.submitted == 1).where(OvertimeInventory.approved == 0)
    results = session.exec(statement).all()
    count = len(results)
    return count

# Creates an API endpoint for getting the new new overtime inventories
@app.get("/api/admin/overtimeinventories", response_model=List[OvertimeInventory])
async def get_overtime_inventories(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeInventory).where(OvertimeInventory.submitted == 1).where(OvertimeInventory.approved == 0).order_by(OvertimeInventory.year, get_month_order(OvertimeInventory.month), OvertimeInventory.school)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for approving the selected overtime inventory   
@app.put("/api/admin/overtimeinventories/approve/{overtimeinventory_id}", status_code=200)
async def approve_overtime_inventory(overtimeinventory_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeInventory).where(OvertimeInventory.id == overtimeinventory_id)
    curr_inventory =  session.exec(statement).first()
    curr_inventory.approved = 1
    curr_inventory.atimestamp = datetime.utcnow()
    session.commit()
    session.refresh(curr_inventory)
    return {"message", "Η κατάσταση υπερωριών εγκρίθηκε επιτυχώς"}

# Creates an API endpoint for disapproving the selected overtime inventory   
@app.put("/api/admin/overtimeinventories/disapprove/{overtimeinventory_id}", status_code=200)
async def disapprove_overtime_inventory(overtimeinventory_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeInventory).where(OvertimeInventory.id == overtimeinventory_id)
    curr_inventory =  session.exec(statement).first()
    curr_inventory.approved = -1
    curr_inventory.atimestamp = datetime.utcnow()
    session.commit()
    session.refresh(curr_inventory)
    return {"message", "Η κατάσταση υπερωριών απορρίφθηκε επιτυχώς"}

# Creates an API endpoint for getting the approved overtime inventories
@app.get("/api/admin/overtimeinventories/approved", response_model=List[OvertimeInventory])
async def get_approved_overtime_inventories(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeInventory).where(OvertimeInventory.submitted == 1).where(OvertimeInventory.approved == 1).where(OvertimeInventory.inserted != 1).order_by(OvertimeInventory.year, get_month_order(OvertimeInventory.month), OvertimeInventory.school)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for getting the monthly approved overtime inventories
@app.get("/api/admin/overtimeinventories/{month}/{year}/matchedapproved", response_model=List[OvertimeInventory])
async def get_matched_approved_overtime_inventories(month:str, year:int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeInventory).where(OvertimeInventory.month == month).where(OvertimeInventory.year==year).where(OvertimeInventory.approved == 1).where(OvertimeInventory.inserted != 1).order_by(OvertimeInventory.year, get_month_order(OvertimeInventory.month), OvertimeInventory.school)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for creating a new overtime payment 
@app.post("/api/admin/overtimepayment", response_model=OvertimePayment)
async def create_overtime_payment(overtimepayment: OvertimePayment , user: User = Depends(get_current_user), session : Session=Depends(get_session)):  
    new_payment = OvertimePayment(name=overtimepayment.name, month=overtimepayment.month, year=overtimepayment.year, submitted=0, stimestamp=None)
    session.add(new_payment)
    session.commit()
    session.refresh(new_payment)
    return OvertimePayment.from_orm(new_payment)

# Creates an API endpoint for getting the overtime payments 
@app.get("/api/admin/overtimepayments", response_model=List[OvertimePayment])
async def get_overtime_payments(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimePayment).order_by(OvertimePayment.year, get_month_order(OvertimePayment.month), OvertimePayment.name)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for getting the selected overtime payment
@app.get("/api/admin/overtimepayment/{overtimepayment_id}", response_model=OvertimePayment, status_code=200)
async def get_overtime_payment(overtimepayment_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimePayment).where(OvertimePayment.id == overtimepayment_id)
    curr_payment =  session.exec(statement).first()
    return OvertimePayment.from_orm(curr_payment)

# Creates an API endpoint for inserting inventories in overtime payment
@app.post("/api/admin/overtimepayment/{overtimepayment_id}/insertinventories", status_code=200)
async def insert_overtime_inventories(overtimepayment_id: int, inventories_ids:List[int], user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    for inv_id in inventories_ids:
        statement = select(OvertimeInventory).where(OvertimeInventory.id == inv_id)
        curr_inventory = session.exec(statement).first()
        if curr_inventory:
            curr_inventory.payment_id = overtimepayment_id
            curr_inventory.inserted = 1
            curr_inventory.itimestamp = datetime.utcnow()
            session.commit()
            session.refresh(curr_inventory)
    return {"message", "Ο κατάλογος υπερωριών εισήχθηκε επιτυχώς"}

# Creates an API endpoint for getting the inserted inventories in  overtime payment
@app.get("/api/admin/overtimepayment/{overtimepayment_id}/insertedinventories", response_model=List[OvertimeInventory])
async def get_inserted_overtime_inventories(overtimepayment_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeInventory).where(OvertimeInventory.payment_id == overtimepayment_id).where(OvertimeInventory.inserted == 1).order_by(OvertimeInventory.year, get_month_order(OvertimeInventory.month), OvertimeInventory.school)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for removing inventories from the overtime payment
@app.post("/api/admin/overtimepayment/{overtimeinventory_id}/removeinventory", status_code=200)
async def remove_inserted_overtime_inventory(overtimeinventory_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeInventory).where(OvertimeInventory.id == overtimeinventory_id)
    curr_inventory = session.exec(statement).first()
    curr_inventory.payment_id = 0
    curr_inventory.inserted = 0
    curr_inventory.itimestamp = None
    session.commit()
    session.refresh(curr_inventory)
    return {"message", "Ο κατάλογος των υπερωριών αφαιρέθηκε επιτυχώς"}

# Creates an API endpoint for updating the selected overtime payment
@app.put("/api/admin/overtimepayment/{overtimepayment_id}", status_code=200)
async def update_overtime_payment(overtimepayment_id: int, overtimepayment: OvertimePayment, user: User = Depends(get_current_user),session : Session=Depends(get_session)):
    statement = select(OvertimePayment).where(OvertimePayment.id == overtimepayment_id)
    curr_payment =  session.exec(statement).first()
    curr_payment.name = overtimepayment.name
    curr_payment.month = overtimepayment.month
    curr_payment.year = overtimepayment.year

    session.commit()
    session.refresh(curr_payment)
    return {"message", "Η κατάσταση πληρωμής υπερωριών ενημερώθηκε επιτυχώς"}

# Creates an API endpoint for deleting the selected overtime payment
@app.delete("/api/admin/overtimepayment/{overtimepayment_id}", status_code=204)
async def delete_overtime_payment(overtimepayment_id: int, user: User = Depends(get_current_user),session : Session=Depends(get_session)):
    statement = select(OvertimePayment).where(OvertimePayment.id == overtimepayment_id)
    curr_payment =  session.exec(statement).first()
    session.delete(curr_payment)
    session.commit()
    return {"message", "Η κατάσταση πληρωμής υπερωριών διαγράφηκε επιτυχώς"}

# Creates an API endpoint for submitting the selected overtime payment  
@app.put("/api/admin/overtimepayment/submitted/{overtimepayment_id}", status_code=200)
async def submit_overtime_payment(overtimepayment_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimePayment).where(OvertimePayment.id == overtimepayment_id)
    curr_payment =  session.exec(statement).first()
    curr_payment.submitted = 1
    curr_payment.stimestamp = datetime.utcnow()

    session.commit()
    session.refresh(curr_payment)
    await submit_overtime_requests_to_payment(overtimepayment_id, user, session)
    await calculate_overtime_compensations(overtimepayment_id, user, session)

    return {"message", "Η κατάσταση πληρωμής υπερωριών υποβλήθηκε επιτυχώς"}

# Creates an API endpoint for printing the requests of the selected overtime payment  
@app.get("/api/admin/printovertimerequests/{overtimepayment_id}", response_model=List[OvertimeRequest])
async def print_overtime_requests(overtimepayment_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(OvertimeRequest).where(OvertimeRequest.payment_id == overtimepayment_id).where(OvertimeRequest.paid == 1)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for exporting the requests of the selected overtime payment
@app.get("/api/admin/exportovertimepayment/{overtimepayment_id}")
async def export_overtime_payment(overtimepayment_id: int, session : Session=Depends(get_session)):
    results = await export_overtime_requests(overtimepayment_id, session)
    return results
 






### Admin Travelcost API's ###
# Creates an API endpoint for getting the count of the new travelcost inventories
@app.get("/api/admin/counttravelcostinventories")
async def get_count_travelcost_inventories(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostInventory).where(TravelcostInventory.submitted == 1).where(TravelcostInventory.approved == 0)
    results = session.exec(statement).all()
    count = len(results)
    return count

# Creates an API endpoint for getting the new travelcost inventories
@app.get("/api/admin/travelcostinventories", response_model=List[TravelcostInventory])
async def get_travelcost_inventories(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostInventory).where(TravelcostInventory.submitted == 1).where(TravelcostInventory.approved == 0).order_by(TravelcostInventory.year, get_month_order(TravelcostInventory.month), TravelcostInventory.school)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for approving the selected travelcost inventory   
@app.put("/api/admin/travelcostinventories/approve/{travelcostinventory_id}", status_code=200)
async def approve_travelcost_inventory(travelcostinventory_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostInventory).where(TravelcostInventory.id == travelcostinventory_id)
    curr_inventory =  session.exec(statement).first()
    curr_inventory.approved = 1
    curr_inventory.atimestamp = datetime.utcnow()
    session.commit()
    session.refresh(curr_inventory)
    return {"message", "Η κατάσταση οδοιπορικών εγκρίθηκε επιτυχώς"}

# Creates an API endpoint for disapproving the selected travelcost inventory   
@app.put("/api/admin/travelcostinventories/disapprove/{travelcostinventory_id}", status_code=200)
async def disapprove_travelcost_inventory(travelcostinventory_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostInventory).where(TravelcostInventory.id == travelcostinventory_id)
    curr_inventory =  session.exec(statement).first()
    curr_inventory.approved = -1
    curr_inventory.atimestamp = datetime.utcnow()
    session.commit()
    session.refresh(curr_inventory)
    return {"message", "Η κατάσταση οδοιπορικών απορρίφθηκε επιτυχώς"}

# Creates an API endpoint for getting the approved travelcost inventories
@app.get("/api/admin/travelcostinventories/approved", response_model=List[TravelcostInventory])
async def get_approved_travelcost_inventories(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostInventory).where(TravelcostInventory.submitted == 1).where(TravelcostInventory.approved == 1).where(TravelcostInventory.inserted != 1).order_by(TravelcostInventory.year, get_month_order(TravelcostInventory.month), TravelcostInventory.school)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for getting the monthly approved travelcost inventories
@app.get("/api/admin/travelcostinventories/{month}/{year}/matchedapproved", response_model=List[TravelcostInventory])
async def get_matched_approved_travelcost_inventories(month:str, year:int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostInventory).where(TravelcostInventory.month == month).where(TravelcostInventory.year == year).where(TravelcostInventory.approved == 1).where(TravelcostInventory.inserted != 1).order_by(TravelcostInventory.year, get_month_order(TravelcostInventory.month), TravelcostInventory.school)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for creating a new travelcost payment 
@app.post("/api/admin/travelcostpayment", response_model=TravelcostPayment)
async def create_travelcost_payment(travelcostpayment: TravelcostPayment , user: User = Depends(get_current_user), session : Session=Depends(get_session)):  
    new_payment = TravelcostPayment(name=travelcostpayment.name, month=travelcostpayment.month, year=travelcostpayment.year, submitted=0, stimestamp=None)
    session.add(new_payment)
    session.commit()
    session.refresh(new_payment)
    return TravelcostPayment.from_orm(new_payment)

# Creates an API endpoint for getting the travelcost payments 
@app.get("/api/admin/travelcostpayments", response_model=List[TravelcostPayment])
async def get_travelcost_payments(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostPayment).order_by(TravelcostPayment.year, get_month_order(TravelcostPayment.month), TravelcostPayment.name)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for getting the selected travelcost payment
@app.get("/api/admin/travelcostpayment/{travelcostpayment_id}", response_model=TravelcostPayment, status_code=200)
async def get_travelcost_payment(travelcostpayment_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostPayment).where(TravelcostPayment.id == travelcostpayment_id)
    curr_payment =  session.exec(statement).first()
    return TravelcostPayment.from_orm(curr_payment)

# Creates an API endpoint for inserting inventories in travelcost payment
@app.post("/api/admin/travelcostpayment/{travelcostpayment_id}/insertinventories", status_code=200)
async def insert_travelcost_inventories(travelcostpayment_id: int, inventories_ids:List[int], user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    for inv_id in inventories_ids:
        statement = select(TravelcostInventory).where(TravelcostInventory.id == inv_id)
        curr_inventory = session.exec(statement).first()
        if curr_inventory:
            curr_inventory.payment_id = travelcostpayment_id
            curr_inventory.inserted = 1
            curr_inventory.itimestamp = datetime.utcnow()
            session.commit()
            session.refresh(curr_inventory)
    return {"message", "Ο κατάλογος οδοιπορικών εισήχθηκε επιτυχώς"}

# Creates an API endpoint for getting the inserted inventories in  travelcost payment
@app.get("/api/admin/travelcostpayment/{travelcostpayment_id}/insertedinventories", response_model=List[TravelcostInventory])
async def get_inserted_travelcost_inventories(travelcostpayment_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostInventory).where(TravelcostInventory.payment_id == travelcostpayment_id).where(TravelcostInventory.inserted == 1).order_by(TravelcostInventory.year, get_month_order(TravelcostInventory.month), TravelcostInventory.school)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for removing inventories from the travelcost payment
@app.post("/api/admin/travelcostpayment/{travelcostinventory_id}/removeinventory", status_code=200)
async def remove_inserted_travelcost_inventory(travelcostinventory_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostInventory).where(TravelcostInventory.id == travelcostinventory_id)
    curr_inventory = session.exec(statement).first()
    curr_inventory.payment_id = 0
    curr_inventory.inserted = 0
    curr_inventory.itimestamp = None
    session.commit()
    session.refresh(curr_inventory)
    return {"message", "Ο κατάλογος των οδοιπορικών αφαιρέθηκε επιτυχώς"}

# Creates an API endpoint for updating the selected travelcost payment
@app.put("/api/admin/travelcostpayment/{travelcostpayment_id}", status_code=200)
async def update_travelcost_payment(travelcostpayment_id: int, travelcostpayment: TravelcostPayment, user: User = Depends(get_current_user),session : Session=Depends(get_session)):
    statement = select(TravelcostPayment).where(TravelcostPayment.id == travelcostpayment_id)
    curr_payment =  session.exec(statement).first()
    curr_payment.name = travelcostpayment.name
    curr_payment.month = travelcostpayment.month
    curr_payment.year = travelcostpayment.year

    session.commit()
    session.refresh(curr_payment)
    return {"message", "Η κατάσταση πληρωμής οδοιπορικών ενημερώθηκε επιτυχώς"}

# Creates an API endpoint for deleting the selected travelcost payment
@app.delete("/api/admin/travelcostpayment/{travelcostpayment_id}", status_code=204)
async def delete_travelcost_payment(travelcostpayment_id: int, user: User = Depends(get_current_user),session : Session=Depends(get_session)):
    statement = select(TravelcostPayment).where(TravelcostPayment.id == travelcostpayment_id)
    curr_payment =  session.exec(statement).first()
    session.delete(curr_payment)
    session.commit()
    return {"message", "Η κατάσταση πληρωμής οδοιπορικών διαγράφηκε επιτυχώς"}

# Creates an API endpoint for submitting the selected travelcost payment  
@app.put("/api/admin/travelcostpayment/submitted/{travelcostpayment_id}", status_code=200)
async def submit_travelcost_payment(travelcostpayment_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostPayment).where(TravelcostPayment.id == travelcostpayment_id)
    curr_payment =  session.exec(statement).first()
    curr_payment.submitted = 1
    curr_payment.stimestamp = datetime.utcnow()

    session.commit()
    session.refresh(curr_payment)
    await submit_travelcost_requests_to_payment(travelcostpayment_id, user, session)
    await calculate_travelcost_compensations(travelcostpayment_id, user, session)
    return {"message", "Η κατάσταση πληρωμής οδοιπορικών υποβλήθηκε επιτυχώς"}

# Creates an API endpoint for printing the requests of the selected travelcost payment  
@app.get("/api/admin/printtravelcostrequests/{travelcostpayment_id}", response_model=List[TravelcostRequest])
async def print_travelcost_requests(travelcostpayment_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(TravelcostRequest).where(TravelcostRequest.payment_id == travelcostpayment_id).where(TravelcostRequest.paid == 1)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for exporting the requests of the selected travelcost payment
@app.get("/api/admin/exporttravelcostpayment/{travelcostpayment_id}")
async def export_travelcost_payment(travelcostpayment_id: int, session : Session=Depends(get_session)):
    results = await export_travelcost_requests(travelcostpayment_id, session)
    return results







### Admin Exam API's ###
# Creates an API endpoint for getting the count of the new exam inventories
@app.get("/api/admin/countexaminventories")
async def get_count_exam_inventories(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(ExamInventory).where(ExamInventory.submitted == 1).where(ExamInventory.approved == 0)
    results = session.exec(statement).all()
    count = len(results)
    return count

# Creates an API endpoint for getting the new exam inventories
@app.get("/api/admin/examinventories", response_model=List[ExamInventory])
async def get_exam_inventories(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(ExamInventory).where(ExamInventory.submitted == 1).where(ExamInventory.approved == 0).order_by(ExamInventory.year, get_month_order(ExamInventory.month), ExamInventory.school, ExamInventory.name)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for approving the selected exam inventory   
@app.put("/api/admin/examinventories/approve/{examinventory_id}", status_code=200)
async def approve_exam_inventory(examinventory_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(ExamInventory).where(ExamInventory.id == examinventory_id)
    curr_inventory =  session.exec(statement).first()
    curr_inventory.approved = 1
    curr_inventory.atimestamp = datetime.utcnow()
    session.commit()
    session.refresh(curr_inventory)
    return {"message", "Η κατάσταση πανελλαδικών εγκρίθηκε επιτυχώς"}

# Creates an API endpoint for disapproving the selected exam inventory   
@app.put("/api/admin/examinventories/disapprove/{examinventory_id}", status_code=200)
async def disapprove_exam_inventory(examinventory_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(ExamInventory).where(ExamInventory.id == examinventory_id)
    curr_inventory =  session.exec(statement).first()
    curr_inventory.approved = -1
    curr_inventory.atimestamp = datetime.utcnow()
    session.commit()
    session.refresh(curr_inventory)
    return {"message", "Η κατάσταση πανελλαδικών απορρίφθηκε επιτυχώς"}

# Creates an API endpoint for getting the approved exam inventories
@app.get("/api/admin/examinventories/approved", response_model=List[ExamInventory])
async def get_approved_exam_inventories(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(ExamInventory).where(ExamInventory.submitted == 1).where(ExamInventory.approved == 1).where(ExamInventory.inserted != 1).order_by(ExamInventory.year, get_month_order(ExamInventory.month), ExamInventory.school, ExamInventory.name)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for getting the monthly approved exam inventories
@app.get("/api/admin/examinventories/{type}/{month}/{year}/matchedapproved", response_model=List[ExamInventory])
async def get_matched_approved_exam_inventories(type:str, month: str, year: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(ExamInventory).where(ExamInventory.approved == 1).where(ExamInventory.inserted != 1).where(ExamInventory.type == type).where(ExamInventory.month == month).where(ExamInventory.year == year).order_by(ExamInventory.year, get_month_order(ExamInventory.month), ExamInventory.school, ExamInventory.name)
    results = session.exec(statement).all()
    return results

# Creates an API endpoint for creating a new exam payment 
@app.post("/api/admin/exampayment", response_model=ExamPayment)
async def create_exam_payment(exampayment: ExamPayment , user: User = Depends(get_current_user), session : Session=Depends(get_session)):  
    new_payment = ExamPayment(name=exampayment.name, type=exampayment.type, month=exampayment.month, year=exampayment.year, submitted=0, stimestamp=None)
    session.add(new_payment)
    session.commit()
    session.refresh(new_payment)
    return ExamPayment.from_orm(new_payment)

# Creates an API endpoint for getting the exam payments 
@app.get("/api/admin/exampayments", response_model=List[ExamPayment])
async def get_exam_payments(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(ExamPayment).order_by(ExamPayment.year, get_month_order(ExamPayment.month), ExamPayment.name)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for getting the selected exam payment
@app.get("/api/admin/exampayment/{exampayment_id}", response_model=ExamPayment, status_code=200)
async def get_exam_payment(exampayment_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(ExamPayment).where(ExamPayment.id == exampayment_id)
    curr_payment =  session.exec(statement).first()
    return ExamPayment.from_orm(curr_payment)

# Creates an API endpoint for inserting inventories in exam payment
@app.post("/api/admin/exampayment/{exampayment_id}/insertinventories", status_code=200)
async def insert_exam_inventories(exampayment_id: int, inventories_ids:List[int], user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    for inv_id in inventories_ids:
        statement = select(ExamInventory).where(ExamInventory.id == inv_id)
        curr_inventory = session.exec(statement).first()
        if curr_inventory:
            curr_inventory.payment_id = exampayment_id
            curr_inventory.inserted = 1
            curr_inventory.itimestamp = datetime.utcnow()
            session.commit()
            session.refresh(curr_inventory)
    return {"message", "Ο κατάλογος πανελλαδικών εισήχθηκε επιτυχώς"}

# Creates an API endpoint for getting the inserted inventories in  exam payment
@app.get("/api/admin/exampayment/{exampayment_id}/insertedinventories", response_model=List[ExamInventory])
async def get_inserted_exam_inventories(exampayment_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(ExamInventory).where(ExamInventory.payment_id == exampayment_id).where(ExamInventory.inserted == 1).order_by(ExamInventory.year, get_month_order(ExamInventory.month), ExamInventory.school, ExamInventory.name)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for removing inventories from the exam payment
@app.post("/api/admin/exampayment/{examinventory_id}/removeinventory", status_code=200)
async def remove_inserted_exam_inventory(examinventory_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(ExamInventory).where(ExamInventory.id == examinventory_id)
    curr_inventory = session.exec(statement).first()
    curr_inventory.payment_id = 0
    curr_inventory.inserted = 0
    curr_inventory.itimestamp = None
    session.commit()
    session.refresh(curr_inventory)
    return {"message", "Ο κατάλογος των πανελλαδικών αφαιρέθηκε επιτυχώς"}

# Creates an API endpoint for updating the selected exam payment
@app.put("/api/admin/exampayment/{exampayment_id}", status_code=200)
async def update_exam_payment(exampayment_id: int, exampayment: ExamPayment, user: User = Depends(get_current_user),session : Session=Depends(get_session)):
    statement = select(ExamPayment).where(ExamPayment.id == exampayment_id)
    curr_payment =  session.exec(statement).first()
    curr_payment.name = exampayment.name
    curr_payment.type = exampayment.type
    curr_payment.month = exampayment.month
    curr_payment.year = exampayment.year

    session.commit()
    session.refresh(curr_payment)
    return {"message", "Η κατάσταση πληρωμής πανελλαδικών ενημερώθηκε επιτυχώς"}

# Creates an API endpoint for deleting the selected exam payment
@app.delete("/api/admin/exampayment/{exampayment_id}", status_code=204)
async def delete_exam_payment(exampayment_id: int, user: User = Depends(get_current_user),session : Session=Depends(get_session)):
    statement = select(ExamPayment).where(ExamPayment.id == exampayment_id)
    curr_payment =  session.exec(statement).first()
    session.delete(curr_payment)
    session.commit()
    return {"message", "Η κατάσταση πληρωμής πανελλαδικών διαγράφηκε επιτυχώς"}

# Creates an API endpoint for submitting the selected exam payment  
@app.put("/api/admin/exampayment/submitted/{exampayment_id}", status_code=200)
async def submit_exam_payment(exampayment_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(ExamPayment).where(ExamPayment.id == exampayment_id)
    curr_payment =  session.exec(statement).first()
    curr_payment.submitted = 1
    curr_payment.stimestamp = datetime.utcnow()

    session.commit()
    session.refresh(curr_payment)
    await submit_exam_participations_to_payment(exampayment_id, user, session)
    await calculate_exam_compensations(exampayment_id, session)
    return {"message", "Η κατάσταση πληρωμής πανελλαδικών υποβλήθηκε επιτυχώς"}

# Creates an API endpoint for printing the participations of the selected exam payment  
@app.get("/api/admin/printexampayment/{exampayment_id}", response_model=List[ExamParticipation])
async def print_exam_participations(exampayment_id: int, user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(ExamParticipation).where(ExamParticipation.payment_id == exampayment_id).where(ExamParticipation.paid == 1)
    results =  session.exec(statement).all()
    return results

# Creates an API endpoint for exporting the participations of the selected exam payment
@app.get("/api/admin/exportexampayment/{exampayment_id}")
async def export_exam_payment(exampayment_id: int, session : Session=Depends(get_session)):
    results = await export_exam_participations(exampayment_id, session)
    return results




### Admin Maintenance API's ###
# Creates an API endpoint for uploading the school standard
@app.post("/api/admin/uploadschoolsstandard", status_code=200)
async def upload_schools_standard(file: UploadFile = File(...), user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    # Load Excel into DataFrame
    df = pd.read_excel(file.file)
    df.columns = df.columns.str.lower()  # Normalize column names to lowercase

    # Expected columns
    expected = {"id", "kodikos", "name", "email", "latitude", "longitude"}
    if set(df.columns) != expected:
        raise HTTPException(
            status_code=400,
            detail=f"Excel columns must be exactly: {expected}"
        )

    inserted = 0
    for row in df.itertuples(index=False):
        # Optional: Skip existing IDs to avoid duplicate primary key error
        existing = session.get(School, row.id)
        if existing:
            continue  # Or raise error if you prefer strict behavior

        school = School(
            id=row.id,
            kodikos=row.kodikos,
            name=row.name,
            email=row.email,
            latitude=row.latitude,
            longitude=row.longitude,
        )
        session.add(school)
        inserted += 1

    session.commit()
    return {"message": f"{inserted} Σχολεία προστέθηκαν επιτυχώς."}

# Creates an API endpoint for clearing all the schools
@app.delete("/api/admin/clearschools")
async def clear_schools(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    session.exec(delete(School))
    session.commit()
    return {"message": "All schools have been deleted."}

# Creates an API endpoint for uploading the employee standard
@app.post("/api/admin/uploademployeesstandard", status_code=200)
async def upload_employees_standard(file: UploadFile = File(...), user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    try:
        df = pd.read_excel(file.file)
        df.columns = df.columns.str.lower()

        expected = {"id", "afm", "am", "category", "contract", "mk", "first_name", "last_name", "email", "iban", "school_id"}
        if set(df.columns) != expected:
            raise HTTPException(
                status_code=400,
                detail=f"Excel columns must be exactly: {expected}"
            )

        inserted = 0
        for row in df.itertuples(index=False):
            existing = session.get(Employee, row.id)
            if existing:
                continue

            employee = Employee(
                id=row.id,
                afm=row.afm,
                am=row.am,
                category=row.category,
                contract=row.contract,
                mk=row.mk,
                first_name=row.first_name,
                last_name=row.last_name,
                email=row.email,
                iban=row.iban,
                school_id=row.school_id,
            )
            session.add(employee)
            inserted += 1

        session.commit()
        return {"message": f"{inserted} Υπάλληλοι προστέθηκαν επιτυχώς."}

    except Exception as e:
        # Log and return the error
        print("Upload Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

# Creates an API endpoint for clearing the employees
@app.delete("/api/admin/clearemployees")
async def clear_employees(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    session.exec(delete(Employee))
    session.commit()
    return {"message": "All employees have been deleted."}


# Creates an API endpoint for getting the overtime compensation value
@app.get("/api/admin/overtimecompensationvalue")
async def get_overtime_compensation(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(Compensation).where(Compensation.type == "Υπερωρίες")
    result = session.exec(statement).first().compensation
    return result

# Creates an API endpoint for getting the travelcost compensation value
@app.get("/api/admin/travelcostcompensationvalue")
async def get_travelcost_compensation(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(Compensation).where(Compensation.type == "Οδοιπορικά")
    result = session.exec(statement).first().compensation
    return result

# Creates an API endpoint for getting the president compensation value
@app.get("/api/admin/presidentcompensationvalue")
async def get_president_compensation(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(Compensation).where(Compensation.type == "Πρόεδρος")
    result = session.exec(statement).first().compensation
    return result

# Creates an API endpoint for getting the secretary compensation value
@app.get("/api/admin/secretarycompensationvalue")
async def get_secretary_compensation(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(Compensation).where(Compensation.type == "Γραμματέας")
    result = session.exec(statement).first().compensation
    return result

# Creates an API endpoint for getting the overtime secretaryAssistant compensation value
@app.get("/api/admin/secretaryassistantcompensationvalue")
async def get_secretaryAssistant_compensation(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(Compensation).where(Compensation.type == "Βοηθός Γραμματέα")
    result = session.exec(statement).first().compensation
    return result

# Creates an API endpoint for getting the member compensation value
@app.get("/api/admin/membercompensationvalue")
async def get_member_compensation(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(Compensation).where(Compensation.type == "Μέλος")
    result = session.exec(statement).first().compensation
    return result

# Creates an API endpoint for getting the sam compensation value
@app.get("/api/admin/samcompensationvalue")
async def get_sam_compensation(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(Compensation).where(Compensation.type == "Χειριστής ΣΑΜ")
    result = session.exec(statement).first().compensation
    return result

# Creates an API endpoint for getting the supervisor compensation value
@app.get("/api/admin/supervisorcompensationvalue")
async def get_supervisor_compensation(user: User = Depends(get_current_user), session : Session=Depends(get_session)):
    statement = select(Compensation).where(Compensation.type == "Επιτηρητής")
    result = session.exec(statement).first().compensation
    return result


# Creates an API endpoint for changing the compensation values
@app.post("/api/admin/changecompensationvalues", status_code=200)
async def change_compensation_values(compensation: str, newvalue: float,  user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(Compensation).where(Compensation.type == compensation)
    curr_compensation = session.exec(statement).first()
    if not curr_compensation:
        raise HTTPException(status_code=404, detail="Ο τύπος αποζημίωσης δεν βρέθηκε")
    curr_compensation.compensation = newvalue
    session.commit()
    session.refresh(curr_compensation)
    return {"message": f"Η αποζημίωση '{compensation}' ενημερώθηκε σε {newvalue} ευρώ."}
