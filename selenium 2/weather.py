import requests

def get_weather_visual_crossing(location, date_str, api_key):
    url = f"https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/{location}/{date_str}"
    params = {"unitGroup": "us", "include": "days", "key": api_key}
    r = requests.get(url, params=params)
    r.raise_for_status()
    data = r.json()
    if "days" in data:
        return data["days"][0]
    else:
        raise ValueError("No data for that date in Visual Crossing response.")

# Example usage
api_key = "85WPBP76DTTS4BH64DBYEPN5Z"
day = get_weather_visual_crossing("Fullerton,CA", "2025-07-14", api_key)
print("Conditions:", day["description"])
print("High:", day["tempmax"], "°F, Low:", day["tempmin"], "°F")
print("Precipitation:", day.get("precip", 0), "inches")