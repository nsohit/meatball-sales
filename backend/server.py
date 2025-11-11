from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, date
from decimal import Decimal

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============= MODELS =============

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    sell_price: float
    production_cost: float
    category: str  # 'bakso', 'minuman'
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    sell_price: float
    production_cost: float
    category: str

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "settings"
    sewa_harian: float = 150000
    gaji_karyawan_harian: float = 60000
    gaji_owner_harian: float = 50000
    bonus_percentage: float = 0.05
    bonus_max: float = 10000
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SettingsUpdate(BaseModel):
    sewa_harian: Optional[float] = None
    gaji_karyawan_harian: Optional[float] = None
    gaji_owner_harian: Optional[float] = None
    bonus_percentage: Optional[float] = None
    bonus_max: Optional[float] = None

class TransactionItem(BaseModel):
    product_name: str
    quantity: int
    price: float
    production_cost: float

class PackageTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str
    package_price: float
    items: List[TransactionItem]
    total_production_cost: float
    revenue: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PackageTransactionCreate(BaseModel):
    date: str
    package_price: float
    quantity: int = 1

class BeverageTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str
    product_name: str
    quantity: int
    total_price: float
    total_production_cost: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BeverageTransactionCreate(BaseModel):
    date: str
    product_name: str
    quantity: int

class DailySummary(BaseModel):
    date: str
    package_revenue: float
    beverage_revenue: float
    total_revenue: float
    package_production_cost: float
    beverage_production_cost: float
    total_production_cost: float
    fixed_costs: float
    net_profit: float
    employee_bonus: float
    package_count: int
    beverage_count: int

class MonthlySummary(BaseModel):
    year: int
    month: int
    total_revenue: float
    total_production_cost: float
    total_fixed_costs: float
    total_net_profit: float
    total_employee_bonus: float
    days_count: int
    daily_summaries: List[DailySummary]

# ============= HELPER FUNCTIONS =============

def calculate_package_composition(package_price: float) -> Dict:
    """
    Hitung komposisi paket berdasarkan harga
    Paket 10.000 = 9 pcs (1 bakso urat, 2 bakso kecil, 1 somay, 1 tahu, 2 pangsit, 1 soun)
    +Rp 1000 = +1 pcs
    Bakso urat = 2 pcs equivalent
    """
    base_price = 10000
    base_pcs = 9
    
    # Hitung total pcs
    price_diff = package_price - base_price
    additional_pcs = price_diff / 1000
    total_pcs = base_pcs + additional_pcs
    
    # Base composition untuk 10.000
    composition = {
        'Bakso urat': 1,
        'Bakso kecil': 2,
        'Somay': 1,
        'Tahu': 1,
        'Pangsit malang': 2,
        'Soun': 1
    }
    
    # Tambah bakso kecil untuk harga lebih tinggi
    if additional_pcs > 0:
        composition['Bakso kecil'] += int(additional_pcs)
    elif additional_pcs < 0:
        # Untuk harga lebih rendah, kurangi dari bakso kecil
        composition['Bakso kecil'] += int(additional_pcs)
        if composition['Bakso kecil'] < 0:
            composition['Bakso kecil'] = 0
    
    return composition

def calculate_production_cost(composition: Dict) -> float:
    """
    Hitung biaya produksi berdasarkan komposisi
    """
    costs = {
        'Bakso urat': 1300,
        'Bakso kecil': 650,
        'Somay': 650,
        'Tahu': 650,
        'Pangsit malang': 650,
        'Soun': 650
    }
    
    total_cost = 0
    for item, quantity in composition.items():
        total_cost += costs.get(item, 0) * quantity
    
    return total_cost

async def get_or_create_settings() -> Settings:
    """Get settings or create default"""
    settings_doc = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    if settings_doc:
        if isinstance(settings_doc.get('updated_at'), str):
            settings_doc['updated_at'] = datetime.fromisoformat(settings_doc['updated_at'])
        return Settings(**settings_doc)
    
    # Create default
    default_settings = Settings()
    doc = default_settings.model_dump()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.settings.insert_one(doc)
    return default_settings

# ============= ROUTES =============

@api_router.get("/")
async def root():
    return {"message": "Bakso Business System API"}

# Products
@api_router.get("/products", response_model=List[Product])
async def get_products():
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    for p in products:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return products

@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    product_obj = Product(**product.model_dump())
    doc = product_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    return product_obj

# Settings
@api_router.get("/settings", response_model=Settings)
async def get_settings():
    return await get_or_create_settings()

@api_router.put("/settings", response_model=Settings)
async def update_settings(updates: SettingsUpdate):
    current = await get_or_create_settings()
    update_data = updates.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(current, key, value)
    
    current.updated_at = datetime.now(timezone.utc)
    doc = current.model_dump()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.settings.update_one(
        {"id": "settings"},
        {"$set": doc},
        upsert=True
    )
    return current

# Package Transactions
@api_router.post("/transactions/package", response_model=PackageTransaction)
async def create_package_transaction(transaction: PackageTransactionCreate):
    # Calculate composition and cost
    composition = calculate_package_composition(transaction.package_price)
    production_cost = calculate_production_cost(composition)
    
    # Create transaction items
    items = []
    for product_name, quantity in composition.items():
        if quantity > 0:
            item_cost = 1300 if product_name == 'Bakso urat' else 650
            items.append(TransactionItem(
                product_name=product_name,
                quantity=quantity,
                price=0,  # Harga paket total
                production_cost=item_cost * quantity
            ))
    
    transaction_obj = PackageTransaction(
        date=transaction.date,
        package_price=transaction.package_price,
        items=items,
        total_production_cost=production_cost,
        revenue=transaction.package_price
    )
    
    doc = transaction_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.package_transactions.insert_one(doc)
    
    return transaction_obj

