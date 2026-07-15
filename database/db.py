# ============================================================
# KJs TRD Trading Terminal - Database Connection
# ============================================================

from .models import Database

# Global database instance
db = Database()

def get_db():
    """Get database connection"""
    if not db.connection:
        db.connect()
    return db

def init_db():
    """Initialize database"""
    db.connect()
    print("✅ Database initialized")
    return db

def close_db():
    """Close database connection"""
    db.close()
    print("✅ Database closed")
    