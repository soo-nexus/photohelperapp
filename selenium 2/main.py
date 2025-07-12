from selenium import webdriver
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from supabase import create_client, Client
from collections import defaultdict
from tqdm import tqdm
import re
import time
import os
def main():
    #Accessing supabase api
    url: str = "https://vjmtcljmtchsfqiypjga.supabase.co"
    key: str = (
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqbXRjbGptdGNoc2ZxaXlwamdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTIzODAsImV4cCI6MjA2Mzc2ODM4MH0.KiRdI2wNmJFAnKahgNMi7K2gntYohwqnQDZtjhytemA"
    )
    supabase: Client = create_client(url, key)
    # create Chromeoptions instance
    options = webdriver.ChromeOptions()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1920,1080")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    )

    # Setting up selenium and the brower to be used, in this case it will be chrome
    driver = webdriver.Chrome(options=options)
    driver.execute_script(
        "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    )
    #Accessing the Table formAnswers
    response = (    
                supabase.table("formAnswers")    
                .select("*")
                .order("id",desc=True)
                .limit(1)    
                .execute())
    # school = response.data[0]["location"]
    # school = "University of California, Los Angles"
    locationsTable = supabase.table("locations").select("*").execute()
    run = True
    for value in locationsTable.data:
        locationColumn = value.get("locations", {})
        for key in locationColumn:
            if key == school:
                run = False
    if run == True:
        # foundSchool = binarySearch
        #Using selenium to request a page
        driver.get(f"https://www.google.com/search?q={school}+grad+photos")
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, "html.parser")
        #Wait for the search element to be visible where all the search results are in a google search page
        time.sleep(0.2)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "search")))
        search_results_container = driver.find_element(By.ID, "search")
        #Making a list of all the website titles
        websiteTitle = search_results_container.find_elements(By.TAG_NAME, "h3")
        #Fetching all the webist in wersiteTitle
        results = {}
        for elements in websiteTitle:
            title = elements.text
            #Get the parent element of the header tag
            a_tag = elements.find_element(By.XPATH, "./..")
            #From there we get the link in the a tag, this is labeled as the href
            link = a_tag.get_attribute("href")
            """Only add websites that have grad and photos, nothing from pinterst or the school website.
            Pinterest you have to log in to and school website don't have good photo spots as its just marketing
            """
            if "jay" in link and "grad" in link and title:
                results[title] = {"website": link, "locations": [], "Cor": []}
                    
        # For loop to define the locations, gathering data from the webist that we fetched previosuly
        a_tage = []
        keys = []
        for key, value in results.items():
            driver.get(value["website"])
            #Get the header tag as they have the the location name,
            pageText = driver.find_elements(By.TAG_NAME, "h3")
            # Ge the 
            a_tage = driver.find_elements(By.TAG_NAME, "a")
            # This parses the location to only include letters from the alphabet, no leading space or symbols(e.g. "-")
            value["locations"] = [re.sub(r"[^a-zA-Z\s]", "", i.text).lstrip() for i in pageText]
        # Gathers the website link from a_tags that we gathered from the previous for loop     
        hrefs = []
        for i in a_tage:
            #Get the links from the a tag, i have to do it seperatly and not in the same for loop because I ran into problems since href tag and a tags were deeply inbedded as div child elements
            href = i.get_attribute("href")
            if href and "map" in href and ("goo.gl" in href or "google" in href):
                hrefs.append(href)

        # reformat longitude and latitude to just the decimal form
        # def dms_to_decimal(dms_str):
        #     # Example input: '33°52\'42.7"N' or '117°53\'04.8"W'

        #     # Extract degrees, minutes, seconds, and direction with regex
        #     match = re.match(r"(\d+)°(\d+)'([\d\.]+)\"?([NSEW])", dms_str.strip())
        #     if not match:
        #         raise ValueError("Invalid DMS format")

        #     degrees, minutes, seconds, direction = match.groups()
        #     degrees, minutes, seconds = int(degrees), int(minutes), float(seconds)

        #     decimal = degrees + minutes / 60 + seconds / 3600

        #     # Negative for South and West
        #     if direction in ["S", "W"]:
        #         decimal = -decimal

        #     return decimal

        # In addition to a progress bar gathers the coordinates and defines the "Cor" values in results
        for i, href in enumerate(hrefs[:-1]):
            driver.get(href)
            # Wait until URL no longer contains 'shorturl'
            current_url = driver.current_url
            try:
                at_pos = current_url.index("@") + 1
                first_comma = current_url.index(",", at_pos)
                second_comma = current_url.index(",", first_comma + 1)
                
                # Slice from '@' to second comma: gives "latitude,longitude"
                urlcoor = current_url[at_pos:second_comma]
                
                lat_long = urlcoor.split(",")  # ['latitude', 'longitude']
                for key, value in results.items():
                    value["Cor"].append([lat_long[0], lat_long[1]])
            except:
                print(f"Could not parse coordinates from URL: {current_url}")

        driver.close()
        # Another progress bar and inserts the information found from webscraping into a supabase table
        # Build the nested dictionary first
        all_locations = defaultdict(dict)
        for key, values in results.items():
            for index, value in enumerate(values["locations"]):
                try:
                    location_name = value
                    longitude = float(values["Cor"][index][0])
                    latitude = float(values["Cor"][index][1])

                    all_locations[school][location_name] = {
                        "long": longitude,
                        "lat": latitude
                    }
                except:
                    pass

        # Now insert this structured data into Supabase
        response = (
            supabase.table("locations")
            .insert({
                "type": "Grad",
                "locations": dict(all_locations)  # convert defaultdict to regular dict
            })
            .execute()
        )
        if response.error:
            print("❌ Supabase insert error:", response.error)
        else:
            print("✅ Inserted into Supabase:", response.data)

if __name__ == "__main__":
    main() 