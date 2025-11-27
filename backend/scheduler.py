"""
Scheduler untuk auto-sync data harga pasar dari API Disdagkopukm
Akan berjalan setiap 1 jam sekali untuk menjaga data tetap up-to-date
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import logging
from app.services.market_sync import fetch_and_save_market_data

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create scheduler instance
scheduler = BackgroundScheduler()

def sync_market_data_job():
    """
    Job untuk sinkronisasi data harga pasar
    """
    try:
        logger.info(f"🔄 Starting market data sync at {datetime.now()}")
        result = fetch_and_save_market_data()
        logger.info(f"✅ Market data sync completed: {result}")
    except Exception as e:
        logger.error(f"❌ Market data sync failed: {e}")
        # Don't raise exception to prevent scheduler from stopping
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")

def start_scheduler():
    """
    Memulai scheduler untuk auto-sync (default: 1 jam)
    """
    start_scheduler_with_interval(hours=1)

def start_scheduler_with_interval(hours=24):
    """
    Memulai scheduler dengan interval custom
    
    Args:
        hours: Interval sync dalam jam (default: 24 jam / sekali sehari)
    """
    try:
        # Add job untuk sync setiap X jam
        scheduler.add_job(
            func=sync_market_data_job,
            trigger=IntervalTrigger(hours=hours),
            id='market_sync_job',
            name=f'Sync Market Data from API (every {hours}h)',
            replace_existing=True
        )
        
        # Start scheduler
        scheduler.start()
        logger.info("✅ Scheduler started successfully")
        logger.info(f"📅 Market data will sync every {hours} hour(s)")
        
        # Run once immediately on startup
        sync_market_data_job()
        
    except Exception as e:
        logger.error(f"❌ Failed to start scheduler: {e}")

def stop_scheduler():
    """
    Menghentikan scheduler
    """
    try:
        scheduler.shutdown()
        logger.info("🛑 Scheduler stopped")
    except Exception as e:
        logger.error(f"❌ Failed to stop scheduler: {e}")

def get_scheduler_status():
    """
    Mendapatkan status scheduler
    """
    return {
        "running": scheduler.running,
        "jobs": [
            {
                "id": job.id,
                "name": job.name,
                "next_run": job.next_run_time.isoformat() if job.next_run_time else None
            }
            for job in scheduler.get_jobs()
        ]
    }
