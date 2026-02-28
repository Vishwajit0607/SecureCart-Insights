import csv
import random
from datetime import datetime, timedelta

def generate_csv(filename, num_users=5):
    users = []
    for i in range(num_users):
        user_id = f"USR-T{100+i}"
        user_name = f"Test User {i}"
        user_email = f"test{i}@email.com"
        
        # 1 Serial Returner, 1 Wardrober, 3 Normal
        if i == 0:
            # Serial Returner: 20 purchases, 18 returns, fast
            purchases = 20
            returns = 18
            return_days = [1, 3]
            item_cat = ["Electronics", "Apparel"]
        elif i == 1:
            # Wardrober: 5 purchases, 3 returns, 14 days
            purchases = 5
            returns = 3
            return_days = [10, 14]
            item_cat = ["Apparel"]
        elif i == 2:
            # Receipt Manipulator
            purchases = 8
            returns = 4
            return_days = [15, 20]
            item_cat = ["Home & Kitchen"]
        else:
            # Normal: 10 purchases, 1 return
            purchases = 10
            returns = 1
            return_days = [5, 25]
            item_cat = ["Shoes", "Sports"]

        txns = []
        base_date = datetime(2025, 1, 1)
        
        tx_id = 1
        for p in range(purchases):
            cat = random.choice(item_cat)
            p_date = base_date + timedelta(days=random.randint(0, 50))
            amount = round(random.uniform(50, 300), 2)
            
            txns.append({
                "userId": user_id,
                "userName": user_name,
                "userEmail": user_email,
                "transactionId": f"{user_id}-T{tx_id}",
                "date": p_date.strftime("%Y-%m-%d"),
                "type": "purchase",
                "amount": amount,
                "itemCategory": cat,
                "itemName": f"Test {cat} Item",
                "returnReason": "",
                "daysOwned": "",
                "receiptMatch": ""
            })
            tx_id += 1
            
            if p < returns:
                days_owned = random.randint(return_days[0], return_days[1])
                r_date = p_date + timedelta(days=days_owned)
                
                receipt_match = "false" if i == 2 and random.random() < 0.8 else "true"
                r_amount = amount * 1.5 if receipt_match == "false" else amount
                
                txns.append({
                    "userId": user_id,
                    "userName": user_name,
                    "userEmail": user_email,
                    "transactionId": f"{user_id}-T{tx_id}",
                    "date": r_date.strftime("%Y-%m-%d"),
                    "type": "return",
                    "amount": round(r_amount, 2),
                    "itemCategory": cat,
                    "itemName": f"Test {cat} Item",
                    "returnReason": "Changed mind",
                    "daysOwned": days_owned,
                    "receiptMatch": receipt_match
                })
                tx_id += 1
                
        users.extend(txns)

    with open(filename, 'w', newline='') as csvfile:
        fieldnames = ["userId", "userName", "userEmail", "transactionId", "date", "type", "amount", "itemCategory", "itemName", "returnReason", "daysOwned", "receiptMatch"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for row in users:
            writer.writerow(row)

generate_csv('test_transactions.csv', 5)
print("CSV generated: test_transactions.csv")
