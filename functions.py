from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer   
from sqlmodel import SQLModel, Session, select
from jose import JWTError
import jwt, requests
from database import engine
from models import User, Compensation, Employee, School, RegisterRequest, OvertimeRequest, OvertimeInventory, TravelcostRequest, TravelcostInventory, ExamParticipation, ExamInventory
from datetime import datetime, timedelta, timezone
from typing import Optional
from math import radians, sin, cos, sqrt, asin
from email.message import EmailMessage
import aiosmtplib


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")

JWT_SECRET = "Your_JWT_Secret_Key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
GOOGLE_MAPS_API_KEY = "Your_Google_Maps_API_Key"  


# This function creates the database
def create_database():
    SQLModel.metadata.create_all(engine)

# This function creates a new session with the engine from the database.py file
def get_session():
    with Session(engine) as session:
            yield session

# Creates an API endpoint for creating a new user
async def create_user(curr_request: RegisterRequest, session : Session = Depends(get_session)):
    new_user = User(email=curr_request.email, hashed_password= curr_request.hashed_password)
    if curr_request.category == "Υπάλληλος" :
        new_user.role = 3
    elif curr_request.category == "Σχολείο" :
        new_user.role = 2
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return {"message": "Χρήστης δημιουργήθηκε επιτυχώς"}

async def get_user_by_email(email: str, session : Session):
        statement = select(User).where(User.email == email)
        results =  session.exec(statement).first()
        return results

# This function checks if the data provided matches with the data of the user in the database
async def authenticate_user(email: str, password: str, session : Session):
    user = await get_user_by_email(email=email, session = session)
    if not user:
        return False
    if not user.verify_password(password):
        return False
    return user 

# This function creates a token with the data provided and an expiration time
async def create_token(data: dict):
    to_encode = data.copy() 
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp" : expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

# This function decodes the active token and finds the current user
async def get_current_user(session : Session=Depends(get_session), token: str = Depends(oauth2_scheme),):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        statement = select(User).where(User.id == payload["id"])
        user =  session.exec(statement).first()
        if user.email is None or user.id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        exp: int = payload.get("exp")  # Extract expiration time
        current_time = datetime.now(timezone.utc).timestamp()
        remaining_time = int(exp - current_time)  # Time left in seconds
        
        if remaining_time <= 0:
            raise HTTPException(status_code=401, detail="Token has expired")
         
        return User.from_orm(user)
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expired or invalid")

# This function decodes the active token and finds the expiration time    
async def get_expiration_time(session : Session=Depends(get_session), token: str = Depends(oauth2_scheme),):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])    
        exp: int = payload.get("exp")  # Extract expiration time
        
        return exp
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expired or invalid")
    

# This funvtion returns the order of the month
def get_month_order(month: str):
    month_order = {
        "Ιανουάριος": 1,
        "Φεβρουάριος": 2,
        "Μάρτιος": 3,
        "Απρίλιος": 4,
        "Μάιος": 5,
        "Ιούνιος": 6,
        "Ιούλιος": 7,
        "Αύγουστος": 8,
        "Σεπτέμβριος": 9,
        "Οκτώβριος": 10,
        "Νοέμβριος": 11,
        "Δεκέμβριος": 12
    }
    return month_order.get(month, None)

# This function finds the selected overtime request
async def overtime_request_selector(overtimerequest_id: int, user: User, session : Session):
    statement = select(OvertimeRequest).filter_by(owner_id=user.id).where(OvertimeRequest.id == overtimerequest_id)
    curr_request =  session.exec(statement).first()
    
    if curr_request is None:
        raise HTTPException(status_code=404, detail="request does not exist")

    return curr_request

# This function finds the selected travelcost request
async def travelcost_request_selector(travelcostrequest_id: int, user: User, session : Session):
    statement = select(TravelcostRequest).filter_by(owner_id=user.id).where(TravelcostRequest.id == travelcostrequest_id)
    curr_request =  session.exec(statement).first()
    
    if curr_request is None:
        raise HTTPException(status_code=404, detail="request does not exist")

    return curr_request

async def submit_overtime_requests(overtimeinventory_id: int, user: User, session : Session):
    statement = select(OvertimeRequest).where(OvertimeRequest.inventory_id == overtimeinventory_id)
    requests = session.exec(statement).all()
    for request in requests:
        request.submitted = 1
        request.stimestamp = datetime.now()
        session.add(request) 
        session.commit()
        session.refresh(request)  # Refresh the request to update its values
    return {"message": "Τα αιτήματα των υπερωριών υποβλήθηκαν επιτυχώς"}

