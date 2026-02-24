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
    allow_origins=["*"],
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
        now = datetime.now(timezone.utc)
        days_since_sunday = (now.weekday() + 1) % 7
        start_of_week = (now - timedelta(days=days_since_sunday)).replace(hour=0, minute=0, second=0, microsecond=0)
        
        response = supabase.table("sessions") \
            .select("created_at, duration_minutes") \
            .eq("user_id", user_id) \
            .eq("mode", "focus") \
            .gte("created_at", start_of_week.isoformat()) \
            .order("created_at", desc=True) \
            .execute()
        
        sessions = response.data

        weekly_breakdown = {
            "sunday_focus_minutes": 0,
            "monday_focus_minutes": 0,
            "tuesday_focus_minutes": 0,
            "wednesday_focus_minutes": 0,
            "thursday_focus_minutes": 0,
            "friday_focus_minutes": 0,
            "saturday_focus_minutes": 0
        }

        days_map = {
            6: "sunday_focus_minutes",
            0: "monday_focus_minutes",
            1: "tuesday_focus_minutes",
            2: "wednesday_focus_minutes",
            3: "thursday_focus_minutes",
            4: "friday_focus_minutes",
            5: "saturday_focus_minutes"
        }

        for s in sessions:
            created_at = datetime.fromisoformat(s["created_at"].replace("Z", "+00:00"))
            day_name = days_map[created_at.weekday()]
            weekly_breakdown[day_name] += s.get("duration_minutes", 25)

        streak_response = supabase.table("sessions") \
            .select("created_at") \
            .eq("user_id", user_id) \
            .eq("mode", "focus") \
            .order("created_at", desc=True) \
            .execute()
        
        all_sessions = streak_response.data
        distinct_days = sorted({
            datetime.fromisoformat(s["created_at"].replace("Z", "+00:00")).date() 
            for s in all_sessions
        }, reverse=True)

        streak = 0
        today = now.date()
        
        if distinct_days:
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

        return {
            "user_id": user_id,
            **weekly_breakdown,
            "current_streak": streak
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