# Beverage Transactions
@api_router.post("/transactions/beverage", response_model=BeverageTransaction)
async def create_beverage_transaction(transaction: BeverageTransactionCreate):
    # Get product info
    beverages = {
        'Teh rosela': {'price': 5000, 'cost': 3000},
        'Es teh manis': {'price': 3000, 'cost': 2000}
    }
    
    beverage_info = beverages.get(transaction.product_name)
    if not beverage_info:
        raise HTTPException(status_code=400, detail="Produk minuman tidak ditemukan")
    
    total_price = beverage_info['price'] * transaction.quantity
    total_cost = beverage_info['cost'] * transaction.quantity
    
    transaction_obj = BeverageTransaction(
        date=transaction.date,
        product_name=transaction.product_name,
        quantity=transaction.quantity,
        total_price=total_price,
        total_production_cost=total_cost
    )
    
    doc = transaction_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.beverage_transactions.insert_one(doc)
    
    return transaction_obj

# Daily Summary
@api_router.get("/daily-summary/{date}", response_model=DailySummary)
async def get_daily_summary(date: str):
    # Get all package transactions for date
    package_txns = await db.package_transactions.find({"date": date}, {"_id": 0}).to_list(1000)
    
    package_revenue = sum(t['revenue'] for t in package_txns)
    package_cost = sum(t['total_production_cost'] for t in package_txns)
    package_count = len(package_txns)
    
    # Get all beverage transactions for date
    beverage_txns = await db.beverage_transactions.find({"date": date}, {"_id": 0}).to_list(1000)
    
    beverage_revenue = sum(t['total_price'] for t in beverage_txns)
    beverage_cost = sum(t['total_production_cost'] for t in beverage_txns)
    beverage_count = len(beverage_txns)
    
    # Get settings for fixed costs
    settings = await get_or_create_settings()
    fixed_costs = settings.sewa_harian + settings.gaji_karyawan_harian + settings.gaji_owner_harian
    
    # Calculate totals
    total_revenue = package_revenue + beverage_revenue
    total_production_cost = package_cost + beverage_cost
    net_profit = total_revenue - total_production_cost - fixed_costs
    
    # Calculate employee bonus
    employee_bonus = 0
    if net_profit > 0:
        bonus_calculated = net_profit * settings.bonus_percentage
        employee_bonus = min(bonus_calculated, settings.bonus_max)
    
    return DailySummary(
        date=date,
        package_revenue=package_revenue,
        beverage_revenue=beverage_revenue,
        total_revenue=total_revenue,
        package_production_cost=package_cost,
        beverage_production_cost=beverage_cost,
        total_production_cost=total_production_cost,
        fixed_costs=fixed_costs,
        net_profit=net_profit,
        employee_bonus=employee_bonus,
        package_count=package_count,
        beverage_count=beverage_count
    )

# Monthly Summary
@api_router.get("/monthly-summary/{year}/{month}", response_model=MonthlySummary)
async def get_monthly_summary(year: int, month: int):
    # Get all dates in month that have transactions
    package_txns = await db.package_transactions.find({}, {"_id": 0, "date": 1}).to_list(10000)
    beverage_txns = await db.beverage_transactions.find({}, {"_id": 0, "date": 1}).to_list(10000)
    
    # Extract unique dates for the month
    dates = set()
    for t in package_txns + beverage_txns:
        txn_date = t['date']
        if txn_date.startswith(f"{year}-{month:02d}"):
            dates.add(txn_date)
    
    # Get daily summaries for all dates
    daily_summaries = []
    total_revenue = 0
    total_production_cost = 0
    total_fixed_costs = 0
    total_net_profit = 0
    total_employee_bonus = 0
    
    for date_str in sorted(dates):
        summary = await get_daily_summary(date_str)
        daily_summaries.append(summary)
        total_revenue += summary.total_revenue
        total_production_cost += summary.total_production_cost
        total_fixed_costs += summary.fixed_costs
        total_net_profit += summary.net_profit
        total_employee_bonus += summary.employee_bonus
    
    return MonthlySummary(
        year=year,
        month=month,
        total_revenue=total_revenue,
        total_production_cost=total_production_cost,
        total_fixed_costs=total_fixed_costs,
        total_net_profit=total_net_profit,
        total_employee_bonus=total_employee_bonus,
        days_count=len(dates),
        daily_summaries=daily_summaries
    )

# Get package transactions for a date
@api_router.get("/transactions/package/{date}", response_model=List[PackageTransaction])
async def get_package_transactions(date: str):
    transactions = await db.package_transactions.find({"date": date}, {"_id": 0}).to_list(1000)
    for t in transactions:
        if isinstance(t.get('created_at'), str):
            t['created_at'] = datetime.fromisoformat(t['created_at'])
    return transactions

# Get beverage transactions for a date
@api_router.get("/transactions/beverage/{date}", response_model=List[BeverageTransaction])
async def get_beverage_transactions(date: str):
    transactions = await db.beverage_transactions.find({"date": date}, {"_id": 0}).to_list(1000)
    for t in transactions:
        if isinstance(t.get('created_at'), str):
            t['created_at'] = datetime.fromisoformat(t['created_at'])
    return transactions

# Delete transaction
@api_router.delete("/transactions/package/{transaction_id}")
async def delete_package_transaction(transaction_id: str):
    result = await db.package_transactions.delete_one({"id": transaction_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")
    return {"message": "Transaksi berhasil dihapus"}

@api_router.delete("/transactions/beverage/{transaction_id}")
async def delete_beverage_transaction(transaction_id: str):
    result = await db.beverage_transactions.delete_one({"id": transaction_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")
    return {"message": "Transaksi berhasil dihapus"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()