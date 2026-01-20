import sys
import os
sys.path.append(os.getcwd())
from app import create_app, db
from app.models import Instrument

app = create_app()
with app.app_context():
    instruments = Instrument.query.all()
    print(f"Total Instruments: {len(instruments)}")
    for inst in instruments:
        print(f"ID: {inst.id}, Symbol: {inst.display_symbol}, ProviderSymbol: {inst.provider_symbol}, Provider: {inst.provider}, Class: {inst.asset_class}")
