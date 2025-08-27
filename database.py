from sqlmodel import create_engine

# SQLite URL
sqlite_url = "sqlite:///./plsde.db"

# Create the database engine
engine = create_engine(sqlite_url, echo=True, connect_args={"check_same_thread": False})    