import os
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, HTTPException
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="Pomodoro Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    supabase: Client = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.get("/analytics/{user_id}")
async def get_analytics(user_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase credentials not configured.")

    try:
        response = supabase.table("sessions") \
            .select("created_at") \
            .eq("user_id", user_id) \
            .eq("mode", "focus") \
            .order("created_at", desc=True) \
            .execute()

        sessions = response.data
        if not sessions:
            return {
                "user_id": user_id,
                "weekly_focus_minutes": 0,
                "current_streak": 0
            }

        now = datetime.now(timezone.utc)
        start_of_week = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
        
        response_with_details = supabase.table("sessions") \
            .select("created_at, duration") \
            .eq("user_id", user_id) \
            .eq("mode", "focus") \
            .order("created_at", desc=True) \
            .execute()
        
        sessions_with_details = response_with_details.data
        
        weekly_minutes = 0
        for s in sessions_with_details:
            created_at = datetime.fromisoformat(s["created_at"].replace("Z", "+00:00"))
            if created_at >= start_of_week:
                weekly_minutes += s.get("duration", 25)
            else:
                break
        distinct_days = sorted({
            datetime.fromisoformat(s["created_at"].replace("Z", "+00:00")).date() 
            for s in sessions_with_details
        }, reverse=True)

        streak = 0
        today = now.date()
        
        if not distinct_days:
            streak = 0
        else:
            check_date = today
            if distinct_days[0] < today - timedelta(days=1):
                streak = 0
            else:
                current_idx = 0
                if distinct_days[0] == today:
                    streak = 1
                    check_date = today - timedelta(days=1)
                    current_idx = 1
                elif distinct_days[0] == today - timedelta(days=1):
                    streak = 1
                    check_date = today - timedelta(days=2)
                    current_idx = 1
                
                while current_idx < len(distinct_days) and distinct_days[current_idx] == check_date:
                    streak += 1
                    check_date -= timedelta(days=1)
                    current_idx += 1
        
        print(user_id, weekly_minutes, streak)

        return {
            "user_id": user_id,
            "weekly_focus_minutes": weekly_minutes,
            "current_streak": streak
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
