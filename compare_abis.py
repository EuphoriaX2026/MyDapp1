import json

def get_abi(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
        if 'abi' in data:
            return data['abi']
        return data

def compare_abis(name, path1, path2):
    abi1 = get_abi(path1)
    abi2 = get_abi(path2)
    
    # Comparison of function names
    names1 = sorted([item['name'] for item in abi1 if 'name' in item])
    names2 = sorted([item['name'] for item in abi2 if 'name' in item])
    
    if names1 == names2:
        print(f"✅ {name}: ABIs match exactly (function names).")
    else:
        print(f"❌ {name}: ABIs DIFFERENT.")
        print(f"   In first file only: {set(names1) - set(names2)}")
        print(f"   In second file only: {set(names2) - set(names1)}")

# EDex Comparison
print("--- EDex Comparison ---")
compare_abis("MyDapp1/abis/edex.json vs MyERX/frontend-files/abis/edex.json", 
             r"D:\MyDapp1\src\abis\edex.json", 
             r"D:\MyERX\frontend-files\abis\edex.json")

compare_abis("MyDapp1/abis/edex.json vs MyTitan/frontend-files/abis/MockEdex.json", 
             r"D:\MyDapp1\src\abis\edex.json", 
             r"D:\MyTitan\frontend-files\abis\MockEdex.json")

# ERX Comparison
print("\n--- ERX Comparison ---")
compare_abis("MyDapp1/abis/erx-token.json vs MyERX/frontend-files/abis/EuphoriaX_Standard.json", 
             r"D:\MyDapp1\src\abis\erx-token.json", 
             r"D:\MyERX\frontend-files\abis\EuphoriaX_Standard.json")

compare_abis("MyDapp1/abis/erx-token.json vs MyTitan/frontend-files/abis/MockERX.json", 
             r"D:\MyDapp1\src\abis\erx-token.json", 
             r"D:\MyTitan\frontend-files\abis\MockERX.json")
