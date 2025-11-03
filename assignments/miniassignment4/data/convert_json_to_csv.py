import json
import csv
from datetime import datetime

# Used GitHub Copilot to help write this conversion script

def extract_option(value_field):
    """Extract the 'option' value from the value field"""
    if isinstance(value_field, list) and len(value_field) > 0:
        # It's a list with one dict, get the first item's option
        return value_field[0].get('option', '')
    elif isinstance(value_field, dict):
        # It's a single dict, return the option
        return value_field.get('option', '')
    else:
        # Fallback: return as string
        return str(value_field)

json_path = '/Users/brennascholte/Desktop/MAT236/Brenna/assignments/miniassignment4/data/measurements.json'
csv_path = '/Users/brennascholte/Desktop/MAT236/Brenna/assignments/miniassignment4/data/measurements.csv'

# Step 1: Load JSON data from a file
with open(json_path, 'r') as json_file:
    data = json.load(json_file)

# Step 2: Open a new CSV file for writing
with open(csv_path, 'w', newline='') as csv_file:
    # Step 3: Define headers
    headers = ['type', 'startDate', 'endDate', 'value']
    writer = csv.DictWriter(csv_file, fieldnames=headers)
    writer.writeheader()

    # Step 4: Write the data rows, extracting 'option' from value
    for row in data:
        date_str = row['date']
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')

        if date_obj.year >= 2020:
            new_row = {
                'type': row['type'],
                'startDate': row['date'],
                'endDate': row['date'],
                'value': extract_option(row['value'])
            }
            writer.writerow(new_row)

print("Conversion complete! Check measurements.csv")