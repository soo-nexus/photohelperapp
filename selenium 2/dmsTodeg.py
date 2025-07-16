import re

def dms_str_to_decimal(dms_str: str) -> float:
    """
    Converts a DMS string like '34°3\'30"N' to decimal degrees.
    """
    pattern = r'(\d+)[°](\d+)\'(\d+(?:\.\d+)?)[\"]?([NSEW])'
    match = re.match(pattern, dms_str.strip(), re.IGNORECASE)

    if not match:
        raise ValueError(f"Invalid DMS format: {dms_str}")

    degrees, minutes, seconds, direction = match.groups()
    degrees = int(degrees)
    minutes = int(minutes)
    seconds = float(seconds)

    decimal = degrees + minutes / 60 + seconds / 3600

    if direction.upper() in ['S', 'W']:
        decimal *= -1

    return decimal


def main():
    print("Enter DMS coordinates for latitude and longitude (e.g., 34°3'30\"N 118°14'37\"W):")
    line = input("> ").strip()

    try:
        # Split using space between lat and long
        parts = line.split(maxsplit=1)
        if len(parts) != 2:
            raise ValueError("Please provide both latitude and longitude in one line.")

        lat_str, lon_str = parts
        latitude = dms_str_to_decimal(lat_str)
        longitude = dms_str_to_decimal(lon_str)

        print(f"\nDecimal Coordinates:\nLatitude: {latitude}\nLongitude: {longitude}")
    except ValueError as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
