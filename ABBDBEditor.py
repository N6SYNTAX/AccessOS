

Floors = int(input("How Many Floors: "))
Appt = int(input("How Many Appt Per Floor: "))

rows, cols = Floors, Appt

arr = [[0]*cols for _ in range(rows)]
print(arr)

for f in range(Floors): 
    for a in range(Appt):
        arr[f][a] = a+1


print(arr)

for f in range(cols):
    for a in range(rows):
            print(f"""
                  <id>000{arr[f][a]}</id>
                  <buildingNum/>
                  <floorNum>{f+1}</floorNum>
                  <apratmenNum>{arr[f][a]}</apartmenNum>
                  <physicalAddress>0000{arr[f][a]}</physicalAddress>
                  <username1/>
                  <username2/>
                  <logicAddres>00000{f+1}0{arr[f][a]}</logicAddres>
                  <card/>
                  """)
            
    


