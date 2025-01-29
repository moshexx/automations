import requests
import pandas as pd
from datetime import datetime
import os

def backup_airtable_to_csv():
    # הגדרת משתנים
    BASE_ID = 'appYINC9GPUFQI4ij'
    TABLE_ID = 'tbl8wdaN7ZiCSfDTz'
    API_KEY = 'YOUR_API_KEY'  # יש להחליף במפתח ה-API שלך
    
    # הגדרת כותרות ה-API
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json',
    }
    
    # URL של ה-API
    url = f'https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}/records'
    
    try:
        # משיכת הנתונים מ-Airtable
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # המרת הנתונים ל-DataFrame
        records = response.json().get('records', [])
        data = []
        for record in records:
            fields = record['fields']
            data.append(fields)
        
        df = pd.DataFrame(data)
        
        # יצירת שם קובץ עם תאריך
        today = datetime.now().strftime('%Y-%m-%d')
        backup_dir = 'airtable_backups'
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)
            
        filename = f'{backup_dir}/content_backup_{today}.csv'
        
        # שמירה ל-CSV
        df.to_csv(filename, index=False, encoding='utf-8-sig')
        print(f'גיבוי הושלם בהצלחה: {filename}')
        
    except Exception as e:
        print(f'שגיאה בביצוע הגיבוי: {str(e)}')

if __name__ == '__main__':
    backup_airtable_to_csv()