async def submit_overtime_requests_to_payment(overtimepayment_id: int, user: User, session : Session):
    statement = select(OvertimeInventory).where(OvertimeInventory.payment_id == overtimepayment_id)
    inventories = session.exec(statement).all()
    for inventory in inventories:
        statement = select(OvertimeRequest).where(OvertimeRequest.inventory_id == inventory.id)
        requests = session.exec(statement).all()
        for request in requests:
            request.payment_id = overtimepayment_id
            request.paid = 1
            request.ptimestamp = datetime.now()
            session.add(request) 
            session.commit()
            session.refresh(request)
        
    return {"message": "Τα αιτήματα των υπερωριών πληρώθηκαν επιτυχώς"}

# This function calculates the compensations of the submitted overtime requests 
async def calculate_overtime_compensations(overtimepayment_id: int, user: User, session : Session):
    statement = select(Compensation).where(Compensation.type == "Υπερωρίες")
    overtime_compensation = session.exec(statement).first().compensation
    statement2 = select(OvertimeRequest).where(OvertimeRequest.payment_id == overtimepayment_id).where(OvertimeRequest.paid == 1)
    requests = session.exec(statement2).all()
    for request in requests:
        request.compensation = request.number_of_overtimes * overtime_compensation
        request.mtpy = request.compensation * 2 / 100
        request.eisfora = request.compensation * 2 / 100
        request.foros = round((request.compensation - request.mtpy - request.eisfora) * 20 / 100, 2)
        request.payable = round(request.compensation - request.mtpy - request.eisfora - request.foros, 2)
        session.add(request) 
        session.commit()
        session.refresh(request)
        
    return {"message": "Οι αποζημιώσεις των υπερωριών υπολογίστηκαν επιτυχώς"}

# This function submits the selected travelcost request
async def submit_travelcost_requests(travelcostinventory_id: int, user: User, session : Session):
    statement = select(TravelcostRequest).where(TravelcostRequest.inventory_id == travelcostinventory_id)
    requests = session.exec(statement).all()
    for request in requests:
        request.submitted = 1
        request.stimestamp = datetime.now()
        session.add(request) 
        session.commit()
        session.refresh(request)
    return {"message", "Τα αιτήματα των οδοιπορικών υποβλήθηκαν επιτυχώς"}

async def submit_travelcost_requests_to_payment(travelcostpayment_id: int, user: User, session : Session):
    statement = select(TravelcostInventory).where(TravelcostInventory.payment_id == travelcostpayment_id)
    inventories = session.exec(statement).all()
    for inventory in inventories:
        statement = select(TravelcostRequest).where(TravelcostRequest.inventory_id == inventory.id)
        requests = session.exec(statement).all()
        for request in requests:
            request.payment_id = travelcostpayment_id
            request.paid = 1
            request.ptimestamp = datetime.now()
            session.add(request) 
            session.commit()
            session.refresh(request)
        
    return {"message": "Τα αιτήματα των οδοιπορικών πληρώθηκαν επιτυχώς"}

# This function calculates the compensations of the submitted travelcost requests 
async def calculate_travelcost_compensations(travelcostpayment_id: int, user: User, session : Session):
    statement = select(Compensation).where(Compensation.type == "Οδοιπορικά")
    travelcost_compensation = session.exec(statement).first().compensation
    statement2 = select(TravelcostRequest).where(TravelcostRequest.payment_id == travelcostpayment_id).where(TravelcostRequest.paid == 1)
    travelcostrequests = session.exec(statement2).all()
    for request in travelcostrequests:
        
        res1 = select(School).where(School.name == request.start_school)
        start_lat = session.exec(res1).first().latitude
        start_long = session.exec(res1).first().longitude

        res2 = select(School).where(School.name == request.destination_school)
        destination_lat = session.exec(res2).first().latitude
        destination_long = session.exec(res2).first().longitude

        origin = f"{start_lat},{start_long}"
        destination = f"{destination_lat},{destination_long}"
        
        url = "https://maps.googleapis.com/maps/api/distancematrix/json"
        params = {
        "origins": origin,
        "destinations": destination,
        "key": GOOGLE_MAPS_API_KEY,
        "mode": "driving",
        "language": "el"
        }
        response = requests.get(url, params=params)
        data = response.json()
        try:
            distance_value = data['rows'][0]['elements'][0]['distance']['value']  # σε μέτρα
        except (KeyError, IndexError):
            raise HTTPException(status_code=500, detail="Σφάλμα κατά την επεξεργασία της απάντησης από το Google Maps")

        request.distance = round(distance_value/1000, 2)     
        request.compensation = round(request.distance * 2 * request.number_of_travels * travelcost_compensation, 2)
        session.add(request) 
        session.commit()
        session.refresh(request)
        
    return {"message": "Οι αποζημιώσεις των οδοιπορικών υπολογίστηκαν επιτυχώς"}
 
 # This function finds the selected exam participation
