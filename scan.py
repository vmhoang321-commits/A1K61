import os
import json

image_dir = 'images'
output_file = 'data.json'
valid_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.mp4', '.webm', '.mov')

if not os.path.exists(image_dir):
    print("⚠️ Không tìm thấy thư mục 'images'! Hãy tạo thư mục 'images' trước nhé.")
else:
    files = os.listdir(image_dir)
    media_list = []
    
    for file in files:
        if file.lower().endswith(valid_extensions):
            ext = os.path.splitext(file)[1].lower()
            file_type = 'video' if ext in ('.mp4', '.webm', '.mov') else 'image'
            
            media_list.append({
                "filename": file,
                "url": f"images/{file}",
                "type": file_type,
                "title": "Kỷ Niệm A1K61 ✨"
            })
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(media_list, f, ensure_ascii=False, indent=4)
        
    print(f"🚀 Đã quét xong! Tìm thấy {len(media_list)} file và cập nhật vào data.json thành công!")