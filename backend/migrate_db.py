from app import create_app, db
from sqlalchemy import text
import traceback

def migrate():
    app = create_app()
    with app.app_context():
        try:
            print("Attempting to add column max_trade_quantity to challenges table...")
            db.session.execute(text("ALTER TABLE challenges ADD COLUMN max_trade_quantity FLOAT"))
            db.session.commit()
            print("Column added successfully.")
        except Exception as e:
            print(f"Migration error (likely column already exists): {e}")
            db.session.rollback()
            # If it's something else, print it
            # traceback.print_exc()

if __name__ == "__main__":
    migrate()