async def exam_participation_selector(examparticipation_id: int, user: User, session : Session):
    statement = select(ExamParticipation).filter_by(owner_id=user.id).where(ExamParticipation.id == examparticipation_id)
    curr_participation =  session.exec(statement).first()
    
    if curr_participation is None:
        raise HTTPException(status_code=404, detail="participation does not exist")

    return curr_participation

# This function submits the participations of the exam payment
async def submit_exam_participations_to_payment(exampayment_id: int, user: User, session : Session):
    statement = select(ExamInventory).where(ExamInventory.payment_id == exampayment_id)
    inventories = session.exec(statement).all()
    for inventory in inventories:
        inventory.paid = 1
        inventory.ptimestamp = datetime.now()
        session.add(inventory)
        session.commit()
        session.refresh(inventory)
        statement = select(ExamParticipation).where(ExamParticipation.inventory_id == inventory.id)
        participations = session.exec(statement).all()
        for participation in participations:
            participation.payment_id = exampayment_id
            participation.paid = 1
            participation.ptimestamp = datetime.now()
            session.add(participation) 
            session.commit()
            session.refresh(participation)
        
    return {"message": "Τα αιτήματα των πανελλαδικών πληρώθηκαν επιτυχώς"}

# This function calculates the compensations of the submitted exam participations 
async def calculate_exam_compensations(exampayment_id: int, session: Session):
    statement = select(Compensation).where(Compensation.type == "Επιτηρητής")
    supervision_compensation = session.exec(statement).first().compensation
    compensations = session.exec(select(Compensation)).all()

    statement2 = select(ExamParticipation).where(ExamParticipation.payment_id == exampayment_id).where(ExamParticipation.paid == 1)
    participations = session.exec(statement2).all()

    for participation in participations:
        if participation.type == "Αποζημίωση Επιτροπών":
            # Create a map from role/type to compensation value
            compensation_map = {
                comp.type: comp.compensation for comp in compensations
            }
            if participation.role not in compensation_map:
                raise HTTPException(status_code=404, detail="Δεν είναι έγκυρος ρόλος")
            participation.compensation = float(participation.number_of_exams) / 4 * compensation_map[participation.role]

        elif participation.type == "Αποζημίωση Επιτηρητών":
            participation.compensation = participation.number_of_exams * supervision_compensation

        elif participation.type == "Αποζημίωση Εξαιρέσιμων Ημερών":
            if participation.mk <= 6:
                participation.compensation = participation.number_of_exams * 25
            elif participation.mk <= 12:
                participation.compensation = participation.number_of_exams * 30
            else:
                participation.compensation = participation.number_of_exams * 35
        else:
            raise HTTPException(status_code=404, detail="Δεν είναι έγκυρος τύπος αποζημίωσης")

        # Apply deductions
        if participation.contract =="Μόνιμος" :
            participation.mtpy = participation.compensation * 2 / 100
            participation.eisfora = participation.compensation * 2 / 100
            participation.foros = round((participation.compensation - participation.mtpy - participation.eisfora) * 0.20, 2)
        else:
            participation.mtpy = 0
            participation.eisfora = 0
            participation.foros = round(participation.compensation * 0.20, 2)
        
        participation.payable = round(participation.compensation - participation.mtpy - participation.eisfora - participation.foros, 2)
            
        session.add(participation)

    session.commit()
    for participation in participations:
        session.refresh(participation)

    return {"message": "Οι αποζημιώσεις των πανελλαδικών υπολογίστηκαν επιτυχώς"}

# This function sends an email using aiosmtplib
async def send_email(to_email: str, subject: str, body: str):
    message = EmailMessage()
    message["From"] = "admin@test.com"
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        print("Sending email to MailHog...")
        await aiosmtplib.send(
            message,
            hostname="localhost",
            port=1025
        )
        print("Email sent!")
    except Exception as e:
        print("Failed to send email:", e)
    
