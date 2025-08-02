import requests
import json

url = "https://www.fast2sms.com/dev/bulkV2"

payload = {
    "route": "q",  # 'q' is Quick SMS route
    "message": "This is Skill Bridge",
    "language": "english",
    "numbers": "9940147796"
}

headers = {
    'authorization': "47y2bXP6vnV1zdElG8BcFIMuYsAxmLROZj3th9KoUwrkepTDQfhJQ2LsfY7AKDX5iUrcRH8pBy6CzGMd",  # replace with your key
    'Content-Type': "application/json"
}

response = requests.post(url, data=json.dumps(payload), headers=headers)

print(response.status_code)
print(response.json())
