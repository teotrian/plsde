from sqlmodel import SQLModel, Session
from database import engine
from models import Role, User, Compensation, School, Employee

# This function creates the database
def create_database():
    SQLModel.metadata.create_all(engine)

# The create_data function insert rows to the tables
def create_data():
    role_1 = Role(id="1", name="admin")
    role_2 = Role(id="2", name="school")
    role_3 = Role(id="3", name="user")
    user_1 = User(id="1", email="admin@test.com", hashed_password="$2b$12$ejEyi.Io/nznqFkiXcHEluNp6AuM0R5AECWBN/pUhpxZGhgDiOk06", role="1")
    user_2 = User(id="2", email="school@test.com", hashed_password="$2b$12$ejEyi.Io/nznqFkiXcHEluNp6AuM0R5AECWBN/pUhpxZGhgDiOk06", role="2")
    user_3 = User(id="3", email="user@test.com", hashed_password="$2b$12$4Q2Vr9jWD0UEZCgsYXewr.wQ3nxY0SdPCKnT81ctKmB9LQSszI9Ie", role="3")
    
    compensation_1 = Compensation(id="1", type="Υπερωρίες", compensation="10.00")
    compensation_2 = Compensation(id="2", type="Οδοιπορικά", compensation="0.20")
    compensation_3 = Compensation(id="3", type="Πρόεδρος", compensation="344.00")
    compensation_4 = Compensation(id="4", type="Γραμματέας", compensation="270.00")
    compensation_5 = Compensation(id="5", type="Βοηθός Γραμματέα", compensation="222.00")
    compensation_6 = Compensation(id="6", type="Μέλος", compensation="270.00")
    compensation_7 = Compensation(id="7", type="Χειριστής ΣΑΜ", compensation="344.00")
    compensation_8 = Compensation(id="8", type="Επιτηρητής", compensation="14.00")
    
    school_1 = School(id="1", kodikos="1111111", name="ΓΕΛ Χανίων", email="school@test.com", latitude="35.5168", longitude="24.0117")
    school_2 = School(id="2", kodikos="2222222", name="ΕΠΑΛ Χανίων", email="school2@test.com", latitude="35.1997", longitude="24.1423")
    school_3 = School(id="3", kodikos="3333333", name="Γυμνάσιο Χανίων", email="school3@test.com", latitude="35.4927", longitude="23.6601")

    employee_1 = Employee(id="1", afm="138713870", am="138713", category="ΠΕ", contract="Μόνιμος", mk="9", first_name="ΘΕΟΔΩΡΟΣ", last_name="ΤΡΙΑΝΤΑΦΥΛΛΟΥ", email="user@test.com", iban="GR1234567891234567891234567", school_id="1", user_id="3")
    employee_2 = Employee(id="2", afm="118911189", am="118911", category="ΠΕ", contract="Μόνιμος", mk="10", first_name="ΝΑΤΑΣΑ", last_name="ΚΛΗΜΗ", email="user2@test.com", iban="GR9876543219876543219876543", school_id="2", user_id="5")
    employee_3 = Employee(id="3", afm="987654321", am="654321", category="ΤΕ", contract="Μόνιμος", mk="1", first_name="ΕΥΓΕΝΙΑ", last_name="ΚΛΗΜΗ", email="user3@test.com", iban="GR3111111111111111111111111", school_id="1", user_id="6")
    employee_4 = Employee(id="4", afm="123456789", am="123456789", category="ΠΕ", contract="Αναπληρωτής", mk="1", first_name="ΑΝΤΩΝΙΟΣ", last_name="ΒΑΒΟΥΡΑΚΗΣ", email="user4@test.com", iban="GR4111111111111111111111111", school_id="2", user_id="7")
    employee_5 = Employee(id="5", afm="555555555", am="555555", category="ΠΕ", contract="Μόνιμος", mk="10", first_name="ΧΡΥΣΑ", last_name="ΠΑΝΑΓΙΩΤΑΚΗ", email="user5@test.com", iban="GR5111111111111111111111111", school_id="1")
    employee_6 = Employee(id="6", afm="666666666", am="666666666", category="ΠΕ", contract="Αναπληρωτής", mk="1", first_name="ΣΤΕΛΙΟΣ", last_name="ΔΑΡΜΑΡΑΚΗΣ", email="user6@test.com", iban="GR6666666666666666666666666", school_id="1")
    employee_7 = Employee(id="7", afm="777777777", am="777777", category="ΠΕ", contract="Μόνιμος", mk="8", first_name="ΜΙΧΑΛΗΣ", last_name="ΠΕΡΡΑΚΗΣ", email="user7@test.com", iban="GR7111111111111111111111111", school_id="1")
    employee_8 = Employee(id="8", afm="888888888", am="888888", category="ΠΕ", contract="Μόνιμος", mk="7", first_name="ΚΩΣΤΑΣ", last_name="ΡΕΞΑΚΗΣ", email="user8@test.com", iban="GR8111111111111111111111111", school_id="1")
    employee_9 = Employee(id="9", afm="999999999", am="999999", category="ΠΕ", contract="Μόνιμος", mk="6", first_name="ΙΩΑΝΝΗΣ", last_name="ΚΩΣΤΟΥΡΑΚΗΣ", email="user9@test.com", iban="GR9111111111111111111111111", school_id="1")
    employee_10 = Employee(id="10", afm="101010101", am="101010", category="ΠΕ", contract="Μόνιμος", mk="5", first_name="ΑΡΓΥΡΩ", last_name="ΚΑΛΛΙΝΤΕΡΑΚΗ", email="user10@test.com", iban="GR1011111111111111111111111", school_id="1")
    employee_11 = Employee(id="11", afm="111111111", am="111111", category="ΠΕ", contract="Μόνιμος", mk="4", first_name="ΣΟΦΙΑ", last_name="ΧΑΤΖΗ", email="user11@test.com", iban="GR1111111111111111111111111", school_id="1")

    with Session(engine) as session:    

        session.add(role_1)
        session.add(role_2)
        session.add(role_3)
        session.add(user_1)
        session.add(user_2)
        session.add(user_3)
        session.add(compensation_1)
        session.add(compensation_2)
        session.add(compensation_3) 
        session.add(compensation_4)
        session.add(compensation_5)
        session.add(compensation_6)
        session.add(compensation_7)
        session.add(compensation_8)  
        session.add(school_1)
        session.add(school_2)
        session.add(school_3)
        session.add(employee_1)
        session.add(employee_2)
        session.add(employee_3)
        session.add(employee_4)
        session.add(employee_5)
        session.add(employee_6)
        session.add(employee_7)
        session.add(employee_8)
        session.add(employee_9)
        session.add(employee_10)
        session.add(employee_11)            

        session.commit()
